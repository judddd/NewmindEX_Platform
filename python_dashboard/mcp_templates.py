"""
MCP模板预设
提供常用的MCP配置模板
"""

MCP_TEMPLATES = {
    "elasticsearch": {
        "name": "Elasticsearch Cluster",
        "type": "elasticsearch",
        "description": "Connect to Elasticsearch Cluster (Local or Remote)",
        "config": {
            "ES_URL": "http://host.docker.internal:9200",
            "ES_USERNAME": "elastic",
            "ES_PASSWORD": "changeme123",
            "ES_CA_CERT": "",
            "MAX_TOKEN_CALL": "8000",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "kibana": {
        "name": "Kibana Service",
        "type": "kibana",
        "description": "Connect to Kibana Service (Local or Remote)",
        "config": {
            "KIBANA_URL": "http://host.docker.internal:5601",
            "KIBANA_USERNAME": "elastic",
            "KIBANA_PASSWORD": "changeme123",
            "KIBANA_DEFAULT_SPACE": "default",
            "KIBANA_CA_CERT": "",
            "KIBANA_TIMEOUT": "30000",
            "KIBANA_MAX_RETRIES": "3",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "newflow": {
        "name": "NewFlow Workflow",
        "type": "newflow",
        "description": "Connect to NewFlow Workflow Engine",
        "config": {
            "NEWFLOW_API_URL": "http://host.docker.internal:5678/api/v1",
            "NEWFLOW_API_KEY": "your_api_key_here",
            "NEWFLOW_WEBHOOK_USERNAME": "username",
            "NEWFLOW_WEBHOOK_PASSWORD": "password",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "cmdb": {
        "name": "CMDB Service",
        "type": "cmdb",
        "description": "Connect to CMDB Configuration Database",
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
    生成 NewChat 兼容的配置
    """
    config = {"mcpServers": {}}
    
    for instance in mcp_instances:
        # 优先使用实例名称作为 key (如果名称是英文且无空格，或者进行 slugify)
        if all(ord(c) < 128 for c in instance["name"]):
            server_key = instance["name"].replace(" ", "_").lower()
        else:
            server_key = instance["id"].replace("mcp-", "").replace("-", "_")
        
        config["mcpServers"][server_key] = {
            "transport": "streamable",
            "enabled": True,
            "url": instance["endpoint"],
            "name": instance["name"]
        }
    
    return config


def generate_claude_config(mcp_instances: list) -> dict:
    """
    生成 Claude Desktop 兼容的配置 (HTTP/SSE 模式)
    """
    config = {"mcpServers": {}}
    
    for instance in mcp_instances:
        # 优先使用实例名称作为 key (如果名称是英文且无空格，或者进行 slugify)
        if all(ord(c) < 128 for c in instance["name"]):
            server_key = instance["name"].replace(" ", "_").lower()
        else:
            server_key = instance["id"].replace("mcp-", "").replace("-", "_")
            
        # Claude Desktop 支持简单的 url 配置用于 SSE
        config["mcpServers"][server_key] = {
            "url": instance["endpoint"]
        }
    
    return config
