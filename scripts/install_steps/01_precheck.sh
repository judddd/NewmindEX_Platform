#!/bin/bash

# 安装步骤 01: 系统预检查
# 验证系统环境是否满足安装要求

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

# 步骤ID
STEP_ID="01_precheck"

# ==================== 主函数 ====================

run_step() {
    log_info "开始系统预检查..."
    mark_step_in_progress "$STEP_ID"
    
    # 显示系统信息摘要
    show_system_summary
    
    # 运行所有检查
    if ! run_all_checks; then
        log_error "系统预检查未通过"
        mark_step_failed "$STEP_ID" "预检查未通过"
        return 1
    fi
    
    # 显示安装计划
    show_installation_plan
    
    # 最后确认
    echo ""
    log_info "预检查完成，准备开始安装"
    if ! ask_proceed "确认系统信息无误，开始安装"; then
        log_warn "用户取消安装"
        return 1
    fi
    
    mark_step_completed "$STEP_ID"
    return 0
}

# 验证步骤
verify_step() {
    log_info "验证预检查结果..."
    
    # 基本验证
    if ! check_macos_version; then
        return 1
    fi
    
    if ! check_architecture; then
        return 1
    fi
    
    log_success "预检查验证通过"
    return 0
}

# 显示安装计划
show_installation_plan() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                   安装计划概览                         ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} 将安装以下组件:                                    "
    echo -e "${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}1.${NC} Docker Desktop"
    echo -e "${BLUE}║${NC}   ${GREEN}2.${NC} Node.js 20.18.1 + UV"
    echo -e "${BLUE}║${NC}   ${GREEN}3.${NC} LM Studio"
    echo -e "${BLUE}║${NC}   ${GREEN}4.${NC} NewChat"
    echo -e "${BLUE}║${NC}   ${GREEN}5.${NC} AI模型 (4个，约135GB)"
    echo -e "${BLUE}║${NC}   ${GREEN}6.${NC} Docker镜像 (ES, Kibana, NewFlow, MCP)"
    echo -e "${BLUE}║${NC}   ${GREEN}7.${NC} Python环境和依赖"
    echo -e "${BLUE}║${NC}   ${GREEN}8.${NC} 启动所有服务"
    echo -e "${BLUE}║${NC}"
    echo -e "${BLUE}║${NC} ${YELLOW}预计安装时间: 15-25分钟${NC}"
    echo -e "${BLUE}║${NC} ${YELLOW}所需磁盘空间: ~200GB${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

