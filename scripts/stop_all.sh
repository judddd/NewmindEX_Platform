#!/bin/bash

# 停止所有服务

set -e

echo "🛑 停止所有服务..."

# 停止Docker服务
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "🐳 停止Docker容器..."
$COMPOSE_CMD down

# 停止LM Studio
echo "🤖 停止LM Studio服务..."
pkill -f "lms server" || true

# 停止Python Dashboard
echo "🐍 停止Python Dashboard..."
pkill -f "uvicorn main:app" || true

# 停止所有MCP服务器
echo "🔌 停止MCP服务器..."
if [ -d "python_dashboard/mcp_pids" ]; then
    for pid_file in python_dashboard/mcp_pids/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            echo "   停止MCP进程: $pid"
            kill "$pid" 2>/dev/null || true
            rm "$pid_file"
        fi
    done
fi

echo "✅ 所有服务已停止！"

