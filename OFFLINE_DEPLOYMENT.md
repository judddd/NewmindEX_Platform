# 离线环境部署说明

## 🎯 设计理念

本项目专为**完全离线环境**设计，所有配置和数据都包含在Git仓库中，确保：

- ✅ 克隆后立即可用（开箱即用）
- ✅ 无需额外配置用户和API Key
- ✅ 工作流预配置完成
- ✅ 适合企业内网部署

## 📦 包含的数据

### newflow_data/ 目录结构

```
newflow_data/
├── database.sqlite          ✅ 同步到Git（包含预配置用户和API Key）
├── database.sqlite-shm      ✅ 同步到Git（SQLite共享内存）
├── database.sqlite-wal      ✅ 同步到Git（SQLite预写日志）
├── config                   ✅ 同步到Git（NewFlow配置）
├── nodes/                   ✅ 同步到Git（自定义节点）
├── *.log                    ❌ 不同步（运行时日志）
├── n8nEventLog-*.log        ❌ 不同步（事件日志）
├── crash.journal            ❌ 不同步（崩溃日志）
├── execution_data/          ❌ 不同步（执行数据）
└── logs/                    ❌ 不同步（日志目录）
```

### 预配置内容

**1. NewFlow用户**
- 用户名：（已预设）
- API Key：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（已配置在.env）

**2. 工作流**
- ES安全报警智能调查
- 模型产生测试csv
- 聊天Agent

**3. 环境变量**
- `.env`文件包含所有必要配置
- NewFlow API Key已预设
- 所有端口配置完成

## 🔒 安全说明

### 为什么可以同步敏感数据？

**离线环境特性**：
- ✅ 仓库不会暴露到公网
- ✅ 部署在企业内网或隔离环境
- ✅ Git服务器在内网（如GitLab私有部署）
- ✅ 无互联网访问风险

**预设凭据用途**：
- 仅用于初始化和测试
- 生产环境建议修改（可选）
- 所有服务在localhost运行

### 建议的安全实践

**1. 内网Git服务器**
```bash
# 使用企业内部GitLab/Gitea
git remote set-url origin http://internal-git.company.com/mac_product.git
```

**2. 访问控制**
- 限制Git仓库访问权限
- 仅授权运维人员访问
- 定期审计访问日志

**3. 生产环境加固（可选）**
```bash
# 修改NewFlow管理员密码
# 在NewFlow界面: Settings > Users > 修改密码

# 重新生成API Key
# 在NewFlow界面: Settings > API > 创建新Key
# 更新.env文件中的NEWFLOW_API_KEY
```

## 🌐 Docker网络配置

### 关键配置：host.docker.internal

**问题**：NewFlow运行在Docker容器中，需要访问宿主机的LM Studio

**解决方案**：使用`host.docker.internal`域名

#### docker-compose.yml配置

```yaml
newflow:
  image: newflow:1.0.12
  container_name: newflow
  extra_hosts:
    - "host.docker.internal:host-gateway"  # ✅ 关键配置
```

#### 工作流中的配置

所有需要访问宿主机服务的地方，使用：

| 服务 | ❌ 错误 | ✅ 正确 |
|------|---------|---------|
| LM Studio | `http://localhost:1234` | `http://host.docker.internal:1234` |
| LM Studio | `http://127.0.0.1:1234` | `http://host.docker.internal:1234` |
| Dashboard | `http://localhost:8000` | `http://host.docker.internal:8000` |

#### 为什么不能用localhost？

```
Docker容器视角：
┌─────────────────────────┐
│  NewFlow容器            │
│  localhost = 容器自己   │  ❌ 无法访问宿主机
│  127.0.0.1 = 容器自己   │  ❌ 无法访问宿主机
│  host.docker.internal  │  ✅ 指向宿主机
└─────────────────────────┘
```

## 📋 部署检查清单

### 首次部署

- [ ] 克隆仓库到本地
- [ ] 确认`newflow_data/`目录存在
- [ ] 确认`installers/`包含3个安装包
- [ ] 确认`.env`文件存在
- [ ] 运行`bash scripts/start_all.sh`

### 验证配置

```bash
# 1. 检查NewFlow数据库
ls -lh newflow_data/database.sqlite

# 2. 检查API Key配置
grep NEWFLOW_API_KEY .env

# 3. 测试NewFlow API
curl -H "X-N8N-API-KEY: $NEWFLOW_API_KEY" \
  http://localhost:5677/api/v1/workflows

# 4. 检查工作流中的URL
grep -r "host.docker.internal" workflow_conf/
```

## 🔄 更新工作流

如果您修改了工作流并想同步到Git：

```bash
# 1. 导出工作流（通过NewFlow界面或API）
# 工作流会自动保存到database.sqlite

# 2. 提交更改
git add newflow_data/database.sqlite*
git commit -m "更新工作流配置"
git push

# 3. 其他机器同步
git pull
docker-compose restart newflow
```

## 🚨 故障排查

### 问题1：NewFlow无法连接LM Studio

**症状**：工作流执行失败，提示连接超时

**检查**：
```bash
# 1. 确认LM Studio在运行
curl http://localhost:1234/v1/models

# 2. 进入NewFlow容器测试
docker exec -it newflow sh
wget -qO- http://host.docker.internal:1234/v1/models

# 3. 检查docker-compose.yml
grep "extra_hosts" docker-compose.yml
```

**解决**：
- 确认`extra_hosts`配置存在
- 重启NewFlow容器：`docker-compose restart newflow`
- 检查工作流中的URL是否使用`host.docker.internal`

### 问题2：API Key无效

**症状**：Dashboard无法导入工作流，返回401错误

**检查**：
```bash
# 1. 查看.env中的API Key
cat .env | grep NEWFLOW_API_KEY

# 2. 在NewFlow中验证
# 访问 http://localhost:5677
# Settings > API > 查看API Key列表
```

**解决**：
- 在NewFlow界面重新生成API Key
- 更新`.env`文件中的`NEWFLOW_API_KEY`
- 重启Dashboard：`bash scripts/start_all.sh`

### 问题3：数据库文件冲突

**症状**：Git pull时提示database.sqlite冲突

**解决**：
```bash
# 方案A：保留本地更改
git stash
git pull
git stash pop
# 手动解决冲突

# 方案B：使用远程版本
git checkout --theirs newflow_data/database.sqlite
git add newflow_data/database.sqlite
git commit -m "使用远程数据库"

# 方案C：备份后重新开始
cp -r newflow_data newflow_data.backup
git checkout newflow_data/database.sqlite
```

## 📚 相关文档

- [NewFlow连接LM Studio配置](NEWFLOW_LMSTUDIO_CONFIG.md)
- [Docker网络配置指南](NETWORK_GUIDE.md)
- [MCP配置参考](MCP_CONFIG_REFERENCE.md)
- [快速开始](QUICK_START.md)

## 🎓 最佳实践

### 1. 版本控制策略

**开发分支**：
```bash
# 创建开发分支测试新配置
git checkout -b dev
# 修改配置...
git commit -m "测试新工作流"

# 验证无误后合并到main
git checkout main
git merge dev
```

**标签管理**：
```bash
# 为稳定版本打标签
git tag -a v1.0.0 -m "初始稳定版本"
git push origin v1.0.0
```

### 2. 多环境部署

**场景**：开发、测试、生产环境

```bash
# 开发环境
git clone http://internal-git/mac_product.git dev-env
cd dev-env
# 修改.env中的端口避免冲突

# 生产环境
git clone http://internal-git/mac_product.git prod-env
cd prod-env
# 使用默认配置
```

### 3. 备份策略

```bash
# 定期备份NewFlow数据
cp newflow_data/database.sqlite backups/database-$(date +%Y%m%d).sqlite

# 备份整个配置
tar czf mac_product-backup-$(date +%Y%m%d).tar.gz \
  newflow_data/ \
  .env \
  workflow_conf/
```

## 💡 提示

- ✅ 本项目设计用于**完全离线环境**
- ✅ 所有敏感数据仅在内网流转
- ✅ 开箱即用，无需额外配置
- ✅ 适合企业内网、隔离网络、专用环境
- ⚠️ 不建议将此仓库推送到公网Git服务（如GitHub公开仓库）

