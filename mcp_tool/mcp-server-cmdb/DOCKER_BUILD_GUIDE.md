# CMDB MCP Server - Docker 构建指南

## 📦 概述

CMDB MCP Server 是一个基于 Model Context Protocol 的服务器，用于连接和查询 CMDB（配置管理数据库）系统。本指南介绍如何构建和部署 Docker 镜像。

## 🔨 快速构建

### 方法一：使用构建脚本（推荐）

```bash
cd /Users/ablatazmat/Downloads/deploy_newmind/mcp_tool/mcp-server-cmdb

# 构建AMD64和ARM64镜像
./build-docker.sh
```

构建脚本会：
1. 检查并构建 TypeScript 代码
2. 构建 ARM64 架构镜像
3. 导出 ARM64 tar 文件
4. 构建 AMD64 架构镜像
5. 导出 AMD64 tar 文件

### 方法二：手动构建

```bash
# 先构建TypeScript
npm run build

# 构建ARM64镜像（Apple Silicon Mac）
docker buildx build --platform linux/arm64 \
  --tag newmind-mcp-cmdb:0.1.0-arm64 \
  --load .

# 构建AMD64镜像（Intel/AMD）
docker buildx build --platform linux/amd64 \
  --tag newmind-mcp-cmdb:0.1.0-amd64 \
  --load .
```

## 📋 构建产物

构建完成后会生成以下文件和镜像：

### Docker 镜像

```
newmind-mcp-cmdb:0.1.0-arm64    # ARM64架构镜像
newmind-mcp-cmdb:0.1.0-amd64    # AMD64架构镜像
```

### Tar 文件

```
newmind-mcp-cmdb-0.1.0-arm64.tar    # ARM64导出文件
newmind-mcp-cmdb-0.1.0-amd64.tar    # AMD64导出文件
```

## 🐳 运行容器

### 基本运行

```bash
docker run -d \
  --name mcp-cmdb-9205 \
  -p 9205:3000 \
  -e MCP_TRANSPORT=http \
  -e CMDB_DOMAIN="https://cmdb-service.example.com" \
  -e CMDB_APP_ID="your_app_id" \
  -e CMDB_APP_SECRET="your_app_secret" \
  -e CMDB_VERIFY_SSL="true" \
  newmind-mcp-cmdb:0.1.0-arm64
```

### 禁用 SSL 验证（开发环境）

```bash
docker run -d \
  --name mcp-cmdb-9205 \
  -p 9205:3000 \
  -e MCP_TRANSPORT=http \
  -e CMDB_DOMAIN="https://cmdb-service.example.com" \
  -e CMDB_APP_ID="your_app_id" \
  -e CMDB_APP_SECRET="your_app_secret" \
  -e CMDB_VERIFY_SSL="false" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  newmind-mcp-cmdb:0.1.0-arm64
```

### 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mcp-cmdb:
    image: newmind-mcp-cmdb:0.1.0-arm64
    container_name: mcp-cmdb-9205
    ports:
      - "9205:3000"
    environment:
      MCP_TRANSPORT: http
      CMDB_DOMAIN: https://cmdb-service.example.com
      CMDB_APP_ID: your_app_id
      CMDB_APP_SECRET: your_app_secret
      CMDB_VERIFY_SSL: "true"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
```

运行:

```bash
docker-compose up -d
```

## 📊 环境变量

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `CMDB_DOMAIN` | CMDB服务域名URL | ✅ | - | `https://cmdb-service.example.com` |
| `CMDB_APP_ID` | 应用ID | ✅ | - | `your_app_id` |
| `CMDB_APP_SECRET` | 应用密钥 | ✅ | - | `your_app_secret` |
| `CMDB_VERIFY_SSL` | 是否验证SSL证书 | ❌ | `true` | `true` 或 `false` |
| `MCP_TRANSPORT` | 传输模式 | ❌ | `stdio` | `http` 或 `stdio` |
| `MCP_HTTP_PORT` | HTTP端口（HTTP模式） | ❌ | `3000` | `3000` |
| `MCP_HTTP_HOST` | HTTP主机（HTTP模式） | ❌ | `localhost` | `0.0.0.0` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | 跳过Node.js SSL验证 | ❌ | - | `0` |

## 🔍 验证部署

### 检查容器状态

```bash
docker ps | grep mcp-cmdb
```

### 测试健康检查

```bash
curl http://localhost:9205/health
```

预期响应:

```json
{
  "status": "ok",
  "transport": "streamable-http",
  "cmdb_domain": "https://cmdb-service.example.com"
}
```

### 测试 MCP 端点

```bash
# 列出可用工具
curl -X POST http://localhost:9205/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### 查看容器日志

```bash
docker logs mcp-cmdb-9205

# 实时查看
docker logs -f mcp-cmdb-9205
```

## 📦 镜像管理

### 导入镜像

```bash
# 从tar文件导入
docker load -i newmind-mcp-cmdb-0.1.0-arm64.tar
```

### 查看镜像信息

```bash
docker images | grep newmind-mcp-cmdb
docker inspect newmind-mcp-cmdb:0.1.0-arm64
```

### 清理镜像

```bash
# 停止并删除容器
docker stop mcp-cmdb-9205
docker rm mcp-cmdb-9205

# 删除镜像
docker rmi newmind-mcp-cmdb:0.1.0-arm64
```

## 🛠️ 故障排除

### 容器无法启动

1. **检查环境变量**
   ```bash
   docker inspect mcp-cmdb-9205 | grep -A 20 Env
   ```

2. **查看详细日志**
   ```bash
   docker logs mcp-cmdb-9205 2>&1 | less
   ```

3. **检查端口占用**
   ```bash
   lsof -i :9205
   ```

### 连接CMDB失败

1. **验证凭证**
   - 确认 `CMDB_APP_ID` 和 `CMDB_APP_SECRET` 正确
   - 检查应用权限

2. **网络连通性**
   ```bash
   # 进入容器测试
   docker exec -it mcp-cmdb-9205 sh
   wget -O- https://cmdb-service.example.com
   ```

3. **SSL证书问题**
   - 开发环境：设置 `CMDB_VERIFY_SSL=false` 和 `NODE_TLS_REJECT_UNAUTHORIZED=0`
   - 生产环境：配置正确的CA证书

### 健康检查失败

```bash
# 手动测试健康端点
docker exec mcp-cmdb-9205 wget --spider http://localhost:3000/health

# 检查进程
docker exec mcp-cmdb-9205 ps aux
```

## 🔄 更新和维护

### 更新镜像

```bash
# 拉取最新代码
git pull

# 重新构建
cd mcp_tool/mcp-server-cmdb
./build-docker.sh

# 停止旧容器
docker stop mcp-cmdb-9205
docker rm mcp-cmdb-9205

# 启动新容器
docker run -d ... newmind-mcp-cmdb:0.1.0-arm64
```

### 备份配置

```bash
# 导出容器配置
docker inspect mcp-cmdb-9205 > cmdb-container-config.json
```

## 📚 相关文档

- [CMDB MCP Server README](./README.md)
- [MCP构建总览](../DOCKER_BUILD_README.md)
- [项目整体文档](../../README.md)

## 📞 技术支持

如有问题，请查看：
- 容器日志：`docker logs mcp-cmdb-9205`
- 项目日志：`logs/mcp_containers/`
- README文档

---

**版本**: 0.1.0  
**最后更新**: 2025-11-19  
**架构支持**: ARM64, AMD64

