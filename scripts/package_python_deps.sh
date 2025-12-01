#!/bin/bash

# scripts/package_python_deps.sh
# 功能：预下载所有 Python 依赖包 (Wheels)，用于离线安装
# 使用 uv 缓存/下载机制

set -e

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALLERS_DIR="$PROJECT_ROOT/installers"
DEPS_DIR="$INSTALLERS_DIR/python_deps"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 开始打包 Python 离线依赖...${NC}"

# 创建依赖存放目录
mkdir -p "$DEPS_DIR"

# 检查 uv 是否安装
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}❌ 未找到 uv 命令，请先安装 uv${NC}"
    exit 1
fi

# 函数：下载项目的依赖
download_deps() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    echo -e "${BLUE}📥 处理项目: $project_name${NC}"
    
    cd "$project_dir"
    
    # 1. 导出 requirements.txt (包含所有传递依赖)
    # 使用 uv pip compile 从 pyproject.toml 生成完整的依赖列表
    echo "  • 生成依赖列表..."
    if [ -f "uv.lock" ]; then
        # 如果有 lock 文件，导出它 (更精确)
        uv pip compile pyproject.toml -o requirements.lock.txt --quiet
    else
        uv pip compile pyproject.toml -o requirements.lock.txt --quiet
    fi
    
    # 2. 下载 Wheels
    echo "  • 下载依赖包到 $DEPS_DIR..."
    
    # 确保 pip 已安装
    uv pip install pip --quiet
    
    # 使用 python -m pip download
    uv run python -m pip download -r requirements.lock.txt --dest "$DEPS_DIR" --quiet
    
    # 清理临时文件
    rm requirements.lock.txt
    
    cd "$PROJECT_ROOT"
}

# 1. 打包 NewRAG 依赖
if [ -d "$PROJECT_ROOT/newrag-main" ]; then
    download_deps "$PROJECT_ROOT/newrag-main"
else
    echo -e "${YELLOW}⚠️  未找到 newrag-main 目录${NC}"
fi

# 2. 打包 Dashboard 依赖
if [ -d "$PROJECT_ROOT/python_dashboard" ]; then
    download_deps "$PROJECT_ROOT/python_dashboard"
else
    echo -e "${YELLOW}⚠️  未找到 python_dashboard 目录${NC}"
fi

# 3. 打包成 tar.gz (可选，为了方便传输，也可以保持文件夹结构)
# 这里我们保持文件夹结构，方便 install 脚本直接使用 --find-links
# 但为了 install.sh 统一解压，我们还是打个包
echo -e "${BLUE}📦 压缩依赖包...${NC}"
cd "$INSTALLERS_DIR"
tar -czf python_deps.tar.gz python_deps
# 可选：保留原始目录或删除
# rm -rf python_deps 

echo -e "${GREEN}✅ Python 离线依赖包已生成: $INSTALLERS_DIR/python_deps.tar.gz${NC}"
echo -e "${BLUE}大小: $(du -h "$INSTALLERS_DIR/python_deps.tar.gz" | cut -f1)${NC}"
echo -e "${BLUE}包含包数量: $(ls python_deps | wc -l)${NC}"

