#!/bin/bash

# scripts/package_venvs.sh
# 功能：直接打包 Python 虚拟环境 (.venv)，用于同架构机器的极速离线部署

set -e

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALLERS_DIR="$PROJECT_ROOT/installers"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 开始打包 Python 虚拟环境 (.venv)...${NC}"

# 确保安装包目录存在
mkdir -p "$INSTALLERS_DIR"

# 函数：打包项目的 venv
package_venv() {
    local project_dir=$1
    local package_name=$2
    local display_name=$3
    
    echo -e "${BLUE}📥 处理: $display_name${NC}"
    
    if [ ! -d "$project_dir/.venv" ]; then
        echo -e "${YELLOW}⚠️  未找到 .venv 目录: $project_dir/.venv${NC}"
        echo -e "${YELLOW}   请先运行 uv sync 或项目初始化脚本${NC}"
        return 1
    fi
    
    local output_file="$INSTALLERS_DIR/$package_name"
    
    echo "  • 正在压缩 .venv 到 $package_name ..."
    
    # 进入项目目录进行压缩，避免路径层级过深
    cd "$project_dir"
    # 使用 tar 压缩 .venv 目录
    # --exclude 排除一些缓存和垃圾文件
    tar -czf "$output_file" \
        --exclude="__pycache__" \
        --exclude="*.pyc" \
        .venv
        
    echo -e "${GREEN}✅ 已生成: $output_file ($(du -h "$output_file" | cut -f1))${NC}"
    cd "$PROJECT_ROOT"
}

# 1. 打包 NewRAG 环境
package_venv "$PROJECT_ROOT/newrag-main" "newrag_venv.tar.gz" "NewRAG"

# 2. 打包 Dashboard 环境
package_venv "$PROJECT_ROOT/python_dashboard" "dashboard_venv.tar.gz" "Python Dashboard"

echo ""
echo -e "${GREEN}🎉 虚拟环境打包完成！${NC}"
echo -e "文件位于: $INSTALLERS_DIR"

