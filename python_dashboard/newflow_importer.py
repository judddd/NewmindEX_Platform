"""
NewFlow工作流管理模块

【重要说明】
- import_workflow 和 import_all_workflows 功能已废弃
- NewFlow 现在使用自己的内部数据库管理工作流
- newflow_data 文件夹仅用于 NewFlow 的数据持久化和日志存储
- 保留 list_workflows 函数用于从 NewFlow API 读取工作流列表
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
        }
        # 移除None值和只读字段
        cleaned_data = {k: v for k, v in cleaned_data.items() if v is not None}
        
        headers = {'Content-Type': 'application/json'}
        if api_key:
            headers['X-N8N-API-KEY'] = api_key
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{newflow_url}/api/v1/workflows",
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
    批量导入所有workflow
    
    Returns:
        Dict: 导入结果统计
    """
    workflow_files = get_workflow_files()
    
    if not workflow_files:
        return {"total": 0, "success": 0, "failed": 0}
    
    results = {
        "total": len(workflow_files),
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    for workflow_file in workflow_files:
        success = await import_workflow(workflow_file, newflow_url, api_key)
        if success:
            results["success"] += 1
        else:
            results["failed"] += 1
        
        results["details"].append({
            "file": workflow_file.name,
            "success": success
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
                f"{newflow_url}/api/v1/workflows",
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

