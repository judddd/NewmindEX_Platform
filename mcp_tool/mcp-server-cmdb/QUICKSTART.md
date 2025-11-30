# 🚀 快速启动指南

## HTTP Streamable 模式（推荐用于测试）

### Linux/Mac 用户

```bash
# 1. 编辑脚本，修改你的凭证
nano start-http.sh

# 2. 启动服务器
./start-http.sh
```

### Windows 用户

```cmd
# 1. 编辑脚本，修改你的凭证
notepad start-http.bat

# 2. 启动服务器
start-http.bat
```

## 直接启动（命令行）

```bash
# Linux/Mac
export CMDB_DOMAIN="https://cmdb-service.starbucks.net"
export CMDB_APP_ID="your-app-id"
export CMDB_APP_SECRET="your-app-secret"
export CMDB_VERIFY_SSL="0"
export MCP_TRANSPORT="http"
export MCP_HTTP_PORT="3000"

node dist/index.js
```

```cmd
# Windows
set CMDB_DOMAIN=https://cmdb-service.starbucks.net
set CMDB_APP_ID=your-app-id
set CMDB_APP_SECRET=your-app-secret
set CMDB_VERIFY_SSL=0
set MCP_TRANSPORT=http
set MCP_HTTP_PORT=3000

node dist\index.js
```

## 测试服务器

启动后访问：

- **健康检查**: http://localhost:3000/health
- **MCP端点**: http://localhost:3000/mcp

使用 curl 测试：

```bash
curl http://localhost:3000/health
```

## 配置选项

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `CMDB_DOMAIN` | CMDB API 域名 | 必填 |
| `CMDB_APP_ID` | 应用ID | 必填 |
| `CMDB_APP_SECRET` | 应用密钥 | 必填 |
| `CMDB_VERIFY_SSL` | SSL验证 (`0`=禁用, `1`=启用) | `0` |
| `CMDB_CA_CERT_PATH` | 自定义CA证书路径 | 可选 |
| `MCP_TRANSPORT` | 传输模式 (`http`或留空) | stdio |
| `MCP_HTTP_HOST` | HTTP监听地址 | `localhost` |
| `MCP_HTTP_PORT` | HTTP监听端口 | `3000` |

## Stdio 模式（MCP客户端使用）

不需要启动脚本，直接在MCP配置中使用：

```json
{
  "mcpServers": {
    "cmdb": {
      "command": "node",
      "args": ["/path/to/mcp-server-cmdb/dist/index.js"],
      "env": {
        "CMDB_DOMAIN": "https://cmdb-service.starbucks.net",
        "CMDB_APP_ID": "your-app-id",
        "CMDB_APP_SECRET": "your-app-secret",
        "CMDB_VERIFY_SSL": "0"
      }
    }
  }
}
```

## 常见问题

### Q: 证书验证失败怎么办？
**A:** 已默认禁用SSL验证。如需启用，设置 `CMDB_VERIFY_SSL=1`

### Q: 如何使用自定义CA证书？
**A:** 设置 `CMDB_CA_CERT_PATH=/path/to/ca.pem`（会自动启用验证）

### Q: 端口被占用怎么办？
**A:** 修改 `MCP_HTTP_PORT` 环境变量为其他端口

### Q: 如何在后台运行？
```bash
# Linux/Mac
nohup ./start-http.sh > server.log 2>&1 &

# 或使用 screen/tmux
screen -S cmdb-mcp
./start-http.sh
# 按 Ctrl+A, D 分离会话
```

## 停止服务器

```bash
# 前台运行：按 Ctrl+C

# 后台运行：找到进程并终止
ps aux | grep "node dist/index.js"
kill <PID>
```

## 日志

所有日志输出到 stderr，可以重定向保存：

```bash
./start-http.sh 2> server.log
```

