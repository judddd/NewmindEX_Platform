# 日志系统使用指南

NewmindEx AI Platform 完整日志和审计功能文档

## 📋 概述

系统提供了完整的日志记录和审计功能，记录所有Dashboard操作、MCP实例管理、API调用等关键事件。

## 📁 日志文件位置

所有日志文件存储在 `logs/` 目录下：

```
logs/
├── dashboard.log          # Dashboard运行日志
├── operations.log         # 用户操作日志
├── mcp_calls.log         # MCP工具调用日志
├── audit.log             # 审计日志（敏感操作）
├── install-*.log         # 安装日志
└── mcp_containers/       # MCP容器日志目录
    └── {instance_id}/    # 各MCP实例的日志
```

## 📝 日志类型说明

### 1. Dashboard日志 (`dashboard.log`)

**用途**: 记录Dashboard应用的运行状态、错误信息

**内容**:
- Dashboard启动/停止
- 系统错误和警告
- 内部操作异常

**示例**:
```
[2025-11-09 01:30:45] [INFO] Dashboard started successfully
[2025-11-09 01:31:12] [ERROR] Failed to connect to Docker: Connection refused
```

### 2. 操作日志 (`operations.log`)

**用途**: 记录所有用户操作和API调用

**内容**:
- MCP实例创建/启动/停止/删除
- API请求（方法、路径、耗时、状态码）
- 配置更新
- 敏感信息已自动屏蔽

**示例**:
```
[2025-11-09 01:32:15] [INFO] [USER:system] [ACTION:create_mcp] instance_id=mcp-es-abc123, name=本地ES, type=elasticsearch
[2025-11-09 01:32:18] [INFO] [USER:system] [ACTION:start_mcp] instance_id=mcp-es-abc123
[2025-11-09 01:32:23] [INFO] [USER:system] [ACTION:start_mcp_success] instance_id=mcp-es-abc123, port=3001
[2025-11-09 01:32:25] [INFO] [USER:system] [ACTION:API_CALL] method=POST, path=/api/mcp/instances/mcp-es-abc123/start, duration=5.234s, status=200
```

### 3. MCP调用日志 (`mcp_calls.log`)

**用途**: 记录MCP工具的具体调用情况（预留功能）

**内容**:
- 工具名称
- 调用参数（敏感信息已屏蔽）
- 执行结果
- 执行耗时
- 成功/失败状态

**示例**:
```
[2025-11-09 01:35:10] [INFO] [INSTANCE:mcp-es-abc123] [TOOL:list_indices] [STATUS:success] [DURATION:0.523s] params={"pattern": "*"} result=["index1", "index2"]
[2025-11-09 01:35:15] [ERROR] [INSTANCE:mcp-kb-xyz789] [TOOL:get_dashboard] [STATUS:failed] [DURATION:2.156s] error=Connection timeout
```

### 4. 审计日志 (`audit.log`)

**用途**: 记录关键的安全和配置变更事件

**内容**:
- 系统启动/停止
- MCP实例创建/删除
- 配置变更
- 认证失败（未来功能）
- 敏感操作

**示例**:
```
[2025-11-09 01:30:45] [WARNING] [USER:system] [EVENT:SYSTEM_START] [DESC:Dashboard started] details={"version": "1.0.0"}
[2025-11-09 01:32:15] [WARNING] [USER:system] [EVENT:MCP_CREATE] [DESC:Created MCP instance: 本地ES] details={"instance_id": "mcp-es-abc123", "type": "elasticsearch"}
[2025-11-09 01:40:30] [WARNING] [USER:admin] [EVENT:MCP_DELETE] [DESC:Deleting MCP instance] details={"instance_id": "mcp-es-abc123"}
```

### 5. MCP容器日志 (`mcp_containers/{instance_id}/`)

**用途**: 存储各MCP Docker容器的运行日志

**特点**:
- 每个MCP实例有独立的日志目录
- 通过Docker volume挂载
- 可包含MCP服务器的详细输出

**查看方式**:
```bash
# 直接查看文件
cat logs/mcp_containers/mcp-es-abc123/*.log

# 或通过Docker命令
docker logs mcp-mcp-es-abc123
```

## 🔍 查看日志

### 方法1: 命令行查看

```bash
# 查看最新的操作日志
tail -f logs/operations.log

# 查看最近100行
tail -100 logs/operations.log

# 搜索特定实例的日志
grep "mcp-es-abc123" logs/operations.log

# 查看所有启动失败的记录
grep "start_mcp_failed" logs/operations.log

# 查看审计日志中的关键事件
grep "MCP_DELETE\|CONFIG_CHANGE" logs/audit.log
```

### 方法2: API查询

系统提供了RESTful API用于查询日志：

#### 获取操作日志
```bash
# 最近100条操作日志
curl http://localhost:8000/api/logs/operations?lines=100

# 过滤特定文本
curl "http://localhost:8000/api/logs/operations?lines=100&filter=mcp-es-abc123"
```

**返回格式**:
```json
{
  "logs": [
    "[2025-11-09 01:32:15] [INFO] [USER:system] [ACTION:create_mcp] ...",
    "[2025-11-09 01:32:18] [INFO] [USER:system] [ACTION:start_mcp] ..."
  ],
  "count": 100
}
```

#### 获取MCP调用日志
```bash
# 所有MCP调用
curl http://localhost:8000/api/logs/mcp-calls?lines=100

# 特定实例的调用
curl "http://localhost:8000/api/logs/mcp-calls?instance_id=mcp-es-abc123&lines=50"
```

#### 获取审计日志
```bash
# 最近50条审计记录
curl http://localhost:8000/api/logs/audit?lines=50
```

#### 获取Dashboard日志
```bash
curl http://localhost:8000/api/logs/dashboard?lines=100
```

#### 获取MCP容器日志
```bash
# 通过Dashboard API
curl http://localhost:8000/api/mcp/instances/{instance_id}/logs?lines=100
```

### 方法3: 日志查看界面（未来功能）

计划在Dashboard Web界面中添加日志查看功能，支持：
- 实时日志流
- 高级过滤和搜索
- 日志下载
- 统计图表

## 🔒 敏感信息保护

所有日志都经过敏感信息过滤处理：

**过滤的字段**:
- `password`
- `api_key`, `apiKey`
- `token`
- `secret`
- `newflow_api_key`
- `es_password`
- `kibana_password`
- `auth`, `authorization`
- `credentials`

**过滤规则**:
- 长度 > 8: 保留前4位和后4位，中间替换为 `****`
- 长度 ≤ 8: 完全替换为 `****`

**示例**:
```python
# 原始数据
{
  "api_key": "sk-1234567890abcdef",
  "username": "admin"
}

# 记录到日志
{
  "api_key": "sk-1****cdef",
  "username": "admin"
}
```

## 🗑️ 日志清理和归档

### 自动清理策略

- **保留期**: 90天
- **压缩期**: 30天后自动压缩（`.gz`）
- **清理频率**: 建议每天执行一次

### 手动清理

使用提供的清理脚本：

```bash
# 执行日志清理
./scripts/cleanup_logs.sh
```

**脚本功能**:
1. 删除90天前的所有日志文件
2. 压缩30-90天之间的日志文件
3. 删除空的MCP容器日志目录
4. 显示日志统计信息

**输出示例**:
```
======================================
日志清理工具
======================================
日志目录: /path/to/logs
保留期限: 90 天
压缩策略: 30 天后压缩

🗑️  清理 90 天前的日志...
  删除: operations.log.2024-08-01
  ✅ 已删除 15 个旧日志文件

📦 压缩 30 天前的日志...
  压缩: operations.log.2024-10-01 -> operations.log.2024-10-01.gz
  ✅ 已压缩 23 个日志文件

📊 日志统计信息：
  operations: 45 个文件
  mcp_calls: 12 个文件
  audit: 8 个文件
  MCP容器日志: 156 个文件 (45M)
  总计: 120M

✅ 日志清理完成！
```

### 设置自动清理（Cron）

**macOS/Linux**:
```bash
# 编辑crontab
crontab -e

# 添加以下行（每天凌晨3点执行）
0 3 * * * /path/to/deploy_newmind/scripts/cleanup_logs.sh >> /path/to/deploy_newmind/logs/cleanup.log 2>&1
```

## 📈 日志轮转配置

系统使用Python的 `TimedRotatingFileHandler`，配置如下：

- **轮转周期**: 每天午夜（midnight）
- **轮转间隔**: 1天
- **保留备份**: 90个文件
- **文件命名**: `{log_name}.log.YYYY-MM-DD`

**Docker容器日志配置**:
- **驱动**: `json-file`
- **单文件大小**: 10MB
- **保留文件数**: 5个
- **总大小上限**: 50MB/容器

## 🔧 高级功能

### 自定义日志记录

如果需要在代码中添加日志记录：

```python
from audit_logger import log_operation, log_audit, log_mcp_call

# 记录操作
log_operation("custom_action", "user_name", {
    "detail1": "value1",
    "detail2": "value2"
})

# 记录审计事件
log_audit("CUSTOM_EVENT", "Event description", {
    "key": "value"
}, user="admin")

# 记录MCP调用
log_mcp_call(
    instance_id="mcp-es-001",
    tool_name="search",
    parameters={"query": "test"},
    result="Found 10 results",
    duration=1.234,
    status="success"
)
```

### 日志查询和分析

**使用grep进行复杂查询**:
```bash
# 统计今天的API调用次数
grep "$(date +%Y-%m-%d)" logs/operations.log | grep "API_CALL" | wc -l

# 查找所有失败的MCP启动
grep "start_mcp_failed" logs/operations.log

# 查找特定时间段的审计事件
sed -n '/2025-11-09 01:00/,/2025-11-09 02:00/p' logs/audit.log
```

**使用Python脚本分析**:
```python
import re
from collections import Counter

# 统计各类操作的频率
with open('logs/operations.log') as f:
    actions = re.findall(r'\[ACTION:(\w+)\]', f.read())
    
counter = Counter(actions)
print("操作统计:")
for action, count in counter.most_common(10):
    print(f"  {action}: {count}")
```

## 🚨 故障排查

### 日志文件不存在

**问题**: `logs/` 目录下缺少日志文件

**解决方案**:
1. 确保Dashboard已启动
2. 检查目录权限：`ls -la logs/`
3. 手动创建目录：`mkdir -p logs/mcp_containers`

### 日志写入失败

**问题**: 日志记录不成功

**检查**:
```bash
# 查看Dashboard错误输出
python3 python_dashboard/main.py

# 检查磁盘空间
df -h

# 检查文件权限
ls -la logs/
```

### 日志文件过大

**问题**: 日志占用空间过大

**解决方案**:
```bash
# 立即执行清理
./scripts/cleanup_logs.sh

# 手动压缩
gzip logs/*.log.2025-*

# 删除旧日志
find logs/ -name "*.log.*" -mtime +90 -delete
```

## 📊 日志监控建议

### 关键指标

建议定期检查以下指标：

1. **MCP启动成功率**
   ```bash
   echo "Total starts: $(grep 'start_mcp_attempt' logs/operations.log | wc -l)"
   echo "Successful: $(grep 'start_mcp_success' logs/operations.log | wc -l)"
   echo "Failed: $(grep 'start_mcp_failed' logs/operations.log | wc -l)"
   ```

2. **API响应时间**
   ```bash
   grep "API_CALL.*duration" logs/operations.log | awk -F'duration=' '{print $2}' | awk -F's' '{print $1}' | sort -n | tail -10
   ```

3. **错误频率**
   ```bash
   grep "\[ERROR\]" logs/dashboard.log | wc -l
   ```

### 告警设置

可以配合监控工具设置告警：

- MCP启动失败超过3次/小时
- API响应时间超过5秒
- 日志文件大小超过1GB
- 磁盘空间低于10%

## 📚 相关文档

- [MCP管理指南](MCP_USAGE_GUIDE.md)
- [安装指南](INSTALLATION_GUIDE.md)
- [故障排查](PROJECT_STATUS.md)

## 🔄 更新记录

- **2025-11-09**: 初始版本，实现完整日志和审计系统
  - 4种日志类型（Dashboard、操作、MCP调用、审计）
  - 敏感信息自动过滤
  - API查询接口
  - 90天保留策略
  - 自动清理脚本


