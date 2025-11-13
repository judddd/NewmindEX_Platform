# Newflow 自动初始化配置指南

## 概述

本项目实现了 **Newflow 智能初始化管理系统**，可以自动处理首次安装、重启和重新初始化的场景，避免数据库冲突错误。

## 问题背景

### 原始问题

当 `NEWFLOW_AUTO_SETUP_ENABLED=true` 时，Newflow 每次启动都会尝试运行 auto-setup：
- 创建默认管理员用户
- 生成 API Key

**机器重启后的问题**：
- 数据库已存在用户和 API Key
- auto-setup 尝试重复创建
- 触发数据库唯一性约束错误：`SQLITE_CONSTRAINT: UNIQUE constraint failed: user_api_keys.userId, user_api_keys.label`
- Newflow 陷入**崩溃重启循环**

### 错误表现

```
QueryFailedError: SQLITE_CONSTRAINT: UNIQUE constraint failed: user_api_keys.userId, user_api_keys.label
Exiting due to an error.
Last session crashed
```

## 解决方案

### 智能初始化系统

项目现在包含两个自动化脚本：

#### 1. `scripts/check_newflow_init.sh` - 启动前检查

**运行时机**：Docker 容器启动前

**功能**：
- 检测数据库是否已初始化
- 检查初始化标记文件 `newflow_data/.initialized`
- 自动配置 `NEWFLOW_AUTO_SETUP_ENABLED`

**场景处理**：

| 场景 | 数据库状态 | 标记文件 | 操作 |
|------|-----------|---------|------|
| 首次安装 | 不存在 | 不存在 | ✅ 启用 AUTO_SETUP |
| 已初始化 | 存在 | 存在 | ✅ 禁用 AUTO_SETUP |
| 清空重装 | 不存在 | 不存在 | ✅ 启用 AUTO_SETUP |
| 异常状态 | 存在 | 不存在 | ✅ 禁用 AUTO_SETUP + 创建标记 |

#### 2. `scripts/post_newflow_init.sh` - 启动后检查

**运行时机**：Docker 容器启动后（后台运行）

**功能**：
- 等待 Newflow 初始化完成（检查数据库 + API 可用性）
- 自动禁用 `NEWFLOW_AUTO_SETUP_ENABLED`
- 创建初始化标记文件
- 显示初始化信息

**超时配置**：
- 最大等待时间：300 秒（5 分钟）
- 检查间隔：5 秒

## 工作流程

### 首次安装

```
1. 用户运行: ./install.sh 或 ./scripts/start_all.sh
   ↓
2. check_newflow_init.sh 检测：数据库不存在
   ↓
3. 设置: NEWFLOW_AUTO_SETUP_ENABLED=true
   ↓
4. Docker 启动 Newflow 容器
   ↓
5. Newflow 运行 auto-setup：
   - 创建管理员 admin@localhost.com
   - 生成 API Key
   ↓
6. post_newflow_init.sh 检测初始化完成
   ↓
7. 自动操作：
   - NEWFLOW_AUTO_SETUP_ENABLED=false
   - 创建 newflow_data/.initialized
   ↓
8. ✅ 完成！下次重启不会冲突
```

### 机器重启

```
1. 用户运行: ./scripts/start_all.sh
   ↓
2. check_newflow_init.sh 检测：
   - 数据库已存在 ✓
   - .initialized 标记存在 ✓
   ↓
3. 确认: NEWFLOW_AUTO_SETUP_ENABLED=false
   ↓
4. Docker 启动 Newflow 容器
   ↓
5. Newflow 跳过 auto-setup
   ↓
6. ✅ 直接启动，无冲突！
```

### 清空重装

```
1. 停止 Newflow:
   docker stop newflow
   
2. 删除数据：
   rm newflow_data/database.sqlite*
   rm newflow_data/.initialized
   
3. 重启：
   ./scripts/start_all.sh
   
4. 系统检测到清空，重新初始化
   ↓
5. ✅ 按首次安装流程进行
```

## 文件说明

### 初始化标记文件

**位置**：`newflow_data/.initialized`

**作用**：
- 标记 Newflow 已完成首次初始化
- 防止重复运行 auto-setup
- 记录初始化时间和配置

**内容示例**：
```
# Newflow 初始化标记文件
# 此文件表示 Newflow 已完成首次初始化
# 创建时间: 2025-11-13T23:50:00+08:00
# 
# 初始化信息:
# - 用户已创建
# - API Key 已生成
# - AUTO_SETUP 已禁用
```

### 环境变量

**`.env` 文件关键配置**：

```bash
# Newflow 自动初始化配置
NEWFLOW_AUTO_SETUP_ENABLED=false  # 系统自动管理

# 首次初始化的管理员凭证
NEWFLOW_AUTO_SETUP_EMAIL=admin@localhost.com
NEWFLOW_AUTO_SETUP_PASSWORD=admin123A
```

⚠️ **注意**：不要手动修改 `NEWFLOW_AUTO_SETUP_ENABLED`，让系统自动管理。

## 手动操作（高级）

### 手动检查初始化状态

```bash
# 查看数据库用户
sqlite3 newflow_data/database.sqlite "SELECT email FROM user;"

# 查看 API Keys
sqlite3 newflow_data/database.sqlite "SELECT label FROM user_api_keys;"

# 查看标记文件
cat newflow_data/.initialized
```

### 手动运行检查脚本

```bash
# 启动前检查
bash scripts/check_newflow_init.sh

# 启动后检查（前台运行）
bash scripts/post_newflow_init.sh
```

### 强制重新初始化

```bash
# 1. 停止容器
docker stop newflow

# 2. 删除数据（⚠️ 会丢失所有工作流和数据）
rm -rf newflow_data/database.sqlite*
rm -f newflow_data/.initialized

# 3. 重启
docker-compose up -d newflow

# 4. 系统将自动重新初始化
```

## 故障排除

### 问题 1：Newflow 仍然崩溃重启

**可能原因**：
- `.env` 文件未更新
- 标记文件权限问题

**解决方法**：
```bash
# 手动禁用 AUTO_SETUP
sed -i '' 's/NEWFLOW_AUTO_SETUP_ENABLED=true/NEWFLOW_AUTO_SETUP_ENABLED=false/' .env

# 重启容器
docker-compose restart newflow
```

### 问题 2：检查脚本未运行

**检查脚本权限**：
```bash
ls -l scripts/check_newflow_init.sh
ls -l scripts/post_newflow_init.sh

# 如果没有执行权限
chmod +x scripts/check_newflow_init.sh
chmod +x scripts/post_newflow_init.sh
```

### 问题 3：初始化超时

**原因**：
- 容器启动慢
- 数据库初始化时间长

**解决方法**：
- 等待更长时间（默认 5 分钟）
- 检查容器日志：`docker logs newflow`
- 手动运行后检查脚本

### 问题 4：数据库已损坏

**症状**：
- 容器无法启动
- 日志显示数据库错误

**解决方法**：
```bash
# 备份现有数据（如需要）
cp newflow_data/database.sqlite newflow_data/database.sqlite.backup

# 删除损坏的数据库
rm newflow_data/database.sqlite*
rm newflow_data/.initialized

# 重新初始化
docker-compose restart newflow
```

## 最佳实践

### ✅ 推荐做法

1. **让系统自动管理**
   - 不要手动修改 `NEWFLOW_AUTO_SETUP_ENABLED`
   - 让检查脚本自动配置

2. **定期备份数据库**
   ```bash
   cp newflow_data/database.sqlite backups/database-$(date +%Y%m%d).sqlite
   ```

3. **监控启动日志**
   ```bash
   docker logs -f newflow
   ```

4. **保留标记文件**
   - 不要删除 `.initialized` 文件
   - 除非需要重新初始化

### ❌ 避免做法

1. **不要**在容器运行时删除数据库
2. **不要**手动启用 AUTO_SETUP（除非清空数据库）
3. **不要**忽略崩溃循环错误
4. **不要**跳过检查脚本

## 日志和监控

### 查看启动日志

```bash
# 实时查看 Newflow 日志
docker logs -f newflow

# 查看最近 50 行
docker logs --tail 50 newflow

# 查看启动脚本日志
tail -f logs/operations.log
```

### 检查容器状态

```bash
# 查看所有容器
docker ps -a

# 只看 Newflow
docker ps --filter "name=newflow"

# 查看重启次数
docker inspect newflow | grep RestartCount
```

## 集成到现有系统

### 自动化集成

系统已自动集成到 `scripts/07_start_docker_services.sh`：

```bash
# 启动前检查（同步）
bash scripts/check_newflow_init.sh

# 启动容器
docker-compose up -d

# 启动后检查（后台）
bash scripts/post_newflow_init.sh &
```

### CI/CD 集成

在自动化部署中：

```yaml
steps:
  - name: Check Newflow Init
    run: bash scripts/check_newflow_init.sh
    
  - name: Start Services
    run: docker-compose up -d
    
  - name: Post Init Check
    run: bash scripts/post_newflow_init.sh
```

## 技术细节

### 数据库检查逻辑

```bash
# 检查用户表
user_count=$(sqlite3 database.sqlite "SELECT COUNT(*) FROM user;")

# 检查 API Key 表
apikey_count=$(sqlite3 database.sqlite "SELECT COUNT(*) FROM user_api_keys;")

# 判断已初始化
if [[ $user_count -gt 0 ]] && [[ $apikey_count -gt 0 ]]; then
    echo "已初始化"
fi
```

### API 就绪检查

```bash
# 检查 HTTP 响应
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5677/)

# 200 或 302 表示就绪
if [[ "$response" == "200" ]] || [[ "$response" == "302" ]]; then
    echo "API 就绪"
fi
```

## 总结

通过智能初始化系统，你的 Newflow 部署将：

✅ **自动识别**首次安装、重启和重新初始化场景  
✅ **自动配置** AUTO_SETUP 开关  
✅ **避免冲突**数据库唯一性约束错误  
✅ **无需人工干预**即可正常启动  
✅ **支持重新初始化**灵活处理数据清空场景  

如有问题，请查看日志或提交 Issue。

