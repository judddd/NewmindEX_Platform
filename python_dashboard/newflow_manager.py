import os
import sys
import subprocess
import yaml
import shutil
import time
import logging
import signal
import socket
from pathlib import Path
from database import get_module_version, update_module_version

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("newflow_manager")

PROJECT_ROOT = Path(__file__).parent.parent
NEWFLOW_DIR = PROJECT_ROOT / "newflow-main"
PID_FILE = PROJECT_ROOT / "python_dashboard/newflow.pid"
LOG_FILE = PROJECT_ROOT / "python_dashboard/newflow.log"
NEWFLOW_PORT = 5678

def get_config_version():
    """从 config.yaml 获取目标版本（现为 git branch）"""
    try:
        config_path = PROJECT_ROOT / "config.yaml"
        if not config_path.exists():
            return None
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config.get("local_modules", {}).get("newflow", {}).get("branch", "main")
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
    if is_port_in_use(NEWFLOW_PORT):
        pid = get_pid_by_port(NEWFLOW_PORT)
        if pid:
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
    """安装 NewFlow（目录须已由 clone_modules.sh 克隆）"""
    if not NEWFLOW_DIR.exists():
        return False, "NewFlow 目录不存在，请先运行: bash scripts/clone_modules.sh"

    logger.info(f"Installing NewFlow (Force: {force})...")

    try:
        subprocess.run(["pnpm", "install"], cwd=NEWFLOW_DIR, check=True)

        branch = get_config_version() or "main"
        update_module_version("newflow", branch, str(NEWFLOW_DIR), "installed")
        return True, "安装成功"
    except Exception as e:
        logger.error(f"Installation failed: {e}")
        return False, f"安装失败: {e}"

def start_newflow():
    is_running, status = check_newflow_status()
    if is_running:
        return True, "已在运行中"

    if not NEWFLOW_DIR.exists():
        return False, "NewFlow 目录不存在，请先运行: bash scripts/clone_modules.sh"

    try:
        logger.info("Starting NewFlow...")
        log_f = open(LOG_FILE, "a")

        env = os.environ.copy()
        env["PORT"] = str(NEWFLOW_PORT)
        env["N8N_PORT"] = str(NEWFLOW_PORT)
        env["N8N_LISTEN_ADDRESS"] = "0.0.0.0"
        env["N8N_HOST"] = "0.0.0.0"
        env["N8N_SECURE_COOKIE"] = "false"
        env["NEWFLOW_SECURE_COOKIE"] = "false"
        env["N8N_USER_FOLDER"] = str(NEWFLOW_DIR / "data")
        env["COREPACK_ENABLE_STRICT"] = "0"

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
            if process.poll() is None:
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
                logger.error(f"Permission denied when killing process {pid}.")
                try:
                    subprocess.run(["sudo", "kill", str(pid)], check=False)
                    killed_any = True
                except:
                    pass
            except Exception as e:
                logger.error(f"Error killing process {pid}: {e}")

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

        if PID_FILE.exists():
            try:
                with open(PID_FILE, "r") as f:
                    pid_from_file = int(f.read().strip())

                try:
                    os.kill(pid_from_file, 0)
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
        if PID_FILE.exists():
            PID_FILE.unlink()
        return False, f"停止失败: {e}"
