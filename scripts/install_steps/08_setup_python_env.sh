#!/bin/bash

# 安装步骤 08: 配置 Python 环境
# 创建虚拟环境并安装Python依赖

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="08_setup_python_env"

# Python项目目录
PYTHON_DIR="python_dashboard"

# ==================== 主函数 ====================

run_step() {
    log_info "开始配置 Python 环境..."
    mark_step_in_progress "$STEP_ID"
    
    # 检查Python目录
    if [ ! -d "$PYTHON_DIR" ]; then
        log_error "Python项目目录不存在: $PYTHON_DIR"
        mark_step_failed "$STEP_ID" "项目目录不存在"
        return 1
    fi
    
    cd "$PYTHON_DIR"
    
    # 创建虚拟环境
    if ! create_venv; then
        log_error "创建虚拟环境失败"
        cd ..
        mark_step_failed "$STEP_ID" "虚拟环境创建失败"
        return 1
    fi
    
    # 安装依赖
    if ! install_dependencies; then
        log_error "安装依赖失败"
        cd ..
        mark_step_failed "$STEP_ID" "依赖安装失败"
        return 1
    fi
    
    cd ..
    
    if verify_step; then
        mark_step_completed "$STEP_ID"
        return 0
    else
        mark_step_failed "$STEP_ID" "验证失败"
        return 1
    fi
}

# 创建虚拟环境
create_venv() {
    log_info "创建 Python 虚拟环境..."
    
    # 如果已存在，询问是否重新创建
    if [ -d ".venv" ]; then
        log_warn "虚拟环境已存在"
        echo -ne "${YELLOW}是否重新创建? [y/N] ${NC}"
        read -r response
        # 转换为小写（兼容旧版bash）
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
        if [[ "$response" =~ ^(y|yes)$ ]]; then
            log_info "删除旧环境..."
            rm -rf .venv
        else
            log_info "使用现有虚拟环境"
            return 0
        fi
    fi
    
    # 离线环境：使用已安装的Python 3.11创建venv
    # 优先使用python3.11，否则使用python3
    log_info "使用 Python 3.11 创建虚拟环境（离线模式）..."
    
    local python_cmd=""
    if command -v python3.11 &> /dev/null; then
        python_cmd="python3.11"
        log_info "使用 Python 3.11"
    elif command -v python3 &> /dev/null; then
        python_cmd="python3"
        log_warn "Python 3.11 未找到，使用系统 Python"
    else
        log_error "找不到 Python"
        return 1
    fi
    
    if $python_cmd -m venv .venv; then
        log_success "虚拟环境创建成功"
        return 0
    fi
    
    log_error "虚拟环境创建失败"
    return 1
}

# 安装依赖
install_dependencies() {
    log_info "安装 Python 依赖（离线模式）..."
    
    # 激活虚拟环境
    source .venv/bin/activate
    
    # 离线安装：优先使用本地wheels
    if [ -d "../installers/python_deps/wheels" ] && [ -n "$(ls -A ../installers/python_deps/wheels/*.whl 2>/dev/null)" ]; then
        log_info "从本地 wheels 安装依赖（完全离线）..."
        
        # 不升级pip（避免联网）
        
        # 安装wheels（纯离线模式）
        # 使用虚拟环境中的python，不指定python3或python3.11
        if python -m pip install --no-index --find-links=../installers/python_deps/wheels -e . 2>&1 | tee -a "../$LOG_FILE"; then
            log_success "依赖安装完成（离线）"
            return 0
        else
            log_error "本地 wheels 安装失败"
            log_error "请确保 installers/python_deps/wheels/ 包含所有依赖"
            return 1
        fi
    else
        log_error "找不到本地 wheels 目录或目录为空"
        log_error "路径: installers/python_deps/wheels/"
        log_error "请先运行: pip3 download -r installers/python_deps/requirements.txt -d installers/python_deps/wheels"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 Python 环境..."
    
    cd "$PYTHON_DIR"
    
    # 检查虚拟环境
    if [ ! -d ".venv" ]; then
        log_error "虚拟环境不存在"
        cd ..
        return 1
    fi
    
    log_success "虚拟环境 ✓"
    
    # 激活并检查依赖
    source .venv/bin/activate
    
    # 检查关键包
    local all_ok=true
    echo ""
    echo -e "${CYAN}关键依赖检查:${NC}"
    
    for package in fastapi uvicorn httpx docker aiosqlite; do
        if python3 -c "import $package" 2>/dev/null; then
            local version=$(python3 -c "import $package; print($package.__version__)" 2>/dev/null || echo "未知")
            log_success "  ✓ $package ($version)"
        else
            log_error "  ✗ $package 缺失"
            all_ok=false
        fi
    done
    
    deactivate
    cd ..
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        log_error "部分依赖缺失"
        return 1
    fi
    
    log_success "所有关键依赖已就绪 ✓"
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

