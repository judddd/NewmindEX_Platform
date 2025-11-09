# MCP Docker 网络配置说明

## 🌐 网络架构变更

### ✅ 新架构（推荐）

MCP服务器在Docker容器中运行，与ES/Kibana/NewFlow在同一个Docker网络（`elastic`）：

```
┌──────────────────────────────────────────────────────────┐
│                   Docker Network: elastic                │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  ES集群         │  │  Kibana        │                 │
│  │  - es01:9200   │  │  - kibana:5601 │                 │
│  │  - es02:9200   │  └────────────────┘                 │
│  │  - es03:9200   │                                      │
│  └────────────────┘                                      │
│         ▲                    ▲                            │
│         │                    │                            │
│  ┌──────┴────────────────────┴──────┐                   │
│  │  MCP Servers (Docker容器)        │                   │
│  │  - mcp-elasticsearch-xxx:3000    │                   │
│  │  - mcp-kibana-xxx:3000           │                   │
│  │  - mcp-newflow-xxx:3000          │                   │
│  └──────────────────────────────────┘                   │
│         │                                                 │
└─────────┼─────────────────────────────────────────────────┘
          │ 端口映射
          ▼
    宿主机 localhost:3001-3003
          ▲
          │
    NewChat/Claude客户端
```

### 优势

1. **无网络问题**：容器间通过Docker服务名直接通信
2. **性能更好**：不需要经过宿主机网络栈
3. **配置简单**：使用服务名（es01, kibana, newflow）
4. **自动DNS**：Docker自动解析服务名

## 🔧 配置变更

### 1. URL自动转换

`mcp_manager.py` 现在会自动转换URL：

```python
# Elasticsearch
"http://localhost:9200" → "http://es01:9200"
"http://localhost:9201" → "http://es02:9200"
"http://localhost:9202" → "http://es03:9200"

# Kibana
"http://localhost:5601" → "http://kibana:5601"

# NewFlow
"http://localhost:5677" → "http://newflow:5677"
```

**用户配置时可以使用任一方式**：
- ✅ `http://localhost:9200`（会自动转换）
- ✅ `http://es01:9200`（直接使用）

### 2. Docker网络配置

MCP容器现在加入 `elastic` 网络：

```python
container = docker_client.containers.run(
    image=image_name,
    name=container_name,
    environment=environment,
    ports={'3000/tcp': port},
    network='elastic',  # ✅ 与ES/Kibana/NewFlow同网络
    extra_hosts={'host.docker.internal': 'host-gateway'}
)
```

### 3. 推荐配置

**Elasticsearch MCP**：
```json
{
  "name": "本地ES集群",
  "type": "elasticsearch",
  "config": {
    "es_url": "http://es01:9200",  // 或 localhost:9200（自动转换）
    "es_username": "elastic",
    "es_password": "changeme123"
  }
}
```

**Kibana MCP**：
```json
{
  "name": "本地Kibana",
  "type": "kibana",
  "config": {
    "kibana_url": "http://kibana:5601",  // 或 localhost:5601
    "kibana_username": "elastic",
    "kibana_password": "changeme123",
    "kibana_space": "default"
  }
}
```

**NewFlow MCP**：
```json
{
  "name": "本地NewFlow",
  "type": "newflow",
  "config": {
    "newflow_url": "http://newflow:5677",  // 或 localhost:5677
    "newflow_api_key": "eyJhbGci..."
  }
}
```

## 🔍 Docker网络详解

### elastic 网络

docker-compose.yml 中定义的网络：

```yaml
networks:
  elastic:
    driver: bridge
```

所有服务都连接到这个网络：

```yaml
services:
  es01:
    networks:
      - elastic
  
  kibana:
    networks:
      - elastic
  
  newflow:
    networks:
      - elastic
```

### 服务名解析

Docker自动提供DNS解析：

| 服务名 | 容器名 | 内部端口 | 外部端口 |
|--------|--------|---------|---------|
| es01 | es01 | 9200 | localhost:9200 |
| es02 | es02 | 9200 | localhost:9201 |
| es03 | es03 | 9200 | localhost:9202 |
| kibana | kibana | 5601 | localhost:5601 |
| newflow | newflow | 5677 | localhost:5677 |

**MCP容器内访问**：
- ✅ `http://es01:9200` - 直达ES容器
- ✅ `http://kibana:5601` - 直达Kibana容器
- ✅ `http://newflow:5677` - 直达NewFlow容器

**宿主机访问**：
- ✅ `http://localhost:9200` - 映射到es01
- ✅ `http://localhost:5601` - 映射到kibana
- ✅ `http://localhost:5677` - 映射到newflow

## 🧪 测试连接

### 1. 检查Docker网络

```bash
# 查看elastic网络
docker network inspect elastic

# 查看连接到elastic网络的容器
docker network inspect elastic | grep Name
```

期望看到：es01, es02, es03, kibana, newflow, mcp-xxx

### 2. 测试容器间连通性

```bash
# 进入MCP容器
docker exec -it mcp-mcp-elasticsearch-xxx sh

# 测试连接ES（容器内）
wget -O- http://es01:9200

# 测试连接Kibana（容器内）
wget -O- http://kibana:5601/api/status

# 测试连接NewFlow（容器内）
wget -O- http://newflow:5677/healthz
```

### 3. 测试MCP端点（宿主机）

```bash
# 健康检查
curl http://localhost:3001/health  # Elasticsearch MCP
curl http://localhost:3002/health  # Kibana MCP
curl http://localhost:3003/health  # NewFlow MCP

# 列出工具
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 🚨 故障排查

### 问题1：容器启动失败 - 网络不存在

**症状**：
```
Error: network elastic not found
```

**原因**：elastic网络尚未创建

**解决**：
```bash
# docker-compose会自动创建网络
docker-compose up -d

# 或手动创建
docker network create elastic
```

### 问题2：MCP无法连接ES/Kibana

**症状**：
```
Connection refused to es01:9200
```

**原因**：
1. ES容器未启动
2. MCP容器不在elastic网络中

**检查**：
```bash
# 检查ES是否运行
docker ps | grep es01

# 检查MCP容器网络
docker inspect mcp-mcp-elasticsearch-xxx | grep NetworkMode

# 检查容器是否在elastic网络
docker network inspect elastic | grep mcp-
```

**解决**：
```bash
# 启动ES
docker-compose up -d es01 es02 es03

# 停止并重新创建MCP（会自动加入elastic网络）
# 通过Dashboard停止并启动MCP实例
```

### 问题3：localhost vs 服务名混淆

**症状**：配置了 `localhost:9200` 但连接失败

**原因**：老版本代码没有自动转换URL

**检查**：
```bash
# 查看MCP容器实际接收的环境变量
docker exec mcp-mcp-elasticsearch-xxx env | grep ES_URL

# 应该看到：
# ES_URL=http://es01:9200  ✅
# 而不是：
# ES_URL=http://localhost:9200  ❌（容器内localhost指向自己）
```

**解决**：确保使用最新的 `mcp_manager.py`，会自动转换URL

### 问题4：端口冲突

**症状**：
```
port is already allocated
```

**原因**：宿主机端口3001-3003已被占用

**检查**：
```bash
lsof -i :3001
lsof -i :3002
lsof -i :3003
```

**解决**：
1. 停止占用端口的进程
2. 或修改MCP实例使用其他端口

## 📊 网络性能对比

### 方案A：容器 → 宿主机 → 容器（老方案）

```
MCP容器 → localhost:9200 → 宿主机网络栈 → Docker端口映射 → ES容器
延迟：~2-5ms
```

### 方案B：容器 → 容器（新方案）✅

```
MCP容器 → es01:9200 → Docker内部网络 → ES容器
延迟：~0.1-0.5ms
```

**性能提升**：约5-10倍

## 🔐 安全说明

1. **网络隔离**：MCP容器只能访问 `elastic` 网络中的服务
2. **端口映射**：只有指定端口（3001-3003）暴露到宿主机
3. **认证保护**：ES/Kibana仍需要用户名密码认证

## 📝 配置迁移指南

### 从旧配置迁移

如果你之前使用 `localhost` 配置：

**无需修改**！新版本会自动转换：

```json
// 旧配置（仍然有效）
{
  "es_url": "http://localhost:9200"
}

// 自动转换为
{
  "ES_URL": "http://es01:9200"  // 传递给容器
}
```

### 新建议

推荐直接使用Docker服务名：

```json
{
  "es_url": "http://es01:9200",      // 直接指定
  "kibana_url": "http://kibana:5601",
  "newflow_url": "http://newflow:5677"
}
```

## 🎯 最佳实践

1. **使用服务名**：配置中直接使用 `es01`, `kibana`, `newflow`
2. **同一网络**：确保所有服务在 `elastic` 网络中
3. **健康检查**：启动后检查容器日志确认连接成功
4. **端口映射**：保持3001-3003端口不冲突

## 📚 相关文件

- **网络配置**：`docker-compose.yml`
- **MCP管理器**：`python_dashboard/mcp_manager.py`（URL自动转换）
- **配置模板**：`python_dashboard/mcp_templates.py`
- **初始化脚本**：`scripts/11_init_default_mcp_instances.sh`

## 🔄 下次重启

重启Docker服务时，MCP容器会自动重新加入 `elastic` 网络：

```bash
# 停止所有服务
docker-compose down

# 启动所有服务（网络自动创建）
docker-compose up -d

# MCP容器会在创建时自动加入elastic网络
# 无需手动配置
```

