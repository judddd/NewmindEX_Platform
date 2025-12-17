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
    
    # 启动 NewRAG (本地)
    if ! start_newrag; then
        log_warn "NewRAG 启动失败"
    fi

    # 启动 NewFlow (本地)
    if ! start_newflow; then
        log_warn "NewFlow 启动失败"
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

# 启动 NewRAG
start_newrag() {
    log_info "启动 NewRAG..."
    local NEWRAG_PID_FILE="python_dashboard/newrag.pid"
    
    # 确保 uv 在 PATH 中
    export PATH="$HOME/.local/bin:$PATH"
    
    # 检查是否已运行
    if [ -f "$NEWRAG_PID_FILE" ]; then
        local pid=$(cat "$NEWRAG_PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log_success "NewRAG 已在运行 (PID: $pid)"
            return 0
        fi
        rm "$NEWRAG_PID_FILE"
    fi

    if [ ! -d "newrag-main" ]; then
        log_error "NewRAG 目录不存在"
        return 1
    fi

    cd newrag-main
    mkdir -p ../python_dashboard
    
    # 启动
    log_info "执行 uv run dev.py..."
    nohup uv run dev.py > ../python_dashboard/newrag.log 2>&1 &
    local PID=$!
    
    sleep 3
    if ps -p $PID > /dev/null 2>&1; then
        echo $PID > ../$NEWRAG_PID_FILE
        log_success "NewRAG 已启动 (PID: $PID)"
        cd ..
        return 0
    else
        log_error "NewRAG 启动失败"
        if [ -f "../python_dashboard/newrag.log" ]; then
            echo "--- 日志片段 ---"
            tail -n 5 ../python_dashboard/newrag.log
            echo "----------------"
        fi
        cd ..
        return 1
    fi
}

# 启动 NewFlow
start_newflow() {
    log_info "启动 NewFlow..."
    local NEWFLOW_PID_FILE="python_dashboard/newflow.pid"
    local LOG_FILE="../python_dashboard/newflow.log"
    local PORT=5678
    
    # 检查是否已运行
    if [ -f "$NEWFLOW_PID_FILE" ]; then
        local pid=$(cat "$NEWFLOW_PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log_success "NewFlow 已在运行 (PID: $pid)"
            return 0
        fi
        rm "$NEWFLOW_PID_FILE"
    fi

    if [ ! -d "newflow-main" ]; then
        log_error "NewFlow 目录不存在"
        return 1
    fi

    cd newflow-main
    mkdir -p ../python_dashboard
    mkdir -p data
    
    # 设置环境变量
    export PORT=$PORT
    export N8N_PORT=$PORT
    export N8N_USER_FOLDER="$(pwd)/data"
    export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
    export DB_SQLITE_POOL_SIZE=5
    
    # 启动
    log_info "执行 pnpm start..."
    # 使用 nohup 和 setsid 启动
    nohup pnpm start > "$LOG_FILE" 2>&1 &
    local INITIAL_PID=$!
    
    log_info "等待端口 $PORT 就绪..."
    local MAX_WAIT=30
    local ELAPSED=0
    local ACTUAL_PID=""
    
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        # 检查端口是否被监听
        if lsof -i :$PORT > /dev/null 2>&1; then
            # 获取监听端口的实际 PID
            ACTUAL_PID=$(lsof -t -i :$PORT | tail -1)
            break
        fi
        sleep 1
        ELAPSED=$((ELAPSED + 1))
    done
    
    if [ -n "$ACTUAL_PID" ]; then
        echo "$ACTUAL_PID" > ../$NEWFLOW_PID_FILE
        log_success "NewFlow 已启动 (PID: $ACTUAL_PID)"
        cd ..
        return 0
    elif ps -p $INITIAL_PID > /dev/null 2>&1; then
        # 端口未就绪但进程还在，可能是启动慢
        log_warn "NewFlow 进程运行中，但端口尚未就绪。保存初始 PID。"
        echo "$INITIAL_PID" > ../$NEWFLOW_PID_FILE
        cd ..
        return 0
    else
        log_error "NewFlow 启动失败"
        if [ -f "$LOG_FILE" ]; then
            echo "--- 日志片段 ---"
            tail -n 5 "$LOG_FILE"
            echo "----------------"
        fi
        cd ..
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
    
    # 加载环境变量
    set -a
    source ../.env 2>/dev/null || true
    set +a
    
    # 启动Dashboard
    local port=${DASHBOARD_PORT:-80}
    log_info "在端口 $port 启动Dashboard..."
    
    # 使用 uv 启动
    nohup uv run uvicorn main:app --host 0.0.0.0 --port $port > dashboard.log 2>&1 &
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
    
    # 获取实际端口配置
    local dash_port=${DASHBOARD_PORT:-8000}
    
    for port_info in "9200:Elasticsearch" "5601:Kibana" "5678:NewFlow" "$dash_port:Dashboard"; do
        local port=$(echo $port_info | cut -d: -f1)
        local service=$(echo $port_info | cut -d: -f2)
        
        if lsof -i :$port > /dev/null 2>&1; then
            log_success "  ✓ $service (:$port)"
        else
            # 再次尝试检查（有些服务绑定 0.0.0.0 可能 lsof 显示不同）
            if nc -z localhost $port 2>/dev/null; then
            log_success "  ✓ $service (:$port)"
        else
            log_warn "  ✗ $service (:$port) 未监听"
            all_ok=false
            fi
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

