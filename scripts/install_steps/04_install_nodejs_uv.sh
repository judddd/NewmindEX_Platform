#!/bin/bash

# 安装步骤 03: 安装 Node.js 和 UV
# 安装Node.js运行时和UV Python包管理器

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="03_install_nodejs_uv"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 Node.js 和 UV..."
    mark_step_in_progress "$STEP_ID"
    
    local nodejs_installed=false
    local uv_installed=false
    
    # 安装Node.js
    if install_nodejs; then
        nodejs_installed=true
    else
        log_warn "Node.js 安装失败或跳过"
    fi
    
    # 安装UV
    if install_uv; then
        uv_installed=true
    else
        log_warn "UV 安装失败或跳过"
    fi
    
    # 至少有一个成功就算步骤完成
    if [ "$nodejs_installed" = true ] || [ "$uv_installed" = true ]; then
        mark_step_completed "$STEP_ID"
        return 0
    else
        mark_step_failed "$STEP_ID" "Node.js和UV安装均失败"
        return 1
    fi
}

# 安装Node.js
install_nodejs() {
    log_info "检查 Node.js..."
    
    local need_install=true
    
    # 检查是否已安装
    if command -v node &> /dev/null; then
        local version_str=$(node --version) # v20.18.1
        # 提取主版本号
        local major_version=$(echo "$version_str" | cut -d. -f1 | tr -d 'v')
        
        log_info "发现已安装 Node.js: $version_str (主版本: $major_version)"
        
        if [ "$major_version" -lt 22 ]; then
            log_warn "Node.js 版本过低 ($version_str < v22). 准备升级..."
            need_install=true
        else
            log_success "Node.js 版本满足要求 ($version_str)"
            need_install=false
        fi
    else
        log_info "Node.js 未安装"
        need_install=true
    fi
    
    if [ "$need_install" = false ]; then
        return 0
    fi
    
    # 查找安装包
    local node_pkg=""
    # 优先查找 Node 22
    node_pkg=$(find installers -name "node-v22*.pkg" 2>/dev/null | head -1)
    
    if [ -z "$node_pkg" ]; then
        if [ -f "installers/system/node-v20.18.1.pkg" ]; then
            node_pkg="installers/system/node-v20.18.1.pkg"
        else
            # 尝试查找任何Node.js安装包
            node_pkg=$(find installers -name "node-*.pkg" 2>/dev/null | head -1)
        fi
    fi
    
    if [ -z "$node_pkg" ]; then
        log_warn "找不到 Node.js 安装包，跳过"
        return 1
    fi
    
    log_info "发现安装包: $node_pkg"
    log_info "安装 Node.js (需要管理员权限)..."
    
    # 安装
    if sudo installer -pkg "$node_pkg" -target /; then
        log_success "Node.js 安装完成"
        
        # 验证安装
        sleep 2
        if command -v node &> /dev/null; then
            local version=$(node --version)
            log_success "Node.js 版本: $version"
            return 0
        else
            log_warn "Node.js 安装后未能找到命令"
            return 1
        fi
    else
        log_error "Node.js 安装失败"
        return 1
    fi
}

# 安装UV
install_uv() {
    log_info "检查 UV..."
    
    # 检查是否已安装
    if command -v uv &> /dev/null; then
        local version=$(uv --version 2>&1)
        log_success "UV 已安装: $version"
        return 0
    fi
    
    # 查找 UV 安装方式 (优先使用 installer 脚本)
    if [ -f "installers/system/uv-installer.sh" ]; then
        log_info "发现 UV 安装脚本，正在运行..."
        if sh installers/system/uv-installer.sh; then
             # 添加到PATH (标准安装路径)
            export PATH="$HOME/.local/bin:$PATH"
            if command -v uv &> /dev/null; then
                log_success "UV 安装完成: $(uv --version)"
                return 0
            fi
        else
            log_warn "UV 安装脚本执行失败，尝试寻找压缩包..."
        fi
    fi

    # 查找UV二进制压缩包
    local uv_tarball=""
    if [ -f "installers/uv-aarch64-apple-darwin.tar.gz" ]; then
        uv_tarball="installers/uv-aarch64-apple-darwin.tar.gz"
    elif [ -f "installers/system/uv-aarch64-apple-darwin.tar.gz" ]; then
        uv_tarball="installers/system/uv-aarch64-apple-darwin.tar.gz"
    else
        # 尝试查找任何UV压缩包
        uv_tarball=$(find installers -name "uv-*.tar.gz" 2>/dev/null | head -1)
    fi
    
    if [ -z "$uv_tarball" ]; then
        log_error "找不到 UV 安装包"
        return 1
    fi
    
    log_info "发现 UV 安装包: $uv_tarball"
    log_info "解压并安装 UV..."
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    
    # 解压
    if tar -xzf "$uv_tarball" -C "$temp_dir"; then
        # 查找uv可执行文件
        local uv_bin=$(find "$temp_dir" -name "uv" -type f -perm +111 2>/dev/null | head -1)
        
        if [ -n "$uv_bin" ]; then
            # 安装到用户目录
            mkdir -p "$HOME/.local/bin"
            cp "$uv_bin" "$HOME/.local/bin/uv"
            chmod +x "$HOME/.local/bin/uv"
            
            # 添加到PATH
            export PATH="$HOME/.local/bin:$PATH"
            
            # 清理临时目录
            rm -rf "$temp_dir"
            
            if command -v uv &> /dev/null; then
                local version=$(uv --version 2>&1)
                log_success "UV 安装完成: $version"
                log_info "已安装到: $HOME/.local/bin/uv"
                log_info "请确保 ~/.local/bin 在您的 PATH 中"
                return 0
            else
                log_error "UV 安装后未能找到命令"
                return 1
            fi
        else
            log_error "在压缩包中找不到 UV 可执行文件"
            rm -rf "$temp_dir"
            return 1
        fi
    else
        log_error "解压 UV 压缩包失败"
        rm -rf "$temp_dir"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 Node.js 和 UV 安装..."
    
    local nodejs_ok=false
    local uv_ok=false
    
    if command -v node &> /dev/null; then
        nodejs_ok=true
        log_success "Node.js ✓"
    else
        log_warn "Node.js 未安装"
    fi
    
    if command -v uv &> /dev/null; then
        uv_ok=true
        log_success "UV ✓"
    else
        log_warn "UV 未安装"
    fi
    
    # 至少有一个成功
    if [ "$nodejs_ok" = true ] || [ "$uv_ok" = true ]; then
        return 0
    fi
    
    return 1
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

