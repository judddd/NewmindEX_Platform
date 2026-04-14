import os
import sys
import subprocess
import yaml
import shutil
import time
import logging
import signal
from pathlib import Path
from database import get_module_version, update_module_version

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("newrag_manager")

PROJECT_ROOT = Path(__file__).parent.parent
NEWRAG_DIR = PROJECT_ROOT / "newrag-main"
PID_FILE = PROJECT_ROOT / "python_dashboard/newrag.pid"
LOG_FILE = PROJECT_ROOT / "python_dashboard/newrag.log"

def get_config_version():
    """从 config.yaml 获取目标版本（现为 git branch）"""
    try:
        config_path = PROJECT_ROOT / "config.yaml"
        if not config_path.exists():
            return None

        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config.get("local_modules", {}).get("newrag", {}).get("branch", "main")
    except Exception as e:
        logger.error(f"Failed to read config.yaml: {e}")
        return None

def check_newrag_status():
    """检查 NewRAG 运行状态"""
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result_frontend = sock.connect_ex(('localhost', 3000))
        sock.close()

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result_backend = sock.connect_ex(('localhost', 8080))
        sock.close()

        if result_frontend == 0 or result_backend == 0:
            return True, "running"
    except Exception as e:
        logger.warning(f"Port check failed: {e}")

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

def install_newrag(force=False):
    """安装 NewRAG（目录须已由 clone_modules.sh 克隆）"""
    if not NEWRAG_DIR.exists():
        return False, "NewRAG 目录不存在，请先运行: bash scripts/clone_modules.sh"

    logger.info(f"Installing NewRAG (Force: {force})...")

    try:
        # 1. Backend: uv venv + uv sync
        logger.info("Setting up Backend (uv sync)...")
        venv_dir = NEWRAG_DIR / ".venv"
        if not venv_dir.exists() or force:
            logger.info("Creating Python 3.11 virtual environment...")
            subprocess.run(["uv", "venv", ".venv", "--python", "3.11"], cwd=NEWRAG_DIR, check=True)

        subprocess.run(["uv", "sync"], cwd=NEWRAG_DIR, check=True)

        # 2. Config generation
        if not (NEWRAG_DIR / "config.yaml").exists():
            logger.info("Config missing, creating from example...")
            if (NEWRAG_DIR / "config.example.yaml").exists():
                shutil.copy(NEWRAG_DIR / "config.example.yaml", NEWRAG_DIR / "config.yaml")
            else:
                logger.warning("config.example.yaml not found, skipping config generation")

        # 3. Auth system init
        if (NEWRAG_DIR / "scripts/init_auth_system.py").exists():
            logger.info("Initializing authentication system...")
            subprocess.run(["uv", "run", "scripts/init_auth_system.py"], cwd=NEWRAG_DIR, check=True)

        # 4. Frontend (dev mode: npm install only)
        frontend_dir = NEWRAG_DIR / "frontend"
        if frontend_dir.exists():
            logger.info("Setting up Frontend (npm install)...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)

        # 5. MCP
        mcp_dir = NEWRAG_DIR / "newrag-mcp"
        if mcp_dir.exists():
            logger.info("Setting up MCP (npm install & build)...")
            subprocess.run(["npm", "install"], cwd=mcp_dir, check=True)
            subprocess.run(["npm", "run", "build"], cwd=mcp_dir, check=True)

        # 6. Ensure directories
        for d in ["logs", "data", "uploads", "web/static/processed_docs"]:
            (NEWRAG_DIR / d).mkdir(parents=True, exist_ok=True)

        branch = get_config_version() or "main"
        update_module_version("newrag", branch, str(NEWRAG_DIR), "installed")
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

    if not NEWRAG_DIR.exists():
        return False, "NewRAG 目录不存在，请先运行: bash scripts/clone_modules.sh"

    # Self-healing: restore config if missing
    try:
        if not (NEWRAG_DIR / "config.yaml").exists():
            logger.info("Config missing, performing self-healing...")
            if (NEWRAG_DIR / "config.example.yaml").exists():
                shutil.copy(NEWRAG_DIR / "config.example.yaml", NEWRAG_DIR / "config.yaml")
                logger.info("Config restored from example")

        # Quick dependency check
        venv_python = NEWRAG_DIR / ".venv" / "bin" / "python"
        if venv_python.exists():
            check_script = "import bcrypt; import jose; import email_validator"
            res = subprocess.run([str(venv_python), "-c", check_script], capture_output=True)
            if res.returncode != 0:
                logger.info("Missing dependencies detected, running uv sync...")
                subprocess.run(["uv", "sync"], cwd=NEWRAG_DIR, check=True)
                logger.info("Dependencies synced")
    except Exception as e:
        logger.warning(f"Self-healing process encountered non-fatal error: {e}")

    try:
        logger.info("Starting NewRAG...")
        log_f = open(LOG_FILE, "a")

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

        import psutil
        try:
            parent = psutil.Process(pid)
            children = parent.children(recursive=True)

            for child in children:
                try:
                    logger.info(f"Stopping child process {child.pid} ({child.name()})")
                    child.terminate()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            gone, alive = psutil.wait_procs(children, timeout=5)
            for p in alive:
                try:
                    p.kill()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            parent.terminate()
            parent.wait(timeout=5)
        except psutil.NoSuchProcess:
            logger.info(f"Process {pid} not found, maybe already stopped.")
        except ImportError:
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

        for _ in range(5):
            try:
                os.kill(pid, 0)
                time.sleep(1)
            except ProcessLookupError:
                break

        if PID_FILE.exists():
            PID_FILE.unlink()

        subprocess.run(["pkill", "-f", "web/app.py"], stderr=subprocess.DEVNULL)
        subprocess.run(["pkill", "-f", "newrag-search-mcp"], stderr=subprocess.DEVNULL)

        return True, "已停止"
    except ProcessLookupError:
        if PID_FILE.exists():
            PID_FILE.unlink()
        return True, "进程不存在"
    except Exception as e:
        logger.error(f"Stop failed: {e}")
        return False, str(e)
