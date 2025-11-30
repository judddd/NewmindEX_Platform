#!/usr/bin/env bash
#
# Newflow 启动后检查脚本
# 功能：等待 Newflow 初始化完成，然后自动禁用 AUTO_SETUP
#
# 使用场景：
# - 在 Newflow 容器启动后运行
# - 检测初始化是否完成（用户和 API Key 已创建）
# - 自动禁用 AUTO_SETUP 并创建标记文件
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

# 配置
MAX_WAIT_TIME=300  # 最大等待时间（秒）
CHECK_INTERVAL=5   # 检查间隔（秒）

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

# 检查 Newflow 容器是否运行
is_newflow_running() {
    docker ps --filter "name=newflow" --filter "status=running" --format "{{.Names}}" | grep -q "^newflow$"
}

# 检查数据库是否已初始化
is_database_initialized() {
    if [[ ! -f "${DB_FILE}" ]]; then
        return 1
    fi
    
    # 检查用户表
    local user_count
    user_count=$(sqlite3 "${DB_FILE}" "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "0")
    
    if [[ "${user_count}" -gt 0 ]]; then
        # 检查 API Key 表
        local apikey_count
        apikey_count=$(sqlite3 "${DB_FILE}" "SELECT COUNT(*) FROM user_api_keys;" 2>/dev/null || echo "0")
        
        if [[ "${apikey_count}" -gt 0 ]]; then
            return 0  # 完全初始化
        fi
    fi
    
    return 1
}

# 检查 Newflow API 是否可访问
is_api_ready() {
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/ 2>/dev/null || echo "000")
    
    if [[ "${response}" == "200" ]] || [[ "${response}" == "302" ]]; then
        return 0
    fi
    
    return 1
}

# 更新 .env 中的 AUTO_SETUP 配置
update_auto_setup() {
    local new_value="$1"
    
    if grep -q "^NEWFLOW_AUTO_SETUP_ENABLED=" "${ENV_FILE}"; then
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "s/^NEWFLOW_AUTO_SETUP_ENABLED=.*/NEWFLOW_AUTO_SETUP_ENABLED=${new_value}/" "${ENV_FILE}"
        else
            sed -i "s/^NEWFLOW_AUTO_SETUP_ENABLED=.*/NEWFLOW_AUTO_SETUP_ENABLED=${new_value}/" "${ENV_FILE}"
        fi
    else
        echo "NEWFLOW_AUTO_SETUP_ENABLED=${new_value}" >> "${ENV_FILE}"
    fi
}

# 创建初始化标记
create_init_marker() {
    mkdir -p "${NEWFLOW_DATA_DIR}"
    cat > "${INIT_MARKER}" <<EOF
# Newflow 初始化标记文件
# 此文件表示 Newflow 已完成首次初始化
# 创建时间: $(date -Iseconds)
# 
# 初始化信息:
# - 用户已创建
# - API Key 已生成
# - AUTO_SETUP 已禁用
#
# 如需重新初始化 Newflow，请：
# 1. 停止 Newflow 容器: docker stop newflow
# 2. 删除此文件: rm ${INIT_MARKER}
# 3. 删除数据库: rm ${DB_FILE}*
# 4. 重启容器: docker-compose up -d newflow
EOF
}

# 获取数据库信息
get_db_info() {
    if [[ ! -f "${DB_FILE}" ]]; then
        echo "  数据库: 不存在"
        return
    fi
    
    local user_email
    local api_key_count
    
    user_email=$(sqlite3 "${DB_FILE}" "SELECT email FROM user LIMIT 1;" 2>/dev/null || echo "未知")
    api_key_count=$(sqlite3 "${DB_FILE}" "SELECT COUNT(*) FROM user_api_keys;" 2>/dev/null || echo "0")
    
    echo "  管理员邮箱: ${user_email}"
    echo "  API Key 数量: ${api_key_count}"
}

# 主逻辑
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║         Newflow 启动后自动配置                                  ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # 检查容器是否运行
    if ! is_newflow_running; then
        log_error "Newflow 容器未运行，请先启动容器"
        exit 1
    fi
    
    log_info "等待 Newflow 初始化完成..."
    
    local elapsed=0
    local initialized=false
    
    # 等待初始化完成
    while [[ ${elapsed} -lt ${MAX_WAIT_TIME} ]]; do
        if is_database_initialized && is_api_ready; then
            initialized=true
            break
        fi
        
        echo -n "."
        sleep ${CHECK_INTERVAL}
        elapsed=$((elapsed + CHECK_INTERVAL))
    done
    
    echo ""
    
    if [[ "${initialized}" == "true" ]]; then
        log_success "Newflow 初始化完成！"
        echo ""
        
        # 显示初始化信息
        log_info "📊 初始化信息:"
        get_db_info
        echo ""
        
        # 检查是否已有标记文件
        if [[ -f "${INIT_MARKER}" ]]; then
            log_info "初始化标记已存在，跳过创建"
        else
            log_info "创建初始化标记文件..."
            create_init_marker
            log_success "已创建标记: ${INIT_MARKER}"
        fi
        
        # 检查并禁用 AUTO_SETUP
        if grep -q "^NEWFLOW_AUTO_SETUP_ENABLED=true" "${ENV_FILE}"; then
            log_info "禁用 AUTO_SETUP 以防止重启冲突..."
            update_auto_setup "false"
            log_success "已禁用 AUTO_SETUP"
            echo ""
            log_warning "⚠️  配置已更新，下次重启时不会重复初始化"
        else
            log_success "AUTO_SETUP 已禁用，无需操作"
        fi
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_success "✅ Newflow 已就绪，可以正常使用"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        log_info "🌐 访问地址: http://localhost:5678"
        
    else
        log_error "等待超时（${MAX_WAIT_TIME}秒），初始化可能失败"
        echo ""
        log_info "请检查日志："
        echo "  docker logs newflow"
        exit 1
    fi
}

main "$@"

