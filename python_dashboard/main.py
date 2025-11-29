"""
NewmindEx AI Platform Management Dashboard
FastAPI主应用 - 提供管理API和Web界面
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import asyncio
import os
import socket
import httpx

# 加载环境变量 (使用标准方式)
from pathlib import Path

# 优先使用 .env 文件，其次使用 env.copy（兼容旧配置）
env_file = Path(__file__).parent.parent / ".env"
if not env_file.exists():
    env_file = Path(__file__).parent.parent / "env.copy"

if env_file.exists():
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                # 去掉值中的行内注释
                if '#' in value:
                    value = value.split('#')[0].strip()
                # 只在环境变量不存在时设置（避免覆盖系统环境变量）
                if key not in os.environ:
                    os.environ[key] = value

# 导入模块
from database import (
    init_db, get_all_instances, get_instance, create_instance,
    update_instance, delete_instance, get_next_available_port
)
from mcp_manager import (
    start_mcp_server, stop_mcp_server, get_mcp_logs, check_mcp_health
)
from es_monitor import (
    get_cluster_health, get_nodes_info, get_ml_status, check_license
)
from lmstudio_manager import (
    get_lm_status, get_lm_models, download_model, start_lm_server, stop_lm_server
)
from newrag_manager import (
    start_newrag, stop_newrag, check_newrag_status, install_newrag
)
from newflow_manager import (
    start_newflow, stop_newflow, check_newflow_status
)
from mcp_templates import list_templates, get_template, generate_newchat_config
from audit_logger import (
    setup_loggers, log_operation, log_audit, log_mcp_call, log_dashboard,
    get_operation_logs, get_mcp_call_logs, get_audit_logs, get_dashboard_logs
)

# 初始化数据库
init_db()

# 初始化日志系统
setup_loggers()
log_audit("SYSTEM_INIT", "Dashboard initializing", {"version": "1.0.0"})

# 创建FastAPI应用
app = FastAPI(
    title="NewmindEx AI Platform Dashboard",
    description="管理ELK、LM Studio、NewFlow和MCP服务器",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求日志中间件
import time
from starlette.requests import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录API请求日志"""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # 记录MCP相关API调用
    if request.url.path.startswith("/api/mcp"):
        log_operation(
            action="API_CALL",
            user="system",
            details={
                "method": request.method,
                "path": request.url.path,
                "duration": f"{duration:.3f}s",
                "status": response.status_code
            }
        )
    
    return response

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")


# ==================== 启动事件 ====================

@app.on_event("startup")
async def startup_event():
    """应用启动时执行的任务"""
    print("🚀 NewmindEx AI Platform Dashboard 启动中...")
    log_audit("SYSTEM_START", "Dashboard started", {"version": "1.0.0"})
    
    # 等待 Docker 服务启动
    print("⏳ 等待 Docker 服务...")
    await asyncio.sleep(5)
    
    # 自动重启所有之前运行的MCP实例
    print("🔄 检查并重启MCP实例...")
    instances = get_all_instances()
    restarted_count = 0
    for instance in instances:
        # 检查容器是否存在
        is_healthy = check_mcp_health(instance['id'])
        
        # 如果实例标记为running但容器不健康，尝试重启
        if instance.get('status') == 'running' and not is_healthy:
            print(f"  • 重启MCP实例: {instance['name']} ({instance['id']})")
            success = start_mcp_server(instance['id'])
            if success:
                restarted_count += 1
                print(f"    ✅ 已重启")
            else:
                print(f"    ⚠️  重启失败")
    
    if restarted_count > 0:
        print(f"✅ 成功重启 {restarted_count} 个MCP实例")
    else:
        print("ℹ️  无需重启MCP实例")
    
    print("🎉 Dashboard 启动完成！")


# ==================== Pydantic模型 ====================

class MCPInstanceCreate(BaseModel):
    name: str
    type: str  # elasticsearch, kibana, newflow, cmdb
    config: Dict
    port: Optional[int] = None


class MCPInstanceUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict] = None
    port: Optional[int] = None


class ModelDownload(BaseModel):
    model_name: str
    variant: str = "mlx"


class LMServerStart(BaseModel):
    model_name: str
    port: int = 1234


# ==================== 工具函数 ====================

async def check_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """检查端口是否开放"""
    try:
        # 创建socket连接测试端口
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


# ==================== 基础服务管理API ====================

@app.get("/")
async def read_root():
    """主页"""
    return FileResponse("static/index.html")


@app.get("/api/status")
async def get_status():
    """所有服务状态总览"""
    # 加载环境变量
    es_password = os.getenv("ELASTIC_PASSWORD", "changeme123")
    
    # 检查ES - 通过Docker检查实际状态
    es_status_result = await get_docker_service_status('elasticsearch')
    es_running = es_status_result.get('status') == 'running'
    
    # 如果ES运行中，获取健康状态
    es_health = None
    if es_running:
        es_health = await get_cluster_health(password=es_password)
    
    # 检查Kibana - 通过Docker检查实际状态
    kibana_status_result = await get_docker_service_status('kibana')
    kibana_running = kibana_status_result.get('status') == 'running'
    
    # 检查NewFlow - 检查本地端口 (优先使用127.0.0.1避免localhost解析问题)
    newflow_port = int(os.getenv('NEWFLOW_PORT', '5678'))
    # 1. 检查进程 PID (最准确)
    newflow_process_running, _ = check_newflow_status()
    # 2. 检查端口
    newflow_port_open = await check_port_open('127.0.0.1', newflow_port)
    if not newflow_port_open:
        newflow_port_open = await check_port_open('localhost', newflow_port)
    
    # 综合判断：只有两者都为真才算运行中？不，只要有一个为真可能就是残留
    # 但为了状态显示准确，我们偏向于：如果PID在，或者端口在，都算运行中
    # 除非 stop 操作刚刚执行完，可能有一点延迟
    newflow_running = newflow_process_running or newflow_port_open
    
    # 检查LM Studio
    lm_status = await get_lm_status()
    
    # 检查NewChat - 通过端口 61990
    newchat_running = await check_port_open('localhost', 61990)
    
    # 检查NewRAG - 同时检查进程和端口
    # 检查 3000 (Frontend) 或 8080 (Backend)
    newrag_process, _ = check_newrag_status()
    newrag_port_open = await check_port_open('127.0.0.1', 3000) or await check_port_open('localhost', 3000) or await check_port_open('127.0.0.1', 8080) or await check_port_open('localhost', 8080)
    newrag_running = newrag_process and newrag_port_open
    
    # 检查MinIO - 通过Docker检查实际状态
    minio_status_result = await get_docker_service_status('minio')
    minio_running = minio_status_result.get('status') == 'running'
    
    # 检查MCP实例
    mcp_instances = get_all_instances()
    for instance in mcp_instances:
        instance['is_healthy'] = check_mcp_health(instance['id'])
    
    return {
        "elasticsearch": {
            "status": "running" if es_running else "stopped",
            "health": es_health
        },
        "kibana": {
            "status": "running" if kibana_running else "stopped",
            "url": f"http://localhost:{os.getenv('KIBANA_PORT', '5601')}"
        },
        "lmstudio": {
            "status": "running" if lm_status else "stopped",
            "port": int(os.getenv('LMSTUDIO_PORT', '1234'))
        },
        "newchat": {
            "status": "running" if newchat_running else "stopped",
            "port": 61990
        },
        "newrag": {
            "status": "running" if newrag_running else "stopped",
            "url": "http://localhost:3000"
        },
        "newflow": {
            "status": "running" if newflow_running else "stopped",
            "url": f"http://localhost:{os.getenv('NEWFLOW_PORT', '5678')}"
        },
        "minio": {
            "status": "running" if minio_running else "stopped",
            "api_url": f"http://localhost:{os.getenv('MINIO_API_PORT', '9000')}",
            "console_url": f"http://localhost:{os.getenv('MINIO_CONSOLE_PORT', '9001')}"
        },
        "mcp_servers": {
            "total": len(mcp_instances),
            "running": sum(1 for i in mcp_instances if i.get('is_healthy')),
            "instances": mcp_instances
        }
    }


# ==================== Elasticsearch API ====================

@app.get("/api/es/health")
async def es_health():
    """ES集群健康"""
    es_password = os.getenv("ELASTIC_PASSWORD", "changeme123")
    health = await get_cluster_health(password=es_password)
    if not health:
        raise HTTPException(status_code=503, detail="无法连接到Elasticsearch")
    return health


@app.get("/api/es/nodes")
async def es_nodes():
    """ES节点信息"""
    es_password = os.getenv("ELASTIC_PASSWORD", "changeme123")
    nodes = await get_nodes_info(password=es_password)
    if not nodes:
        raise HTTPException(status_code=503, detail="无法获取节点信息")
    return nodes


@app.get("/api/es/ml")
async def es_ml():
    """ES ML功能状态"""
    es_password = os.getenv("ELASTIC_PASSWORD", "changeme123")
    ml_info = await get_ml_status(password=es_password)
    if not ml_info:
        raise HTTPException(status_code=503, detail="无法获取ML状态")
    return ml_info


@app.get("/api/es/license")
async def es_license():
    """ES许可证状态"""
    es_password = os.getenv("ELASTIC_PASSWORD", "changeme123")
    license_info = await check_license(password=es_password)
    if not license_info:
        raise HTTPException(status_code=503, detail="无法获取许可证信息")
    return license_info


# ==================== LM Studio API ====================

@app.get("/api/lmstudio/status")
async def lmstudio_status():
    """LM Studio状态"""
    is_running = await get_lm_status()
    models = None
    if is_running:
        models = await get_lm_models()
    
    return {
        "status": "running" if is_running else "stopped",
        "port": int(os.getenv('LMSTUDIO_PORT', '1234')),
        "models": models
    }


@app.post("/api/lmstudio/download")
async def lmstudio_download(data: ModelDownload):
    """下载模型"""
    success = download_model(data.model_name, data.variant)
    if success:
        return {"message": "模型下载启动", "model": data.model_name}
    raise HTTPException(status_code=500, detail="启动下载失败")


@app.post("/api/lmstudio/start")
async def lmstudio_start(data: LMServerStart):
    """启动LM服务"""
    success = start_lm_server(data.model_name, data.port)
    if success:
        return {"message": "LM服务启动中", "model": data.model_name, "port": data.port}
    raise HTTPException(status_code=500, detail="启动失败")


@app.post("/api/lmstudio/stop")
async def lmstudio_stop():
    """停止LM服务"""
    success = stop_lm_server()
    if success:
        return {"message": "LM服务已停止"}
    raise HTTPException(status_code=500, detail="停止失败")

@app.post("/api/open-lmstudio")
async def open_lmstudio():
    """打开LM Studio应用"""
    import subprocess
    try:
        # macOS上使用open命令打开应用
        subprocess.Popen(['open', '-a', 'LM Studio'])
        return {"success": True, "message": "LM Studio应用已启动"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/open-newchat")
async def open_newchat():
    """打开NewChat应用"""
    import subprocess
    try:
        # macOS上使用open命令打开应用
        subprocess.Popen(['open', '-a', 'NewChat'])
        return {"success": True, "message": "NewChat应用已启动"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ==================== MinIO API ====================

@app.get("/api/minio/status")
async def minio_status():
    """MinIO状态"""
    status_result = await get_docker_service_status('minio')
    is_running = status_result.get('status') == 'running'
    
    minio_info = {
        "status": "running" if is_running else "stopped",
        "api_port": int(os.getenv('MINIO_API_PORT', '9000')),
        "console_port": int(os.getenv('MINIO_CONSOLE_PORT', '9001')),
        "api_url": f"http://localhost:{os.getenv('MINIO_API_PORT', '9000')}",
        "console_url": f"http://localhost:{os.getenv('MINIO_CONSOLE_PORT', '9001')}",
        "root_user": os.getenv('MINIO_ROOT_USER', 'minioadmin')
    }
    
    # 如果MinIO运行中，尝试获取存储信息
    if is_running:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # MinIO健康检查端点
                response = await client.get(f"http://localhost:{os.getenv('MINIO_API_PORT', '9000')}/minio/health/live")
                minio_info["health"] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            minio_info["health"] = "unknown"
    
    return minio_info


@app.post("/api/minio/open-console")
async def open_minio_console():
    """在浏览器中打开MinIO控制台"""
    import subprocess
    import webbrowser
    try:
        console_url = f"http://localhost:{os.getenv('MINIO_CONSOLE_PORT', '9001')}"
        # 尝试在默认浏览器中打开
        webbrowser.open(console_url)
        return {"success": True, "message": f"MinIO控制台已打开: {console_url}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ==================== Docker服务管理 API ====================

# 服务名映射
SERVICE_MAPPING = {
    'elasticsearch': ['es01', 'es02', 'es03'],  # ES集群三节点
    'kibana': ['kibana'],
    'logstash': ['logstash'],
    'minio': ['minio']
}

@app.get("/api/docker/{service}/status")
async def get_docker_service_status(service: str):
    """获取Docker服务状态"""
    import subprocess
    try:
        if service not in SERVICE_MAPPING:
            raise HTTPException(status_code=400, detail=f"无效的服务名称: {service}")
        
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        docker_services = SERVICE_MAPPING[service]
        
        # 检查所有相关容器的状态
        all_running = True
        any_running = False
        
        for svc in docker_services:
            result = subprocess.run(
                ['docker-compose', 'ps', '-q', svc],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            
            if result.stdout.strip():
                # 有容器ID，检查是否运行中
                container_id = result.stdout.strip().split('\n')[0]
                inspect_result = subprocess.run(
                    ['docker', 'inspect', '-f', '{{.State.Running}}', container_id],
                    capture_output=True,
                    text=True
                )
                is_running = inspect_result.stdout.strip() == 'true'
                if is_running:
                    any_running = True
                else:
                    all_running = False
            else:
                all_running = False
        
        # 判断状态
        if all_running and any_running:
            status = 'running'
        elif any_running:
            status = 'partial'
        else:
            status = 'stopped'
        
        return {
            "success": True,
            "service": service,
            "status": status,
            "containers": docker_services
        }
    except Exception as e:
        return {"success": False, "error": str(e), "status": "unknown"}


@app.post("/api/docker/{service}/toggle")
async def toggle_docker_service(service: str):
    """切换Docker服务状态（启动/停止）"""
    import subprocess
    try:
        if service not in SERVICE_MAPPING:
            raise HTTPException(status_code=400, detail=f"无效的服务名称: {service}")
        
        # 先获取当前状态
        status_response = await get_docker_service_status(service)
        current_status = status_response.get('status', 'stopped')
        
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        docker_services = SERVICE_MAPPING[service]
        
        if current_status in ['running', 'partial']:
            # 停止服务
            for svc in docker_services:
                result = subprocess.run(
                    ['docker-compose', 'stop', svc],
                    cwd=project_root,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
            
            return {
                "success": True,
                "action": "stopped",
                "message": f"{service} 服务已停止",
                "new_status": "stopped"
            }
        else:
            # 启动服务
            for svc in docker_services:
                result = subprocess.run(
                    ['docker-compose', 'up', '-d', svc],
                    cwd=project_root,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode != 0:
                    return {
                        "success": False,
                        "error": result.stderr,
                        "message": f"{service} 服务启动失败"
                    }
            
            return {
                "success": True,
                "action": "started",
                "message": f"{service} 服务启动成功",
                "new_status": "running"
            }
            
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "操作超时"}
    except Exception as e:
        return {"success": False, "error": str(e)}




# ==================== NewRAG API ====================

@app.get("/api/newrag/status")
async def newrag_status_api():
    """获取NewRAG状态"""
    is_running, status_str = check_newrag_status()
    # 从config读取配置比较好，但这里暂时硬编码或用环境变量
    # 假设默认端口
    return {
        "status": "running" if is_running else "stopped",
        "detail": status_str,
        "frontend_url": "http://localhost:3000",
        "backend_url": "http://localhost:8080",
        "mcp_url": "http://localhost:3001"
    }

@app.post("/api/newrag/toggle")
async def newrag_toggle_api():
    """切换NewRAG状态"""
    try:
        is_running, _ = check_newrag_status()
        if is_running:
            success, msg = stop_newrag()
            action = "stopped"
        else:
            success, msg = start_newrag()
            action = "started"
        
        if success:
            return {
                "success": True, 
                "action": action, 
                "message": msg,
                "new_status": "running" if action == "started" else "stopped"
            }
        else:
            raise HTTPException(status_code=500, detail=msg)
    except Exception as e:
        print(f"❌ NewRAG toggle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/newflow/status")
async def newflow_status_api():
    """获取NewFlow状态"""
    is_running, status_str = check_newflow_status()
    return {
        "status": "running" if is_running else "stopped",
        "detail": status_str,
        "url": f"http://localhost:{os.getenv('NEWFLOW_PORT', '5678')}"
    }

@app.post("/api/newflow/toggle")
async def newflow_toggle_api():
    """切换NewFlow状态"""
    try:
        is_running, _ = check_newflow_status()
        if is_running:
            success, msg = stop_newflow()
            action = "stopped"
        else:
            success, msg = start_newflow()
            action = "started"
        
        if success:
            return {
                "success": True, 
                "action": action, 
                "message": msg,
                "new_status": "running" if action == "started" else "stopped"
            }
        else:
            raise HTTPException(status_code=500, detail=msg)
    except Exception as e:
        print(f"❌ NewFlow toggle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== MCP服务编排API ====================

@app.get("/api/mcp/instances")
async def mcp_list_instances():
    """列出所有MCP实例"""
    instances = get_all_instances()
    # 检查健康状态
    for instance in instances:
        instance['is_healthy'] = check_mcp_health(instance['id'])
    return instances


@app.post("/api/mcp/instances")
async def mcp_create_instance(data: MCPInstanceCreate):
    """创建新MCP实例"""
    # 生成ID
    instance_id = f"mcp-{data.type}-{uuid.uuid4().hex[:8]}"
    
    # 记录操作日志
    log_operation("create_mcp", "system", {
        "instance_id": instance_id,
        "name": data.name,
        "type": data.type,
        "port": data.port
    })
    
    # 分配端口
    if data.port:
        port = data.port
    else:
        port = get_next_available_port()
    
    # 构建实例
    instance = {
        "id": instance_id,
        "name": data.name,
        "type": data.type,
        "config": data.config,
        "port": port,
        "status": "stopped",
        "endpoint": f"http://localhost:{port}/mcp",
        "health_endpoint": f"http://localhost:{port}/health"
    }
    
    # 保存到数据库
    success = create_instance(instance)
    if success:
        log_operation("create_mcp_success", "system", {"instance_id": instance_id})
        log_audit("MCP_CREATE", f"Created MCP instance: {data.name}", {
            "instance_id": instance_id,
            "type": data.type
        })
        return instance
    log_operation("create_mcp_failed", "system", {"instance_id": instance_id})
    raise HTTPException(status_code=500, detail="创建实例失败")


@app.get("/api/mcp/instances/{instance_id}")
async def mcp_get_instance(instance_id: str):
    """获取MCP实例详情"""
    instance = get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="实例不存在")
    
    instance['is_healthy'] = check_mcp_health(instance_id)
    return instance


@app.put("/api/mcp/instances/{instance_id}")
async def mcp_update_instance(instance_id: str, data: MCPInstanceUpdate):
    """
    更新MCP实例配置
    实现策略：停止旧容器 → 更新配置 → 用新配置重新创建容器
    """
    from mcp_manager import stop_mcp_server, start_mcp_server
    
    # 1. 停止旧容器（如果正在运行）
    print(f"🔧 停止旧容器: {instance_id}")
    stop_mcp_server(instance_id)
    
    # 2. 更新配置到数据库
    updates = {}
    if data.name:
        updates['name'] = data.name
    if data.config:
        updates['config'] = data.config
    if data.port:
        updates['port'] = data.port
        # 端口变更时同步更新端点URL
        updates['endpoint'] = f"http://localhost:{data.port}/mcp"
        updates['health_endpoint'] = f"http://localhost:{data.port}/health"
    
    success = update_instance(instance_id, updates)
    if not success:
        raise HTTPException(status_code=500, detail="配置更新失败")
    
    # 3. 用新配置重新创建并启动容器
    print(f"🚀 用新配置重新启动容器: {instance_id}")
    start_success = start_mcp_server(instance_id)
    
    # 4. 返回更新后的实例状态
    instance = get_instance(instance_id)
    if instance:
        instance['is_healthy'] = check_mcp_health(instance_id)
        await manager.broadcast({"type": "mcp_status_update", "instance": instance})
        return instance
    
    raise HTTPException(status_code=500, detail="更新后无法获取实例信息")


@app.delete("/api/mcp/instances/{instance_id}")
async def mcp_delete_instance(instance_id: str):
    """删除MCP实例"""
    log_operation("delete_mcp", "system", {"instance_id": instance_id})
    log_audit("MCP_DELETE", f"Deleting MCP instance", {"instance_id": instance_id})
    # 先停止
    stop_mcp_server(instance_id)
    
    # 删除
    success = delete_instance(instance_id)
    if success:
        return {"message": "实例已删除"}
    raise HTTPException(status_code=500, detail="删除失败")


@app.post("/api/mcp/instances/{instance_id}/start")
async def mcp_start_instance(instance_id: str):
    """启动MCP服务"""
    log_operation("start_mcp", "system", {"instance_id": instance_id})
    success = start_mcp_server(instance_id)
    if success:
        log_operation("start_mcp_success", "system", {"instance_id": instance_id})
        # 广播最新状态并返回最新实例信息
        try:
            status = await get_status()
            await manager.broadcast(status)
        except Exception:
            pass
        inst = get_instance(instance_id)
        inst["is_healthy"] = check_mcp_health(instance_id)
        return {"message": "MCP服务启动成功", "instance": inst}
    raise HTTPException(status_code=500, detail="启动失败")


@app.post("/api/mcp/instances/{instance_id}/stop")
async def mcp_stop_instance(instance_id: str):
    """停止MCP服务"""
    log_operation("stop_mcp", "system", {"instance_id": instance_id})
    success = stop_mcp_server(instance_id)
    if success:
        log_operation("stop_mcp_success", "system", {"instance_id": instance_id})
        # 广播最新状态并返回最新实例信息
        try:
            status = await get_status()
            await manager.broadcast(status)
        except Exception:
            pass
        inst = get_instance(instance_id)
        inst["is_healthy"] = check_mcp_health(instance_id)
        return {"message": "MCP服务已停止", "instance": inst}
    raise HTTPException(status_code=500, detail="停止失败")


@app.get("/api/mcp/instances/{instance_id}/status")
async def mcp_instance_status(instance_id: str):
    """获取MCP服务状态"""
    instance = get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="实例不存在")
    
    is_healthy = check_mcp_health(instance_id)
    
    return {
        "instance_id": instance_id,
        "status": instance['status'],
        "is_healthy": is_healthy,
        "pid": instance.get('pid')
    }


@app.get("/api/mcp/instances/{instance_id}/logs")
async def mcp_instance_logs(instance_id: str, lines: int = 100):
    """获取MCP服务日志（Docker容器日志）"""
    logs = get_mcp_logs(instance_id, lines)
    return {"logs": logs}


# ==================== 日志查询API ====================

@app.get("/api/logs/operations")
async def get_operations_log(lines: int = 100, filter: Optional[str] = None):
    """
    获取操作日志
    
    Args:
        lines: 返回的行数（默认100）
        filter: 过滤文本（可选）
    """
    log_lines = get_operation_logs(lines, filter)
    return {
        "logs": [line.strip() for line in log_lines],
        "count": len(log_lines)
    }


@app.get("/api/logs/mcp-calls")
async def get_mcp_calls_log(lines: int = 100, instance_id: Optional[str] = None):
    """
    获取MCP调用日志
    
    Args:
        lines: 返回的行数（默认100）
        instance_id: 过滤特定实例ID（可选）
    """
    log_lines = get_mcp_call_logs(lines, instance_id)
    return {
        "logs": [line.strip() for line in log_lines],
        "count": len(log_lines),
        "filter": {"instance_id": instance_id} if instance_id else None
    }


@app.get("/api/logs/audit")
async def get_audits_log(lines: int = 50):
    """
    获取审计日志（敏感操作）
    
    Args:
        lines: 返回的行数（默认50）
    """
    log_lines = get_audit_logs(lines)
    return {
        "logs": [line.strip() for line in log_lines],
        "count": len(log_lines)
    }


@app.get("/api/logs/dashboard")
async def get_dashboard_log(lines: int = 100):
    """
    获取Dashboard日志
    
    Args:
        lines: 返回的行数（默认100）
    """
    log_lines = get_dashboard_logs(lines)
    return {
        "logs": [line.strip() for line in log_lines],
        "count": len(log_lines)
    }


@app.get("/api/mcp/templates")
async def mcp_get_templates():
    """获取MCP模板"""
    return list_templates()


@app.get("/api/mcp/newchat-config")
async def mcp_newchat_config():
    """生成NewChat配置"""
    instances = get_all_instances()
    # 只包含运行中的实例
    running_instances = [i for i in instances if check_mcp_health(i['id'])]
    config = generate_newchat_config(running_instances)
    return config


# ==================== WebSocket实时更新 ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket端点 - 实时推送服务状态"""
    await manager.connect(websocket)
    try:
        while True:
            try:
                # 推送状态更新
                status = await get_status()
                await websocket.send_json(status)
            except Exception as e:
                print(f"❌ WebSocket status update failed: {e}")
                # 发送错误状态或保持静默，避免断开连接
                # await websocket.send_json({"error": str(e)})
            
            await asyncio.sleep(5)  # 每5秒更新一次
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"❌ WebSocket connection error: {e}")
        manager.disconnect(websocket)


# ==================== 启动事件 ====================

@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    print("🚀 NewmindEx AI Platform Dashboard 启动")
    print("=" * 50)
    print(f"📊 Dashboard: http://localhost:{os.getenv('DASHBOARD_PORT', '8000')}")
    print(f"📚 API文档: http://localhost:{os.getenv('DASHBOARD_PORT', '8000')}/docs")
    print("=" * 50)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('DASHBOARD_PORT', '8000')))

