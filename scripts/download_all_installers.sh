#!/bin/bash

# NewMind AI Platform - 完整离线安装包下载脚本
# 功能：下载所有缺失的安装包，确保100%离线安装

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     下载所有离线安装包                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 工作目录
cd "$(dirname "$0")/.."

# 创建目录
mkdir -p installers/system
mkdir -p installers/python_deps/wheels

# ==================== Python 安装包 ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Python 安装包${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PYTHON_PKG="installers/system/python-3.11.7-macos11.pkg"

if [ -f "$PYTHON_PKG" ]; then
    echo -e "${GREEN}✓ Python PKG 已存在${NC}"
    ls -lh "$PYTHON_PKG"
else
    echo -e "${YELLOW}→ 下载 Python 3.11.7 for macOS...${NC}"
    curl -L -o "$PYTHON_PKG" "https://www.python.org/ftp/python/3.11.7/python-3.11.7-macos11.pkg"
    
    if [ -f "$PYTHON_PKG" ]; then
        size=$(du -h "$PYTHON_PKG" | cut -f1)
        echo -e "${GREEN}✓ 下载完成: $size${NC}"
    else
        echo -e "${RED}✗ 下载失败${NC}"
    fi
fi

echo ""

# ==================== Node.js 安装包 ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Node.js 安装包${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

NODE_PKG="installers/system/node-v20.18.1.pkg"

if [ -f "$NODE_PKG" ]; then
    echo -e "${GREEN}✓ Node.js PKG 已存在${NC}"
    ls -lh "$NODE_PKG"
else
    echo -e "${YELLOW}→ 下载 Node.js 20.18.1 for macOS ARM64...${NC}"
    curl -L -o "$NODE_PKG" "https://nodejs.org/dist/v20.18.1/node-v20.18.1.pkg"
    
    if [ -f "$NODE_PKG" ]; then
        size=$(du -h "$NODE_PKG" | cut -f1)
        echo -e "${GREEN}✓ 下载完成: $size${NC}"
    else
        echo -e "${RED}✗ 下载失败${NC}"
    fi
fi

echo ""

# ==================== UV 二进制包 ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. UV Python 包管理器${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

UV_TAR="installers/uv-aarch64-apple-darwin.tar.gz"

if [ -f "$UV_TAR" ]; then
    echo -e "${GREEN}✓ UV 二进制包已存在${NC}"
    ls -lh "$UV_TAR"
else
    echo -e "${YELLOW}→ 下载 UV 最新版 for macOS ARM64...${NC}"
    
    # 获取最新版本
    LATEST_VERSION=$(curl -s https://api.github.com/repos/astral-sh/uv/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
    echo -e "${BLUE}   最新版本: $LATEST_VERSION${NC}"
    
    curl -L -o "$UV_TAR" "https://github.com/astral-sh/uv/releases/download/${LATEST_VERSION}/uv-aarch64-apple-darwin.tar.gz"
    
    if [ -f "$UV_TAR" ]; then
        size=$(du -h "$UV_TAR" | cut -f1)
        echo -e "${GREEN}✓ 下载完成: $size${NC}"
    else
        echo -e "${RED}✗ 下载失败${NC}"
    fi
fi

echo ""

# ==================== Python Wheels ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Python 依赖包 (Wheels)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

WHEELS_DIR="installers/python_deps/wheels"
WHEELS_COUNT=$(ls -1 "$WHEELS_DIR"/*.whl 2>/dev/null | wc -l | tr -d ' ')

if [ "$WHEELS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Python wheels 已存在: $WHEELS_COUNT 个文件${NC}"
    du -sh "$WHEELS_DIR"
else
    echo -e "${YELLOW}→ 下载 Python wheels...${NC}"
    echo ""
    
    if [ -f "installers/python_deps/requirements.txt" ]; then
        echo -e "${BLUE}   使用 pip download 下载所有依赖...${NC}"
        pip3 download -r installers/python_deps/requirements.txt -d "$WHEELS_DIR"
        
        WHEELS_COUNT=$(ls -1 "$WHEELS_DIR"/*.whl 2>/dev/null | wc -l | tr -d ' ')
        if [ "$WHEELS_COUNT" -gt 0 ]; then
            size=$(du -sh "$WHEELS_DIR" | cut -f1)
            echo -e "${GREEN}✓ 下载完成: $WHEELS_COUNT 个文件 ($size)${NC}"
        else
            echo -e "${RED}✗ 下载失败${NC}"
        fi
    else
        echo -e "${RED}✗ requirements.txt 不存在${NC}"
    fi
fi

echo ""

# ==================== Docker Desktop ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Docker Desktop${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOCKER_DMG="installers/Docker.dmg"

if [ -f "$DOCKER_DMG" ]; then
    echo -e "${GREEN}✓ Docker.dmg 已存在${NC}"
    ls -lh "$DOCKER_DMG"
else
    echo -e "${YELLOW}→ Docker.dmg 需要手动下载${NC}"
    echo -e "${BLUE}   下载地址: https://desktop.docker.com/mac/main/arm64/Docker.dmg${NC}"
    echo -e "${YELLOW}   请手动下载后保存到: $DOCKER_DMG${NC}"
fi

echo ""

# ==================== 总结 ====================

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    下载完成                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}已完成项目:${NC}"
[ -f "$PYTHON_PKG" ] && echo -e "${GREEN}  ✓ Python 3.11.7 PKG${NC}"
[ -f "$NODE_PKG" ] && echo -e "${GREEN}  ✓ Node.js 20.18.1 PKG${NC}"
[ -f "$UV_TAR" ] && echo -e "${GREEN}  ✓ UV 二进制包${NC}"
[ "$WHEELS_COUNT" -gt 0 ] && echo -e "${GREEN}  ✓ Python Wheels ($WHEELS_COUNT 个)${NC}"
[ -f "$DOCKER_DMG" ] && echo -e "${GREEN}  ✓ Docker Desktop${NC}"

echo ""
echo -e "${BLUE}待完成项目:${NC}"
[ ! -f "$PYTHON_PKG" ] && echo -e "${YELLOW}  ⊙ Python 3.11.7 PKG${NC}"
[ ! -f "$NODE_PKG" ] && echo -e "${YELLOW}  ⊙ Node.js 20.18.1 PKG${NC}"
[ ! -f "$UV_TAR" ] && echo -e "${YELLOW}  ⊙ UV 二进制包${NC}"
[ "$WHEELS_COUNT" -eq 0 ] && echo -e "${YELLOW}  ⊙ Python Wheels${NC}"
[ ! -f "$DOCKER_DMG" ] && echo -e "${YELLOW}  ⊙ Docker Desktop (需手动下载)${NC}"

echo ""
echo -e "${BLUE}所有安装包位置:${NC}"
echo -e "  • installers/system/python-3.11.7-macos11.pkg"
echo -e "  • installers/system/node-v20.18.1.pkg"
echo -e "  • installers/uv-aarch64-apple-darwin.tar.gz"
echo -e "  • installers/python_deps/wheels/ (32+ wheel文件)"
echo -e "  • installers/Docker.dmg"
echo ""

echo -e "${GREEN}✅ 脚本执行完成！${NC}"

