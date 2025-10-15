#!/bin/bash

echo "🔍 检查所有服务状态..."
echo ""

# 检查Docker服务
echo "📦 Docker容器状态:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|es0|kibana|logstash|newflow"
echo ""

# 检查 Elasticsearch
echo "🔍 Elasticsearch状态:"
if curl -s http://localhost:9200 >/dev/null 2>&1; then
    echo "✅ ES Node 1 (9200) - 运行中"
    curl -s http://localhost:9200/_cluster/health | jq -r '"集群状态: \(.status) | 节点数: \(.number_of_nodes)"' 2>/dev/null || echo "   (无法获取集群详情,可能尚未完全启动)"
else
    echo "⚠️  ES Node 1 (9200) - 尚未就绪"
fi
echo ""

# 检查 Kibana
echo "📊 Kibana状态:"
if curl -s http://localhost:5601/api/status >/dev/null 2>&1; then
    echo "✅ Kibana (5601) - 运行中"
else
    echo "⚠️  Kibana (5601) - 尚未就绪 (可能需要1-2分钟启动)"
fi
echo ""

# 检查 NewFlow
echo "🔄 NewFlow状态:"
if curl -s http://localhost:5677 >/dev/null 2>&1; then
    echo "✅ NewFlow (5677) - 运行中"
else
    echo "⚠️  NewFlow (5677) - 尚未就绪"
fi
echo ""

# 检查 LM Studio
echo "🤖 LM Studio状态:"
if curl -s http://localhost:1234/v1/models >/dev/null 2>&1; then
    echo "✅ LM Studio (1234) - 运行中"
else
    echo "❌ LM Studio (1234) - 未运行 (需要手动启动)"
fi
echo ""

# 检查 Python Dashboard
echo "🎛️  Python Dashboard状态:"
if [ -f "python_dashboard/dashboard.pid" ]; then
    PID=$(cat python_dashboard/dashboard.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Dashboard - 运行中 (PID: $PID)"
    else
        echo "❌ Dashboard - 未运行 (PID文件存在但进程不存在)"
    fi
else
    echo "❌ Dashboard - 未运行"
fi
echo ""

echo "提示: ES和Kibana可能需要1-2分钟完全启动"
echo "📝 查看日志: docker logs <容器名>"

