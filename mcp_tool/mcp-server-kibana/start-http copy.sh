#!/bin/bash

# Kibana MCP Server - HTTP Streamable Mode Startup Script

echo "🚀 Starting Kibana MCP Server (HTTP Streamable Mode)"
echo "===================================================="

# Kibana Configuration
export KIBANA_URL="http://xiaopenges.tocharian.eu:5602"
export KIBANA_USERNAME="elastic"
export KIBANA_PASSWORD="tocharian!"
export NODE_TLS_REJECT_UNAUTHORIZED="0"

# MCP Transport Configuration
export MCP_TRANSPORT="http"
export MCP_HTTP_PORT="3001"
export MCP_HTTP_HOST="localhost"

echo ""
echo "📋 Configuration:"
echo "   Kibana URL: ${KIBANA_URL}"
echo "   Username: ${KIBANA_USERNAME}"
echo "   HTTP Host: ${MCP_HTTP_HOST}"
echo "   HTTP Port: ${MCP_HTTP_PORT}"
echo "   TLS Validation: Disabled"
echo ""
echo "🌐 Server will be available at:"
echo "   • MCP Endpoint: http://${MCP_HTTP_HOST}:${MCP_HTTP_PORT}/mcp"
echo "   • Health Check: http://${MCP_HTTP_HOST}:${MCP_HTTP_PORT}/health"
echo ""
echo "⏳ Starting server..."
echo ""

# Start the server (using local build)
node dist/index.js

