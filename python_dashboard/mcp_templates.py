"""
MCP模板预设
提供常用的MCP配置模板
"""

MCP_TEMPLATES = {
    "local_es_cluster": {
        "name": "本地ES集群（推荐）",
        "type": "elasticsearch",
        "description": "MCP Docker容器通过host.docker.internal访问宿主机ES",
        "config": {
            "ES_URL": "http://host.docker.internal:9200",
            "ES_USERNAME": "elastic",
            "ES_PASSWORD": "changeme123",
            "MAX_TOKEN_CALL": "8000",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "local_es_localhost": {
        "name": "本地ES集群（localhost）",
        "type": "elasticsearch",
        "description": "适用于MCP Node模式或测试环境",
        "config": {
            "ES_URL": "http://localhost:9200",
            "ES_USERNAME": "elastic",
            "ES_PASSWORD": "changeme123",
            "MAX_TOKEN_CALL": "8000",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "local_kibana": {
        "name": "本地Kibana（推荐）",
        "type": "kibana",
        "description": "MCP Docker容器通过host.docker.internal访问宿主机Kibana",
        "config": {
            "KIBANA_URL": "http://host.docker.internal:5601",
            "KIBANA_USERNAME": "elastic",
            "KIBANA_PASSWORD": "changeme123",
            "KIBANA_DEFAULT_SPACE": "default",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "local_kibana_localhost": {
        "name": "本地Kibana（localhost）",
        "type": "kibana",
        "description": "适用于MCP Node模式或测试环境",
        "config": {
            "KIBANA_URL": "http://localhost:5601",
            "KIBANA_USERNAME": "elastic",
            "KIBANA_PASSWORD": "changeme123",
            "KIBANA_DEFAULT_SPACE": "default",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "local_newflow": {
        "name": "本地NewFlow（推荐）",
        "type": "newflow",
        "description": "MCP Docker容器通过host.docker.internal访问宿主机NewFlow",
        "config": {
            "NEWFLOW_API_URL": "http://host.docker.internal:5678/api/v1",
            "NEWFLOW_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTg3YzdkOS1kYTk2LTQ3NDMtOGEwOS0wYzBhMWI5YWRiZjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMzc4OTYwfQ.AeMI20moNigjQwcMTi8FRaaOgupTuZ3Apso3jNyQg5Q",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "local_newflow_localhost": {
        "name": "本地NewFlow（localhost）",
        "type": "newflow",
        "description": "适用于MCP Node模式或测试环境",
        "config": {
            "NEWFLOW_API_URL": "http://localhost:5678/api/v1",
            "NEWFLOW_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTg3YzdkOS1kYTk2LTQ3NDMtOGEwOS0wYzBhMWI5YWRiZjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMzc4OTYwfQ.AeMI20moNigjQwcMTi8FRaaOgupTuZ3Apso3jNyQg5Q",
            "NODE_TLS_REJECT_UNAUTHORIZED": "0"
        }
    },
    "remote_es": {
        "name": "远程ES集群",
        "type": "elasticsearch",
        "description": "连接到远程Elasticsearch集群",
        "config": {
            "ES_URL": "https://your-es-cluster.example.com:9200",
            "ES_USERNAME": "elastic",
            "ES_PASSWORD": "",
            "MAX_TOKEN_CALL": "8000"
        }
    },
    "production_kibana": {
        "name": "生产环境Kibana",
        "type": "kibana",
        "description": "连接到生产环境Kibana",
        "config": {
            "KIBANA_URL": "https://your-kibana.example.com:5601",
            "KIBANA_USERNAME": "elastic",
            "KIBANA_PASSWORD": "",
            "KIBANA_DEFAULT_SPACE": "default"
        }
    },
    "local_cmdb": {
        "name": "本地CMDB（推荐）",
        "type": "cmdb",
        "description": "MCP Docker容器连接CMDB配置管理数据库",
        "config": {
            "CMDB_DOMAIN": "https://cmdb-service.example.com",
            "CMDB_APP_ID": "",
            "CMDB_APP_SECRET": "",
            "CMDB_VERIFY_SSL": "true"
        }
    },
    "production_cmdb": {
        "name": "生产环境CMDB",
        "type": "cmdb",
        "description": "连接到生产环境CMDB",
        "config": {
            "CMDB_DOMAIN": "https://cmdb-service.example.com",
            "CMDB_APP_ID": "",
            "CMDB_APP_SECRET": "",
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
    生成NewChat配置
    
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

