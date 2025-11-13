#!/usr/bin/env bash
#
# Newflow 启动前智能检查脚本
# 功能：检测是否首次初始化，自动配置 AUTO_SETUP
#
# 使用场景：
# 1. 首次安装：AUTO_SETUP=true，自动创建用户和 API Key
# 2. 已初始化：AUTO_SETUP=false，跳过初始化避免冲突
# 3. 清空重装：检测到数据库不存在，重新启用 AUTO_SETUP
#

set -euo pipefail

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# 路径配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"
NEWFLOW_DATA_DIR="${PROJECT_ROOT}/newflow_data"
DB_FILE="${NEWFLOW_DATA_DIR}/database.sqlite"
INIT_MARKER="${NEWFLOW_DATA_DIR}/.initialized"

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*"
}

# 检查 .env 文件是否存在
check_env_file() {
    if [[ ! -f "${ENV_FILE}" ]]; then
        log_error ".env 文件不存在: ${ENV_FILE}"
        exit 1
    fi
}

# 获取当前 AUTO_SETUP 配置
get_auto_setup_status() {
    if grep -q "^NEWFLOW_AUTO_SETUP_ENABLED=" "${ENV_FILE}"; then
        grep "^NEWFLOW_AUTO_SETUP_ENABLED=" "${ENV_FILE}" | cut -d'=' -f2
    else
        echo "false"
    fi
}

# 更新 .env 中的 AUTO_SETUP 配置
update_auto_setup() {
    local new_value="$1"
    
    if grep -q "^NEWFLOW_AUTO_SETUP_ENABLED=" "${ENV_FILE}"; then
        # 使用 sed 更新现有配置（macOS 兼容）
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "s/^NEWFLOW_AUTO_SETUP_ENABLED=.*/NEWFLOW_AUTO_SETUP_ENABLED=${new_value}/" "${ENV_FILE}"
        else
            sed -i "s/^NEWFLOW_AUTO_SETUP_ENABLED=.*/NEWFLOW_AUTO_SETUP_ENABLED=${new_value}/" "${ENV_FILE}"
        fi
    else
        # 添加新配置
        echo "NEWFLOW_AUTO_SETUP_ENABLED=${new_value}" >> "${ENV_FILE}"
    fi
}

# 检查数据库是否已初始化
is_database_initialized() {
    if [[ ! -f "${DB_FILE}" ]]; then
        return 1  # 数据库不存在
    fi
    
    # 检查数据库是否有用户表和数据
    local user_count
    user_count=$(sqlite3 "${DB_FILE}" "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "0")
    
    if [[ "${user_count}" -gt 0 ]]; then
        return 0  # 已初始化
    else
        return 1  # 未初始化
    fi
}

# 检查初始化标记文件
has_init_marker() {
    [[ -f "${INIT_MARKER}" ]]
}

# 创建初始化标记
create_init_marker() {
    mkdir -p "${NEWFLOW_DATA_DIR}"
    cat > "${INIT_MARKER}" <<EOF
# Newflow 初始化标记文件
# 此文件表示 Newflow 已完成首次初始化
# 创建时间: $(date -Iseconds)
# 
# 如需重新初始化 Newflow，请：
# 1. 停止 Newflow 容器: docker stop newflow
# 2. 删除此文件: rm ${INIT_MARKER}
# 3. 删除数据库: rm ${DB_FILE}*
# 4. 重启容器: docker-compose up -d newflow
EOF
    log_success "已创建初始化标记: ${INIT_MARKER}"
}

# 主逻辑
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║         Newflow 启动前智能检查                                  ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # 检查 .env 文件
    check_env_file
    
    # 获取当前配置
    local current_auto_setup
    current_auto_setup=$(get_auto_setup_status)
    log_info "当前 AUTO_SETUP 配置: ${current_auto_setup}"
    
    # 场景判断
    if ! is_database_initialized; then
        # 场景 1 & 3: 首次安装或清空重装
        log_warning "检测到 Newflow 数据库未初始化"
        
        if [[ "${current_auto_setup}" != "true" ]]; then
            log_info "启用 AUTO_SETUP 以完成首次初始化..."
            update_auto_setup "true"
            log_success "已启用 AUTO_SETUP"
        else
            log_info "AUTO_SETUP 已启用，将进行首次初始化"
        fi
        
        echo ""
        log_info "📋 首次初始化配置:"
        grep "^NEWFLOW_AUTO_SETUP_EMAIL=" "${ENV_FILE}" || echo "  邮箱: admin@localhost.com (默认)"
        grep "^NEWFLOW_AUTO_SETUP_PASSWORD=" "${ENV_FILE}" || echo "  密码: admin123A (默认)"
        echo ""
        log_warning "⚠️  请等待 Newflow 启动完成后，此脚本将自动禁用 AUTO_SETUP"
        
    elif has_init_marker; then
        # 场景 2: 已初始化（有标记文件）
        log_success "Newflow 已完成初始化（检测到标记文件）"
        
        if [[ "${current_auto_setup}" == "true" ]]; then
            log_warning "AUTO_SETUP 仍然启用，正在禁用以避免冲突..."
            update_auto_setup "false"
            log_success "已禁用 AUTO_SETUP"
        else
            log_success "AUTO_SETUP 已禁用，配置正确"
        fi
        
    else
        # 数据库存在但没有标记文件
        log_warning "检测到数据库已初始化，但缺少标记文件"
        
        if [[ "${current_auto_setup}" == "true" ]]; then
            log_warning "禁用 AUTO_SETUP 以避免重复初始化冲突..."
            update_auto_setup "false"
            log_success "已禁用 AUTO_SETUP"
        fi
        
        # 创建标记文件
        create_init_marker
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "检查完成，Newflow 可以安全启动"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

main "$@"

