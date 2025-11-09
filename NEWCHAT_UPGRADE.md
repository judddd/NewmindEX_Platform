# NewChat 升级指南

本文档记录了从 NewmindChat 到 NewChat 的重命名和升级功能的实现。

## 📋 更改摘要

### 1. 应用名称统一
- **旧名称**: NewmindChat / newmindchat
- **新名称**: NewChat / newchat
- **版本**: 从 1.0.0 开始（可升级到 1.0.1+）

### 2. 文件和变量重命名

#### 安装包名称变更
- **旧**: `NewmindChat-electron-0.0.1-mac-arm64.dmg`
- **新**: `NewChat-1.0.0-mac-arm64.dmg` (版本号可变)

#### Docker镜像名称变更
- **旧**: `newmindchat-docs:1.0`
- **新**: `newchat-docs:1.0`

#### 环境变量重命名
- **旧**: `NEWMINDCHAT_DOCS_PORT`
- **新**: `NEWCHAT_DOCS_PORT`
- **旧**: `NEWMINDCHAT_DMG_URL`
- **新**: `NEWCHAT_DMG_URL`

### 3. 修改的文件列表

#### 脚本文件
1. **`scripts/01_prepare_installers.sh`**
   - 更新 NewChat DMG 下载链接和文件名
   - 更新 NewChat Docs 镜像名称
   - 支持自动版本检测

2. **`scripts/05_install_lmstudio.sh`**
   - 添加覆盖安装（升级）功能
   - 自动检测版本号
   - 停止旧进程后再升级
   - 彩色输出和进度提示

3. **`scripts/05_install_newchat.sh`** (新建)
   - NewChat 专用安装/升级脚本
   - 自动覆盖旧版本
   - 版本检测和显示
   - 进程管理（停止旧进程）
   - 智能挂载点查找

4. **`scripts/07_start_docker_services.sh`**
   - 更新 Docker 容器名称: `newmindchat-docs` → `newchat-docs`
   - 更新环境变量引用
   - 更新日志输出

5. **`scripts/11_init_default_mcp_instances.sh`**
   - 更新配置示例文本

#### 配置文件
1. **`copy.enva`**
   - `NEWMINDCHAT_DOCS_PORT` → `NEWCHAT_DOCS_PORT`
   - `NEWMINDCHAT_DMG_URL` → `NEWCHAT_DMG_URL`

#### Python 后端
1. **`python_dashboard/main.py`**
   - 导入函数重命名: `generate_newmindchat_config` → `generate_newchat_config`
   - 变量重命名: `newmindchat_running` → `newchat_running`
   - API 端点重命名:
     - `/api/open-newmindchat` → `/api/open-newchat`
     - `/api/mcp/newmindchat-config` → `/api/mcp/newchat-config`
   - 状态键重命名: `newmindchat` → `newchat`
   - 应用启动命令: `open -a 'NewmindChat'` → `open -a 'NewChat'`

2. **`python_dashboard/mcp_templates.py`**
   - 函数重命名: `generate_newmindchat_config` → `generate_newchat_config`
   - 注释更新

#### 前端文件
1. **`python_dashboard/static/index.html`**
   - 状态检查: `status.newmindchat` → `status.newchat`
   - API 调用: `/api/open-newmindchat` → `/api/open-newchat`
   - 配置导出: `/api/mcp/newmindchat-config` → `/api/mcp/newchat-config`

## 🚀 升级功能特性

### 自动覆盖安装
两个安装脚本现在都支持自动覆盖安装（类似升级）：

1. **版本检测**
   - 自动从文件名提取版本号
   - 显示当前已安装版本（如果可读取）
   - 显示即将安装的版本

2. **进程管理**
   - 自动检测并停止运行中的旧版本进程
   - 等待进程完全退出后再继续

3. **文件管理**
   - 删除旧版本应用
   - 复制新版本应用
   - 保留用户配置和数据

4. **用户体验**
   - 彩色输出，易于阅读
   - 详细的进度提示
   - 版本信息对比
   - 升级建议

### 脚本使用

#### 安装/升级 NewChat
```bash
# 运行安装脚本（会自动检测并升级）
./scripts/05_install_newchat.sh
```

#### 安装/升级 LM Studio
```bash
# 运行安装脚本（会自动检测并升级）
./scripts/05_install_lmstudio.sh
```

## 📝 版本更新流程

当 NewChat 发布新版本时（例如从 1.0.0 → 1.0.1）：

### 1. 更新安装包
```bash
# 方法1: 自动下载（推荐）
./scripts/01_prepare_installers.sh

# 方法2: 手动下载
cd installers
curl -O https://xiaopenges.tocharian.eu/download/NewChat-1.0.1-mac-arm64.dmg
```

### 2. 更新脚本配置
编辑 `scripts/01_prepare_installers.sh`：
```bash
# 修改这两行
NEWCHAT_DMG="installers/NewChat-1.0.1-mac-arm64.dmg"  # 版本号从 1.0.0 改为 1.0.1
NEWCHAT_URL="${DOWNLOAD_BASE_URL}/NewChat-1.0.1-mac-arm64.dmg"
```

### 3. 执行升级
```bash
# 直接运行安装脚本，会自动覆盖旧版本
./scripts/05_install_newchat.sh
```

### 4. 验证升级
```bash
# 检查应用版本（macOS）
defaults read /Applications/NewChat.app/Contents/Info.plist CFBundleShortVersionString

# 或直接打开应用查看
open -a NewChat
```

## 🔄 自动化部署

在 CI/CD 或自动部署流程中：

```bash
#!/bin/bash

# 1. 准备最新的安装包
./scripts/01_prepare_installers.sh

# 2. 安装/升级应用（会自动覆盖）
./scripts/05_install_newchat.sh
./scripts/05_install_lmstudio.sh

# 3. 启动服务
./scripts/start_all.sh
```

## 📦 Docker镜像更新

如果 NewChat Docs 镜像也需要更新：

1. 更新镜像文件：`installers/newchat-docs-1.0.tar`
2. 脚本会自动加载新镜像
3. 启动服务时会使用新镜像

```bash
# 重新加载镜像
docker load -i installers/newchat-docs-1.0.tar

# 重启容器
docker stop newchat-docs
docker rm newchat-docs
docker run -d --name newchat-docs -p 8002:8002 newchat-docs:1.0
```

## 🎯 关键改进点

### 1. 命名一致性
- 所有地方统一使用 `NewChat` / `newchat`
- 移除了 `newmindchat` 相关的所有引用
- API 端点、变量名、文件名保持一致

### 2. 版本灵活性
- 不再硬编码版本号
- 支持自动检测文件名中的版本
- 升级时不需要修改多处代码

### 3. 用户友好
- 清晰的进度提示
- 彩色输出易于区分状态
- 自动处理进程和文件冲突
- 提供详细的版本信息

### 4. 可维护性
- 单一职责：每个安装包一个脚本
- 代码复用：共享的逻辑提取为函数
- 易于扩展：新版本只需修改很少的地方

## ⚠️ 注意事项

1. **备份数据**: 升级前建议备份用户配置和数据（通常在 `~/Library/Application Support/NewChat`）

2. **权限问题**: 安装脚本需要能够写入 `/Applications` 目录，可能需要 sudo

3. **进程检查**: 升级会自动停止运行中的应用，确保没有未保存的工作

4. **版本兼容**: 检查新版本的系统要求（macOS版本、架构等）

5. **回滚**: 如有问题，可以从备份恢复或重新安装旧版本

6. **SSL证书**: 下载脚本使用 `curl -k` 忽略SSL证书验证，适用于自签名证书或开发环境。生产环境建议配置有效的SSL证书

## 📚 相关文档

- [安装指南](INSTALLATION_GUIDE.md)
- [部署说明](DEPLOYMENT_NOTES.md)
- [快速开始](QUICK_START.md)
- [MCP配置](MCP_CONFIG_REFERENCE.md)

## 🔍 故障排查

### 问题1: 挂载点找不到
```bash
# 手动查看挂载点
hdiutil info | grep "/Volumes/"

# 手动卸载
hdiutil detach "/Volumes/NewChat" -force
```

### 问题2: 权限不足
```bash
# 使用 sudo 运行
sudo ./scripts/05_install_newchat.sh
```

### 问题3: 进程无法停止
```bash
# 强制终止进程
pkill -9 "NewChat"

# 然后重新运行安装脚本
./scripts/05_install_newchat.sh
```

### 问题4: 版本信息无法读取
```bash
# 手动检查应用信息
ls -la /Applications/NewChat.app
plutil -p /Applications/NewChat.app/Contents/Info.plist
```

