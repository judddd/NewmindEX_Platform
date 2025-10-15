"""
NewMind AI Platform Management Dashboard
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
from newflow_importer import (
    get_workflow_files, import_workflow, import_all_workflows, list_workflows
)
from mcp_templates import list_templates, get_template, generate_newmindchat_config

# 初始化数据库
init_db()

# 创建FastAPI应用
app = FastAPI(
    title="NewMind AI Platform Dashboard",
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

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")


# ==================== Pydantic模型 ====================

class MCPInstanceCreate(BaseModel):
    name: str
    type: str  # elasticsearch, kibana, newflow
    config: Dict
    port: Optional[int] = None


class MCPInstanceUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict] = None


class ModelDownload(BaseModel):
    model_name: str
    variant: str = "mlx"


class LMServerStart(BaseModel):
    model_name: str
    port: int = 1234


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
    
    # 检查ES
    es_health = await get_cluster_health(password=es_password)
    
    # 检查LM Studio
    lm_status = await get_lm_status()
    
    # 检查MCP实例
    mcp_instances = get_all_instances()
    for instance in mcp_instances:
        instance['is_healthy'] = check_mcp_health(instance['id'])
    
    return {
        "elasticsearch": {
            "status": "running" if es_health else "stopped",
            "health": es_health
        },
        "kibana": {
            "status": "running",  # 假设与ES同状态
            "url": f"http://localhost:{os.getenv('KIBANA_PORT', '5601')}"
        },
        "lmstudio": {
            "status": "running" if lm_status else "stopped",
            "port": int(os.getenv('LMSTUDIO_PORT', '1234'))
        },
        "newflow": {
            "status": "running",
            "url": f"http://localhost:{os.getenv('NEWFLOW_PORT', '5677')}"
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


# ==================== NewFlow API ====================

@app.get("/api/newflow/workflows")
async def newflow_workflows():
    """NewFlow工作流列表"""
    newflow_url = f"http://localhost:{os.getenv('NEWFLOW_PORT', '5677')}"
    api_key = os.getenv('NEWFLOW_API_KEY')
    workflows = await list_workflows(newflow_url, api_key)
    
    # 同时返回本地配置文件列表
    local_files = [f.name for f in get_workflow_files()]
    
    return {
        "workflows": workflows or [],
        "local_files": local_files
    }


@app.post("/api/newflow/import")
async def newflow_import():
    """一键导入所有工作流"""
    newflow_url = f"http://localhost:{os.getenv('NEWFLOW_PORT', '5677')}"
    api_key = os.getenv('NEWFLOW_API_KEY')
    result = await import_all_workflows(newflow_url, api_key)
    return result


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
        return instance
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
    """更新MCP实例配置"""
    updates = {}
    if data.name:
        updates['name'] = data.name
    if data.config:
        updates['config'] = data.config
    
    success = update_instance(instance_id, updates)
    if success:
        return get_instance(instance_id)
    raise HTTPException(status_code=500, detail="更新失败")


@app.delete("/api/mcp/instances/{instance_id}")
async def mcp_delete_instance(instance_id: str):
    """删除MCP实例"""
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
    success = start_mcp_server(instance_id)
    if success:
        return {"message": "MCP服务启动成功", "instance_id": instance_id}
    raise HTTPException(status_code=500, detail="启动失败")


@app.post("/api/mcp/instances/{instance_id}/stop")
async def mcp_stop_instance(instance_id: str):
    """停止MCP服务"""
    success = stop_mcp_server(instance_id)
    if success:
        return {"message": "MCP服务已停止", "instance_id": instance_id}
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
    """获取MCP服务日志"""
    logs = get_mcp_logs(instance_id, lines)
    return {"logs": logs}


@app.get("/api/mcp/templates")
async def mcp_get_templates():
    """获取MCP模板"""
    return list_templates()


@app.get("/api/mcp/newmindchat-config")
async def mcp_newmindchat_config():
    """生成NewMindChat配置"""
    instances = get_all_instances()
    # 只包含运行中的实例
    running_instances = [i for i in instances if check_mcp_health(i['id'])]
    config = generate_newmindchat_config(running_instances)
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
            # 推送状态更新
            status = await get_status()
            await websocket.send_json(status)
            await asyncio.sleep(5)  # 每5秒更新一次
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ==================== 启动事件 ====================

@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    print("🚀 NewMind AI Platform Dashboard 启动")
    print("=" * 50)
    print(f"📊 Dashboard: http://localhost:{os.getenv('DASHBOARD_PORT', '8000')}")
    print(f"📚 API文档: http://localhost:{os.getenv('DASHBOARD_PORT', '8000')}/docs")
    print("=" * 50)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('DASHBOARD_PORT', '8000')))

