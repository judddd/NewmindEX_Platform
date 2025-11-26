#!/bin/bash

# CMDB MCP Server - HTTP模式启动示例
# 
# 使用方法:
#   1. 修改下面的配置信息
#   2. 运行: ./start-http-example.sh

set -e

echo "🚀 启动 CMDB MCP Server (HTTP模式)"
echo ""

# ============ 配置区域 ============
# 请根据实际情况修改以下配置

# CMDB配置
export CMDB_DOMAIN="https://cmdb-service.example.com"
export CMDB_APP_ID="your_app_id"
export CMDB_APP_SECRET="your_app_secret"
export CMDB_VERIFY_SSL="true"  # 设为 false 禁用SSL验证

# HTTP服务器配置
export MCP_TRANSPORT="http"
export MCP_HTTP_PORT="9205"
export MCP_HTTP_HOST="localhost"

# SSL配置（可选）
# 如果CMDB使用自签名证书，取消下面这行注释
# export NODE_TLS_REJECT_UNAUTHORIZED="0"

# ============ 配置区域结束 ============

echo "配置信息:"
echo "  CMDB域名: ${CMDB_DOMAIN}"
echo "  应用ID: ${CMDB_APP_ID}"
echo "  SSL验证: ${CMDB_VERIFY_SSL}"
echo "  监听地址: ${MCP_HTTP_HOST}:${MCP_HTTP_PORT}"
echo ""

# 检查dist目录
if [ ! -d "dist" ]; then
    echo "⚠️  未找到构建产物，正在构建..."
    npm run build
fi

echo "启动服务器..."
node dist/index.js

