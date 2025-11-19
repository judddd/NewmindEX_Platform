#!/bin/bash

# 安装步骤 02: 安装 Docker Desktop
# 从DMG文件安装Docker Desktop并等待其就绪

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="02_install_docker"

# ==================== 主函数 ====================

run_step() {
    log_info "开始安装 Docker Desktop..."
    mark_step_in_progress "$STEP_ID"
    
    # 检查是否已安装并运行
    if check_docker_running; then
        log_success "Docker Desktop 已安装并运行"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 查找Docker DMG文件
    local docker_dmg=""
    if [ -f "installers/Docker.dmg" ]; then
        docker_dmg="installers/Docker.dmg"
    elif [ -f "installers/system/Docker.dmg" ]; then
        docker_dmg="installers/system/Docker.dmg"
    else
        log_error "找不到 Docker.dmg 文件"
        mark_step_failed "$STEP_ID" "Docker DMG不存在"
        return 1
    fi
    
    log_info "发现安装包: $docker_dmg"
    
    # 如果Docker已安装但未运行
    if [ -d "/Applications/Docker.app" ]; then
        log_info "Docker 已安装，启动 Docker..."
        open -a Docker
        
        if wait_for_docker 120; then
            log_success "Docker 启动成功"
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_warn "Docker 启动超时，尝试重新安装..."
        fi
    fi
    
    # 挂载DMG
    log_info "挂载 Docker DMG..."
    hdiutil attach "$docker_dmg" -nobrowse -quiet
    
    sleep 2
    
    # 查找挂载点
    local mount_point=""
    for possible_mount in "/Volumes/Docker" "/Volumes/docker"; do
        if [ -d "$possible_mount" ]; then
            mount_point="$possible_mount"
            break
        fi
    done
    
    if [ -z "$mount_point" ]; then
        mount_point=$(hdiutil info | grep -i "/Volumes/.*Docker" | head -1 | awk '{for(i=3;i<=NF;i++) printf "%s ", $i; print ""}' | sed 's/ $//')
    fi
    
    if [ -z "$mount_point" ]; then
        log_error "无法找到 Docker 挂载点"
        mark_step_failed "$STEP_ID" "找不到挂载点"
        return 1
    fi
    
    log_success "找到挂载点: $mount_point"
    
    # 查找Docker.app
    local app_file=""
    for possible_app in "$mount_point/Docker.app" "$mount_point"/*.app; do
        if [ -d "$possible_app" ]; then
            app_file="$possible_app"
            break
        fi
    done
    
    if [ -z "$app_file" ]; then
        log_error "在挂载点中找不到 Docker.app"
        hdiutil detach "$mount_point" -quiet
        mark_step_failed "$STEP_ID" "找不到Docker.app"
        return 1
    fi
    
    # 复制到 Applications
    log_info "复制 Docker 到应用程序目录..."
    
    # 如果已存在，先删除
    if [ -d "/Applications/Docker.app" ]; then
        sudo rm -rf "/Applications/Docker.app"
    fi
    
    sudo cp -R "$app_file" /Applications/
    
    # 卸载DMG
    log_info "卸载 DMG..."
    hdiutil detach "$mount_point" -quiet
    
    # 启动Docker
    log_info "启动 Docker Desktop..."
    open -a Docker
    
    # 等待Docker就绪
    if ! wait_for_docker 180; then
        log_error "Docker 启动超时"
        mark_step_failed "$STEP_ID" "Docker启动超时"
        return 1
    fi
    
    # 配置 Docker 资源（内存、CPU等）
    log_info "配置 Docker 资源限制..."
    if [ -f "scripts/configure_docker_resources.sh" ]; then
        # 自动配置模式（不提示重启）
        export DOCKER_AUTO_CONFIGURE=true
        bash scripts/configure_docker_resources.sh
        
        # 等待配置生效
        log_info "等待 Docker 重启..."
        sleep 10
        
        # 重新等待Docker就绪
        if ! wait_for_docker 120; then
            log_warn "Docker 重启后未就绪，但继续安装..."
        else
            log_success "Docker 资源配置完成"
        fi
    else
        log_warn "找不到资源配置脚本，跳过"
    fi
    
    # 验证安装
    if verify_step; then
        mark_step_completed "$STEP_ID"
        return 0
    else
        mark_step_failed "$STEP_ID" "验证失败"
        return 1
    fi
}

# 验证步骤
verify_step() {
    log_info "验证 Docker 安装..."
    
    if ! check_docker_running; then
        return 1
    fi
    
    # 检查Docker版本
    local version=$(docker --version 2>&1)
    log_success "Docker 版本: $version"
    
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

