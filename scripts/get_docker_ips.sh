#!/bin/bash
# 获取Docker容器IP地址
# 用于MCP服务器配置

set -e

echo "🔍 获取Docker容器网络信息..."
echo "=================================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 获取网络信息
NETWORK_NAME=$(docker network ls --filter name=elastic --format "{{.Name}}" | head -1)
if [ -z "$NETWORK_NAME" ]; then
    echo "⚠️  Docker网络尚未创建，请先启动服务: bash scripts/start_all.sh"
    exit 1
fi

echo "📡 Docker网络: $NETWORK_NAME"
echo ""

# 获取ES容器IP
if docker ps --filter name=es01 --format "{{.Names}}" | grep -q es01; then
    ES_IP=$(docker inspect es01 --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
    echo "✅ Elasticsearch (es01)"
    echo "   容器IP: $ES_IP"
    echo "   主机访问: http://localhost:9200"
    echo "   Docker IP访问: http://$ES_IP:9200"
    echo ""
else
    echo "⚠️  Elasticsearch容器未运行"
    echo ""
fi

# 获取Kibana容器IP
if docker ps --filter name=kibana --format "{{.Names}}" | grep -q kibana; then
    KIBANA_IP=$(docker inspect kibana --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
    echo "✅ Kibana"
    echo "   容器IP: $KIBANA_IP"
    echo "   主机访问: http://localhost:5601"
    echo "   Docker IP访问: http://$KIBANA_IP:5601"
    echo ""
else
    echo "⚠️  Kibana容器未运行"
    echo ""
fi

# 获取NewFlow容器IP
if docker ps --filter name=newflow --format "{{.Names}}" | grep -q newflow; then
    NEWFLOW_IP=$(docker inspect newflow --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
    echo "✅ NewFlow"
    echo "   容器IP: $NEWFLOW_IP"
    echo "   主机访问: http://localhost:5678"
    echo "   Docker IP访问: http://$NEWFLOW_IP:5678"
    echo ""
else
    echo "⚠️  NewFlow容器未运行"
    echo ""
fi

echo "=================================================="
echo ""
echo "💡 使用建议："
echo "   1. MCP服务器推荐使用 localhost 访问（简单稳定）"
echo "   2. 如果localhost访问失败，可使用Docker IP作为备用"
echo "   3. 容器重启后IP可能变化，需重新获取"
echo ""
echo "📖 详细说明请查看: NETWORK_GUIDE.md"

