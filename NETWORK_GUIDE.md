# Docker 网络配置指南

## 网络架构

```
┌─────────────────────────────────────────────────────────────┐
│                        主机 (Mac M芯片)                        │
│                                                               │
│  ┌─────────────────┐        ┌──────────────────────┐        │
│  │  MCP服务器       │        │  Python Dashboard    │        │
│  │  (端口3001-3100) │        │  (端口8000)          │        │
│  └─────────────────┘        └──────────────────────┘        │
│           │                            │                      │
│           │ localhost:9200/5601        │                      │
│           │ 或 172.18.0.x:9200/5601   │                      │
│           ↓                            ↓                      │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Docker Bridge Network (elastic)          │       │
│  │              子网: 172.18.0.0/16                 │       │
│  │              网关: 172.18.0.1                    │       │
│  │                                                   │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │       │
│  │  │   ES01   │  │  Kibana  │  │ NewFlow  │      │       │
│  │  │172.18.0.2│  │172.18.0.5│  │172.18.0.x│      │       │
│  │  │:9200     │  │:5601     │  │:5677     │      │       │
│  │  └──────────┘  └──────────┘  └──────────┘      │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 访问方式

### 1. 主机访问Docker服务（推荐）

**优点**：
- 简单直接，使用localhost
- 端口映射自动处理
- 适合开发和生产环境

**配置示例**：
```json
{
  "es_url": "http://localhost:9200",
  "kibana_url": "http://localhost:5601"
}
```

**适用场景**：
- MCP服务器在主机上运行（当前架构）
- Python Dashboard访问Docker服务
- 外部应用访问Docker服务

### 2. Docker IP直接访问（备用）

**优点**：
- 绕过端口映射，直接访问容器
- 适合容器间通信
- 性能略优

**缺点**：
- IP地址可能变化（容器重启后）
- 需要手动更新配置

**配置示例**：
```json
{
  "es_url": "http://172.18.0.2:9200",
  "kibana_url": "http://172.18.0.5:5601"
}
```

**适用场景**：
- localhost访问失败时的备用方案
- 需要绕过端口映射的特殊情况

### 3. Docker容器访问主机（host.docker.internal）

**用途**：Docker容器访问主机上的服务

**配置示例**（在docker-compose.yml中）：
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**使用场景**：
- NewFlow访问主机上的LM Studio（端口1234）
- Docker容器访问主机上的其他服务

## 获取Docker容器IP

### 方法1：使用docker inspect
```bash
# 获取ES容器IP
docker inspect es01 | grep IPAddress

# 获取Kibana容器IP
docker inspect kibana | grep IPAddress
```

### 方法2：使用辅助脚本
```bash
bash scripts/get_docker_ips.sh
```

## 网络故障排查

### 问题1：MCP无法连接ES/Kibana

**症状**：MCP健康检查失败，显示连接超时

**解决方案**：
1. 检查Docker容器是否运行：`docker ps`
2. 测试主机访问：`curl http://localhost:9200`
3. 测试Docker IP访问：`curl http://172.18.0.2:9200`
4. 检查防火墙设置
5. 尝试使用Docker IP模板创建MCP实例

### 问题2：容器IP变化

**症状**：之前工作的MCP实例突然无法连接

**解决方案**：
1. 重新获取容器IP：`bash scripts/get_docker_ips.sh`
2. 在Dashboard中更新MCP实例配置
3. 重启MCP实例

### 问题3：NewFlow无法访问LM Studio

**症状**：NewFlow工作流调用LM Studio失败

**解决方案**：
1. 确认LM Studio在主机上运行：`curl http://localhost:1234/v1/models`
2. 检查NewFlow的extra_hosts配置
3. 在NewFlow中使用`http://host.docker.internal:1234`

## 推荐配置

### 开发环境
- MCP服务器：使用 `localhost:9200/5601`（简单直接）
- 端口范围：3001-3100（MCP服务）

### 生产环境
- 考虑使用Docker Compose统一管理所有服务
- 使用固定IP或服务发现机制
- 配置健康检查和自动重启

## 端口分配

| 服务 | 端口 | 访问方式 |
|------|------|----------|
| Elasticsearch | 9200 | localhost:9200 或 172.18.0.2:9200 |
| Kibana | 5601 | localhost:5601 或 172.18.0.5:5601 |
| Logstash | 5044, 9600 | localhost:5044 |
| NewFlow | 5677 | localhost:5677 |
| LM Studio | 1234 | localhost:1234 |
| Dashboard | 8000 | localhost:8000 |
| MCP服务器 | 3001-3100 | localhost:3001-3100 |

## 安全建议

1. **生产环境启用ES安全**：
   - 设置`xpack.security.enabled=true`
   - 配置SSL/TLS证书
   - 使用强密码

2. **限制网络访问**：
   - 仅暴露必要端口
   - 使用防火墙规则
   - 考虑VPN或SSH隧道

3. **定期更新**：
   - 更新Docker镜像
   - 更新MCP服务器
   - 更新依赖包

