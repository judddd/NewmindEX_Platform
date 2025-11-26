#!/bin/bash

# MCP Docker 镜像构建和导出脚本
# 用途：构建 MCP 服务器 Docker 镜像并导出为 tar 文件

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MCP_TOOL_DIR="$PROJECT_ROOT/mcp_tool"
INSTALLERS_DIR="$PROJECT_ROOT/installers"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 MCP Docker 镜像构建工具${NC}"
echo "===================================="
echo

# 创建 installers 目录
mkdir -p "$INSTALLERS_DIR"

# 定义 MCP 服务器列表
MCP_VERSION="1.0.0"

# 使用简单数组（兼容旧版bash）
MCP_TYPES=("elasticsearch" "kibana" "newflow" "cmdb")
MCP_elasticsearch="mcp-server-elasticsearch-sl"
MCP_kibana="mcp-server-kibana"
MCP_newflow="newflow-mcp-server"
MCP_cmdb="mcp-server-cmdb"

# 构建单个 MCP 镜像
build_mcp_image() {
    local mcp_type=$1
    local mcp_dir=$2
    local image_name="newmind-mcp-${mcp_type}"
    local image_tag="${image_name}:${MCP_VERSION}"
    local tar_file="${INSTALLERS_DIR}/${image_name}-${MCP_VERSION}.tar"
    
    echo -e "${YELLOW}📦 构建 ${mcp_type} MCP Server...${NC}"
    
    # 检查目录是否存在
    if [ ! -d "${MCP_TOOL_DIR}/${mcp_dir}" ]; then
        echo -e "${RED}❌ 目录不存在: ${MCP_TOOL_DIR}/${mcp_dir}${NC}"
        return 1
    fi
    
    # 检查 Dockerfile 是否存在
    if [ ! -f "${MCP_TOOL_DIR}/${mcp_dir}/Dockerfile" ]; then
        echo -e "${RED}❌ Dockerfile 不存在: ${MCP_TOOL_DIR}/${mcp_dir}/Dockerfile${NC}"
        return 1
    fi
    
    # 构建镜像
    echo "   构建镜像: ${image_tag}"
    cd "${MCP_TOOL_DIR}/${mcp_dir}"
    
    if docker build -t "${image_tag}" . ; then
        echo -e "${GREEN}   ✅ 镜像构建成功${NC}"
    else
        echo -e "${RED}   ❌ 镜像构建失败${NC}"
        return 1
    fi
    
    # 导出镜像为 tar 文件
    echo "   导出镜像: ${tar_file}"
    if docker save -o "${tar_file}" "${image_tag}"; then
        echo -e "${GREEN}   ✅ 镜像已导出到: ${tar_file}${NC}"
        # 显示文件大小
        local file_size=$(du -h "${tar_file}" | cut -f1)
        echo "   📊 文件大小: ${file_size}"
    else
        echo -e "${RED}   ❌ 镜像导出失败${NC}"
        return 1
    fi
    
    echo
}

# 主流程
main() {
    echo -e "${BLUE}开始构建所有 MCP 镜像...${NC}"
    echo
    
    local success_count=0
    local fail_count=0
    
    for mcp_type in "${MCP_TYPES[@]}"; do
        # 通过变量名间接引用获取目录名
        local var_name="MCP_${mcp_type}"
        local mcp_dir="${!var_name}"
        
        if build_mcp_image "$mcp_type" "$mcp_dir"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    done
    
    echo "===================================="
    echo -e "${GREEN}✅ 成功: ${success_count}${NC}"
    if [ $fail_count -gt 0 ]; then
        echo -e "${RED}❌ 失败: ${fail_count}${NC}"
    fi
    
    echo
    echo -e "${BLUE}📦 生成的镜像文件：${NC}"
    ls -lh "${INSTALLERS_DIR}"/newmind-mcp-*.tar 2>/dev/null || echo "   无镜像文件"
    
    echo
    echo -e "${GREEN}🎉 构建完成！${NC}"
    echo
    echo "使用说明："
    echo "  1. 镜像文件已保存到 installers/ 目录"
    echo "  2. Dashboard 启动时会自动导入这些镜像"
    echo "  3. MCP 实例将以 Docker 容器方式运行"
}

# 执行主流程
main "$@"

