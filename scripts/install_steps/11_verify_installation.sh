#!/bin/bash

# 安装步骤 10: 验证安装
# 全面验证所有组件和服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="10_verify_installation"

# ==================== 主函数 ====================

run_step() {
    log_info "开始验证安装..."
    mark_step_in_progress "$STEP_ID"
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              最终安装验证                              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    local all_passed=true
    
    # 验证系统组件
    if ! verify_system_components; then
        all_passed=false
    fi
    
    echo ""
    
    # 验证应用程序
    if ! verify_applications; then
        all_passed=false
    fi
    
    echo ""
    
    # 验证Docker服务
    if ! verify_docker_services; then
        all_passed=false
    fi
    
    echo ""

    # 验证本地服务
    if ! verify_local_services; then
        all_passed=false
    fi
    
    echo ""
    
    # 验证连通性
    if ! verify_connectivity; then
        all_passed=false
    fi
    
    echo ""
    
    # 生成安装报告
    generate_installation_report
    
    if [ "$all_passed" = true ]; then
        mark_step_completed "$STEP_ID"
        mark_installation_complete
        return 0
    else
        log_warn "部分验证未通过"
        mark_step_completed "$STEP_ID"
        return 0
    fi
}

# 验证系统组件
verify_system_components() {
    echo -e "${CYAN}系统组件验证:${NC}"
    
    local all_ok=true
    
    # Docker
    if check_docker_running &> /dev/null; then
        local version=$(docker --version | cut -d' ' -f3 | tr -d ',')
        log_success "  ✓ Docker Desktop ($version)"
    else
        log_error "  ✗ Docker Desktop"
        all_ok=false
    fi
    
    # Node.js
    if command -v node &> /dev/null; then
        local version=$(node --version)
        log_success "  ✓ Node.js ($version)"
    else
        log_warn "  ✗ Node.js 未安装"
        all_ok=false
    fi
    
    # UV
    if command -v uv &> /dev/null; then
        local version=$(uv --version 2>&1 | head -1)
        log_success "  ✓ UV ($version)"
    else
        log_warn "  ⚠ UV 未安装（可选）"
    fi
    
    [ "$all_ok" = true ]
}

# 验证应用程序
verify_applications() {
    echo -e "${CYAN}应用程序验证:${NC}"
    
    local all_ok=true
    
    # LM Studio
    if [ -d "/Applications/LM Studio.app" ]; then
        local version=$(defaults read "/Applications/LM Studio.app/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo "未知")
        log_success "  ✓ LM Studio ($version)"
        
        # 检查模型
        if [ -d "$HOME/.lmstudio/models" ]; then
            local model_count=$(find "$HOME/.lmstudio/models" -type d -mindepth 2 -maxdepth 2 2>/dev/null | wc -l | tr -d ' ')
            if [ $model_count -gt 0 ]; then
                log_success "    • AI模型: $model_count 个"
            else
                log_warn "    • AI模型: 未安装"
            fi
        fi
    else
        log_error "  ✗ LM Studio 未安装"
        all_ok=false
    fi
    
    # NewChat
    if [ -d "/Applications/NewChat.app" ]; then
        local version=$(defaults read /Applications/NewChat.app/Contents/Info.plist CFBundleShortVersionString 2>/dev/null || echo "未知")
        log_success "  ✓ NewChat ($version)"
    else
        log_error "  ✗ NewChat 未安装"
        all_ok=false
    fi
    
    [ "$all_ok" = true ]
}

# 验证Docker服务
verify_docker_services() {
    echo -e "${CYAN}Docker 服务验证:${NC}"
    
    local all_ok=true
    
    # 检查容器
    for container in "elasticsearch" "kibana"; do
        if docker ps --format "{{.Names}}" | grep -q "$container"; then
            local status=$(docker ps --format "{{.Status}}" --filter "name=$container" | head -1)
            log_success "  ✓ $container ($status)"
        else
            log_error "  ✗ $container 未运行"
            all_ok=false
        fi
    done
    
    # 检查镜像
    local image_count=$(docker images --format "{{.Repository}}:{{.Tag}}" | wc -l | tr -d ' ')
    log_info "  • Docker镜像总数: $image_count"
    
    [ "$all_ok" = true ]
}

# 验证本地服务
verify_local_services() {
    echo -e "${CYAN}本地服务验证:${NC}"
    local all_ok=true

    # NewRAG
    if [ -f "python_dashboard/newrag.pid" ] && ps -p $(cat python_dashboard/newrag.pid) > /dev/null 2>&1; then
        log_success "  ✓ NewRAG (运行中)"
    else
        log_error "  ✗ NewRAG 未运行"
        all_ok=false
    fi

    # NewFlow
    if [ -f "python_dashboard/newflow.pid" ] && ps -p $(cat python_dashboard/newflow.pid) > /dev/null 2>&1; then
        log_success "  ✓ NewFlow (运行中)"
    else
        log_error "  ✗ NewFlow 未运行"
        all_ok=false
    fi

    [ "$all_ok" = true ]
}

# 验证连通性
verify_connectivity() {
    echo -e "${CYAN}服务连通性验证:${NC}"
    
    local all_ok=true
    
    # Elasticsearch
    if curl -s -u elastic:changeme123 http://localhost:9200/_cluster/health &> /dev/null; then
        local status=$(curl -s -u elastic:changeme123 http://localhost:9200/_cluster/health | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "未知")
        log_success "  ✓ Elasticsearch (集群状态: $status)"
    else
        log_error "  ✗ Elasticsearch 无法连接"
        all_ok=false
    fi
    
    # Kibana
    if curl -s http://localhost:5601/api/status &> /dev/null; then
        log_success "  ✓ Kibana"
    else
        log_warn "  ⚠ Kibana 可能未就绪（需要更多时间）"
    fi
    
    # NewFlow
    if curl -s http://localhost:5678 &> /dev/null; then
        log_success "  ✓ NewFlow"
    else
        log_error "  ✗ NewFlow 无法连接"
        all_ok=false
    fi
    
    # Dashboard
    if curl -s http://localhost:8000 &> /dev/null; then
        log_success "  ✓ Dashboard"
    else
        log_error "  ✗ Dashboard 无法连接"
        all_ok=false
    fi
    
    [ "$all_ok" = true ]
}

# 生成安装报告
generate_installation_report() {
    local report_file="logs/installation-report-$(date +%Y%m%d-%H%M%S).txt"
    
    log_info "生成安装报告: $report_file"
    
    {
        echo "=================================="
        echo "NewMind AI Platform 安装报告"
        echo "=================================="
        echo ""
        echo "安装时间: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        
        echo "系统信息:"
        echo "  • macOS: $(sw_vers -productVersion)"
        echo "  • 架构: $(uname -m)"
        echo "  • 内存: $(get_total_memory)GB"
        echo "  • 磁盘: $(get_available_space .)GB 可用"
        echo ""
        
        echo "已安装组件:"
        echo "  • Docker: $(docker --version 2>&1 || echo '未安装')"
        echo "  • Node.js: $(node --version 2>&1 || echo '未安装')"
        echo "  • UV: $(uv --version 2>&1 || echo '未安装')"
        echo "  • LM Studio: $([ -d '/Applications/LM Studio.app' ] && echo '已安装' || echo '未安装')"
        echo "  • NewChat: $([ -d '/Applications/NewChat.app' ] && echo '已安装' || echo '未安装')"
        echo ""
        
        echo "Docker容器:"
        docker ps --format "  • {{.Names}}: {{.Status}}" 2>/dev/null || echo "  无运行容器"
        echo ""
        
        echo "服务地址:"
        echo "  • Dashboard: http://localhost:8000"
        echo "  • Elasticsearch: http://localhost:9200"
        echo "  • Kibana: http://localhost:5601"
        echo "  • NewFlow: http://localhost:5678"
        echo "  • LM Studio: http://localhost:1234"
        echo ""
        
        echo "默认凭据:"
        echo "  • Elasticsearch/Kibana: elastic / changeme123"
        echo ""
        
        echo "=================================="
        
    } > "$report_file"
    
    log_success "报告已生成"
}

# 验证步骤
verify_step() {
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

