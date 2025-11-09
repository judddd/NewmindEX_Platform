# 默认MCP实例配置说明

本文档详细说明默认启动的3个MCP实例的配置和网络架构。

## 📦 默认MCP实例概览

安装脚本 `scripts/11_init_default_mcp_instances.sh` 会自动创建并启动3个预配置的MCP实例：

| 服务 | 端口 | 目标服务 | 说明 |
|------|------|----------|------|
| 🔍 Elasticsearch MCP | 3001 | localhost:9200 | 访问本地ES集群 |
| 📊 Kibana MCP | 3002 | localhost:5601 | 访问本地Kibana |
| 🔄 NewFlow MCP | 3003 | localhost:5677 | 访问本地NewFlow |

## 🌐 网络架构

```
┌─────────────────────────────────────────────────────────────┐
│                        宿主机 (macOS)                         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard (FastAPI)                    :8000        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MCP Servers (宿主机进程)                            │   │
│  │    • Elasticsearch MCP      :3001  ──┐              │   │
│  │    • Kibana MCP             :3002  ──┤              │   │
│  │    • NewFlow MCP            :3003  ──┤              │   │
│  └──────────────────────────────────────│───────────────┘   │
│                                          │                    │
│  ┌──────────────────────────────────────▼───────────────┐   │
│  │  Docker 容器                                          │   │
│  │    • ES集群 (es01,es02,es03)  :9200-9202            │   │
│  │    • Kibana                    :5601                  │   │
│  │    • NewFlow                   :5677                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LM Studio                              :1234        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 关键网络说明

1. **MCP服务器在宿主机运行**，不在Docker容器中
2. **通过 `localhost` 访问Docker服务**（因为Docker端口已映射到宿主机）
3. **NewChat/Claude客户端** 也在宿主机，通过 `localhost:3001-3003` 访问MCP

## 🔧 1. Elasticsearch MCP 配置

### 创建时的配置

```json
{
  "name": "本地ES集群",
  "type": "elasticsearch",
  "port": 3001,
  "config": {
    "es_url": "http://localhost:9200",
    "es_username": "elastic",
    "es_password": "changeme123",  // 从环境变量 ELASTIC_PASSWORD 读取
    "disable_tls": true
  }
}
```

### 传递给Docker容器的环境变量

由于MCP服务器运行在宿主机，这里实际上**不在Docker容器中**，而是宿主机进程。但配置方式相同：

```bash
MCP_TRANSPORT=http
MCP_HTTP_PORT=3000
MCP_HTTP_HOST=0.0.0.0
ES_URL=http://localhost:9200      # 宿主机访问Docker映射端口
ES_USERNAME=elastic
ES_PASSWORD=changeme123
NODE_TLS_REJECT_UNAUTHORIZED=0    # 禁用TLS验证
```

### 访问路径

```
NewChat客户端 (宿主机)
  ↓ http://localhost:3001/mcp
Elasticsearch MCP Server (宿主机进程，监听3001端口)
  ↓ http://localhost:9200
Docker ES集群 (容器，映射9200到宿主机)
```

### 测试命令

```bash
# 健康检查
curl http://localhost:3001/health

# 列出可用工具
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 测试ES连接
curl -u elastic:changeme123 http://localhost:9200/_cluster/health
```

## 📊 2. Kibana MCP 配置

### 创建时的配置

```json
{
  "name": "本地Kibana",
  "type": "kibana",
  "port": 3002,
  "config": {
    "kibana_url": "http://localhost:5601",
    "kibana_username": "elastic",
    "kibana_password": "changeme123",  // 从环境变量 ELASTIC_PASSWORD 读取
    "kibana_space": "default",
    "disable_tls": true
  }
}
```

### 传递的环境变量

```bash
MCP_TRANSPORT=http
MCP_HTTP_PORT=3000
MCP_HTTP_HOST=0.0.0.0
KIBANA_URL=http://localhost:5601
KIBANA_USERNAME=elastic
KIBANA_PASSWORD=changeme123
KIBANA_DEFAULT_SPACE=default
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 访问路径

```
NewChat客户端 (宿主机)
  ↓ http://localhost:3002/mcp
Kibana MCP Server (宿主机进程，监听3002端口)
  ↓ http://localhost:5601
Docker Kibana (容器，映射5601到宿主机)
```

### 测试命令

```bash
# 健康检查
curl http://localhost:3002/health

# 测试Kibana连接
curl -u elastic:changeme123 http://localhost:5601/api/status
```

## 🔄 3. NewFlow MCP 配置

### 创建时的配置

```json
{
  "name": "本地NewFlow",
  "type": "newflow",
  "port": 3003,
  "config": {
    "newflow_url": "http://localhost:5677",  // ✅ 修复：去掉了 /api/v1
    "newflow_api_key": "eyJhbGci...Qg5Q"     // 从环境变量 NEWFLOW_API_KEY 读取
  }
}
```

### 传递的环境变量

```bash
MCP_TRANSPORT=http
MCP_HTTP_PORT=3000
MCP_HTTP_HOST=0.0.0.0
NEWFLOW_API_URL=http://localhost:5677     # ✅ 修复：不再是 N8N_BASE_URL
NEWFLOW_API_KEY=eyJhbGci...Qg5Q           # ✅ 修复：不再是 N8N_API_KEY
```

### 访问路径

```
NewChat客户端 (宿主机)
  ↓ http://localhost:3003/mcp
NewFlow MCP Server (宿主机进程，监听3003端口)
  ↓ http://localhost:5677/api/v1
Docker NewFlow (容器，映射5677到宿主机)
```

### 测试命令

```bash
# 健康检查
curl http://localhost:3003/health

# 测试NewFlow连接
curl http://localhost:5677/api/v1/workflows \
  -H "X-N8N-API-KEY: eyJhbGci...Qg5Q"
```

## 🔍 配置修复历史

### 修复 1: 添加认证信息

**问题**：原始配置缺少ES和Kibana的用户名密码，导致认证失败

**修复前**：
```json
{
  "es_url": "http://localhost:9200",
  "es_disable_ssl": true  // ❌ 字段名错误
  // ❌ 缺少 username 和 password
}
```

**修复后**：
```json
{
  "es_url": "http://localhost:9200",
  "es_username": "elastic",
  "es_password": "changeme123",  // ✅ 从 ELASTIC_PASSWORD 环境变量读取
  "disable_tls": true            // ✅ 字段名修正
}
```

### 修复 2: 统一字段命名

**问题**：`disable_ssl` vs `disable_tls` 命名不一致

**修复**：统一使用 `disable_tls` 字段名，与 `mcp_manager.py` 中的检查一致

### 修复 3: NewFlow URL路径

**问题**：URL中包含 `/api/v1` 会导致重复拼接

**修复前**：
```json
{
  "newflow_url": "http://localhost:5677/api/v1"  // ❌ 不应该包含路径
}
```

**修复后**：
```json
{
  "newflow_url": "http://localhost:5677"  // ✅ 只包含基础URL
}
```

### 修复 4: NewFlow 环境变量名称

**问题**：环境变量名称与MCP服务器期望的不匹配

**修复前**（`mcp_manager.py`）：
```python
environment["N8N_BASE_URL"] = ...  # ❌ 错误的变量名
environment["N8N_API_KEY"] = ...   # ❌ 错误的变量名
```

**修复后**：
```python
environment["NEWFLOW_API_URL"] = ...  # ✅ 正确的变量名
environment["NEWFLOW_API_KEY"] = ...  # ✅ 正确的变量名
```

## 📝 NewChat 配置示例

将以下配置添加到 NewChat 的 MCP 配置中：

```json
{
  "mcpServers": {
    "local_es": {
      "transport": "streamable",
      "enabled": true,
      "url": "http://localhost:3001/mcp",
      "name": "本地ES集群"
    },
    "local_kibana": {
      "transport": "streamable",
      "enabled": true,
      "url": "http://localhost:3002/mcp",
      "name": "本地Kibana"
    },
    "local_newflow": {
      "transport": "streamable",
      "enabled": true,
      "url": "http://localhost:3003/mcp",
      "name": "本地NewFlow"
    }
  }
}
```

## 🚨 常见问题

### 1. 连接ES/Kibana失败：401 Unauthorized

**原因**：认证信息缺失或错误

**检查**：
```bash
# 检查环境变量
echo $ELASTIC_PASSWORD

# 测试认证
curl -u elastic:changeme123 http://localhost:9200
```

**解决**：确保 `copy.enva` 中有正确的 `ELASTIC_PASSWORD=changeme123`

### 2. NewFlow MCP启动失败

**原因**：环境变量名称不匹配或API Key缺失

**检查**：
```bash
# 查看MCP日志
tail -f python_dashboard/mcp_logs/mcp-newflow-*.log

# 检查环境变量
echo $NEWFLOW_API_KEY
```

**解决**：确保使用了修复后的代码（`NEWFLOW_API_URL` 而不是 `N8N_BASE_URL`）

### 3. MCP服务启动但无法访问

**原因**：Docker服务未启动或端口冲突

**检查**：
```bash
# 检查Docker服务
docker-compose ps

# 检查端口占用
lsof -i :3001
lsof -i :3002
lsof -i :3003
```

**解决**：
```bash
# 启动Docker服务
docker-compose up -d

# 或使用脚本
./scripts/start_all.sh
```

## 🔄 重新初始化

如果默认MCP实例配置错误，可以删除后重新创建：

```bash
# 方式1：通过Dashboard删除

# 方式2：直接删除数据库
rm python_dashboard/mcp_instances.db

# 重新运行初始化脚本
./scripts/11_init_default_mcp_instances.sh
```

## 📚 相关文件

- **初始化脚本**：`scripts/11_init_default_mcp_instances.sh`
- **MCP管理器**：`python_dashboard/mcp_manager.py`
- **环境配置**：`copy.enva`
- **配置模板**：`python_dashboard/mcp_templates.py`
- **Docker配置说明**：`MCP_DOCKER_CONFIG.md`

## 🎯 验证配置

运行以下命令验证所有MCP实例正常：

```bash
# 1. 健康检查
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# 2. 列出工具
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 3. 查看Dashboard状态
curl http://localhost:8000/api/status | python3 -m json.tool
```

期望输出应该显示所有3个MCP实例都在运行且健康。

