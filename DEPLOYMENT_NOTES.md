# 部署实施笔记

## 实际部署中遇到的问题和解决方案

本文档记录了实际部署过程中遇到的问题和解决方案，以便下次部署时参考。

---

## 1. NewFlow Docker镜像加载问题

### 问题
`docker-compose up`时报错：`pull access denied for newflow`

### 原因
- `newflow-1.0.12.tar`文件在项目根目录，而非`installers/`目录
- Docker Compose在没找到本地镜像时，尝试从Docker Hub拉取（失败）

### 解决方案
修改`scripts/01_prepare_installers.sh`，添加自动检测和移动逻辑：

```bash
# 检查NewFlow TAR (可能在项目根目录)
NEWFLOW_TAR=""
if [ -f "installers/newflow-1.0.12.tar" ]; then
    NEWFLOW_TAR="installers/newflow-1.0.12.tar"
elif [ -f "newflow-1.0.12.tar" ]; then
    NEWFLOW_TAR="newflow-1.0.12.tar"
    mv newflow-1.0.12.tar installers/
    NEWFLOW_TAR="installers/newflow-1.0.12.tar"
fi

# 加载Docker镜像
if [ -n "$NEWFLOW_TAR" ]; then
    if ! docker images | grep -q "newflow.*1.0.12"; then
        docker load -i "$NEWFLOW_TAR"
    fi
fi
```

### 关键点
- **必须在`docker-compose up`之前加载镜像**
- `01_prepare_installers.sh`应该在启动流程的早期执行
- 检查镜像是否已加载：`docker images | grep newflow`

---

## 2. Python项目构建失败

### 问题
`uv pip install -e .`报错：
```
ValueError: Unable to determine which files to ship inside the wheel
```

### 原因
`pyproject.toml`缺少`tool.hatch.build.targets.wheel`配置

### 解决方案
添加wheel配置：

```toml
[tool.hatch.build.targets.wheel]
packages = ["."]
```

### 完整配置
```toml
[project]
name = "newmind-dashboard"
version = "1.0.0"
description = "NewMind AI Platform Management Dashboard"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "httpx>=0.26.0",
    "python-multipart>=0.0.6",
    "jinja2>=3.1.3",
    "aiosqlite>=0.19.0",
    "websockets>=12.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["."]  # 这一行是关键！

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.4",
    "pytest-asyncio>=0.23.3",
]
```

---

## 3. ES和Kibana启动时间

### 观察
- NewFlow: 立即启动（< 10秒）
- Logstash: 快速启动（~ 30秒）
- Elasticsearch: 需要1-2分钟
- Kibana: 需要1-2分钟（依赖ES）

### 建议
1. 不要在ES完全启动前激活试用许可
2. 在`start_all.sh`中添加额外等待时间
3. 使用`scripts/check_services.sh`实时监控状态

### 启动顺序优化
```bash
# 1. 加载NewFlow镜像 (01_prepare_installers.sh)
# 2. 启动Docker服务 (07_start_docker_services.sh)
# 3. 等待30秒
sleep 30
# 4. 激活ES许可 (08_activate_trial_license.sh)
# 5. 配置其他服务
```

---

## 4. MCP服务器构建

### 成功构建的服务器
- ✅ mcp-server-elasticsearch-sl
- ✅ mcp-server-kibana
- ✅ newflow-mcp-server

### 构建命令
```bash
cd mcp_tool/mcp-server-elasticsearch-sl
npm install && npm run build

cd mcp_tool/mcp-server-kibana
npm install && npm run build

cd mcp_tool/newflow-mcp-server
npm install && npm run build
```

### 警告处理
- npm警告（deprecated包）可以忽略
- 安全漏洞（vulnerabilities）在开发环境可以暂时忽略

---

## 5. 文件位置规范

### 实际文件位置
```
deploy_newmind/
├── newflow-1.0.12.tar          # 实际位置（会被自动移动）
├── installers/
│   ├── newflow-1.0.12.tar      # 应该在这里
│   ├── LM-Studio-0.3.30-1-arm64.dmg
│   └── NewmindChat-electron-0.0.1-mac-arm64.dmg
```

### 建议
- 所有安装包统一放在`installers/`目录
- 脚本应能自动处理文件位置偏差

---

## 6. 服务启动验证清单

### Docker服务检查
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

期望输出：
- es01, es02, es03 - Up
- kibana - Up
- logstash - Up
- newflow - Up

### 服务健康检查
```bash
# NewFlow (应该立即可用)
curl http://localhost:5677

# Elasticsearch (可能需要1-2分钟)
curl http://localhost:9200/_cluster/health

# Kibana (可能需要1-2分钟)
curl http://localhost:5601/api/status
```

### 使用check_services.sh
```bash
bash scripts/check_services.sh
```

---

## 7. 常见错误和解决方案

### 错误1: Docker镜像拉取失败
```
Error: pull access denied for newflow
```
**解决**: 运行`bash scripts/01_prepare_installers.sh`加载本地镜像

### 错误2: Python包安装失败
```
ValueError: Unable to determine which files to ship
```
**解决**: 确保`pyproject.toml`有`tool.hatch.build.targets.wheel`配置

### 错误3: ES无法访问
```
curl: (7) Failed to connect to localhost port 9200
```
**解决**: 等待1-2分钟，ES正在启动。查看日志：`docker logs es01`

### 错误4: Kibana白屏
**解决**: 
1. 检查ES是否已启动：`curl http://localhost:9200`
2. 查看Kibana日志：`docker logs kibana`
3. 等待Kibana完全启动（可能需要2分钟）

---

## 8. 性能优化建议

### ES内存配置
当前配置：每节点31GB（总93GB）

如果内存不足，修改`.env`：
```env
ES_MEM=4g  # 或其他适合的值
```

### Docker资源限制
在Docker Desktop设置中：
- Memory: 至少16GB（推荐32GB+）
- CPUs: 至少4核（推荐8核+）
- Disk: 至少100GB

---

## 9. 调试技巧

### 查看容器日志
```bash
# 实时查看
docker logs -f es01
docker logs -f kibana
docker logs -f newflow

# 查看最后100行
docker logs --tail 100 es01
```

### 查看Dashboard日志
```bash
tail -f python_dashboard/dashboard.log
```

### 检查MCP进程
```bash
# 查看PID文件
ls -la python_dashboard/mcp_pids/

# 检查进程是否运行
ps aux | grep mcp
```

---

## 10. 下次部署检查清单

部署前：
- [ ] 确认`newflow-1.0.12.tar`在项目根目录或`installers/`
- [ ] 确认Docker Desktop正在运行
- [ ] 确认至少有100GB可用磁盘空间
- [ ] 确认网络连接正常（下载依赖）

部署过程：
- [ ] 按顺序执行脚本，不要跳过步骤
- [ ] 等待每个步骤完成再继续
- [ ] 注意错误信息，及时处理
- [ ] ES和Kibana启动后等待1-2分钟再访问

部署后验证：
- [ ] 运行`bash scripts/check_services.sh`
- [ ] 访问http://localhost:5677 (NewFlow)
- [ ] 访问http://localhost:9200 (ES)
- [ ] 访问http://localhost:5601 (Kibana)
- [ ] 访问http://localhost:8000 (Dashboard)

---

## 11. 成功部署的标志

当所有以下条件满足时，部署成功：

```bash
bash scripts/check_services.sh
```

输出应显示：
- ✅ ES Node 1 (9200) - 运行中
- ✅ Kibana (5601) - 运行中
- ✅ NewFlow (5677) - 运行中
- ✅ Dashboard - 运行中

浏览器访问：
- http://localhost:8000 - Dashboard正常显示
- http://localhost:5601 - Kibana登录页正常
- http://localhost:5677 - NewFlow界面正常

---

## 12. 紧急回滚

如果部署失败需要重新开始：

```bash
# 1. 停止所有服务
bash scripts/stop_all.sh

# 2. 清理Docker资源
docker-compose down -v  # 警告：会删除所有数据卷

# 3. 清理Python虚拟环境
rm -rf python_dashboard/.venv

# 4. 重新开始
bash scripts/start_all.sh
```

---

## 总结

关键要点：
1. **NewFlow镜像必须在docker-compose前加载**
2. **Python项目需要正确的wheel配置**
3. **ES和Kibana需要耐心等待启动**
4. **使用check_services.sh监控状态**
5. **遇到问题查看日志文件**

记住：第一次部署总是最慢的（下载依赖、构建镜像），后续部署会快得多。


