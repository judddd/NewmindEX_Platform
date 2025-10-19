"""
MCP管理器模块 - MCP服务器进程管理
负责启动、停止、监控MCP服务器实例
"""

import subprocess
import signal
import os
from pathlib import Path
from typing import Dict, Optional
import time

from database import update_instance, get_instance

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
MCP_PIDS_DIR = Path(__file__).parent / "mcp_pids"
MCP_LOGS_DIR = Path(__file__).parent / "mcp_logs"


def ensure_directories():
    """确保必要的目录存在"""
    MCP_PIDS_DIR.mkdir(exist_ok=True)
    MCP_LOGS_DIR.mkdir(exist_ok=True)


def start_mcp_server(instance_id: str) -> bool:
    """
    启动MCP服务器
    
    Args:
        instance_id: MCP实例ID
        
    Returns:
        bool: 是否启动成功
    """
    ensure_directories()
    
    # 获取实例配置
    instance = get_instance(instance_id)
    if not instance:
        print(f"实例不存在: {instance_id}")
        return False
    
    mcp_type = instance['type']
    port = instance['port']
    config = instance['config']
    
    # 构建环境变量
    env = os.environ.copy()
    env.update({
        "MCP_TRANSPORT": "http",
        "MCP_HTTP_PORT": str(port),
        "MCP_HTTP_HOST": "0.0.0.0"
    })
    
    # 根据类型选择命令和配置
    if mcp_type == "elasticsearch":
        # 基础配置
        env.update({
            "ES_URL": config.get("es_url", "http://localhost:9200")
        })
        
        # 认证配置
        if config.get("es_api_key"):
            env["ES_API_KEY"] = config["es_api_key"]
        else:
            env["ES_USERNAME"] = config.get("es_username", "")
            env["ES_PASSWORD"] = config.get("es_password", "")
        
        # TLS配置
        if config.get("disable_tls"):
            env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("es_ca_cert"):
            env["ES_CA_CERT"] = config["es_ca_cert"]
            
        cmd = ["node", str(PROJECT_ROOT / "mcp_tool/mcp-server-elasticsearch-sl/dist/index.js")]
        
    elif mcp_type == "kibana":
        # 基础配置
        env.update({
            "KIBANA_URL": config.get("kibana_url", "http://localhost:5601"),
            "KIBANA_DEFAULT_SPACE": config.get("kibana_space", "default")
        })
        
        # 认证配置
        if config.get("kibana_cookies"):
            env["KIBANA_COOKIES"] = config["kibana_cookies"]
        else:
            env["KIBANA_USERNAME"] = config.get("kibana_username", "")
            env["KIBANA_PASSWORD"] = config.get("kibana_password", "")
        
        # TLS配置
        if config.get("disable_tls"):
            env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
        elif config.get("kibana_ca_cert"):
            env["KIBANA_CA_CERT"] = config["kibana_ca_cert"]
        
        # 高级配置
        if config.get("kibana_timeout"):
            env["KIBANA_TIMEOUT"] = str(config["kibana_timeout"])
        if config.get("kibana_max_retries"):
            env["KIBANA_MAX_RETRIES"] = str(config["kibana_max_retries"])
            
        cmd = ["node", str(PROJECT_ROOT / "mcp_tool/mcp-server-kibana/dist/index.js")]
        
    elif mcp_type == "newflow":
        # 如果配置中没有API key，使用环境变量中的值
        api_key = config.get("newflow_api_key") or os.getenv("NEWFLOW_API_KEY", "")
        env.update({
            "N8N_BASE_URL": config.get("newflow_url", "http://localhost:5677"),
            "N8N_API_KEY": api_key
        })
        cmd = ["node", str(PROJECT_ROOT / "mcp_tool/newflow-mcp-server/build/index.js")]
        
    else:
        print(f"未知的MCP类型: {mcp_type}")
        return False
    
    # 启动进程
    log_file = MCP_LOGS_DIR / f"{instance_id}.log"
    try:
        with open(log_file, "w") as f:
            process = subprocess.Popen(
                cmd,
                env=env,
                stdout=f,
                stderr=subprocess.STDOUT,
                start_new_session=True,
                cwd=PROJECT_ROOT
            )
        
        # 保存PID
        pid_file = MCP_PIDS_DIR / f"{instance_id}.pid"
        pid_file.write_text(str(process.pid))
        
        # 等待服务启动并进行健康检查
        print(f"等待MCP服务器启动...")
        time.sleep(3)
        
        # 使用HTTP健康检查而不是进程检查
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
                    print(f"MCP服务器启动失败，健康检查超时")
                    print(f"查看日志: {log_file}")
                    # 清理进程
                    try:
                        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                    except:
                        pass
                    pid_file.unlink(missing_ok=True)
                    return False
        
        # 更新数据库状态
        update_instance(instance_id, {
            "status": "running",
            "pid": process.pid
        })
        
        print(f"MCP服务器启动成功: {instance_id}")
        print(f"  PID: {process.pid}")
        print(f"  端口: {port}")
        print(f"  端点: http://localhost:{port}/mcp")
        print(f"  健康检查: {health_url}")
        print(f"  日志: {log_file}")
        
        return True
        
    except Exception as e:
        print(f"启动MCP服务器失败: {e}")
        return False


def stop_mcp_server(instance_id: str) -> bool:
    """
    停止MCP服务器
    
    Args:
        instance_id: MCP实例ID
        
    Returns:
        bool: 是否停止成功
    """
    pid_file = MCP_PIDS_DIR / f"{instance_id}.pid"
    
    if not pid_file.exists():
        print(f"PID文件不存在: {instance_id}")
        # 更新状态为stopped
        update_instance(instance_id, {"status": "stopped", "pid": None})
        return True
    
    try:
        pid = int(pid_file.read_text())
        
        # 尝试优雅停止
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
            print(f"发送SIGTERM信号到进程组: {pid}")
            
            # 等待进程退出
            for _ in range(10):
                try:
                    os.kill(pid, 0)  # 检查进程是否存在
                    time.sleep(0.5)
                except OSError:
                    break
            
            # 如果还在运行，强制杀死
            try:
                os.kill(pid, 0)
                os.killpg(os.getpgid(pid), signal.SIGKILL)
                print(f"强制杀死进程组: {pid}")
            except OSError:
                pass
                
        except ProcessLookupError:
            print(f"进程不存在: {pid}")
        
        # 删除PID文件
        pid_file.unlink()
        
        # 更新数据库状态
        update_instance(instance_id, {"status": "stopped", "pid": None})
        
        print(f"MCP服务器已停止: {instance_id}")
        return True
        
    except Exception as e:
        print(f"停止MCP服务器失败: {e}")
        return False


def get_mcp_logs(instance_id: str, lines: int = 100) -> str:
    """
    获取MCP服务器日志
    
    Args:
        instance_id: MCP实例ID
        lines: 返回最后N行
        
    Returns:
        str: 日志内容
    """
    log_file = MCP_LOGS_DIR / f"{instance_id}.log"
    
    if not log_file.exists():
        return "日志文件不存在"
    
    try:
        with open(log_file, "r") as f:
            all_lines = f.readlines()
            return "".join(all_lines[-lines:])
    except Exception as e:
        return f"读取日志失败: {e}"


def check_mcp_health(instance_id: str) -> bool:
    """
    检查MCP服务器健康状态（通过HTTP端点）
    
    Args:
        instance_id: MCP实例ID
        
    Returns:
        bool: 是否健康
    """
    # 首先检查PID文件是否存在
    pid_file = MCP_PIDS_DIR / f"{instance_id}.pid"
    
    if not pid_file.exists():
        return False
    
    try:
        pid = int(pid_file.read_text())
        # 检查进程是否存在
        os.kill(pid, 0)
    except (OSError, ValueError):
        # 进程不存在，清理PID文件
        pid_file.unlink(missing_ok=True)
        return False
    
    # 进程存在，进一步检查HTTP端点
    try:
        instance = get_instance(instance_id)
        if not instance:
            return False
        
        port = instance.get('port')
        if not port:
            return False
        
        # 使用HTTP健康检查
        import httpx
        health_url = f"http://localhost:{port}/health"
        
        response = httpx.get(health_url, timeout=2.0)
        return response.status_code == 200
        
    except Exception:
        # HTTP检查失败，但进程存在，可能正在启动中
        return False

