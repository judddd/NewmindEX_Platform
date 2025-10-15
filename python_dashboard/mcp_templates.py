"""
MCP模板预设
提供常用的MCP配置模板
"""

MCP_TEMPLATES = {
    "local_es_cluster": {
        "name": "本地ES集群（主机访问）",
        "type": "elasticsearch",
        "description": "通过localhost:9200访问Docker ES集群（推荐）",
        "config": {
            "es_url": "http://localhost:9200",
            "es_username": "elastic",
            "es_password": "changeme123"
        }
    },
    "local_es_docker_ip": {
        "name": "本地ES集群（Docker IP）",
        "type": "elasticsearch",
        "description": "通过Docker容器IP直接访问ES（备用方案）",
        "config": {
            "es_url": "http://172.18.0.2:9200",
            "es_username": "elastic",
            "es_password": "changeme123"
        }
    },
    "local_kibana": {
        "name": "本地Kibana（主机访问）",
        "type": "kibana",
        "description": "通过localhost:5601访问Docker Kibana（推荐）",
        "config": {
            "kibana_url": "http://localhost:5601",
            "kibana_username": "elastic",
            "kibana_password": "changeme123",
            "kibana_space": "default"
        }
    },
    "local_kibana_docker_ip": {
        "name": "本地Kibana（Docker IP）",
        "type": "kibana",
        "description": "通过Docker容器IP直接访问Kibana（备用方案）",
        "config": {
            "kibana_url": "http://172.18.0.5:5601",
            "kibana_username": "elastic",
            "kibana_password": "changeme123",
            "kibana_space": "default"
        }
    },
    "local_newflow": {
        "name": "本地NewFlow",
        "type": "newflow",
        "description": "连接到本地NewFlow服务",
        "config": {
            "newflow_url": "http://localhost:5677",
            "newflow_api_key": ""
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


def generate_newmindchat_config(mcp_instances: list) -> dict:
    """
    生成NewMindChat配置
    
    Args:
        mcp_instances: MCP实例列表
        
    Returns:
        dict: NewMindChat配置格式
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

