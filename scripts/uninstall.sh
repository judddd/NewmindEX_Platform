#!/bin/bash

# NewMind AI Platform - 卸载脚本
# 用途: 完整卸载所有组件

set -e

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     NewMind AI Platform - 卸载程序                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}⚠️  警告: 此操作将卸载所有 NewMind AI Platform 组件${NC}"
echo ""

# 显示将要删除的内容
echo -e "${CYAN}将要删除:${NC}"
echo "  • Docker 容器和镜像"
echo "  • LM Studio.app"
echo "  • NewChat.app"
echo "  • Python 虚拟环境"
echo "  • 安装状态文件"
echo ""
echo -e "${GREEN}永不删除:${NC}"
echo "  • AI 模型文件 (installers/models/) - 安装包的一部分"
echo "  • ~/.lmstudio/models/ - 已复制的模型（需手动删除）"
echo ""

# 询问是否保留数据
echo -e "${YELLOW}数据保留选项:${NC}"
echo "  1. 完全卸载（删除所有内容包括数据）"
echo "  2. 保留数据（保留Elasticsearch数据、模型文件等）"
echo ""
read -p "请选择 [1/2]: " -n 1 -r
echo ""

KEEP_DATA=false
if [[ $REPLY == "2" ]]; then
    KEEP_DATA=true
    echo -e "${GREEN}将保留数据文件${NC}"
else
    echo -e "${YELLOW}将删除所有数据${NC}"
fi

echo ""

# 最后确认
echo -e "${RED}最后确认${NC}"
read -p "确定要卸载吗? 输入 'yes' 继续: " -r
echo ""

if [[ $REPLY != "yes" ]]; then
    echo "已取消卸载"
    exit 0
fi

echo ""
echo -e "${BLUE}开始卸载...${NC}"
echo ""

# ==================== 停止服务 ====================

echo "步骤 1/7: 停止所有服务..."

# 停止Dashboard
if [ -f "python_dashboard/dashboard.pid" ]; then
    PID=$(cat python_dashboard/dashboard.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "  • 停止 Dashboard (PID: $PID)"
        kill $PID || true
    fi
    rm -f python_dashboard/dashboard.pid
fi

# 停止Docker容器
if command -v docker &> /dev/null; then
    echo "  • 停止 Docker 容器"
    docker-compose down 2>/dev/null || true
    
    # 停止所有NewMind相关容器
    docker ps -a --format "{{.Names}}" | grep -E "(elasticsearch|kibana|logstash|newflow|newmind|newchat)" | while read container; do
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
    done
fi

echo -e "${GREEN}✓ 服务已停止${NC}"
echo ""

# ==================== 删除Docker资源 ====================

echo "步骤 2/7: 删除 Docker 资源..."

if command -v docker &> /dev/null; then
    # 删除镜像
    echo "  • 删除 Docker 镜像"
    docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "(newflow|newmind|newchat)" | while read image; do
        docker rmi "$image" 2>/dev/null || true
    done
    
    # 删除数据卷（如果不保留数据）
    if [ "$KEEP_DATA" = false ]; then
        echo "  • 删除 Docker 数据卷"
        docker volume ls -q | grep -E "(elasticsearch|kibana|logstash)" | while read volume; do
            docker volume rm "$volume" 2>/dev/null || true
        done
        
        # 删除数据目录
        if [ -d "elasticsearch" ]; then
            echo "  • 删除 Elasticsearch 数据"
            rm -rf elasticsearch/node*
        fi
        
        if [ -d "newflow_data" ]; then
            echo "  • 删除 NewFlow 数据"
            # 删除所有 NewFlow 数据文件
            rm -rf newflow_data/*.sqlite* 
            rm -rf newflow_data/*.log
            rm -rf newflow_data/.initialized
            rm -rf newflow_data/crash.journal
            rm -rf newflow_data/config
            rm -rf newflow_data/binaryData/*
        fi
    else
        echo "  • 保留 Docker 数据卷"
    fi
fi

echo -e "${GREEN}✓ Docker 资源已清理${NC}"
echo ""

# ==================== 删除应用程序 ====================

echo "步骤 3/7: 删除应用程序..."

# 删除LM Studio
if [ -d "/Applications/LM Studio.app" ]; then
    echo "  • 删除 LM Studio"
    pkill -x "LM Studio" 2>/dev/null || true
    rm -rf "/Applications/LM Studio.app"
fi

# 删除NewChat
if [ -d "/Applications/NewChat.app" ]; then
    echo "  • 删除 NewChat"
    pkill -x "NewChat" 2>/dev/null || true
    rm -rf "/Applications/NewChat.app"
fi

echo -e "${GREEN}✓ 应用程序已删除${NC}"
echo ""

# ==================== AI模型（永不删除） ====================

echo "步骤 4/7: AI 模型..."
echo -e "${YELLOW}  • AI 模型文件永不自动删除（安装包的一部分）${NC}"
echo -e "${YELLOW}  • installers/models/ - 保留${NC}"
echo -e "${YELLOW}  • ~/.lmstudio/models/ - 保留（如需删除请手动操作）${NC}"
echo ""

# ==================== 删除Python环境 ====================

echo "步骤 5/7: 删除 Python 环境..."

if [ -d "python_dashboard/.venv" ]; then
    echo "  • 删除 Python 虚拟环境"
    rm -rf python_dashboard/.venv
fi

if [ -f "python_dashboard/mcp_instances.db" ] && [ "$KEEP_DATA" = false ]; then
    echo "  • 删除 MCP 实例数据库"
    rm -f python_dashboard/mcp_instances.db
fi

echo -e "${GREEN}✓ Python 环境已清理${NC}"
echo ""

# ==================== 删除日志和临时文件 ====================

echo "步骤 6/7: 删除日志和临时文件..."

if [ "$KEEP_DATA" = false ]; then
    echo "  • 删除日志文件"
    rm -rf logs/*.log logs/*.log.* logs/*.txt
    rm -rf logs/mcp_containers/*
    rm -rf python_dashboard/*.log
    rm -rf python_dashboard/mcp_logs/*
fi

echo "  • 删除临时文件和缓存"
rm -f .install_state
rm -f python_dashboard/dashboard.pid
rm -rf python_dashboard/mcp_pids/*
rm -rf python_dashboard/__pycache__
find . -type f -name ".DS_Store" -delete 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo -e "${GREEN}✓ 临时文件已清理${NC}"
echo ""

# ==================== 显示保留的内容 ====================

echo "步骤 7/7: 完成卸载"
echo ""

if [ "$KEEP_DATA" = true ]; then
    echo -e "${CYAN}保留的内容:${NC}"
    echo "  • Elasticsearch 数据: elasticsearch/node*"
    echo "  • NewFlow 数据: newflow_data/"
    echo "  • MCP 配置: python_dashboard/mcp_instances.db"
else
    echo -e "${GREEN}应用程序和服务已删除${NC}"
fi

echo ""
echo -e "${GREEN}永久保留的内容:${NC}"
echo "  • AI 模型: installers/models/ (安装包组成部分)"
echo "  • AI 模型: ~/.lmstudio/models/ (运行时缓存)"
echo -e "${YELLOW}  如需删除模型，请手动执行: rm -rf ~/.lmstudio/models/*${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║              ✅ 卸载完成！                                      ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}注意事项:${NC}"
echo "  • Docker Desktop 仍然安装（如需删除请手动卸载）"
echo "  • Node.js 和 UV 仍然安装（如需删除请手动卸载）"
echo "  • 项目文件夹保留（可手动删除）"
echo ""

