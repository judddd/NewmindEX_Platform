# NewMind AI Platform — 部署手册

> macOS Apple Silicon (M 系列)

---

## 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | macOS 12+，Apple M 系列 |
| 内存 | ≥ 64 GB（ES 集群默认 3×31 GB，内存少时在 `.env` 改 `ES_MEM=4g`） |
| 磁盘 | ≥ 100 GB 可用 |
| 前置软件 | Docker Desktop、Node.js v22+、Python 3.11、uv、pnpm |

---

## 方式一：脚本安装（推荐）

```bash
# 1. 安装平台（ES / Kibana / MinIO / MCP / Dashboard）
bash install.sh

# 2. 克隆并安装 NewRAG / NewFlow
bash scripts/clone_modules.sh
bash scripts/install_steps/12_install_newrag.sh
bash scripts/install_steps/13_install_newflow.sh

# 3. 启动所有服务
bash scripts/start_all.sh
```

---

## 方式二：手动安装

### 平台基础服务

```bash
# 复制环境变量配置
cp env.copy .env

# 启动 Docker 服务（ES / Kibana / Logstash / MinIO）
docker compose up -d

# 等待 ES 就绪
until curl -s http://localhost:9200 > /dev/null; do sleep 5; done

# 激活 ES 试用许可
curl -X POST "http://localhost:9200/_license/start_trial?acknowledge=true" \
  -u elastic:changeme123

# 导入 MCP Docker 镜像
docker load < installers/newmind-mcp-elasticsearch-1.0.0.tar
docker load < installers/newmind-mcp-kibana-1.0.0.tar
docker load < installers/newmind-mcp-newflow-1.0.0.tar

# 初始化并启动 Dashboard
cd python_dashboard
uv sync
nohup uv run uvicorn main:app --host 0.0.0.0 --port 8000 > dashboard.log 2>&1 &
cd ..
```

### NewRAG

```bash
git clone https://github.com/TocharianOU/newrag.git newrag-main
cd newrag-main

uv venv .venv --python 3.11 && uv sync          # Python 依赖
cd frontend && npm install && cd ..              # 前端依赖
cd newrag-mcp && npm install && npm run build && cd ..  # MCP

cp config.example.yaml config.yaml
# 确认 config.yaml：backend port=8080，frontend_port=3000，mcp port=3001

# ⚠️ 必须先建目录，再跑初始化
mkdir -p data logs uploads web/static/processed_docs
uv run scripts/init_auth_system.py

nohup uv run dev.py > ../python_dashboard/newrag.log 2>&1 &
cd ..
```

### NewFlow

```bash
git clone https://github.com/TocharianOU/newflow.git newflow-main
cd newflow-main

pnpm install && pnpm build

mkdir -p data
export PORT=5678 N8N_SECURE_COOKIE=false N8N_USER_FOLDER="$(pwd)/data"
nohup pnpm start > ../python_dashboard/newflow.log 2>&1 &
cd ..
```

---

## 服务地址与凭据

| 服务 | 地址 | 用户名 | 密码 |
|------|------|--------|------|
| Dashboard | http://localhost:8000 | — | — |
| **NewRAG** | http://localhost:3000 | `admin` | `Admin123!@#` |
| **NewFlow** | http://localhost:5678 | `admin@localhost.com` | `admin123A` |
| **Elasticsearch** | http://localhost:9200 | `elastic` | `changeme123` |
| **Kibana** | http://localhost:5601 | `elastic` | `changeme123` |
| **MinIO 控制台** | http://localhost:9001 | `minioadmin` | `minioadmin123` |
| LM Studio API | http://localhost:1234 | — | — |
| MCP — ES | http://localhost:3005/mcp | — | — |
| MCP — Kibana | http://localhost:3002/mcp | — | — |
| MCP — NewFlow | http://localhost:3003/mcp | — | — |
| MCP — NewRAG | http://localhost:3001/mcp | — | — |

> ⚠️ 首次登录 NewRAG / NewFlow 后请立即修改密码。

---

## 日常操作

```bash
bash scripts/start_all.sh   # 启动
bash scripts/stop_all.sh    # 停止

tail -f python_dashboard/dashboard.log  # Dashboard 日志
tail -f python_dashboard/newrag.log     # NewRAG 日志
tail -f python_dashboard/newflow.log    # NewFlow 日志
```

---

## 重置 / 重装

```bash
# 停止所有进程
lsof -ti :8000,:8080,:3000,:5678 | xargs kill -9 2>/dev/null || true
docker compose down

# 清除模块（保留平台数据）
rm -rf newrag-main newflow-main python_dashboard/.venv
rm -f python_dashboard/*.pid python_dashboard/*.log python_dashboard/mcp_instances.json

# 重新安装
bash scripts/clone_modules.sh
bash scripts/install_steps/12_install_newrag.sh
bash scripts/install_steps/13_install_newflow.sh
bash scripts/start_all.sh
```

---

## 常见问题

**NewRAG 登录报 "Invalid username or password"**
```bash
sqlite3 newrag-main/data/documents.db "SELECT COUNT(*) FROM users;"
# 若为 0：
cd newrag-main && mkdir -p data && uv run scripts/init_auth_system.py
```

**端口被占用**
```bash
lsof -i :8080 -P -n   # 找到 PID
kill <PID>
```

**ES 内存不足**
```bash
# 编辑 .env，将 ES_MEM=31g 改为 ES_MEM=4g
docker compose up -d
```

**NewFlow pnpm 问题**
```bash
corepack enable && corepack prepare pnpm@latest --activate
```
