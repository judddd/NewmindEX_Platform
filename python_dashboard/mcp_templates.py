"""
MCP模板预设
提供常用的MCP配置模板
"""

MCP_TEMPLATES = {
    "local_es_cluster": {
        "name": "本地ES集群（Docker内部）",
        "type": "elasticsearch",
        "description": "MCP容器通过Docker服务名访问ES（推荐）",
        "config": {
            "es_url": "http://es01:9200",
            "es_username": "elastic",
            "es_password": "changeme123"
        }
    },
    "local_es_host": {
        "name": "本地ES集群（主机访问）",
        "type": "elasticsearch",
        "description": "通过localhost访问ES（会自动转换为es01）",
        "config": {
            "es_url": "http://localhost:9200",
            "es_username": "elastic",
            "es_password": "changeme123"
        }
    },
    "local_kibana": {
        "name": "本地Kibana（Docker内部）",
        "type": "kibana",
        "description": "MCP容器通过Docker服务名访问Kibana（推荐）",
        "config": {
            "kibana_url": "http://kibana:5601",
            "kibana_username": "elastic",
            "kibana_password": "changeme123",
            "kibana_space": "default"
        }
    },
    "local_kibana_host": {
        "name": "本地Kibana（主机访问）",
        "type": "kibana",
        "description": "通过localhost访问Kibana（会自动转换为kibana）",
        "config": {
            "kibana_url": "http://localhost:5601",
            "kibana_username": "elastic",
            "kibana_password": "changeme123",
            "kibana_space": "default"
        }
    },
    "local_newflow": {
        "name": "本地NewFlow（Docker内部）",
        "type": "newflow",
        "description": "MCP容器通过Docker服务名访问NewFlow（推荐）",
        "config": {
            "newflow_url": "http://newflow:5677/api/v1",
            "newflow_api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTg3YzdkOS1kYTk2LTQ3NDMtOGEwOS0wYzBhMWI5YWRiZjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMzc4OTYwfQ.AeMI20moNigjQwcMTi8FRaaOgupTuZ3Apso3jNyQg5Q"
        }
    },
    "local_newflow_host": {
        "name": "本地NewFlow（主机访问）",
        "type": "newflow",
        "description": "通过localhost访问NewFlow（会自动转换为newflow）",
        "config": {
            "newflow_url": "http://localhost:5677",
            "newflow_api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTg3YzdkOS1kYTk2LTQ3NDMtOGEwOS0wYzBhMWI5YWRiZjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMzc4OTYwfQ.AeMI20moNigjQwcMTi8FRaaOgupTuZ3Apso3jNyQg5Q"
        }
    },
    "remote_es": {
        "name": "远程ES集群",
        "type": "elasticsearch",
        "description": "连接到远程Elasticsearch集群",
        "config": {
            "es_url": "https://your-es-cluster.example.com:9200",
            "es_username": "elastic",
            "es_password": ""
        }
    },
    "production_kibana": {
        "name": "生产环境Kibana",
        "type": "kibana",
        "description": "连接到生产环境Kibana",
        "config": {
            "kibana_url": "https://your-kibana.example.com:5601",
            "kibana_username": "elastic",
            "kibana_password": "",
            "kibana_space": "default"
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

