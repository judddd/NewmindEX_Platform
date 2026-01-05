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
    
    # 确保 uv 在 PATH 中
    export PATH="$HOME/.local/bin:$PATH"
    
    if ! command -v uv &> /dev/null; then
        log_error "找不到 uv 命令，请先安装 uv"
        return 1
    fi
    
    # 如果已存在，询问是否重新创建
    if [ -d ".venv" ]; then
        log_warn "虚拟环境已存在"
        echo -ne "${YELLOW}是否重新创建? [y/N] ${NC}"
        read -r response
        # 转换为小写（兼容旧版bash）
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
        if [[ "$response" =~ ^(y|yes)$ ]]; then
            log_info "删除旧环境..."
            if ! rm -rf .venv 2>/dev/null; then
                log_warn "无法直接删除 .venv，尝试修复权限..."
                chmod -R u+w .venv 2>/dev/null || true
                if ! rm -rf .venv; then
                    log_warn "权限不足，尝试使用 sudo 删除..."
                    if command -v sudo &> /dev/null; then
                        sudo rm -rf .venv
                    else
                        log_error "无法删除 .venv 且找不到 sudo 命令，请手动删除 .venv 目录后重试"
                        return 1
                    fi
                fi
            fi
        else
            log_info "使用现有虚拟环境"
            return 0
        fi
    fi
    
    # 使用 uv 创建 venv
    log_info "使用 uv 创建 Python 3.11 虚拟环境..."
    
    if uv venv .venv --python 3.11; then
        log_success "虚拟环境创建成功"
        return 0
    fi
    
    log_error "虚拟环境创建失败"
    return 1
}

# 安装依赖
install_dependencies() {
    log_info "安装 Python 依赖..."
    
    # 确保 uv 可用
    export PATH="$HOME/.local/bin:$PATH"
    if ! command -v uv &> /dev/null; then
        log_error "找不到 uv"
        return 1
    fi
    
    # 优先使用 uv sync (基于 pyproject.toml)
    if [ -f "pyproject.toml" ]; then
        log_info "使用 uv sync 安装依赖 (基于 pyproject.toml)..."
        if uv sync 2>&1 | tee -a "$LOG_FILE"; then
            UV_STATUS=${PIPESTATUS[0]}
            if [ $UV_STATUS -eq 0 ]; then
                log_success "依赖安装完成"
                return 0
            else
                log_error "uv sync 失败 (exit code: $UV_STATUS)"
                return 1
            fi
        else
            log_error "uv sync 过程发生错误"
            return 1
        fi
    fi
    
    # 降级方案：使用 requirements.txt
    log_warn "未找到 pyproject.toml，尝试使用 requirements.txt..."
    
    # 显式激活虚拟环境
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    else
        log_error "找不到虚拟环境激活脚本 (.venv/bin/activate)"
        return 1
    fi
    
    # 再次检查是否激活成功
    if [ -z "$VIRTUAL_ENV" ]; then
        log_error "虚拟环境激活失败"
        return 1
    fi
    
    # 确定 requirements.txt 路径
    local req_file="requirements.txt"
    if [ ! -f "$req_file" ]; then
        if [ -f "../installers/python_deps/requirements.txt" ]; then
            req_file="../installers/python_deps/requirements.txt"
            log_info "使用安装包中的依赖清单: $req_file"
        else
            log_error "找不到 requirements.txt (当前目录和 installers 目录均未找到)"
            return 1
        fi
    fi
    
    # 直接联网安装
    log_info "从 PyPI 在线安装依赖..."
    if uv pip install --force-reinstall -r "$req_file" 2>&1 | tee -a "$LOG_FILE"; then
        UV_STATUS=${PIPESTATUS[0]}
        if [ $UV_STATUS -eq 0 ]; then
            log_success "依赖安装完成"
            return 0
        else
            log_error "在线安装失败 (uv exit code: $UV_STATUS)"
            return 1
        fi
    else
        log_error "在线安装过程发生错误"
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
    
    for package in fastapi uvicorn httpx docker aiosqlite psutil; do
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

