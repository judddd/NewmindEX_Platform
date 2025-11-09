"""
审计日志模块 - 统一的日志管理系统
提供Dashboard操作日志、MCP调用日志、审计日志记录功能
"""

import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from datetime import datetime
import json
from typing import Dict, Any, Optional
import traceback

# 日志目录
LOGS_DIR = Path(__file__).parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# 日志文件路径
DASHBOARD_LOG = LOGS_DIR / "dashboard.log"
OPERATION_LOG = LOGS_DIR / "operations.log"
MCP_CALL_LOG = LOGS_DIR / "mcp_calls.log"
AUDIT_LOG = LOGS_DIR / "audit.log"

# MCP容器日志目录
MCP_CONTAINERS_LOG_DIR = LOGS_DIR / "mcp_containers"
MCP_CONTAINERS_LOG_DIR.mkdir(exist_ok=True)

# 敏感信息关键字
SENSITIVE_KEYS = [
    'password', 'api_key', 'apiKey', 'apikey', 'token', 'secret',
    'newflow_api_key', 'es_password', 'kibana_password', 'es_api_key',
    'kibana_cookies', 'auth', 'authorization', 'credentials'
]

# 日志记录器
dashboard_logger = None
operation_logger = None
mcp_call_logger = None
audit_logger = None


def mask_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    屏蔽敏感信息
    
    Args:
        data: 原始数据字典
        
    Returns:
        Dict: 屏蔽后的数据字典
    """
    if not isinstance(data, dict):
        return data
    
    masked = {}
    for key, value in data.items():
        if any(sensitive in key.lower() for sensitive in SENSITIVE_KEYS):
            if isinstance(value, str) and len(value) > 8:
                # 保留前4位和后4位
                masked[key] = value[:4] + "****" + value[-4:]
            else:
                masked[key] = "****"
        elif isinstance(value, dict):
            # 递归处理嵌套字典
            masked[key] = mask_sensitive_data(value)
        else:
            masked[key] = value
    
    return masked


def create_logger(name: str, log_file: Path) -> logging.Logger:
    """
    创建日志记录器
    
    Args:
        name: 记录器名称
        log_file: 日志文件路径
        
    Returns:
        logging.Logger: 配置好的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # 避免重复添加handler
    if logger.handlers:
        return logger
    
    # 按天轮转的文件处理器
    handler = TimedRotatingFileHandler(
        filename=log_file,
        when='midnight',
        interval=1,
        backupCount=90,  # 保留90天
        encoding='utf-8'
    )
    
    # 日志格式
    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    
    return logger


def setup_loggers():
    """初始化所有日志记录器"""
    global dashboard_logger, operation_logger, mcp_call_logger, audit_logger
    
    dashboard_logger = create_logger('dashboard', DASHBOARD_LOG)
    operation_logger = create_logger('operation', OPERATION_LOG)
    mcp_call_logger = create_logger('mcp_call', MCP_CALL_LOG)
    audit_logger = create_logger('audit', AUDIT_LOG)
    
    # 记录日志系统启动
    audit_logger.info("Log system initialized")


def log_operation(action: str, user: str = "system", details: Optional[Dict[str, Any]] = None):
    """
    记录操作日志
    
    Args:
        action: 操作类型（create_mcp, start_mcp, stop_mcp, delete_mcp等）
        user: 操作用户
        details: 操作详情
    """
    if not operation_logger:
        return
    
    try:
        # 屏蔽敏感信息
        safe_details = mask_sensitive_data(details or {})
        
        # 格式化日志信息
        log_parts = [f"[USER:{user}]", f"[ACTION:{action}]"]
        
        if safe_details:
            detail_str = ", ".join(f"{k}={v}" for k, v in safe_details.items())
            log_parts.append(detail_str)
        
        message = " ".join(log_parts)
        operation_logger.info(message)
        
    except Exception as e:
        if dashboard_logger:
            dashboard_logger.error(f"Failed to log operation: {e}")


def log_mcp_call(
    instance_id: str,
    tool_name: str,
    parameters: Optional[Dict[str, Any]] = None,
    result: Optional[str] = None,
    duration: Optional[float] = None,
    status: str = "success",
    error: Optional[str] = None
):
    """
    记录MCP工具调用日志
    
    Args:
        instance_id: MCP实例ID
        tool_name: 工具名称
        parameters: 调用参数
        result: 调用结果（简要）
        duration: 执行时长（秒）
        status: 状态（success/failed）
        error: 错误信息
    """
    if not mcp_call_logger:
        return
    
    try:
        # 屏蔽敏感信息
        safe_params = mask_sensitive_data(parameters or {})
        
        # 格式化日志信息
        log_parts = [
            f"[INSTANCE:{instance_id}]",
            f"[TOOL:{tool_name}]",
            f"[STATUS:{status}]"
        ]
        
        if duration is not None:
            log_parts.append(f"[DURATION:{duration:.3f}s]")
        
        if safe_params:
            params_str = json.dumps(safe_params, ensure_ascii=False)
            log_parts.append(f"params={params_str}")
        
        if result:
            # 限制结果长度
            result_preview = result[:200] + "..." if len(result) > 200 else result
            log_parts.append(f"result={result_preview}")
        
        if error:
            log_parts.append(f"error={error}")
        
        message = " ".join(log_parts)
        
        if status == "failed":
            mcp_call_logger.error(message)
        else:
            mcp_call_logger.info(message)
        
    except Exception as e:
        if dashboard_logger:
            dashboard_logger.error(f"Failed to log MCP call: {e}")


def log_audit(event_type: str, description: str, details: Optional[Dict[str, Any]] = None, user: str = "system"):
    """
    记录审计日志（敏感操作、配置变更）
    
    Args:
        event_type: 事件类型（SYSTEM_START, CONFIG_CHANGE, AUTH_FAILED等）
        description: 事件描述
        details: 详细信息
        user: 操作用户
    """
    if not audit_logger:
        return
    
    try:
        # 屏蔽敏感信息
        safe_details = mask_sensitive_data(details or {})
        
        # 格式化日志信息
        log_parts = [
            f"[USER:{user}]",
            f"[EVENT:{event_type}]",
            f"[DESC:{description}]"
        ]
        
        if safe_details:
            details_str = json.dumps(safe_details, ensure_ascii=False)
            log_parts.append(f"details={details_str}")
        
        message = " ".join(log_parts)
        audit_logger.warning(message)
        
    except Exception as e:
        print(f"Failed to log audit event: {e}")


def log_dashboard(level: str, message: str):
    """
    记录Dashboard日志
    
    Args:
        level: 日志级别（INFO, WARNING, ERROR）
        message: 日志消息
    """
    if not dashboard_logger:
        return
    
    try:
        if level.upper() == "ERROR":
            dashboard_logger.error(message)
        elif level.upper() == "WARNING":
            dashboard_logger.warning(message)
        else:
            dashboard_logger.info(message)
    except Exception as e:
        print(f"Failed to log dashboard message: {e}")


def read_log_file(log_file: Path, lines: int = 100, filter_text: Optional[str] = None) -> list:
    """
    读取日志文件
    
    Args:
        log_file: 日志文件路径
        lines: 读取行数
        filter_text: 过滤文本
        
    Returns:
        list: 日志行列表
    """
    try:
        if not log_file.exists():
            return []
        
        with open(log_file, 'r', encoding='utf-8') as f:
            all_lines = f.readlines()
        
        # 如果有过滤条件
        if filter_text:
            all_lines = [line for line in all_lines if filter_text.lower() in line.lower()]
        
        # 返回最后N行
        return all_lines[-lines:] if len(all_lines) > lines else all_lines
        
    except Exception as e:
        log_dashboard("ERROR", f"Failed to read log file {log_file}: {e}")
        return []


def get_operation_logs(lines: int = 100, filter_text: Optional[str] = None) -> list:
    """获取操作日志"""
    return read_log_file(OPERATION_LOG, lines, filter_text)


def get_mcp_call_logs(lines: int = 100, instance_id: Optional[str] = None) -> list:
    """获取MCP调用日志"""
    filter_text = f"INSTANCE:{instance_id}" if instance_id else None
    return read_log_file(MCP_CALL_LOG, lines, filter_text)


def get_audit_logs(lines: int = 50) -> list:
    """获取审计日志"""
    return read_log_file(AUDIT_LOG, lines)


def get_dashboard_logs(lines: int = 100) -> list:
    """获取Dashboard日志"""
    return read_log_file(DASHBOARD_LOG, lines)


