#!/bin/bash
# NewFlow 快速清理脚本
# 用途：只清理构建产物和缓存，保留 node_modules

set -e

echo "🧹 快速清理..."

# 1. 停止进程
pkill -f n8n || true

# 2. 清理构建产物
echo "清理构建产物..."
rm -rf packages/*/dist
rm -rf compiled/*
rm -rf .turbo

# 3. 清理前端缓存
echo "清理前端缓存..."
rm -rf packages/frontend/editor-ui/.nuxt
rm -rf packages/frontend/editor-ui/.vite

# 4. 清理 TS 缓存
find . -name "*.tsbuildinfo" -delete

# 5. 重新构建
echo "🔨 重新构建..."
pnpm build > build.log 2>&1
tail -n 30 build.log

echo "✅ 快速清理完成！"

