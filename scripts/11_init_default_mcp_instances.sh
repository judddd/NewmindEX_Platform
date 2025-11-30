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
    echo "ℹ️  Elasticsearch MCP实例已存在，检查状态..."
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; data = json.load(sys.stdin); instances = data if isinstance(data, list) else data.get('instances', []); matches = [i['id'] for i in instances if i.get('name') == '本地ES集群']; print(matches[0] if matches else '')")
else
    # 创建实例并直接获取ID
    RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地ES集群",
        "type": "elasticsearch",
        "port": 3001,
        "config": {
          "es_url": "http://host.docker.internal:9200",
          "es_username": "elastic",
          "es_password": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "disable_tls": true
        }
      }')
    
    echo "$RESPONSE" | python3 -m json.tool
    INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例
if [ -n "$INSTANCE_ID" ]; then
    echo "🚀 启动Elasticsearch MCP实例..."
    curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
    sleep 3
    echo "✅ Elasticsearch MCP: http://localhost:3001/mcp"
fi

# 2. 创建Kibana MCP实例（端口3002）
echo ""
echo "📊 创建Kibana MCP实例..."
if instance_exists "本地Kibana"; then
    echo "ℹ️  Kibana MCP实例已存在，检查状态..."
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; data = json.load(sys.stdin); instances = data if isinstance(data, list) else data.get('instances', []); matches = [i['id'] for i in instances if i.get('name') == '本地Kibana']; print(matches[0] if matches else '')")
else
    # 创建实例并直接获取ID
    RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地Kibana",
        "type": "kibana",
        "port": 3002,
        "config": {
          "kibana_url": "http://host.docker.internal:5601",
          "kibana_username": "elastic",
          "kibana_password": "'"${ELASTIC_PASSWORD:-changeme123}"'",
          "kibana_space": "default",
          "disable_tls": true
        }
      }')
    
    echo "$RESPONSE" | python3 -m json.tool
    INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例
if [ -n "$INSTANCE_ID" ]; then
    echo "🚀 启动Kibana MCP实例..."
    curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
    sleep 3
    echo "✅ Kibana MCP: http://localhost:3002/mcp"
fi

# 3. 创建NewFlow MCP实例
echo ""
echo "🔄 创建NewFlow MCP实例..."
if instance_exists "本地NewFlow"; then
   echo "ℹ️  NewFlow MCP实例已存在，检查状态..."
   INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; data = json.load(sys.stdin); instances = data if isinstance(data, list) else data.get('instances', []); matches = [i['id'] for i in instances if i.get('name') == '本地NewFlow']; print(matches[0] if matches else '')")
else
   # 创建实例并直接获取ID
   RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "本地NewFlow",
       "type": "newflow",
       "port": 3003,
       "config": {
         "newflow_url": "http://host.docker.internal:5678",
         "disable_tls": true
       }
     }')
   
   echo "$RESPONSE" | python3 -m json.tool
   INSTANCE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
fi

# 启动实例
if [ -n "$INSTANCE_ID" ]; then
   echo "🚀 启动NewFlow MCP实例..."
   curl -s -X POST "${API_BASE}/instances/${INSTANCE_ID}/start" | python3 -m json.tool
   sleep 3
   echo "✅ NewFlow MCP: http://localhost:3003/mcp"
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
echo "   🐳 Docker Compose服务（elastic网络）："
echo "      • Elasticsearch:  localhost:9200"
echo "      • Kibana:         localhost:5601"
echo "      • NewFlow:        localhost:5678"
echo ""
echo "   🖥️  宿主机服务："
echo "      • LM Studio:      localhost:1234"
echo "      • Dashboard:      localhost:8000"
echo "      • MCP Servers:    localhost:3001-3003 (独立Docker容器)"
echo ""
echo "   ⚠️  网络访问规则："
echo "      • MCP Docker容器访问宿主机服务: host.docker.internal:端口"
echo "      • MCP Docker容器 ✗ 无法通过容器名访问docker-compose服务（不同网络）"
echo "      • NewFlow工作流访问LM Studio: host.docker.internal:1234"
echo ""
echo "📝 NewChat配置示例："
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

