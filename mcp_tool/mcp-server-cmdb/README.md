# CMDB MCP 服务器

> **基于 MCP 协议的 CMDB API 集成服务器 - 资产管理与查询解决方案**

通过 Model Context Protocol (MCP) 协议，让NewChat等 MCP 客户端能够直接连接和查询 CMDB（配置管理数据库）平台，使用自然语言管理 IT 资产。

## 功能特性

- **完整的 CMDB API 集成**：登录认证、视图查询、数据过滤、字段提取
- **灵活的查询支持**：支持带条件或不带条件的查询，支持分页
- **字段提取功能**：从大数据集中提取特定字段，支持点号路径
- **双传输模式**：Stdio 模式用于本地集成，HTTP 模式用于远程访问
- **Token 缓存**：自动管理 token，带过期处理机制
- **SSL/TLS 支持**：可配置的 SSL 证书验证

## 前置要求

- Node.js >= 18
- CMDB API 实例及凭证（APP_ID 和 APP_SECRET）
- MCP 客户端（如 NewChat）或 HTTP 客户端用于远程访问

## 安装

### 方式一：从源码安装

```bash
cd /Users/ablatazmat/Downloads/newflow_mcp/mcp-server-cmdb
npm install
npm run build
```

### 方式二：全局安装（可选）

```bash
npm install -g .
```

## 配置

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `CMDB_DOMAIN` | CMDB API 域名 URL | 是 | - |
| `CMDB_APP_ID` | 应用 ID（用于认证） | 是 | - |
| `CMDB_APP_SECRET` | 应用密钥（用于认证） | 是 | - |
| `CMDB_VERIFY_SSL` | 验证 SSL 证书（设为 `0` 或 `false` 禁用） | 否 | `true` |
| `MCP_TRANSPORT` | 传输模式（`stdio` 或 `http`） | 否 | `stdio` |
| `MCP_HTTP_PORT` | HTTP 服务器端口（HTTP 模式时） | 否 | `3000` |
| `MCP_HTTP_HOST` | HTTP 服务器主机（HTTP 模式时） | 否 | `localhost` |

## 快速开始

### Stdio 模式（NewChat 集成）

1. **配置 NewChat MCP 服务器**

   在 NewChat 设置中打开 MCP 配置页面，粘贴以下配置：

   ```json
   {
     "mcpServers": {
       "cmdb": {
         "command": "node",
         "args": [
           "你的项目路径/mcp-server-cmdb/dist/index.js"
         ],
         "env": {
           "CMDB_DOMAIN": "https://cmdb-service.starbucks.net",
           "CMDB_APP_ID": "你的应用ID",
           "CMDB_APP_SECRET": "你的应用密钥",
           "CMDB_VERIFY_SSL": "true"
         }
       }
     }
   }
   ```

   **注意：** 请将 `你的项目路径` 替换为实际的项目安装路径。

2. **保存并重启 NewChat**

3. **开始查询**

   在 NewChat 中开始对话，可以这样提问：
   - "测试 CMDB 连接"
   - "查询视图 ID xxx 并显示前 50 条记录"
   - "查找所有 STG 环境中 dataStatus 为 efficient 的服务器"

### HTTP 模式（远程访问）

以独立 HTTP 服务运行：

```bash
# 启动 HTTP 服务器（默认端口 3000）
MCP_TRANSPORT=http \
CMDB_DOMAIN=https://cmdb-service.starbucks.net \
CMDB_APP_ID=你的应用ID \
CMDB_APP_SECRET=你的应用密钥 \
npm start

# 或使用自定义端口和主机
MCP_TRANSPORT=http \
MCP_HTTP_PORT=9000 \
MCP_HTTP_HOST=0.0.0.0 \
CMDB_DOMAIN=https://cmdb-service.starbucks.net \
CMDB_APP_ID=你的应用ID \
CMDB_APP_SECRET=你的应用密钥 \
npm start
```

**HTTP 模式特性：**
- MCP 端点：`http://host:port/mcp`
- 健康检查：`http://host:port/health`
- 基于 Session 的连接管理
- 支持 POST（JSON-RPC 请求）和 GET（SSE 流）

## 可用工具

### 1. `cmdb_login`

测试连接到 CMDB API 并验证凭证。

**参数：** 无

**使用示例：**
```
"测试 CMDB 连接"
```

### 2. `cmdb_query_view`

查询 CMDB 视图并获取资产数据。

**参数：**
- `viewid`（必需）：要查询的 CMDB 视图 ID
- `pageSize`（可选，默认：50）：每页记录数
- `startPage`（可选，默认：1）：起始页码

**使用示例：**
```
"查询视图 ID abc123 并显示第 1 页，每页 50 条记录"
```

### 3. `cmdb_query_with_conditions`

使用过滤条件查询 CMDB 视图。

**参数：**
- `viewid`（必需）：要查询的 CMDB 视图 ID
- `conditions`（必需）：查询条件数组
  - `key`：要过滤的字段名
  - `operation`：操作类型（eq, like, gt, lt, gte, lte, ne, in 等）
  - `value`：比较值
- `pageSize`（可选，默认：50）：每页记录数
- `startPage`（可选，默认：1）：起始页码

**使用示例：**
```
"在视图 xyz789 中查找所有 dataStatus 为 'efficient' 且 env 为 'STG' 的服务器"
```

**条件格式：**
```json
[
  {"key": "dataStatus", "operation": "eq", "value": "efficient"},
  {"key": "env", "operation": "eq", "value": "STG"}
]
```

### 4. `cmdb_extract_fields`

查询 CMDB 视图并仅提取结果中的特定字段。

**参数：**
- `viewid`（必需）：要查询的 CMDB 视图 ID
- `fields`（必需）：要提取的字段名数组（支持点号路径）
- `conditions`（可选）：查询条件数组（格式同上）
- `pageSize`（可选，默认：50）：每页记录数
- `startPage`（可选，默认：1）：起始页码

**使用示例：**
```
"从视图 abc123 中提取 vHostName、businessIp 和 manager_show_value 字段，条件是 lifecycleState 为 'inused'"
```

**字段示例：**
- 简单字段：`vHostName`、`businessIp`、`operatingSystem`
- 显示值字段：`manager_show_value`、`env_show_value`、`status_show_value`
- 数组字段：`ipList`、`ipv6List`

## 查询示例

### 示例 1：测试连接
```
用户："测试 CMDB 连接"

响应：连接状态和 token 预览
```

### 示例 2：基础查询
```
用户："查询视图 ID view123 并显示前 20 台虚拟机"

响应：包含所有字段的 20 条虚拟机记录列表
```

### 示例 3：条件查询
```
用户："从视图 view456 中查找所有生产环境的 Linux 服务器"

条件：
[
  {"key": "osType", "operation": "eq", "value": "Linux"},
  {"key": "env", "operation": "eq", "value": "PRD"}
]
```

### 示例 4：字段提取
```
用户："获取所有 STG 服务器的主机名、IP 地址和管理员姓名"

字段：["vHostName", "businessIp", "manager_show_value"]
条件：[{"key": "env", "operation": "eq", "value": "STG"}]
```

## 响应格式

所有 CMDB 查询返回结构化数据：

```json
{
  "success": true,
  "total": 35646,
  "pages": 357,
  "pageNum": 1,
  "pageSize": 50,
  "startRow": 1,
  "endRow": 50,
  "content": [
    {
      "_id": "...",
      "vHostName": "server001",
      "businessIp": "192.168.1.10",
      "operatingSystem": "Ubuntu 24.04",
      ...
    }
  ]
}
```

## 常用字段名

基于 CMDB 数据结构，常用字段包括：

- **标识信息**：`_id`、`vHostName`、`instanceID`、`cnfgid`
- **网络信息**：`businessIp`、`ipList`、`ipv6List`、`fqdn`
- **系统信息**：`operatingSystem`、`osType`、`vmToolsVersion`
- **资源信息**：`memory`、`sumCpuCore`、`diskSize`、`info`
- **环境信息**：`env`、`env_show_value`、`area`、`area_show_value`
- **状态信息**：`status`、`status_show_value`、`lifecycleState`、`dataStatus`
- **业务信息**：`businessSystem`、`businessSystem_show_value`、`APPType`
- **管理信息**：`manager`、`manager_show_value`、`applicant`、`Department`
- **监控信息**：`monitoring`、`monitorStatus`、`traceable`、`xdrRequired`
- **时间戳**：`createtime`、`ciUpdateTime`、`acquisitionTime`、`expirationTime`

## 调试

### 方式一：使用 MCP Inspector

```bash
CMDB_DOMAIN=https://cmdb-service.starbucks.net \
CMDB_APP_ID=你的应用ID \
CMDB_APP_SECRET=你的应用密钥 \
npm run inspector
```

这将在 `http://localhost:5173` 启动 MCP Inspector 用于调试。

### 方式二：使用测试脚本

```bash
CMDB_DOMAIN=https://cmdb-service.starbucks.net \
CMDB_APP_ID=你的应用ID \
CMDB_APP_SECRET=你的应用密钥 \
node test-connection.js
```

快速测试连接是否正常。

## 故障排除

### 连接问题

1. **验证凭证**：确保 `CMDB_APP_ID` 和 `CMDB_APP_SECRET` 正确
2. **检查域名 URL**：验证 `CMDB_DOMAIN` 可访问且格式正确
3. **SSL 问题**：如使用自签名证书，在配置中设置 `"CMDB_VERIFY_SSL": "0"`
4. **路径问题**：确保配置中的 `args` 路径指向正确的 `dist/index.js` 文件位置

### 查询问题

1. **视图 ID**：确保视图 ID 存在且有访问权限
2. **字段名**：检查字段名拼写正确（区分大小写）
3. **操作符**：验证操作类型是否被 CMDB API 支持

### 错误信息

- `Login failed`：检查凭证和域名 URL
- `Query failed`：视图 ID 可能无效或缺少权限
- `Field not found`：指定字段在记录中不存在
- `Command not found`：检查配置中的路径是否正确，确保已运行 `npm run build`

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 监听模式（开发）
npm run watch

# 运行 stdio 模式
npm start

# 运行 HTTP 模式
npm run start:http

# 使用 MCP Inspector 调试
npm run inspector
```

## 项目结构

- `index.ts` - 主入口文件
- `src/cmdb-client.ts` - CMDB API 客户端封装
- `src/types.ts` - TypeScript 类型定义
- `dist/` - 编译输出目录
- `test-connection.js` - 连接测试脚本

## 技术栈

- **运行时依赖**：
  - `@modelcontextprotocol/sdk`: ^1.19.1 - MCP 协议实现
  - `axios`: ^1.7.0 - HTTP 客户端用于 CMDB API
  - `express`: ^5.1.0 - HTTP 服务器用于 HTTP 模式
  - `zod`: ^3.23.0 - Schema 验证

- **开发依赖**：
  - `typescript`: ^5.8.2 - TypeScript 编译器
  - `@types/node`: ^22.13.15 - Node.js 类型定义
  - `@types/express`: ^5.0.3 - Express 类型定义
  - `shx`: ^0.4.0 - 跨平台 shell 命令

## 许可证

Apache-2.0

## 支持

如有问题、功能请求或疑问，请在仓库中提交 issue。
