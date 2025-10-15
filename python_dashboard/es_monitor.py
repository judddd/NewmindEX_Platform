"""
Elasticsearch监控模块
提供ES集群健康、节点状态、ML功能检查等
"""

import httpx
from typing import Dict, Optional


async def get_cluster_health(es_url: str = "http://localhost:9200", 
                             username: str = "elastic",
                             password: str = "changeme123") -> Optional[Dict]:
    """获取ES集群健康状态"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{es_url}/_cluster/health",
                auth=(username, password),
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"获取集群健康状态失败: {e}")
    return None


async def get_nodes_info(es_url: str = "http://localhost:9200",
                        username: str = "elastic", 
                        password: str = "changeme123") -> Optional[Dict]:
    """获取节点信息"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{es_url}/_cat/nodes?v&format=json",
                auth=(username, password),
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"获取节点信息失败: {e}")
    return None


async def get_ml_status(es_url: str = "http://localhost:9200",
                       username: str = "elastic",
                       password: str = "changeme123") -> Optional[Dict]:
    """获取ML功能状态"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{es_url}/_ml/info",
                auth=(username, password),
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"获取ML状态失败: {e}")
    return None


async def check_license(es_url: str = "http://localhost:9200",
                       username: str = "elastic",
                       password: str = "changeme123") -> Optional[Dict]:
    """检查许可证状态"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{es_url}/_license",
                auth=(username, password),
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"检查许可证失败: {e}")
    return None

