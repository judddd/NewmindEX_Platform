#!/bin/bash

# 模块：Docker服务启动
# 功能：启动ES集群、Kibana、Logstash、NewFlow

set -e

echo "🐳 启动Docker服务..."

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 导入 NewFlow 镜像（如果尚未导入）
echo "📦 检查 NewFlow 镜像..."
# 精确匹配 "newflow" 开头且版本为 1.0.x（排除 newflow-docs 等）
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newflow:1\.0"; then
    NEWFLOW_TAR=$(ls installers/newflow-1.0.*.tar 2>/dev/null | head -1)
    if [ -n "$NEWFLOW_TAR" ]; then
        echo "📦 导入 NewFlow 镜像: $NEWFLOW_TAR"
        docker load -i "$NEWFLOW_TAR"
        echo "✅ NewFlow 镜像导入成功"
    else
        echo "⚠️  找不到 NewFlow 镜像文件（installers/newflow-1.0.*.tar）"
        echo "   将尝试从 Docker Hub 拉取（可能失败）"
    fi
else
    echo "✅ NewFlow 镜像已存在，跳过导入"
fi
echo ""

# 导入 NewFlow Docs 镜像（如果尚未导入）
echo "📦 检查 NewFlow Docs 镜像..."
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newflow-docs:"; then
    NEWFLOW_DOCS_TAR=$(ls installers/newflow-docs-*.tar 2>/dev/null | head -1)
    if [ -n "$NEWFLOW_DOCS_TAR" ]; then
        echo "📦 导入 NewFlow Docs 镜像: $NEWFLOW_DOCS_TAR"
        docker load -i "$NEWFLOW_DOCS_TAR"
        echo "✅ NewFlow Docs 镜像导入成功"
    else
        echo "⚠️  找不到 NewFlow Docs 镜像文件（installers/newflow-docs-*.tar）"
    fi
else
    echo "✅ NewFlow Docs 镜像已存在，跳过导入"
fi
echo ""

# 导入 NewChat Docs 镜像（如果尚未导入）
echo "📦 检查 NewChat Docs 镜像..."
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -qE "^newchat-docs:"; then
    NEWCHAT_DOCS_TAR=$(ls installers/newchat-docs-*.tar 2>/dev/null | head -1)
    if [ -n "$NEWCHAT_DOCS_TAR" ]; then
        echo "📦 导入 NewChat Docs 镜像: $NEWCHAT_DOCS_TAR"
        docker load -i "$NEWCHAT_DOCS_TAR"
        echo "✅ NewChat Docs 镜像导入成功"
    else
        echo "⚠️  找不到 NewChat Docs 镜像文件（installers/newchat-docs-*.tar）"
    fi
else
    echo "✅ NewChat Docs 镜像已存在，跳过导入"
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

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s -u elastic:${ELASTIC_PASSWORD:-changeme123} http://localhost:${ES_PORT_1:-9200}/_cluster/health 2>/dev/null | grep -q '"status":"green"'; then
        echo "✅ Elasticsearch集群状态: green"
        break
    elif curl -s -u elastic:${ELASTIC_PASSWORD:-changeme123} http://localhost:${ES_PORT_1:-9200}/_cluster/health 2>/dev/null | grep -q '"status":"yellow"'; then
        echo "⚠️  Elasticsearch集群状态: yellow (等待变为green...)"
    else
        echo "⏳ Elasticsearch未就绪，继续等待..."
    fi
    
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "⚠️  警告：Elasticsearch集群启动超时"
    echo "   集群可能仍在初始化，请检查日志: docker logs es01"
else
    # 显示集群信息
    echo ""
    echo "📊 Elasticsearch集群信息："
    curl -s -u elastic:${ELASTIC_PASSWORD:-changeme123} http://localhost:${ES_PORT_1:-9200}/_cat/nodes?v
fi

echo ""

# 启动 NewFlow Docs 容器（独立于 docker-compose）
echo "📚 启动 NewFlow API 文档服务..."

# 自动查找可用的 newflow-docs 镜像版本
NEWFLOW_DOCS_IMAGE=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "^newflow-docs:" | head -1)

if [ -n "$NEWFLOW_DOCS_IMAGE" ]; then
    echo "📦 使用镜像: $NEWFLOW_DOCS_IMAGE"
    
    # 停止旧容器（如果存在）
    docker stop newflow-docs 2>/dev/null || true
    docker rm newflow-docs 2>/dev/null || true
    
    # 启动新容器
    if docker run -d --name newflow-docs -p ${NEWFLOW_DOCS_PORT:-8001}:8001 "$NEWFLOW_DOCS_IMAGE" 2>/dev/null; then
        echo "✅ NewFlow API 文档已启动: http://localhost:${NEWFLOW_DOCS_PORT:-8001}"
    else
        echo "⚠️  NewFlow API 文档启动失败"
    fi
else
    echo "⚠️  NewFlow Docs 镜像不存在，跳过文档服务启动"
fi
echo ""

# 启动 NewChat Docs 容器（独立于 docker-compose）
echo "📚 启动 NewChat 文档服务..."

# 自动查找可用的 newchat-docs 镜像版本
NEWCHAT_IMAGE=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "^newchat-docs:" | head -1)

if [ -n "$NEWCHAT_IMAGE" ]; then
    echo "📦 使用镜像: $NEWCHAT_IMAGE"
    
    # 停止旧容器（如果存在）
    docker stop newchat-docs 2>/dev/null || true
    docker rm newchat-docs 2>/dev/null || true
    
    # 启动新容器
    if docker run -d --name newchat-docs -p ${NEWCHAT_DOCS_PORT:-8002}:8002 "$NEWCHAT_IMAGE" 2>/dev/null; then
        echo "✅ NewChat 文档已启动: http://localhost:${NEWCHAT_DOCS_PORT:-8002}"
    else
        echo "⚠️  NewChat 文档启动失败"
    fi
else
    echo "⚠️  NewChat Docs 镜像不存在，跳过文档服务启动"
fi
echo ""

echo "✅ Docker服务启动完成！"
echo ""
echo "🔗 服务访问地址："
echo "   Elasticsearch: http://localhost:${ES_PORT_1:-9200} (elastic / ${ELASTIC_PASSWORD:-changeme123})"
echo "   Kibana: http://localhost:${KIBANA_PORT:-5601}"
echo "   Logstash: http://localhost:${LOGSTASH_PORT:-5044}"
echo "   NewFlow: http://localhost:${NEWFLOW_PORT:-5677}"
echo "   NewFlow API 文档: http://localhost:${NEWFLOW_DOCS_PORT:-8001}"
echo "   NewChat 文档: http://localhost:${NEWCHAT_DOCS_PORT:-8002}"

