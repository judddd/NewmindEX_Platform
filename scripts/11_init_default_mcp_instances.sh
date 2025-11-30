#!/bin/bash

# 初始化默认MCP实例
# 创建3个预配置的MCP服务器：ES、Kibana、NewFlow

set -e

echo "🔧 初始化默认MCP实例..."

# 加载环境变量
set -a
source "$(dirname "$0")/../.env" 2>/dev/null || true
set +a

# 等待Dashboard API可用
echo "⏳ 等待Dashboard API就绪..."
for i in {1..30}; do
    if curl -s http://localhost:${DASHBOARD_PORT:-80}/api/status > /dev/null 2>&1; then
        echo "✅ Dashboard API已就绪"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Dashboard API启动超时"
        exit 1
    fi
    sleep 2
done

# API基础URL
API_BASE="http://localhost:${DASHBOARD_PORT:-80}/api/mcp"

# 检查实例是否已存在的函数
instance_exists() {
    local instance_name=$1
    curl -s "${API_BASE}/instances" | grep -q "\"name\":\"${instance_name}\""
}

# 1. 创建Elasticsearch MCP实例（端口3001）
echo ""
echo "📦 创建Elasticsearch MCP实例..."
if instance_exists "Elasticsearch Cluster"; then
    echo "ℹ️  Elasticsearch MCP实例已存在"
else
    # 创建实例并直接获取ID
    RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Elasticsearch Cluster",
        "type": "elasticsearch",
        "port": 3001,
        "config": {
          "ES_URL": "http://host.docker.internal:9200",
          "ES_USERNAME": "elastic",
          "ES_PASSWORD": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "MAX_TOKEN_CALL": "8000",
          "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
      }')
    
    echo "$RESPONSE" | python3 -m json.tool
    INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例 (ES)
if [ -n "$INSTANCE_ID" ]; then
    echo "🚀 启动Elasticsearch MCP实例..."
    curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
fi


# 2. 创建Kibana MCP实例（端口3002）
echo ""
echo "📊 创建Kibana MCP实例..."
if instance_exists "Kibana Service"; then
    echo "ℹ️  Kibana MCP实例已存在"
else
    # 创建实例并直接获取ID
    RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Kibana Service",
        "type": "kibana",
        "port": 3002,
        "config": {
          "KIBANA_URL": "http://host.docker.internal:5601",
          "KIBANA_USERNAME": "elastic",
          "KIBANA_PASSWORD": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "KIBANA_DEFAULT_SPACE": "default",
          "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
      }')
    
    echo "$RESPONSE" | python3 -m json.tool
    INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例 (Kibana)
if [ -n "$INSTANCE_ID" ]; then
    echo "🚀 启动Kibana MCP实例..."
    curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
fi


# 3. 创建NewFlow MCP实例
echo ""
echo "🔄 创建NewFlow MCP实例..."
if instance_exists "NewFlow Workflow"; then
   echo "ℹ️  NewFlow MCP实例已存在"
else
   # 创建实例并直接获取ID
   RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "NewFlow Workflow",
       "type": "newflow",
       "port": 3003,
       "config": {
         "NEWFLOW_API_URL": "http://host.docker.internal:5678/api/v1",
         "NEWFLOW_API_KEY": "your_api_key_here",
         "NEWFLOW_WEBHOOK_USERNAME": "username",
         "NEWFLOW_WEBHOOK_PASSWORD": "password",
         "NODE_TLS_REJECT_UNAUTHORIZED": "0"
       }
     }')
   
   echo "$RESPONSE" | python3 -m json.tool
   INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例 (NewFlow)
if [ -n "$INSTANCE_ID" ]; then
   echo "🚀 启动NewFlow MCP实例..."
   curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
fi

echo ""
echo "===================================="
echo "✅ 默认MCP实例初始化完成！"
echo ""
echo "📋 MCP服务地址（宿主机）："
echo "   🔍 Elasticsearch MCP: http://localhost:3001/mcp"
echo "   📊 Kibana MCP:        http://localhost:3002/mcp"
echo "   🔄 NewFlow MCP:       http://localhost:3003/mcp"
echo ""
echo "===================================="
