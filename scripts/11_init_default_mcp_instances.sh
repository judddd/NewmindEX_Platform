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
          "es_url": "http://es01:9200",
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
          "kibana_url": "http://kibana:5601",
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

# 3. 创建NewFlow MCP实例（端口3003）
echo ""
echo "🔄 创建NewFlow MCP实例..."
if instance_exists "本地NewFlow"; then
    echo "ℹ️  NewFlow MCP实例已存在，检查状态..."
    INSTANCE_ID=$(curl -s "${API_BASE}/instances" | python3 -c "import sys, json; data = json.load(sys.stdin); instances = data if isinstance(data, list) else data.get('instances', []); matches = [i['id'] for i in instances if i.get('name') == '本地NewFlow']; print(matches[0] if matches else '')")
else
    # MCP容器在Docker内部，直接使用服务名访问
    NEWFLOW_URL="http://newflow:5677/api/v1"
    
    echo "ℹ️  NewFlow URL: $NEWFLOW_URL"
    echo "ℹ️  (MCP容器通过Docker服务名访问NewFlow)"
    
    # 🔑 自动提取NewFlow生成的API Key
    echo "🔑 从NewFlow提取API Key..."
    
    # 方法1: 从日志中提取（优先）
    EXTRACTED_API_KEY=$(docker logs newflow 2>&1 | grep "API Key:" | tail -1 | awk '{print $NF}')
    
    # 方法2: 如果日志中没找到，从数据库提取
    if [ -z "$EXTRACTED_API_KEY" ]; then
        echo "   ⚠️  日志中未找到，尝试从数据库提取..."
        EXTRACTED_API_KEY=$(sqlite3 newflow_data/database.sqlite "SELECT apiKey FROM user_api_keys LIMIT 1;" 2>/dev/null)
    fi
    
    # 使用提取的Key，如果都没找到则使用环境变量
    if [ -n "$EXTRACTED_API_KEY" ]; then
        NEWFLOW_API_KEY="$EXTRACTED_API_KEY"
        echo "   ✅ 成功提取API Key: ${NEWFLOW_API_KEY:0:50}..."
        
        # 更新配置文件以便后续使用
        echo "   📝 更新配置文件..."
        sed -i '' "s|^NEWFLOW_API_KEY=.*|NEWFLOW_API_KEY=$NEWFLOW_API_KEY|" copy.enva 2>/dev/null || true
        sed -i '' "s|^NEWFLOW_API_KEY=.*|NEWFLOW_API_KEY=$NEWFLOW_API_KEY|" .env 2>/dev/null || true
    else
        echo "   ⚠️  未能提取API Key，使用环境变量中的值"
        NEWFLOW_API_KEY="${NEWFLOW_API_KEY:-}"
    fi
    
    # 创建实例并直接获取ID
    RESPONSE=$(curl -s -X POST "${API_BASE}/instances" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "本地NewFlow",
        "type": "newflow",
        "port": 3003,
        "config": {
          "newflow_url": "'"${NEWFLOW_URL}"'",
          "newflow_api_key": "'"${NEWFLOW_API_KEY}"'"
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

