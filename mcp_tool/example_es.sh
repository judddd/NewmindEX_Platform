docker run -d \
  --name mcp-xiaopeng-es-9202 \
  -p 9003:3000 \
  -e MCP_TRANSPORT=http \
  -e MCP_HTTP_PORT=3000 \
  -e MCP_HTTP_HOST=0.0.0.0 \
  -e ES_URL="https://xiaopenges.tocharian.eu:9201" \
  -e ES_USERNAME="elastic" \
  -e ES_PASSWORD="12345" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  --add-host host.docker.internal:host-gateway \
  --restart unless-stopped \
  newmind-mcp-elasticsearch:1.0.0
