#!/bin/bash
# NewFlow 清理重启脚本 - 确保干净启动

set -e

echo "🧹 NewFlow 清理重启中..."

# 停止所有进程
pkill -f n8n || true
sleep 1

# 清理构建产物和缓存
echo "清理构建产物..."
rm -rf packages/*/dist compiled/* .turbo packages/frontend/editor-ui/.vite
find . -name "*.tsbuildinfo" -delete

# 重新构建
echo "🔨 重新构建..."
pnpm build > build.log 2>&1 && tail -n 30 build.log

echo "✅ 清理完成！现在可以启动："
echo "   pnpm dev"

