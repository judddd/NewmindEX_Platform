# NewmindEx AI Platform - Mac M芯片部署方案

<div align="center">

![NewmindEx AI](https://img.shields.io/badge/NewmindEx-AI%20Platform-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-macOS%20ARM64-blue?style=for-the-badge)

**企业级AI工作流自动化解决方案**

[快速开始](#快速开始) • [功能特性](#功能特性) • [架构说明](#架构说明) • [故障排查](#故障排查)

</div>

---

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [功能特性](#功能特性)
- [架构说明](#架构说明)
- [模块化安装](#模块化安装)
- [API文档](#api文档)
- [故障排查](#故障排查)
- [License](#license)

---

## 💻 系统要求

- **操作系统**: macOS 12+ (Apple Silicon M系列芯片)
- **内存**: 建议 ≥100GB (ES集群93GB + 其他服务)
- **磁盘空间**: 建议 ≥100GB
- **依赖软件**:
  - Docker Desktop for Mac (支持M芯片)
  - Node.js 18+
  - Python 3.11+
  - uv (Python包管理器)

---

## 🚀 快速开始

### 方式一：一键安装（推荐）

```bash
# 克隆项目
git clone https://github.com/TocharianOU/mac_product.git
cd mac_product

# 一键启动所有服务
bash scripts/start_all.sh
```

等待约5-10分钟，所有服务将自动启动完成。

### 方式二：分步安装

```bash
# 1. 仅安装配置（不启动服务）
bash scripts/setup.sh

# 2. 启动Docker服务
bash scripts/07_start_docker_services.sh

# 3. 激活ES试用许可
bash scripts/08_activate_trial_license.sh

# 4. 配置LM Studio
bash scripts/09_download_lm_model.sh

# 5. 配置ES Connector
bash scripts/10_configure_es_connector.sh

# 6. 启动Dashboard
cd python_dashboard
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 访问服务

| 服务 | 地址 | 凭据 |
|------|------|------|
| **管理控制台** | http://localhost:8000 | - |
| **Elasticsearch** | http://localhost:9200 | elastic / changeme123 |
| **Kibana** | http://localhost:5601 | elastic / changeme123 |
| **NewFlow** | http://localhost:5678 | - |
| **LM Studio** | http://localhost:1234 | - |

---

## ✨ 功能特性

### 🔍 Elasticsearch集群
- **3节点集群**：高可用性，每节点31GB内存
- **ML功能**：原生支持机器学习和异常检测
- **审计日志**：完整的安全审计记录
- **企业试用许可**：自动激活30天企业功能

### 📊 Kibana可视化
- **自定义品牌**：支持Logo和主题定制
- **NewmindEx AI主题**：预配置企业级UI
- **ML Connector**：集成本地Qwen大模型

### 🔄 NewFlow工作流
- **3个预置工作流**：
  - ES安全报警智能调查
  - 模型产生测试CSV
  - 聊天Agent
- **一键导入**：通过Dashboard快速部署

### 🤖 LM Studio本地大模型
- **Qwen3-Coder-30B**：MLX版本，M芯片优化
- **本地推理**：无需云服务，数据安全
- **OpenAI兼容API**：标准接口，易于集成

### 🔌 MCP服务器管理平台
- **统一管理**：Web界面管理所有MCP实例
- **3种MCP服务器**：
  - Elasticsearch MCP Server
  - Kibana MCP Server
  - NewFlow MCP Server
- **动态创建**：按需创建MCP实例连接不同环境
- **NewMindChat集成**：一键导出配置文件

---

## 🏗️ 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                  NewmindEx AI Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Elasticsearch│  │   Kibana     │  │  Logstash    │      │
│  │  (3 Nodes)   │  │              │  │              │      │
│  │  9200-9202   │  │    5601      │  │    5044      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           ▲                 ▲                                │
│           │                 │                                │
│  ┌────────┴─────────────────┴────────────────┐             │
│  │       Management Dashboard (Python)        │             │
│  │              Port 8000                      │             │
│  └────────────────┬────────────────────────────┘             │
│                   │                                          │
│  ┌────────────────┼───────────────────┐                     │
│  │  MCP Manager   │   LM Studio       │   NewFlow          │
│  │  (3001-3100)   │   (1234)          │   (5678)           │
│  └────────────────┴───────────────────┴────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  NewMindChat    │
                  │  (MCP Client)   │
                  └─────────────────┘
```

### 核心组件

1. **Docker Services**: ES/Kibana/Logstash/NewFlow
2. **LM Studio**: 本地大模型推理服务
3. **Python Dashboard**: 统一管理控制台
4. **MCP Servers**: 提供AI工具调用接口

---

## 🔧 模块化安装

所有安装步骤都已模块化，可以单独执行：

| 脚本 | 功能 | 说明 |
|------|------|------|
| `00_check_dependencies.sh` | 依赖检查 | 检查系统要求和端口占用 |
| `01_prepare_installers.sh` | 准备安装包 | 下载/加载必要文件 |
| `02_setup_directories.sh` | 目录结构 | 创建所有必要目录 |
| `03_create_branding.sh` | 品牌资源 | 生成Kibana Logo |
| `04_build_mcp_servers.sh` | MCP构建 | 编译所有MCP服务器 |
| `05_install_lmstudio.sh` | LM Studio | 安装到Applications |
| `06_init_python_project.sh` | Python初始化 | uv环境配置 |
| `07_start_docker_services.sh` | Docker启动 | 启动ELK+NewFlow |
| `08_activate_trial_license.sh` | 许可激活 | 激活ES企业试用 |
| `09_download_lm_model.sh` | 模型下载 | 下载Qwen模型 |
| `10_configure_es_connector.sh` | Connector | 配置ES-LM连接 |

### 自定义安装流程

```bash
# 例如：只想重新构建MCP服务器
bash scripts/04_build_mcp_servers.sh

# 或者单独启动ES集群
bash scripts/07_start_docker_services.sh
```

---

## 📚 API文档

Dashboard提供完整的REST API，访问 http://localhost:8000/docs 查看Swagger文档。

### 主要API端点

```bash
# 系统状态
GET /api/status

# ES管理
GET /api/es/health
GET /api/es/nodes
GET /api/es/ml
GET /api/es/license

# MCP管理
GET    /api/mcp/instances
POST   /api/mcp/instances
DELETE /api/mcp/instances/{id}
POST   /api/mcp/instances/{id}/start
POST   /api/mcp/instances/{id}/stop

# NewFlow工作流
GET  /api/newflow/workflows
POST /api/newflow/import

# LM Studio
GET  /api/lmstudio/status
POST /api/lmstudio/download
POST /api/lmstudio/start
```

---

## 🔨 故障排查

### 1. ES集群启动失败

**症状**: 容器反复重启

**解决方案**:
```bash
# 检查内存限制
docker stats

# 查看日志
docker logs es01

# 确保有足够内存（建议100GB+）
```

### 2. MCP服务器无法启动

**症状**: 启动失败或端口被占用

**解决方案**:
```bash
# 检查MCP构建状态
bash scripts/04_build_mcp_servers.sh

# 查看日志
tail -f python_dashboard/mcp_logs/mcp-*.log

# 检查端口占用
lsof -i :3001
```

### 3. LM Studio CLI不可用

**症状**: `lms: command not found`

**解决方案**:
1. 打开LM Studio.app
2. Settings > Developer
3. 点击 "Install CLI Tools"
4. 重启终端

### 4. Docker网络问题

**症状**: 容器间无法通信

**解决方案**:
```bash
# 重启Docker网络
docker-compose down
docker-compose up -d

# 检查网络
docker network inspect mac_product_elastic
```

### 5. 权限问题

**症状**: 无法写入数据目录

**解决方案**:
```bash
# 设置目录权限
chmod -R 777 elasticsearch/node*
chmod +x scripts/*.sh
```

---

## 🛑 停止服务

```bash
# 停止所有服务
bash scripts/stop_all.sh

# 或单独停止Docker服务
docker-compose down
```

---

## 📝 环境变量配置

编辑 `.env` 文件自定义配置：

```env
# Elasticsearch
ES_VERSION=8.17.3
ES_MEM=31g
ELASTIC_PASSWORD=changeme123

# 服务端口
ES_PORT_1=9200
KIBANA_PORT=5601
NEWFLOW_PORT=5678
LMSTUDIO_PORT=1234
DASHBOARD_PORT=8000

# LM Studio
LM_MODEL=qwen/qwen3-coder-30b
LM_VARIANT=mlx
```

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 License

MIT License

---

## 🔗 相关链接

- [Elasticsearch文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [LM Studio](https://lmstudio.ai/)
- [NewMind AI](https://newmindtech.cn)

---

<div align="center">

**Made with ❤️ by TocharianOU**

[GitHub](https://github.com/TocharianOU/mac_product) • [Issues](https://github.com/TocharianOU/mac_product/issues)

</div>

