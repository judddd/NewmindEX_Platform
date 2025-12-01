import os
import sys
import subprocess
import yaml
import shutil
import time
import logging
import signal
import zipfile
import socket
from pathlib import Path
from database import get_module_version, update_module_version

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("newflow_manager")

# 路径配置
PROJECT_ROOT = Path(__file__).parent.parent
NEWFLOW_DIR = PROJECT_ROOT / "newflow-main"
INSTALLER_ZIP = PROJECT_ROOT / "installers/newflow-main-1.0.0.zip"
PID_FILE = PROJECT_ROOT / "python_dashboard/newflow.pid"
LOG_FILE = PROJECT_ROOT / "python_dashboard/newflow.log"
NEWFLOW_PORT = 5678

def get_config_version():
    try:
        config_path = PROJECT_ROOT / "config.yaml"
        if not config_path.exists():
            return None
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config.get("local_modules", {}).get("newflow", {}).get("version")
    except Exception as e:
        logger.error(f"Failed to read config.yaml: {e}")
        return None

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def get_pid_by_port(port):
    try:
        result = subprocess.run(["lsof", "-t", f"-i:{port}"], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            # 返回最后一个 PID (通常是子进程)
            return int(pids[-1])
    except Exception:
        pass
    return None

def get_pids_on_port(port):
    try:
        result = subprocess.run(["lsof", "-t", f"-i:{port}"], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            return [int(p) for p in result.stdout.strip().split('\n') if p.isdigit()]
    except:
        pass
    return []

def check_newflow_status():
    # 1. 优先检查端口
    if is_port_in_use(NEWFLOW_PORT):
        # 如果端口在用，更新 PID 文件（如果需要）
        pid = get_pid_by_port(NEWFLOW_PORT)
        if pid:
            # 检查 PID 文件是否匹配
            if PID_FILE.exists():
                try:
                    with open(PID_FILE, "r") as f:
                        saved_pid = int(f.read().strip())
                    if saved_pid != pid:
                        with open(PID_FILE, "w") as f:
                            f.write(str(pid))
                except:
                    with open(PID_FILE, "w") as f:
                        f.write(str(pid))
            else:
                with open(PID_FILE, "w") as f:
                    f.write(str(pid))
        return True, "running"

    # 2. 如果端口没在用，检查 PID 文件
    if not PID_FILE.exists():
        return False, "stopped"
        
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)
        # 进程还在但没监听端口？可能是僵尸进程或正在启动/停止
        return True, "running" 
    except (ProcessLookupError, ValueError):
        if PID_FILE.exists():
            PID_FILE.unlink()
        return False, "stopped"
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        return False, "error"

def install_newflow(force=False):
    target_version = get_config_version()
    if not target_version:
        logger.error("No version defined in config.yaml")
        return False, "配置缺失"

    current_info = get_module_version("newflow")
    current_version = current_info['version'] if current_info else None
    
    if not force and current_version == target_version and NEWFLOW_DIR.exists():
        logger.info("NewFlow version match, skipping install.")
        return True, "已是最新版本"

    logger.info(f"Installing NewFlow {target_version}...")
    
    try:
        if not INSTALLER_ZIP.exists():
            return False, f"安装包不存在: {INSTALLER_ZIP}"
            
        if NEWFLOW_DIR.exists():
            if force:
                shutil.rmtree(NEWFLOW_DIR)
            else:
                shutil.rmtree(NEWFLOW_DIR)
            
        logger.info(f"Unzipping {INSTALLER_ZIP}...")
        with zipfile.ZipFile(INSTALLER_ZIP, 'r') as zip_ref:
             zip_ref.extractall(PROJECT_ROOT)

        if NEWFLOW_DIR.exists():
             # Check pnpm
             subprocess.run(["pnpm", "install"], cwd=NEWFLOW_DIR, check=True)
             
        update_module_version("newflow", target_version, str(NEWFLOW_DIR), "installed")
        return True, "安装成功"
    except Exception as e:
        logger.error(f"Installation failed: {e}")
        return False, f"安装失败: {e}"

def start_newflow():
    is_running, status = check_newflow_status()
    if is_running:
        return True, "已在运行中"
        
    if not NEWFLOW_DIR.exists():
        install_success, msg = install_newflow()
        if not install_success:
            return False, f"启动失败: {msg}"
        
    try:
        logger.info("Starting NewFlow...")
        log_f = open(LOG_FILE, "a")
        
        env = os.environ.copy()
        env["PORT"] = str(NEWFLOW_PORT)
        env["N8N_PORT"] = str(NEWFLOW_PORT)
        env["N8N_LISTEN_ADDRESS"] = "0.0.0.0"  # 确保对外暴露
        env["N8N_HOST"] = "0.0.0.0"            # 某些版本可能需要这个
        env["N8N_USER_FOLDER"] = str(NEWFLOW_DIR / "data")
        
        # 确保 data 目录存在
        (NEWFLOW_DIR / "data").mkdir(parents=True, exist_ok=True)
        
        cmd = ["pnpm", "start"]
        
        # 使用 setsid 启动，使其脱离当前进程组
        process = subprocess.Popen(
            cmd,
            cwd=NEWFLOW_DIR,
            stdout=log_f,
            stderr=subprocess.STDOUT,
            env=env,
            preexec_fn=os.setsid
        )
        
        # 等待端口就绪 (最多 30 秒)
        logger.info(f"Waiting for NewFlow to start on port {NEWFLOW_PORT}...")
        start_time = time.time()
        actual_pid = None
        
        while time.time() - start_time < 30:
            if is_port_in_use(NEWFLOW_PORT):
                actual_pid = get_pid_by_port(NEWFLOW_PORT)
                break
            time.sleep(1)
            
        if actual_pid:
            logger.info(f"NewFlow started successfully (PID: {actual_pid})")
            with open(PID_FILE, "w") as f:
                f.write(str(actual_pid))
            return True, "启动成功"
        else:
            # 端口未就绪，但可能还在启动中，或者失败了
            # 检查进程是否还在
            if process.poll() is None:
                # 进程还在，暂时记录 pnpm 的 PID
                logger.warning("Port not ready yet, but process is running. Saving initial PID.")
                with open(PID_FILE, "w") as f:
                    f.write(str(process.pid))
                return True, "启动中"
            else:
                return False, "启动失败，进程已退出"

    except Exception as e:
        logger.error(f"Start failed: {e}")
        return False, str(e)

def stop_newflow():
    try:
        # 1. Kill processes on port 5678
        pids = get_pids_on_port(NEWFLOW_PORT)
        killed_any = False
        
        for pid in pids:
            try:
                logger.info(f"Killing process {pid} on port {NEWFLOW_PORT}")
                os.kill(pid, signal.SIGTERM)
                killed_any = True
            except ProcessLookupError:
                pass
            except PermissionError:
                logger.error(f"Permission denied when killing process {pid}. Try running as sudo.")
                # Try sudo kill
                try:
                    subprocess.run(["sudo", "kill", str(pid)], check=False)
                    killed_any = True
                except:
                    pass
            except Exception as e:
                logger.error(f"Error killing process {pid}: {e}")
        
        # Wait and force kill if needed
        if killed_any:
            time.sleep(2)
            pids = get_pids_on_port(NEWFLOW_PORT)
            for pid in pids:
                 try:
                    os.kill(pid, signal.SIGKILL)
                 except PermissionError:
                    try:
                        subprocess.run(["sudo", "kill", "-9", str(pid)], check=False)
                    except:
                        pass
                 except:
                    pass

        # 2. Handle PID file if it exists and wasn't covered
        if PID_FILE.exists():
            try:
                with open(PID_FILE, "r") as f:
                    pid_from_file = int(f.read().strip())
                
                # If this PID is still running and we haven't just killed it (checked via port)
                # Check if it is running
                try:
                    os.kill(pid_from_file, 0)
                    # It's running. Is it safe to kill?
                    # Only kill if it's NOT the current process and NOT the parent of current process
                    if pid_from_file != os.getpid() and pid_from_file != os.getppid():
                         logger.info(f"Killing PID from file: {pid_from_file}")
                         os.kill(pid_from_file, signal.SIGTERM)
                except ProcessLookupError:
                    pass
                except PermissionError:
                    try:
                        subprocess.run(["sudo", "kill", str(pid_from_file)], check=False)
                    except:
                        pass
            except Exception as e:
                logger.error(f"Error handling PID file: {e}")
            finally:
                if PID_FILE.exists():
                    PID_FILE.unlink()
                
        return True, "已停止"
        
    except Exception as e:
        logger.error(f"Critical error in stop_newflow: {e}")
        # 即使出错也清理 PID 文件
        if PID_FILE.exists():
            PID_FILE.unlink()
        # 返回 True 避免前端 500，让用户可以再次尝试或手动检查
        # 或者返回 False 让用户知道失败，但要包含错误信息
        return False, f"停止失败: {e}"
