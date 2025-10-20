"""
NewFlow工作流管理模块

功能说明：
- import_workflow: 从 workflow_conf 目录导入单个工作流到 NewFlow
- import_all_workflows: 批量导入所有工作流（应用启动时自动执行）
- list_workflows: 从 NewFlow API 读取工作流列表

数据流：
  workflow_conf/*.json → Dashboard导入 → NewFlow → newflow_data持久化
"""

import httpx
import json
from pathlib import Path
from typing import List, Dict, Optional


PROJECT_ROOT = Path(__file__).parent.parent
WORKFLOW_CONF_DIR = PROJECT_ROOT / "workflow_conf"


def get_workflow_files() -> List[Path]:
    """获取所有workflow配置文件"""
    if not WORKFLOW_CONF_DIR.exists():
        return []
    return list(WORKFLOW_CONF_DIR.glob("*.json"))


async def import_workflow(workflow_file: Path, 
                         newflow_url: str = "http://localhost:5677",
                         api_key: Optional[str] = None) -> bool:
    """
    导入单个workflow
    
    Args:
        workflow_file: workflow文件路径
        newflow_url: NewFlow服务URL
        api_key: API密钥（可选）
        
    Returns:
        bool: 是否导入成功
    """
    try:
        with open(workflow_file, 'r', encoding='utf-8') as f:
            workflow_data = json.load(f)
        
        # 清理workflow数据，只保留API需要的字段
        cleaned_data = {
            "name": workflow_data.get("name", workflow_file.stem),
            "nodes": workflow_data.get("nodes", []),
            "connections": workflow_data.get("connections", {}),
            "settings": workflow_data.get("settings", {}),
            "staticData": workflow_data.get("staticData"),
            "active": workflow_data.get("active", False),  # 默认不激活
            "tags": workflow_data.get("tags", []),
        }
        # 移除None值和只读字段
        cleaned_data = {k: v for k, v in cleaned_data.items() if v is not None}
        
        headers = {'Content-Type': 'application/json'}
        if api_key:
            headers['X-N8N-API-KEY'] = api_key
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{newflow_url}/rest/workflows",
                json=cleaned_data,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ 导入成功: {workflow_file.name}")
                return True
            else:
                print(f"❌ 导入失败: {workflow_file.name} - {response.status_code}: {response.text}")
                return False
                
    except Exception as e:
        print(f"导入workflow失败 {workflow_file.name}: {e}")
        return False


async def import_all_workflows(newflow_url: str = "http://localhost:5677",
                               api_key: Optional[str] = None) -> Dict:
    """
    批量导入所有workflow（跳过同名工作流）
    
    Returns:
        Dict: 导入结果统计
    """
    workflow_files = get_workflow_files()
    
    if not workflow_files:
        return {"total": 0, "success": 0, "failed": 0, "skipped": 0}
    
    # 获取现有工作流列表
    existing_workflows = await list_workflows(newflow_url, api_key, include_archived=True)
    existing_names = set()
    if existing_workflows:
        existing_names = {wf.get('name', '') for wf in existing_workflows}
    
    results = {
        "total": len(workflow_files),
        "success": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    for workflow_file in workflow_files:
        try:
            # 读取工作流名称
            with open(workflow_file, 'r', encoding='utf-8') as f:
                workflow_data = json.load(f)
            
            workflow_name = workflow_data.get("name", workflow_file.stem)
            
            # 检查是否已存在同名工作流
            if workflow_name in existing_names:
                print(f"⏭️  跳过已存在: {workflow_file.name} (名称: {workflow_name})")
                results["skipped"] += 1
                results["details"].append({
                    "file": workflow_file.name,
                    "name": workflow_name,
                    "status": "skipped",
                    "reason": "already_exists"
                })
                continue
            
            # 导入新工作流
            success = await import_workflow(workflow_file, newflow_url, api_key)
            if success:
                results["success"] += 1
                results["details"].append({
                    "file": workflow_file.name,
                    "name": workflow_name,
                    "status": "success"
                })
                # 添加到已存在列表，避免重复导入
                existing_names.add(workflow_name)
            else:
                results["failed"] += 1
                results["details"].append({
                    "file": workflow_file.name,
                    "name": workflow_name,
                    "status": "failed"
                })
        except Exception as e:
            print(f"处理文件失败 {workflow_file.name}: {e}")
            results["failed"] += 1
            results["details"].append({
                "file": workflow_file.name,
                "status": "error",
                "reason": str(e)
            })
    
    return results


async def list_workflows(newflow_url: str = "http://localhost:5677",
                        api_key: Optional[str] = None,
                        include_archived: bool = False) -> Optional[List[Dict]]:
    """
    获取NewFlow中的workflow列表
    
    Args:
        newflow_url: NewFlow服务地址
        api_key: API密钥
        include_archived: 是否包含已归档的工作流（默认False，只显示未归档的）
    
    Returns:
        List[Dict]: workflow列表（默认过滤已归档的）
    """
    try:
        headers = {}
        if api_key:
            headers['X-N8N-API-KEY'] = api_key
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{newflow_url}/rest/workflows",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                # n8n API返回 {data: [...], nextCursor: ...} 格式
                workflows = data.get('data', [])
                
                # 默认过滤已归档的工作流
                if not include_archived:
                    workflows = [w for w in workflows if not w.get('isArchived', False)]
                
                return workflows
                
    except Exception as e:
        print(f"获取workflow列表失败: {e}")
    
    return None

