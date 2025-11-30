#!/bin/bash

# NewMind AI Platform - 通用工具函数库
# 提供日志、进度显示、格式化输出等通用功能

# ==================== 颜色定义 ====================
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export MAGENTA='\033[0;35m'
export WHITE='\033[1;37m'
export NC='\033[0m' # No Color

# ==================== 日志函数 ====================

# 获取时间戳
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 日志文件路径 (使用绝对路径)
LOG_FILE="${LOG_FILE:-$PROJECT_ROOT/logs/install-$(date +%Y%m%d-%H%M%S).log}"

# 初始化日志文件
init_log() {
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "==================================" > "$LOG_FILE"
    echo "NewMind AI Platform 安装日志" >> "$LOG_FILE"
    echo "开始时间: $(get_timestamp)" >> "$LOG_FILE"
    echo "==================================" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# 写入日志（同时输出到终端和文件）
write_log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(get_timestamp)
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# INFO级别日志
log_info() {
    local message="$@"
    echo -e "${BLUE}ℹ️  ${message}${NC}"
    write_log "INFO" "$message"
}

# SUCCESS级别日志
log_success() {
    local message="$@"
    echo -e "${GREEN}✅ ${message}${NC}"
    write_log "SUCCESS" "$message"
}

# WARNING级别日志
log_warn() {
    local message="$@"
    echo -e "${YELLOW}⚠️  ${message}${NC}"
    write_log "WARN" "$message"
}

# ERROR级别日志
log_error() {
    local message="$@"
    echo -e "${RED}❌ ${message}${NC}"
    write_log "ERROR" "$message"
}

# DEBUG级别日志（仅在VERBOSE模式下显示）
log_debug() {
    local message="$@"
    write_log "DEBUG" "$message"
    if [ "$VERBOSE" = "true" ]; then
        echo -e "${CYAN}🔍 [DEBUG] ${message}${NC}"
    fi
}

# ==================== 进度显示 ====================

# 显示进度条
# 参数: 当前值 总值 标签
show_progress() {
    local current=$1
    local total=$2
    local label="${3:-进度}"
    
    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    local empty=$((20 - filled))
    
    printf "\r${BLUE}${label}: [${NC}"
    printf "%${filled}s" | tr ' ' '▓'
    printf "%${empty}s" | tr ' ' '░'
    printf "${BLUE}] %3d%%${NC}" "$percent"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

# 显示旋转器（用于长时间操作）
show_spinner() {
    local pid=$1
    local message="${2:-处理中}"
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    while ps -p $pid > /dev/null 2>&1; do
        local temp=${spinstr#?}
        printf "\r${CYAN}%c ${message}...${NC}" "$spinstr"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r%*s\r" $(( ${#message} + 10 )) ""
}

# ==================== 格式化输出 ====================

# 显示欢迎横幅
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     NewMind AI Platform - 离线安装系统 v1.0                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# 显示步骤标题
# 参数: 步骤编号 步骤名称
show_step_header() {
    local step_num=$1
    local step_name=$2
    local total_steps=${TOTAL_STEPS:-10}
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  步骤 ${step_num}/${total_steps}: ${step_name}$(printf '%*s' $((53 - ${#step_num} - ${#total_steps} - ${#step_name})) '')║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 显示分隔线
show_separator() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

# ==================== 用户交互 ====================

# 询问用户是否继续
# 参数: 提示信息
# 返回: 0=继续, 1=跳过, 2=中止
ask_proceed() {
    local prompt="${1:-是否继续}"
    
    while true; do
        echo -ne "${YELLOW}${prompt}? [Y/n/s(跳过)/a(中止)] ${NC}"
        read -r response
        
        # 转换为小写（兼容旧版bash）
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
        
        case "$response" in
            y|yes|"")
                return 0
                ;;
            n|no)
                return 1
                ;;
            s|skip)
                log_warn "用户选择跳过此步骤"
                return 1
                ;;
            a|abort)
                log_error "用户中止安装"
                return 2
                ;;
            *)
                echo -e "${RED}无效输入，请输入 Y/n/s/a${NC}"
                ;;
        esac
    done
}

# 询问是否重试、跳过或中止
ask_retry_skip_abort() {
    while true; do
        echo -ne "${YELLOW}选择操作: [R(重试)/S(跳过)/A(中止)] ${NC}"
        read -r response
        
        # 转换为小写（兼容旧版bash）
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
        
        case "$response" in
            r|retry)
                return 0
                ;;
            s|skip)
                log_warn "跳过失败的步骤"
                return 1
                ;;
            a|abort)
                log_error "用户中止安装"
                exit 1
                ;;
            *)
                echo -e "${RED}无效输入，请输入 R/S/A${NC}"
                ;;
        esac
    done
}

# ==================== 系统信息 ====================

# 获取可读的文件大小
human_readable_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size}B"
    elif [ $size -lt $((1024 * 1024)) ]; then
        echo "$((size / 1024))KB"
    elif [ $size -lt $((1024 * 1024 * 1024)) ]; then
        echo "$((size / 1024 / 1024))MB"
    else
        echo "$((size / 1024 / 1024 / 1024))GB"
    fi
}

# 获取磁盘可用空间（GB）
get_available_space() {
    local path="${1:-.}"
    df -g "$path" | awk 'NR==2 {print $4}'
}

# 获取系统内存大小（GB）
get_total_memory() {
    local mem_bytes=$(sysctl -n hw.memsize)
    echo $((mem_bytes / 1024 / 1024 / 1024))
}

# ==================== 时间估算 ====================

# 记录开始时间
start_timer() {
    export TIMER_START=$(date +%s)
}

# 获取已用时间（秒）
get_elapsed_time() {
    local current=$(date +%s)
    echo $((current - TIMER_START))
}

# 格式化时间（秒 -> 可读格式）
format_time() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    
    if [ $hours -gt 0 ]; then
        printf "%dh %dm %ds" $hours $minutes $secs
    elif [ $minutes -gt 0 ]; then
        printf "%dm %ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}

# 估算剩余时间
# 参数: 当前进度 总进度
estimate_remaining_time() {
    local current=$1
    local total=$2
    
    if [ $current -eq 0 ]; then
        echo "计算中..."
        return
    fi
    
    local elapsed=$(get_elapsed_time)
    local rate=$((elapsed / current))
    local remaining=$((rate * (total - current)))
    
    format_time $remaining
}

# ==================== 错误处理 ====================

# 显示错误帮助信息
show_error_help() {
    local step_id=$1
    
    echo ""
    echo -e "${YELLOW}══════════════ 故障排除 ══════════════${NC}"
    echo -e "${YELLOW}错误码: E${step_id}${NC}"
    echo -e "${YELLOW}日志文件: ${LOG_FILE}${NC}"
    echo ""
    echo -e "${CYAN}建议操作:${NC}"
    echo -e "  1. 查看详细日志: ${WHITE}tail -50 ${LOG_FILE}${NC}"
    echo -e "  2. 重试此步骤: ${WHITE}选择 R (重试)${NC}"
    echo -e "  3. 跳过此步骤: ${WHITE}选择 S (跳过)${NC}"
    echo -e "  4. 中止安装: ${WHITE}选择 A (中止)${NC}"
    echo ""
}

# ==================== 初始化 ====================

# 如果LOG_FILE未设置，初始化日志
if [ ! -f "$LOG_FILE" ]; then
    init_log
fi

