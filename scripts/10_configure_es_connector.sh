#!/bin/bash

# 模块：ES Connector配置
# 功能：配置Elasticsearch连接到本地LM Studio

set -e

echo "🔗 配置Elasticsearch Connector..."

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

ES_URL="http://localhost:${ES_PORT_1:-9200}"
ES_USER="elastic"
ES_PASS="${ELASTIC_PASSWORD:-changeme123}"
LM_PORT="${LMSTUDIO_PORT:-1234}"
LM_MODEL="${LM_MODEL:-qwen/qwen3-coder-30b}"

# 检查LM Studio是否运行
if ! curl -s http://localhost:$LM_PORT/v1/models > /dev/null 2>&1; then
    echo "⚠️  LM Studio服务未运行"
    echo "   请先运行: scripts/09_download_lm_model.sh"
    exit 1
fi

echo "✅ LM Studio服务运行正常"

# 创建Inference Connector
echo "📝 创建Inference Connector..."

# 注意：host.docker.internal允许Docker容器访问宿主机
RESPONSE=$(curl -s -X PUT -u ${ES_USER}:${ES_PASS} \
    "${ES_URL}/_inference/qwen-local" \
    -H 'Content-Type: application/json' \
    -d '{
      "service": "openai",
      "service_settings": {
        "api_key": "dummy",
        "url": "http://host.docker.internal:'$LM_PORT'/v1/chat/completions",
        "model_id": "'$LM_MODEL'"
      }
    }')

if echo "$RESPONSE" | grep -q '"inference_id"'; then
    echo "✅ Inference Connector创建成功"
    echo ""
    echo "📊 Connector信息："
    echo "   ID: qwen-local"
    echo "   模型: $LM_MODEL"
    echo "   URL: http://host.docker.internal:$LM_PORT"
    echo ""
    echo "🧪 测试Connector:"
    echo "   curl -u elastic:${ES_PASS} -X POST \"${ES_URL}/_inference/qwen-local\" \\"
    echo "     -H 'Content-Type: application/json' -d '{\"input\": \"Hello, how are you?\"}'"
else
    echo "⚠️  Connector可能已存在或创建失败"
    echo "响应: $RESPONSE"
fi

echo ""
echo "✅ ES Connector配置完成！"

