#!/bin/bash

###############################################################################
# Mac 系统保活状态检查脚本
# 用途：检查保活服务和电源管理状态
# 作者：NewMind Deploy
# 日期：2025-12-19
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印标题
print_header() {
    echo ""
    echo -e "${CYAN}========================================"
    echo "  Mac 系统保活状态检查"
    echo "========================================${NC}"
    echo ""
}

# 检查 LaunchDaemon 服务状态
check_daemon_status() {
    echo -e "${BLUE}[1] LaunchDaemon 服务状态${NC}"
    echo "----------------------------------------"
    
    if launchctl list | grep -q "com.newmind.keepawake"; then
        echo -e "${GREEN}✓ 服务状态: 运行中${NC}"
        
        # 显示详细信息
        launchctl list | grep "com.newmind.keepawake" | while read line; do
            echo "  $line"
        done
        
        # 检查服务文件
        local plist_path="/Library/LaunchDaemons/com.newmind.keepawake.plist"
        if [ -f "$plist_path" ]; then
            echo -e "${GREEN}✓ 配置文件: 存在${NC}"
            echo "  位置: $plist_path"
        else
            echo -e "${RED}✗ 配置文件: 缺失${NC}"
        fi
        
        # 检查脚本文件
        local script_path="/usr/local/bin/newmind_keepawake.sh"
        if [ -f "$script_path" ]; then
            echo -e "${GREEN}✓ 保活脚本: 存在${NC}"
            echo "  位置: $script_path"
        else
            echo -e "${RED}✗ 保活脚本: 缺失${NC}"
        fi
    else
        echo -e "${RED}✗ 服务状态: 未运行${NC}"
        echo "  提示: 运行 sudo ./setup_keep_awake.sh 安装服务"
    fi
    
    echo ""
}

# 检查 caffeinate 进程
check_caffeinate() {
    echo -e "${BLUE}[2] Caffeinate 进程状态${NC}"
    echo "----------------------------------------"
    
    if pgrep -f "caffeinate" > /dev/null; then
        echo -e "${GREEN}✓ 进程状态: 运行中${NC}"
        echo ""
        echo "运行中的进程："
        ps aux | grep caffeinate | grep -v grep | while read line; do
            echo "  $line"
        done
        
        # 检查 PID 文件
        local pid_file="/var/run/newmind_keepawake.pid"
        if [ -f "$pid_file" ]; then
            local saved_pid=$(cat "$pid_file")
            echo ""
            echo "保存的 PID: $saved_pid"
            if kill -0 "$saved_pid" 2>/dev/null; then
                echo -e "${GREEN}✓ PID 进程: 有效${NC}"
            else
                echo -e "${YELLOW}! PID 进程: 已终止${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ 进程状态: 未运行${NC}"
        echo "  提示: caffeinate 应该在服务启动后运行"
    fi
    
    echo ""
}

# 检查电源管理设置
check_power_settings() {
    echo -e "${BLUE}[3] 电源管理设置${NC}"
    echo "----------------------------------------"
    
    # 获取当前设置
    local sleep_setting=$(pmset -g | grep "^[[:space:]]*sleep" | head -n 1 | awk '{print $2}')
    local display_sleep=$(pmset -g | grep "^[[:space:]]*displaysleep" | head -n 1 | awk '{print $2}')
    local disk_sleep=$(pmset -g | grep "^[[:space:]]*disksleep" | head -n 1 | awk '{print $2}')
    
    # 系统睡眠
    if [ "$sleep_setting" = "0" ]; then
        echo -e "${GREEN}✓ 系统睡眠: 已禁用${NC}"
    else
        echo -e "${YELLOW}! 系统睡眠: ${sleep_setting} 分钟${NC}"
    fi
    
    # 显示器睡眠
    if [ "$display_sleep" = "0" ]; then
        echo -e "${GREEN}✓ 显示器睡眠: 已禁用${NC}"
    else
        echo -e "${YELLOW}! 显示器睡眠: ${display_sleep} 分钟${NC}"
    fi
    
    # 硬盘睡眠
    if [ "$disk_sleep" = "0" ]; then
        echo -e "${GREEN}✓ 硬盘睡眠: 已禁用${NC}"
    else
        echo -e "${YELLOW}! 硬盘睡眠: ${disk_sleep} 分钟${NC}"
    fi
    
    echo ""
    echo "完整设置："
    pmset -g | grep -E "sleep|standby|womp|tcp"
    
    echo ""
}

# 检查日志文件
check_logs() {
    echo -e "${BLUE}[4] 日志文件${NC}"
    echo "----------------------------------------"
    
    local logs=(
        "/var/log/newmind_keepawake.log"
        "/var/log/newmind_keepawake_stdout.log"
        "/var/log/newmind_keepawake_stderr.log"
    )
    
    for log in "${logs[@]}"; do
        if [ -f "$log" ]; then
            local size=$(du -h "$log" | awk '{print $1}')
            echo -e "${GREEN}✓${NC} $log (大小: $size)"
            
            # 显示最后几行
            if [ -s "$log" ]; then
                echo "  最后 3 行:"
                tail -n 3 "$log" | sed 's/^/    /'
            fi
        else
            echo -e "${YELLOW}!${NC} $log (不存在)"
        fi
    done
    
    echo ""
}

# 检查系统运行时间
check_uptime() {
    echo -e "${BLUE}[5] 系统运行信息${NC}"
    echo "----------------------------------------"
    
    echo "系统运行时间:"
    uptime
    
    echo ""
    echo "上次重启时间:"
    who -b
    
    echo ""
}

# 网络状态检查
check_network() {
    echo -e "${BLUE}[6] 网络状态${NC}"
    echo "----------------------------------------"
    
    # 检查主要网络接口
    local active_interface=$(route -n get default 2>/dev/null | grep interface | awk '{print $2}')
    if [ -n "$active_interface" ]; then
        echo -e "${GREEN}✓ 活动网络接口: $active_interface${NC}"
        
        # 获取 IP 地址
        local ip_addr=$(ifconfig "$active_interface" | grep "inet " | awk '{print $2}')
        if [ -n "$ip_addr" ]; then
            echo "  本机 IP: $ip_addr"
        fi
    else
        echo -e "${YELLOW}! 无法检测到活动网络接口${NC}"
    fi
    
    # 检查网络连接
    if ping -c 1 -t 2 8.8.8.8 &> /dev/null; then
        echo -e "${GREEN}✓ 互联网连接: 正常${NC}"
    else
        echo -e "${RED}✗ 互联网连接: 异常${NC}"
    fi
    
    echo ""
}

# 提供建议
provide_recommendations() {
    echo -e "${BLUE}[7] 建议和提示${NC}"
    echo "----------------------------------------"
    
    local has_issues=0
    
    # 检查服务是否运行
    if ! launchctl list | grep -q "com.newmind.keepawake"; then
        echo -e "${YELLOW}⚠${NC} 保活服务未运行"
        echo "  建议: sudo $(dirname "$0")/setup_keep_awake.sh"
        has_issues=1
    fi
    
    # 检查 caffeinate
    if ! pgrep -f "caffeinate" > /dev/null; then
        echo -e "${YELLOW}⚠${NC} Caffeinate 进程未运行"
        echo "  建议: 重启保活服务或重启系统"
        has_issues=1
    fi
    
    # 检查电源设置
    local sleep_setting=$(pmset -g | grep "^[[:space:]]*sleep" | head -n 1 | awk '{print $2}')
    if [ "$sleep_setting" != "0" ]; then
        echo -e "${YELLOW}⚠${NC} 系统睡眠未完全禁用"
        echo "  建议: 运行 sudo $(dirname "$0")/setup_keep_awake.sh"
        has_issues=1
    fi
    
    if [ $has_issues -eq 0 ]; then
        echo -e "${GREEN}✓ 所有检查通过，系统配置正确${NC}"
        echo ""
        echo "系统应该能够保持长期运行而不进入睡眠状态"
    fi
    
    echo ""
}

# 主函数
main() {
    print_header
    check_daemon_status
    check_caffeinate
    check_power_settings
    check_logs
    check_uptime
    check_network
    provide_recommendations
    
    echo -e "${CYAN}========================================"
    echo "  检查完成"
    echo "========================================${NC}"
    echo ""
}

# 运行主函数
main

exit 0

