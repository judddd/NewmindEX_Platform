#!/bin/bash

# 模块：激活ES试用许可
# 功能：激活Elasticsearch 30天企业试用许可

set -e

echo "🔑 激活Elasticsearch试用许可..."

# 加载环境变量（安全方式）
if [ -f .env ]; then
    set -a
    source <(grep -v '^#' .env | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/#.*$//' | sed 's/[[:space:]]*$//')
    set +a
fi

ES_URL="http://localhost:${ES_PORT_1:-9200}"
ES_USER="elastic"
ES_PASS="${ELASTIC_PASSWORD:-changeme123}"

# 检查当前许可证状态
echo "📊 检查当前许可证状态..."
LICENSE_INFO=$(curl -s -u ${ES_USER}:${ES_PASS} "${ES_URL}/_license")

if echo "$LICENSE_INFO" | grep -q '"type" *: *"trial"'; then
    echo "✅ 试用许可证已激活"
    echo "$LICENSE_INFO" | grep -o '"expiry_date_in_millis":[0-9]*' | head -1
    exit 0
elif echo "$LICENSE_INFO" | grep -q '"type" *: *"basic"'; then
    echo "📝 当前为基础许可证，正在激活试用许可..."
else
    echo "📝 许可证状态：$(echo "$LICENSE_INFO" | grep -o '"type" *: *"[^"]*"' | head -1)"
fi

# 激活试用许可
echo "🔐 正在激活30天试用许可..."
RESPONSE=$(curl -s -X POST -u ${ES_USER}:${ES_PASS} \
    "${ES_URL}/_license/start_trial?acknowledge=true")

if echo "$RESPONSE" | grep -q '"acknowledged" *: *true'; then
    echo "✅ 试用许可证激活成功！"
    echo "   有效期：30天"
    echo ""
    echo "📊 许可证功能："
    echo "   • Machine Learning"
    echo "   • Security（审计、加密）"
    echo "   • Alerting"
    echo "   • Graph"
    echo "   • Watcher"
    echo ""
    echo "⚠️  提示：30天后需要购买商业许可证或降级为基础功能"
else
    echo "❌ 激活失败"
    echo "响应：$RESPONSE"
    exit 1
fi

