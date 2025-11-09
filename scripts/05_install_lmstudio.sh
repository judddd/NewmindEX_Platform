#!/bin/bash

# 模块：LM Studio安装
# 功能：安装/升级LM Studio到应用程序目录（支持覆盖安装）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 安装/升级 LM Studio...${NC}"
echo ""

# 检查是否已安装
if [ -d "/Applications/LM Studio.app" ]; then
    echo -e "${YELLOW}⚠️  检测到已安装的 LM Studio，将进行覆盖安装（升级）${NC}"
    
    # 尝试获取当前版本
    if [ -f "/Applications/LM Studio.app/Contents/Info.plist" ]; then
        CURRENT_VERSION=$(defaults read "/Applications/LM Studio.app/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo "未知")
        echo -e "${BLUE}   当前版本: ${CURRENT_VERSION}${NC}"
    fi
    
    # 停止运行中的LM Studio进程
    echo -e "${YELLOW}   检查并停止运行中的 LM Studio 进程...${NC}"
    pkill -x "LM Studio" 2>/dev/null || true
    pkill -x "lms" 2>/dev/null || true
    sleep 1
    
    # 删除旧版本
    echo -e "${YELLOW}   删除旧版本...${NC}"
    rm -rf "/Applications/LM Studio.app"
    echo ""
fi

# 检查DMG文件
LMSTUDIO_DMG=$(ls installers/LM-Studio-*-arm64.dmg 2>/dev/null | head -1)

if [ -z "$LMSTUDIO_DMG" ]; then
    echo -e "${RED}❌ LM Studio安装包不存在: installers/LM-Studio-*-arm64.dmg${NC}"
    echo -e "${YELLOW}   请先运行 scripts/01_prepare_installers.sh${NC}"
    exit 1
fi

# 从文件名提取版本号
VERSION=$(basename "$LMSTUDIO_DMG" | sed -n 's/LM-Studio-\(.*\)-arm64.dmg/\1/p')
echo -e "${BLUE}📦 发现安装包: $LMSTUDIO_DMG${NC}"
echo -e "${BLUE}   版本: ${VERSION}${NC}"
echo ""

echo -e "${BLUE}📦 挂载 LM Studio DMG...${NC}"
hdiutil attach "$LMSTUDIO_DMG" -nobrowse -quiet

# 等待挂载完成
sleep 2

# 查找挂载点 - 改进逻辑以处理各种挂载点名称
MOUNT_POINT=""

# 方法1: 尝试找 "LM Studio" 或 "LM" 挂载点
for possible_mount in "/Volumes/LM Studio" "/Volumes/LM" "/Volumes/lm-studio" "/Volumes/lmstudio"; do
    if [ -d "$possible_mount" ]; then
        MOUNT_POINT="$possible_mount"
        break
    fi
done

# 方法2: 如果还没找到，从hdiutil info中查找
if [ -z "$MOUNT_POINT" ]; then
    MOUNT_POINT=$(hdiutil info | grep -i "/Volumes/.*LM" | head -1 | awk '{for(i=3;i<=NF;i++) printf "%s ", $i; print ""}' | sed 's/ $//')
fi

if [ -z "$MOUNT_POINT" ]; then
    echo -e "${RED}❌ 无法找到 LM Studio 挂载点${NC}"
    echo -e "${YELLOW}所有挂载点:${NC}"
    hdiutil info | grep "/Volumes/" || ls -la /Volumes/
    exit 1
fi

echo -e "${GREEN}✓ 找到挂载点: $MOUNT_POINT${NC}"

# 查找.app文件（支持不同的应用名称）
APP_FILE=""
for possible_app in "$MOUNT_POINT/LM Studio.app" "$MOUNT_POINT/LMStudio.app" "$MOUNT_POINT"/*.app; do
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

echo -e "${BLUE}📂 复制 LM Studio 到应用程序目录...${NC}"
echo -e "${BLUE}   源: $APP_FILE${NC}"
cp -R "$APP_FILE" "/Applications/LM Studio.app"

echo -e "${BLUE}🔓 绕过开发者验证（Gatekeeper）...${NC}"
# 使用 spctl --add 允许应用运行，绕过"未经验证的开发者"警告
sudo spctl --add --label "LM Studio" "/Applications/LM Studio.app" 2>/dev/null || true
# 移除隔离属性
sudo xattr -rd com.apple.quarantine "/Applications/LM Studio.app" 2>/dev/null || true

echo -e "${BLUE}🔌 卸载 DMG...${NC}"
hdiutil detach "$MOUNT_POINT" -quiet

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ LM Studio 安装/升级完成！         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 版本信息:${NC}"
echo -e "   • 已安装版本: ${VERSION}"
echo ""
echo -e "${BLUE}🚀 下一步：${NC}"
echo -e "   1. 打开 LM Studio.app"
echo -e "   2. 进入 Settings > Developer"
echo -e "   3. 安装 lms CLI 工具"
echo -e "   4. 重启终端使 lms 命令生效"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 下次运行此脚本将自动升级到最新版本"
echo -e "   • CLI工具配置通常会保留"
echo ""

