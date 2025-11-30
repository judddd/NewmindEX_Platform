#!/bin/bash
# NewFlow 完整清理重启脚本
# 用途：清除所有缓存、构建产物、node_modules，确保干净启动

set -e

echo "🧹 开始完整清理..."

# 1. 停止所有 n8n 进程
echo "停止所有 n8n 进程..."
pkill -f n8n || true
sleep 2

# 2. 清理 node_modules
echo "清理 node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true

# 3. 清理构建产物
echo "清理构建产物..."
rm -rf packages/*/dist
rm -rf packages/*/build
rm -rf compiled/*
rm -rf .turbo

# 4. 清理 pnpm 缓存
echo "清理 pnpm 缓存..."
pnpm store prune || true

# 5. 清理前端缓存
echo "清理前端缓存..."
rm -rf packages/frontend/editor-ui/.nuxt
rm -rf packages/frontend/editor-ui/.output
rm -rf packages/frontend/editor-ui/.vite

# 6. 清理 TypeScript 缓存
echo "清理 TypeScript 缓存..."
find . -name "*.tsbuildinfo" -delete

# 7. 清理浏览器缓存目录（可选）
echo "清理本地存储和缓存..."
rm -rf ~/.n8n/.cache 2>/dev/null || true

# 8. 重新安装依赖
echo "📦 重新安装依赖..."
pnpm install --frozen-lockfile

# 9. 完整构建
echo "🔨 完整构建..."
pnpm build > build.log 2>&1
tail -n 50 build.log

echo "✅ 清理完成！可以启动了："
echo "   pnpm dev  (开发模式)"
echo "   pnpm start (生产模式)"

