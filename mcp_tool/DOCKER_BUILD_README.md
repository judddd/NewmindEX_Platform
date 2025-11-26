# MCP服务器 Docker 构建总览

本目录包含四个MCP (Model Context Protocol) 服务器的Docker构建脚本。

## 📦 可用的MCP服务器

| MCP服务器 | 版本 | 目录 | 说明 |
|----------|------|------|------|
| **Elasticsearch** | 0.3.0 | `mcp-server-elasticsearch-sl/` | 连接Elasticsearch集群 |
| **Kibana** | 0.4.0 | `mcp-server-kibana/` | 连接Kibana服务 |
| **NewFlow** | 1.0.0 | `newflow-mcp-server/` | 连接NewFlow工作流引擎 |
| **CMDB** | 0.1.0 | `mcp-server-cmdb/` | 连接CMDB配置管理数据库 |

## 🚀 快速开始

### 统一的构建脚本命名

每个MCP服务器目录都包含构建脚本：

```bash
build-docker.sh              # 统一构建脚本（同时构建AMD64和ARM64）
```

### 示例：构建Elasticsearch MCP服务器

```bash
# 进入Elasticsearch MCP目录
cd mcp-server-elasticsearch-sl/

# 构建镜像（同时构建AMD64和ARM64）
./build-docker.sh
```

### 示例：构建所有MCP服务器

```bash
# 在mcp_tool目录下
cd /Users/ablatazmat/Downloads/deploy_newmind/mcp_tool

# 构建所有MCP镜像
./mcp-server-elasticsearch-sl/build-docker.sh
./mcp-server-kibana/build-docker.sh
./newflow-mcp-server/build-docker.sh
./mcp-server-cmdb/build-docker.sh
```

## 📋 构建产物

### 镜像命名规范

```
newmind-mcp-elasticsearch:0.3.0-amd64
newmind-mcp-elasticsearch:0.3.0-arm64

newmind-mcp-kibana:0.4.0-amd64
newmind-mcp-kibana:0.4.0-arm64

newmind-mcp-newflow:1.0.0-amd64
newmind-mcp-newflow:1.0.0-arm64

newmind-mcp-cmdb:0.1.0-amd64
newmind-mcp-cmdb:0.1.0-arm64
```

### 导出文件位置

每个服务器的tar文件会保存在各自的目录：

```
mcp-server-elasticsearch-sl/
├── newmind-mcp-elasticsearch-0.3.0-amd64.tar
└── newmind-mcp-elasticsearch-0.3.0-arm64.tar

mcp-server-kibana/
├── newmind-mcp-kibana-0.4.0-amd64.tar
└── newmind-mcp-kibana-0.4.0-arm64.tar

newflow-mcp-server/
├── newmind-mcp-newflow-1.0.0-amd64.tar
└── newmind-mcp-newflow-1.0.0-arm64.tar

mcp-server-cmdb/
├── newmind-mcp-cmdb-0.1.0-amd64.tar
└── newmind-mcp-cmdb-0.1.0-arm64.tar
```

## 🐳 运行容器示例

### Elasticsearch MCP

```bash
docker run -d \
  --name mcp-es-9202 \
  -p 9202:3000 \
  -e MCP_TRANSPORT=http \
  -e ES_URL="https://your-es.com:9200" \
  -e ES_USERNAME="elastic" \
  -e ES_PASSWORD="your_password" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  newmind-mcp-elasticsearch:latest-arm64
```

### Kibana MCP

```bash
docker run -d \
  --name mcp-kibana-9203 \
  -p 9203:3000 \
  -e MCP_TRANSPORT=http \
  -e KIBANA_URL="https://your-kibana.com:5601" \
  -e KIBANA_USERNAME="elastic" \
  -e KIBANA_PASSWORD="your_password" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  newmind-mcp-kibana:latest-arm64
```

### NewFlow MCP

```bash
docker run -d \
  --name mcp-newflow-9204 \
  -p 9204:3000 \
  -e MCP_TRANSPORT=http \
  -e N8N_BASE_URL="http://host.docker.internal:5677" \
  -e N8N_API_KEY="your_api_key" \
  newmind-mcp-newflow:1.0.0-arm64
```

### CMDB MCP

```bash
docker run -d \
  --name mcp-cmdb-9205 \
  -p 9205:3000 \
  -e MCP_TRANSPORT=http \
  -e CMDB_DOMAIN="https://cmdb-service.example.com" \
  -e CMDB_APP_ID="your_app_id" \
  -e CMDB_APP_SECRET="your_app_secret" \
  -e CMDB_VERIFY_SSL="true" \
  -e NODE_TLS_REJECT_UNAUTHORIZED="0" \
  newmind-mcp-cmdb:0.1.0-arm64
```

## 📊 环境变量参考

### Elasticsearch MCP

| 变量 | 说明 | 示例 |
|------|------|------|
| `ES_URL` | Elasticsearch URL | `https://es.example.com:9200` |
| `ES_USERNAME` | 用户名 | `elastic` |
| `ES_PASSWORD` | 密码 | `your_password` |
| `ES_API_KEY` | API Key（可选） | `base64_key` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | 跳过SSL验证 | `0` |

### Kibana MCP

| 变量 | 说明 | 示例 |
|------|------|------|
| `KIBANA_URL` | Kibana URL | `https://kibana.example.com:5601` |
| `KIBANA_USERNAME` | 用户名 | `elastic` |
| `KIBANA_PASSWORD` | 密码 | `your_password` |
| `KIBANA_DEFAULT_SPACE` | 默认空间 | `default` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | 跳过SSL验证 | `0` |

### NewFlow MCP

| 变量 | 说明 | 示例 |
|------|------|------|
| `N8N_BASE_URL` | NewFlow URL | `http://host.docker.internal:5677` |
| `N8N_API_KEY` | API Key | `your_api_key` |

### CMDB MCP

| 变量 | 说明 | 示例 |
|------|------|------|
| `CMDB_DOMAIN` | CMDB域名URL | `https://cmdb-service.example.com` |
| `CMDB_APP_ID` | 应用ID | `your_app_id` |
| `CMDB_APP_SECRET` | 应用密钥 | `your_app_secret` |
| `CMDB_VERIFY_SSL` | SSL证书验证 | `true` 或 `false` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | 跳过SSL验证 | `0` |

## 🛠️ 批量操作脚本

### 构建所有ARM64镜像

创建文件 `build-all-arm64.sh`:

```bash
#!/bin/bash
set -e

cd /Users/ablatazmat/Downloads/deploy_newmind/mcp_tool

echo "🔨 构建 Elasticsearch MCP..."
cd mcp-server-elasticsearch-sl && ./build-docker-arm64.sh && cd ..

echo "🔨 构建 Kibana MCP..."
cd mcp-server-kibana && ./build-docker-arm64.sh && cd ..

echo "🔨 构建 NewFlow MCP..."
cd newflow-mcp-server && ./build-docker.sh && cd ..

echo "🔨 构建 CMDB MCP..."
cd mcp-server-cmdb && ./build-docker.sh && cd ..

echo "✅ 所有镜像构建完成！"
```

### 导出所有镜像

创建文件 `export-all-images.sh`:

```bash
#!/bin/bash
set -e

cd /Users/ablatazmat/Downloads/deploy_newmind/mcp_tool

echo "📦 导出 Elasticsearch MCP..."
cd mcp-server-elasticsearch-sl && ./export-docker-images.sh && cd ..

echo "📦 导出 Kibana MCP..."
cd mcp-server-kibana && ./export-docker-images.sh && cd ..

echo "📦 导出 NewFlow MCP..."
cd newflow-mcp-server && ./build-docker.sh && cd ..

echo "📦 导出 CMDB MCP..."
cd mcp-server-cmdb && ./build-docker.sh && cd ..

echo "✅ 所有镜像导出完成！"
```

## 🔍 验证和测试

### 检查所有镜像

```bash
docker images | grep newmind-mcp
```

### 测试健康检查

```bash
# Elasticsearch
curl http://localhost:9202/health

# Kibana
curl http://localhost:9203/health

# NewFlow
curl http://localhost:9204/health

# CMDB
curl http://localhost:9205/health
```

### 测试MCP端点

```bash
# 列出工具
curl -X POST http://localhost:9202/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## 📚 详细文档

每个MCP服务器目录都有详细的构建文档：

- [Elasticsearch MCP 构建指南](./mcp-server-elasticsearch-sl/DOCKER_BUILD_GUIDE.md)
- [Kibana MCP 文档](./mcp-server-kibana/README.md)
- [NewFlow MCP 文档](./newflow-mcp-server/README.md)
- [CMDB MCP 文档](./mcp-server-cmdb/README.md)

## ⚠️ 注意事项

1. **架构选择**：
   - Apple Silicon Mac → 使用 ARM64 脚本
   - Intel/AMD 处理器 → 使用 AMD64 脚本
   - 服务器部署 → 根据服务器架构选择

2. **SSL证书验证**：
   - 开发环境可设置 `NODE_TLS_REJECT_UNAUTHORIZED=0`
   - 生产环境建议配置正确的CA证书

3. **网络配置**：
   - 容器需要访问目标服务（ES/Kibana/NewFlow）
   - 使用 `host.docker.internal` 访问宿主机服务

4. **端口映射**：
   - 避免端口冲突
   - 建议ES:9202, Kibana:9203, NewFlow:9204, CMDB:9205

## 🔄 更新和维护

### 重新构建镜像

```bash
# 清理旧镜像
docker rmi newmind-mcp-elasticsearch:0.3.0-arm64
docker rmi newmind-mcp-kibana:0.4.0-arm64
docker rmi newmind-mcp-newflow:1.0.0-arm64
docker rmi newmind-mcp-cmdb:0.1.0-arm64

# 重新构建
./build-docker.sh
```

### 查看镜像大小

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep newmind-mcp
```

## 📞 技术支持

- Elasticsearch MCP: [GitHub Issues](https://github.com/TocharianOU/mcp-server-elasticsearch-sl/issues)
- Kibana MCP: [GitHub Issues](https://github.com/TocharianOU/mcp-server-kibana/issues)
- NewFlow MCP: [GitHub Issues](https://github.com/TocharianOU/newflow-mcp-server/issues)
- CMDB MCP: 查看项目README

---

**最后更新**: 2025-10-29  
**维护者**: TocharianOU

