# NewFlow 连接 LM Studio 配置指南

## 🔍 问题说明

NewFlow运行在Docker容器中，而LM Studio运行在宿主机上。在容器内部：
- ❌ `127.0.0.1:1234` 指向容器自己，无法访问宿主机
- ❌ `localhost:1234` 同样指向容器自己
- ✅ `host.docker.internal:1234` 指向宿主机（Mac/Windows Docker特性）

## ✅ 正确配置

### 1. LM Studio API地址

在NewFlow工作流中使用以下地址：

| 用途 | 地址 |
|------|------|
| **基础URL** | `http://host.docker.internal:1234` |
| **Chat Completions** | `http://host.docker.internal:1234/v1/chat/completions` |
| **Models列表** | `http://host.docker.internal:1234/v1/models` |
| **Embeddings** | `http://host.docker.internal:1234/v1/embeddings` |

### 2. NewFlow HTTP节点配置示例

#### 方式1：使用HTTP Request节点

```json
{
  "method": "POST",
  "url": "http://host.docker.internal:1234/v1/chat/completions",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "model": "qwen/qwen3-coder-30b",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000
  }
}
```

#### 方式2：使用OpenAI节点（推荐）

NewFlow的OpenAI节点可以配置自定义API Base URL：

1. 添加 **OpenAI** 节点
2. 配置凭据（Credentials）：
   - **API Key**: 随意填写（如`dummy`），LM Studio不验证
   - **Base URL**: `http://host.docker.internal:1234/v1`
3. 配置节点：
   - **Model**: `qwen/qwen3-coder-30b`
   - **Prompt**: 您的提示词

### 3. 工作流JSON配置示例

如果您手动编辑工作流JSON，确保URL配置正确：

```json
{
  "nodes": [
    {
      "parameters": {
        "url": "http://host.docker.internal:1234/v1/chat/completions",
        "method": "POST",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "{\n  \"model\": \"qwen/qwen3-coder-30b\",\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"{{$json.prompt}}\"\n    }\n  ]\n}"
      },
      "name": "LM Studio Chat",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [250, 300]
    }
  ]
}
```

## 🔧 Docker配置验证

确认您的`docker-compose.yml`包含以下配置：

```yaml
newflow:
  image: newflow:1.0.12
  container_name: newflow
  ports:
    - "5677:5677"
  extra_hosts:
    - "host.docker.internal:host-gateway"  # ✅ 关键配置
  networks:
    - elastic
```

## 🧪 测试连接

### 方法1：在NewFlow中测试

1. 创建一个简单的HTTP Request节点
2. URL: `http://host.docker.internal:1234/v1/models`
3. Method: GET
4. 执行节点，应该返回模型列表

### 方法2：进入容器测试

```bash
# 进入NewFlow容器
docker exec -it newflow sh

# 测试连接
wget -qO- http://host.docker.internal:1234/v1/models

# 或使用curl（如果可用）
curl http://host.docker.internal:1234/v1/models
```

### 方法3：从宿主机测试LM Studio

```bash
# 确认LM Studio在宿主机上正常运行
curl http://localhost:1234/v1/models
```

## 📋 完整工作流配置清单

### ✅ 已有的工作流需要更新

检查以下工作流文件，将所有`127.0.0.1:1234`或`localhost:1234`替换为`host.docker.internal:1234`：

1. `workflow_conf/ES安全报警智能调查.json`
2. `workflow_conf/模型产生测试csv.json`
3. `workflow_conf/聊天Agent.json`

### 🔍 查找需要修改的地方

```bash
# 在工作流文件中查找localhost引用
grep -r "localhost:1234" workflow_conf/
grep -r "127.0.0.1:1234" workflow_conf/
```

### 🛠️ 批量替换（谨慎使用）

```bash
# 备份原文件
cp -r workflow_conf workflow_conf.backup

# 批量替换
sed -i '' 's/127\.0\.0\.1:1234/host.docker.internal:1234/g' workflow_conf/*.json
sed -i '' 's/localhost:1234/host.docker.internal:1234/g' workflow_conf/*.json
```

## 🚨 常见问题

### Q1: `host.docker.internal` 无法解析

**症状**: 错误信息显示无法解析域名

**解决方案**:
1. 确认Docker版本支持（Docker Desktop 18.03+）
2. 检查`docker-compose.yml`中的`extra_hosts`配置
3. 重启Docker容器：`docker-compose restart newflow`

### Q2: 连接超时

**症状**: 请求一直等待，最终超时

**可能原因**:
- LM Studio未启动或未加载模型
- LM Studio端口不是1234
- 防火墙阻止连接

**解决方案**:
```bash
# 1. 检查LM Studio是否运行
curl http://localhost:1234/v1/models

# 2. 检查端口
lsof -i :1234

# 3. 查看LM Studio日志
# 在LM Studio界面查看Server Log
```

### Q3: 401 Unauthorized

**症状**: API返回401错误

**解决方案**:
- LM Studio本地API通常不需要认证
- 如果使用OpenAI节点，API Key可以填写任意值（如`dummy`）
- 确认Base URL配置正确

## 🎯 最佳实践

### 1. 使用环境变量

在NewFlow中定义环境变量：

```
LM_STUDIO_BASE_URL=http://host.docker.internal:1234/v1
LM_STUDIO_MODEL=qwen/qwen3-coder-30b
```

然后在工作流中引用：`{{$env.LM_STUDIO_BASE_URL}}`

### 2. 创建可复用的子工作流

创建一个"LM Studio Chat"子工作流，其他工作流可以调用它，统一管理API配置。

### 3. 添加错误处理

在HTTP节点后添加错误处理分支：
- 检查响应状态码
- 捕获超时错误
- 记录失败日志

## 📚 相关文档

- [Docker网络配置](NETWORK_GUIDE.md)
- [LM Studio API文档](https://lmstudio.ai/docs)
- [NewFlow HTTP节点文档](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

## 🔄 更新现有工作流

运行以下命令自动更新所有工作流：

```bash
# 使用项目提供的更新脚本
bash scripts/update_workflow_lmstudio_urls.sh
```

或通过Web管理平台：
1. 访问 http://localhost:8000
2. 进入"NewFlow工作流"页面
3. 点击"批量更新LM Studio地址"按钮

