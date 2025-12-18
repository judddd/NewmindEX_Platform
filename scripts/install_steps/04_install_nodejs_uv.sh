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
    local target_version="22.12.0"
    
    # 检查是否已安装目标版本
    if command -v node &> /dev/null; then
        local version_str=$(node --version) # v22.12.0
        local current_version=$(echo "$version_str" | tr -d 'v')
        
        log_info "发现已安装 Node.js: $version_str"
        
        # 严格检查：必须是 22.12.0 版本
        if [ "$current_version" == "$target_version" ]; then
            log_success "Node.js 版本正确 ($version_str)"
            # 确保 Corepack 已启用
            enable_corepack
            return 0
        else
            log_warn "Node.js 版本不匹配 (当前: $version_str, 目标: v$target_version)"
            log_warn "准备安装指定版本..."
            need_install=true
        fi
    else
        log_info "Node.js 未安装"
        need_install=true
    fi
    
    # 强制使用 installers/system/node-v22.12.0.pkg
    local node_pkg="installers/system/node-v22.12.0.pkg"
    
    if [ ! -f "$node_pkg" ]; then
        log_error "未找到必需的 Node.js 22.12.0 安装包: $node_pkg"
        log_error "请确保 installers/system/ 目录包含此文件"
        return 1
    fi
    
    log_info "使用指定安装包: $node_pkg"
    log_info "安装 Node.js v$target_version (需要管理员权限)..."
    
    # 安装
    if sudo installer -pkg "$node_pkg" -target /; then
        log_success "Node.js v$target_version 安装完成"
        
        # 验证安装
        sleep 2
        
        # 刷新 shell 环境
        export PATH="/usr/local/bin:$PATH"
        hash -r 2>/dev/null || true
        
        if command -v node &> /dev/null; then
            local version=$(node --version)
            log_success "Node.js 版本: $version"
            log_success "npm 版本: $(npm --version)"
            
            # 启用 Corepack (自带 pnpm)
            enable_corepack
            
            return 0
        else
            log_warn "Node.js 安装后未能找到命令，尝试重新加载 PATH..."
            return 1
        fi
    else
        log_error "Node.js 安装失败"
        return 1
    fi
}

# 启用 Corepack (Node.js 自带的 pnpm/yarn 管理器)
enable_corepack() {
    log_info "启用 Corepack (包含 pnpm)..."
    
    if command -v corepack &> /dev/null; then
        # 启用 Corepack
        if sudo corepack enable 2>/dev/null || corepack enable 2>/dev/null; then
            log_success "Corepack 已启用"
            
            # 验证 pnpm 是否可用
            if command -v pnpm &> /dev/null; then
                log_success "pnpm 已可用: $(pnpm --version 2>/dev/null || echo '(通过 Corepack)')"
            else
                log_warn "Corepack 已启用，但 pnpm 尚未激活，首次使用时会自动下载"
            fi
        else
            log_warn "Corepack 启用失败，可能需要手动执行: sudo corepack enable"
        fi
    else
        log_warn "未找到 Corepack 命令，可能 Node.js 安装不完整"
    fi
}

# 配置 UV 环境变量
setup_uv_env() {
    # 添加到PATH (当前会话)
    export PATH="$HOME/.local/bin:$PATH"
    
    # 添加到 shell 配置文件 (永久生效)
    local shell_rc=""
    if [ -n "$ZSH_VERSION" ]; then
        shell_rc="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        shell_rc="$HOME/.bashrc"
    fi
    
    if [ -n "$shell_rc" ] && [ -f "$shell_rc" ]; then
        if ! grep -q "/.local/bin" "$shell_rc" 2>/dev/null; then
            echo '' >> "$shell_rc"
            echo '# UV package manager' >> "$shell_rc"
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_rc"
            log_info "已添加 UV 到 $shell_rc"
        fi
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
    
    # 查找UV二进制压缩包 (优先使用离线包)
    local uv_tarball=""
    if [ -f "installers/uv-aarch64-apple-darwin.tar.gz" ]; then
        uv_tarball="installers/uv-aarch64-apple-darwin.tar.gz"
    elif [ -f "installers/system/uv-aarch64-apple-darwin.tar.gz" ]; then
        uv_tarball="installers/system/uv-aarch64-apple-darwin.tar.gz"
    else
        # 尝试查找任何UV压缩包
        uv_tarball=$(find installers -name "uv-*.tar.gz" 2>/dev/null | head -1)
    fi
    
    if [ -n "$uv_tarball" ]; then
        log_info "发现 UV 离线安装包: $uv_tarball"
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
                
                # 配置环境变量
                setup_uv_env
                
                # 清理临时目录
                rm -rf "$temp_dir"
                
                if command -v uv &> /dev/null; then
                    local version=$(uv --version 2>&1)
                    log_success "UV 安装完成: $version"
                    log_info "已安装到: $HOME/.local/bin/uv"
                    return 0
                else
                    log_warn "UV 已安装到 $HOME/.local/bin/uv 但不在当前 PATH 中"
                    return 0
                fi
            else
                log_error "在压缩包中找不到 UV 可执行文件"
                rm -rf "$temp_dir"
            fi
        else
            log_error "解压 UV 压缩包失败"
            rm -rf "$temp_dir"
        fi
    fi

    # 如果离线安装失败或没找到包，尝试使用脚本 (作为 Fallback)
    if [ -f "installers/system/uv-installer.sh" ]; then
        log_warn "未找到离线包，尝试使用安装脚本..."
        if sh installers/system/uv-installer.sh; then
             setup_uv_env
             if command -v uv &> /dev/null; then
                log_success "UV 安装完成: $(uv --version)"
                return 0
             fi
        else
            log_warn "UV 安装脚本执行失败"
        fi
    fi
    
    log_error "无法安装 UV (找不到离线包且脚本执行失败)"
    return 1
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
