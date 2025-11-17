#!/bin/bash

# 模块：NewChat安装
# 功能：安装/升级NewChat到应用程序目录（支持覆盖安装）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💬 安装/升级 NewChat...${NC}"
echo ""

# 检查DMG文件（使用版本排序，选择最新版本）
NEWCHAT_DMG=$(ls installers/NewChat-*-mac-arm64.dmg 2>/dev/null | sort -V | tail -1)

if [ -z "$NEWCHAT_DMG" ]; then
    echo -e "${RED}❌ NewChat安装包不存在: installers/NewChat-*-mac-arm64.dmg${NC}"
    echo -e "${YELLOW}   请先运行 scripts/01_prepare_installers.sh${NC}"
    exit 1
fi

# 从文件名提取版本号
VERSION=$(basename "$NEWCHAT_DMG" | sed -n 's/NewChat-\(.*\)-mac-arm64.dmg/\1/p')
echo -e "${BLUE}📦 发现安装包: $NEWCHAT_DMG${NC}"
echo -e "${BLUE}   版本: ${VERSION}${NC}"
echo ""

# 检查是否已安装
if [ -d "/Applications/NewChat.app" ]; then
    echo -e "${YELLOW}⚠️  检测到已安装的 NewChat，将进行覆盖安装（升级）${NC}"
    echo -e "${YELLOW}   旧版本将被替换为: ${VERSION}${NC}"
    echo ""
    
    # 尝试获取当前安装的版本（如果可能）
    if [ -f "/Applications/NewChat.app/Contents/Info.plist" ]; then
        CURRENT_VERSION=$(defaults read /Applications/NewChat.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo "未知")
        echo -e "${BLUE}   当前版本: ${CURRENT_VERSION}${NC}"
    fi
    
    # 停止运行中的NewChat进程
    echo -e "${YELLOW}   检查并停止运行中的 NewChat 进程...${NC}"
    pkill -x "NewChat" 2>/dev/null || true
    sleep 1
    
    # 删除旧版本
    echo -e "${YELLOW}   删除旧版本...${NC}"
    rm -rf "/Applications/NewChat.app"
fi

echo -e "${BLUE}📦 挂载 NewChat DMG...${NC}"
hdiutil attach "$NEWCHAT_DMG" -nobrowse -quiet

# 等待挂载完成
sleep 2

# 查找挂载点 - 改进逻辑以处理各种挂载点名称
MOUNT_POINT=""

# 方法1: 尝试找 "NewChat" 相关挂载点（支持各种版本号）
for possible_mount in "/Volumes/NewChat" "/Volumes/newchat" "/Volumes/NewChat-1.0.4" "/Volumes/NewChat 1.0.4" "/Volumes/NewChat-1.0.3" "/Volumes/NewChat 1.0.3" "/Volumes/NewChat-1.0.1" "/Volumes/NewChat 1.0.1"; do
    if [ -d "$possible_mount" ]; then
        MOUNT_POINT="$possible_mount"
        break
    fi
done

# 方法2: 如果还没找到，从hdiutil info中查找
if [ -z "$MOUNT_POINT" ]; then
    MOUNT_POINT=$(hdiutil info | grep -i "/Volumes/.*[Nn]ew[Cc]hat" | head -1 | awk '{for(i=3;i<=NF;i++) printf "%s ", $i; print ""}' | sed 's/ $//')
fi

# 方法3: 使用ls直接查找
if [ -z "$MOUNT_POINT" ]; then
    MOUNT_POINT=$(ls -d /Volumes/*[Nn]ew[Cc]hat* 2>/dev/null | head -1)
fi

if [ -z "$MOUNT_POINT" ]; then
    echo -e "${RED}❌ 无法找到 NewChat 挂载点${NC}"
    echo -e "${YELLOW}所有挂载点:${NC}"
    hdiutil info | grep "/Volumes/" || ls -la /Volumes/
    exit 1
fi

echo -e "${GREEN}✓ 找到挂载点: $MOUNT_POINT${NC}"

# 再等待一下确保挂载点完全可用
sleep 1

# 显示挂载点内容（便于调试）
echo -e "${BLUE}📂 挂载点内容:${NC}"
ls -la "$MOUNT_POINT/" 2>/dev/null || echo -e "${YELLOW}⚠️ 无法列出挂载点内容${NC}"

# 查找.app文件（支持不同的应用名称）
APP_FILE=""
for possible_app in "$MOUNT_POINT/NewChat.app" "$MOUNT_POINT/newchat.app" "$MOUNT_POINT"/*.app; do
    if [ -d "$possible_app" ]; then
        APP_FILE="$possible_app"
        break
    fi
done

if [ -z "$APP_FILE" ]; then
    echo -e "${RED}❌ 在挂载点中找不到 .app 文件${NC}"
    echo -e "${YELLOW}挂载点内容:${NC}"
    ls -la "$MOUNT_POINT"
    hdiutil detach "$MOUNT_POINT" -quiet
    exit 1
fi

echo -e "${GREEN}✓ 找到应用: $(basename "$APP_FILE")${NC}"

echo -e "${BLUE}📂 复制 NewChat 到应用程序目录...${NC}"
cp -R "$APP_FILE" /Applications/NewChat.app

echo -e "${BLUE}🔓 绕过开发者验证（Gatekeeper）...${NC}"
# 使用 spctl --add 允许应用运行，绕过"未经验证的开发者"警告
sudo spctl --add --label "NewChat" /Applications/NewChat.app 2>/dev/null || true
# 移除隔离属性
sudo xattr -rd com.apple.quarantine /Applications/NewChat.app 2>/dev/null || true

echo -e "${BLUE}🔌 卸载 DMG...${NC}"
hdiutil detach "$MOUNT_POINT" -quiet

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ NewChat 安装/升级完成！          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 版本信息:${NC}"
echo -e "   • 已安装版本: ${VERSION}"
echo ""
echo -e "${YELLOW}⚠️  注意: NewChat 已安装但未自动启动${NC}"
echo -e "${YELLOW}   请在需要时手动启动应用${NC}"
echo ""
echo -e "${BLUE}🚀 手动启动方式:${NC}"
echo -e "   • 命令行启动: ${GREEN}open -a NewChat${NC}"
echo -e "   • 或从Launchpad/应用程序文件夹启动"
echo -e "   • 端口: 61990"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 下次运行此脚本将自动升级到最新版本"
echo -e "   • 用户数据和配置通常会保留"
echo -e "   • 应用不会在安装时自动启动"
echo ""

