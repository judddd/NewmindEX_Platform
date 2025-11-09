# NewFlow 工作流网络配置说明

## 🌐 网络架构

NewFlow运行在Docker容器中，需要访问宿主机上的服务（如MCP服务器、LM Studio）。

```
┌─────────────────────────────────────────────────────────┐
│                    宿主机 (macOS)                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MCP Servers (Docker容器)                        │  │
│  │    • Elasticsearch MCP  :3001                    │  │
│  │    • Kibana MCP         :3002                    │  │
│  │    • NewFlow MCP        :3003                    │  │
│  └──────────────────────────────────────────────────┘  │
│                         ▲                                │
│                         │ host.docker.internal           │
│  ┌──────────────────────┼──────────────────────────┐  │
│  │  NewFlow容器         │                          │  │
│  │    :5677 ───────────┘                           │  │
│  │                                                  │  │
│  │  工作流需要访问宿主机MCP服务                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🔧 地址配置规则

### 从NewFlow容器访问宿主机服务

使用 `host.docker.internal` 代替 `localhost` 或局域网IP：

| 服务 | ❌ 错误 | ✅ 正确 |
|------|---------|---------|
| Elasticsearch MCP | `http://localhost:3001/mcp`<br>`http://192.168.1.5:3001/mcp` | `http://host.docker.internal:3001/mcp` |
| Kibana MCP | `http://localhost:3002/mcp`<br>`http://192.168.1.5:3002/mcp` | `http://host.docker.internal:3002/mcp` |
| NewFlow MCP | `http://localhost:3003/mcp`<br>`http://192.168.1.5:3003/mcp` | `http://host.docker.internal:3003/mcp` |
| LM Studio | `http://localhost:1234`<br>`http://192.168.1.5:1234` | `http://host.docker.internal:1234` |

### NewFlow容器内部访问（Webhook）

访问自己的webhook时使用 `127.0.0.1` 或 `localhost`：

```json
{
  "url": "http://127.0.0.1:5677/webhook/custom-mappings"
}
```

## 📋 已更新的工作流

以下工作流的MCP地址已更新为 `host.docker.internal`：

1. **ES环境感知模块.json**
   - ✅ 3个Elasticsearch MCP引用
   - ✅ 2个内部webhook引用

2. **Mappings分析tool.json**
   - ✅ 1个Elasticsearch MCP引用

3. **index摘要tool.json**
   - ✅ 1个Elasticsearch MCP引用

4. **ES安全报警智能调查.json**
   - ✅ 1个Elasticsearch MCP引用

5. **聊天Agent.json**
   - ✅ 2个MCP引用（端口3008, 3009）

**总计**：8个 `host.docker.internal` 引用

## 🔍 验证配置

### 检查工作流配置

```bash
# 查看所有host.docker.internal引用
grep -r "host.docker.internal" workflow_conf/

# 确认没有遗留的局域网IP
grep -r "192.168" workflow_conf/
```

### 测试连接

从NewFlow容器内测试连接：

```bash
# 进入NewFlow容器
docker exec -it newflow sh

# 测试MCP连接
wget -q -O- http://host.docker.internal:3001/health
wget -q -O- http://host.docker.internal:3002/health
wget -q -O- http://host.docker.internal:3003/health

# 测试LM Studio
wget -q -O- http://host.docker.internal:1234/v1/models
```

## 📝 重新导入工作流

修改配置后需要重新导入工作流：

### 方式1：通过Dashboard自动导入

```bash
# Dashboard启动时会自动导入
# 或通过API手动触发
curl -X POST http://localhost:8000/api/newflow/import
```

### 方式2：通过NewFlow UI手动导入

1. 访问 http://localhost:5677
2. 进入工作流管理
3. 点击"导入"
4. 选择 `workflow_conf/` 目录中的JSON文件

## 🚨 常见问题

### 问题1：工作流无法访问MCP

**症状**：
```
Error: connect ECONNREFUSED 127.0.0.1:3001
Error: getaddrinfo ENOTFOUND localhost
```

**原因**：使用了 `localhost` 而不是 `host.docker.internal`

**解决**：
```bash
# 检查工作流配置
grep -r "localhost:[0-9]" workflow_conf/

# 应该都是 host.docker.internal
```

### 问题2：MCP服务未运行

**症状**：
```
Error: connect ECONNREFUSED host.docker.internal:3001
```

**检查**：
```bash
# 检查MCP服务状态
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# 通过Dashboard检查
curl http://localhost:8000/api/status
```

**解决**：
```bash
# 启动MCP服务
curl -X POST http://localhost:8000/api/mcp/instances/YOUR_INSTANCE_ID/start
```

### 问题3：webhook调用失败

**症状**：
```
Error: Webhook call failed
```

**原因**：webhook URL配置错误

**正确配置**：
- ✅ `http://127.0.0.1:5677/webhook/...`
- ✅ `http://localhost:5677/webhook/...`
- ❌ `http://host.docker.internal:5677/webhook/...`（会循环）

## 🎯 最佳实践

### 1. 统一使用 host.docker.internal

所有从NewFlow访问宿主机服务的地方都使用 `host.docker.internal`：

```json
{
  "nodes": [
    {
      "type": "@n8n/n8n-nodes-mcp-tools",
      "parameters": {
        "endpointUrl": "http://host.docker.internal:3001/mcp"
      }
    }
  ]
}
```

### 2. MCP端口规划

保持端口一致性：

- 3001: Elasticsearch MCP（默认）
- 3002: Kibana MCP（默认）
- 3003: NewFlow MCP（默认）
- 3004+: 其他MCP实例

### 3. 环境变量配置

在工作流中使用环境变量（推荐）：

```json
{
  "endpointUrl": "={{ $env.MCP_ES_URL || 'http://host.docker.internal:3001/mcp' }}"
}
```

然后在 `copy.enva` 中配置：
```bash
MCP_ES_URL=http://host.docker.internal:3001/mcp
MCP_KIBANA_URL=http://host.docker.internal:3002/mcp
MCP_NEWFLOW_URL=http://host.docker.internal:3003/mcp
```

## 📚 相关文档

- **MCP网络配置**: `MCP_DOCKER_NETWORK.md`
- **默认MCP实例**: `DEFAULT_MCP_CONFIG.md`
- **Docker配置**: `docker-compose.yml`
- **NewFlow配置**: `NEWFLOW_LMSTUDIO_CONFIG.md`

## 🔄 更新工作流脚本

创建自动更新脚本：

```bash
#!/bin/bash
# update_workflow_addresses.sh

# 批量替换局域网IP为host.docker.internal
find workflow_conf/ -name "*.json" -type f -exec sed -i '' \
  's|http://192\.168\.[0-9]\+\.[0-9]\+:\([0-9]\+\)/mcp|http://host.docker.internal:\1/mcp|g' {} \;

# 验证
echo "✅ 更新完成"
grep -r "host.docker.internal" workflow_conf/ | wc -l
```

## ✅ 验证清单

- [ ] 所有工作流MCP地址使用 `host.docker.internal`
- [ ] 没有遗留的 `localhost:300X` 或局域网IP
- [ ] Webhook使用 `127.0.0.1` 或 `localhost`
- [ ] MCP服务都在运行
- [ ] 从NewFlow容器可以访问MCP
- [ ] 工作流已重新导入到NewFlow

现在NewFlow工作流可以正确访问宿主机的MCP服务了！🎉


