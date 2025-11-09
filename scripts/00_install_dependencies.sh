#!/bin/bash

# 模块：安装系统依赖（离线模式）
# 功能：自动安装Docker、Node.js、UV等

set -e

echo "🔧 安装系统依赖（离线模式）..."
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

INSTALLER_DIR="installers"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ===========================================
# 1. 安装Docker Desktop
# ===========================================
if ! command -v docker &> /dev/null; then
    echo -e "${BLUE}📦 安装Docker Desktop...${NC}"
    
    DOCKER_DMG="$INSTALLER_DIR/Docker.dmg"
    if [ -f "$DOCKER_DMG" ]; then
        echo "   挂载Docker DMG..."
        hdiutil attach "$DOCKER_DMG" -nobrowse -quiet
        sleep 2
        
        # 查找挂载点
        MOUNT_POINT=""
        for possible_mount in "/Volumes/Docker" "/Volumes/docker"; do
            if [ -d "$possible_mount" ]; then
                MOUNT_POINT="$possible_mount"
                break
            fi
        done
        
        if [ -n "$MOUNT_POINT" ]; then
            echo "   复制Docker.app到/Applications..."
            sudo cp -R "$MOUNT_POINT/Docker.app" /Applications/ 2>/dev/null || cp -R "$MOUNT_POINT/Docker.app" /Applications/
            hdiutil detach "$MOUNT_POINT" -quiet
            echo -e "${GREEN}✅ Docker Desktop已安装${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  重要：请手动完成以下步骤${NC}"
            echo "   1. 打开 /Applications/Docker.app"
            echo "   2. 完成Docker Desktop初始化向导"
            echo "   3. 等待Docker完全启动（看到菜单栏图标）"
            echo "   4. 按回车继续..."
            read
        else
            echo -e "${RED}❌ 无法找到Docker挂载点${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 找不到Docker.dmg: $DOCKER_DMG${NC}"
        echo "   请手动安装Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker已安装: $(docker --version)${NC}"
fi

# 检查Docker是否运行
echo -e "${BLUE}🔍 检查Docker运行状态...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker未运行${NC}"
    echo "   正在尝试启动Docker Desktop..."
    open -a Docker
    echo "   等待Docker启动（最多60秒）..."
    
    for i in {1..60}; do
        if docker info > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker已启动${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    
    if ! docker info > /dev/null 2>&1; then
        echo ""
        echo -e "${RED}❌ Docker启动超时${NC}"
        echo "   请手动启动Docker Desktop后重新运行此脚本"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker正在运行${NC}"
fi

# ===========================================
# 2. 安装Node.js
# ===========================================
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}📦 安装Node.js...${NC}"
    
    NODE_PKG=$(ls "$INSTALLER_DIR"/node-*.pkg 2>/dev/null | head -1)
    if [ -n "$NODE_PKG" ]; then
        echo "   安装Node.js（可能需要sudo权限）..."
        sudo installer -pkg "$NODE_PKG" -target / || {
            echo -e "${RED}❌ 需要管理员权限安装Node.js${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Node.js已安装${NC}"
    else
        echo -e "${RED}❌ 找不到Node.js安装包（node-*.pkg）${NC}"
        echo "   请手动下载: https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js已安装: $NODE_VERSION${NC}"
    
    # 检查版本是否足够新
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Node.js版本过低（需要18+），建议升级${NC}"
    fi
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm未安装（通常应该随Node.js安装）${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm已安装: $(npm --version)${NC}"
fi

# ===========================================
# 3. 安装Python（macOS通常自带）
# ===========================================
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3未检测到${NC}"
    
    PYTHON_PKG=$(ls "$INSTALLER_DIR"/python-*.pkg 2>/dev/null | head -1)
    if [ -n "$PYTHON_PKG" ]; then
        echo -e "${BLUE}📦 安装Python 3...${NC}"
        sudo installer -pkg "$PYTHON_PKG" -target /
        echo -e "${GREEN}✅ Python已安装${NC}"
    else
        echo -e "${YELLOW}   macOS通常自带Python 3，如果仍然找不到请手动安装${NC}"
        echo "   下载地址: https://www.python.org/downloads/"
    fi
else
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python已安装: $PYTHON_VERSION${NC}"
fi

# ===========================================
# 4. 安装UV
# ===========================================
if ! command -v uv &> /dev/null; then
    echo -e "${BLUE}📦 安装UV (Python包管理器)...${NC}"
    
    # 方法1: 使用安装脚本
    if [ -f "$INSTALLER_DIR/uv-installer.sh" ]; then
        echo "   使用安装脚本..."
        bash "$INSTALLER_DIR/uv-installer.sh"
        
        # 更新PATH
        export PATH="$HOME/.local/bin:$PATH"
        
        if command -v uv &> /dev/null; then
            echo -e "${GREEN}✅ UV已安装: $(uv --version)${NC}"
        else
            echo -e "${YELLOW}⚠️  UV安装完成，但未在PATH中${NC}"
            echo "   请添加以下行到 ~/.zshrc 或 ~/.bashrc："
            echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
        fi
        
    # 方法2: 使用预编译二进制
    elif [ -f "$INSTALLER_DIR/uv-aarch64-apple-darwin.tar.gz" ]; then
        echo "   使用预编译二进制..."
        tar -xzf "$INSTALLER_DIR/uv-aarch64-apple-darwin.tar.gz" -C /tmp
        mkdir -p "$HOME/.local/bin"
        mv /tmp/uv "$HOME/.local/bin/"
        chmod +x "$HOME/.local/bin/uv"
        
        # 更新PATH
        export PATH="$HOME/.local/bin:$PATH"
        
        echo -e "${GREEN}✅ UV已安装${NC}"
    else
        echo -e "${RED}❌ 找不到UV安装文件${NC}"
        echo "   请手动安装: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
else
    echo -e "${GREEN}✅ UV已安装: $(uv --version)${NC}"
fi

# ===========================================
# 5. 配置LM Studio模型（如果存在）
# ===========================================
echo ""
echo -e "${BLUE}🤖 配置LM Studio模型...${NC}"

if [ -d "$INSTALLER_DIR/models" ] && [ "$(ls -A "$INSTALLER_DIR/models" 2>/dev/null | grep -v README)" ]; then
    echo "   找到模型文件，准备复制..."
    
    LM_MODELS_DIR="$HOME/.lmstudio/models"
    mkdir -p "$LM_MODELS_DIR"
    
    # 复制所有模型目录
    for model_dir in "$INSTALLER_DIR/models"/*; do
        if [ -d "$model_dir" ] && [ "$(basename "$model_dir")" != "README.md" ]; then
            model_name=$(basename "$model_dir")
            echo "   复制模型: $model_name"
            cp -R "$model_dir" "$LM_MODELS_DIR/"
        fi
    done
    
    echo -e "${GREEN}✅ 模型已复制到: $LM_MODELS_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  未找到模型文件${NC}"
    echo "   请参考 installers/models/README.md 手动复制模型"
fi

# ===========================================
# 总结
# ===========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ 系统依赖安装完成！                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 已安装的组件:${NC}"
command -v docker &> /dev/null && echo "   ✅ Docker: $(docker --version)"
command -v node &> /dev/null && echo "   ✅ Node.js: $(node --version)"
command -v python3 &> /dev/null && echo "   ✅ Python: $(python3 --version)"
command -v uv &> /dev/null && echo "   ✅ UV: $(uv --version)"
echo ""
echo -e "${YELLOW}💡 重要提示:${NC}"
echo "   • 如果这是首次安装，建议重新打开终端使环境变量生效"
echo "   • Docker Desktop必须保持运行状态"
echo "   • 可以继续运行 ./scripts/start_all.sh 启动服务"
echo ""

