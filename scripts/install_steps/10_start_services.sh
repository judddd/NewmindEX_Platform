#!/bin/bash

# 安装步骤 09: 启动所有服务
# 启动Docker容器和Python Dashboard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="09_start_services"

# ==================== 主函数 ====================

run_step() {
    log_info "开始启动所有服务..."
    mark_step_in_progress "$STEP_ID"
    
    # 确保Docker运行
    if ! check_docker_running; then
        log_error "Docker 未运行"
        mark_step_failed "$STEP_ID" "Docker未运行"
        return 1
    fi
    
    # 启动Docker服务
    if ! start_docker_services; then
        log_error "Docker服务启动失败"
        mark_step_failed "$STEP_ID" "Docker服务启动失败"
        return 1
    fi
    
    # 启动Python Dashboard
    if ! start_dashboard; then
        log_warn "Dashboard启动失败（可手动启动）"
    fi
    
    # 初始化MCP实例
    if ! init_mcp_instances; then
        log_warn "MCP实例初始化失败（可在Dashboard中手动创建）"
    fi
    
    if verify_step; then
        mark_step_completed "$STEP_ID"
        return 0
    else
        log_warn "部分服务可能未正常启动"
        mark_step_completed "$STEP_ID"
        return 0
    fi
}

# 启动Docker服务
start_docker_services() {
    log_info "启动 Docker 服务..."
    
    # 调用现有的启动脚本
    if bash "scripts/07_start_docker_services.sh" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Docker 服务启动成功"
        return 0
    else
        log_error "Docker 服务启动失败"
        return 1
    fi
}

# 启动Dashboard
start_dashboard() {
    log_info "启动 Python Dashboard..."
    
    cd python_dashboard
    
    # 检查并停止旧进程
    if [ -f dashboard.pid ]; then
        local old_pid=$(cat dashboard.pid)
        if ps -p $old_pid > /dev/null 2>&1; then
            log_info "停止旧的Dashboard进程 (PID: $old_pid)..."
            kill $old_pid || true
            sleep 2
        fi
        rm -f dashboard.pid
    fi
    
    # 激活虚拟环境
    if [ ! -f ".venv/bin/activate" ]; then
        log_error "虚拟环境不存在"
        cd ..
        return 1
    fi
    
    source .venv/bin/activate
    
    # 加载环境变量
    set -a
    source ../.env 2>/dev/null || true
    set +a
    
    # 启动Dashboard
    local port=${DASHBOARD_PORT:-8000}
    log_info "在端口 $port 启动Dashboard..."
    
    nohup uvicorn main:app --host 0.0.0.0 --port $port > dashboard.log 2>&1 &
    local pid=$!
    echo $pid > dashboard.pid
    
    # 等待启动
    sleep 3
    
    if ps -p $pid > /dev/null 2>&1; then
        log_success "Dashboard 已启动 (PID: $pid)"
        log_info "访问地址: http://localhost:$port"
        cd ..
        return 0
    else
        log_error "Dashboard 启动失败"
        cat dashboard.log | tail -20
        cd ..
        return 1
    fi
}

# 初始化MCP实例
init_mcp_instances() {
    log_info "初始化 MCP 实例..."
    
    # 等待Dashboard启动
    sleep 5
    
    # 调用现有的初始化脚本
    if bash "scripts/11_init_default_mcp_instances.sh" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "MCP 实例初始化完成"
        return 0
    else
        log_warn "MCP 实例初始化失败"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证服务状态..."
    echo ""
    
    local all_ok=true
    
    # 检查Docker容器
    echo -e "${CYAN}Docker 容器状态:${NC}"
    
    for container in elasticsearch kibana newflow; do
        if docker ps --format "{{.Names}}" | grep -q "$container"; then
            log_success "  ✓ $container"
        else
            log_warn "  ✗ $container 未运行"
            all_ok=false
        fi
    done
    
    echo ""
    
    # 检查Dashboard
    echo -e "${CYAN}Dashboard 状态:${NC}"
    if [ -f "python_dashboard/dashboard.pid" ]; then
        local pid=$(cat python_dashboard/dashboard.pid)
        if ps -p $pid > /dev/null 2>&1; then
            log_success "  ✓ Dashboard 运行中 (PID: $pid)"
        else
            log_warn "  ✗ Dashboard 进程不存在"
            all_ok=false
        fi
    else
        log_warn "  ✗ Dashboard PID文件不存在"
        all_ok=false
    fi
    
    echo ""
    
    # 检查端口
    echo -e "${CYAN}端口监听状态:${NC}"
    
    for port_info in "9200:Elasticsearch" "5601:Kibana" "5677:NewFlow" "8000:Dashboard"; do
        local port=$(echo $port_info | cut -d: -f1)
        local service=$(echo $port_info | cut -d: -f2)
        
        if lsof -i :$port > /dev/null 2>&1; then
            log_success "  ✓ $service (:$port)"
        else
            log_warn "  ✗ $service (:$port) 未监听"
            all_ok=false
        fi
    done
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        log_warn "部分服务未正常启动"
        return 1
    fi
    
    log_success "所有服务运行正常 ✓"
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

