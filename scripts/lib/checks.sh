#!/bin/bash

# NewMind AI Platform - 系统检查函数库
# 提供各种系统预检查功能

# 加载工具函数
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# ==================== 系统检查 ====================

# 检查macOS版本
check_macos_version() {
    log_info "检查 macOS 版本..."
    
    local os_version=$(sw_vers -productVersion)
    local major_version=$(echo $os_version | cut -d. -f1)
    
    log_debug "检测到 macOS 版本: $os_version"
    
    if [ $major_version -lt 11 ]; then
        log_error "macOS 版本过低: $os_version (需要 >= 11.0)"
        return 1
    fi
    
    log_success "macOS 版本: $os_version ✓"
    return 0
}

# 检查CPU架构
check_architecture() {
    log_info "检查 CPU 架构..."
    
    local arch=$(uname -m)
    log_debug "检测到架构: $arch"
    
    if [ "$arch" != "arm64" ]; then
        log_error "不支持的架构: $arch (需要 Apple Silicon / arm64)"
        log_warn "此安装包仅支持 Apple Silicon Mac (M1/M2/M3系列)"
        return 1
    fi
    
    log_success "CPU 架构: Apple Silicon (arm64) ✓"
    return 0
}

# 检查可用磁盘空间
# 参数: 所需空间(GB)
check_disk_space() {
    local required_gb=${1:-200}
    
    log_info "检查磁盘空间..."
    
    local available=$(get_available_space .)
    log_debug "可用空间: ${available}GB"
    
    if [ $available -lt $required_gb ]; then
        log_error "磁盘空间不足: ${available}GB (需要 >= ${required_gb}GB)"
        log_warn "请清理磁盘空间后重试"
        return 1
    fi
    
    log_success "可用磁盘空间: ${available}GB ✓"
    return 0
}

# 检查系统内存
# 参数: 所需内存(GB)
check_memory() {
    local required_gb=${1:-32}
    
    log_info "检查系统内存..."
    
    local total_gb=$(get_total_memory)
    log_debug "系统内存: ${total_gb}GB"
    
    if [ $total_gb -lt $required_gb ]; then
        log_warn "系统内存: ${total_gb}GB (推荐 >= ${required_gb}GB)"
        log_warn "内存不足可能影响AI模型运行性能"
        
        # 询问是否继续
        if ! ask_proceed "内存不足，是否仍要继续"; then
            return 1
        fi
    else
        log_success "系统内存: ${total_gb}GB ✓"
    fi
    
    return 0
}

# 检查是否已存在安装
check_existing_installation() {
    log_info "检查现有安装..."
    
    local has_installation=false
    local components=()
    
    # 检查各个组件
    if [ -d "/Applications/Docker.app" ]; then
        components+=("Docker Desktop")
    fi
    
    if [ -d "/Applications/LM Studio.app" ]; then
        components+=("LM Studio")
    fi
    
    if [ -d "/Applications/NewChat.app" ]; then
        components+=("NewChat")
    fi
    
    if command -v node &> /dev/null; then
        components+=("Node.js")
    fi
    
    if command -v uv &> /dev/null; then
        components+=("UV")
    fi
    
    if [ ${#components[@]} -gt 0 ]; then
        log_warn "检测到已安装的组件:"
        for component in "${components[@]}"; do
            echo -e "  ${YELLOW}• ${component}${NC}"
        done
        echo ""
        
        log_warn "继续安装将升级这些组件"
        if ! ask_proceed "是否继续"; then
            return 1
        fi
    else
        log_success "未检测到现有安装 ✓"
    fi
    
    return 0
}

# 检查命令是否存在
check_command() {
    local cmd=$1
    local name="${2:-$cmd}"
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -1 || echo "未知")
        log_success "$name 已安装: $version"
        return 0
    else
        log_info "$name 未安装"
        return 1
    fi
}

# 检查Docker是否运行
check_docker_running() {
    log_info "检查 Docker 状态..."
    
    if ! command -v docker &> /dev/null; then
        log_info "Docker 未安装"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        log_warn "Docker 未运行"
        return 1
    fi
    
    log_success "Docker 运行正常 ✓"
    return 0
}

# 等待Docker就绪
# 参数: 超时时间(秒)
wait_for_docker() {
    local timeout=${1:-120}
    local elapsed=0
    
    log_info "等待 Docker 启动..."
    
    while [ $elapsed -lt $timeout ]; do
        if docker info &> /dev/null; then
            log_success "Docker 已就绪 (${elapsed}秒)"
            return 0
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo -ne "\r${CYAN}等待中... ${elapsed}/${timeout}秒${NC}"
    done
    
    echo ""
    log_error "Docker 启动超时 (${timeout}秒)"
    return 1
}

# ==================== 安装包检查 ====================

# 检查安装包是否存在
check_installer_exists() {
    local installer_path=$1
    local name="${2:-安装包}"
    
    if [ ! -f "$installer_path" ]; then
        log_error "$name 不存在: $installer_path"
        return 1
    fi
    
    local size=$(stat -f%z "$installer_path")
    local readable_size=$(human_readable_size $size)
    log_success "$name 存在: $readable_size"
    return 0
}

# 检查所有必需的安装包
check_all_installers() {
    log_info "检查安装包完整性..."
    echo ""
    
    local all_ok=true
    
    # 检查系统依赖
    echo -e "${CYAN}系统依赖:${NC}"
    if [ -f "installers/system/Docker.dmg" ] || [ -f "installers/Docker.dmg" ]; then
        check_installer_exists "installers/Docker.dmg" "Docker Desktop" || \
        check_installer_exists "installers/system/Docker.dmg" "Docker Desktop" || all_ok=false
    else
        log_error "Docker.dmg 不存在"
        all_ok=false
    fi
    
    if [ -f "installers/system/node-v20.18.1.pkg" ] || command -v node &> /dev/null; then
        check_installer_exists "installers/system/node-v20.18.1.pkg" "Node.js" || \
        log_info "Node.js 已安装，跳过"
    else
        log_warn "Node.js 安装包不存在（可选）"
    fi
    
    echo ""
    
    # 检查应用程序
    echo -e "${CYAN}应用程序:${NC}"
    check_installer_exists "installers/LM-Studio-0.3.30-1-arm64.dmg" "LM Studio" || all_ok=false
    check_installer_exists "installers/NewChat-1.0.1-mac-arm64.dmg" "NewChat" || all_ok=false
    
    echo ""
    
    # 检查Docker镜像（可选）
    echo -e "${CYAN}Docker镜像:${NC}"
    local image_count=$(ls installers/*.tar installers/docker_images/*.tar 2>/dev/null | wc -l)
    if [ $image_count -gt 0 ]; then
        log_success "发现 $image_count 个Docker镜像文件"
    else
        log_warn "未发现Docker镜像文件（首次运行时将自动构建）"
    fi
    
    echo ""
    
    # 检查AI模型（可选）
    echo -e "${CYAN}AI模型:${NC}"
    if [ -d "installers/models" ]; then
        local model_count=$(find installers/models -type d -mindepth 2 -maxdepth 2 | wc -l)
        if [ $model_count -gt 0 ]; then
            log_success "发现 $model_count 个AI模型"
        else
            log_warn "未发现AI模型（可稍后手动下载）"
        fi
    else
        log_warn "模型目录不存在（可稍后手动下载）"
    fi
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        log_error "部分必需安装包缺失"
        return 1
    fi
    
    log_success "安装包检查完成 ✓"
    return 0
}

# ==================== 综合检查 ====================

# 运行所有预检查
run_all_checks() {
    log_info "开始系统预检查..."
    echo ""
    
    local checks_passed=true
    
    # 必需检查
    check_macos_version || checks_passed=false
    check_architecture || checks_passed=false
    check_disk_space 200 || checks_passed=false
    check_memory 32 || true  # 内存检查不是必需的
    
    echo ""
    
    # 可选检查
    check_existing_installation || checks_passed=false
    
    echo ""
    
    # 安装包检查
    check_all_installers || checks_passed=false
    
    echo ""
    
    if [ "$checks_passed" = false ]; then
        log_error "预检查未通过"
        return 1
    fi
    
    log_success "所有预检查通过 ✓"
    return 0
}

# 显示系统信息摘要
show_system_summary() {
    local os_version=$(sw_vers -productVersion)
    local arch=$(uname -m)
    local mem_gb=$(get_total_memory)
    local disk_gb=$(get_available_space .)
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║          系统信息摘要                  ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} macOS版本:  $os_version"
    echo -e "${BLUE}║${NC} CPU架构:    $arch"
    echo -e "${BLUE}║${NC} 系统内存:   ${mem_gb}GB"
    echo -e "${BLUE}║${NC} 可用空间:   ${disk_gb}GB"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

