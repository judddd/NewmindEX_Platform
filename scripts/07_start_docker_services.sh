#!/bin/bash

# 模块：Docker服务启动
# 功能：启动ES集群、Kibana、Logstash、NewFlow

set -e

echo "🐳 启动Docker服务..."

# 加载配置读取函数
source scripts/lib/config_reader.sh

# 1. 先加载 .env 的运行配置（端口、内存等）
# 注意：过滤掉版本号变量，版本号由 config.yaml 管理
if [ -f .env ]; then
    # 安全地加载 .env 文件：只处理格式正确的变量行，过滤注释和版本号变量
    set -a
    source <(grep -v '^#' .env | grep -E '^[A-Z_][A-Z0-9_]*=' | grep -v '_VERSION=' | sed 's/#.*$//' | sed 's/[[:space:]]*$//')
    set +a
fi

# 2. 再从 config.yaml 导出版本号（优先级最高，不会被覆盖）
export ES_VERSION=$(get_es_version)
export KIBANA_VERSION=$(get_kibana_version)
export LOGSTASH_VERSION=$(get_logstash_version)
export NEWFLOW_VERSION=$(get_newflow_version)

echo "📋 从 config.yaml 读取版本号:"
echo "   Elasticsearch: $ES_VERSION"
echo "   Kibana: $KIBANA_VERSION"
echo "   Logstash: $LOGSTASH_VERSION"
echo "   Newflow: $NEWFLOW_VERSION"

# 导入 NewFlow 镜像（如果尚未导入）
echo "📦 检查 NewFlow 镜像..."
# 从 config.yaml 读取需要的版本，或使用默认版本
REQUIRED_VERSION=$(grep -A2 "newflow:" config.yaml | grep "version:" | awk '{print $2}' | tr -d '"' | head -1)
if [ -z "$REQUIRED_VERSION" ]; then
    REQUIRED_VERSION="1.0.3"
fi

# 检查是否已有所需版本的镜像
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newflow:${REQUIRED_VERSION}$"; then
    NEWFLOW_TAR="installers/newflow-${REQUIRED_VERSION}.tar"
    if [ -f "$NEWFLOW_TAR" ]; then
        echo "📦 导入 NewFlow 镜像: $NEWFLOW_TAR (版本 ${REQUIRED_VERSION})"
        docker load -i "$NEWFLOW_TAR"
        echo "✅ NewFlow 镜像导入成功"
    else
        echo "⚠️  找不到 NewFlow 镜像文件: $NEWFLOW_TAR"
        echo "   将尝试从 Docker Hub 拉取（可能失败）"
    fi
else
    echo "✅ NewFlow 镜像 (${REQUIRED_VERSION}) 已存在，跳过导入"
fi
echo ""

# 导入 NewFlow Docs 镜像（如果尚未导入）
echo "📦 检查 NewFlow Docs 镜像..."
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newflow-docs:1\.0\.0$"; then
    NEWFLOW_DOCS_TAR="installers/newflow-docs-1.0.0.tar"
    if [ -f "$NEWFLOW_DOCS_TAR" ]; then
        echo "📦 导入 NewFlow Docs 镜像: $NEWFLOW_DOCS_TAR"
        docker load -i "$NEWFLOW_DOCS_TAR"
        echo "✅ NewFlow Docs 镜像导入成功"
    else
        echo "⚠️  找不到 NewFlow Docs 镜像文件: $NEWFLOW_DOCS_TAR"
    fi
else
    echo "✅ NewFlow Docs 镜像 (1.0.0) 已存在，跳过导入"
fi
echo ""

# 导入 NewChat Docs 镜像（如果尚未导入）
echo "📦 检查 NewChat Docs 镜像..."
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newchat-docs:1\.0\.1$"; then
    NEWCHAT_DOCS_TAR="installers/newchat-docs-1.0.1.tar"
    if [ -f "$NEWCHAT_DOCS_TAR" ]; then
        echo "📦 导入 NewChat Docs 镜像: $NEWCHAT_DOCS_TAR"
        docker load -i "$NEWCHAT_DOCS_TAR"
        echo "✅ NewChat Docs 镜像导入成功"
    else
        echo "⚠️  找不到 NewChat Docs 镜像文件: $NEWCHAT_DOCS_TAR"
    fi
else
    echo "✅ NewChat Docs 镜像 (1.0.1) 已存在，跳过导入"
fi
echo ""

# 检查docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ docker-compose未安装"
    exit 1
fi

# 使用docker compose或docker-compose
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# 启动前检查 Newflow 初始化状态
echo "🔍 检查 Newflow 初始化状态..."
if [ -f "scripts/check_newflow_init.sh" ]; then
    bash scripts/check_newflow_init.sh
else
    echo "⚠️  跳过 Newflow 初始化检查（脚本不存在）"
fi
echo ""

echo "📦 启动容器..."
$COMPOSE_CMD up -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查容器状态
echo "📊 容器状态："
$COMPOSE_CMD ps

# 等待Elasticsearch集群启动
echo ""
echo "⏳ 等待Elasticsearch集群启动（可能需要几分钟）..."
MAX_WAIT=300
ELAPSED=0

# 检查 ES 是否启用了安全认证（从 docker-compose.yml 读取）
# 兼容 zsh 和 bash：先检查是否存在，再检查值
if grep -q "xpack.security.enabled.*true" docker-compose.yml 2>/dev/null; then
    ES_SECURITY_ENABLED="true"
else
    ES_SECURITY_ENABLED="false"
fi

# 根据安全配置决定是否使用认证
# 兼容 zsh 和 bash：使用条件判断而不是变量展开
ES_URL="http://localhost:${ES_PORT_1:-9200}/_cluster/health"

# 定义 curl 函数，根据安全配置选择参数
curl_es() {
    local url="$1"
    if [ "$ES_SECURITY_ENABLED" = "true" ]; then
        curl -s -u "elastic:${ELASTIC_PASSWORD:-changeme123}" "$url" 2>&1
    else
        curl -s "$url" 2>&1
    fi
}

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # 使用函数调用，确保 zsh 和 bash 都能正确处理
    HEALTH_RESPONSE=$(curl_es "$ES_URL")
    HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$HEALTH_STATUS" = "green" ]; then
        echo "✅ Elasticsearch集群状态: green"
        break
    elif [ "$HEALTH_STATUS" = "yellow" ]; then
        echo "⚠️  Elasticsearch集群状态: yellow (等待变为green...)"
    elif [ -n "$HEALTH_STATUS" ]; then
        echo "⏳ Elasticsearch集群状态: $HEALTH_STATUS (等待变为green...)"
    else
        # 如果无法获取状态，显示错误信息（仅第一次和每30秒）
        if [ $((ELAPSED % 30)) -eq 0 ]; then
            # 兼容 zsh 和 bash 的子字符串截取
            RESPONSE_PREVIEW=$(echo "$HEALTH_RESPONSE" | head -c 100)
            echo "⏳ Elasticsearch未就绪，继续等待... (响应: $RESPONSE_PREVIEW)"
        fi
    fi
    
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "⚠️  警告：Elasticsearch集群启动超时"
    echo "   集群可能仍在初始化，请检查日志: docker logs es01"
    LAST_RESPONSE=$(curl_es "$ES_URL" | head -c 200)
    echo "   最后响应: $LAST_RESPONSE"
    exit 1
else
    # 显示集群信息
    echo ""
    echo "📊 Elasticsearch集群信息："
    curl_es "http://localhost:${ES_PORT_1:-9200}/_cat/nodes?v"
fi

echo ""

# 等待 Kibana 启动
echo "⏳ 等待 Kibana 启动..."
MAX_WAIT_KIBANA=120
ELAPSED_KIBANA=0

while [ $ELAPSED_KIBANA -lt $MAX_WAIT_KIBANA ]; do
    if curl -s http://localhost:${KIBANA_PORT:-5601}/api/status > /dev/null 2>&1; then
        echo "✅ Kibana 已就绪"
        break
    fi
    sleep 5
    ELAPSED_KIBANA=$((ELAPSED_KIBANA + 5))
    if [ $((ELAPSED_KIBANA % 20)) -eq 0 ]; then
        echo "⏳ 等待 Kibana... ($ELAPSED_KIBANA/${MAX_WAIT_KIBANA}秒)"
    fi
done

if [ $ELAPSED_KIBANA -ge $MAX_WAIT_KIBANA ]; then
    echo "⚠️  警告：Kibana 启动超时"
    echo "   Kibana 可能仍在初始化，请检查日志: docker logs kibana"
else
    echo "✅ Kibana 启动成功: http://localhost:${KIBANA_PORT:-5601}"
fi

echo ""

echo "✅ Docker服务启动完成！"
echo ""

# Newflow 启动后自动配置
echo "🔧 等待 Newflow 初始化并自动配置..."
if [ -f "scripts/post_newflow_init.sh" ]; then
    # 在后台运行，不阻塞启动流程
    bash scripts/post_newflow_init.sh &
    echo "ℹ️  Newflow 初始化检查已在后台运行"
else
    echo "⚠️  跳过 Newflow 初始化后检查（脚本不存在）"
fi
echo ""

echo "🔗 服务访问地址："
echo "   Elasticsearch: http://localhost:${ES_PORT_1:-9200} (elastic / ${ELASTIC_PASSWORD:-changeme123})"
echo "   Kibana: http://localhost:${KIBANA_PORT:-5601}"
echo "   Logstash: http://localhost:${LOGSTASH_PORT:-5044}"
echo "   NewFlow: http://localhost:${NEWFLOW_PORT:-5678}"
echo "   NewFlow API 文档: http://localhost:${NEWFLOW_DOCS_PORT:-8081}"
echo "   NewChat 文档: http://localhost:${NEWCHAT_DOCS_PORT:-8082}"
