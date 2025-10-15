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
    if curl -s http://localhost:${DASHBOARD_PORT:-8000}/api/status > /dev/null 2>&1; then
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
API_BASE="http://localhost:${DASHBOARD_PORT:-8000}/api/mcp"

# 检查实例是否已存在的函数
instance_exists() {
    local instance_name=$1
    curl -s "${API_BASE}/instances" | grep -q "\"name\":\"${instance_name}\""
}

# 1. 创建Elasticsearch MCP实例（端口3001）
echo ""
echo "📦 创建Elasticsearch MCP实例..."
if instance_exists "本地ES集群"; then
    echo "ℹ️  Elasticsearch MCP实例已存在，跳过"
else
    curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地ES集群",
        "type": "elasticsearch",
        "port": 3001,
        "config": {
          "es_url": "http://localhost:9200",
          "es_username": "elastic",
          "es_password": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "es_disable_ssl": true
        }
      }' | python3 -m json.tool || echo "⚠️  创建失败"
    
    # 启动实例
    sleep 2
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; instances = json.load(sys.stdin).get('instances', []); print([i['id'] for i in instances if i['name'] == '本地ES集群'][0] if instances else '')")
    
    if [ -n "$INSTANCE_ID" ]; then
        echo "🚀 启动Elasticsearch MCP实例..."
        curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" || echo "⚠️  启动失败"
        sleep 3
        echo "✅ Elasticsearch MCP: http://localhost:3001/mcp"
    fi
fi

# 2. 创建Kibana MCP实例（端口3002）
echo ""
echo "📊 创建Kibana MCP实例..."
if instance_exists "本地Kibana"; then
    echo "ℹ️  Kibana MCP实例已存在，跳过"
else
    curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地Kibana",
        "type": "kibana",
        "port": 3002,
        "config": {
          "kibana_url": "http://localhost:5601",
          "kibana_username": "elastic",
          "kibana_password": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "kibana_disable_ssl": true
        }
      }' | python3 -m json.tool || echo "⚠️  创建失败"
    
    # 启动实例
    sleep 2
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; instances = json.load(sys.stdin).get('instances', []); print([i['id'] for i in instances if i['name'] == '本地Kibana'][0] if instances else '')")
    
    if [ -n "$INSTANCE_ID" ]; then
        echo "🚀 启动Kibana MCP实例..."
        curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" || echo "⚠️  启动失败"
        sleep 3
        echo "✅ Kibana MCP: http://localhost:3002/mcp"
    fi
fi

# 3. 创建NewFlow MCP实例（端口3003）
echo ""
echo "🔄 创建NewFlow MCP实例..."
if instance_exists "本地NewFlow"; then
    echo "ℹ️  NewFlow MCP实例已存在，跳过"
else
    # NewFlow在Docker容器中，宿主机上的MCP通过端口映射访问
    # 使用localhost:5677/api/v1（宿主机访问Docker端口映射）
    NEWFLOW_URL="http://localhost:5677/api/v1"
    
    echo "ℹ️  NewFlow URL: $NEWFLOW_URL"
    echo "ℹ️  (MCP在宿主机，通过端口映射访问Docker中的NewFlow)"
    
    curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地NewFlow",
        "type": "newflow",
        "port": 3003,
        "config": {
          "newflow_url": "'"${NEWFLOW_URL}"'",
          "newflow_api_key": "'"${NEWFLOW_API_KEY:-}"'"
        }
      }' | python3 -m json.tool || echo "⚠️  创建失败"
    
    # 启动实例
    sleep 2
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; instances = json.load(sys.stdin).get('instances', []); print([i['id'] for i in instances if i['name'] == '本地NewFlow'][0] if instances else '')")
    
    if [ -n "$INSTANCE_ID" ]; then
        echo "🚀 启动NewFlow MCP实例..."
        curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" || echo "⚠️  启动失败"
        sleep 3
        echo "✅ NewFlow MCP: http://localhost:3003/mcp"
    fi
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
echo "🔗 健康检查："
echo "   curl http://localhost:3001/health"
echo "   curl http://localhost:3002/health"
echo "   curl http://localhost:3003/health"
echo ""
echo "📍 网络架构说明："
echo "   🐳 Docker容器服务："
echo "      • Elasticsearch:  localhost:9200 (容器内: es01:9200)"
echo "      • Kibana:         localhost:5601 (容器内: kibana:5601)"
echo "      • NewFlow:        localhost:5677 (容器内: newflow:5677)"
echo ""
echo "   🖥️  宿主机服务："
echo "      • LM Studio:      localhost:1234"
echo "      • Dashboard:      localhost:8000"
echo "      • MCP Servers:    localhost:3001-3003"
echo ""
echo "   ⚠️  重要："
echo "      • MCP服务器在宿主机，连接Docker服务用 localhost:端口"
echo "      • NewFlow工作流在Docker内，连接LM Studio用 host.docker.internal:1234"
echo ""
echo "📝 NewMindChat配置示例："
echo '   {
     "mcpServers": {
       "local_es": {
         "url": "http://localhost:3001/mcp",
         "name": "本地ES集群"
       },
       "local_kibana": {
         "url": "http://localhost:3002/mcp",
         "name": "本地Kibana"
       },
       "local_newflow": {
         "url": "http://localhost:3003/mcp",
         "name": "本地NewFlow"
       }
     }
   }'
echo ""
echo "===================================="

