# NewFlow Data Directory

## 说明

此目录用于 **NewFlow (n8n) 的数据持久化和日志存储**。

### 用途

- ✅ **数据持久化**: NewFlow 的工作流、凭证、执行历史等数据
- ✅ **日志文件**: NewFlow 运行日志
- ✅ **SQLite 数据库**: NewFlow 的内部数据库文件
- ✅ **文件存储**: 工作流执行过程中产生的文件

### 重要提示

⚠️ **不要删除此目录**！删除会导致：
- 所有工作流丢失
- 执行历史丢失
- 保存的凭证丢失

### Docker 卷挂载

在 `docker-compose.yml` 中，此目录被挂载到 NewFlow 容器：

```yaml
volumes:
  - ./newflow_data:/home/node/.n8n
```

### 数据管理

- **备份**: 定期备份此目录以防数据丢失
- **清理**: 可以删除旧的日志文件以节省空间
- **迁移**: 复制此目录可将 NewFlow 数据迁移到其他环境

---

## 工作流导入

应用启动时会自动从 `workflow_conf` 目录导入工作流：

```
workflow_conf/*.json → Dashboard导入 → NewFlow → newflow_data持久化
```

您也可以通过 Dashboard Web UI 手动点击"导入工作流"按钮来导入新的工作流。

