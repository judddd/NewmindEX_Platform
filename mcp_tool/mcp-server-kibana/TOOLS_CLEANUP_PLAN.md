# 🧹 工具清理方案

## 📊 精简原则

### ✅ 保留
- **VL 工具（6个）** - 完全保留，包括创建、更新、删除（保存对象管理）
- **Base 工具（6个）** - 完全保留（基础功能）
- **查询类工具** - 所有 find/get/search/list 操作
- **简单状态操作** - enable/disable、mute/unmute（不需要复杂参数）
- **系统信息查询** - health/privileges/types 等

### ❌ 去除
- **复杂创建操作** - create 需要复杂 JSON 配置的工具
- **更新操作** - update 需要精确修改的工具
- **删除操作** - delete 危险操作
- **批量操作** - bulk 操作
- **导入导出** - import/export 操作
- **管理员操作** - index/migration 管理

---

## 📋 具体清理清单

### 1. DT Tools (27 → 11-12)

#### DT Rules Tools (8 → 4)
- ✅ `dt_find_rules` - 搜索规则
- ✅ `dt_get_rule` - 获取规则
- ❌ `dt_create_rule` - 创建规则
- ❌ `dt_update_rule` - 更新规则
- ❌ `dt_delete_rule` - 删除规则
- ✅ `dt_get_prebuilt_rules` - 获取预置规则
- ✅ `dt_install_prebuilt_rules` - 安装预置规则（简单操作）
- ❌ `dt_add_rule_exception` - 添加异常

#### DT Bulk Tools (7 → 1)
- ✅ `dt_bulk_action_rules` - 批量操作（启用/禁用等简单操作）
- ❌ `dt_bulk_create_rules` - 批量创建
- ❌ `dt_bulk_delete_rules` - 批量删除
- ❌ `dt_bulk_update_rules` - 批量更新
- ❌ `dt_export_rules` - 导出规则
- ❌ `dt_import_rules` - 导入规则
- ❌ `dt_rule_preview` - 规则预览

#### DT Signals Tools (8 → 3)
- ✅ `dt_search_signals` - 搜索信号
- ✅ `dt_update_signal_status` - 更新状态（简单状态）
- ✅ `dt_set_signal_assignees` - 设置负责人（简单操作）
- ❌ `dt_get_detection_tags` - 获取标签
- ❌ `dt_create_signal_migration` - 创建迁移
- ❌ `dt_finalize_signal_migration` - 完成迁移
- ❌ `dt_delete_signal_migration` - 删除迁移
- ❌ `dt_get_signal_migration_status` - 迁移状态

#### DT Admin Tools (4 → 1)
- ✅ `dt_get_detection_privileges` - 获取权限
- ❌ `dt_get_alerts_index` - 获取索引
- ❌ `dt_create_alerts_index` - 创建索引
- ❌ `dt_delete_alerts_index` - 删除索引

**DT 小计**: 27 → 9 工具

---

### 2. SC Tools (43 → 16-17)

#### SC Timeline Tools (12 → 4)
- ✅ `sc_find_timelines` - 搜索时间线
- ✅ `sc_get_timeline` - 获取时间线
- ❌ `sc_create_timeline` - 创建时间线
- ❌ `sc_update_timeline` - 更新时间线
- ❌ `sc_delete_timelines` - 删除时间线
- ❌ `sc_copy_timeline` - 复制时间线
- ❌ `sc_export_timelines` - 导出时间线
- ❌ `sc_import_timelines` - 导入时间线
- ✅ `sc_favorite_timeline` - 收藏时间线（简单操作）
- ✅ `sc_get_timeline_notes` - 获取笔记
- ❌ `sc_create_timeline_note` - 创建笔记
- ❌ `sc_persist_pinned_events` - 固定事件

#### SC Exception Tools (14 → 6)
- ✅ `sc_find_exception_lists` - 搜索异常列表
- ✅ `sc_get_exception_list` - 获取异常列表
- ❌ `sc_create_exception_list` - 创建异常列表
- ❌ `sc_update_exception_list` - 更新异常列表
- ❌ `sc_delete_exception_list` - 删除异常列表
- ✅ `sc_find_exception_items` - 搜索异常项
- ✅ `sc_get_exception_item` - 获取异常项
- ❌ `sc_create_exception_item` - 创建异常项
- ❌ `sc_update_exception_item` - 更新异常项
- ❌ `sc_delete_exception_item` - 删除异常项
- ❌ `sc_export_exception_list` - 导出异常列表
- ❌ `sc_import_exception_list` - 导入异常列表
- ✅ `sc_find_exception_references` - 查找引用
- ❌ `sc_create_shared_exception_list` - 创建共享列表
- ✅ `sc_get_exception_summary` - 获取摘要

#### SC List Tools (17 → 6)
- ✅ `sc_find_lists` - 搜索列表
- ✅ `sc_get_list` - 获取列表
- ❌ `sc_create_list` - 创建列表
- ❌ `sc_update_list` - 更新列表
- ❌ `sc_delete_list` - 删除列表
- ✅ `sc_find_list_items` - 搜索列表项
- ✅ `sc_get_list_item` - 获取列表项
- ❌ `sc_create_list_item` - 创建列表项
- ❌ `sc_update_list_item` - 更新列表项
- ❌ `sc_delete_list_item` - 删除列表项
- ❌ `sc_export_list` - 导出列表
- ❌ `sc_import_list` - 导入列表
- ❌ `sc_manage_list_datastreams` - 管理数据流
- ❌ `sc_get_list_index` - 获取索引
- ❌ `sc_create_list_index` - 创建索引
- ❌ `sc_delete_list_index` - 删除索引
- ✅ `sc_get_list_privileges` - 获取权限
- ✅ `sc_patch_list_item` - 补丁列表项（保留：因为不需要完整 JSON）

**SC 小计**: 43 → 17 工具

---

### 3. OB Tools (29 → 12-13)

#### OB Alert Tools (14 → 7)
- ✅ `ob_alert_find_rules` - 搜索规则
- ✅ `ob_alert_get_rule` - 获取规则
- ❌ `ob_alert_create_rule` - 创建规则
- ❌ `ob_alert_update_rule` - 更新规则
- ❌ `ob_alert_delete_rule` - 删除规则
- ✅ `ob_alert_enable_rule` - 启用规则
- ✅ `ob_alert_disable_rule` - 禁用规则
- ✅ `ob_alert_mute_all` - 静音所有
- ✅ `ob_alert_unmute_all` - 取消静音所有
- ❌ `ob_alert_mute_alert` - 静音特定告警
- ❌ `ob_alert_unmute_alert` - 取消静音特定告警
- ❌ `ob_alert_update_api_key` - 更新API密钥
- ✅ `ob_alert_get_rule_types` - 获取规则类型
- ✅ `ob_alert_health_check` - 健康检查

#### OB Action Tools (8 → 3)
- ✅ `ob_action_list` - 列出连接器
- ✅ `ob_action_get` - 获取连接器
- ❌ `ob_action_create` - 创建连接器
- ❌ `ob_action_update` - 更新连接器
- ❌ `ob_action_delete` - 删除连接器
- ❌ `ob_action_execute` - 执行连接器
- ✅ `ob_action_get_connector_types` - 获取连接器类型
- ❌ `ob_action_list_action_types` - 列出操作类型（重复）

#### OB SLO Tools (7 → 2)
- ✅ `ob_slo_find` - 搜索SLO
- ✅ `ob_slo_get` - 获取SLO
- ❌ `ob_slo_create` - 创建SLO
- ❌ `ob_slo_update` - 更新SLO
- ❌ `ob_slo_delete` - 删除SLO
- ❌ `ob_slo_enable` - 启用SLO
- ❌ `ob_slo_disable` - 禁用SLO

**OB 小计**: 29 → 12 工具

---

### 4. DataView Tools (11 → 3)

- ✅ `dataview_get_all` - 获取所有
- ✅ `dataview_get` - 获取特定
- ❌ `dataview_create` - 创建
- ❌ `dataview_update` - 更新
- ❌ `dataview_delete` - 删除
- ✅ `dataview_get_fields` - 获取字段
- ❌ `dataview_update_fields` - 更新字段
- ❌ `dataview_create_runtime_field` - 创建运行时字段
- ❌ `dataview_update_runtime_field` - 更新运行时字段
- ❌ `dataview_delete_runtime_field` - 删除运行时字段
- ❌ `dataview_set_default` - 设置默认
- ❌ `dataview_swap_references` - 交换引用

**DataView 小计**: 11 → 3 工具

---

## 📊 总计

| 分类 | 原数量 | 保留数量 | 去除数量 | 保留率 |
|------|--------|---------|---------|--------|
| Base | 6 | 6 | 0 | 100% |
| VL | 6 | 6 | 0 | 100% |
| DT | 27 | 9 | 18 | 33% |
| SC | 43 | 17 | 26 | 40% |
| OB | 29 | 12 | 17 | 41% |
| DataView | 11 | 3 | 8 | 27% |
| **总计** | **122** | **53** | **69** | **43%** |

---

## ✅ 清理后的工具能力

### 核心能力保留：
1. ✅ **数据查询和分析** - 所有 find/get/search 操作
2. ✅ **系统状态检查** - health/privileges/types 查询
3. ✅ **简单状态管理** - enable/disable、mute/unmute、status 更新
4. ✅ **保存对象完整管理** - VL 工具保留所有功能
5. ✅ **基础工具完整保留** - 包括万能的 execute_kb_api

### 去除的能力：
1. ❌ **复杂配置创建** - 安全规则、告警规则、SLO 创建
2. ❌ **精确更新操作** - 需要完整 JSON 的更新
3. ❌ **危险删除操作** - 各类删除功能
4. ❌ **批量高级操作** - 批量创建/删除/更新
5. ❌ **导入导出** - 数据迁移操作
6. ❌ **管理员操作** - 索引和数据流管理

---

**清理日期**: 2024-12-03  
**目标**: 减少 57% 的工具数量，聚焦数据解读和查询能力

