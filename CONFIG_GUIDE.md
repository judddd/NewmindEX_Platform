# 配置管理指南

## 🎯 核心原则

**只需修改 2 个文件，所有脚本自动生效！**

### 1. `.env` - 管理 Docker 相关配置

修改这个文件来控制所有 Docker 容器的版本、端口、内存等：

```bash
# 版本配置
ES_VERSION=8.17.3              # Elasticsearch 版本
KIBANA_VERSION=8.17.3          # Kibana 版本
LOGSTASH_VERSION=8.17.3        # Logstash 版本
NEWFLOW_VERSION=1.0.3          # Newflow 版本
NEWCHAT_DOCS_VERSION=1.0.1     # NewChat Docs 版本

# ES 配置
ES_MEM=31g                     # ES 内存（生产：31g，开发：2g）
ES_PORT_1=9200                 # ES 端口
ES_SECURITY_ENABLED=false      # 安全开关

# Newflow 配置
NEWFLOW_PORT=5677
NEWFLOW_API_KEY=xxx...

# LM Studio 配置
LMSTUDIO_PORT=1234
LM_MODEL=qwen/qwen3-coder-30b
```

### 2. `config.yaml` - 管理外部应用配置

修改这个文件来控制 Mac 应用（.dmg）和下载地址：

```yaml
# 应用程序
applications:
  newchat:
    file: "installers/NewChat-1.0.4-mac-arm64.dmg"    # ← 改这里
    version: "1.0.4"                                   # ← 改这里
    install_path: "/Applications/NewChat.app"
  
  lmstudio:
    file: "installers/LM-Studio-0.3.30-1-arm64.dmg"   # ← 改这里
    version: "0.3.30-1"                                # ← 改这里
    install_path: "/Applications/LM Studio.app"

# 下载地址
download_sources:
  base_url: "https://xiaopenges.tocharian.eu/download"  # ← 改这里
```

---

## 📋 配置分类

| 配置类型 | 配置文件 | 示例 |
|---------|---------|------|
| **Docker 版本** | `.env` | `ES_VERSION=8.17.3` |
| **Docker 端口** | `.env` | `NEWFLOW_PORT=5677` |
| **Docker 内存** | `.env` | `ES_MEM=31g` |
| **Mac 应用版本** | `config.yaml` | `NewChat-1.0.4-mac-arm64.dmg` |
| **下载地址** | `config.yaml` | `base_url: "https://..."` |

---

## 🔧 使用示例

### 示例 1：升级 NewChat 到 1.0.5

**步骤：**
1. 把新的 dmg 文件放到 `installers/` 目录
2. 修改 `config.yaml`：

```yaml
applications:
  newchat:
    file: "installers/NewChat-1.0.5-mac-arm64.dmg"
    version: "1.0.5"
```

3. 重新运行安装脚本即可！

**不需要修改任何其他脚本！**

---

### 示例 2：升级 Elasticsearch 到 8.18.0

**步骤：**
1. 准备新版本的 tar 文件
2. 修改 `.env`：

```bash
ES_VERSION=8.18.0
KIBANA_VERSION=8.18.0
LOGSTASH_VERSION=8.18.0
```

3. 重启服务：

```bash
docker-compose down
docker-compose up -d
```

**不需要修改任何脚本！**

---

### 示例 3：修改 ES 内存

**步骤：**
1. 修改 `.env`：

```bash
ES_MEM=2g    # 从 31g 改成 2g
```

2. 重启 ES：

```bash
docker-compose restart es01 es02 es03
```

**不需要修改任何脚本！**

---

### 示例 4：更换下载服务器

**步骤：**
1. 修改 `config.yaml`：

```yaml
download_sources:
  base_url: "https://your-new-server.com/download"
```

2. 重新运行下载脚本即可！

**不需要修改任何脚本！**

---

## 🤖 自动化原理

所有脚本通过 `scripts/lib/config_reader.sh` 读取配置：

```bash
# 读取 .env 配置
ES_VERSION=$(get_es_version)        # 从 .env 读取
NEWFLOW_PORT=$(echo $NEWFLOW_PORT)  # 从 .env 读取

# 读取 config.yaml 配置
NEWCHAT_FILE=$(get_newchat_file)    # 从 config.yaml 读取
DOWNLOAD_URL=$(get_download_base_url) # 从 config.yaml 读取
```

---

## ✅ 验证配置

运行验证脚本检查配置一致性：

```bash
./scripts/validate_versions.sh
```

输出示例：
```
🔍 检查版本一致性...

📦 Elasticsearch 版本检查
   .env:             8.17.3
   docker-compose:   默认值 8.17.3
   config.yaml:      8.17.3
   ✅ 版本一致

✅ 所有版本号一致！
```

---

## 📝 总结

### ✅ 只需修改两个文件：
- **`.env`** - Docker 配置
- **`config.yaml`** - 外部应用配置

### ❌ 不再需要修改：
- ~~`scripts/*.sh`~~ - 脚本自动读取配置
- ~~`docker-compose.yml`~~ - 使用环境变量
- ~~其他任何脚本~~

### 🎯 修改后直接生效：
1. 修改配置文件
2. 运行对应的脚本或重启服务
3. 完成！

---

**简单、清晰、不会出错！** 🎉

