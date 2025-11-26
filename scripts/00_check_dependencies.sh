#!/bin/bash

# 模块：依赖检查
# 功能：检查系统依赖是否满足要求

set -e

echo "🔍 检查系统依赖..."

# 加载环境变量（安全方式）
if [ -f .env ]; then
    set -a
    source <(grep -v '^#' .env | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/#.*$//' | sed 's/[[:space:]]*$//')
    set +a
fi

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装"
    echo "请访问 https://www.docker.com/products/docker-desktop 安装Docker Desktop for Mac"
    exit 1
else
    echo "✅ Docker已安装: $(docker --version)"
fi

# 检查Docker是否运行，如果未运行则自动启动
echo "🐳 检查 Docker 运行状态..."
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker 未运行，正在自动启动 Docker Desktop..."
    
    # 检测操作系统并启动 Docker
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if [ -d "/Applications/Docker.app" ]; then
            echo "📂 找到 Docker.app，正在启动..."
            open -a Docker
            
            # 等待 Docker daemon 启动
            echo "⏳ 等待 Docker 启动..."
            MAX_WAIT=60
            ELAPSED=0
            while [ $ELAPSED -lt $MAX_WAIT ]; do
                if docker info > /dev/null 2>&1; then
                    echo "✅ Docker 已成功启动"
                    break
                fi
                sleep 2
                ELAPSED=$((ELAPSED + 2))
                printf "."
            done
            echo ""
            
            if [ $ELAPSED -ge $MAX_WAIT ]; then
                echo "❌ Docker 启动超时（等待 ${MAX_WAIT}s），请手动检查 Docker Desktop"
                echo "   提示：首次启动 Docker Desktop 可能需要更长时间"
                echo "   您可以手动启动 Docker Desktop 后重新运行此脚本"
                exit 1
            fi
        else
            echo "❌ 未找到 Docker Desktop，请先安装 Docker Desktop"
            echo "   下载地址: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - 尝试启动 Docker 服务
        echo "🐧 检测到 Linux 系统，尝试启动 Docker 服务..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start docker || {
                echo "❌ 无法启动 Docker 服务，请手动启动"
                exit 1
            }
            echo "✅ Docker 服务已启动"
        else
            echo "❌ 未找到 systemctl，请手动启动 Docker"
            exit 1
        fi
    else
        echo "❌ 不支持的操作系统: $OSTYPE"
        echo "   请手动启动 Docker Desktop"
        exit 1
    fi
else
    echo "✅ Docker 正在运行"
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装"
    echo "请访问 https://nodejs.org 安装Node.js 18+"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js已安装: $NODE_VERSION"
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
else
    echo "✅ npm已安装: $(npm --version)"
fi

# 检查uv
if ! command -v uv &> /dev/null; then
    echo "❌ uv未安装"
    echo "请运行: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
else
    echo "✅ uv已安装: $(uv --version)"
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    exit 1
else
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python已安装: $PYTHON_VERSION"
fi

# 检查系统内存
TOTAL_MEM=$(sysctl hw.memsize | awk '{print $2}')
TOTAL_MEM_GB=$((TOTAL_MEM / 1024 / 1024 / 1024))
echo "💾 系统内存: ${TOTAL_MEM_GB}GB"
if [ $TOTAL_MEM_GB -lt 100 ]; then
    echo "⚠️  警告：系统内存为 ${TOTAL_MEM_GB}GB，建议至少100GB用于ES集群（3节点 x 31GB）"
    echo "   当前配置可能导致性能问题或OOM错误"
fi

# 检查可用磁盘空间
AVAILABLE_SPACE=$(df -g . | tail -1 | awk '{print $4}')
echo "💿 可用磁盘空间: ${AVAILABLE_SPACE}GB"
if [ $AVAILABLE_SPACE -lt 100 ]; then
    echo "⚠️  警告：可用磁盘空间为 ${AVAILABLE_SPACE}GB，建议至少100GB"
fi

# 检查端口占用
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  警告：端口 $port ($service) 已被占用"
        return 1
    else
        echo "✅ 端口 $port ($service) 可用"
        return 0
    fi
}

# 特殊处理所有Docker服务端口
for service_port in "${ES_PORT_1:-9200}:Elasticsearch" "${KIBANA_PORT:-5601}:Kibana"; do
    PORT=$(echo $service_port | cut -d: -f1)
    SERVICE=$(echo $service_port | cut -d: -f2)
    if lsof -Pi :$PORT -sTCP:LISTEN 2>/dev/null | grep -q "com.docke"; then
        echo "✅ 端口 $PORT ($SERVICE) - Docker容器已运行"
    else
        check_port $PORT "$SERVICE"
    fi
done

# 特殊处理Docker服务端口：如果是Docker占用则说明服务已在运行
if lsof -Pi :${LOGSTASH_PORT:-5044} -sTCP:LISTEN 2>/dev/null | grep -q "com.docke"; then
    echo "✅ 端口 ${LOGSTASH_PORT:-5044} (Logstash) - Docker容器已运行"
else
    check_port ${LOGSTASH_PORT:-5044} "Logstash"
fi

if lsof -Pi :${NEWFLOW_PORT:-5677} -sTCP:LISTEN 2>/dev/null | grep -q "com.docke"; then
    echo "✅ 端口 ${NEWFLOW_PORT:-5677} (NewFlow) - Docker容器已运行"
else
    check_port ${NEWFLOW_PORT:-5677} "NewFlow"
fi

# LM Studio端口特殊处理（允许LM Studio进程占用）
if lsof -Pi :${LMSTUDIO_PORT:-1234} -sTCP:LISTEN 2>/dev/null | grep -q "lmstudio"; then
    echo "✅ 端口 ${LMSTUDIO_PORT:-1234} (LM Studio) - LM Studio进程已运行"
elif lsof -Pi :${LMSTUDIO_PORT:-1234} -sTCP:LISTEN 2>/dev/null | grep -q "."; then
    echo "⚠️  端口 ${LMSTUDIO_PORT:-1234} (LM Studio) 被其他进程占用"
    lsof -Pi :${LMSTUDIO_PORT:-1234} -sTCP:LISTEN 2>/dev/null | tail -n +2
    echo "   请手动停止该进程或修改 LM Studio 端口配置"
else
    echo "✅ 端口 ${LMSTUDIO_PORT:-1234} (LM Studio) 可用"
fi

# Dashboard端口特殊处理 - 通过进程检查
if pgrep -f "uvicorn main:app" > /dev/null 2>&1; then
    echo "✅ 端口 ${DASHBOARD_PORT:-8000} (Dashboard) - Dashboard进程已运行"
elif lsof -Pi :${DASHBOARD_PORT:-8000} -sTCP:LISTEN 2>/dev/null | grep -q "."; then
    echo "⚠️  警告：端口 ${DASHBOARD_PORT:-8000} (Dashboard) 已被占用"
else
    echo "✅ 端口 ${DASHBOARD_PORT:-8000} (Dashboard) 可用"
fi

echo ""
echo "✅ 所有依赖检查完成！"

