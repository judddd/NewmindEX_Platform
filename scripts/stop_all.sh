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

# 停止其他独立容器（newchat-docs, newflow-docs等）
echo "📦 停止文档容器..."
docker ps -a --format "{{.Names}}" | grep -E "(newchat-docs|newflow-docs|newmindchat-docs)" | while read container; do
    echo "   停止容器: $container"
    docker stop "$container" 2>/dev/null || true
    docker rm "$container" 2>/dev/null || true
done

# 停止LM Studio
echo "🤖 停止LM Studio服务..."
pkill -f "lms server" || true

# 停止Python Dashboard
echo "🐍 停止Python Dashboard..."
if [ -f "python_dashboard/dashboard.pid" ]; then
    pid=$(cat python_dashboard/dashboard.pid)
    if ps -p $pid > /dev/null 2>&1; then
        echo "   停止Dashboard进程: $pid"
        kill $pid || true
    fi
    rm -f python_dashboard/dashboard.pid
else
    pkill -f "uvicorn main:app" || true
fi

# 停止所有MCP服务器（Node模式）
echo "🔌 停止MCP服务器（Node模式）..."
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

# 停止所有MCP Docker容器
echo "🔌 停止MCP Docker容器..."
docker ps --format "{{.Names}}" | grep "^mcp-" | while read container; do
    echo "   停止容器: $container"
    docker stop "$container" 2>/dev/null || true
    docker rm "$container" 2>/dev/null || true
done

echo "✅ 所有服务已停止！"

