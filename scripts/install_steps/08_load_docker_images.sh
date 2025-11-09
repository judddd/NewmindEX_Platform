#!/bin/bash

# 安装步骤 07: 加载 Docker 镜像
# 从tar文件加载所有Docker镜像

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="07_load_docker_images"

# ==================== 主函数 ====================

run_step() {
    log_info "开始加载 Docker 镜像..."
    mark_step_in_progress "$STEP_ID"
    
    # 确保Docker运行
    if ! check_docker_running; then
        log_error "Docker 未运行，请先启动Docker"
        mark_step_failed "$STEP_ID" "Docker未运行"
        return 1
    fi
    
    # 查找所有镜像tar文件
    local image_files=()
    
    # 从多个位置查找
    for dir in "installers" "installers/docker_images"; do
        if [ -d "$dir" ]; then
            while IFS= read -r -d '' file; do
                image_files+=("$file")
            done < <(find "$dir" -maxdepth 1 -name "*.tar" -print0 2>/dev/null)
        fi
    done
    
    if [ ${#image_files[@]} -eq 0 ]; then
        log_warn "未发现Docker镜像tar文件"
        log_info "将使用构建脚本构建镜像..."
        
        # 调用构建脚本
        if bash "scripts/04_build_mcp_servers.sh" 2>&1 | tee -a "$LOG_FILE"; then
            log_success "镜像构建完成"
        else
            log_warn "镜像构建失败，可稍后手动构建"
        fi
        
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    log_info "发现 ${#image_files[@]} 个Docker镜像文件"
    echo ""
    
    # 加载所有镜像
    if load_all_images "${image_files[@]}"; then
        if verify_step; then
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_warn "镜像加载完成但验证有问题"
            mark_step_completed "$STEP_ID"
            return 0
        fi
    else
        log_error "镜像加载失败"
        mark_step_failed "$STEP_ID" "加载失败"
        return 1
    fi
}

# 加载所有镜像
load_all_images() {
    local files=("$@")
    local total=${#files[@]}
    local loaded=0
    local failed=0
    
    start_timer
    
    for i in "${!files[@]}"; do
        local file="${files[$i]}"
        local filename=$(basename "$file")
        local num=$((i + 1))
        
        log_info "[$num/$total] 加载镜像: $filename"
        
        # 获取文件大小
        local size=$(du -sh "$file" | cut -f1)
        echo -e "${CYAN}   文件大小: $size${NC}"
        
        # 加载镜像
        if docker load -i "$file" 2>&1 | tee -a "$LOG_FILE" | grep -q "Loaded image"; then
            log_success "加载成功: $filename"
            loaded=$((loaded + 1))
        else
            log_error "加载失败: $filename"
            failed=$((failed + 1))
        fi
        
        # 显示进度
        show_progress $num $total "总体进度"
        
        # 显示预计剩余时间
        if [ $num -lt $total ]; then
            local remaining=$(estimate_remaining_time $num $total)
            echo -e "${CYAN}   预计剩余时间: $remaining${NC}"
        fi
        
        echo ""
    done
    
    local elapsed=$(get_elapsed_time)
    local elapsed_formatted=$(format_time $elapsed)
    
    log_info "加载完成: 成功 $loaded 个, 失败 $failed 个"
    log_info "耗时: $elapsed_formatted"
    
    # 如果有成功加载的镜像，就算成功
    [ $loaded -gt 0 ]
}

# 验证步骤
verify_step() {
    log_info "验证 Docker 镜像..."
    
    # 列出所有镜像
    local image_count=$(docker images --format "{{.Repository}}:{{.Tag}}" | wc -l | tr -d ' ')
    
    if [ $image_count -eq 0 ]; then
        log_warn "未发现Docker镜像"
        return 1
    fi
    
    log_success "Docker 镜像总数: $image_count"
    
    # 检查关键镜像
    echo ""
    echo -e "${CYAN}关键镜像状态:${NC}"
    
    local all_ok=true
    
    # 检查NewFlow
    if docker images | grep -q "newflow"; then
        log_success "  ✓ NewFlow"
    else
        log_warn "  ✗ NewFlow 镜像缺失"
        all_ok=false
    fi
    
    # 检查MCP服务器
    if docker images | grep -q "newmind-mcp"; then
        local mcp_count=$(docker images | grep "newmind-mcp" | wc -l | tr -d ' ')
        log_success "  ✓ MCP 服务器 ($mcp_count 个)"
    else
        log_warn "  ✗ MCP 服务器镜像缺失"
        all_ok=false
    fi
    
    # 检查Elasticsearch
    if docker images | grep -q "elasticsearch"; then
        log_success "  ✓ Elasticsearch"
    else
        log_warn "  ✗ Elasticsearch 镜像缺失"
        all_ok=false
    fi
    
    # 检查Kibana
    if docker images | grep -q "kibana"; then
        log_success "  ✓ Kibana"
    else
        log_warn "  ✗ Kibana 镜像缺失"
        all_ok=false
    fi
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        log_warn "部分关键镜像缺失，可能影响功能"
    else
        log_success "所有关键镜像已就绪 ✓"
    fi
    
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

