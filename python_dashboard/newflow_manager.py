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
logger = logging.getLogger("newflow_manager")

# 路径配置
PROJECT_ROOT = Path(__file__).parent.parent
NEWFLOW_DIR = PROJECT_ROOT / "newflow-main"
INSTALLER_ZIP = PROJECT_ROOT / "installers/newflow-main-1.0.0.zip"
PID_FILE = PROJECT_ROOT / "python_dashboard/newflow.pid"
LOG_FILE = PROJECT_ROOT / "python_dashboard/newflow.log"

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

def check_newflow_status():
    if not PID_FILE.exists():
        return False, "stopped"
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)
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
             # build step if needed, usually newflow main might just need install
             # user mentioned pnpm start
             
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
        env["PORT"] = "5678"
        env["N8N_PORT"] = "5678"
        env["N8N_USER_FOLDER"] = str(NEWFLOW_DIR / "data")
        
        # 确保 data 目录存在
        (NEWFLOW_DIR / "data").mkdir(parents=True, exist_ok=True)
        
        cmd = ["pnpm", "start"]
        
        process = subprocess.Popen(
            cmd,
            cwd=NEWFLOW_DIR,
            stdout=log_f,
            stderr=subprocess.STDOUT,
            env=env,
            preexec_fn=os.setsid
        )
        
        with open(PID_FILE, "w") as f:
            f.write(str(process.pid))
            
        logger.info(f"NewFlow started with PID {process.pid}")
        return True, "启动成功"
    except Exception as e:
        logger.error(f"Start failed: {e}")
        return False, str(e)

def stop_newflow():
    if not PID_FILE.exists():
        return True, "未运行"
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        
        logger.info(f"Stopping NewFlow (PID {pid})...")
        
        # 安全停止逻辑：避免误杀 Dashboard 自身
        try:
            target_pgid = os.getpgid(pid)
            current_pgid = os.getpgrp()
            
            if target_pgid == current_pgid:
                logger.warning(f"NewFlow process (PID {pid}) is in the same process group ({target_pgid}) as Dashboard. Using os.kill instead of killpg.")
                os.kill(pid, signal.SIGTERM)
            else:
                # 杀掉进程组
                os.killpg(target_pgid, signal.SIGTERM)
        except ProcessLookupError:
            logger.info(f"Process {pid} group not found, maybe already dead.")
            pass
        
        for _ in range(5):
            try:
                os.kill(pid, 0)
                time.sleep(1)
            except ProcessLookupError:
                break
                
        if PID_FILE.exists():
            PID_FILE.unlink()
            
        # Cleanup
        try:
            # Find processes on port 5678 (NewFlow)
            result = subprocess.run(["lsof", "-t", "-i:5678"], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                logger.info(f"Cleaning up NewFlow port 5678, killing PIDs: {pids}")
                for p in pids:
                    if p and p.isdigit():
                        try:
                            os.kill(int(p), signal.SIGKILL)
                        except ProcessLookupError:
                            pass
        except Exception as e:
            logger.warning(f"Port cleanup failed: {e}")
        
        if PID_FILE.exists():
            PID_FILE.unlink()

        return True, "已停止"
    except Exception as e:
        logger.error(f"Stop failed: {e}")
        # Cleanup anyway
        try:
             result = subprocess.run(["lsof", "-t", "-i:5678"], capture_output=True, text=True)
             if result.returncode == 0 and result.stdout.strip():
                 for p in result.stdout.strip().split('\n'):
                     if p and p.isdigit():
                         try:
                             os.kill(int(p), signal.SIGKILL)
                         except:
                             pass
        except:
            pass
            
        if PID_FILE.exists():
            PID_FILE.unlink()
        return False, str(e)

