"""
数据库模块 - MCP实例持久化存储
使用SQLite存储MCP服务器实例配置
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

DB_PATH = Path(__file__).parent / "mcp_instances.db"


def init_db():
    """初始化数据库"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS mcp_instances (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            config TEXT NOT NULL,
            port INTEGER NOT NULL,
            status TEXT DEFAULT 'stopped',
            pid INTEGER,
            endpoint TEXT,
            health_endpoint TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS module_versions (
            name TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            install_path TEXT,
            status TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def get_module_version(name: str) -> Optional[Dict]:
    """获取模块版本信息"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM module_versions WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_module_version(name: str, version: str, install_path: str = None, status: str = None):
    """更新模块版本信息"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 检查是否存在
    cursor.execute("SELECT name FROM module_versions WHERE name = ?", (name,))
    exists = cursor.fetchone()
    
    if exists:
        updates = ["version = ?", "updated_at = CURRENT_TIMESTAMP"]
        params = [version]
        if install_path:
            updates.append("install_path = ?")
            params.append(install_path)
        if status:
            updates.append("status = ?")
            params.append(status)
        
        params.append(name)
        cursor.execute(f"UPDATE module_versions SET {', '.join(updates)} WHERE name = ?", params)
    else:
        cursor.execute(
            "INSERT INTO module_versions (name, version, install_path, status) VALUES (?, ?, ?, ?)",
            (name, version, install_path, status or 'installed')
        )
    
    conn.commit()
    conn.close()


def get_all_instances() -> List[Dict]:
    """获取所有MCP实例"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM mcp_instances ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    instances = []
    for row in rows:
        instance = dict(row)
        instance['config'] = json.loads(instance['config'])
        instances.append(instance)
    
    conn.close()
    return instances


def get_instance(instance_id: str) -> Optional[Dict]:
    """获取指定MCP实例"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM mcp_instances WHERE id = ?", (instance_id,))
    row = cursor.fetchone()
    
    if row:
        instance = dict(row)
        instance['config'] = json.loads(instance['config'])
        conn.close()
        return instance
    
    conn.close()
    return None


def create_instance(instance: Dict) -> bool:
    """创建MCP实例"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO mcp_instances 
            (id, name, type, config, port, status, endpoint, health_endpoint)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            instance['id'],
            instance['name'],
            instance['type'],
            json.dumps(instance['config']),
            instance['port'],
            instance.get('status', 'stopped'),
            instance['endpoint'],
            instance['health_endpoint']
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"创建实例失败: {e}")
        return False


def update_instance(instance_id: str, updates: Dict) -> bool:
    """更新MCP实例"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 构建更新语句
        set_clauses = []
        values = []
        
        for key, value in updates.items():
            if key == 'config':
                set_clauses.append(f"{key} = ?")
                values.append(json.dumps(value))
            else:
                set_clauses.append(f"{key} = ?")
                values.append(value)
        
        set_clauses.append("updated_at = ?")
        values.append(datetime.now().isoformat())
        
        values.append(instance_id)
        
        query = f"UPDATE mcp_instances SET {', '.join(set_clauses)} WHERE id = ?"
        cursor.execute(query, values)
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"更新实例失败: {e}")
        return False


def delete_instance(instance_id: str) -> bool:
    """删除MCP实例"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM mcp_instances WHERE id = ?", (instance_id,))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"删除实例失败: {e}")
        return False


def get_next_available_port(start_port: int = 3001, end_port: int = 3100) -> int:
    """获取下一个可用端口"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT port FROM mcp_instances ORDER BY port")
    used_ports = {row[0] for row in cursor.fetchall()}
    
    conn.close()
    
    for port in range(start_port, end_port + 1):
        if port not in used_ports:
            return port
    
    raise ValueError("没有可用端口")

