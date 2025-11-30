@echo off
REM CMDB MCP Server - HTTP Streamable Mode Start Script (Windows)
REM SSL verification is DISABLED by default

REM Set your CMDB credentials here or via environment variables
if not defined CMDB_DOMAIN set CMDB_DOMAIN=https://cmdb-service.starbucks.net
if not defined CMDB_APP_ID set CMDB_APP_ID=your-app-id
if not defined CMDB_APP_SECRET set CMDB_APP_SECRET=your-app-secret

REM SSL verification: disabled by default (set to "1" to enable)
if not defined CMDB_VERIFY_SSL set CMDB_VERIFY_SSL=0

REM HTTP transport settings
set MCP_TRANSPORT=http
if not defined MCP_HTTP_PORT set MCP_HTTP_PORT=3000
if not defined MCP_HTTP_HOST set MCP_HTTP_HOST=localhost

echo ==========================================
echo   CMDB MCP Server - HTTP Streamable Mode
echo ==========================================
echo Domain:       %CMDB_DOMAIN%
echo App ID:       %CMDB_APP_ID%
echo SSL Verify:   %CMDB_VERIFY_SSL%
echo HTTP Host:    %MCP_HTTP_HOST%
echo HTTP Port:    %MCP_HTTP_PORT%
echo ==========================================
echo.

REM Start the server
node dist\index.js

