#!/bin/bash

# 导入MCP Docker镜像脚本
# 从 installers/ 目录加载预构建的MCP镜像

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INSTALLERS_DIR="$PROJECT_ROOT/installers"

echo "🐳 导入MCP Docker镜像..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 定义MCP镜像文件
MCP_IMAGES=(
    "newmind-mcp-elasticsearch-1.0.0.tar"
    "newmind-mcp-kibana-1.0.0.tar"
    "newmind-mcp-newflow-1.0.0.tar"
)

success_count=0
skip_count=0
fail_count=0

for image_tar in "${MCP_IMAGES[@]}"; do
    image_path="${INSTALLERS_DIR}/${image_tar}"
    image_name=$(echo "$image_tar" | sed 's/-1.0.0.tar//')
    
    # 检查镜像文件是否存在
    if [ ! -f "$image_path" ]; then
        echo "⚠️  镜像文件不存在: ${image_tar}"
        echo "   请运行: bash scripts/build_mcp_images.sh"
        ((skip_count++))
        continue
    fi
    
    # 检查镜像是否已导入
    if docker images "${image_name}:1.0.0" --format "{{.Repository}}:{{.Tag}}" | grep -q "${image_name}:1.0.0"; then
        echo "✅ 镜像已存在，跳过: ${image_name}:1.0.0"
        ((skip_count++))
        continue
    fi
    
    # 导入镜像
    echo "📦 导入镜像: ${image_tar}"
    if docker load -i "$image_path"; then
        echo "✅ 导入成功: ${image_name}:1.0.0"
        ((success_count++))
    else
        echo "❌ 导入失败: ${image_tar}"
        ((fail_count++))
    fi
    echo
done

echo "===================================="
echo "导入统计:"
echo "  ✅ 成功: ${success_count}"
echo "  ⏭️  跳过: ${skip_count}"
if [ $fail_count -gt 0 ]; then
    echo "  ❌ 失败: ${fail_count}"
fi
echo "===================================="

# 显示已导入的MCP镜像
echo
echo "📋 当前MCP镜像列表:"
docker images --filter "reference=newmind-mcp-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo
if [ $fail_count -gt 0 ]; then
    echo "⚠️  部分镜像导入失败，MCP功能可能受限"
    exit 1
else
    echo "✅ MCP镜像准备完成！"
fi

