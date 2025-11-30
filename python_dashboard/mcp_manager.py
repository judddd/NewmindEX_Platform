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
CERTS_DIR = Path(__file__).parent / "certs"

# MCP镜像名称映射
# 自动检测系统架构
import platform
ARCH = "arm64" if platform.machine() in ["arm64", "aarch64"] else "amd64"

# 镜像优先级：先尝试不带架构后缀的版本，再尝试带架构后缀的版本
MCP_IMAGE_TEMPLATES = {
    "elasticsearch": [
        "newmind-mcp-elasticsearch:1.0.0",
        f"newmind-mcp-elasticsearch:1.0.0-{ARCH}",
        f"newmind-mcp-elasticsearch:0.3.0-{ARCH}",
    ],
    "kibana": [
        "newmind-mcp-kibana:1.0.0",
        f"newmind-mcp-kibana:1.0.0-{ARCH}",
        f"newmind-mcp-kibana:0.4.0-{ARCH}",
    ],
    "newflow": [
        "newmind-mcp-newflow:1.0.0",
        f"newmind-mcp-newflow:1.0.0-{ARCH}",
    ],
    "cmdb": [
        f"newmind-mcp-cmdb:0.1.0-{ARCH}",
        "newmind-mcp-cmdb:0.1.0",
    ],
}


def get_available_image(mcp_type: str) -> Optional[str]:
    """
    获取可用的MCP镜像名称
    
    按优先级尝试多个可能的镜像标签，返回第一个存在的镜像
    
    Args:
        mcp_type: MCP类型 (elasticsearch, kibana, newflow, cmdb)
        
    Returns:
        str: 可用的镜像名称，如果都不存在则返回None
    """
    if not docker_client:
        return None
        
    image_candidates = MCP_IMAGE_TEMPLATES.get(mcp_type, [])
    
    for image_name in image_candidates:
        try:
            docker_client.images.get(image_name)
            return image_name
        except NotFound:
            continue
    
    return None


def ensure_directories():
    """确保必要的目录存在"""
    MCP_LOGS_DIR.mkdir(exist_ok=True)
    CERTS_DIR.mkdir(exist_ok=True)


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
    
    # 获取可用的镜像名称
    image_name = get_available_image(mcp_type)
    if not image_name:
        print(f"❌ 未找到 {mcp_type} 类型的Docker镜像")
        print(f"   尝试的镜像: {', '.join(MCP_IMAGE_TEMPLATES.get(mcp_type, []))}")
        print(f"   请运行: scripts/build_mcp_images.sh")
        log_dashboard("ERROR", f"No Docker image found for {mcp_type}")
        return False
    
    print(f"✅ 使用镜像: {image_name}")
    
    # 构建环境变量
    environment = {
        "MCP_TRANSPORT": "http",
        "MCP_HTTP_PORT": "3000",  # 容器内部固定端口
        "MCP_HTTP_HOST": "0.0.0.0"
    }
    
    # 根据类型添加配置
    
    # 尝试查找ES网络名称
    elastic_net_name = None
    try:
        # 尝试通过es01容器查找网络
        es_container = docker_client.containers.get('es01')
        networks = es_container.attrs['NetworkSettings']['Networks']
        if networks:
            elastic_net_name = list(networks.keys())[0]
    except:
        # 降级：尝试标准名称
        try:
             docker_client.networks.get('deploy_newmind_elastic')
             elastic_net_name = 'deploy_newmind_elastic'
        except:
             pass

    if mcp_type == "elasticsearch":
        # MCP Docker模式配置
        es_url = config.get("es_url", "http://host.docker.internal:9200")
        
        if elastic_net_name:
            # 如果能连接到elastic网络，优先使用容器名
            if "localhost" in es_url:
                es_url = es_url.replace("localhost", "es01")
            elif "host.docker.internal" in es_url:
                es_url = es_url.replace("host.docker.internal", "es01")
        else:
            # 否则使用host.docker.internal访问宿主机映射端口
            if "localhost" in es_url:
                es_url = es_url.replace("localhost", "host.docker.internal")
                
        environment["ES_URL"] = es_url
        
        if config.get("es_api_key"):
            environment["ES_API_KEY"] = config["es_api_key"]
        else:
            environment["ES_USERNAME"] = config.get("es_username", "")
            environment["ES_PASSWORD"] = config.get("es_password", "")
        
        # 证书处理
        if config.get("node_tls_reject_unauthorized") == "0":
             environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("es_ca_cert"):
             environment["ES_CA_CERT"] = config["es_ca_cert"]
    
    elif mcp_type == "kibana":
        # MCP Docker模式配置
        kibana_url = config.get("kibana_url", "http://host.docker.internal:5601")
        
        if elastic_net_name:
            # 如果能连接到elastic网络，优先使用容器名
            if "localhost" in kibana_url:
                kibana_url = kibana_url.replace("localhost", "kibana")
            elif "host.docker.internal" in kibana_url:
                kibana_url = kibana_url.replace("host.docker.internal", "kibana")
        else:
            if "localhost" in kibana_url:
                kibana_url = kibana_url.replace("localhost", "host.docker.internal")
                
        environment["KIBANA_URL"] = kibana_url
        environment["KIBANA_DEFAULT_SPACE"] = config.get("kibana_space", "default")
        
        if config.get("kibana_cookies"):
            environment["KIBANA_COOKIES"] = config["kibana_cookies"]
        else:
            environment["KIBANA_USERNAME"] = config.get("kibana_username", "")
            environment["KIBANA_PASSWORD"] = config.get("kibana_password", "")
        
        if config.get("node_tls_reject_unauthorized") == "0":
            environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("kibana_ca_cert"):
            environment["KIBANA_CA_CERT"] = config["kibana_ca_cert"]
        
        if config.get("kibana_timeout"):
            environment["KIBANA_TIMEOUT"] = str(config["kibana_timeout"])
        if config.get("kibana_max_retries"):
            environment["KIBANA_MAX_RETRIES"] = str(config["kibana_max_retries"])
    
    elif mcp_type == "newflow":
        api_key = config.get("newflow_api_key") or ""
        # MCP Docker模式：localhost需要转换为host.docker.internal
        newflow_url = config.get("newflow_url", "http://host.docker.internal:5678")
        if "localhost" in newflow_url:
            newflow_url = newflow_url.replace("localhost", "host.docker.internal")
        
        # 确保URL包含 /api/v1 后缀（NewFlow MCP Server要求）
        if not newflow_url.endswith("/api/v1"):
            # 移除可能存在的尾部斜杠
            newflow_url = newflow_url.rstrip("/")
            newflow_url = f"{newflow_url}/api/v1"
        
        environment["NEWFLOW_API_URL"] = newflow_url
        environment["NEWFLOW_API_KEY"] = api_key
        if config.get("newflow_webhook_username"):
            environment["NEWFLOW_WEBHOOK_USERNAME"] = config["newflow_webhook_username"]
        if config.get("newflow_webhook_password"):
            environment["NEWFLOW_WEBHOOK_PASSWORD"] = config["newflow_webhook_password"]
        if config.get("node_tls_reject_unauthorized") == "0":
             environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
    
    elif mcp_type == "cmdb":
        # CMDB配置
        cmdb_domain = config.get("cmdb_domain", "")
        environment["CMDB_DOMAIN"] = cmdb_domain
        environment["CMDB_APP_ID"] = config.get("cmdb_app_id", "")
        environment["CMDB_APP_SECRET"] = config.get("cmdb_app_secret", "")
        
        # SSL验证配置
        verify_ssl = config.get("cmdb_verify_ssl", "true")
        if verify_ssl.lower() in ["false", "0", "no"]:
            environment["CMDB_VERIFY_SSL"] = "false"
            environment["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        else:
            environment["CMDB_VERIFY_SSL"] = "true"
    
    # 创建日志目录（用于容器日志挂载）
    container_log_dir = LOGS_DIR / "mcp_containers" / instance_id
    container_log_dir.mkdir(parents=True, exist_ok=True)

    # 准备挂载卷
    volumes = {
        str(container_log_dir): {'bind': '/var/log/mcp', 'mode': 'rw'}
    }

    # 检查并挂载证书目录
    instance_certs_dir = CERTS_DIR / instance_id
    if instance_certs_dir.exists() and any(instance_certs_dir.iterdir()):
        print(f"📂 挂载证书目录: {instance_certs_dir} -> /certs")
        volumes[str(instance_certs_dir)] = {'bind': '/certs', 'mode': 'ro'}
    
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
            # 挂载目录 (日志 + 证书)
            volumes=volumes,
            # 配置Docker日志驱动
            log_config={
                'type': 'json-file',
                'config': {
                    'max-size': '10m',
                    'max-file': '5',
                    'labels': f'mcp_instance={instance_id}'
                }
            },
            # 配置开机自启
            restart_policy={"Name": "unless-stopped"}
        )
        
        # 连接到docker-compose的elastic网络
        if elastic_net_name:
            try:
                compose_network = docker_client.networks.get(elastic_net_name)
                compose_network.connect(container)
                print(f"✓ 已连接到docker-compose网络: {elastic_net_name}")
                
                # 断开bridge网络（可选，保持bridge通常更安全，除非为了隔离）
                # try:
                #     bridge_network = docker_client.networks.get('bridge')
                #     bridge_network.disconnect(container)
                # except:
                #     pass
            except Exception as e:
                print(f"⚠️  连接到网络 {elastic_net_name} 失败: {e}")
        else:
            print("⚠️  docker-compose网络未找到，使用默认bridge网络")
            print("   注意：无法通过容器名访问ES/Kibana，将尝试使用host.docker.internal")
        
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
