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
        # 无PID文件：可能是外部启动的实例，我们无法停止
        print(f"⚠️  无法停止实例 {instance_id}：该实例不是由Dashboard启动的（无PID文件）")
        print(f"   如需停止，请在外部系统中手动停止该服务")
        # 保持状态不变，返回失败
        return False
    
    try:
        pid = int(pid_file.read_text())

        # 优雅停止：优先对单个进程 SIGTERM，再尝试进程组
        terminated = False
        try:
            os.kill(pid, signal.SIGTERM)
            print(f"发送SIGTERM到进程: {pid}")
            for _ in range(10):
                try:
                    os.kill(pid, 0)
                    time.sleep(0.5)
                except OSError:
                    terminated = True
                    break
            if not terminated:
                try:
                    os.killpg(os.getpgid(pid), signal.SIGTERM)
                    print(f"发送SIGTERM到进程组: {os.getpgid(pid)}")
                    time.sleep(1)
                except Exception:
                    pass
        except ProcessLookupError:
            terminated = True

        # 若仍存活，强制杀死
        if not terminated:
            try:
                os.kill(pid, 0)
                try:
                    os.kill(pid, signal.SIGKILL)
                    print(f"发送SIGKILL到进程: {pid}")
                except Exception:
                    pass
                try:
                    os.killpg(os.getpgid(pid), signal.SIGKILL)
                    print(f"发送SIGKILL到进程组: {os.getpgid(pid)}")
                except Exception:
                    pass
                time.sleep(0.5)
            except OSError:
                terminated = True

        # 清理与更新
        pid_file.unlink(missing_ok=True)
        update_instance(instance_id, {"status": "stopped", "pid": None})
        print(f"✓ MCP服务器已停止: {instance_id}")
        return True

    except Exception as e:
        print(f"❌ 停止MCP服务器失败: {e}")
        import traceback
        traceback.print_exc()
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
    检查MCP服务器健康状态：优先通过HTTP健康端点，其次检查进程。
    这样即使没有由本进程创建的PID文件（例如外部默认运行的实例），也能正确感知为运行中。
    """
    instance = get_instance(instance_id)
    
    # 1) 优先HTTP健康检查（支持自定义health_endpoint或由endpoint推导）
    try:
        import httpx
        if instance:
            health_url = instance.get('health_endpoint')
            if not health_url:
                endpoint = instance.get('endpoint')
                if endpoint:
                    # 规范地将 /health 拼在 endpoint 所在主机端口上
                    if endpoint.endswith('/mcp'):
                        health_url = endpoint[:-4] + 'health'
                    else:
                        # 尝试直接 /health
                        health_url = endpoint.rstrip('/') + '/health'
                elif instance.get('port'):
                    health_url = f"http://localhost:{instance['port']}/health"
            if health_url:
                resp = httpx.get(health_url, timeout=2.0)
                if resp.status_code == 200:
                    return True
    except Exception:
        pass

    # 2) 回退：检查PID文件与进程（仅当由我们启动过时可用）
    pid_file = MCP_PIDS_DIR / f"{instance_id}.pid"
    if not pid_file.exists():
        return False
    try:
        pid = int(pid_file.read_text())
        os.kill(pid, 0)  # 进程存在
        return True
    except (OSError, ValueError):
        pid_file.unlink(missing_ok=True)
        return False

