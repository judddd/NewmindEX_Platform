# Elasticsearch MCP Server - Docker 构建指南

## 📦 可用的构建脚本

本目录包含以下Docker构建脚本：

| 脚本名称 | 用途 | 架构 |
|---------|------|------|
| `build-docker-amd64.sh` | 构建AMD64架构镜像 | linux/amd64 (Intel/AMD) |
| `build-docker-arm64.sh` | 构建ARM64架构镜像 | linux/arm64 (Apple Silicon) |
| `build-docker-multiarch.sh` | 同时构建两种架构 | linux/amd64, linux/arm64 |
| `export-docker-images.sh` | 导出镜像为tar文件 | - |

## 🚀 快速开始

### 1. 构建单一架构镜像

#### AMD64 (Intel/AMD 处理器)
```bash
./build-docker-amd64.sh
```

#### ARM64 (Apple Silicon Mac)
```bash
./build-docker-arm64.sh
```

### 2. 构建多架构镜像
```bash
./build-docker-multiarch.sh
```

### 3. 导出镜像
```bash
./export-docker-images.sh
```

导出的tar文件会保存在 `./docker-exports/` 目录。

## 📋 构建前提条件

### 必需环境
- ✅ Node.js 18+
- ✅ Docker
- ✅ npm 依赖已安装 (`npm install`)

### 多架构构建额外要求
- ✅ Docker Buildx（Docker Desktop自带）

验证Buildx：
```bash
docker buildx version
```

## 🎯 构建后的镜像命名

```
newmind-mcp-elasticsearch:0.3.0-amd64    # AMD64架构
newmind-mcp-elasticsearch:0.3.0-arm64    # ARM64架构
newmind-mcp-elasticsearch:latest-amd64   # AMD64 latest标签
newmind-mcp-elasticsearch:latest-arm64   # ARM64 latest标签
newmind-mcp-elasticsearch:latest         # 多架构通用标签
```

## 🐳 运行容器示例

### 基本运行（跳过SSL验证）
```bash
docker run -d \
  --name mcp-es-server \
  -p 9202:3000 \
  -e MCP_TRANSPORT=http \
  -e MCP_HTTP_PORT=3000 \
  -e MCP_HTTP_HOST=0.0.0.0 \
  -e ES_URL="https://your-es-cluster.com:9200" \
  -e ES_USERNAME="elastic" \
  -e ES_PASSWORD="your_password" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  --add-host host.docker.internal:host-gateway \
  --restart unless-stopped \
  newmind-mcp-elasticsearch:latest-arm64
```

### 使用API Key认证
```bash
docker run -d \
  --name mcp-es-server \
  -p 9202:3000 \
  -e MCP_TRANSPORT=http \
  -e ES_URL="https://your-es-cluster.com:9200" \
  -e ES_API_KEY="your_base64_api_key" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  newmind-mcp-elasticsearch:latest-arm64
```

### 使用自定义CA证书
```bash
docker run -d \
  --name mcp-es-server \
  -p 9202:3000 \
  -e MCP_TRANSPORT=http \
  -e ES_URL="https://your-es-cluster.com:9200" \
  -e ES_USERNAME="elastic" \
  -e ES_PASSWORD="your_password" \
  -e ES_CA_CERT="/certs/ca.crt" \
  -v /path/to/certs:/certs:ro \
  newmind-mcp-elasticsearch:latest-arm64
```

## 🔧 环境变量说明

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ES_URL` | Elasticsearch集群地址 | `https://es.example.com:9200` |
| `MCP_TRANSPORT` | 传输模式（固定为http） | `http` |

### 认证变量（三选一）

| 方式 | 变量 | 说明 |
|------|------|------|
| **用户名密码** | `ES_USERNAME`<br>`ES_PASSWORD` | 基本认证 |
| **API Key** | `ES_API_KEY` | Base64编码的API Key |
| **无认证** | - | 本地开发环境 |

### 可选变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `MCP_HTTP_PORT` | `3000` | 容器内监听端口 |
| `MCP_HTTP_HOST` | `0.0.0.0` | 监听地址 |
| `NODE_TLS_REJECT_UNAUTHORIZED` | - | 设为`0`跳过SSL验证 |
| `ES_CA_CERT` | - | 自定义CA证书路径 |

## 📦 镜像导出和导入

### 导出镜像
```bash
# 导出AMD64镜像
docker save newmind-mcp-elasticsearch:0.3.0-amd64 -o mcp-es-amd64.tar

# 导出ARM64镜像
docker save newmind-mcp-elasticsearch:0.3.0-arm64 -o mcp-es-arm64.tar

# 或使用自动化脚本
./export-docker-images.sh
```

### 在目标机器导入
```bash
# AMD64机器
docker load -i mcp-es-amd64.tar

# ARM64机器（Apple Silicon）
docker load -i mcp-es-arm64.tar
```

## 🔍 验证和测试

### 1. 检查容器运行状态
```bash
docker ps | grep mcp-es-server
```

### 2. 查看容器日志
```bash
docker logs mcp-es-server
```

### 3. 健康检查
```bash
curl http://localhost:9202/health
```

应该返回：
```json
{
  "status": "ok",
  "transport": "streamable-http",
  "elasticsearch_url": "https://your-es-cluster.com:9200"
}
```

### 4. 测试MCP端点
```bash
curl -X POST http://localhost:9202/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### 5. 测试列出ES索引
```bash
curl -X POST http://localhost:9202/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_indices",
      "arguments": {}
    }
  }'
```

## 🛠️ 故障排查

### 构建失败
```bash
# 清理并重新构建
docker system prune -a
npm run build
./build-docker-arm64.sh
```

### 连接ES失败
1. 检查网络连通性：`curl -k https://your-es-cluster.com:9200`
2. 验证用户名密码
3. 确认防火墙设置
4. 查看容器日志：`docker logs mcp-es-server`

### SSL证书问题
- 临时解决：设置 `NODE_TLS_REJECT_UNAUTHORIZED=0`
- 长期方案：使用正确的CA证书

## 📚 相关文档

- [Elasticsearch Client文档](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)
- [MCP协议规范](https://modelcontextprotocol.io)
- [Docker Buildx文档](https://docs.docker.com/buildx/working-with-buildx/)

## 🔒 安全建议

1. ✅ **生产环境不要使用** `NODE_TLS_REJECT_UNAUTHORIZED=0`
2. ✅ **使用API Key** 而不是用户名密码
3. ✅ **配置正确的CA证书**
4. ✅ **限制容器网络访问**
5. ✅ **定期更新镜像**

## 📝 版本信息

- Package Version: 0.3.0
- Node Version: 20-alpine
- Elasticsearch Client: ^8.17.1
- MCP SDK: ^1.19.1

---

**需要帮助？** 查看项目 [README.md](./README.md) 或提交 [Issue](https://github.com/TocharianOU/mcp-server-elasticsearch-sl/issues)

