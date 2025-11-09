#!/bin/bash

# NewMind AI Platform - 安装状态管理库
# 提供安装状态的保存、加载、查询功能

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# 状态文件路径
STATE_FILE=".install_state"

# ==================== 状态管理 ====================

# 初始化状态文件
init_state() {
    log_debug "初始化安装状态文件: $STATE_FILE"
    
    local start_time=$(date '+%Y-%m-%d %H:%M:%S')
    cat > "$STATE_FILE" << EOF
# NewMind AI Platform 安装状态
# 版本: 1.0
# 请勿手动编辑此文件

INSTALL_VERSION=1.0
STARTED_AT="$start_time"
COMPLETED_STEPS=
CURRENT_STEP=
FAILED_STEP=
INSTALL_MODE=offline
EOF
    
    log_debug "状态文件已初始化"
}

# 加载状态文件
load_state() {
    if [ ! -f "$STATE_FILE" ]; then
        log_debug "状态文件不存在，初始化新状态"
        init_state
        return 1
    fi
    
    log_debug "加载状态文件: $STATE_FILE"
    source "$STATE_FILE"
    return 0
}

# 保存状态变量
save_state_var() {
    local var_name=$1
    local var_value=$2
    
    if [ ! -f "$STATE_FILE" ]; then
        init_state
    fi
    
    # 使用sed更新变量值（兼容macOS）
    if grep -q "^${var_name}=" "$STATE_FILE"; then
        # 变量存在，更新它
        sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" "$STATE_FILE"
    else
        # 变量不存在，添加它
        echo "${var_name}=${var_value}" >> "$STATE_FILE"
    fi
    
    log_debug "保存状态: ${var_name}=${var_value}"
}

# 读取状态变量
get_state_var() {
    local var_name=$1
    
    if [ ! -f "$STATE_FILE" ]; then
        echo ""
        return 1
    fi
    
    grep "^${var_name}=" "$STATE_FILE" | cut -d= -f2-
}

# ==================== 步骤管理 ====================

# 标记步骤为完成
mark_step_completed() {
    local step_id=$1
    
    load_state
    
    # 从完成列表中移除（如果存在）
    COMPLETED_STEPS=$(echo "$COMPLETED_STEPS" | tr ',' '\n' | grep -v "^${step_id}$" | tr '\n' ',')
    
    # 添加到完成列表
    if [ -z "$COMPLETED_STEPS" ]; then
        COMPLETED_STEPS="$step_id"
    else
        COMPLETED_STEPS="${COMPLETED_STEPS%,},$step_id"
    fi
    
    save_state_var "COMPLETED_STEPS" "$COMPLETED_STEPS"
    save_state_var "CURRENT_STEP" ""
    save_state_var "FAILED_STEP" ""
    
    log_debug "步骤 $step_id 标记为完成"
}

# 标记步骤为进行中
mark_step_in_progress() {
    local step_id=$1
    
    save_state_var "CURRENT_STEP" "$step_id"
    save_state_var "FAILED_STEP" ""
    
    log_debug "步骤 $step_id 标记为进行中"
}

# 标记步骤为失败
mark_step_failed() {
    local step_id=$1
    local error_msg="${2:-未知错误}"
    local failed_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    save_state_var "FAILED_STEP" "$step_id"
    save_state_var "FAILED_MESSAGE" "\"$error_msg\""
    save_state_var "FAILED_AT" "\"$failed_time\""
    
    log_debug "步骤 $step_id 标记为失败: $error_msg"
}

# 检查步骤是否已完成
is_step_completed() {
    local step_id=$1
    
    load_state
    
    if [ -z "$COMPLETED_STEPS" ]; then
        return 1
    fi
    
    echo "$COMPLETED_STEPS" | tr ',' '\n' | grep -q "^${step_id}$"
    return $?
}

# 获取已完成的步骤列表
get_completed_steps() {
    load_state
    echo "$COMPLETED_STEPS" | tr ',' '\n' | grep -v '^$'
}

# 获取已完成步骤数
get_completed_count() {
    get_completed_steps | wc -l | tr -d ' '
}

# ==================== 安装状态查询 ====================

# 检查是否有未完成的安装
has_incomplete_installation() {
    if [ ! -f "$STATE_FILE" ]; then
        return 1
    fi
    
    load_state
    
    # 如果有已完成的步骤，说明安装已开始
    if [ -n "$COMPLETED_STEPS" ]; then
        return 0
    fi
    
    return 1
}

# 获取安装进度百分比
get_install_progress() {
    local total_steps=${1:-10}
    local completed=$(get_completed_count)
    
    if [ $completed -eq 0 ]; then
        echo "0"
    else
        echo $((completed * 100 / total_steps))
    fi
}

# 显示安装状态摘要
show_state_summary() {
    if [ ! -f "$STATE_FILE" ]; then
        log_info "未发现安装状态"
        return
    fi
    
    load_state
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         安装状态摘要                   ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} 开始时间: ${STARTED_AT}"
    echo -e "${BLUE}║${NC} 当前步骤: ${CURRENT_STEP:-无}"
    
    if [ -n "$COMPLETED_STEPS" ]; then
        local count=$(get_completed_count)
        echo -e "${BLUE}║${NC} 已完成步骤: $count"
        echo -e "${BLUE}║${NC}"
        echo -e "${BLUE}║${NC} 完成列表:"
        for step in $(get_completed_steps); do
            echo -e "${BLUE}║${NC}   ${GREEN}✓${NC} $step"
        done
    else
        echo -e "${BLUE}║${NC} 已完成步骤: 0"
    fi
    
    if [ -n "$FAILED_STEP" ]; then
        echo -e "${BLUE}║${NC}"
        echo -e "${BLUE}║${NC} ${RED}失败步骤: $FAILED_STEP${NC}"
        if [ -n "$FAILED_MESSAGE" ]; then
            echo -e "${BLUE}║${NC} ${RED}失败原因: $FAILED_MESSAGE${NC}"
        fi
    fi
    
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

# ==================== 状态清理 ====================

# 清除安装状态
clear_state() {
    if [ -f "$STATE_FILE" ]; then
        log_info "清除安装状态"
        rm -f "$STATE_FILE"
    fi
}

# 重置失败状态
reset_failed_state() {
    save_state_var "FAILED_STEP" ""
    save_state_var "FAILED_MESSAGE" ""
    save_state_var "FAILED_AT" ""
    log_debug "失败状态已重置"
}

# ==================== 恢复询问 ====================

# 询问是否恢复之前的安装
ask_resume_or_fresh() {
    if [ ! -f "$STATE_FILE" ]; then
        return 0
    fi
    
    show_state_summary
    
    local completed_count=$(get_completed_count)
    
    if [ $completed_count -eq 0 ]; then
        log_warn "检测到未完成的安装准备"
        if ask_proceed "是否继续"; then
            return 0
        else
            clear_state
            log_info "已清除状态，将进行全新安装"
            return 0
        fi
    fi
    
    log_warn "检测到未完成的安装 (已完成 $completed_count 步)"
    
    while true; do
        echo -ne "${YELLOW}选择操作: [R(恢复)/F(全新安装)/A(中止)] ${NC}"
        read -r response
        
        # 转换为小写（兼容旧版bash）
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
        
        case "$response" in
            r|resume|"")
                log_info "恢复之前的安装"
                return 0
                ;;
            f|fresh)
                log_info "清除状态，开始全新安装"
                clear_state
                return 0
                ;;
            a|abort)
                log_error "用户中止安装"
                exit 1
                ;;
            *)
                echo -e "${RED}无效输入，请输入 R/F/A${NC}"
                ;;
        esac
    done
}

# ==================== 安装完成标记 ====================

# 标记安装完成
mark_installation_complete() {
    local complete_time=$(date '+%Y-%m-%d %H:%M:%S')
    save_state_var "COMPLETED_AT" "\"$complete_time\""
    save_state_var "INSTALL_STATUS" "completed"
    
    log_success "安装已标记为完成"
}

# 检查安装是否完成
is_installation_complete() {
    local status=$(get_state_var "INSTALL_STATUS")
    [ "$status" = "completed" ]
}

