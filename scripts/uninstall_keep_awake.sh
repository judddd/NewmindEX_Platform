#!/bin/bash

###############################################################################
# Mac 系统保活配置卸载脚本
# 用途：恢复系统原始电源管理设置，移除保活服务
# 作者：NewMind Deploy
# 日期：2025-12-19
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 权限
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "此脚本需要 sudo 权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 停止并移除 LaunchDaemon 服务
remove_daemon() {
    log_info "移除 LaunchDaemon 保活服务..."
    
    local plist_path="/Library/LaunchDaemons/com.newmind.keepawake.plist"
    local script_path="/usr/local/bin/newmind_keepawake.sh"
    local pid_file="/var/run/newmind_keepawake.pid"
    
    # 停止服务
    if launchctl list | grep -q "com.newmind.keepawake"; then
        log_info "停止保活服务..."
        launchctl unload "$plist_path" 2>/dev/null || true
        sleep 2
        log_success "服务已停止"
    else
        log_warning "服务未运行"
    fi
    
    # 停止 caffeinate 进程
    if [ -f "$pid_file" ]; then
        local caffeinate_pid=$(cat "$pid_file")
        if kill -0 "$caffeinate_pid" 2>/dev/null; then
            log_info "停止 caffeinate 进程 (PID: $caffeinate_pid)..."
            kill "$caffeinate_pid" 2>/dev/null || true
        fi
        rm -f "$pid_file"
    fi
    
    # 清理所有 caffeinate 进程
    if pgrep -f "caffeinate" > /dev/null; then
        log_info "清理残留的 caffeinate 进程..."
        pkill -f "caffeinate" 2>/dev/null || true
    fi
    
    # 删除文件
    if [ -f "$plist_path" ]; then
        rm -f "$plist_path"
        log_success "已删除: $plist_path"
    fi
    
    if [ -f "$script_path" ]; then
        rm -f "$script_path"
        log_success "已删除: $script_path"
    fi
    
    # 清理日志文件（可选）
    read -p "是否删除日志文件? (y/N): " delete_logs
    if [[ "$delete_logs" =~ ^[Yy]$ ]]; then
        rm -f /var/log/newmind_keepawake*.log
        log_success "日志文件已删除"
    fi
}

# 恢复默认电源管理设置
restore_power_settings() {
    log_info "恢复默认电源管理设置..."
    
    log_warning "注意：这将设置为 macOS 的标准默认值"
    echo "如需自定义，请稍后在系统设置中调整"
    echo ""
    
    # 询问是否继续
    read -p "是否恢复默认电源设置? (y/N): " restore
    if [[ ! "$restore" =~ ^[Yy]$ ]]; then
        log_warning "跳过电源设置恢复"
        return
    fi
    
    # 恢复标准设置
    # 电源适配器设置
    log_info "配置电源适配器模式..."
    pmset -c sleep 0              # 使用电源时不睡眠（台式机模式）
    pmset -c displaysleep 10      # 显示器 10 分钟后睡眠
    pmset -c disksleep 10         # 硬盘 10 分钟后睡眠
    
    # 电池设置
    log_info "配置电池模式..."
    pmset -b sleep 15             # 电池模式 15 分钟后睡眠
    pmset -b displaysleep 5       # 显示器 5 分钟后睡眠
    pmset -b disksleep 10         # 硬盘 10 分钟后睡眠
    
    # 通用设置
    log_info "配置通用选项..."
    pmset -a womp 1               # 保持网络唤醒
    pmset -a tcpkeepalive 1       # 保持 TCP 连接
    pmset -a standby 1            # 启用待机
    pmset -a autopoweroff 1       # 启用自动关机
    pmset -a powernap 0           # 禁用小睡功能（可选）
    
    log_success "电源管理设置已恢复"
}

# 显示当前配置
show_current_settings() {
    log_info "当前电源管理设置："
    echo "----------------------------------------"
    pmset -g
    echo "----------------------------------------"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  Mac 系统保活配置卸载脚本"
    echo "========================================"
    echo ""
    
    # 检查 root 权限
    check_root
    
    # 移除服务
    remove_daemon
    echo ""
    
    # 恢复电源设置
    restore_power_settings
    echo ""
    
    # 显示当前配置
    show_current_settings
    echo ""
    
    log_success "=============== 卸载完成 ==============="
    echo ""
    echo "系统保活配置已移除"
    echo ""
    echo "后续操作："
    echo "  - 可以在系统设置 > 锁定屏幕中调整电源选项"
    echo "  - 可以在系统设置 > 电池中查看电源管理"
    echo ""
    echo "备份文件位置（如有）："
    echo "  - /usr/local/var/newmind_backup/"
    echo ""
    echo "========================================"
}

# 运行主函数
main

exit 0

