#!/bin/bash

# CMDB MCP Server - HTTP Streamable Mode Start Script
# SSL verification is DISABLED by default

# Set your CMDB credentials here or via environment variables
export CMDB_DOMAIN="${CMDB_DOMAIN:-https://cmdb-service.starbucks.net}"
export CMDB_APP_ID="${CMDB_APP_ID:-your-app-id}"
export CMDB_APP_SECRET="${CMDB_APP_SECRET:-your-app-secret}"

# SSL verification: disabled by default (set to "1" to enable)
export CMDB_VERIFY_SSL="${CMDB_VERIFY_SSL:-0}"

# HTTP transport settings
export MCP_TRANSPORT="http"
export MCP_HTTP_PORT="${MCP_HTTP_PORT:-3000}"
export MCP_HTTP_HOST="${MCP_HTTP_HOST:-localhost}"

echo "=========================================="
echo "  CMDB MCP Server - HTTP Streamable Mode"
echo "=========================================="
echo "Domain:       $CMDB_DOMAIN"
echo "App ID:       $CMDB_APP_ID"
echo "SSL Verify:   $CMDB_VERIFY_SSL"
echo "HTTP Host:    $MCP_HTTP_HOST"
echo "HTTP Port:    $MCP_HTTP_PORT"
echo "=========================================="
echo ""

# Start the server
node dist/index.js

