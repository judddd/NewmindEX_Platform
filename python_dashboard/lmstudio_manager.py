"""
LM Studio管理模块
管理LM Studio模型下载、服务启动停止等
"""

import subprocess
import httpx
from typing import Optional, Dict


async def get_lm_status(port: int = 1234) -> bool:
    """检测LM Studio服务状态"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:{port}/v1/models",
                timeout=5.0
            )
            return response.status_code == 200
    except:
        return False


async def get_lm_models(port: int = 1234) -> Optional[Dict]:
    """获取已加载的模型列表"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:{port}/v1/models",
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json()
    except:
        pass
    return None


def download_model(model_name: str, variant: str = "mlx") -> bool:
    """
    下载模型
    
    Args:
        model_name: 模型名称，如 "qwen/qwen3-coder-30b"
        variant: 模型变体，如 "mlx"
        
    Returns:
        bool: 是否成功
    """
    try:
        cmd = ["lms", "get", model_name, "--variant", variant]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"下载模型失败: {e}")
        return False


def start_lm_server(model_name: str, port: int = 1234) -> bool:
    """
    启动LM Studio服务
    
    Args:
        model_name: 模型名称
        port: 服务端口
        
    Returns:
        bool: 是否成功启动
    """
    try:
        cmd = ["lms", "server", "start", "--model", model_name, "--port", str(port)]
        subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        return True
    except Exception as e:
        print(f"启动LM服务失败: {e}")
        return False


def stop_lm_server() -> bool:
    """停止LM Studio服务"""
    try:
        subprocess.run(["pkill", "-f", "lms server"], check=False)
        return True
    except Exception as e:
        print(f"停止LM服务失败: {e}")
        return False

