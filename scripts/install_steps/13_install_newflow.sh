#!/bin/bash

# 安装步骤 13: 安装 NewFlow 模块
# 解压 NewFlow 源码并安装依赖 (Node.js 22 + pnpm)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="13_install_newflow"
INSTALL_PATH="newflow-main"
ZIP_FILE="installers/newflow-main-1.0.0.zip"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 NewFlow 模块..."
    mark_step_in_progress "$STEP_ID"
    
    # 检查 Node.js 版本
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，无法安装 NewFlow"
        return 1
    fi
    
    local node_ver=$(node -v)
    log_info "Node.js 版本: $node_ver (建议 v22+)"
    
    # 检查是否需要强制安装
    local force_install=false
    if [ "$1" == "true" ]; then
        force_install=true
        log_warn "强制重新安装 NewFlow..."
    fi
    
    # 检查是否已安装
    if [ -d "$INSTALL_PATH" ] && [ -d "$INSTALL_PATH/node_modules" ] && [ "$force_install" = false ]; then
        log_success "NewFlow 似乎已安装 (目录和依赖存在)"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 清理旧目录 (如果强制安装或目录不完整)
    if [ -d "$INSTALL_PATH" ]; then
        log_info "清理旧的安装目录..."
        # 如果有数据需要保留，可以在这里处理，但用户说数据在自己的文件夹下
        rm -rf "$INSTALL_PATH"
    fi
    
    # 检查 zip 文件
    if [ ! -f "$ZIP_FILE" ]; then
        # 尝试查找其他可能的 zip
        local found_zip=$(find installers -name "newflow-main*.zip" | head -1)
        if [ -n "$found_zip" ]; then
            ZIP_FILE="$found_zip"
        else
            log_error "未找到 NewFlow 安装包: $ZIP_FILE"
            return 1
        fi
    fi
    
    log_info "解压安装包: $ZIP_FILE"
    # 使用 || true 忽略因文件名编码导致的解压错误
    unzip -q -o "$ZIP_FILE" || true
    
    # 修复模板文件 (使用本地 workflow_conf 覆盖)
    local CONF_SRC="workflow_conf"
    local CONF_DEST="$INSTALL_PATH/workflow_template"
    
    if [ -d "$CONF_SRC" ]; then
        log_info "使用本地 workflow_conf 修复工作流模板..."
        mkdir -p "$CONF_DEST"
        cp -R "$CONF_SRC/"* "$CONF_DEST/" 2>/dev/null || true
        log_success "工作流模板已修复"
    else
        log_warn "未找到本地 workflow_conf 目录 ($CONF_SRC)，跳过模板修复"
    fi
    
    # 修正目录名 (如果解压出来不是 newflow-main)
    # 假设解压出来的目录名与 zip 包名一致去掉 .zip，或者就是 newflow-main
    # 这里简单处理：如果 newflow-main 不存在但存在类似的，重命名
    if [ ! -d "$INSTALL_PATH" ]; then
        local extracted_dir=$(find . -maxdepth 1 -type d -name "newflow-main*" | grep -v "^.$" | head -1)
        if [ -n "$extracted_dir" ]; then
            mv "$extracted_dir" "$INSTALL_PATH"
        else
            log_error "解压后未找到目录"
            return 1
        fi
    fi
    
    # 确保 pnpm 可用 (通过 Corepack)
    if ! command -v pnpm &> /dev/null; then
        log_info "pnpm 未找到，启用 Corepack..."
        
        # 尝试启用 Corepack
        if command -v corepack &> /dev/null; then
            sudo corepack enable 2>/dev/null || corepack enable 2>/dev/null || true
            
            # 再次检查
            if ! command -v pnpm &> /dev/null; then
                log_warn "Corepack 已启用，但 pnpm 不可用"
                log_warn "尝试通过 npm 安装 pnpm 作为备用方案..."
                npm install -g pnpm@10.12.1
            fi
        else
            log_error "未找到 Corepack，且无法使用 pnpm"
            log_error "请确保 Node.js 22 已正确安装"
            return 1
        fi
    fi
    
    # 检查 pnpm 版本
    if command -v pnpm &> /dev/null; then
        local pnpm_ver=$(pnpm -v 2>/dev/null || echo "unknown")
        log_success "pnpm 版本: $pnpm_ver"
        
        # 如果版本过低，尝试更新
        if [ "$pnpm_ver" != "unknown" ]; then
            local pnpm_major=$(echo "$pnpm_ver" | cut -d. -f1)
            if [ "$pnpm_major" -lt 9 ]; then
                log_warn "pnpm 版本过低 ($pnpm_ver)，尝试更新..."
                npm install -g pnpm@10.12.1 || true
            fi
        fi
    else
        log_error "pnpm 不可用，无法继续"
        return 1
    fi
    
    # 安装依赖
    log_info "安装 NewFlow 依赖 (pnpm install)..."
    cd "$INSTALL_PATH"
    
    if pnpm install; then
        log_success "依赖安装完成"
    else
        log_error "依赖安装失败"
        cd ..
        return 1
    fi
    
    # 构建 (如果有 build 脚本)
    if grep -q "\"build\":" package.json; then
        log_info "构建 NewFlow (pnpm build)..."
        if pnpm build; then
            log_success "构建完成"
        else
            log_error "构建失败"
            cd ..
            return 1
        fi
    else
        log_info "无构建步骤，跳过"
    fi
    
    cd ..
    
    log_success "NewFlow 安装完成"
    mark_step_completed "$STEP_ID"
    return 0
}

if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step "$@"
fi

