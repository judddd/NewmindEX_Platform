#!/bin/bash

# 配置 Docker Desktop 资源限制
# 功能：设置 CPU、内存、磁盘大小等
# 用途：在安装 Docker 后自动配置资源

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 配置 Docker Desktop 资源限制...${NC}"
echo ""

# Docker Desktop 配置文件路径
DOCKER_SETTINGS_FILE="$HOME/Library/Group Containers/group.com.docker/settings.json"
DOCKER_SETTINGS_DIR="$(dirname "$DOCKER_SETTINGS_FILE")"

# 资源配置（可从环境变量或 .env 读取）
DOCKER_MEMORY_GB=${DOCKER_MEMORY_GB:-200}      # 内存 (GB)
DOCKER_CPUS=${DOCKER_CPUS:-32}                  # CPU 核心数
DOCKER_DISK_SIZE_GB=${DOCKER_DISK_SIZE_GB:-512} # 磁盘大小 (GB)
DOCKER_SWAP_SIZE_GB=${DOCKER_SWAP_SIZE_GB:-8}   # Swap 大小 (GB)

# 转换为字节（Docker 使用字节单位）
MEMORY_BYTES=$((DOCKER_MEMORY_GB * 1024 * 1024 * 1024))
DISK_SIZE_BYTES=$((DOCKER_DISK_SIZE_GB * 1024 * 1024 * 1024))
SWAP_BYTES=$((DOCKER_SWAP_SIZE_GB * 1024 * 1024 * 1024))

echo -e "${BLUE}目标配置:${NC}"
echo "  • 内存: ${DOCKER_MEMORY_GB}GB"
echo "  • CPU: ${DOCKER_CPUS} 核"
echo "  • 磁盘: ${DOCKER_DISK_SIZE_GB}GB"
echo "  • Swap: ${DOCKER_SWAP_SIZE_GB}GB"
echo ""

# 检查 Docker 是否安装
if [ ! -d "/Applications/Docker.app" ]; then
    echo -e "${RED}❌ Docker Desktop 未安装${NC}"
    echo "   请先安装 Docker Desktop"
    exit 1
fi

# 检查配置目录是否存在
if [ ! -d "$DOCKER_SETTINGS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Docker 配置目录不存在，创建目录...${NC}"
    mkdir -p "$DOCKER_SETTINGS_DIR"
fi

# 检查 Docker 是否正在运行
DOCKER_RUNNING=false
if docker info > /dev/null 2>&1; then
    DOCKER_RUNNING=true
    echo -e "${BLUE}ℹ️  Docker 正在运行，将在配置后重启${NC}"
    echo ""
fi

# 备份现有配置（如果存在）
if [ -f "$DOCKER_SETTINGS_FILE" ]; then
    BACKUP_FILE="${DOCKER_SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}📋 备份当前配置到:${NC}"
    echo "   $BACKUP_FILE"
    cp "$DOCKER_SETTINGS_FILE" "$BACKUP_FILE"
    echo ""
fi

# 读取现有配置或创建新配置
if [ -f "$DOCKER_SETTINGS_FILE" ]; then
    echo -e "${BLUE}📝 更新现有配置...${NC}"
    
    # 使用 Python 更新 JSON 配置
    python3 << EOF
import json
import sys

try:
    with open("$DOCKER_SETTINGS_FILE", "r") as f:
        settings = json.load(f)
except:
    settings = {}

# 更新资源配置
settings["memoryMiB"] = $((DOCKER_MEMORY_GB * 1024))
settings["cpus"] = $DOCKER_CPUS
settings["diskSizeMiB"] = $((DOCKER_DISK_SIZE_GB * 1024))
settings["swapMiB"] = $((DOCKER_SWAP_SIZE_GB * 1024))

# 其他推荐配置
settings["displayedWelcome"] = True
settings["displayedOnboarding"] = True

# 保存配置
with open("$DOCKER_SETTINGS_FILE", "w") as f:
    json.dump(settings, f, indent=2)

print("✅ 配置已更新")
EOF

else
    echo -e "${BLUE}📝 创建新配置...${NC}"
    
    # 创建新的配置文件
    cat > "$DOCKER_SETTINGS_FILE" << EOF
{
  "memoryMiB": $((DOCKER_MEMORY_GB * 1024)),
  "cpus": $DOCKER_CPUS,
  "diskSizeMiB": $((DOCKER_DISK_SIZE_GB * 1024)),
  "swapMiB": $((DOCKER_SWAP_SIZE_GB * 1024)),
  "displayedWelcome": true,
  "displayedOnboarding": true,
  "settingsVersion": 9
}
EOF
    echo -e "${GREEN}✅ 配置文件已创建${NC}"
fi

echo ""

# 如果 Docker 正在运行，需要重启
if [ "$DOCKER_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠️  需要重启 Docker 以应用新配置${NC}"
    echo ""
    
    # 检查是否是自动配置模式
    if [ "$DOCKER_AUTO_CONFIGURE" = "true" ]; then
        REPLY="y"
        echo "自动模式：将立即重启 Docker"
    else
        read -p "是否立即重启 Docker？(y/n): " -n 1 -r
        echo ""
    fi
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 重启 Docker Desktop...${NC}"
        
        # 停止 Docker
        osascript -e 'quit app "Docker"' 2>/dev/null || true
        sleep 5
        
        # 启动 Docker
        open -a Docker
        
        echo -e "${BLUE}⏳ 等待 Docker 启动...${NC}"
        for i in {1..120}; do
            if docker info > /dev/null 2>&1; then
                echo ""
                echo -e "${GREEN}✅ Docker 已重启${NC}"
                break
            fi
            sleep 1
            echo -n "."
        done
        
        if ! docker info > /dev/null 2>&1; then
            echo ""
            echo -e "${YELLOW}⚠️  Docker 启动超时，请手动启动${NC}"
        fi
    else
        echo -e "${YELLOW}ℹ️  请稍后手动重启 Docker Desktop${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Docker 未运行，下次启动时将应用新配置${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Docker 资源配置完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}配置详情:${NC}"
echo "  • 配置文件: $DOCKER_SETTINGS_FILE"
echo "  • 内存: ${DOCKER_MEMORY_GB}GB"
echo "  • CPU: ${DOCKER_CPUS} 核"
echo "  • 磁盘: ${DOCKER_DISK_SIZE_GB}GB"
echo "  • Swap: ${DOCKER_SWAP_SIZE_GB}GB"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "  可在 .env 中修改以下变量自定义配置:"
echo "  • DOCKER_MEMORY_GB (默认: 200)"
echo "  • DOCKER_CPUS (默认: 32)"
echo "  • DOCKER_DISK_SIZE_GB (默认: 512)"
echo "  • DOCKER_SWAP_SIZE_GB (默认: 8)"
echo ""

