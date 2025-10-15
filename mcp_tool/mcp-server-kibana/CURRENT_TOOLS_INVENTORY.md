# 🔧 Kibana MCP Server - 当前工具清单

**更新日期**: 2024-12-03  
**清理状态**: ✅ 已完成精简（从 122 工具 → ~53 工具）

---

## 📊 **工具统计总览**

| 分类 | 工具数量 | 保留率 | 主要功能 |
|------|---------|--------|---------|
| **Base Tools** | 6 | 100% | 基础功能、通用API |
| **VL Tools** | 6 | 100% | 可视化对象管理（完全保留） |
| **DT Tools** | 9 | 33% | 检测规则查询和批量操作 |
| **SC Tools** | 17 | 40% | 安全功能（Timeline、Exception、List） |
| **OB Tools** | 12 | 41% | 可观测性（Alert、Action、SLO） |
| **DataView Tools** | 3 | 27% | 数据视图查询 |
| **总计** | **53** | **43%** | 聚焦数据解读和查询 |

---

## 🎯 **清理原则回顾**

### ✅ **保留的工具类型**
- **查询/读取操作** (find, get, search, list)
- **系统状态检查** (health, privileges, types, status)
- **简单开关操作** (enable/disable, mute/unmute)
- **VL 对象管理** (完全保留，包括创建/更新/删除)

### ❌ **已移除的工具类型**
- **复杂配置创建** (需要复杂 JSON 的 create 操作)
- **精确更新操作** (update 需要完整配置)
- **危险删除操作** (delete 不可逆)
- **批量高级操作** (bulk create/update/delete)
- **导入导出** (import/export)
- **管理员操作** (index/migration 管理)

---

## 📋 **详细工具列表**

### **1. Base Tools（6 个工具）** ✅ **全部保留**

| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `get_status` | 查询 | 获取 Kibana 服务器状态 |
| `execute_kb_api` | 通用 | **万能工具** - 执行任意 Kibana API 请求 |
| `search_kibana_api_paths` | 查询 | 搜索 Kibana API 端点 |
| `list_all_kibana_api_paths` | 查询 | 列出所有 Kibana API 端点 |
| `get_kibana_api_detail` | 查询 | 获取特定 API 端点详情 |
| `get_available_spaces` | 查询 | 获取所有可用的 Kibana 空间 |

**说明**: 
- ✅ 全部保留，尤其是 `execute_kb_api` 是高能力模型的核心工具
- 💡 `execute_kb_api` 可以替代所有被移除的创建/更新/删除操作

---

### **2. VL Tools（6 个工具）** ✅ **全部保留**

| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `vl_search_saved_objects` | 查询 | 搜索保存对象（支持类型过滤、分页） |
| `vl_get_saved_object` | 查询 | 获取单个保存对象 |
| `vl_create_saved_object` | 创建 | 创建保存对象（Dashboard、Visualization 等） |
| `vl_update_saved_object` | 更新 | 更新保存对象 |
| `vl_bulk_update_saved_objects` | 批量更新 | 批量更新多个保存对象 |
| `vl_bulk_delete_saved_objects` | 批量删除 | 批量删除多个保存对象 |

**说明**:
- ✅ **完全保留** - VL 工具是 Kibana 可视化层的核心
- 💡 这些工具负责管理 Dashboard、Visualization、Lens、Map 等对象
- ⚠️ 这是唯一保留完整 CRUD 操作的工具组

---

### **3. DT Tools（9 个工具）** 🟡 **精简至 33%**

#### **3.1 DT Rules (4 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `dt_find_rules` | 查询 | 搜索检测规则 |
| `dt_get_rule` | 查询 | 获取单个检测规则 |
| `dt_get_prepackaged_rules` | 查询 | 获取预置规则列表 |
| `dt_install_prebuilt_rules` | 简单操作 | 安装 Elastic 预置规则 |

**移除**: ~~dt_create_rule~~, ~~dt_update_rule~~, ~~dt_delete_rule~~, ~~dt_add_rule_exception~~

#### **3.2 DT Bulk (1 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `dt_bulk_action_rules` | 批量操作 | 批量启用/禁用/导出规则 |

**移除**: ~~dt_bulk_create~~, ~~dt_bulk_delete~~, ~~dt_bulk_update~~, ~~dt_export_rules~~, ~~dt_import_rules~~, ~~dt_preview_rule~~

#### **3.3 DT Signals (3 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `dt_search_signals` | 查询 | 搜索告警信号 |
| `dt_update_signal_status` | 简单状态 | 更新告警状态（open/closed） |
| `dt_set_alert_assignees` | 简单状态 | 设置告警负责人 |

**移除**: ~~dt_get_detection_tags~~, ~~dt_*_signal_migration~~ (4个迁移相关)

#### **3.4 DT Admin (1 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `dt_get_detection_privileges` | 查询 | 获取检测引擎权限 |

**移除**: ~~dt_get_alerts_index~~, ~~dt_create_alerts_index~~, ~~dt_delete_alerts_index~~

---

### **4. SC Tools（17 个工具）** 🟡 **精简至 40%**

#### **4.1 SC Timeline (4 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `sc_find_timelines` | 查询 | 搜索时间线 |
| `sc_get_timeline` | 查询 | 获取时间线详情 |
| `sc_favorite_timeline` | 简单开关 | 收藏/取消收藏时间线 |
| `sc_get_timeline_notes` | 查询 | 获取时间线笔记 |

**移除**: ~~sc_create_timeline~~, ~~sc_update_timeline~~, ~~sc_delete_timelines~~, ~~sc_copy_timeline~~, ~~sc_export_timelines~~, ~~sc_import_timelines~~, ~~sc_create_timeline_note~~, ~~sc_persist_pinned_events~~

#### **4.2 SC Exception (6 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `sc_find_exception_lists` | 查询 | 搜索异常列表 |
| `sc_get_exception_list` | 查询 | 获取异常列表 |
| `sc_find_exception_items` | 查询 | 搜索异常项 |
| `sc_get_exception_item` | 查询 | 获取异常项 |
| `sc_find_exception_references` | 查询 | 查找异常列表引用关系 |
| `sc_get_exception_summary` | 查询 | 获取异常摘要 |

**移除**: ~~sc_create_exception_list~~, ~~sc_update_exception_list~~, ~~sc_delete_exception_list~~, ~~sc_create_exception_item~~, ~~sc_update_exception_item~~, ~~sc_delete_exception_item~~, ~~sc_export_exception_list~~, ~~sc_import_exception_list~~

#### **4.3 SC List (7 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `sc_find_lists` | 查询 | 搜索值列表 |
| `sc_get_list` | 查询 | 获取值列表 |
| `sc_find_list_items` | 查询 | 搜索列表项 |
| `sc_get_list_item` | 查询 | 获取列表项 |
| `sc_patch_list_item` | 简单更新 | 修补列表项（不需要完整JSON） |
| `sc_get_list_privileges` | 查询 | 获取列表权限 |
| `sc_get_list_index` | 查询 | 获取列表索引信息 |

**移除**: ~~sc_create_list~~, ~~sc_update_list~~, ~~sc_delete_list~~, ~~sc_create_list_item~~, ~~sc_update_list_item~~, ~~sc_delete_list_item~~, ~~sc_export_list~~, ~~sc_import_list~~, ~~sc_manage_list_datastreams~~, ~~sc_create_list_index~~, ~~sc_delete_list_index~~

**💡 注意**: `sc_patch_list_item` 保留是因为它不需要完整的 JSON 配置

---

### **5. OB Tools（12 个工具）** 🟡 **精简至 41%**

#### **5.1 OB Alert (8 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `ob_alert_find_rules` | 查询 | 搜索告警规则 |
| `ob_alert_get_rule` | 查询 | 获取告警规则 |
| `ob_alert_enable_rule` | 简单开关 | 启用告警规则 |
| `ob_alert_disable_rule` | 简单开关 | 禁用告警规则 |
| `ob_alert_mute_all` | 简单开关 | 静音所有告警 |
| `ob_alert_unmute_all` | 简单开关 | 取消静音所有告警 |
| `ob_alert_get_rule_types` | 查询 | 获取可用规则类型 |
| `ob_alert_health_check` | 查询 | 告警系统健康检查 |

**移除**: ~~ob_alert_create_rule~~, ~~ob_alert_update_rule~~, ~~ob_alert_delete_rule~~, ~~ob_alert_mute_alert~~ (单个), ~~ob_alert_unmute_alert~~ (单个), ~~ob_alert_update_api_key~~

#### **5.2 OB Action (3 个)**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `ob_action_list` | 查询 | 列出所有连接器 |
| `ob_action_get` | 查询 | 获取连接器详情 |
| `ob_action_get_connector_types` | 查询 | 获取可用连接器类型 |

**移除**: ~~ob_action_create~~, ~~ob_action_update~~, ~~ob_action_delete~~, ~~ob_action_execute~~, ~~ob_action_list_action_types~~

#### **5.3 OB SLO (1 个)** 🔴 **可能需要补充**
| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `ob_slo_find` | 查询 | 搜索 SLO |
| `ob_slo_get` | 查询 | 获取 SLO 详情 |

**移除**: ~~ob_slo_create~~, ~~ob_slo_update~~, ~~ob_slo_delete~~, ~~ob_slo_enable~~, ~~ob_slo_disable~~

**⚠️ 建议**: SLO 的 enable/disable 是简单开关操作，可以考虑保留

---

### **6. DataView Tools（3 个工具）** 🟡 **精简至 27%**

| 工具名称 | 类型 | 功能描述 |
|---------|------|---------|
| `dataview_get_all` | 查询 | 获取所有数据视图 |
| `dataview_get` | 查询 | 获取单个数据视图 |
| `dataview_get_fields` | 查询 | 获取数据视图字段信息 |

**移除**: ~~dataview_create~~, ~~dataview_update~~, ~~dataview_delete~~, ~~dataview_update_fields~~, ~~dataview_create_runtime_field~~, ~~dataview_update_runtime_field~~, ~~dataview_delete_runtime_field~~, ~~dataview_set_default~~, ~~dataview_swap_references~~

**⚠️ 建议**: `dataview_get_default` 可以考虑保留（查询操作）

---

## 💡 **建议保留/添加的工具**

### **🟢 高优先级 - 建议保留**

| 工具名称 | 分类 | 理由 | 实施难度 |
|---------|------|------|---------|
| `ob_slo_enable` | OB SLO | 简单开关操作，不需要复杂配置 | ⭐ 易 |
| `ob_slo_disable` | OB SLO | 简单开关操作，不需要复杂配置 | ⭐ 易 |
| `dataview_get_default` | DataView | 查询操作，获取默认数据视图 | ⭐ 易 |
| `dt_get_detection_tags` | DT Signals | 查询操作，获取所有规则标签 | ⭐ 易 |

### **🟡 中优先级 - 可选保留**

| 工具名称 | 分类 | 理由 | 实施难度 |
|---------|------|------|---------|
| `ob_action_execute` | OB Action | 测试连接器，用于验证配置 | ⭐⭐ 中 |
| `sc_create_timeline_note` | SC Timeline | 笔记创建相对简单 | ⭐⭐ 中 |
| `dt_export_rules` | DT Bulk | 导出是只读操作 | ⭐ 易 |

### **🔴 低优先级 - 暂不推荐**

| 工具名称 | 分类 | 理由 |
|---------|------|------|
| `dt_rule_preview` | DT Bulk | 低频使用，可用 execute_kb_api |
| `*_create_*` | 所有 | 复杂配置，不适合 LLM |
| `*_update_*` | 所有 | 精确修改，不适合 LLM |

---

## 🎯 **使用建议**

### **针对不同 AI 模型能力**

#### **🚀 高能力模型（GPT-4、Claude 3.5 Sonnet）**
- **推荐配置**: Base Tools (6) + VL Tools (6) + 少量专用工具
- **核心工具**: `execute_kb_api` + `search_kibana_api_paths` + `get_kibana_api_detail`
- **优势**: 可以通过 `execute_kb_api` 执行任意 API，不需要专用工具
- **总工具数**: ~15-20 个即可

#### **🎯 中等能力模型（GPT-3.5、Claude 3 Haiku）**
- **推荐配置**: 当前全部 53 个工具
- **原因**: 需要更明确的工具名称和功能描述来引导模型
- **优势**: 专用工具提供更清晰的参数说明和错误提示

#### **📊 特定场景（安全运维、可观测性监控）**
- **安全运维**: Base + VL + DT + SC 工具
- **可观测性**: Base + VL + OB 工具
- **数据分析**: Base + VL + DataView 工具

---

## 📈 **工具使用频率预测**

### **🔥 高频使用（核心工具）**
1. `dt_search_signals` - 查询安全告警
2. `dt_find_rules` - 查询检测规则
3. `ob_alert_find_rules` - 查询可观测性告警规则
4. `vl_search_saved_objects` - 查询 Dashboard/Visualization
5. `execute_kb_api` - 万能 API 执行（高能力模型）

### **🟢 中频使用**
- `dt_update_signal_status` - 更新告警状态
- `sc_find_timelines` - 查询安全时间线
- `ob_alert_enable/disable_rule` - 开关告警规则
- `dataview_get_all` - 获取数据视图

### **🔵 低频使用**
- `dt_install_prebuilt_rules` - 安装预置规则（一次性）
- `sc_favorite_timeline` - 收藏时间线
- `ob_alert_health_check` - 健康检查
- `get_available_spaces` - 获取空间列表

---

## 🔧 **下一步行动建议**

### **1. 立即实施（高优先级）**
- [ ] 添加 `ob_slo_enable` 和 `ob_slo_disable` 工具
- [ ] 添加 `dataview_get_default` 工具
- [ ] 验证所有工具的编译和运行

### **2. 短期优化（1-2周）**
- [ ] 根据实际使用反馈，调整工具保留策略
- [ ] 添加工具使用统计和监控
- [ ] 创建不同场景的工具配置文件

### **3. 长期规划（1-3月）**
- [ ] 基于使用数据，进一步精简或扩展工具集
- [ ] 开发工具动态加载机制
- [ ] 提供工具配置 UI

---

## 📝 **总结**

### **✅ 清理成果**
- **从 122 个工具精简至 53 个工具** (减少 57%)
- **保留核心查询和状态管理功能**
- **移除复杂配置和危险操作**
- **VL 工具完全保留**，满足可视化对象管理需求

### **💡 核心优势**
1. **更适合 LLM 使用**: 聚焦数据解读，避免复杂配置
2. **更安全**: 移除大部分删除和批量危险操作
3. **更高效**: 减少工具选择的复杂度
4. **灵活性**: `execute_kb_api` 保证高能力模型的完整功能

### **🎯 适用场景**
- ✅ **安全威胁调查**: DT + SC 工具
- ✅ **系统监控分析**: OB 工具
- ✅ **数据可视化管理**: VL + DataView 工具
- ✅ **日志和指标查询**: 所有查询类工具
- ⚠️ **复杂系统配置**: 建议使用 `execute_kb_api` 或 Kibana UI

---

**更新人**: AI Assistant  
**文档版本**: v1.0  
**最后更新**: 2024-12-03

