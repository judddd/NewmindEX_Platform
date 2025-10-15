# 🚀 快速开始

## 全新部署 3 步走

假设您刚从GitHub克隆了项目，并手动下载了安装包：

```bash
# 步骤1: 进入项目目录
cd deploy_newmind  # 或 mac_product

# 步骤2: 确认安装包已就位
ls installers/
# 应该看到:
# - LM-Studio-0.3.30-1-arm64.dmg
# - NewmindChat-electron-0.0.1-mac-arm64.dmg
# - newflow-1.0.12.tar

# 步骤3: 一键部署
bash scripts/start_all.sh
```

**等待 10-15 分钟，完成！**

---

## 清理旧环境重新部署

如果您之前已经部署过，想要全新开始：

```bash
# 完全清理
bash scripts/clean_all.sh

# 重新部署
bash scripts/start_all.sh
```

---

## 访问服务

部署完成后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 🎛️ **Dashboard** | http://localhost:8000 | **主控制台** |
| 🔍 Elasticsearch | http://localhost:9200 | 搜索引擎 |
| 📊 Kibana | http://localhost:5601 | 数据可视化 |
| 🔄 NewFlow | http://localhost:5677 | 工作流引擎 |
| 🤖 LM Studio | http://localhost:1234 | AI模型 |

**推荐**: 先访问 Dashboard (http://localhost:8000) 查看所有服务状态！

---

## 常用命令

```bash
# 检查所有服务状态
bash scripts/check_services.sh

# 停止所有服务
bash scripts/stop_all.sh

# 重启服务
bash scripts/stop_all.sh && bash scripts/start_all.sh

# 完全清理并重新部署
bash scripts/clean_all.sh && bash scripts/start_all.sh
```

---

## 遇到问题？

### 端口被占用
```bash
bash scripts/clean_all.sh
bash scripts/start_all.sh
```

### Elasticsearch启动失败
修改 `.env` 中的内存配置：
```bash
ES_MEM=2g  # 降低内存使用
```

### 查看详细日志
```bash
# Docker服务日志
docker logs es01
docker logs kibana
docker logs newflow

# Python Dashboard日志
tail -f python_dashboard/dashboard.log

# LM Studio日志
tail -f lmstudio_server.log
```

---

## 默认凭据

- **Elasticsearch/Kibana**: `elastic` / `changeme123`
- **NewFlow**: 使用 `.env` 中的 API Key

---

## 更多信息

- 详细部署指南: [DEPLOY_FROM_SCRATCH.md](DEPLOY_FROM_SCRATCH.md)
- 完整说明: [README.md](README.md)
- 安装指南: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

**🎉 开始使用您的 NewMind AI Platform！**
