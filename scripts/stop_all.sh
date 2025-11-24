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

# 1. 首先停止所有MCP Docker容器（必须在docker compose down之前）
echo "🔌 停止MCP Docker容器..."
MCP_CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep "^mcp-" || true)
if [ -n "$MCP_CONTAINERS" ]; then
    echo "$MCP_CONTAINERS" | while read container; do
        echo "   停止容器: $container"
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
    done
    echo "   ✅ MCP容器已清理"
else
    echo "   ℹ️  无MCP容器运行"
fi

# 2. 停止其他独立容器（newchat-docs, newflow-docs等）
echo "📦 停止文档容器..."
DOC_CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep -E "(newchat-docs|newflow-docs|newmindchat-docs)" || true)
if [ -n "$DOC_CONTAINERS" ]; then
    echo "$DOC_CONTAINERS" | while read container; do
        echo "   停止容器: $container"
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
    done
    echo "   ✅ 文档容器已清理"
else
    echo "   ℹ️  无文档容器运行"
fi

# 3. 停止所有MCP服务器（Node模式）
echo "🔌 停止MCP服务器（Node模式）..."
if [ -d "python_dashboard/mcp_pids" ]; then
    MCP_PIDS_FOUND=0
    for pid_file in python_dashboard/mcp_pids/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if ps -p $pid > /dev/null 2>&1; then
                echo "   停止MCP进程: $pid"
                kill -9 "$pid" 2>/dev/null || true
                MCP_PIDS_FOUND=1
            fi
            rm "$pid_file" 2>/dev/null || true
        fi
    done
    if [ $MCP_PIDS_FOUND -eq 1 ]; then
        echo "   ✅ Node MCP进程已清理"
    else
        echo "   ℹ️  无Node MCP进程运行"
    fi
else
    echo "   ℹ️  无Node MCP进程运行"
fi

# 4. 停止Python Dashboard及所有相关Python进程
echo "🐍 停止Python Dashboard..."
PYTHON_STOPPED=0

# 先尝试从PID文件停止
if [ -f "python_dashboard/dashboard.pid" ]; then
    pid=$(cat python_dashboard/dashboard.pid)
    if ps -p $pid > /dev/null 2>&1; then
        echo "   停止Dashboard进程: $pid"
        kill -9 $pid 2>/dev/null || true
        PYTHON_STOPPED=1
    fi
    rm -f python_dashboard/dashboard.pid
fi

# 清理所有uvicorn进程
UVICORN_PIDS=$(pgrep -f "uvicorn main:app" || true)
if [ -n "$UVICORN_PIDS" ]; then
    echo "$UVICORN_PIDS" | while read pid; do
        echo "   停止uvicorn进程: $pid"
        kill -9 $pid 2>/dev/null || true
        PYTHON_STOPPED=1
    done
fi

# 清理所有python_dashboard相关进程
DASHBOARD_PIDS=$(pgrep -f "python.*dashboard" || true)
if [ -n "$DASHBOARD_PIDS" ]; then
    echo "$DASHBOARD_PIDS" | while read pid; do
        echo "   停止dashboard相关进程: $pid"
        kill -9 $pid 2>/dev/null || true
        PYTHON_STOPPED=1
    done
fi

if [ $PYTHON_STOPPED -eq 1 ]; then
    echo "   ✅ Python Dashboard已清理"
else
    echo "   ℹ️  无Dashboard进程运行"
fi

# 5. 停止LM Studio
echo "🤖 停止LM Studio服务..."
LMS_PIDS=$(pgrep -f "lms server" || true)
if [ -n "$LMS_PIDS" ]; then
    echo "$LMS_PIDS" | while read pid; do
        echo "   停止LM Studio进程: $pid"
        kill -9 $pid 2>/dev/null || true
    done
    echo "   ✅ LM Studio已停止"
else
    echo "   ℹ️  LM Studio未运行"
fi

# 6. 现在安全地停止Docker Compose服务
echo "🐳 停止Docker Compose服务..."
$COMPOSE_CMD down 2>&1 | grep -v "network deploy_newmind_elastic has active endpoints" || true

# 7. 清理可能残留的网络（兜底）
echo "🌐 清理Docker网络..."
if docker network ls | grep -q "deploy_newmind_elastic"; then
    # 等待一下，让容器完全断开
    sleep 2
    docker network rm deploy_newmind_elastic 2>/dev/null || {
        echo "   ⚠️  网络仍在使用中，尝试强制清理..."
        # 查找并断开所有连接
        docker network inspect deploy_newmind_elastic -f '{{range $k, $v := .Containers}}{{$k}} {{end}}' 2>/dev/null | while read container_id; do
            if [ -n "$container_id" ]; then
                echo "   断开容器: $container_id"
                docker network disconnect -f deploy_newmind_elastic "$container_id" 2>/dev/null || true
            fi
        done
        sleep 1
        docker network rm deploy_newmind_elastic 2>/dev/null || echo "   ℹ️  网络将在下次启动时重建"
    }
else
    echo "   ℹ️  网络已清理"
fi

echo ""
echo "✅ 所有服务已停止！"

