#!/bin/bash

# 安装步骤 02: 安装 Python
# 从PKG文件安装Python 3.11.7

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="02_install_python"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 Python 3.11..."
    mark_step_in_progress "$STEP_ID"
    
    # 检查是否已安装Python 3.11
    if command -v python3.11 &> /dev/null; then
        local version=$(python3.11 --version 2>&1)
        log_success "Python 3.11 已安装: $version"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 查找Python PKG文件
    local python_pkg=""
    if [ -f "installers/system/python-3.11.7-macos11.pkg" ]; then
        python_pkg="installers/system/python-3.11.7-macos11.pkg"
    elif [ -f "installers/python-3.11.7-macos11.pkg" ]; then
        python_pkg="installers/python-3.11.7-macos11.pkg"
    else
        # 尝试查找任何Python PKG
        python_pkg=$(find installers -name "python-*.pkg" 2>/dev/null | head -1)
    fi
    
    if [ -z "$python_pkg" ]; then
        log_error "找不到 Python PKG 安装包"
        log_error "请确保文件存在: installers/system/python-3.11.7-macos11.pkg"
        mark_step_failed "$STEP_ID" "安装包不存在"
        return 1
    fi
    
    log_info "发现安装包: $python_pkg"
    log_info "安装 Python 3.11.7 (需要管理员权限)..."
    
    # 安装Python PKG
    if sudo installer -pkg "$python_pkg" -target /; then
        log_success "Python 安装完成"
        
        # 等待安装完成
        sleep 2
        
        # 验证安装
        if command -v python3.11 &> /dev/null; then
            local version=$(python3.11 --version 2>&1)
            log_success "Python 版本: $version"
            
            # 显示安装位置
            local python_path=$(which python3.11)
            log_info "安装位置: $python_path"
            
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_error "Python 安装后未能找到命令"
            mark_step_failed "$STEP_ID" "验证失败"
            return 1
        fi
    else
        log_error "Python 安装失败"
        mark_step_failed "$STEP_ID" "安装失败"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 Python 安装..."
    
    if command -v python3.11 &> /dev/null; then
        local version=$(python3.11 --version 2>&1)
        log_success "Python 3.11: $version"
        return 0
    else
        log_error "Python 3.11 未安装"
        return 1
    fi
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

