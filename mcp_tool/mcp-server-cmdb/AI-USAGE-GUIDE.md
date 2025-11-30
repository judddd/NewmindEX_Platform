# 🤖 AI使用指南 - CMDB MCP Server

## 📊 分页策略优化

为了提供更好的AI交互体验，所有查询工具已优化为**智能分页模式**。

---

## 🎯 核心原则

### ✅ **推荐做法**
1. **从小开始**：首次查询使用 `pageSize=10`（默认值）
2. **按需增长**：只在用户明确需要更多数据时才增加
3. **渐进增加**：10 → 20 → 50 → 100
4. **避免过度调用**：一般10条记录足够分析

### ❌ **避免做法**
- 不要一次性查询大量数据（除非用户明确要求）
- 不要在没有明确需求时多次分页调用
- 不要使用超大的 pageSize（如500、1000）

---

## 🔧 工具使用建议

### 1️⃣ `cmdb_query_view` - 基础查询

**默认行为：**
```json
{
  "viewid": "xxx",
  "pageSize": 10,    // ✅ 默认10条
  "startPage": 1
}
```

**何时增加pageSize：**
- ✅ 用户说"需要更多结果"
- ✅ 用户说"查看所有"
- ✅ 需要统计分析大量数据
- ❌ 不要：未经用户确认就自动增加

**示例对话：**
```
用户：查询服务器视图
AI：[调用 pageSize=10] → 返回10条记录，询问是否需要更多

用户：显示更多
AI：[调用 pageSize=20 或 startPage=2] → 返回更多数据
```

---

### 2️⃣ `cmdb_query_with_conditions` - 条件查询

**默认行为：**
```json
{
  "viewid": "xxx",
  "conditions": [{"key": "status", "operation": "eq", "value": "running"}],
  "pageSize": 10,    // ✅ 默认10条
  "startPage": 1
}
```

**条件过滤特性：**
- 使用精确的条件可以大幅减少结果数量
- 如果条件足够精确，10条记录通常足够
- 只在结果被截断且用户需要时才分页

**建议流程：**
```
1. 首先使用精确条件查询（pageSize=10）
2. 检查返回的 total 字段
3. 如果 total > 10 且用户需要，再获取更多
```

---

### 3️⃣ `cmdb_extract_fields` - 字段提取（推荐）

**默认行为：**
```json
{
  "viewid": "xxx",
  "fields": ["vHostName", "businessSystem", "status"],  // 只提取必要字段
  "pageSize": 10,    // ✅ 默认10条
  "startPage": 1
}
```

**最佳实践：**
- ✅ **优先使用此工具**：数据量小，响应快
- ✅ 只提取真正需要的字段
- ✅ 非常适合AI分析和摘要
- ✅ 减少token消耗

**示例：**
```json
// ✅ 好 - 只提取3个字段
{
  "fields": ["vHostName", "status", "businessSystem"]
}

// ❌ 避免 - 提取太多字段（除非必要）
{
  "fields": ["vHostName", "status", "memory", "cpu", "disk", "ip", ...]
}
```

---

## 📈 响应数据解读

每次查询返回包含分页信息：

```json
{
  "total": 156,        // 总记录数
  "pages": 16,         // 总页数（按当前pageSize）
  "currentPage": 1,    // 当前页
  "pageSize": 10,      // 每页记录数
  "recordsInPage": 10, // 当前页实际记录数
  "startRow": 1,       // 起始行号
  "endRow": 10         // 结束行号
}
```

**AI决策逻辑：**
```
if (total <= 10):
    一次查询足够，直接展示结果
    
elif (total > 10 and total <= 50):
    展示前10条，询问："找到{total}条记录，需要查看更多吗？"
    
elif (total > 50):
    展示前10条，告知："共找到{total}条记录，可以：
    1. 查看更多结果
    2. 添加过滤条件缩小范围
    3. 使用字段提取查看特定信息"
```

---

## 💡 实际场景示例

### 场景1：探索性查询
```
用户："查看所有服务器"
AI思路：
  - 首次查询用 pageSize=10
  - 检查 total（如：total=500）
  - 回复："找到500台服务器，已显示前10台。您想：
    1. 查看更多服务器
    2. 按条件筛选（如状态、环境）
    3. 只查看特定字段"
```

### 场景2：精确查询
```
用户："查找生产环境的故障服务器"
AI思路：
  - 使用条件查询：
    conditions: [
      {key: "env", operation: "eq", value: "production"},
      {key: "status", operation: "eq", value: "fault"}
    ]
    pageSize: 10
  - 检查结果（如：total=3）
  - 回复："找到3台生产环境故障服务器：[列表]"
  - ✅ 无需再查询
```

### 场景3：数据分析
```
用户："统计各业务系统的服务器数量"
AI思路：
  - 使用 extract_fields 提取 businessSystem
  - pageSize=10 先看样本
  - 如果需要完整统计，再增加到 pageSize=100
  - 或多次调用累积数据（仅在必要时）
```

---

## ⚠️ 性能考虑

### Token消耗
```
pageSize=10  → 约 2-5K tokens
pageSize=50  → 约 10-25K tokens
pageSize=100 → 约 20-50K tokens
```

### 响应时间
```
pageSize=10  → 快速（< 1秒）
pageSize=50  → 中等（1-3秒）
pageSize=100 → 较慢（2-5秒）
```

### 建议
- 优先考虑用户体验和响应速度
- 大数据量分析时，使用 `extract_fields` 只提取必要字段
- 避免无谓的大量数据传输

---

## 🎓 总结

**最佳实践公式：**
```
初始查询 = 小pageSize (10) + 精确条件 + 必要字段
↓
根据用户反馈决定是否：
  - 增加 pageSize (20, 50, 100)
  - 翻页 (startPage++)
  - 添加条件缩小范围
```

**目标：**
- ✅ 快速响应
- ✅ 节省token
- ✅ 良好的用户体验
- ✅ 按需获取数据

---

*最后更新：2024-11-27*

