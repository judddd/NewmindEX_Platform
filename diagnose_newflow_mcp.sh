#!/bin/bash

echo "🔍 NewFlow MCP Server 完整诊断"
echo "================================"

echo -e "\n1️⃣ Docker镜像:"
docker images | grep newflow-mcp

echo -e "\n2️⃣ 运行中的容器:"
docker ps | grep newflow-mcp

echo -e "\n3️⃣ 容器网络:"
docker inspect mcp-mcp-newflow-b3b7d204 --format='{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{println}}{{end}}' 2>/dev/null || echo "容器不存在"

echo -e "\n4️⃣ 环境变量:"
docker exec mcp-mcp-newflow-b3b7d204 env | grep NEWFLOW 2>/dev/null || echo "容器未运行"

echo -e "\n5️⃣ 健康状态:"
curl -s http://localhost:3003/health 2>/dev/null || echo "健康检查失败"

echo -e "\n6️⃣ MCP工具列表:"
curl -s -X POST http://localhost:3003/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' 2>/dev/null | python3 -c \
  "import sys, json; data=json.load(sys.stdin); tools = data.get('result', {}).get('tools', []); print(f'可用工具: {len(tools)} 个') if tools else print('❌ MCP错误:', data.get('error', {}).get('message', 'Unknown'))" || echo "MCP端点不可用"

echo -e "\n7️⃣ 容器日志 (最近15行):"
docker logs --tail 15 mcp-mcp-newflow-b3b7d204 2>&1 | tail -15

echo -e "\n8️⃣ NewFlow API测试:"
API_KEY=$(grep NEWFLOW_API_KEY env.copy 2>/dev/null | cut -d'=' -f2)
if [ -z "$API_KEY" ]; then
    echo "❌ 未找到API Key配置"
else
    echo "使用API Key: ${API_KEY:0:20}..."
    curl -s --header "X-N8N-API-KEY: $API_KEY" \
      http://localhost:5677/api/v1/workflows 2>&1 | python3 -c \
      "import sys, json; 
try:
    data = json.load(sys.stdin); 
    if 'data' in data:
        print(f'✅ API正常 - 找到 {len(data[\"data\"])} 个工作流')
    elif 'message' in data:
        print(f'❌ API错误: {data[\"message\"]}')
    else:
        print('❌ 未知响应')
except:
    print('❌ API认证失败或返回非JSON')" 2>/dev/null || echo "❌ API测试失败"
fi

echo -e "\n9️⃣ Dashboard状态:"
curl -s http://localhost:8000/api/status 2>&1 | python3 -c \
  "import sys, json; data=json.load(sys.stdin); print(f'MCP实例: {data[\"mcp_servers\"][\"running\"]}/{data[\"mcp_servers\"][\"total\"]} 运行中')" || echo "Dashboard不可用"

echo -e "\n================================"
echo "✅ 诊断完成"
echo ""
echo "📝 常见问题解决方案："
echo "  1. 如果API认证失败 → 从NewFlow UI生成新API Key"
echo "  2. 如果容器未运行 → curl -X POST http://localhost:8000/api/mcp/instances/mcp-newflow-b3b7d204/start"
echo "  3. 如果网络问题 → 检查 deploy_newmind_elastic 网络是否存在"
echo "  4. 详细文档 → NEWFLOW_MCP_GUIDE.md"


