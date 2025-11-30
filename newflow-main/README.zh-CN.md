# NewFlow

[English](./README.md) | 简体中文 | [官方网站](https://newflow.ee)

**AI 优先的工作流自动化平台**

NewFlow 是 n8n 的社区驱动分支版本，增强了高级 AI 智能体编排、内置 MCP 运行环境和智能自动化能力。为需要强大的自托管工作流自动化和前沿 AI 功能的团队而构建。

## 📸 截图展示

### AI 智能体工作流
![AI 智能体工作流](./assets/Agent.png)

### NewFlow 工作流编辑器
![NewFlow 工作流编辑器](./assets/newflow-workflow.png)

## ✨ 核心特性

### 🤖 高级 AI 智能体编排
- 原生支持多个 LLM 提供商（OpenAI、Mistral、Perplexity、DeepSeek）
- 多智能体协作工作流
- 上下文感知决策
- 内置提示工程工具

### 🆓 免费 AI 代码生成
- **AI 驱动的节点开发** - 使用自然语言生成自定义节点
- 自动化工作流建议和优化
- 智能错误检测和解决
- 代码解释和文档生成

### 🔌 内置 MCP 运行环境
- 集成 MCP（模型上下文协议）服务器运行时
- 在工作流中直接运行 MCP 服务器，无需外部配置
- 预配置常用 AI 工具的 MCP 集成
- 简化 AI 智能体之间的上下文共享

### 📊 Elasticsearch 分析智能体
- 专门用于日志分析和调查的智能体
- 根因分析自动化
- 安全事件关联
- 性能监控和告警

### 🛠️ 可视化工作流构建器
- 直观的拖拽式界面
- 80+ 预构建集成节点
- 实时执行监控
- 自定义 JavaScript/Python 代码执行

### 🔒 企业级就绪
- 自托管部署（完全数据控制）
- Docker 和 Docker Compose 支持
- 队列模式处理高并发
- Webhook 和 REST API 支持

## 🚀 快速开始

### 使用 Docker（推荐）

```bash
docker run -d \
  --name newflow \
  -p 5678:5678 \
  -v ~/.newflow:/home/node/.newflow \
  ozlan/newflow:latest
```

在 `http://localhost:5678` 访问 NewFlow

### 使用 Docker Compose

```bash
# 克隆仓库
git clone https://github.com/TocharianOU/newflow.git
cd newflow

# 使用 Docker Compose 启动
docker-compose up -d
```

### 手动安装

**环境要求：** Node.js 18+ 和 pnpm

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 启动 NewFlow
pnpm start
```

## 📖 核心应用场景

### AI 驱动的日志分析
Webhook → Elasticsearch 查询 → AI 智能体分析 → 根因报告 → Slack 通知

### 自动化安全调查
安全告警 → 多智能体调查 → 上下文收集 → 威胁评估 → 响应行动

### 智能数据管道
定时任务 → 数据提取 → AI 驱动转换 → 数据库存储 → 质量验证

### 代码生成工作流
自然语言输入 → AI 代码生成器 → 验证 → Git 提交 → 部署

## 🎯 为什么选择 NewFlow？

| 功能 | NewFlow | 标准 n8n |
|------|---------|----------|
| AI 智能体编排 | ✅ 增强版 | ⚠️ 基础版 |
| 免费 AI 代码生成 | ✅ 内置 | ❌ 不可用 |
| 内置 MCP 运行环境 | ✅ 已集成 | ⚠️ 需手动配置 |
| Elasticsearch 智能体 | ✅ 专业版 | ⚠️ 通用版 |
| 自托管 | ✅ 100% | ✅ 支持 |
| 开源 | ✅ 社区分支 | ✅ 支持 |

## 🛡️ 许可证

NewFlow 采用 **Sustainable Use License (SUL)（可持续使用许可证）** - 可免费用于内部业务、非商业用途和个人项目。所有 AI 功能和智能体能力均免费提供。

**主要说明：**
- ✅ 可用于自己的内部业务运营（任何规模的组织）
- ✅ 可修改和定制以满足需求
- ✅ 非商业和个人用途
- ❌ 不能将软件本身作为商业产品销售
- ❌ 不能作为付费 SaaS 服务分发

如需商业分发或企业支持，请联系社区维护者。

## 🤝 参与贡献

NewFlow 是一个社区驱动的项目。我们欢迎来自全球开发者的贡献：

- 通过 GitHub Issues 报告 Bug 和请求功能
- 提交 Pull Request 进行改进
- 分享你的自定义节点和工作流
- 参与讨论并帮助其他用户

## 🔗 资源

- **官方网站**：[https://newflow.ee](https://newflow.ee)
- **文档**：即将推出
- **工作流模板**：`/workflow_template` 目录
- **Docker 镜像**：在 Docker Hub 上可用
- **社区支持**：GitHub Discussions

##  致谢

NewFlow 基于优秀的 [n8n](https://github.com/n8n-io/n8n) 基础构建。我们保持与 n8n 工作流的完全兼容性，同时添加社区请求的 AI 和自动化增强功能。

---

**由 NewFlow 社区构建**

