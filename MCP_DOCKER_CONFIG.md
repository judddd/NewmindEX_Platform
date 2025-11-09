# MCP Docker 配置传递机制

本文档详细说明 MCP 服务器在 Docker 容器中运行时如何传递和使用配置。

## 📋 配置流程概览

```
用户创建实例 → Dashboard保存配置 → mcp_manager构建环境变量 → Docker容器启动 → MCP服务器读取环境变量
```

## 🔧 1. 配置数据库存储

当用户创建MCP实例时，配置存储在SQLite数据库中：

```python
# python_dashboard/database.py
{
    "id": "mcp-elasticsearch-abc123",
    "name": "本地ES集群",
    "type": "elasticsearch",  # 或 "kibana", "newflow"
    "config": {
        "es_url": "http://localhost:9200",
        "es_username": "elastic",
        "es_password": "changeme123",
        "disable_tls": true
    },
    "port": 13000,
    "status": "stopped"
}
```

## 🐳 2. Docker容器启动配置

### 通用环境变量

所有MCP容器都接收这些基础环境变量：

```python
# python_dashboard/mcp_manager.py - start_mcp_server()
environment = {
    "MCP_TRANSPORT": "http",           # 传输模式：http（不是stdio）
    "MCP_HTTP_PORT": "3000",           # 容器内部固定端口
    "MCP_HTTP_HOST": "0.0.0.0"         # 监听所有网络接口
}
```

### Elasticsearch MCP 特定配置

```python
environment["ES_URL"] = config.get("es_url", "http://host.docker.internal:9200")

# 认证方式1：API Key（优先）
if config.get("es_api_key"):
    environment["ES_API_KEY"] = config["es_api_key"]

# 认证方式2：用户名密码
else:
    environment["ES_USERNAME"] = config.get("es_username", "")
    environment["ES_PASSWORD"] = config.get("es_password", "")

# TLS配置
if config.get("disable_tls"):
    environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
elif config.get("es_ca_cert"):
    environment["ES_CA_CERT"] = config["es_ca_cert"]
```

**MCP服务器读取方式**：
```typescript
// mcp_tool/mcp-server-elasticsearch-sl/index.ts
const envConfig = {
  url: process.env.ES_URL || "",
  apiKey: process.env.ES_API_KEY || "",
  username: process.env.ES_USERNAME || "",
  password: process.env.ES_PASSWORD || "",
  caCert: process.env.ES_CA_CERT || "",
};
```

### Kibana MCP 特定配置

```python
environment["KIBANA_URL"] = config.get("kibana_url", "http://host.docker.internal:5601")
environment["KIBANA_DEFAULT_SPACE"] = config.get("kibana_space", "default")

# 认证方式1：Cookie（优先）
if config.get("kibana_cookies"):
    environment["KIBANA_COOKIES"] = config["kibana_cookies"]

# 认证方式2：用户名密码
else:
    environment["KIBANA_USERNAME"] = config.get("kibana_username", "")
    environment["KIBANA_PASSWORD"] = config.get("kibana_password", "")

# TLS配置
if config.get("disable_tls"):
    environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
elif config.get("kibana_ca_cert"):
    environment["KIBANA_CA_CERT"] = config["kibana_ca_cert"]

# 高级配置
if config.get("kibana_timeout"):
    environment["KIBANA_TIMEOUT"] = str(config["kibana_timeout"])
if config.get("kibana_max_retries"):
    environment["KIBANA_MAX_RETRIES"] = str(config["kibana_max_retries"])
```

**MCP服务器读取方式**：
```typescript
// mcp_tool/mcp-server-kibana/index.ts
const config: KibanaConfig = {
  url: process.env.KIBANA_URL || "http://localhost:5601",
  username: process.env.KIBANA_USERNAME || "",
  password: process.env.KIBANA_PASSWORD || "",
  cookies: process.env.KIBANA_COOKIES,
  caCert: process.env.KIBANA_CA_CERT,
  timeout: parseInt(process.env.KIBANA_TIMEOUT || "30000", 10),
  maxRetries: parseInt(process.env.KIBANA_MAX_RETRIES || "3", 10),
  defaultSpace: process.env.KIBANA_DEFAULT_SPACE || 'default'
};
```

### NewFlow MCP 特定配置

```python
environment["NEWFLOW_API_URL"] = config.get("newflow_url", "http://host.docker.internal:5677")
environment["NEWFLOW_API_KEY"] = config.get("newflow_api_key") or ""
```

**MCP服务器读取方式**：
```typescript
// mcp_tool/newflow-mcp-server/src/config/environment.ts
export function getEnvConfig(): EnvConfig {
  const n8nApiUrl = process.env.NEWFLOW_API_URL;
  const n8nApiKey = process.env.NEWFLOW_API_KEY;
  
  // 验证必需参数
  if (!n8nApiUrl || !n8nApiKey) {
    throw new McpError(ErrorCode.InitializationError, 'Missing required env vars');
  }
  
  return { n8nApiUrl, n8nApiKey };
}
```

## 🌐 3. Docker网络配置

### 端口映射

```python
# 容器内部固定使用 3000 端口
# 映射到主机动态分配的端口
ports={'3000/tcp': port}  # port 是动态分配的，如 13000, 13001 等
```

### 主机访问配置

为了让容器内的MCP服务器能访问宿主机上的服务（如ES、Kibana、NewFlow）：

```python
extra_hosts={'host.docker.internal': 'host-gateway'}
network_mode='bridge'
```

这样容器就可以通过 `host.docker.internal` 访问宿主机的服务：
- `http://host.docker.internal:9200` → 访问宿主机的 Elasticsearch
- `http://host.docker.internal:5601` → 访问宿主机的 Kibana
- `http://host.docker.internal:5677` → 访问宿主机的 NewFlow

## 📝 4. 完整的容器创建示例

```python
# python_dashboard/mcp_manager.py - start_mcp_server()
container = docker_client.containers.run(
    image="newmind-mcp-elasticsearch:1.0.0",
    name="mcp-mcp-elasticsearch-abc123",
    environment={
        "MCP_TRANSPORT": "http",
        "MCP_HTTP_PORT": "3000",
        "MCP_HTTP_HOST": "0.0.0.0",
        "ES_URL": "http://host.docker.internal:9200",
        "ES_USERNAME": "elastic",
        "ES_PASSWORD": "changeme123",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
    },
    ports={'3000/tcp': 13000},
    detach=True,
    remove=False,
    extra_hosts={'host.docker.internal': 'host-gateway'},
    network_mode='bridge'
)
```

## ✅ 5. 健康检查

容器启动后，系统会进行健康检查：

```python
# 等待3秒让容器启动
time.sleep(3)

# HTTP健康检查（最多重试5次）
health_url = f"http://localhost:{port}/health"
for i in range(5):
    response = httpx.get(health_url, timeout=2.0)
    if response.status_code == 200:
        # 健康检查通过
        break
```

## 🔍 6. 调试技巧

### 查看容器环境变量

```bash
# 查看运行中容器的环境变量
docker exec mcp-mcp-elasticsearch-abc123 env

# 查看容器日志
docker logs mcp-mcp-elasticsearch-abc123
```

### 测试健康检查端点

```bash
# 测试MCP服务器是否正常响应
curl http://localhost:13000/health

# 期望输出：
# {"status":"ok","transport":"streamable-http","server":"elasticsearch-mcp-server"}
```

### 测试MCP端点

```bash
# 测试MCP JSON-RPC端点
curl -X POST http://localhost:13000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 🎯 7. 配置模板

系统预设了常用配置模板（`python_dashboard/mcp_templates.py`）：

```python
MCP_TEMPLATES = {
    "local_es_cluster": {
        "name": "本地ES集群（主机访问）",
        "type": "elasticsearch",
        "config": {
            "es_url": "http://localhost:9200",  # 从Dashboard访问
            "es_username": "elastic",
            "es_password": "changeme123"
        }
    }
}
```

**注意**：配置中的URL在传递给容器时会自动转换：
- `http://localhost:9200` → 容器内使用 `http://host.docker.internal:9200`
- 这是因为容器内的 `localhost` 指向容器自身，需要用 `host.docker.internal` 访问宿主机

## 🚨 常见问题

### 1. 连接被拒绝

**症状**：容器启动成功，但无法连接到ES/Kibana/NewFlow

**原因**：
- URL配置错误（应使用 `localhost` 或 `host.docker.internal`）
- 目标服务未启动
- 网络隔离问题

**解决方案**：
```bash
# 检查目标服务是否运行
docker-compose ps

# 检查容器网络
docker inspect mcp-xxx | grep NetworkMode

# 测试容器内网络连通性
docker exec mcp-xxx wget -O- http://host.docker.internal:9200
```

### 2. 认证失败

**症状**：容器启动，但MCP调用返回401/403错误

**原因**：
- 用户名密码错误
- API Key无效
- Cookie过期

**解决方案**：
```bash
# 查看容器接收到的环境变量
docker exec mcp-xxx env | grep -E "ES_|KIBANA_|NEWFLOW_"

# 检查认证配置是否正确传递
```

### 3. TLS/SSL错误

**症状**：`UNABLE_TO_VERIFY_LEAF_SIGNATURE` 或 SSL证书错误

**原因**：
- 使用自签名证书
- CA证书未配置

**解决方案**：
- 启用 `disable_tls` 选项（开发环境）
- 或提供正确的CA证书路径

## 📚 相关文件

- **配置管理**：`python_dashboard/mcp_manager.py`
- **数据库操作**：`python_dashboard/database.py`
- **配置模板**：`python_dashboard/mcp_templates.py`
- **MCP服务器**：
  - ES: `mcp_tool/mcp-server-elasticsearch-sl/index.ts`
  - Kibana: `mcp_tool/mcp-server-kibana/index.ts`
  - NewFlow: `mcp_tool/newflow-mcp-server/src/index.ts`

## 🔄 配置更新流程

当用户更新MCP实例配置时：

1. **停止旧容器**：`docker_client.containers.get(name).stop()`
2. **删除旧容器**：`container.remove()`
3. **更新数据库**：保存新配置到SQLite
4. **启动新容器**：使用新配置创建容器

这样确保配置变更立即生效，无需手动重启。

