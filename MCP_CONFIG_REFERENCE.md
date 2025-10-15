# MCP服务器配置参考手册

## 📖 总览

本文档详细说明了在Web管理平台中创建ES和Kibana MCP实例时所有可用的配置选项。

---

## 🔍 Elasticsearch MCP配置

### 基础配置

#### ES URL
- **字段名**: `es_url`
- **必填**: ✅ 是
- **格式**: `http://host:port` 或 `https://host:port`
- **示例**:
  - `http://localhost:9200` - 本地开发
  - `https://es.example.com:9200` - 远程集群
  - `http://172.18.0.2:9200` - Docker容器IP

### 认证配置

MCP支持三种认证方式，请根据您的ES集群配置选择：

#### 1. 用户名/密码认证（Basic Auth）
最常用的认证方式，适合大多数场景。

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `es_username` | 否 | ES用户名 | `elastic` |
| `es_password` | 否 | ES密码 | `changeme123` |

**使用场景**:
- ✅ 开发环境
- ✅ 测试环境
- ✅ 内网生产环境

#### 2. API Key认证
更安全的认证方式，推荐生产环境使用。

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `es_api_key` | 否 | ES API Key | `VnVhQ2ZHY0JDZGJrUW0tZTVo...` |

**创建API Key**:
```bash
# 通过ES API创建
POST /_security/api_key
{
  "name": "mcp-server-key",
  "role_descriptors": {
    "mcp_role": {
      "cluster": ["monitor", "manage_ml"],
      "indices": [
        {
          "names": ["*"],
          "privileges": ["read", "view_index_metadata"]
        }
      ]
    }
  }
}
```

**使用场景**:
- ✅ 生产环境
- ✅ 需要细粒度权限控制
- ✅ 多租户环境

#### 3. 无认证
仅用于完全开放的测试环境。

**使用场景**:
- ⚠️ 本地测试（无安全要求）
- ❌ 不推荐生产环境

### TLS/SSL配置

#### 禁用证书验证（开发环境）
| 字段 | 类型 | 说明 |
|------|------|------|
| `disable_tls` | boolean | 禁用SSL证书验证 |

**等同于**: `NODE_TLS_REJECT_UNAUTHORIZED=0`

**使用场景**:
- ✅ 使用自签名证书的开发环境
- ✅ 测试环境快速验证
- ❌ **绝不**用于生产环境

#### 自定义CA证书（生产环境）
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `es_ca_cert` | string | CA证书文件路径 | `/etc/ssl/certs/es-ca.pem` |

**使用场景**:
- ✅ 生产环境HTTPS连接
- ✅ 企业内部CA签发的证书
- ✅ 自签名证书（正式配置）

**证书格式要求**:
- PEM格式
- 包含完整证书链
- 服务器可读取权限

---

## 📊 Kibana MCP配置

### 基础配置

#### Kibana URL
- **字段名**: `kibana_url`
- **必填**: ✅ 是
- **格式**: `http://host:port` 或 `https://host:port`
- **示例**:
  - `http://localhost:5601` - 本地开发
  - `https://kibana.example.com:5601` - 远程实例

#### 默认Space
| 字段 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `kibana_space` | 否 | Kibana工作空间ID | `default` |

**多租户场景**:
```
marketing space → kibana_space: "marketing"
security space  → kibana_space: "security"
default space   → kibana_space: "default"
```

### 认证配置

Kibana MCP支持三种认证方式：

#### 1. 用户名/密码认证（Basic Auth）
标准认证方式。

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `kibana_username` | 否 | Kibana用户名 | `elastic` |
| `kibana_password` | 否 | Kibana密码 | `changeme123` |

**使用场景**:
- ✅ 常规场景
- ✅ 程序化访问
- ✅ CI/CD集成

#### 2. Cookie认证
适合复用浏览器会话。

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `kibana_cookies` | 否 | Session Cookie字符串 | `sid=xxx; security-session=yyy` |

**获取Cookie步骤**:
1. 在浏览器中登录Kibana
2. 打开开发者工具（F12）→ Network
3. 复制请求头中的完整Cookie字符串

**使用场景**:
- ✅ 临时调试
- ✅ 复用现有会话
- ⚠️ Cookie会过期，需定期更新

#### 3. 无认证
完全开放访问。

**使用场景**:
- ⚠️ 本地无认证Kibana
- ❌ 不推荐

### TLS/SSL配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `disable_tls` | boolean | 禁用SSL证书验证 |
| `kibana_ca_cert` | string | CA证书文件路径 |

配置方式与ES相同，参考上文。

### 高级配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `kibana_timeout` | integer | `30000` | 请求超时时间（毫秒） |
| `kibana_max_retries` | integer | `3` | 最大重试次数 |

**调整建议**:
- **慢网络**: 增加timeout到60000（60秒）
- **不稳定网络**: 增加max_retries到5
- **高负载Kibana**: 增加timeout和retries

---

## 🔒 安全最佳实践

### 1. 开发环境
```yaml
认证: Basic Auth
TLS: 禁用验证（disable_tls: true）
连接: localhost
```

### 2. 测试环境
```yaml
认证: Basic Auth 或 API Key
TLS: 自签名证书 + CA验证
连接: 内网IP
```

### 3. 生产环境
```yaml
认证: API Key（细粒度权限）
TLS: 受信任CA签发证书
连接: HTTPS + 域名
超时: 增加到60000ms
重试: 增加到5次
```

### 4. 权限配置

**最小权限原则**:

**ES API Key权限**:
```json
{
  "cluster": ["monitor"],
  "indices": [{
    "names": ["logs-*", "metrics-*"],
    "privileges": ["read", "view_index_metadata"]
  }]
}
```

**Kibana用户权限**:
- 只读角色（viewer）
- 限定Space访问
- 禁止集群管理权限

---

## 📋 配置模板

### 本地开发（快速开始）
```json
{
  "name": "本地ES开发",
  "type": "elasticsearch",
  "config": {
    "es_url": "http://localhost:9200",
    "es_username": "",
    "es_password": "",
    "disable_tls": true
  }
}
```

### 生产环境（完整配置）
```json
{
  "name": "生产ES集群",
  "type": "elasticsearch",
  "config": {
    "es_url": "https://es.example.com:9200",
    "es_api_key": "your-api-key-here",
    "es_ca_cert": "/etc/ssl/certs/company-ca.pem"
  }
}
```

### Kibana多租户
```json
{
  "name": "Marketing团队Kibana",
  "type": "kibana",
  "config": {
    "kibana_url": "https://kibana.example.com:5601",
    "kibana_username": "marketing_user",
    "kibana_password": "secure_password",
    "kibana_space": "marketing",
    "kibana_timeout": 60000,
    "kibana_max_retries": 5
  }
}
```

---

## 🔍 故障排查

### 问题1：连接超时
**症状**: `Connection timeout after 30000ms`

**解决方案**:
1. 检查URL是否正确
2. 检查网络连通性：`curl -I http://localhost:9200`
3. 增加超时时间到60000
4. 检查防火墙设置

### 问题2：SSL证书验证失败
**症状**: `unable to verify the first certificate`

**解决方案**:
- **开发环境**: 勾选"禁用SSL证书验证"
- **生产环境**: 配置正确的CA证书路径
- **自签名证书**: 将证书添加到系统信任存储

### 问题3：认证失败
**症状**: `401 Unauthorized`

**解决方案**:
1. 验证用户名密码是否正确
2. 检查API Key是否有效：`curl -H "Authorization: ApiKey YOUR_KEY" http://localhost:9200`
3. 确认用户权限是否足够
4. 检查Cookie是否过期（Cookie认证）

### 问题4：Kibana Space不存在
**症状**: `Space "xxx" not found`

**解决方案**:
1. 在Kibana中创建对应Space
2. 或使用`default` Space
3. 确认Space ID拼写正确（区分大小写）

---

## 🛠️ 环境变量映射

创建MCP实例时，配置字段会映射为以下环境变量：

### Elasticsearch
| 配置字段 | 环境变量 |
|---------|---------|
| `es_url` | `ES_URL` |
| `es_username` | `ES_USERNAME` |
| `es_password` | `ES_PASSWORD` |
| `es_api_key` | `ES_API_KEY` |
| `es_ca_cert` | `ES_CA_CERT` |
| `disable_tls` | `NODE_TLS_REJECT_UNAUTHORIZED=0` |

### Kibana
| 配置字段 | 环境变量 |
|---------|---------|
| `kibana_url` | `KIBANA_URL` |
| `kibana_username` | `KIBANA_USERNAME` |
| `kibana_password` | `KIBANA_PASSWORD` |
| `kibana_cookies` | `KIBANA_COOKIES` |
| `kibana_space` | `KIBANA_DEFAULT_SPACE` |
| `kibana_ca_cert` | `KIBANA_CA_CERT` |
| `kibana_timeout` | `KIBANA_TIMEOUT` |
| `kibana_max_retries` | `KIBANA_MAX_RETRIES` |
| `disable_tls` | `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## 📚 参考文档

- [Elasticsearch Security API](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api.html)
- [Kibana Configuration](https://www.elastic.co/guide/en/kibana/current/settings.html)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [本项目网络配置指南](NETWORK_GUIDE.md)
- [MCP使用指南](MCP_USAGE_GUIDE.md)

