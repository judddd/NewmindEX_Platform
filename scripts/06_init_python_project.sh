#!/bin/bash

# 模块：Python项目初始化
# 功能：初始化Python Dashboard项目并安装依赖

set -e

echo "🐍 初始化Python项目..."

cd python_dashboard

# 创建pyproject.toml
if [ ! -f "pyproject.toml" ]; then
    echo "📝 创建pyproject.toml..."
    cat > pyproject.toml << 'EOF'
[project]
name = "newmind-dashboard"
version = "1.0.0"
description = "NewMind AI Platform Management Dashboard"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "httpx>=0.26.0",
    "python-multipart>=0.0.6",
    "jinja2>=3.1.3",
    "aiosqlite>=0.19.0",
    "websockets>=12.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.4",
    "pytest-asyncio>=0.23.3",
]
EOF
    echo "✅ pyproject.toml创建完成"
else
    echo "✅ pyproject.toml已存在"
fi

# 使用uv初始化虚拟环境和安装依赖
echo "📦 安装Python依赖..."
if [ ! -d ".venv" ]; then
    uv venv
fi

# 安装依赖
uv pip install -e .

echo "✅ Python项目初始化完成！"
echo "   虚拟环境位置: python_dashboard/.venv"

cd ..

