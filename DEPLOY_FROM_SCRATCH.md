# 🚀 全新部署指南

## 前提条件

假设您已经：
1. ✅ 从GitHub克隆了项目：`git clone https://github.com/TocharianOU/mac_product.git`
2. ✅ 手动下载了安装包到 `installers/` 目录：
   - `LM-Studio-0.3.30-1-arm64.dmg`
   - `NewmindChat-electron-0.0.1-mac-arm64.dmg`
   - `newflow-1.0.12.tar`

## 一键部署

```bash
cd mac_product  # 或 deploy_newmind

# 方式1: 完全自动部署（推荐）
bash scripts/start_all.sh

# 方式2: 如果需要先清理旧环境
bash scripts/clean_all.sh
bash scripts/start_all.sh
```

就这么简单！等待10-15分钟，所有服务将自动启动。

---

## 部署过程详解

`bash scripts/start_all.sh` 会自动执行以下步骤：

### 步骤 1/11: 检查系统依赖 ✅
检查：
- Docker Desktop
- Node.js 18+
- uv (Python包管理器)
- Python 3.11+
- 系统内存（建议16GB+）
- 磁盘空间（建议100GB+）

### 步骤 2/11: 准备安装包 ✅
- 检查 `installers/` 目录中的文件
- 加载NewFlow Docker镜像
- 自动移动文件到正确位置

### 步骤 3/11: 创建目录结构 ✅
创建所有必要的项目目录

### 步骤 4/11: 创建品牌资源 ✅
生成Kibana自定义品牌文件（Logo、图标）

### 步骤 5/11: 构建MCP服务器 ✅
自动构建3个MCP服务器：
- Elasticsearch MCP
- Kibana MCP
- NewFlow MCP

### 步骤 6/11: 安装LM Studio ✅
检查并安装LM Studio应用

### 步骤 7/11: 初始化Python项目 ✅
- 创建Python虚拟环境
- 安装所有依赖

### 步骤 8/11: 启动Docker服务 ✅
启动：
- Elasticsearch (单节点，2GB内存)
- Kibana
- Logstash
- NewFlow

### 步骤 9/11: 激活ES试用许可 ✅
自动激活30天企业试用许可

### 步骤 10/11: 配置LM Studio ✅
下载并启动Qwen3-Coder-30B模型

### 步骤 11/11: 配置ES Connector ✅
配置Elasticsearch连接到LM Studio

### 最终步骤: 启动Dashboard ✅
启动Python Web管理控制台

---

## 部署完成后

### 访问服务

| 服务 | URL | 说明 |
|------|-----|------|
| 🎛️ Dashboard | http://localhost:8000 | Web管理界面 |
| 🔍 Elasticsearch | http://localhost:9200 | REST API |
| 📊 Kibana | http://localhost:5601 | 可视化平台 |
| 🔄 NewFlow | http://localhost:5677 | 工作流引擎 |
| 🤖 LM Studio | http://localhost:1234 | 大模型API |

### 验证部署

```bash
# 检查所有服务状态
bash scripts/check_services.sh

# 应该看到：
# ✅ Elasticsearch - green状态
# ✅ Kibana - 运行中
# ✅ Logstash - 运行中
# ✅ NewFlow - 运行中
# ✅ LM Studio - 运行中
# ✅ Dashboard - 运行中
```

### 开始使用

1. **访问Dashboard**: http://localhost:8000
2. **一键导入工作流**: 点击"导入工作流"按钮
3. **创建MCP实例**: 为ES/Kibana创建MCP服务器
4. **安装NewMindChat**: 
   ```bash
   open installers/NewmindChat-electron-0.0.1-mac-arm64.dmg
   ```

---

## 常见问题

### Q: 端口被占用怎么办？
A: 运行清理脚本：
```bash
bash scripts/clean_all.sh
bash scripts/start_all.sh
```

### Q: Elasticsearch启动失败？
A: 检查内存配置，修改 `.env` 中的 `ES_MEM`：
```bash
# 如果内存不足，降低配置
ES_MEM=2g  # 默认值，适合开发环境
```

### Q: NewFlow需要重新注册吗？
A: 不需要！`newflow_data/` 目录包含您的用户数据和API Key，会自动加载。

### Q: 如何完全重置？
A: 
```bash
bash scripts/clean_all.sh
rm -rf newflow_data  # 删除NewFlow用户数据
bash scripts/start_all.sh
```

---

## 停止服务

```bash
bash scripts/stop_all.sh
```

---

## 目录结构

```
mac_product/
├── installers/              ✅ 安装包（手动下载）
│   ├── LM-Studio-0.3.30-1-arm64.dmg
│   ├── NewmindChat-electron-0.0.1-mac-arm64.dmg
│   └── newflow-1.0.12.tar
├── newflow_data/            ✅ NewFlow数据（自动生成）
├── workflow_conf/           ✅ 工作流配置（3个JSON）
├── mcp_tool/                ✅ MCP服务器源码
├── scripts/                 ✅ 部署脚本
│   ├── start_all.sh         🚀 一键启动
│   ├── stop_all.sh          🛑 停止服务
│   ├── clean_all.sh         🧹 清理环境
│   └── check_services.sh    ✅ 检查状态
├── docker-compose.yml       ✅ Docker配置
├── .env                     ✅ 环境变量
└── README.md                ✅ 项目文档
```

---

## 技术规格

### Elasticsearch
- 版本: 8.17.3
- 模式: 单节点（开发环境）
- 内存: 2GB (可调整)
- ML功能: ✅ 启用
- 试用许可: ✅ 30天自动激活

### NewFlow
- 版本: 1.0.12
- 数据库: SQLite
- 数据持久化: ✅ 本地目录

### LM Studio
- 版本: 0.3.30-1
- 模型: qwen/qwen3-coder-30b
- 变体: MLX (Apple Silicon优化)

### Python Dashboard
- 框架: FastAPI + Uvicorn
- 包管理: uv
- Python: 3.11+

---

## 下一步

1. 部署完成后，访问 http://localhost:8000
2. 查看所有服务状态
3. 一键导入工作流
4. 创建MCP实例
5. 安装NewMindChat
6. 开始使用！

**🎉 享受您的NewMind AI Platform！**
