# 🛡️ Token限制保护机制

## 📋 概述

为了优化AI交互体验和控制响应大小，CMDB MCP Server实现了**自动token限制检测**机制。

当查询结果超过token限制时，系统会：
- ✅ 自动拦截响应
- ✅ 提供清晰的错误提示
- ✅ 建议合适的pageSize
- ✅ 引导使用更优的查询方式

---

## 🔧 工作原理

### Token估算方法

使用简单的字符数估算：
```
估算tokens ≈ 字符数 / 4
```

这个比例适用于中英文混合内容，足够准确用于限制检测。

### 限制阈值

**默认限制：2000 tokens**

- 适合单次AI响应
- 避免上下文窗口过载
- 确保快速响应

---

## 🚨 触发场景

### 场景1：pageSize过大

```json
// 请求
{
  "viewid": "server_view",
  "pageSize": 50  // 过大
}

// 响应
⚠️ Response too large: estimated 3500 tokens (limit: 2000 tokens)
Current pageSize: 50
Suggested action: Reduce pageSize to 28 or smaller
Or use cmdb_extract_fields to fetch only specific fields
```

### 场景2：记录字段过多

```json
// 请求 - 查询完整记录（每条记录字段很多）
{
  "viewid": "server_view",
  "pageSize": 20
}

// 如果每条记录很大，可能触发限制
⚠️ Response too large: estimated 2500 tokens (limit: 2000 tokens)
Current pageSize: 20
Suggested action: Reduce pageSize to 15 or smaller
Or use cmdb_extract_fields to fetch only specific fields
```

---

## ✅ 推荐解决方案

### 方案1：减少pageSize（最简单）

```json
// 之前
{
  "pageSize": 50
}

// 修改为
{
  "pageSize": 10  // 或根据建议的值
}
```

### 方案2：使用字段提取（最优）

**改用 `cmdb_extract_fields` 工具**：

```json
{
  "viewid": "server_view",
  "fields": ["vHostName", "status", "businessSystem"],  // 只提取必要字段
  "pageSize": 30  // 可以使用更大的pageSize
}
```

**优势：**
- ✅ 大幅减少数据量（只返回指定字段）
- ✅ 可以查询更多记录
- ✅ 响应更快
- ✅ token消耗更少

### 方案3：添加过滤条件

```json
{
  "viewid": "server_view",
  "conditions": [
    {"key": "status", "operation": "eq", "value": "running"},
    {"key": "env", "operation": "eq", "value": "production"}
  ],
  "pageSize": 20
}
```

**优势：**
- ✅ 减少返回的记录数
- ✅ 更精确的结果
- ✅ 避免不必要的数据传输

---

## 📊 Token消耗估算

### 不同工具的典型消耗

| 工具 | pageSize | 字段数 | 估算Tokens |
|------|----------|--------|-----------|
| `cmdb_query_view` | 10 | 全部(~30) | ~2000 |
| `cmdb_query_view` | 20 | 全部(~30) | ~4000 ⚠️ |
| `cmdb_query_view` | 50 | 全部(~30) | ~10000 ❌ |
| `cmdb_extract_fields` | 10 | 3个字段 | ~300 ✅ |
| `cmdb_extract_fields` | 30 | 3个字段 | ~900 ✅ |
| `cmdb_extract_fields` | 50 | 5个字段 | ~1500 ✅ |

### 安全的pageSize建议

| 工具 | 推荐pageSize | 最大安全值 |
|------|-------------|-----------|
| `cmdb_query_view` | 10 | 15 |
| `cmdb_query_with_conditions` | 10 | 20 |
| `cmdb_extract_fields` | 10-30 | 50+ |

---

## 💡 最佳实践

### 1️⃣ 优先使用字段提取

```
✅ 好：
cmdb_extract_fields(
  fields=["vHostName", "status", "ip"],
  pageSize=30
)

❌ 避免：
cmdb_query_view(pageSize=30)  // 返回所有字段
```

### 2️⃣ 渐进式查询

```
第一步：小pageSize探索（10条）
     ↓
检查结果是否足够
     ↓
如不够，增加到20-30
     ↓
或使用字段提取查询更多
```

### 3️⃣ 使用精确条件

```
✅ 好：
conditions: [
  {key: "status", operation: "eq", value: "fault"},
  {key: "env", operation: "eq", value: "production"}
]

❌ 避免：
无条件查询大量数据
```

---

## 🔄 错误处理流程

```mermaid
查询请求
    ↓
执行查询
    ↓
检查结果token数
    ↓
  是否超过2000?
   ↙        ↘
 否          是
  ↓          ↓
正常返回   拦截并返回错误
            ↓
          提供建议：
          1. 减少pageSize
          2. 使用字段提取
          3. 添加过滤条件
```

---

## 🧪 测试示例

### 测试1：触发限制

```bash
# 请求大量数据
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "cmdb_query_view",
      "arguments": {
        "viewid": "server_view",
        "pageSize": 100
      }
    },
    "id": 1
  }'

# 预期：返回token限制错误
```

### 测试2：正常查询

```bash
# 请求合理数量
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "cmdb_extract_fields",
      "arguments": {
        "viewid": "server_view",
        "fields": ["vHostName", "status", "ip"],
        "pageSize": 30
      }
    },
    "id": 1
  }'

# 预期：正常返回数据
```

---

## 📈 性能影响

### Token检测开销

- **计算时间**：< 1ms（字符串长度计算）
- **额外内存**：忽略不计（只计算JSON字符串长度）
- **对查询性能的影响**：无（在返回前检测）

### 用户体验提升

- ✅ 避免超大响应导致的卡顿
- ✅ 快速识别问题并提供解决方案
- ✅ 引导用户使用最优查询方式
- ✅ 减少不必要的重试

---

## 🔍 调试

### 查看token估算

响应中会显示估算的token数：

```
⚠️ Response too large: estimated 3500 tokens (limit: 2000 tokens)
```

### 手动计算

```typescript
// 简单估算
const jsonString = JSON.stringify(data);
const estimatedTokens = Math.ceil(jsonString.length / 4);
console.log(`Estimated tokens: ${estimatedTokens}`);
```

---

## ❓ 常见问题

### Q: 为什么是2000 tokens？
**A:** 这是一个平衡值：
- 足够显示有用的数据量
- 避免AI上下文过载
- 确保快速响应
- 适合大多数查询场景

### Q: 可以调整限制吗？
**A:** 目前硬编码为2000。如需调整，修改 `index.ts` 中的 `checkTokenLimit(content, 2000)` 参数。

### Q: 为什么估算不是精确的？
**A:** 简单估算（字符数/4）足够用于限制检测，无需精确计算（会影响性能）。

### Q: 字段提取工具也有限制吗？
**A:** 是的，但因为只返回指定字段，很少触发限制。

---

## 🎯 总结

Token限制机制的目标：
1. ✅ 保护AI交互体验
2. ✅ 引导最佳实践
3. ✅ 防止过度查询
4. ✅ 提供清晰的错误提示

**记住：少即是多！**
- 从小pageSize开始
- 使用字段提取
- 添加精确条件
- 按需增长

---

*最后更新：2024-11-27*

