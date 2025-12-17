#!/bin/bash

# 安装步骤 06: 安装 LibreOffice
# 用于文档处理和转换

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="06_install_libreoffice"

run_step() {
    log_info "检查 LibreOffice 安装状态..."
    mark_step_in_progress "$STEP_ID"
    
    # 1. 检查是否已安装
    if [ -d "/Applications/LibreOffice.app" ]; then
        local version=$(/Applications/LibreOffice.app/Contents/MacOS/soffice --version 2>/dev/null || echo "Unknown")
        log_success "LibreOffice 已安装: $version"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 2. 查找安装包
    local pkg_pattern="LibreOffice_*.dmg"
    local pkg_file=$(find installers -name "$pkg_pattern" 2>/dev/null | head -1)
    
    if [ -z "$pkg_file" ]; then
        log_warn "未找到 LibreOffice 安装包 ($pkg_pattern)"
        # 如果是核心依赖，这里应该报错，但如果是可选的，可以警告
        # 这里假设是必须的
        log_error "请确保 installers 目录下包含 LibreOffice 安装包"
        mark_step_failed "$STEP_ID" "缺少安装包"
        return 1
    fi
    
    log_info "发现安装包: $pkg_file"
    log_info "正在安装 LibreOffice..."
    
    # 3. 挂载 DMG
    local mount_point=$(hdiutil attach "$pkg_file" -nobrowse -readonly | grep -o "/Volumes/.*" | head -1)
    
    if [ -z "$mount_point" ]; then
        log_error "无法挂载 DMG 文件"
        mark_step_failed "$STEP_ID" "挂载失败"
        return 1
    fi
    
    # 4. 复制应用
    if [ -d "$mount_point/LibreOffice.app" ]; then
        log_info "正在复制应用到 /Applications..."
        if cp -R "$mount_point/LibreOffice.app" "/Applications/"; then
            log_success "复制完成"
        else
            log_error "复制失败"
            hdiutil detach "$mount_point" -quiet
            mark_step_failed "$STEP_ID" "复制失败"
            return 1
        fi
    else
        log_error "DMG 中未找到 LibreOffice.app"
        hdiutil detach "$mount_point" -quiet
        mark_step_failed "$STEP_ID" "无效的DMG"
        return 1
    fi
    
    # 5. 卸载 DMG
    hdiutil detach "$mount_point" -quiet
    
    # 6. 验证
    if [ -d "/Applications/LibreOffice.app" ]; then
        log_success "LibreOffice 安装成功"
        mark_step_completed "$STEP_ID"
        return 0
    else
        log_error "安装验证失败"
        mark_step_failed "$STEP_ID" "验证失败"
        return 1
    fi
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi



