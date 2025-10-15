#!/bin/bash

# 模块：LM Studio安装
# 功能：安装LM Studio到应用程序目录

set -e

echo "🤖 安装LM Studio..."

# 检查是否已安装
if [ -d "/Applications/LM Studio.app" ]; then
    echo "✅ LM Studio已安装，跳过安装步骤"
    
    # 检查CLI工具
    if command -v lms &> /dev/null; then
        echo "✅ lms CLI工具可用: $(which lms)"
    else
        echo "⚠️  lms CLI工具不可用，可能需要手动配置PATH"
        echo "   请在LM Studio应用中进入 Settings > Developer，安装CLI工具"
    fi
    
    exit 0
fi

# 检查DMG文件
if [ ! -f "installers/LM-Studio-0.3.30-1-arm64.dmg" ]; then
    echo "❌ LM Studio安装包不存在: installers/LM-Studio-0.3.30-1-arm64.dmg"
    echo "   请先运行 scripts/01_prepare_installers.sh"
    exit 1
fi

echo "📦 挂载LM Studio DMG..."
hdiutil attach installers/LM-Studio-0.3.30-1-arm64.dmg -nobrowse -quiet

# 等待挂载完成
sleep 2

# 查找挂载点
MOUNT_POINT=$(hdiutil info | grep "/Volumes/LM Studio" | awk '{print $3}')

if [ -z "$MOUNT_POINT" ]; then
    echo "❌ 无法找到LM Studio挂载点"
    exit 1
fi

echo "📂 复制LM Studio到应用程序目录..."
cp -R "$MOUNT_POINT/LM Studio.app" /Applications/

echo "🔌 卸载DMG..."
hdiutil detach "$MOUNT_POINT" -quiet

echo "✅ LM Studio安装完成！"
echo ""
echo "📝 下一步："
echo "   1. 打开 LM Studio.app"
echo "   2. 进入 Settings > Developer"
echo "   3. 安装 lms CLI 工具"
echo "   4. 重启终端使 lms 命令生效"

