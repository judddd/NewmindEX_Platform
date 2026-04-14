#!/bin/bash

# NewMind AI Platform - 主安装脚本
# 版本: 1.0
# 用途: 在全新Mac上离线安装整个平台

set -e

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载库函数
source scripts/lib/utils.sh
source scripts/lib/checks.sh
source scripts/lib/state.sh

# 总步骤数
    export TOTAL_STEPS=12
    
    # ==================== 主函数 ====================

main() {
    # 显示欢迎界面
    show_banner
    
    log_info "NewMind AI Platform 离线安装系统"
    log_info "版本: 1.0"
    echo ""
    
    # 检查是否有未完成的安装
    if has_incomplete_installation; then
        ask_resume_or_fresh
    else
        log_info "开始全新安装"
        init_state
    fi
    
    # 定义安装步骤
    local steps=(
        "01_precheck:系统预检查"
        "02_install_python:安装Python 3.11"
        "03_install_docker:安装Docker Desktop"
        "04_install_nodejs_uv:安装Node.js和UV"
        "05_install_lmstudio:安装LM Studio"
        "05b_install_libreoffice:安装LibreOffice"
        "06_install_newchat:安装NewChat"
        "07_copy_models:复制AI模型(135GB)"
        "08_load_docker_images:加载Docker镜像"
        "09_setup_python_env:配置Python环境"
        "10_start_services:启动所有服务"
        "11_verify_installation:验证安装"
    )
    
    # 开始计时
    start_timer
    
    # 逐步执行
    local step_num=0
    for step in "${steps[@]}"; do
        step_num=$((step_num + 1))
        
        local step_id="${step%%:*}"
        local step_name="${step##*:}"
        
        # 检查是否已完成
        if is_step_completed "$step_id"; then
            log_info "步骤 $step_num/$TOTAL_STEPS: $step_name - 已完成，跳过"
            continue
        fi
        
        # 显示步骤标题
        show_step_header "$step_num" "$step_name"
        
        # 询问是否执行（半自动模式）
        if ! ask_proceed "执行此步骤"; then
            local proceed_code=$?
            if [ $proceed_code -eq 2 ]; then
                # 用户选择中止
                log_error "安装已中止"
                exit 1
            else
                # 用户选择跳过
                log_warn "跳过步骤: $step_name"
                continue
            fi
        fi
        
        # 执行步骤
        if source "scripts/install_steps/${step_id}.sh" && run_step; then
            log_success "步骤 $step_num/$TOTAL_STEPS: $step_name - 完成"
        else
            log_error "步骤 $step_num/$TOTAL_STEPS: $step_name - 失败"
            show_error_help "$step_id"
            
            # 询问重试、跳过或中止
            if ask_retry_skip_abort; then
                # 重试
                log_info "重试步骤: $step_name"
                if source "scripts/install_steps/${step_id}.sh" && run_step; then
                    log_success "步骤 $step_num/$TOTAL_STEPS: $step_name - 完成（重试成功）"
                else
                    log_error "步骤 $step_num/$TOTAL_STEPS: $step_name - 重试仍失败"
                    mark_step_failed "$step_id" "重试后仍失败"
                fi
            else
                # 跳过或中止（ask_retry_skip_abort会处理中止）
                log_warn "跳过失败的步骤: $step_name"
                mark_step_failed "$step_id" "用户选择跳过"
            fi
        fi
    done
    
    # 显示完成摘要
    show_installation_summary
    
    # 打开Dashboard
    open_dashboard
}

# 显示安装完成摘要
show_installation_summary() {
    local elapsed=$(get_elapsed_time)
    local elapsed_formatted=$(format_time $elapsed)
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║              ✅ 安装流程已完成！                               ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "总耗时: $elapsed_formatted"
    echo ""
    
    # 显示已完成的步骤
    local completed_count=$(get_completed_count)
    log_info "已完成步骤: $completed_count / $TOTAL_STEPS"
    echo ""
    
    # 显示服务地址
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    服务访问地址                                ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} 📊 管理控制台:     http://localhost:8000"
    echo -e "${BLUE}║${NC} 🔍 Elasticsearch:  http://localhost:9200"
    echo -e "${BLUE}║${NC} 📈 Kibana:         http://localhost:5601"
    echo -e "${BLUE}║${NC} 🔄 NewFlow:        http://localhost:5678"
    echo -e "${BLUE}║${NC} 🤖 LM Studio:      http://localhost:1234"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # 显示默认凭据
    echo -e "${YELLOW}🔐 默认凭据:${NC}"
    echo -e "   Elasticsearch/Kibana: ${WHITE}elastic / changeme123${NC}"
    echo ""
    
    # 显示下一步操作
    echo -e "${CYAN}📝 下一步操作:${NC}"
    echo -e "   1. 打开浏览器访问 ${WHITE}http://localhost:8000${NC}"
    echo -e "   2. 启动 LM Studio 并加载模型"
    echo -e "   3. 启动 NewChat 应用"
    echo -e "   4. 在Dashboard中管理MCP服务器"
    echo ""
    echo -e "${CYAN}📦 安装 NewRAG / NewFlow（独立模块，需单独安装）:${NC}"
    echo -e "   ${WHITE}bash scripts/clone_modules.sh${NC}"
    echo -e "   ${WHITE}bash scripts/install_steps/12_install_newrag.sh${NC}"
    echo -e "   ${WHITE}bash scripts/install_steps/13_install_newflow.sh${NC}"
    echo ""
    
    # 显示有用命令
    echo -e "${CYAN}💡 常用命令:${NC}"
    echo -e "   • 查看服务状态:  ${WHITE}bash scripts/check_services.sh${NC}"
    echo -e "   • 停止所有服务:  ${WHITE}bash scripts/stop_all.sh${NC}"
    echo -e "   • 查看日志:      ${WHITE}tail -f logs/install-*.log${NC}"
    echo -e "   • 查看Dashboard:  ${WHITE}tail -f python_dashboard/dashboard.log${NC}"
    echo ""
    
    # 检查是否所有步骤完成
    if [ "$completed_count" -eq "$TOTAL_STEPS" ]; then
        log_success "🎉 所有步骤已完成！系统已就绪！"
    else
        log_warn "部分步骤未完成，系统可能需要手动配置"
        log_info "请查看日志: $LOG_FILE"
    fi
    
    echo ""
}

# 打开Dashboard
open_dashboard() {
    echo ""
    if ask_proceed "是否在浏览器中打开Dashboard"; then
        log_info "正在打开 Dashboard..."
        sleep 2
        open http://localhost:8000 2>/dev/null || {
            log_warn "自动打开失败，请手动访问: http://localhost:8000"
        }
    fi
}

# ==================== 错误处理 ====================

# 捕获错误
trap 'handle_error $? $LINENO' ERR

handle_error() {
    local exit_code=$1
    local line_number=$2
    
    log_error "安装过程中发生错误 (退出码: $exit_code, 行号: $line_number)"
    log_error "请查看日志文件: $LOG_FILE"
    
    echo ""
    log_info "您可以："
    log_info "  1. 查看详细日志: tail -50 $LOG_FILE"
    log_info "  2. 重新运行安装: ./install.sh"
    log_info "  3. 手动执行失败的步骤"
    
    exit $exit_code
}

# ==================== 启动安装 ====================

# 运行主函数
main "$@"

