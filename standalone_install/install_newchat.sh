#!/bin/bash

# NewChat 独立安装脚本
# 功能：自动查找当前目录下的 NewChat DMG 并安装到 /Applications
# 用法：bash install_newchat.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 正在查找 NewChat 安装包...${NC}"

# 查找当前目录下最新的 NewChat DMG (支持 NewChat.dmg 或 NewChat-1.0.dmg 等)
# 使用 ls -1 确保每行一个，然后排序取最后一个
DMG_FILE=$(ls -1 NewChat*.dmg 2>/dev/null | sort -V | tail -1)

if [ -z "$DMG_FILE" ]; then
    echo -e "${RED}❌ 未找到安装包！${NC}"
    echo "请确保当前目录下有 NewChat*.dmg 文件"
    exit 1
fi

echo -e "${GREEN}📦 找到安装包: $DMG_FILE${NC}"

# 检查是否已安装
if [ -d "/Applications/NewChat.app" ]; then
    echo -e "${YELLOW}⚠️  检测到旧版本，正在清理...${NC}"
    # 尝试优雅关闭
    pkill -x "NewChat" 2>/dev/null || true
    sleep 1
    rm -rf "/Applications/NewChat.app"
fi

echo -e "${BLUE}💿 正在挂载镜像...${NC}"
# 挂载镜像
hdiutil attach "$DMG_FILE" -nobrowse -quiet

# 等待系统挂载
sleep 2

# 查找挂载点 (通常在 /Volumes 下，包含 NewChat)
MOUNT_POINT=$(ls -d /Volumes/*NewChat* 2>/dev/null | head -1)

if [ -z "$MOUNT_POINT" ]; then
    echo -e "${RED}❌ 挂载失败或找不到挂载点${NC}"
    echo "调试信息: /Volumes 内容:"
    ls -1 /Volumes/
    exit 1
fi

echo -e "${GREEN}✓ 挂载点: $MOUNT_POINT${NC}"

# 查找 .app 文件
APP_PATH=$(find "$MOUNT_POINT" -maxdepth 1 -name "*.app" -print -quit)

if [ -z "$APP_PATH" ]; then
    echo -e "${RED}❌ 镜像中未找到 .app 文件${NC}"
    hdiutil detach "$MOUNT_POINT" -quiet
    exit 1
fi

echo -e "${BLUE}🚀 正在安装到应用程序目录...${NC}"
cp -R "$APP_PATH" "/Applications/NewChat.app"

echo -e "${BLUE}🔓 正在修复权限和安全设置 (需要管理员密码)...${NC}"
# 绕过 Gatekeeper
sudo spctl --add --label "NewChat" "/Applications/NewChat.app" 2>/dev/null || true

# 移除隔离属性
sudo xattr -rd com.apple.quarantine "/Applications/NewChat.app" 2>/dev/null || true

echo -e "${BLUE}🧹 清理临时文件...${NC}"
hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ 安装成功！${NC}"
echo "您现在可以在 Launchpad 或应用程序文件夹中启动 NewChat。"

