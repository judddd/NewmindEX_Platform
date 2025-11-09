#!/bin/bash

# 安装步骤 05: 安装 NewChat
# 调用现有的NewChat安装脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="05_install_newchat"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 NewChat..."
    mark_step_in_progress "$STEP_ID"
    
    # 调用现有的安装脚本
    if bash "scripts/05_install_newchat.sh"; then
        if verify_step; then
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_error "NewChat 安装验证失败"
            mark_step_failed "$STEP_ID" "验证失败"
            return 1
        fi
    else
        log_error "NewChat 安装失败"
        mark_step_failed "$STEP_ID" "安装脚本执行失败"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 NewChat 安装..."
    
    if [ ! -d "/Applications/NewChat.app" ]; then
        log_error "NewChat.app 不存在"
        return 1
    fi
    
    # 获取版本信息
    if [ -f "/Applications/NewChat.app/Contents/Info.plist" ]; then
        local version=$(defaults read /Applications/NewChat.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo "未知")
        log_success "NewChat 已安装: 版本 $version"
    else
        log_success "NewChat 已安装"
    fi
    
    # 检查应用是否可以打开（不实际打开，只检查）
    if [ -x "/Applications/NewChat.app/Contents/MacOS/NewChat" ] || \
       [ -f "/Applications/NewChat.app/Contents/MacOS/NewChat" ]; then
        log_success "NewChat 可执行文件 ✓"
    else
        log_warn "NewChat 可执行文件可能有问题"
    fi
    
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

