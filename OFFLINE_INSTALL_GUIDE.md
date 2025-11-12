# 🚀 NewMind AI Platform - 离线安装指南

## 📦 安装包说明

本离线安装包包含了在全新Mac上完整部署NewMind AI Platform所需的所有组件。

### 📊 包含内容

| 组件 | 大小 | 说明 |
|------|------|------|
| **系统依赖** | | |
| Docker Desktop | 543MB | 容器运行环境 |
| Node.js 20.18.1 | 80MB | JavaScript运行时 |
| UV | 18MB | Python包管理器 |
| **应用程序** | | |
| LM Studio | 508MB | 本地大语言模型运行环境 |
| NewChat | 304MB | AI聊天客户端 |
| **Docker镜像** | | |
| NewFlow | 256MB | 工作流引擎 |
| NewFlow Docs | 84MB | API文档 |
| NewChat Docs | 96MB | 应用文档 |
| MCP Elasticsearch | 81MB | ES MCP服务器 |
| MCP Kibana | 90MB | Kibana MCP服务器 |
| MCP NewFlow | 93MB | NewFlow MCP服务器 |
| **Python依赖** | | |
| Python Wheels | 22MB | 所有Python依赖包 |
| **AI模型** | | |
| 模型文件 | 需手动添加 | 大语言模型文件 |

**总计（不含模型）**: ~2.5GB
**总计（含模型20GB）**: ~22-32GB

---

## 🎯 一键安装（推荐）

### 前提条件
- macOS 11+ (Big Sur或更高)
- Apple Silicon (M1/M2/M3) 或 Intel Mac
- 至少 100GB 可用磁盘空间
- 至少 16GB 内存（推荐32GB+）

### 步骤1: 准备

```bash
# 1. 将整个deploy_newmind文件夹复制到Mac
#    可以使用U盘、网络共享、AirDrop等方式

# 2. 打开终端
#    应用程序 > 实用工具 > 终端

# 3. 进入项目目录
cd /path/to/deploy_newmind

# 例如，如果复制到桌面：
# cd ~/Desktop/deploy_newmind
```

### 步骤2: 设置权限

```bash
chmod +x scripts/*.sh
```

### 步骤3: 运行一键安装

```bash
./scripts/start_all.sh
```

脚本会自动执行以下操作：
1. ✅ 检测并安装系统依赖（Docker、Node.js、UV等）
2. ✅ 准备安装包和Docker镜像
3. ✅ 安装LM Studio和NewChat
4. ✅ 配置LM Studio模型（如果已准备）
5. ✅ 启动所有Docker服务
6. ✅ 初始化MCP服务器实例
7. ✅ 启动管理控制台

**预计时间**: 10-20分钟

---

## 🛠️ 手动安装（高级）

如果一键安装遇到问题，可以分步手动安装。

### 1. 安装系统依赖

```bash
./scripts/00_install_dependencies.sh
```

**安装内容**:
- Docker Desktop（需要手动启动）
- Node.js 20.18.1
- UV（Python包管理器）
- Python 3（macOS通常自带）

**重要**: Docker Desktop安装后需要：
1. 打开应用程序 `/Applications/Docker.app`
2. 完成初始化向导（可能需要输入密码）
3. 等待Docker完全启动（菜单栏显示Docker图标）

### 2. 准备安装包

```bash
./scripts/01_prepare_installers.sh
```

验证所有必需文件，加载Docker镜像。

### 3. 安装应用程序

```bash
# 安装LM Studio
./scripts/05_install_lmstudio.sh

# 安装NewChat
./scripts/05_install_newchat.sh
```

### 4. 启动服务

```bash
./scripts/07_start_docker_services.sh
```

### 5. 初始化MCP实例

```bash
./scripts/11_init_default_mcp_instances.sh
```

### 6. 启动Dashboard

```bash
cd python_dashboard
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🤖 配置LM Studio模型

### 方法1: 从现有Mac复制

如果你已经在另一台Mac上使用LM Studio：

```bash
# 1. 在源Mac上找到模型位置
ls -lh ~/.cache/lm-studio/models/

# 2. 复制整个模型文件夹到U盘
cp -R ~/.cache/lm-studio/models/qwen-* /Volumes/YOUR_USB/deploy_newmind/installers/models/

# 3. 在目标Mac上，模型会自动从installers/models复制到LM Studio
```

### 方法2: 手动下载模型

**推荐模型（代码场景）**:
- **Qwen2.5-Coder-32B-Instruct** (4-bit量化, ~20GB)
  - 下载: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF
  - 文件: `qwen2.5-coder-32b-instruct-q4_k_m.gguf`

**下载和配置**:
```bash
# 1. 下载GGUF文件到installers/models/
mkdir -p installers/models/qwen
cd installers/models/qwen

# 使用浏览器或curl下载
curl -L -o qwen2.5-coder-32b-instruct-q4_k_m.gguf \
  "https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF/resolve/main/qwen2.5-coder-32b-instruct-q4_k_m.gguf"

# 2. 运行安装脚本会自动复制到LM Studio
```

### 模型存储位置

**安装后的模型位置**:
```
~/.cache/lm-studio/models/
├── qwen/
│   └── qwen2.5-coder-32b-instruct-q4_k_m.gguf
└── ...其他模型
```

详细说明请参考: `installers/models/README.md`

---

## ✅ 验证安装

### 1. 检查服务状态

```bash
./scripts/check_services.sh
```

### 2. 访问服务

打开浏览器访问以下地址：

| 服务 | URL | 凭据 |
|------|-----|------|
| **管理控制台** | http://localhost:8000 | - |
| **Elasticsearch** | http://localhost:9200 | elastic / changeme123 |
| **Kibana** | http://localhost:5601 | elastic / changeme123 |
| **NewFlow** | http://localhost:5677 | - |
| **LM Studio** | http://localhost:1234 | - |

### 3. 测试MCP服务

```bash
# 测试Elasticsearch MCP
curl http://localhost:3001/health

# 测试Kibana MCP
curl http://localhost:3002/health

# 测试NewFlow MCP
curl http://localhost:3003/health
```

---

## 🔧 故障排查

### 问题1: Docker未启动

**症状**: `Docker未运行` 或 `Cannot connect to Docker daemon`

**解决**:
```bash
# 手动启动Docker
open -a Docker

# 等待完全启动（菜单栏出现Docker图标）
# 然后重新运行安装脚本
```

### 问题2: 端口被占用

**症状**: `端口 XXXX 已被占用`

**解决**:
```bash
# 查看占用端口的进程
lsof -i :端口号

# 停止所有服务
./scripts/stop_all.sh

# 重新启动
./scripts/start_all.sh
```

### 问题3: Node.js版本过低

**症状**: `Node.js版本过低，需要18+`

**解决**:
```bash
# 安装包中的Node.js是20.18.1
# 如果检测到旧版本，手动安装
sudo installer -pkg installers/node-v20.18.1-arm64.pkg -target /

# 重新打开终端验证
node --version
```

### 问题4: UV安装失败

**症状**: `uv: command not found`

**解决**:
```bash
# 方法1: 运行安装脚本
bash installers/uv-installer.sh

# 方法2: 手动安装二进制
tar -xzf installers/uv-aarch64-apple-darwin.tar.gz -C /tmp
mkdir -p ~/.local/bin
mv /tmp/uv ~/.local/bin/
chmod +x ~/.local/bin/uv

# 添加到PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 问题5: Python依赖安装失败

**症状**: `pip install失败` 或 `No module named xxx`

**解决**:
```bash
cd python_dashboard

# 使用离线wheel包安装
uv pip install --no-index --find-links=../installers/python_deps/wheels -r pyproject.toml

# 或使用系统pip
python3 -m pip install --no-index --find-links=../installers/python_deps/wheels -r ../installers/python_deps/requirements.txt
```

### 问题6: Docker镜像加载失败

**症状**: `Error loading image` 或 `No such file`

**解决**:
```bash
# 手动加载镜像
cd installers

docker load -i newflow-1.0.0-1.tar
docker load -i newmind-mcp-elasticsearch-1.0.0.tar
docker load -i newmind-mcp-kibana-1.0.0.tar
docker load -i newmind-mcp-newflow-1.0.0.tar
docker load -i newflow-docs-1.0.tar
docker load -i newchat-docs-1.0.1.tar

# 验证
docker images
```

### 问题7: LM Studio模型未识别

**症状**: LM Studio中看不到模型

**解决**:
```bash
# 1. 检查模型位置
ls -lh ~/.cache/lm-studio/models/

# 2. 手动复制模型
cp -R installers/models/* ~/.cache/lm-studio/models/

# 3. 重启LM Studio
killall "LM Studio"
open -a "LM Studio"
```

---

## 📱 后续操作

### 启动服务

```bash
./scripts/start_all.sh
```

### 停止服务

```bash
./scripts/stop_all.sh
```

### 查看日志

```bash
# Dashboard日志
tail -f python_dashboard/dashboard.log

# Docker日志
docker logs -f elasticsearch-node1
docker logs -f kibana
docker logs -f newflow
```

### 访问管理界面

打开浏览器访问: http://localhost:8000

---

## 💾 磁盘空间要求

| 组件 | 最小 | 推荐 |
|------|------|------|
| 系统和应用 | 10GB | 20GB |
| Docker镜像 | 5GB | 10GB |
| Elasticsearch数据 | 20GB | 100GB |
| LM模型 | 20GB | 50GB |
| 工作空间 | 10GB | 20GB |
| **总计** | **65GB** | **200GB** |

---

## 🔒 安全建议

1. **修改默认密码**: 首次安装后立即修改Elasticsearch密码
   ```bash
   # 在Kibana Dev Tools中执行
   POST /_security/user/elastic/_password
   {
     "password": "your_new_strong_password"
   }
   ```

2. **配置防火墙**: 生产环境中限制端口访问
3. **启用HTTPS**: 为Web服务配置SSL证书
4. **定期备份**: 备份Elasticsearch数据和配置文件

---

## 📚 相关文档

- [快速开始](QUICK_START.md)
- [安装指南](INSTALLATION_GUIDE.md)
- [MCP配置](MCP_CONFIG_REFERENCE.md)
- [网络配置](NETWORK_GUIDE.md)
- [NewChat升级](NEWCHAT_UPGRADE.md)

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志文件
2. 运行诊断脚本: `./scripts/check_services.sh`
3. 参考故障排查部分
4. 查看项目文档

---

## 📝 版本信息

- **平台版本**: NewMind AI Platform v1.0
- **Docker Desktop**: 4.x+
- **Node.js**: 20.18.1
- **Python**: 3.11+
- **Elasticsearch**: 8.x
- **Kibana**: 8.x

**最后更新**: 2025-11-07

