# NewMind AI Platform - 离线安装指南

> 版本: 1.0  
> 更新时间: 2025-11-07

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细安装步骤](#详细安装步骤)
- [验证安装](#验证安装)
- [常见问题](#常见问题)
- [故障排除](#故障排除)
- [手动安装指南](#手动安装指南)
- [卸载说明](#卸载说明)

---

## 系统要求

### 最低配置

| 组件 | 要求 |
|------|------|
| **操作系统** | macOS 11.0 (Big Sur) 或更高 |
| **处理器** | Apple Silicon (M1/M2/M3) |
| **内存** | 32GB RAM |
| **存储** | 200GB 可用空间 |
| **网络** | 完全离线（所有组件已包含） |

### 推荐配置

| 组件 | 推荐 |
|------|------|
| **操作系统** | macOS 13.0 (Ventura) 或更高 |
| **处理器** | Apple M2 Pro/Max/Ultra 或 M3 系列 |
| **内存** | 64GB+ RAM |
| **存储** | 500GB+ 可用空间 (SSD) |

---

## 快速开始

### 一键安装（推荐）

```bash
# 1. 插入移动硬盘并进入项目目录
cd /Volumes/YOUR_USB/deploy_newmind

# 2. 运行安装脚本
./install.sh
```

安装脚本将自动完成以下步骤：
1. ✅ 系统预检查
2. ✅ 安装 Docker Desktop
3. ✅ 安装 Node.js 和 UV
4. ✅ 安装 LM Studio
5. ✅ 安装 NewChat
6. ✅ 复制 AI 模型
7. ✅ 加载 Docker 镜像
8. ✅ 配置 Python 环境
9. ✅ 启动所有服务
10. ✅ 验证安装

**预计安装时间**: 15-25 分钟（取决于硬盘速度）

---

## 详细安装步骤

### 步骤 1: 准备工作

```bash
# 复制项目到本地（推荐）
cp -R /Volumes/YOUR_USB/deploy_newmind ~/deploy_newmind
cd ~/deploy_newmind

# 或直接从移动硬盘运行（较慢）
cd /Volumes/YOUR_USB/deploy_newmind
```

### 步骤 2: 运行安装脚本

```bash
# 赋予执行权限（如果需要）
chmod +x install.sh

# 开始安装
./install.sh
```

### 步骤 3: 半自动安装模式

安装脚本采用**半自动模式**，每个大步骤都会询问：

```
╔════════════════════════════════════════════════════════════════╗
║  步骤 2/10: 安装Docker Desktop                                  ║
╚════════════════════════════════════════════════════════════════╝

执行此步骤? [Y/n/s(跳过)/a(中止)]
```

选项说明：
- **Y** (默认): 继续执行
- **n**: 跳过此步骤
- **s**: 跳过 (同 n)
- **a**: 中止安装

### 步骤 4: 安装过程示例

```
[✓] 预检查
    ├─ macOS版本: 14.1 (Sonoma) ✓
    ├─ CPU架构: arm64 (Apple Silicon) ✓
    ├─ 可用内存: 64GB ✓
    └─ 可用空间: 450GB ✓

[→] 步骤 2/10: 安装Docker Desktop
    [20%] ████░░░░░░░░░░░░░░░░ 挂载DMG...
    [40%] ████████░░░░░░░░░░░░ 复制到Applications...
    [60%] ████████████░░░░░░░░ 启动Docker...
    [80%] ████████████████░░░░ 等待Docker就绪...
    [✓] Docker Desktop 已安装并运行 (3.2s)

[→] 步骤 6/10: 复制AI模型 (135GB)
    [1/4] Qwen3-Coder-30B: ████████████████░░░░ 24.5GB/30GB (82%)
    预计剩余时间: 2m15s
```

### 步骤 5: 完成安装

安装完成后会显示：

```
╔════════════════════════════════════════════════════════════════╗
║              ✅ 安装流程已完成！                               ║
╚════════════════════════════════════════════════════════════════╝

服务访问地址:
  📊 管理控制台:     http://localhost:8000
  🔍 Elasticsearch:  http://localhost:9200
  📈 Kibana:         http://localhost:5601
  🔄 NewFlow:        http://localhost:5677
  🤖 LM Studio:      http://localhost:1234

🔐 默认凭据:
   Elasticsearch/Kibana: elastic / changeme123
```

---

## 验证安装

### 自动验证

安装脚本会自动进行全面验证，包括：

- ✅ 系统组件（Docker, Node.js, UV）
- ✅ 应用程序（LM Studio, NewChat）
- ✅ Docker 服务（Elasticsearch, Kibana, NewFlow）
- ✅ 服务连通性测试

### 手动验证

```bash
# 1. 检查服务状态
bash scripts/check_services.sh

# 2. 访问 Dashboard
open http://localhost:8000

# 3. 验证 Elasticsearch
curl -u elastic:changeme123 http://localhost:9200/_cluster/health

# 4. 检查 Docker 容器
docker ps

# 5. 检查已安装的应用
ls -la /Applications/LM\ Studio.app
ls -la /Applications/NewChat.app

# 6. 检查 AI 模型
ls -la ~/.cache/lm-studio/models/
```

---

## 常见问题

### Q1: 安装失败如何恢复？

安装脚本支持**断点续传**：

```bash
# 直接重新运行即可从失败的步骤继续
./install.sh

# 系统会询问是否恢复之前的安装：
# 选择: [R(恢复)/F(全新安装)/A(中止)]
```

### Q2: 如何跳过某些步骤？

在每个步骤询问时选择 **s (跳过)**，例如：

- 跳过 AI 模型复制（可稍后手动下载）
- 跳过 Docker 镜像加载（将自动构建）

### Q3: 内存不足怎么办？

系统会警告但允许继续：

```
⚠️  系统内存: 16GB (推荐 >= 32GB)
⚠️  内存不足可能影响AI模型运行性能

是否继续? [Y/n]
```

建议：
- 关闭其他应用程序
- 只加载必需的AI模型
- 升级物理内存

### Q4: 磁盘空间不足？

```bash
# 检查磁盘空间
df -h

# 清理不必要的文件
# Docker 清理
docker system prune -a

# 可选：不安装所有AI模型（节省约100GB）
```

### Q5: Docker 启动失败？

```bash
# 手动启动 Docker Desktop
open -a Docker

# 等待就绪
while ! docker info > /dev/null 2>&1; do
    echo "等待 Docker 启动..."
    sleep 5
done

# 重新运行安装
./install.sh
```

---

## 故障排除

### 问题: 安装包缺失

**症状**: `❌ XXX 安装包不存在`

**解决方案**:
```bash
# 检查 installers 目录
ls -la installers/

# 确保包含以下文件:
# - Docker.dmg
# - LM-Studio-*.dmg
# - NewChat-*.dmg
# - *.tar (Docker镜像)
# - models/ (AI模型目录)
```

### 问题: DMG 挂载失败

**症状**: `❌ 无法找到挂载点`

**解决方案**:
```bash
# 1. 检查已挂载的卷
hdiutil info

# 2. 卸载所有相关卷
hdiutil detach /Volumes/Docker -force
hdiutil detach /Volumes/LM* -force

# 3. 重新运行安装
./install.sh
```

### 问题: Docker 容器启动失败

**症状**: `❌ Docker 服务启动失败`

**解决方案**:
```bash
# 1. 检查 Docker 状态
docker info

# 2. 查看容器日志
docker logs elasticsearch
docker logs kibana

# 3. 重新启动服务
docker-compose down
docker-compose up -d

# 4. 检查端口占用
lsof -i :9200
lsof -i :5601
```

### 问题: Python 依赖安装失败

**症状**: `❌ 依赖安装失败`

**解决方案**:
```bash
# 1. 手动创建虚拟环境
cd python_dashboard
python3 -m venv .venv
source .venv/bin/activate

# 2. 安装依赖
pip install -e .

# 3. 验证
python -c "import fastapi, uvicorn"
```

### 问题: 查看详细日志

```bash
# 安装日志
tail -f logs/install-*.log

# Dashboard 日志
tail -f python_dashboard/dashboard.log

# Docker 日志
docker-compose logs -f

# 特定容器日志
docker logs -f elasticsearch
```

---

## 手动安装指南

如果自动安装失败，可以手动执行各个步骤：

### 1. 安装 Docker Desktop

```bash
# 挂载 DMG
hdiutil attach installers/Docker.dmg

# 复制到 Applications
cp -R /Volumes/Docker/Docker.app /Applications/

# 卸载 DMG
hdiutil detach /Volumes/Docker

# 启动 Docker
open -a Docker
```

### 2. 安装 Node.js

```bash
# 如果有安装包
sudo installer -pkg installers/system/node-v20.18.1.pkg -target /

# 验证
node --version
npm --version
```

### 3. 安装 UV

```bash
# 在线安装
curl -LsSf https://astral.sh/uv/install.sh | sh

# 添加到 PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

### 4. 安装应用程序

```bash
# LM Studio
bash scripts/05_install_lmstudio.sh

# NewChat
bash scripts/05_install_newchat.sh
```

### 5. 复制 AI 模型

```bash
# 创建目录
mkdir -p ~/.cache/lm-studio/models

# 复制模型
cp -R installers/models/* ~/.cache/lm-studio/models/
```

### 6. 加载 Docker 镜像

```bash
# 加载所有镜像
for tar in installers/*.tar; do
    docker load -i "$tar"
done
```

### 7. 配置 Python 环境

```bash
cd python_dashboard

# 创建虚拟环境
uv venv
source .venv/bin/activate

# 安装依赖
uv pip install -e .
```

### 8. 启动服务

```bash
# 启动 Docker 服务
bash scripts/07_start_docker_services.sh

# 启动 Dashboard
cd python_dashboard
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
```

---

## 卸载说明

### 完整卸载

```bash
# 运行卸载脚本
bash scripts/uninstall.sh

# 选择完整卸载
选择: 1 (完全卸载)
确认: yes
```

### 保留数据卸载

```bash
# 运行卸载脚本
bash scripts/uninstall.sh

# 选择保留数据
选择: 2 (保留数据)
确认: yes
```

保留数据包括：
- Elasticsearch 数据
- NewFlow 数据
- AI 模型文件
- MCP 配置

### 手动清理

```bash
# 删除应用程序
rm -rf /Applications/LM\ Studio.app
rm -rf /Applications/NewChat.app

# 删除 Docker 资源
docker-compose down
docker system prune -a

# 删除 AI 模型
rm -rf ~/.cache/lm-studio/models/*

# 删除项目文件
rm -rf ~/deploy_newmind
```

---

## 后续操作

### 首次使用

1. **启动 LM Studio**
   ```bash
   open -a "LM Studio"
   ```
   - 进入 Settings > Developer
   - 安装 lms CLI 工具
   - 加载模型（已在 ~/.cache/lm-studio/models）

2. **启动 NewChat**
   ```bash
   open -a NewChat
   ```
   - 连接到 LM Studio (http://localhost:1234)
   - 配置 MCP 服务器

3. **访问 Dashboard**
   ```bash
   open http://localhost:8000
   ```
   - 管理 MCP 服务器
   - 监控系统状态
   - 查看日志

### 停止服务

```bash
# 停止所有服务
bash scripts/stop_all.sh
```

### 重新启动

```bash
# 后续启动使用 start_all.sh
bash scripts/start_all.sh
```

---

## 技术支持

### 日志位置

- 安装日志: `logs/install-*.log`
- Dashboard 日志: `python_dashboard/dashboard.log`
- Docker 日志: `docker-compose logs`

### 诊断命令

```bash
# 系统状态检查
bash scripts/check_services.sh

# 生成诊断报告
cat logs/installation-report-*.txt
```

### 联系方式

如有问题，请查看：
- 项目文档: `README.md`
- 常见问题: 本文档
- 详细日志: `logs/` 目录

---

**祝您使用愉快！** 🎉

