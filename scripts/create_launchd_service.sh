#!/bin/bash

# 创建macOS LaunchAgent实现开机自启
# 这个脚本会创建一个plist文件，让start_all.sh在用户登录时自动运行

set -e

echo "🚀 配置NewMind AI Platform开机自启动"
echo "========================================"

# 获取项目根目录的绝对路径
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
START_SCRIPT="${PROJECT_ROOT}/scripts/start_all.sh"

# LaunchAgent目录
LAUNCH_AGENTS_DIR="${HOME}/Library/LaunchAgents"
PLIST_NAME="com.newmind.platform"
PLIST_FILE="${LAUNCH_AGENTS_DIR}/${PLIST_NAME}.plist"

# 确保LaunchAgents目录存在
mkdir -p "${LAUNCH_AGENTS_DIR}"

# 创建plist文件
echo "📝 创建LaunchAgent配置..."
cat > "${PLIST_FILE}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_NAME}</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${START_SCRIPT}</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>${PROJECT_ROOT}</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <false/>
    
    <key>StandardOutPath</key>
    <string>${PROJECT_ROOT}/logs/launchd-stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>${PROJECT_ROOT}/logs/launchd-stderr.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ LaunchAgent配置文件已创建: ${PLIST_FILE}"
echo ""

# 如果之前加载过，先卸载
if launchctl list | grep -q "${PLIST_NAME}"; then
    echo "🔄 卸载旧的LaunchAgent..."
    launchctl unload "${PLIST_FILE}" 2>/dev/null || true
fi

# 加载LaunchAgent
echo "📥 加载LaunchAgent..."
launchctl load "${PLIST_FILE}"

echo ""
echo "✅ 开机自启动配置完成！"
echo ""
echo "========================================"
echo "📋 配置详情："
echo "========================================"
echo "配置文件: ${PLIST_FILE}"
echo "启动脚本: ${START_SCRIPT}"
echo "日志目录: ${PROJECT_ROOT}/logs/"
echo ""
echo "🔍 管理命令："
echo "========================================"
echo "查看状态:   launchctl list | grep ${PLIST_NAME}"
echo "手动启动:   launchctl start ${PLIST_NAME}"
echo "手动停止:   launchctl stop ${PLIST_NAME}"
echo "禁用自启:   launchctl unload ${PLIST_FILE}"
echo "启用自启:   launchctl load ${PLIST_FILE}"
echo "删除配置:   rm ${PLIST_FILE}"
echo ""
echo "📝 注意事项："
echo "========================================"
echo "• 系统重启后会自动启动所有服务"
echo "• 首次启动可能需要1-2分钟"
echo "• 查看日志: tail -f ${PROJECT_ROOT}/logs/launchd-stdout.log"
echo "• Dashboard地址: http://localhost:8000"
echo ""

