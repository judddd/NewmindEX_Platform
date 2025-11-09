# NewMind AI Platform 自动重启配置指南

本文档说明如何配置系统，使NewMind AI Platform在系统重启后自动启动所有服务。

## 🎯 自动重启架构

```
系统启动
  ↓
macOS LaunchAgent 启动
  ↓
start_all.sh 脚本运行
  ↓
1. Docker Compose 启动 (ES/Kibana/NewFlow) → 自动重启
  ↓
2. Dashboard 启动 (Python FastAPI)
  ↓
3. Dashboard自动重启之前运行的MCP实例
  ↓
✅ 所有服务就绪
```

## 📋 已实现的自动重启功能

### 1. Docker 服务自动重启 ✅

**配置位置**：`docker-compose.yml`

所有Docker服务都添加了 `restart: unless-stopped` 策略：

```yaml
services:
  es01:
    restart: unless-stopped  # ✅ 自动重启
  es02:
    restart: unless-stopped  # ✅ 自动重启
  es03:
    restart: unless-stopped  # ✅ 自动重启
  kibana:
    restart: unless-stopped  # ✅ 自动重启
  logstash:
    restart: unless-stopped  # ✅ 自动重启
  newflow:
    restart: unless-stopped  # ✅ 自动重启
```

**效果**：
- Docker Desktop启动后，这些容器会自动启动
- 容器崩溃后会自动重启
- 只有手动停止（`docker stop`）才不会重启

### 2. Dashboard 自动重启 MCP 实例 ✅

**配置位置**：`python_dashboard/main.py` 的 `startup_event()`

Dashboard启动时会：

1. 等待5秒让Docker服务就绪
2. 读取数据库中所有MCP实例
3. 检查哪些实例之前标记为 `running`
4. 自动重启这些实例

```python
@app.on_event("startup")
async def startup_event():
    # 等待 Docker 服务启动
    await asyncio.sleep(5)
    
    # 自动重启所有之前运行的MCP实例
    instances = get_all_instances()
    for instance in instances:
        if instance.get('status') == 'running' and not is_healthy:
            start_mcp_server(instance['id'])
```

**效果**：
- MCP容器会自动重新创建并启动
- 保持之前的配置（端口、认证信息等）
- Dashboard启动日志会显示重启进度

### 3. MCP容器配置 ✅

**容器配置**：

MCP容器使用 `restart=False`（由Dashboard管理），特点：
- 加入 `elastic` Docker网络
- 使用Docker服务名访问（`es01`, `kibana`, `newflow`）
- 端口映射到宿主机（3001-3003）

## 🚀 配置开机自启动

### 方式一：使用 LaunchAgent（推荐）

运行配置脚本：

```bash
cd /Users/ablatazmat/Downloads/deploy_newmind
bash scripts/create_launchd_service.sh
```

**这个脚本会**：
1. 创建 `~/Library/LaunchAgents/com.newmind.platform.plist`
2. 配置在用户登录时自动运行 `start_all.sh`
3. 立即加载LaunchAgent

**管理命令**：

```bash
# 查看状态
launchctl list | grep com.newmind.platform

# 手动启动
launchctl start com.newmind.platform

# 禁用自启
launchctl unload ~/Library/LaunchAgents/com.newmind.platform.plist

# 启用自启
launchctl load ~/Library/LaunchAgents/com.newmind.platform.plist

# 删除配置
rm ~/Library/LaunchAgents/com.newmind.platform.plist
launchctl remove com.newmind.platform
```

### 方式二：添加到登录项

1. 打开 **系统设置** → **通用** → **登录项**
2. 点击 **+** 添加项目
3. 选择 `start_all.sh` 脚本
4. 确保勾选"在登录时打开"

**优点**：简单直观
**缺点**：每次登录会弹出终端窗口

## 🔄 重启流程时间线

完整的重启流程大约需要 **2-3分钟**：

```
00:00  系统启动
00:30  用户登录
00:31  LaunchAgent 触发 start_all.sh
       ↓
00:35  Docker Desktop 启动
00:40  Docker Compose 启动容器
       • ES集群启动 (3个节点)
       • Kibana启动（等待ES就绪）
       • NewFlow启动
       ↓
01:30  Docker服务全部就绪
       ↓
01:35  Dashboard启动
       • 等待Docker服务（5秒）
       • 重启MCP实例（10-20秒）
       • 等待NewFlow（最多30秒）
       • 导入工作流
       ↓
02:00  所有服务就绪
       ✅ http://localhost:8000 可访问
```

## 📊 验证自动重启

### 测试步骤

1. **停止所有服务**：
   ```bash
   bash scripts/stop_all.sh
   ```

2. **重启系统**：
   ```bash
   sudo reboot
   ```

3. **登录后等待2-3分钟**

4. **检查服务状态**：
   ```bash
   # 检查Docker容器
   docker ps
   
   # 应该看到：es01, es02, es03, kibana, newflow
   # 以及MCP容器：mcp-mcp-elasticsearch-xxx, mcp-mcp-kibana-xxx等
   ```

5. **访问Dashboard**：
   ```bash
   open http://localhost:8000
   ```

6. **检查MCP实例**：
   - Dashboard应该显示所有之前运行的MCP实例
   - 状态应该是"运行中"

### 检查日志

```bash
# LaunchAgent日志
tail -f logs/launchd-stdout.log
tail -f logs/launchd-stderr.log

# Dashboard日志
tail -f python_dashboard/dashboard.log

# MCP日志
tail -f python_dashboard/mcp_logs/mcp-elasticsearch-xxx.log
```

## 🚨 故障排查

### 问题1：重启后Dashboard未启动

**检查**：
```bash
# 查看LaunchAgent状态
launchctl list | grep com.newmind.platform

# 查看日志
cat logs/launchd-stderr.log
```

**可能原因**：
- LaunchAgent未加载：重新运行 `create_launchd_service.sh`
- 脚本权限问题：确保 `start_all.sh` 有执行权限
- 环境变量缺失：检查 `.env` 文件是否存在

**解决**：
```bash
# 重新配置LaunchAgent
bash scripts/create_launchd_service.sh

# 确保脚本可执行
chmod +x scripts/start_all.sh
```

### 问题2：MCP实例未自动重启

**检查**：
```bash
# 查看Dashboard日志
tail -50 python_dashboard/dashboard.log
```

**可能原因**：
- Dashboard启动太快，Docker还没就绪
- 数据库中实例状态不是 `running`
- Docker镜像不存在

**解决**：
```bash
# 手动启动MCP实例
# 方式1：通过Dashboard界面
open http://localhost:8000

# 方式2：通过API
curl -X POST http://localhost:8000/api/mcp/instances/YOUR_INSTANCE_ID/start
```

### 问题3：Docker服务未自动重启

**检查**：
```bash
# 查看Docker Desktop是否运行
ps aux | grep Docker

# 查看容器状态
docker ps -a
```

**可能原因**：
- Docker Desktop未设置开机启动
- Docker Desktop启动缓慢

**解决**：
1. 打开 Docker Desktop 设置
2. 勾选 "Start Docker Desktop when you log in"
3. 增加Dashboard的等待时间（修改 `main.py` 中的 `asyncio.sleep(5)` 改为10）

### 问题4：ES集群不健康

**检查**：
```bash
# 查看ES健康状态
curl http://localhost:9200/_cluster/health

# 查看ES日志
docker logs es01
```

**可能原因**：
- 内存不足
- 磁盘空间不足
- 节点间网络问题

**解决**：
```bash
# 重启ES集群
docker-compose restart es01 es02 es03

# 等待30秒检查健康
sleep 30
curl http://localhost:9200/_cluster/health
```

## 📝 手动启动/停止

### 启动所有服务

```bash
cd /Users/ablatazmat/Downloads/deploy_newmind
bash scripts/start_all.sh
```

### 停止所有服务

```bash
cd /Users/ablatazmat/Downloads/deploy_newmind
bash scripts/stop_all.sh
```

### 只启动Docker服务

```bash
docker-compose up -d
```

### 只启动Dashboard

```bash
cd python_dashboard
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔐 安全注意事项

1. **端口暴露**：默认配置在 `0.0.0.0` 监听，生产环境建议只监听 `127.0.0.1`
2. **认证保护**：ES/Kibana需要密码认证
3. **防火墙**：建议启用macOS防火墙
4. **日志审计**：定期检查 `logs/` 目录

## 🎯 最佳实践

1. **定期备份**：
   ```bash
   # 备份MCP配置数据库
   cp python_dashboard/mcp_instances.db python_dashboard/mcp_instances.db.backup
   
   # 备份ES数据
   docker exec es01 elasticsearch-backup.sh
   ```

2. **监控健康**：
   ```bash
   # 检查所有服务
   curl http://localhost:8000/api/status
   ```

3. **日志轮转**：
   ```bash
   # 定期清理旧日志
   find logs/ -name "*.log" -mtime +30 -delete
   ```

4. **更新检查**：
   ```bash
   # 检查Docker镜像更新
   docker-compose pull
   ```

## 📚 相关文件

- **LaunchAgent创建脚本**：`scripts/create_launchd_service.sh`
- **启动脚本**：`scripts/start_all.sh`
- **停止脚本**：`scripts/stop_all.sh`
- **Docker配置**：`docker-compose.yml`（包含restart策略）
- **Dashboard启动逻辑**：`python_dashboard/main.py`（包含MCP自动重启）
- **MCP管理器**：`python_dashboard/mcp_manager.py`

## 🎉 总结

配置完成后，你的系统将会：

✅ **系统重启时**：
1. Docker服务自动启动
2. ES/Kibana/NewFlow自动启动
3. Dashboard自动启动
4. MCP实例自动重启

✅ **容器崩溃时**：
1. Docker会自动重启容器
2. Dashboard检测到并更新状态

✅ **手动停止后**：
1. 服务保持停止状态（不会自动重启）
2. 需要手动运行 `start_all.sh` 启动

现在你可以放心地重启系统，所有服务会自动恢复！🚀

