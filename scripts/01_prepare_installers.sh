#!/bin/bash

# 模块：安装包准备
# 功能：检查并下载必要的安装包

set -e

echo "📦 准备安装包..."

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 创建installers目录
mkdir -p installers

# 检查LM Studio DMG
if [ ! -f "installers/LM-Studio-0.3.30-1-arm64.dmg" ]; then
    echo "📥 LM Studio安装包不存在，正在下载..."
    if [ -n "$LMSTUDIO_DMG_URL" ]; then
        curl -L "$LMSTUDIO_DMG_URL" -o installers/LM-Studio-0.3.30-1-arm64.dmg
        echo "✅ LM Studio下载完成"
    else
        echo "⚠️  LMSTUDIO_DMG_URL未设置，跳过下载"
        echo "   请手动下载并放置到 installers/ 目录"
    fi
else
    echo "✅ LM Studio安装包已存在"
fi

# 检查NewFlow TAR (支持版本号变化，如 1.0.0, 1.0.0-1 等)
NEWFLOW_TAR=""
# 优先查找 installers/ 目录
if ls installers/newflow-1.0.*.tar 1> /dev/null 2>&1; then
    NEWFLOW_TAR=$(ls installers/newflow-1.0.*.tar | head -1)
    echo "✅ NewFlow镜像已存在: $NEWFLOW_TAR"
# 查找项目根目录
elif ls newflow-1.0.*.tar 1> /dev/null 2>&1; then
    NEWFLOW_TAR=$(ls newflow-1.0.*.tar | head -1)
    echo "✅ NewFlow镜像已存在: $NEWFLOW_TAR"
    echo "📦 移动到installers目录..."
    mv "$NEWFLOW_TAR" installers/
    NEWFLOW_TAR="installers/$(basename $NEWFLOW_TAR)"
else
    echo "⚠️  NewFlow镜像不存在"
    echo "   请确保该文件存在（格式：newflow-1.0.*.tar）"
fi

# 加载Docker镜像
if [ -n "$NEWFLOW_TAR" ]; then
    if ! docker images | grep -q "newflow.*1.0"; then
        echo "📦 加载NewFlow Docker镜像到Docker..."
        docker load -i "$NEWFLOW_TAR"
        echo "✅ NewFlow镜像加载完成"
    else
        echo "✅ NewFlow镜像已加载到Docker"
    fi
fi

# 检查NewMindChat DMG
if [ ! -f "installers/NewmindChat-electron-0.0.1-mac-arm64.dmg" ]; then
    echo "⚠️  NewMindChat安装包不存在"
    echo "   该组件为可选，用户可稍后手动安装"
else
    echo "✅ NewMindChat安装包已存在"
fi

echo "✅ 安装包准备完成！"

