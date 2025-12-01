#!/bin/bash

# 模块：MCP服务器构建
# 功能：构建所有MCP服务器（ES、Kibana、NewFlow）

set -e

echo "🔨 构建MCP服务器..."

# 进入项目根目录
cd "$(dirname "$0")/.."

# 构建ES MCP Server
if [ -d "mcp_tool/mcp-server-elasticsearch-sl" ]; then
    if [ -d "mcp_tool/mcp-server-elasticsearch-sl/dist" ] && [ -f "mcp_tool/mcp-server-elasticsearch-sl/dist/index.js" ]; then
        echo "✅ Elasticsearch MCP Server 已构建"
    else
        echo "📦 构建 Elasticsearch MCP Server..."
        cd mcp_tool/mcp-server-elasticsearch-sl
        
        if [ ! -d "node_modules" ]; then
            echo "   安装依赖..."
            npm install
        fi
        
        echo "   编译TypeScript..."
        npm run build
        cd ../..
        echo "✅ Elasticsearch MCP Server构建完成"
    fi
else
    echo "⚠️  Elasticsearch MCP Server目录不存在"
fi

# 构建Kibana MCP Server
if [ -d "mcp_tool/mcp-server-kibana" ]; then
    if [ -d "mcp_tool/mcp-server-kibana/dist" ] && [ -f "mcp_tool/mcp-server-kibana/dist/index.js" ]; then
        echo "✅ Kibana MCP Server 已构建"
    else
        echo "📦 构建 Kibana MCP Server..."
        cd mcp_tool/mcp-server-kibana
        
        if [ ! -d "node_modules" ]; then
            echo "   安装依赖..."
            npm install
        fi
        
        echo "   编译TypeScript..."
        npm run build
        cd ../..
        echo "✅ Kibana MCP Server构建完成"
    fi
else
    echo "⚠️  Kibana MCP Server目录不存在"
fi

# 构建NewFlow MCP Server
if [ -d "mcp_tool/newflow-mcp-server" ]; then
    if [ -d "mcp_tool/newflow-mcp-server/build" ] && [ -f "mcp_tool/newflow-mcp-server/build/index.js" ]; then
        echo "✅ NewFlow MCP Server 已构建"
    else
        echo "📦 构建 NewFlow MCP Server..."
        cd mcp_tool/newflow-mcp-server
        
        if [ ! -d "node_modules" ]; then
            echo "   安装依赖..."
            npm install
        fi
        
        echo "   编译TypeScript..."
        npm run build
        cd ../..
        echo "✅ NewFlow MCP Server构建完成"
    fi
else
    echo "⚠️  NewFlow MCP Server目录不存在"
fi

echo "✅ 所有MCP服务器构建完成！"

