# MCP服务创建与管理指南

## 🎯 功能概述

Web管理平台（http://localhost:8000）提供了完整的MCP服务器创建和管理功能，支持：

- ✅ 动态创建ES和Kibana的MCP服务实例
- ✅ 自定义连接参数（URL、认证信息）
- ✅ 自动端口分配（3001-3100）
- ✅ 一键启动/停止MCP服务
- ✅ 实时健康检查
- ✅ 生成NewMindChat配置

## 📋 快速开始

### 1. 访问管理界面

打开浏览器访问：http://localhost:8000

### 2. 创建MCP实例

点击"创建MCP实例"按钮，按照以下步骤操作：

#### 步骤1：选择服务类型
- **Elasticsearch**：用于ES数据查询、索引管理
- **Kibana**：用于Dashboard管理、可视化操作

#### 步骤2：选择模板（推荐）

**本地Docker服务（推荐）**：
- `本地ES集群（localhost）` - 连接本地Docker的ES
- `本地Kibana（localhost）` - 连接本地Docker的Kibana

**Docker IP直接访问（备用）**：
- 当localhost访问失败时使用
- 需要先运行 `bash scripts/get_docker_ips.sh` 获取IP

**远程服务**：
- 用于连接生产环境或其他远程服务器

#### 步骤3：配置参数

**Elasticsearch配置**：
```
ES URL: http://localhost:9200
用户名: elastic（可选）
密码: changeme123（可选）
```

**Kibana配置**：
```
Kibana URL: http://localhost:5601
用户名: elastic（可选）
密码: changeme123（可选）
默认Space: default
```

#### 步骤4：端口设置
- 建议留空，系统自动分配（3001-3100）
- 也可手动指定端口

#### 步骤5：创建并启动
- 点击"创建并启动"按钮
- 系统会提示是否立即启动服务
- 确认后MCP服务将在后台运行

### 3. 管理MCP实例

在MCP服务器管理表格中，可以：

- **启动/停止**：点击绿色/红色按钮
- **查看状态**：实时显示运行状态
- **复制端点**：点击端点地址复制到剪贴板
- **删除实例**：点击垃圾桶图标（会先停止服务）

### 4. 在NewMindChat中使用

#### 方法1：导出配置（推荐）
1. 点击"导出NewMindChat配置"按钮
2. 下载 `newmindchat-config.json` 文件
3. 在NewMindChat中导入此配置

#### 方法2：手动配置
在NewMindChat的MCP配置中添加：

```json
{
  "mcpServers": {
    "local-es": {
      "transport": "streamable",
      "enabled": true,
      "url": "http://localhost:3001/mcp",
      "name": "本地ES服务"
    }
  }
}
```

## 🔧 API使用示例

### 创建MCP实例

```bash
curl -X POST http://localhost:8000/api/mcp/instances \
  -H "Content-Type: application/json" \
  -d '{
    "name": "生产ES",
    "type": "elasticsearch",
    "config": {
      "es_url": "http://localhost:9200",
      "es_username": "",
      "es_password": ""
    }
  }'
```

### 启动MCP服务

```bash
curl -X POST http://localhost:8000/api/mcp/instances/{instance_id}/start
```

### 停止MCP服务

```bash
curl -X POST http://localhost:8000/api/mcp/instances/{instance_id}/stop
```

### 查看所有实例

```bash
curl http://localhost:8000/api/mcp/instances
```

### 健康检查

```bash
curl http://localhost:3001/health
```

## 🌐 网络配置说明

### 推荐配置：localhost（端口映射）

MCP服务器运行在主机上，通过Docker端口映射访问容器：

```
MCP服务器 → localhost:9200 → Docker端口映射 → ES容器(172.18.0.2:9200)
```

**优点**：
- ✅ 配置简单
- ✅ 容器重启后无需更改
- ✅ 适合开发和生产环境

### 备用配置：Docker IP直接访问

如果localhost访问失败，可使用容器IP：

```bash
# 获取容器IP
bash scripts/get_docker_ips.sh

# 使用Docker IP创建MCP实例
ES URL: http://172.18.0.2:9200
Kibana URL: http://172.18.0.5:5601
```

**注意**：
- ⚠️ 容器重启后IP可能变化
- ⚠️ 需要重新配置MCP实例

详细说明请查看：[NETWORK_GUIDE.md](NETWORK_GUIDE.md)

## 📊 监控与日志

### 查看MCP日志

**方法1：通过API**
```bash
curl http://localhost:8000/api/mcp/instances/{instance_id}/logs
```

**方法2：直接查看文件**
```bash
tail -f python_dashboard/mcp_logs/mcp-elasticsearch-*.log
```

### 健康检查

每个MCP实例都有健康检查端点：

```bash
curl http://localhost:3001/health

# 返回示例
{
  "status": "ok",
  "transport": "streamable-http",
  "elasticsearch_url": "http://localhost:9200"
}
```

### 进程管理

查看MCP进程：
```bash
ps aux | grep mcp-server
```

查看端口占用：
```bash
lsof -i :3001
```

## 🚨 故障排查

### 问题1：MCP启动失败

**症状**：点击启动后显示"启动失败"

**排查步骤**：
1. 检查Docker服务是否运行：`docker ps`
2. 检查ES/Kibana是否可访问：`curl http://localhost:9200`
3. 查看MCP日志：`tail python_dashboard/mcp_logs/mcp-*.log`
4. 检查端口是否被占用：`lsof -i :3001`

**解决方案**：
- 如果ES无法访问，尝试使用Docker IP模板
- 如果端口被占用，删除旧实例或指定其他端口

### 问题2：健康检查失败

**症状**：MCP状态显示为"已停止"，但进程在运行

**排查步骤**：
1. 测试健康端点：`curl http://localhost:3001/health`
2. 检查进程：`ps aux | grep mcp-server`
3. 查看日志：`tail python_dashboard/mcp_logs/mcp-*.log`

**解决方案**：
- 重启MCP实例
- 检查防火墙设置
- 确认端口映射正确

### 问题3：无法连接ES/Kibana

**症状**：MCP启动成功，但无法查询数据

**排查步骤**：
1. 测试主机访问：`curl http://localhost:9200/_cluster/health`
2. 获取Docker IP：`bash scripts/get_docker_ips.sh`
3. 测试Docker IP访问：`curl http://172.18.0.2:9200`

**解决方案**：
- 使用Docker IP模板重新创建MCP实例
- 检查ES认证配置
- 确认网络连通性

## 💡 最佳实践

### 1. 命名规范

建议使用描述性名称：
- ✅ `生产ES集群`
- ✅ `测试环境Kibana`
- ✅ `本地开发ES`
- ❌ `mcp1`
- ❌ `test`

### 2. 端口管理

- 使用自动分配端口（推荐）
- 记录端口分配情况
- 避免端口冲突

### 3. 安全配置

**开发环境**：
- 可以不设置用户名密码
- 使用localhost访问

**生产环境**：
- 必须设置强密码
- 启用ES安全功能
- 考虑使用SSL/TLS

### 4. 备份与恢复

定期备份MCP配置：
```bash
# 备份数据库
cp python_dashboard/mcp_instances.db backup/

# 导出配置
curl http://localhost:8000/api/mcp/instances > mcp_backup.json
```

## 📚 相关文档

- [网络配置指南](NETWORK_GUIDE.md) - Docker网络架构详解
- [部署指南](README.md) - 完整部署流程
- [API文档](http://localhost:8000/docs) - FastAPI自动生成的API文档

## 🆘 获取帮助

如遇问题，请：
1. 查看日志文件
2. 运行网络诊断：`bash scripts/get_docker_ips.sh`
3. 检查系统状态：访问 http://localhost:8000
4. 查阅故障排查章节

---

**版本**：v1.0.0  
**更新日期**：2025-10-15  
**适用平台**：Mac M芯片

