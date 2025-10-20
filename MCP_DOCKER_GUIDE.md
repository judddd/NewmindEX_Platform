# MCP Docker 模式使用指南

## 概述

NewMind AI Platform 现已支持 **Docker 容器化的 MCP 服务器管理**，替代之前的 Node.js 直接运行模式。

## 优势

- ✅ **无需本地 Node.js**：所有 MCP 实例运行在 Docker 容器中
- ✅ **环境隔离**：每个实例独立运行，互不影响
- ✅ **统一管理**：通过 Docker API 标准化启停/监控
- ✅ **资源限制**：可控制每个实例的 CPU/内存占用
- ✅ **日志集中**：`docker logs` 统一查看
- ✅ **外部实例支持**：可检测并显示非 Dashboard 启动的实例（只读）

## 架构变更

### 之前（Native 模式）
```
Dashboard → mcp_manager.py → subprocess.Popen
                               ↓
                            node dist/index.js（本地进程）
```

### 现在（Docker 模式）
```
Dashboard → mcp_manager.py → Docker SDK → docker run
                                           ↓
                                        容器（完全隔离）
```

---

## 快速开始

### 1. 构建 MCP Docker 镜像

```bash
bash scripts/build_mcp_images.sh
```

**输出**：
- `installers/newmind-mcp-elasticsearch-1.0.0.tar`
- `installers/newmind-mcp-kibana-1.0.0.tar`
- `installers/newmind-mcp-newflow-1.0.0.tar`

### 2. 导入镜像（自动）

启动脚本会自动导入：
```bash
bash scripts/start_all.sh  # 步骤 8/13 会自动导入
```

手动导入：
```bash
bash scripts/07_load_mcp_images.sh
```

### 3. 使用 Dashboard 管理

访问 `http://localhost:8000`，在 MCP 管理页面：
- 创建实例 → 自动使用 Docker 容器
- 启动/停止 → 通过 `docker start/stop` 
- 查看日志 → 从容器获取
- 健康检查 → Docker 状态 + HTTP /health

---

## 文件结构

```
deploy_newmind/
├── mcp_tool/
│   ├── mcp-server-elasticsearch-sl/
│   │   └── Dockerfile              # ES MCP 镜像定义
│   ├── mcp-server-kibana/
│   │   └── Dockerfile              # Kibana MCP 镜像定义
│   └── newflow-mcp-server/
│       └── Dockerfile              # NewFlow MCP 镜像定义
├── scripts/
│   ├── build_mcp_images.sh         # 构建+导出脚本
│   └── 07_load_mcp_images.sh       # 导入脚本
├── installers/
│   ├── newmind-mcp-elasticsearch-1.0.0.tar
│   ├── newmind-mcp-kibana-1.0.0.tar
│   └── newmind-mcp-newflow-1.0.0.tar
└── python_dashboard/
    ├── mcp_manager.py              # Docker 模式管理器（当前）
    └── mcp_manager_native.py.bak   # Native 模式备份
```

---

## 容器命名规则

- **格式**：`mcp-{instance_id}`
- **示例**：
  - `mcp-mcp-elasticsearch-abc123de`
  - `mcp-mcp-kibana-456def78`
  - `mcp-mcp-newflow-789ghi90`

## 端口映射

- **容器内**：固定 3000 端口
- **主机端口**：由 Dashboard 分配（3001-3100）
- **映射示例**：`-p 3001:3000`（主机3001 → 容器3000）

---

## Docker 镜像详情

### 基础镜像
- `node:20-alpine`（轻量级，约 150MB）

### 构建过程
1. 复制 `package.json` 和 `tsconfig.json`
2. `npm ci`（安装所有依赖，包括 devDependencies）
3. 复制源代码
4. `npm run build`（TypeScript 编译）
5. `npm prune --production`（清理 devDependencies）

### 健康检查
- **命令**：`wget http://localhost:3000/health`
- **间隔**：10秒
- **超时**：3秒
- **重试**：3次

---

## 常用命令

### 查看所有 MCP 容器
```bash
docker ps -a --filter "name=mcp-"
```

### 查看容器日志
```bash
docker logs mcp-{instance_id}
docker logs -f mcp-{instance_id}  # 实时跟踪
```

### 手动启动/停止容器
```bash
docker start mcp-{instance_id}
docker stop mcp-{instance_id}
docker restart mcp-{instance_id}
```

### 进入容器调试
```bash
docker exec -it mcp-{instance_id} sh
```

### 查看容器资源占用
```bash
docker stats mcp-{instance_id}
```

### 清理所有 MCP 容器
```bash
docker rm -f $(docker ps -aq --filter "name=mcp-")
```

---

## 故障排查

### 1. 构建失败：`tsc: not found`
**原因**：Dockerfile 使用了 `npm ci --only=production`  
**解决**：已修复为 `npm ci` + `npm prune --production`

### 2. 容器无法启动
```bash
# 查看详细日志
docker logs mcp-{instance_id}

# 检查镜像是否存在
docker images | grep newmind-mcp

# 重新构建镜像
bash scripts/build_mcp_images.sh
```

### 3. 健康检查失败
```bash
# 进入容器检查
docker exec -it mcp-{instance_id} sh
wget -O- http://localhost:3000/health

# 检查环境变量
docker inspect mcp-{instance_id} | grep Env -A 20
```

### 4. 端口冲突
```bash
# 查看端口占用
lsof -i :3001

# Dashboard 会自动分配可用端口（3001-3100）
```

### 5. 无法连接到外部服务（ES/Kibana）
**原因**：容器内无法访问 `localhost`  
**解决**：
- ✅ 使用 `host.docker.internal`（macOS/Windows）
- ✅ 使用服务的实际 IP
- ✅ Docker Compose 中使用服务名（如 `http://es01:9200`）

---

## 迁移指南（Native → Docker）

### 停止旧的 Native 模式实例
```bash
# 停止所有 Node 进程的 MCP 实例
pkill -f "node.*mcp-server"

# 或在 Dashboard 中逐个停止
```

### 清理旧的 PID 文件
```bash
rm -rf python_dashboard/mcp_pids/*.pid
```

### 重新创建实例
1. 访问 Dashboard
2. 删除旧实例（如果状态异常）
3. 创建新实例 → 自动使用 Docker 模式

---

## 性能对比

| 指标 | Native 模式 | Docker 模式 |
|------|------------|------------|
| 启动时间 | <1秒 | 1-3秒 |
| 内存开销 | 低（仅进程） | 中（+容器开销） |
| CPU 开销 | 低 | 低（Linux），中（macOS/Win） |
| 管理复杂度 | 高（PID/信号） | 低（Docker API） |
| 隔离性 | 进程级 | 容器级（更强） |
| 适用场景 | 开发/快速测试 | 生产/多实例 |

---

## 未来规划

- [ ] 支持 Docker Compose 批量管理
- [ ] Kubernetes 部署支持
- [ ] 资源限制配置（CPU/内存）
- [ ] 容器自动重启策略
- [ ] 日志轮转配置
- [ ] 多租户网络隔离
- [ ] Prometheus 监控集成

---

## 回退到 Native 模式

> ⚠️ **已移除 Native 模式备份文件**  
> 当前系统仅支持 Docker 模式，不再提供 Native 模式回退选项。  
> 若需要 Native 模式，请从 Git 历史中恢复 `mcp_manager_native.py`。

---

## 技术细节

### Docker SDK (Python)
```python
import docker
client = docker.from_env()

# 启动容器
container = client.containers.run(
    image='newmind-mcp-elasticsearch:1.0.0',
    name='mcp-abc123',
    environment={'ES_URL': 'http://host.docker.internal:9200'},
    ports={'3000/tcp': 3001},
    detach=True
)

# 健康检查
container.status  # 'running', 'exited', etc.

# 日志
logs = container.logs(tail=100)

# 停止
container.stop(timeout=10)
container.remove()
```

### 环境变量传递
```python
# Dashboard → Docker 容器
environment = {
    "MCP_TRANSPORT": "http",
    "MCP_HTTP_PORT": "3000",
    "ES_URL": config["es_url"],
    "ES_API_KEY": config["es_api_key"]
}
```

---

## 常见问题 FAQ

**Q: 为什么切换到 Docker？**  
A: 消除 Node.js 依赖，统一管理，环境隔离，适合生产部署。

**Q: 镜像文件很大怎么办？**  
A: 每个镜像约 200-300MB，已通过 `npm prune --production` 优化。可考虑多阶段构建进一步缩小。

**Q: 能否混用 Native 和 Docker 模式？**  
A: 不建议。选择一种模式统一使用。

**Q: Docker Desktop 必须吗？**  
A: macOS/Windows 需要。Linux 只需 Docker Engine。

**Q: 如何更新 MCP 版本？**  
A: 重新运行 `build_mcp_images.sh`，Dashboard 会自动使用新镜像。

---

## 支持

遇到问题？
1. 查看日志：`docker logs mcp-{instance_id}`
2. 检查 Dashboard 日志：`tail -f python_dashboard/dashboard.log`
3. 提交 Issue 到 GitHub

---

**祝使用愉快！** 🐳🚀

