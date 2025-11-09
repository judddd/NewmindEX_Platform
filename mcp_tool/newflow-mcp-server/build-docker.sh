#!/bin/bash

# NewFlow MCP Server - 构建 ARM64 & AMD64 Docker 镜像并导出

set -e

VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="newmind-mcp-newflow"

echo "🔨 构建 NewFlow MCP Server Docker 镜像"
echo "版本: ${VERSION}"
echo ""

# 检查 TypeScript 是否已构建
if [ ! -d "build" ]; then
    echo "⚠️  构建 TypeScript..."
    npm run build
fi

# 构建 ARM64
echo "📦 构建 ARM64 镜像..."
docker buildx build --platform linux/arm64 --tag ${IMAGE_NAME}:${VERSION}-arm64 --load .
echo "💾 导出 ARM64 tar..."
docker save ${IMAGE_NAME}:${VERSION}-arm64 -o ${IMAGE_NAME}-${VERSION}-arm64.tar
echo "✅ ARM64: $(du -h ${IMAGE_NAME}-${VERSION}-arm64.tar | cut -f1)"

# 构建 AMD64
echo ""
echo "📦 构建 AMD64 镜像..."
docker buildx build --platform linux/amd64 --tag ${IMAGE_NAME}:${VERSION}-amd64 --load .
echo "💾 导出 AMD64 tar..."
docker save ${IMAGE_NAME}:${VERSION}-amd64 -o ${IMAGE_NAME}-${VERSION}-amd64.tar
echo "✅ AMD64: $(du -h ${IMAGE_NAME}-${VERSION}-amd64.tar | cut -f1)"

echo ""
echo "🎉 完成！生成的文件："
ls -lh ${IMAGE_NAME}-${VERSION}-*.tar


