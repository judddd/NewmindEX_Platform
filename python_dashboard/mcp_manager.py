"""
MCP管理器模块 - Docker模式
使用Docker容器管理MCP服务器实例
"""

import docker
from docker.errors import DockerException, NotFound, APIError
from pathlib import Path
from typing import Dict, Optional
import time

from database import update_instance, get_instance

try:
    from audit_logger import log_operation, log_audit, log_dashboard
except ImportError:
    # 如果audit_logger还未初始化，提供空函数
    def log_operation(*args, **kwargs): pass
    def log_audit(*args, **kwargs): pass
    def log_dashboard(*args, **kwargs): pass

# Docker客户端
try:
    docker_client = docker.from_env()
except DockerException as e:
    print(f"❌ 无法连接到Docker: {e}")
    docker_client = None

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
MCP_LOGS_DIR = Path(__file__).parent / "mcp_logs"
LOGS_DIR = PROJECT_ROOT / "logs"

# MCP镜像名称映射
MCP_IMAGES = {
    "elasticsearch": "newmind-mcp-elasticsearch:1.0.0",
    "kibana": "newmind-mcp-kibana:1.0.0",
    "newflow": "newmind-mcp-newflow:1.0.0",
}


def ensure_directories():
    """确保必要的目录存在"""
    MCP_LOGS_DIR.mkdir(exist_ok=True)


def get_container_name(instance_id: str) -> str:
    """生成容器名称"""
    return f"mcp-{instance_id}"


def start_mcp_server(instance_id: str) -> bool:
    """
    启动MCP服务器（Docker模式）
    
    Args:
        instance_id: MCP实例ID
        
    Returns:
        bool: 是否启动成功
    """
    log_operation("mcp_start_attempt", "system", {"instance_id": instance_id})
    
    if not docker_client:
        print("❌ Docker客户端未初始化")
        log_dashboard("ERROR", f"Docker client not initialized for {instance_id}")
        return False
    
    ensure_directories()
    
    # 获取实例配置
    instance = get_instance(instance_id)
    if not instance:
        print(f"实例不存在: {instance_id}")
        log_dashboard("ERROR", f"Instance not found: {instance_id}")
        return False
    
    mcp_type = instance['type']
    port = instance['port']
    config = instance['config']
    container_name = get_container_name(instance_id)
    
    # 获取镜像名称
    image_name = MCP_IMAGES.get(mcp_type)
    if not image_name:
        print(f"未知的MCP类型: {mcp_type}")
        return False
    
    # 检查镜像是否存在
    try:
        docker_client.images.get(image_name)
    except NotFound:
        print(f"❌ Docker镜像不存在: {image_name}")
        print(f"   请运行: scripts/build_mcp_images.sh")
        return False
    
    # 构建环境变量
    environment = {
        "MCP_TRANSPORT": "http",
        "MCP_HTTP_PORT": "3000",  # 容器内部固定端口
        "MCP_HTTP_HOST": "0.0.0.0"
    }
    
    # 根据类型添加配置
    if mcp_type == "elasticsearch":
        # 默认使用Docker内部服务名，自动转换localhost为es01
        es_url = config.get("es_url", "http://es01:9200")
        if "localhost" in es_url:
            es_url = es_url.replace("localhost:9200", "es01:9200")
            es_url = es_url.replace("localhost:9201", "es02:9200")
            es_url = es_url.replace("localhost:9202", "es03:9200")
        environment["ES_URL"] = es_url
        
        if config.get("es_api_key"):
            environment["ES_API_KEY"] = config["es_api_key"]
        else:
            environment["ES_USERNAME"] = config.get("es_username", "")
            environment["ES_PASSWORD"] = config.get("es_password", "")
        
        if config.get("disable_tls"):
            environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("es_ca_cert"):
            environment["ES_CA_CERT"] = config["es_ca_cert"]
    
    elif mcp_type == "kibana":
        # 默认使用Docker内部服务名，自动转换localhost为kibana
        kibana_url = config.get("kibana_url", "http://kibana:5601")
        if "localhost" in kibana_url:
            kibana_url = kibana_url.replace("localhost:5601", "kibana:5601")
        environment["KIBANA_URL"] = kibana_url
        environment["KIBANA_DEFAULT_SPACE"] = config.get("kibana_space", "default")
        
        if config.get("kibana_cookies"):
            environment["KIBANA_COOKIES"] = config["kibana_cookies"]
        else:
            environment["KIBANA_USERNAME"] = config.get("kibana_username", "")
            environment["KIBANA_PASSWORD"] = config.get("kibana_password", "")
        
        if config.get("disable_tls"):
            environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("kibana_ca_cert"):
            environment["KIBANA_CA_CERT"] = config["kibana_ca_cert"]
        
        if config.get("kibana_timeout"):
            environment["KIBANA_TIMEOUT"] = str(config["kibana_timeout"])
        if config.get("kibana_max_retries"):
            environment["KIBANA_MAX_RETRIES"] = str(config["kibana_max_retries"])
    
    elif mcp_type == "newflow":
        api_key = config.get("newflow_api_key") or ""
        # 默认使用Docker内部服务名，自动转换localhost为newflow
        newflow_url = config.get("newflow_url", "http://newflow:5677")
        if "localhost" in newflow_url:
            newflow_url = newflow_url.replace("localhost:5677", "newflow:5677")
        
        # 确保URL包含 /api/v1 后缀（NewFlow MCP Server要求）
        if not newflow_url.endswith("/api/v1"):
            # 移除可能存在的尾部斜杠
            newflow_url = newflow_url.rstrip("/")
            newflow_url = f"{newflow_url}/api/v1"
        
        environment["NEWFLOW_API_URL"] = newflow_url
        environment["NEWFLOW_API_KEY"] = api_key
    
    # 创建日志目录（用于容器日志挂载）
    container_log_dir = LOGS_DIR / "mcp_containers" / instance_id
    container_log_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # 删除已存在的同名容器
        try:
            old_container = docker_client.containers.get(container_name)
            print(f"⚠️  删除旧容器: {container_name}")
            log_dashboard("INFO", f"Removing old container: {container_name}")
            old_container.remove(force=True)
        except NotFound:
            pass
        
        # 创建并启动容器
        print(f"🚀 启动容器: {container_name}")
        
        # 先用默认网络创建容器，然后连接到正确的网络
        container = docker_client.containers.run(
            image=image_name,
            name=container_name,
            environment=environment,
            ports={'3000/tcp': port},  # 容器内3000映射到主机port
            detach=True,
            remove=False,
            network='bridge',  # 先用默认网络创建
            extra_hosts={'host.docker.internal': 'host-gateway'},
            # 挂载日志目录
            volumes={
                str(container_log_dir): {'bind': '/var/log/mcp', 'mode': 'rw'}
            },
            # 配置Docker日志驱动
            log_config={
                'type': 'json-file',
                'config': {
                    'max-size': '10m',
                    'max-file': '5',
                    'labels': f'mcp_instance={instance_id}'
                }
            }
        )
        
        # 连接到docker-compose的elastic网络
        try:
            compose_network = docker_client.networks.get('deploy_newmind_elastic')
            compose_network.connect(container)
            print(f"✓ 已连接到docker-compose网络: deploy_newmind_elastic")
            
            # 断开bridge网络（可选）
            try:
                bridge_network = docker_client.networks.get('bridge')
                bridge_network.disconnect(container)
            except:
                pass
        except NotFound:
            print("⚠️  docker-compose网络不存在，使用默认bridge网络")
            print("   提示：请先启动docker-compose服务")
        
        # 等待容器启动
        print(f"⏳ 等待容器启动...")
        time.sleep(3)
        
        # 健康检查
        import httpx
        health_url = f"http://localhost:{port}/health"
        max_retries = 5
        
        for i in range(max_retries):
            try:
                response = httpx.get(health_url, timeout=2.0)
                if response.status_code == 200:
                    print(f"✓ MCP服务器健康检查通过")
                    break
            except:
                if i < max_retries - 1:
                    print(f"  等待服务响应... ({i+1}/{max_retries})")
                    time.sleep(2)
                else:
                    print(f"❌ MCP服务器启动失败，健康检查超时")
                    container.remove(force=True)
                    return False
        
        # 更新数据库状态
        update_instance(instance_id, {
            "status": "running",
            "pid": None  # Docker模式不使用PID
        })
        
        print(f"✅ MCP服务器启动成功: {instance_id}")
        print(f"  容器ID: {container.short_id}")
        print(f"  端口: {port}")
        print(f"  端点: http://localhost:{port}/mcp")
        print(f"  健康检查: {health_url}")
        
        log_operation("mcp_start_success", "system", {
            "instance_id": instance_id,
            "container_name": container_name,
            "port": port,
            "type": mcp_type
        })
        log_audit("MCP_START", f"MCP instance started: {instance.get('name')}", {
            "instance_id": instance_id,
            "type": mcp_type
        })
        
        return True
        
    except APIError as e:
        print(f"❌ Docker API错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 启动MCP服务器失败: {e}")
        import traceback
        traceback.print_exc()
        
        log_operation("mcp_start_failed", "system", {
            "instance_id": instance_id,
            "error": str(e)
        })
        log_dashboard("ERROR", f"Failed to start MCP {instance_id}: {e}")
        
        return False


def stop_mcp_server(instance_id: str) -> bool:
    """
    停止MCP服务器（Docker模式）
    
    Args:
        instance_id: MCP实例ID
        
    Returns:
        bool: 是否停止成功
    """
    log_operation("mcp_stop_attempt", "system", {"instance_id": instance_id})
    
    if not docker_client:
        print("❌ Docker客户端未初始化")
        log_dashboard("ERROR", f"Docker client not initialized for stop {instance_id}")
        return False
    
    container_name = get_container_name(instance_id)
    
    try:
        container = docker_client.containers.get(container_name)
        
        print(f"🛑 停止容器: {container_name}")
        container.stop(timeout=10)
        
        print(f"🗑️  删除容器: {container_name}")
        container.remove()
        
        # 更新数据库状态
        update_instance(instance_id, {"status": "stopped", "pid": None})
        
        print(f"✅ MCP服务器已停止: {instance_id}")
        
        log_operation("mcp_stop_success", "system", {"instance_id": instance_id})
        log_audit("MCP_STOP", f"MCP instance stopped", {"instance_id": instance_id})
        
        return True
        
    except NotFound:
        print(f"⚠️  容器不存在: {container_name}")
        # 更新状态为stopped
        update_instance(instance_id, {"status": "stopped", "pid": None})
        return True
        
    except APIError as e:
        print(f"❌ Docker API错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 停止MCP服务器失败: {e}")
        import traceback
        traceback.print_exc()
        
        log_operation("mcp_stop_failed", "system", {
            "instance_id": instance_id,
            "error": str(e)
        })
        log_dashboard("ERROR", f"Failed to stop MCP {instance_id}: {e}")
        
        return False


def get_mcp_logs(instance_id: str, lines: int = 100) -> str:
    """
    获取MCP服务器日志（Docker模式）
    
    Args:
        instance_id: MCP实例ID
        lines: 返回最后N行
        
    Returns:
        str: 日志内容
    """
    if not docker_client:
        return "Docker客户端未初始化"
    
    container_name = get_container_name(instance_id)
    
    try:
        container = docker_client.containers.get(container_name)
        logs = container.logs(tail=lines).decode('utf-8', errors='replace')
        return logs
    except NotFound:
        return f"容器不存在: {container_name}"
    except Exception as e:
        return f"读取日志失败: {e}"


def check_mcp_health(instance_id: str) -> bool:
    """
    检查MCP服务器健康状态（Docker模式）
    优先通过Docker容器状态，其次HTTP健康检查
    """
    if not docker_client:
        return False
    
    container_name = get_container_name(instance_id)
    
    # 1) 检查容器是否存在且运行中
    try:
        container = docker_client.containers.get(container_name)
        if container.status != 'running':
            return False
    except NotFound:
        # 容器不存在，尝试HTTP健康检查（可能是外部实例）
        pass
    except Exception:
        return False
    
    # 2) HTTP健康检查
    instance = get_instance(instance_id)
    if not instance:
        return False
    
    try:
        import httpx
        health_url = instance.get('health_endpoint')
        if not health_url:
            endpoint = instance.get('endpoint')
            if endpoint and endpoint.endswith('/mcp'):
                health_url = endpoint[:-4] + 'health'
            elif instance.get('port'):
                health_url = f"http://localhost:{instance['port']}/health"
        
        if health_url:
            resp = httpx.get(health_url, timeout=2.0)
            return resp.status_code == 200
    except Exception:
        pass
    
    return False


def list_mcp_containers() -> list:
    """
    列出所有MCP容器
    
    Returns:
        list: 容器信息列表
    """
    if not docker_client:
        return []
    
    try:
        containers = docker_client.containers.list(
            all=True,
            filters={'name': 'mcp-'}
        )
        
        result = []
        for container in containers:
            result.append({
                'name': container.name,
                'id': container.short_id,
                'status': container.status,
                'image': container.image.tags[0] if container.image.tags else 'unknown',
                'ports': container.ports
            })
        return result
    except Exception as e:
        print(f"列出容器失败: {e}")
        return []

