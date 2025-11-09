#!/bin/bash

# 安装步骤 04: 安装 LM Studio
# 调用现有的LM Studio安装脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="04_install_lmstudio"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 LM Studio..."
    mark_step_in_progress "$STEP_ID"
    
    # 调用现有的安装脚本
    if bash "scripts/05_install_lmstudio.sh"; then
        if verify_step; then
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_error "LM Studio 安装验证失败"
            mark_step_failed "$STEP_ID" "验证失败"
            return 1
        fi
    else
        log_error "LM Studio 安装失败"
        mark_step_failed "$STEP_ID" "安装脚本执行失败"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 LM Studio 安装..."
    
    if [ ! -d "/Applications/LM Studio.app" ]; then
        log_error "LM Studio.app 不存在"
        return 1
    fi
    
    # 获取版本信息
    if [ -f "/Applications/LM Studio.app/Contents/Info.plist" ]; then
        local version=$(defaults read "/Applications/LM Studio.app/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo "未知")
        log_success "LM Studio 已安装: 版本 $version"
    else
        log_success "LM Studio 已安装"
    fi
    
    # 检查应用是否可以打开（不实际打开，只检查）
    if [ -x "/Applications/LM Studio.app/Contents/MacOS/LM Studio" ] || \
       [ -f "/Applications/LM Studio.app/Contents/MacOS/LM Studio" ]; then
        log_success "LM Studio 可执行文件 ✓"
    else
        log_warn "LM Studio 可执行文件可能有问题"
    fi
    
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

