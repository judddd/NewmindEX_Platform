#!/bin/bash

###############################################################################
# Mac 系统保活配置脚本
# 用途：防止 Mac 在拔掉显示器后进入睡眠，保持 ToDesk 等远程工具可用
# 作者：NewMind Deploy
# 日期：2025-12-19
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 备份当前电源设置
backup_power_settings() {
    log_info "备份当前电源设置..."
    local backup_dir="/usr/local/var/newmind_backup"
    mkdir -p "$backup_dir"
    
    pmset -g > "$backup_dir/pmset_backup_$(date +%Y%m%d_%H%M%S).txt"
    log_success "电源设置已备份到: $backup_dir"
}

# 配置系统电源管理
configure_power_management() {
    log_info "开始配置系统电源管理..."
    
    # 备份当前设置
    backup_power_settings
    
    # 配置电源管理 - 同时适用于电池和电源适配器
    log_info "禁用系统睡眠..."
    pmset -a sleep 0
    
    log_info "禁用显示器睡眠..."
    pmset -a displaysleep 0
    
    log_info "禁用硬盘睡眠..."
    pmset -a disksleep 0
    
    log_info "启用网络唤醒..."
    pmset -a womp 1
    
    log_info "保持 TCP 连接..."
    pmset -a tcpkeepalive 1
    
    log_info "禁用待机模式..."
    pmset -a standby 0
    pmset -a autopoweroff 0
    pmset -a powernap 0
    
    log_success "电源管理配置完成"
}

# 创建 LaunchDaemon 保活服务
create_keepalive_daemon() {
    log_info "创建 LaunchDaemon 保活服务..."
    
    local plist_path="/Library/LaunchDaemons/com.newmind.keepawake.plist"
    local script_path="/usr/local/bin/newmind_keepawake.sh"
    
    # 创建保活脚本
    log_info "创建保活脚本: $script_path"
    cat > "$script_path" << 'EOF'
#!/bin/bash
# NewMind Keep Awake Service
# 持续运行 caffeinate 防止系统睡眠

LOG_FILE="/var/log/newmind_keepawake.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "NewMind Keep Awake 服务启动"

# 使用 caffeinate 防止系统睡眠
# -d: 防止显示器睡眠
# -i: 防止系统空闲睡眠
# -m: 防止硬盘睡眠
# -s: 防止系统在电源适配器上睡眠
caffeinate -d -i -m -s &

CAFFEINATE_PID=$!
log_message "Caffeinate 进程已启动，PID: $CAFFEINATE_PID"

# 将 PID 保存到文件
echo $CAFFEINATE_PID > /var/run/newmind_keepawake.pid

# 保持脚本运行
wait $CAFFEINATE_PID
EOF
    
    chmod +x "$script_path"
    log_success "保活脚本创建完成"
    
    # 创建 LaunchDaemon plist 文件
    log_info "创建 LaunchDaemon 配置: $plist_path"
    cat > "$plist_path" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.newmind.keepawake</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$script_path</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/var/log/newmind_keepawake_stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>/var/log/newmind_keepawake_stderr.log</string>
    
    <key>UserName</key>
    <string>root</string>
    
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF
    
    # 设置正确的权限
    chown root:wheel "$plist_path"
    chmod 644 "$plist_path"
    
    log_success "LaunchDaemon 配置文件创建完成"
}

# 加载并启动服务
load_daemon() {
    log_info "加载并启动保活服务..."
    
    local plist_path="/Library/LaunchDaemons/com.newmind.keepawake.plist"
    
    # 如果服务已加载，先卸载
    if launchctl list | grep -q "com.newmind.keepawake"; then
        log_warning "服务已存在，先卸载旧服务..."
        launchctl unload "$plist_path" 2>/dev/null || true
        sleep 2
    fi
    
    # 加载服务
    launchctl load "$plist_path"
    sleep 2
    
    # 验证服务状态
    if launchctl list | grep -q "com.newmind.keepawake"; then
        log_success "保活服务已成功启动"
    else
        log_error "保活服务启动失败"
        exit 1
    fi
}

# 显示当前配置
show_current_settings() {
    log_info "当前电源管理设置："
    echo "----------------------------------------"
    pmset -g
    echo "----------------------------------------"
}

# 显示服务状态
show_service_status() {
    log_info "保活服务状态："
    echo "----------------------------------------"
    
    if launchctl list | grep -q "com.newmind.keepawake"; then
        echo -e "${GREEN}✓ LaunchDaemon 服务运行中${NC}"
        launchctl list | grep "com.newmind.keepawake"
    else
        echo -e "${RED}✗ LaunchDaemon 服务未运行${NC}"
    fi
    
    echo ""
    if pgrep -f "caffeinate" > /dev/null; then
        echo -e "${GREEN}✓ Caffeinate 进程运行中${NC}"
        ps aux | grep caffeinate | grep -v grep
    else
        echo -e "${YELLOW}! Caffeinate 进程未检测到${NC}"
    fi
    
    echo "----------------------------------------"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  Mac 系统保活配置脚本"
    echo "  防止远程连接断开"
    echo "========================================"
    echo ""
    
    # 检查 root 权限
    check_root
    
    # 配置电源管理
    configure_power_management
    echo ""
    
    # 创建保活服务
    create_keepalive_daemon
    echo ""
    
    # 加载服务
    load_daemon
    echo ""
    
    # 显示当前配置
    show_current_settings
    echo ""
    
    # 显示服务状态
    show_service_status
    echo ""
    
    log_success "=============== 配置完成 ==============="
    echo ""
    echo "系统已配置为永久保持唤醒状态"
    echo ""
    echo "服务说明："
    echo "  - LaunchDaemon 服务会在开机时自动启动"
    echo "  - 即使拔掉显示器，系统也不会进入睡眠"
    echo "  - ToDesk 等远程工具将保持可用"
    echo ""
    echo "日志文件位置："
    echo "  - /var/log/newmind_keepawake.log"
    echo "  - /var/log/newmind_keepawake_stdout.log"
    echo "  - /var/log/newmind_keepawake_stderr.log"
    echo ""
    echo "如需恢复原设置，请运行："
    echo "  sudo $(dirname "$0")/uninstall_keep_awake.sh"
    echo ""
    echo "========================================"
}

# 运行主函数
main

exit 0

