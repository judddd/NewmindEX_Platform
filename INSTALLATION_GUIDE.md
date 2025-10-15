# NewMind AI Platform - 安装指南

## 📦 项目已完成的配置

恭喜！您的NewMind AI Platform已经配置完成。以下是已完成的所有模块：

### ✅ 基础设施配置

#### 1. Docker Compose配置
- [x] Elasticsearch 3节点集群（每节点31GB内存）
- [x] Kibana with自定义品牌
- [x] Logstash with监控配置
- [x] NewFlow工作流引擎

#### 2. 配置文件
- [x] `.env` - 环境变量配置
- [x] `.gitignore` - Git忽略规则
- [x] `elasticsearch/config/elasticsearch.yml` - ES配置（含审计）
- [x] `kibana/config/kibana.yml` - Kibana配置（含品牌）
- [x] `logstash/config/logstash.yml` - Logstash配置
- [x] `logstash/pipeline/logstash.conf` - 数据管道

#### 3. 品牌资源
- [x] `elasticsearch/branding/kibana_logo.svg` - Logo
- [x] `elasticsearch/branding/kibana_mark.svg` - 图标
- [x] `elasticsearch/branding/kibana_banner.svg` - 横幅

### ✅ 模块化安装脚本

所有脚本都已创建并设置了执行权限：

| 脚本文件 | 功能 | 状态 |
|---------|------|------|
| `00_check_dependencies.sh` | 检查系统依赖 | ✅ |
| `01_prepare_installers.sh` | 准备安装包 | ✅ |
| `02_setup_directories.sh` | 创建目录结构 | ✅ |
| `03_create_branding.sh` | 生成品牌资源 | ✅ |
| `04_build_mcp_servers.sh` | 构建MCP服务器 | ✅ |
| `05_install_lmstudio.sh` | 安装LM Studio | ✅ |
| `06_init_python_project.sh` | 初始化Python项目 | ✅ |
| `07_start_docker_services.sh` | 启动Docker服务 | ✅ |
| `08_activate_trial_license.sh` | 激活ES试用许可 | ✅ |
| `09_download_lm_model.sh` | 下载LM模型 | ✅ |
| `10_configure_es_connector.sh` | 配置ES Connector | ✅ |
| `setup.sh` | 快速安装（不启动） | ✅ |
| `start_all.sh` | 一键启动所有服务 | ✅ |
| `stop_all.sh` | 停止所有服务 | ✅ |

### ✅ Python Dashboard

#### 核心模块
- [x] `database.py` - SQLite数据库管理
- [x] `mcp_manager.py` - MCP进程管理
- [x] `es_monitor.py` - Elasticsearch监控
- [x] `lmstudio_manager.py` - LM Studio管理
- [x] `newflow_importer.py` - NewFlow工作流导入
- [x] `mcp_templates.py` - MCP模板预设

#### FastAPI应用
- [x] `main.py` - 主应用（含所有API端点）
- [x] `pyproject.toml` - 项目配置
- [x] `static/index.html` - Web界面

#### API端点（共30+）
- [x] 系统状态API
- [x] Elasticsearch管理API
- [x] LM Studio管理API
- [x] NewFlow工作流API
- [x] MCP服务编排API
- [x] WebSocket实时更新

### ✅ Git配置
- [x] 清理了MCP子项目的Git配置
- [x] 初始化主项目Git仓库
- [x] 配置remote为https://github.com/TocharianOU/mac_product.git

### ✅ 文档
- [x] `README.md` - 完整的项目文档
- [x] `INSTALLATION_GUIDE.md` - 本文档

---

## 🚀 现在可以开始使用了！

### 第一步：运行依赖检查

```bash
cd /Users/ablatazmat/Downloads/deploy_newmind
bash scripts/00_check_dependencies.sh
```

如果所有检查通过，继续下一步。

### 第二步：选择安装方式

#### 方式A：一键安装（推荐）

```bash
bash scripts/start_all.sh
```

这会自动执行：
1. ✅ 检查依赖
2. ✅ 准备安装包
3. ✅ 创建目录
4. ✅ 生成品牌资源
5. ✅ 构建MCP服务器
6. ✅ 安装LM Studio
7. ✅ 初始化Python项目
8. ✅ 启动Docker服务
9. ✅ 激活ES许可
10. ✅ 配置LM Studio
11. ✅ 配置ES Connector
12. ✅ 启动Dashboard

**预计时间**: 10-15分钟（取决于网络速度和模型下载）

#### 方式B：分步安装

如果需要更多控制，可以单独运行每个脚本：

```bash
# 1. 准备环境
bash scripts/setup.sh

# 2. 启动服务
bash scripts/07_start_docker_services.sh
bash scripts/08_activate_trial_license.sh
bash scripts/09_download_lm_model.sh
bash scripts/10_configure_es_connector.sh

# 3. 启动Dashboard
cd python_dashboard
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 第三步：访问服务

启动完成后，访问以下地址：

| 服务 | URL | 凭据 |
|------|-----|------|
| 🎛️ **管理控制台** | http://localhost:8000 | 无需登录 |
| 🔍 **Elasticsearch** | http://localhost:9200 | elastic / changeme123 |
| 📊 **Kibana** | http://localhost:5601 | elastic / changeme123 |
| 🔄 **NewFlow** | http://localhost:5677 | 无需登录 |
| 🤖 **LM Studio** | http://localhost:1234 | 无需登录 |

### 第四步：验证安装

在管理控制台（http://localhost:8000）中检查：

1. ✅ 所有服务状态显示为"运行中"
2. ✅ ES集群健康状态为"green"
3. ✅ MCP服务器列表为空（需要手动创建）
4. ✅ LM Studio显示模型已加载

---

## 🔧 常见操作

### 创建MCP实例

通过API创建（或通过Dashboard的"创建MCP实例"按钮）：

```bash
# 创建本地ES MCP实例
curl -X POST http://localhost:8000/api/mcp/instances \
  -H "Content-Type: application/json" \
  -d '{
    "name": "本地ES集群",
    "type": "elasticsearch",
    "config": {
      "es_url": "http://localhost:9200",
      "es_username": "elastic",
      "es_password": "changeme123"
    }
  }'
```

### 导入NewFlow工作流

```bash
# 方法1：通过Dashboard点击"一键导入工作流"按钮

# 方法2：通过API
curl -X POST http://localhost:8000/api/newflow/import
```

### 导出NewMindChat配置

```bash
# 获取所有运行中的MCP配置
curl http://localhost:8000/api/mcp/newmindchat-config > newmindchat-config.json

# 然后将此文件导入到NewMindChat应用中
```

### 停止所有服务

```bash
bash scripts/stop_all.sh
```

---

## 📝 下一步建议

1. **自定义品牌**: 替换 `elasticsearch/branding/` 下的SVG文件为您的Logo
2. **配置MCP实例**: 在Dashboard中创建连接到不同环境的MCP实例
3. **导入工作流**: 一键导入预置的3个workflow
4. **安装NewMindChat**: 使用 `installers/NewmindChat-electron-0.0.1-mac-arm64.dmg`
5. **探索API**: 访问 http://localhost:8000/docs 查看完整API文档

---

## 🐛 遇到问题？

查看 [README.md](README.md) 的故障排查章节，或：

```bash
# 查看Docker日志
docker logs es01
docker logs kibana

# 查看MCP日志
tail -f python_dashboard/mcp_logs/*.log

# 查看Dashboard日志
tail -f python_dashboard/dashboard.log

# 查看LM Studio日志
tail -f lmstudio.log
```

---

## 🎉 完成！

您现在拥有一个完整的企业级AI工作流自动化平台！

- ✅ 3节点Elasticsearch集群（含ML功能）
- ✅ Kibana可视化平台（自定义品牌）
- ✅ NewFlow工作流引擎
- ✅ 本地Qwen3大模型（30B MLX版本）
- ✅ MCP服务器管理平台
- ✅ Python Web管理控制台

**祝您使用愉快！** 🚀

