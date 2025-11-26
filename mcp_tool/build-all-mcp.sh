#!/bin/bash

# 构建所有MCP服务器Docker镜像
# 支持AMD64和ARM64架构

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================="
echo "🔨 构建所有MCP服务器Docker镜像"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

build_mcp() {
    local name=$1
    local dir=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📦 构建 ${name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ ! -d "$dir" ]; then
        echo "❌ 目录不存在: $dir"
        return 1
    fi
    
    cd "$dir"
    
    if [ ! -f "build-docker.sh" ]; then
        echo "❌ 构建脚本不存在: build-docker.sh"
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    chmod +x build-docker.sh
    ./build-docker.sh
    
    cd "$SCRIPT_DIR"
    echo ""
}

# 构建顺序
echo "将按以下顺序构建："
echo "  1. Elasticsearch MCP"
echo "  2. Kibana MCP"
echo "  3. NewFlow MCP"
echo "  4. CMDB MCP"
echo ""

read -p "继续? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""

# 开始构建
START_TIME=$(date +%s)

build_mcp "Elasticsearch MCP" "mcp-server-elasticsearch-sl"
build_mcp "Kibana MCP" "mcp-server-kibana"
build_mcp "NewFlow MCP" "newflow-mcp-server"
build_mcp "CMDB MCP" "mcp-server-cmdb"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 所有MCP镜像构建完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "⏱️  总耗时: ${DURATION}秒"
echo ""
echo "📦 已生成的镜像："
docker images | grep newmind-mcp | awk '{printf "   %-40s %-20s %s\n", $1, $2, $7}'
echo ""
echo "📋 导出的tar文件："
find . -maxdepth 2 -name "newmind-mcp-*.tar" -exec ls -lh {} \; | awk '{printf "   %s  %s\n", $5, $9}'
echo ""

