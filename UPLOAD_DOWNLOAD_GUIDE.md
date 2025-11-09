# 上传与下载指南

## 快速开始

### 1. 准备上传（压缩模型并生成清单）

```bash
bash scripts/prepare_upload.sh
```

这个脚本会：
- 压缩 `installers/models/` 下的4个AI模型为 `.tar.gz` 文件
- 生成所有文件的MD5校验和
- 创建 `upload_manifest.txt` 上传清单

### 2. 上传到服务器

```bash
bash scripts/upload_to_server.sh
```

这个脚本会：
- 批量上传所有文件到 `root@xiaopenges.tocharian.eu:/var/www/newmind-download`
- 自动跳过已上传且MD5匹配的文件
- 验证上传完整性
- 生成服务器端清单 `manifest.yaml`

### 3. 从服务器下载（新机器安装）

在新机器上运行：

```bash
bash scripts/01_prepare_installers.sh
```

这个脚本会：
- 自动下载缺失的安装包
- 询问是否下载AI模型（可选）
- 自动解压模型到 `installers/models/`

---

## 版本管理

更新组件版本：

```bash
bash scripts/update_version.sh --component newchat --version 1.0.2
```

支持的组件：`newchat`, `lmstudio`, `elasticsearch`, `kibana`, `logstash`, `newflow`

---

## 服务器信息

- **服务器**: `root@xiaopenges.tocharian.eu`
- **路径**: `/var/www/newmind-download`
- **下载URL**: `https://xiaopenges.tocharian.eu/download/`
- **清单URL**: `https://xiaopenges.tocharian.eu/download/manifest.yaml`

---

## 配置文件

所有下载源配置在 `config.yaml` 的 `download_sources` 部分，包括：
- 文件路径
- 文件大小
- MD5校验
- 是否必需

修改配置后，重新运行 `prepare_upload.sh` 和 `upload_to_server.sh` 即可。

