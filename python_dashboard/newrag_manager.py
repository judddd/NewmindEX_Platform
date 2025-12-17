import os
import sys
import subprocess
import yaml
import shutil
import time
import logging
import signal
import zipfile
from pathlib import Path
from database import get_module_version, update_module_version

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("newrag_manager")

# 路径配置
PROJECT_ROOT = Path(__file__).parent.parent
NEWRAG_DIR = PROJECT_ROOT / "newrag-main"
INSTALLER_ZIP = PROJECT_ROOT / "installers/newrag-main-1.1.0.zip"
PID_FILE = PROJECT_ROOT / "python_dashboard/newrag.pid"
LOG_FILE = PROJECT_ROOT / "python_dashboard/newrag.log"

def get_config_version():
    """从 config.yaml 获取目标版本"""
    try:
        config_path = PROJECT_ROOT / "config.yaml"
        if not config_path.exists():
            return None
            
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config.get("local_modules", {}).get("newrag", {}).get("version")
    except Exception as e:
        logger.error(f"Failed to read config.yaml: {e}")
        return None

def check_newrag_status():
    """检查 NewRAG 运行状态"""
    # 1. 优先检查端口 (这是最真实的运行指标)
    try:
        import socket
        # 检查前端端口 3000
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result_frontend = sock.connect_ex(('localhost', 3000))
        sock.close()
        
        # 检查后端端口 8080
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result_backend = sock.connect_ex(('localhost', 8080))
        sock.close()
        
        if result_frontend == 0 or result_backend == 0:
            # 如果PID文件不存在，甚至可以自动恢复一个（可选，这里先只返回状态）
            return True, "running"
    except Exception as e:
        logger.warning(f"Port check failed: {e}")

    # 2. 如果端口没通，再检查 PID 文件 (可能是刚启动还没监听，或者挂了)
    if not PID_FILE.exists():
        return False, "stopped"
    
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        
        # 检查进程是否存在
        os.kill(pid, 0)
        return True, "running"
    except (ProcessLookupError, ValueError):
        # 进程不存在或 PID 文件损坏
        if PID_FILE.exists():
            PID_FILE.unlink()
        return False, "stopped"
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        return False, "error"

def install_newrag(force=False):
    """安装或升级 NewRAG"""
    target_version = get_config_version()
    if not target_version:
        logger.error("No version defined in config.yaml")
        return False, "配置缺失"

    current_info = get_module_version("newrag")
    current_version = current_info['version'] if current_info else None
    
    # 如果版本一致且目录存在，跳过安装
    # 注意：如果目录不存在，即使数据库说已安装，也要重新安装
    if not force and current_version == target_version and NEWRAG_DIR.exists():
        logger.info("NewRAG version match, skipping install.")
        return True, "已是最新版本"

    logger.info(f"Installing NewRAG {target_version} (Current: {current_version}, Force: {force})...")
    
    try:
        # 1. 解压
        if not INSTALLER_ZIP.exists():
            return False, f"安装包不存在: {INSTALLER_ZIP}"
            
        # 如果目录存在
        if NEWRAG_DIR.exists():
            if force:
                logger.info(f"Force install: Removing existing directory: {NEWRAG_DIR}")
                shutil.rmtree(NEWRAG_DIR)
            else:
                # 非强制模式下，如果只是版本更新，这里可能需要更精细的处理
                # 简单起见，我们先移除
                logger.info(f"Removing existing directory for upgrade: {NEWRAG_DIR}")
                shutil.rmtree(NEWRAG_DIR)
            
        logger.info(f"Unzipping {INSTALLER_ZIP}...")
        with zipfile.ZipFile(INSTALLER_ZIP, 'r') as zip_ref:
            zip_ref.extractall(PROJECT_ROOT)
            
        # 2. Backend Setup (uv sync)
        logger.info("Setting up Backend (uv sync)...")
        # 确保 .python-version 正确或使用当前环境
        subprocess.run(["uv", "sync"], cwd=NEWRAG_DIR, check=True)
        
        # 3. Frontend Setup (开发模式：只需要 npm install，不需要 build)
        frontend_dir = NEWRAG_DIR / "frontend"
        if frontend_dir.exists():
            logger.info("Setting up Frontend (npm install)...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            logger.info("Frontend setup complete (development mode, no build needed)")
            
        # 4. MCP Setup
        mcp_dir = NEWRAG_DIR / "newrag-mcp"
        if mcp_dir.exists():
            logger.info("Setting up MCP (npm install & build)...")
            subprocess.run(["npm", "install"], cwd=mcp_dir, check=True)
            subprocess.run(["npm", "run", "build"], cwd=mcp_dir, check=True)
            
        # 更新数据库版本
        update_module_version("newrag", target_version, str(NEWRAG_DIR), "installed")
        logger.info("NewRAG installation complete.")
        
        return True, "安装成功"
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Installation command failed: {e}")
        return False, f"安装命令失败: {e}"
    except Exception as e:
        logger.error(f"Installation failed: {e}")
        return False, f"安装失败: {e}"

def start_newrag():
    """启动 NewRAG"""
    is_running, status = check_newrag_status()
    if is_running:
        return True, "已在运行中"
        
    # 启动前检查是否需要安装/升级
    # 如果目录不存在，才尝试安装，避免每次启动都运行耗时的检查
    if not NEWRAG_DIR.exists():
        install_success, msg = install_newrag()
        if not install_success:
            return False, f"启动失败: {msg}"
        
    try:
        logger.info("Starting NewRAG...")
        log_f = open(LOG_FILE, "a")
        
        # 使用 uv run 启动 dev.py
        # setsid 创建新的会话，这样我们可以杀掉整个进程组
        cmd = ["uv", "run", "dev.py"]
        
        process = subprocess.Popen(
            cmd,
            cwd=NEWRAG_DIR,
            stdout=log_f,
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid
        )
        
        with open(PID_FILE, "w") as f:
            f.write(str(process.pid))
            
        logger.info(f"NewRAG started with PID {process.pid}")
        return True, "启动成功"
    except Exception as e:
        logger.error(f"Start failed: {e}")
        return False, str(e)

def stop_newrag():
    """停止 NewRAG（包括前端、后端、MCP三个服务）"""
    if not PID_FILE.exists():
        return True, "未运行"
        
    try:
        with open(PID_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return True, "PID文件为空"
            pid = int(content)
            
        logger.info(f"Stopping NewRAG (PID {pid})...")
        
        # 找出所有相关进程（npm, node, python）
        import psutil
        try:
            parent = psutil.Process(pid)
            children = parent.children(recursive=True)
            
            # 先停止所有子进程
            for child in children:
                try:
                    logger.info(f"Stopping child process {child.pid} ({child.name()})")
                    child.terminate()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 等待子进程结束
            gone, alive = psutil.wait_procs(children, timeout=5)
            for p in alive:
                try:
                    p.kill()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # 最后停止主进程
            parent.terminate()
            parent.wait(timeout=5)
        except psutil.NoSuchProcess:
            logger.info(f"Process {pid} not found, maybe already stopped.")
        except ImportError:
            # 如果没有 psutil，使用原来的方法
            logger.warning("psutil not available, using fallback stop method")
            try:
                target_pgid = os.getpgid(pid)
                current_pgid = os.getpgrp()
                
                if target_pgid == current_pgid:
                    os.kill(pid, signal.SIGTERM)
                else:
                    os.killpg(target_pgid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        
        # 等待进程结束
        for _ in range(5):
            try:
                os.kill(pid, 0)
                time.sleep(1)
            except ProcessLookupError:
                break
        
        if PID_FILE.exists():
            PID_FILE.unlink()
            
        # 深度清理 (兜底)
        subprocess.run(["pkill", "-f", "web/app.py"], stderr=subprocess.DEVNULL)
        subprocess.run(["pkill", "-f", "newrag-search-mcp"], stderr=subprocess.DEVNULL)
        # 慎用端口清理，只在必要时清理明确的特征
            
        return True, "已停止"
    except ProcessLookupError:
        if PID_FILE.exists():
            PID_FILE.unlink()
        return True, "进程不存在"
    except Exception as e:
        logger.error(f"Stop failed: {e}")
        return False, str(e)

