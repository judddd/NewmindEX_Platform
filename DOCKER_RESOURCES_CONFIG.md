# Docker Desktop 资源配置指南

## 📋 概述

本项目提供了自动配置 Docker Desktop 资源限制的功能，可以在安装时或运行时调整 CPU、内存、磁盘等资源分配。

---

## 🎯 默认配置

| 资源类型 | 默认值 | 说明 |
|---------|-------|------|
| **内存** | 200 GB | Docker 可用内存 |
| **CPU** | 32 核 | Docker 可用 CPU 核心数 |
| **磁盘** | 512 GB | Docker 虚拟磁盘大小 |
| **Swap** | 8 GB | Docker Swap 大小 |

---

## 🔧 使用方法

### 方法 1：自动配置（安装时）

在运行 `install.sh` 时，Docker 安装脚本会**自动配置**资源限制。

配置文件读取优先级：
1. `.env` 文件（如果存在）
2. `env.copy` 文件的默认值

### 方法 2：手动配置（运行时）

#### 步骤 1：修改配置

编辑 `.env` 或 `env.copy` 文件：

```bash
# Docker Desktop 资源配置
DOCKER_MEMORY_GB=200          # Docker 可用内存 (GB)
DOCKER_CPUS=32                # Docker 可用 CPU 核心数
DOCKER_DISK_SIZE_GB=512       # Docker 虚拟磁盘大小 (GB)
DOCKER_SWAP_SIZE_GB=8         # Docker Swap 大小 (GB)
```

#### 步骤 2：运行配置脚本

```bash
./scripts/configure_docker_resources.sh
```

脚本会：
1. 读取配置
2. 备份现有 Docker 配置
3. 更新资源限制
4. 提示是否重启 Docker（需要重启才能生效）

---

## 📂 配置文件位置

### Docker 配置文件

```
~/Library/Group Containers/group.com.docker/settings.json
```

**备份文件自动保存为**：
```
~/Library/Group Containers/group.com.docker/settings.json.backup.YYYYMMDD_HHMMSS
```

### 环境变量配置

- **模板文件**: `env.copy`
- **实际配置**: `.env`（优先使用，不提交到 Git）

---

## 🎨 配置示例

### 示例 1：开发环境（小配置）

```bash
DOCKER_MEMORY_GB=16           # 16GB 内存
DOCKER_CPUS=8                 # 8 核 CPU
DOCKER_DISK_SIZE_GB=100       # 100GB 磁盘
DOCKER_SWAP_SIZE_GB=4         # 4GB Swap
```

### 示例 2：生产环境（大配置）

```bash
DOCKER_MEMORY_GB=200          # 200GB 内存
DOCKER_CPUS=32                # 32 核 CPU
DOCKER_DISK_SIZE_GB=512       # 512GB 磁盘
DOCKER_SWAP_SIZE_GB=8         # 8GB Swap
```

### 示例 3：自定义配置

```bash
DOCKER_MEMORY_GB=128          # 128GB 内存
DOCKER_CPUS=24                # 24 核 CPU
DOCKER_DISK_SIZE_GB=256       # 256GB 磁盘
DOCKER_SWAP_SIZE_GB=16        # 16GB Swap
```

---

## ⚡ 快速修改

### 修改内存大小

```bash
# 修改为 128GB
echo "DOCKER_MEMORY_GB=128" >> .env
./scripts/configure_docker_resources.sh
```

### 修改 CPU 核心数

```bash
# 修改为 16 核
echo "DOCKER_CPUS=16" >> .env
./scripts/configure_docker_resources.sh
```

---

## 🔍 验证配置

### 查看当前配置

```bash
# 查看 Docker 配置文件
cat ~/Library/Group\ Containers/group.com.docker/settings.json | python3 -m json.tool
```

### 检查实际资源使用

```bash
# 查看 Docker 信息
docker info | grep -E "CPUs|Total Memory"
```

### 查看容器资源使用

```bash
# 实时监控
docker stats
```

---

## 📊 配置流程图

```
安装流程：
  install.sh
    ↓
  03_install_docker.sh
    ↓
  安装 Docker Desktop
    ↓
  启动 Docker
    ↓
  configure_docker_resources.sh （自动）
    ↓
  读取 .env 配置
    ↓
  更新 settings.json
    ↓
  重启 Docker
    ↓
  配置生效 ✅

手动配置流程：
  编辑 .env
    ↓
  运行 configure_docker_resources.sh
    ↓
  确认重启 Docker
    ↓
  配置生效 ✅
```

---

## ⚠️ 注意事项

### 1. 内存配置建议

- **最小推荐**: 16GB（开发环境）
- **生产推荐**: 根据 ES 内存需求 + 其他容器
  - ES 3 节点：`ES_MEM * 3`（例如 31g * 3 = 93GB）
  - 其他容器：预留 20-30GB
  - **总计**: 120-150GB 以上

### 2. CPU 配置建议

- **最小推荐**: 8 核
- **生产推荐**: 16-32 核
- 建议不超过物理 CPU 核心数的 80%

### 3. 磁盘配置建议

- **最小推荐**: 100GB
- **生产推荐**: 512GB 以上
- 考虑因素：
  - Elasticsearch 数据
  - Newflow 工作流数据
  - Docker 镜像和容器

### 4. 配置生效

- ⚠️ **修改配置后必须重启 Docker 才能生效！**
- 重启会短暂中断所有容器服务

---

## 🐛 故障排查

### 问题 1：配置未生效

**症状**: 修改配置后 Docker 资源未变化

**解决**:
```bash
# 1. 确认 Docker 已重启
docker info

# 2. 检查配置文件
cat ~/Library/Group\ Containers/group.com.docker/settings.json

# 3. 手动重启 Docker
osascript -e 'quit app "Docker"'
open -a Docker
```

### 问题 2：Docker 启动失败

**症状**: 配置后 Docker 无法启动

**原因**: 资源配置超出系统可用资源

**解决**:
```bash
# 1. 恢复备份配置
cd ~/Library/Group\ Containers/group.com.docker/
ls -lt settings.json.backup.*  # 查找最新备份
cp settings.json.backup.YYYYMMDD_HHMMSS settings.json

# 2. 重启 Docker
open -a Docker

# 3. 调整为更小的配置值
```

### 问题 3：找不到配置文件

**症状**: `settings.json` 不存在

**原因**: Docker Desktop 未完成初始化

**解决**:
```bash
# 1. 启动 Docker Desktop
open -a Docker

# 2. 等待完成初始化向导

# 3. 重新运行配置脚本
./scripts/configure_docker_resources.sh
```

---

## 📖 相关文档

- [Docker Desktop 官方文档](https://docs.docker.com/desktop/settings/mac/)
- [Elasticsearch 内存配置](elasticsearch/config/elasticsearch.yml)
- [环境变量配置指南](env.copy)

---

## 🔗 相关文件

| 文件 | 作用 |
|------|------|
| `scripts/configure_docker_resources.sh` | Docker 资源配置脚本 |
| `scripts/install_steps/03_install_docker.sh` | Docker 安装脚本（自动调用配置） |
| `env.copy` | 环境变量模板（含默认值） |
| `.env` | 实际环境变量（优先使用） |

---

## 💡 最佳实践

1. **首次安装**: 使用默认配置（200GB / 32核）
2. **开发环境**: 根据需要调整为更小配置
3. **生产环境**: 确保资源充足，预留 20% 余量
4. **定期监控**: 使用 `docker stats` 查看实际使用情况
5. **备份配置**: 配置脚本会自动备份，保留至少 3 个历史版本

---

**更新日期**: 2025-11-18  
**维护者**: NewMind Platform Team

