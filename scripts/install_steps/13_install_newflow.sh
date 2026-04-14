#!/bin/bash

# 安装 NewFlow
# 前提：newflow-main/ 已通过 scripts/clone_modules.sh 从 GitHub 克隆

set -e

# 兼容 Homebrew (Apple Silicon) 和系统安装
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
unset NVM_DIR NVM_BIN NVM_INC

# 如果 log_info 未定义，定义简单的 fallback
if ! command -v log_info &> /dev/null; then
    log_info() { echo "ℹ️  $1"; }
    log_warn() { echo "⚠️  $1"; }
    log_error() { echo "❌ $1"; }
    log_success() { echo "✅ $1"; }
fi

run_step() {
    local force_install=$1
    local PROJECT_ROOT
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    local INSTALL_PATH="$PROJECT_ROOT/newflow-main"

    log_info "开始安装 NewFlow 模块..."

    # 0. 目录必须已存在（由 clone_modules.sh 克隆）
    if [ ! -d "$INSTALL_PATH" ]; then
        log_error "NewFlow 目录不存在: $INSTALL_PATH"
        log_error "请先运行: bash scripts/clone_modules.sh"
        return 1
    fi

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，无法安装 NewFlow"
        return 1
    fi

    local node_ver=$(node -v)
    log_info "Node.js 版本: $node_ver (建议 v22+)"

    # 检查是否已安装
    if [ -d "$INSTALL_PATH/node_modules" ] && [ "$force_install" != "true" ]; then
        log_success "NewFlow 依赖已安装，跳过"
        # 仍然同步模板
        sync_workflow_templates "$PROJECT_ROOT" "$INSTALL_PATH"
        return 0
    fi

    # 确保 pnpm 可用
    if ! command -v pnpm &> /dev/null; then
        log_info "pnpm 未找到，启用 Corepack..."
        if command -v corepack &> /dev/null; then
            sudo corepack enable 2>/dev/null || corepack enable 2>/dev/null || true
            if ! command -v pnpm &> /dev/null; then
                log_warn "Corepack 已启用，但 pnpm 不可用，尝试 npm 安装..."
                npm install -g pnpm@10.12.1
            fi
        else
            log_error "未找到 Corepack，且无法使用 pnpm"
            return 1
        fi
    fi

    if command -v pnpm &> /dev/null; then
        local pnpm_ver=$(pnpm -v 2>/dev/null || echo "unknown")
        log_success "pnpm 版本: $pnpm_ver"
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
        cd "$PROJECT_ROOT"
        return 1
    fi

    # 构建
    if grep -q "\"build\":" package.json; then
        log_info "构建 NewFlow (pnpm build)..."
        if pnpm build; then
            log_success "构建完成"
        else
            log_error "构建失败"
            cd "$PROJECT_ROOT"
            return 1
        fi
    fi

    cd "$PROJECT_ROOT"

    # 同步工作流模板
    sync_workflow_templates "$PROJECT_ROOT" "$INSTALL_PATH"

    log_success "NewFlow 安装完成"
    return 0
}

sync_workflow_templates() {
    local project_root=$1
    local install_path=$2
    local CONF_SRC="$project_root/workflow_conf"
    local CONF_DEST="$install_path/workflow_template"

    if [ -d "$CONF_SRC" ]; then
        log_info "同步工作流模板..."
        mkdir -p "$CONF_DEST"
        cp -R "$CONF_SRC/"* "$CONF_DEST/" 2>/dev/null || true
        log_success "工作流模板已同步"
    else
        log_warn "未找到 workflow_conf 目录，跳过模板同步"
    fi
}

if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step "$@"
fi
