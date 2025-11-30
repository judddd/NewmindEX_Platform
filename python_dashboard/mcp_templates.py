"""
MCP模板预设
提供常用的MCP配置模板
"""

MCP_TEMPLATES = {
    "elasticsearch": {
        "name": "Elasticsearch 集群",
        "type": "elasticsearch",
        "description": "连接到 Elasticsearch 集群 (本地或远程)",
        "config": {
            "ES_URL": "http://host.docker.internal:9200",
            "ES_USERNAME": "elastic",
            "ES_PASSWORD": "changeme123",
            "MAX_TOKEN_CALL": "8000",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "kibana": {
        "name": "Kibana 服务",
        "type": "kibana",
        "description": "连接到 Kibana 服务 (本地或远程)",
        "config": {
            "KIBANA_URL": "http://host.docker.internal:5601",
            "KIBANA_USERNAME": "elastic",
            "KIBANA_PASSWORD": "changeme123",
            "KIBANA_DEFAULT_SPACE": "default",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "newflow": {
        "name": "NewFlow 工作流",
        "type": "newflow",
        "description": "连接到 NewFlow 工作流引擎",
        "config": {
            "NEWFLOW_API_URL": "http://host.docker.internal:5678/api/v1",
            "NEWFLOW_API_KEY": "your_api_key_here",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "cmdb": {
        "name": "CMDB 配置管理",
        "type": "cmdb",
        "description": "连接到 CMDB 配置管理数据库",
        "config": {
            "CMDB_DOMAIN": "https://cmdb-service.example.com",
            "CMDB_APP_ID": "your_app_id",
            "CMDB_APP_SECRET": "your_app_secret",
            "CMDB_VERIFY_SSL": "true"
        }
    }
}


def get_template(template_id: str) -> dict:
    """获取指定模板"""
    return MCP_TEMPLATES.get(template_id, {})


def list_templates() -> dict:
    """列出所有模板"""
    return MCP_TEMPLATES


def generate_newchat_config(mcp_instances: list) -> dict:
    """
    生成NewChat配置 (标准 MCP streamable 模式)
    
    Args:
        mcp_instances: MCP实例列表
        
    Returns:
        dict: NewChat配置格式
    """
    config = {"mcpServers": {}}
    
    for instance in mcp_instances:
        # 生成服务器键名
        server_key = instance["id"].replace("mcp-", "").replace("-", "_")
        
        config["mcpServers"][server_key] = {
            "transport": "streamable",
            "enabled": True,
            "url": instance["endpoint"],
            "name": instance["name"]
        }
    
    return config
