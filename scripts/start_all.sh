#!/bin/bash

# 一键启动所有服务
# 这是主入口脚本，按顺序调用所有模块化脚本

set -e

echo "🚀 NewMind AI Platform - 一键启动"
echo "===================================="
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

# 步骤0：检查依赖
echo "步骤 1/11: 检查系统依赖"
bash scripts/00_check_dependencies.sh
echo ""

# 步骤1：准备安装包
echo "步骤 2/11: 准备安装包"
bash scripts/01_prepare_installers.sh
echo ""

# 步骤2：设置目录结构
echo "步骤 3/11: 创建目录结构"
bash scripts/02_setup_directories.sh
echo ""

# 步骤3：创建品牌资源
echo "步骤 4/11: 创建品牌资源"
bash scripts/03_create_branding.sh
echo ""

# 步骤4：构建MCP服务器
echo "步骤 5/11: 构建MCP服务器"
bash scripts/04_build_mcp_servers.sh
echo ""

# 步骤5：安装LM Studio
echo "步骤 6/11: 安装LM Studio"
bash scripts/05_install_lmstudio.sh || echo "⚠️  LM Studio安装跳过，请手动安装"
echo ""

# 步骤6：初始化Python项目
echo "步骤 7/11: 初始化Python项目"
bash scripts/06_init_python_project.sh
echo ""

# 步骤7：启动Docker服务
echo "步骤 8/11: 启动Docker服务"
bash scripts/07_start_docker_services.sh
echo ""

# 步骤8：激活试用许可
echo "步骤 9/11: 激活ES试用许可"
bash scripts/08_activate_trial_license.sh || echo "⚠️  许可激活失败，继续..."
echo ""

# 步骤9：下载LM模型
echo "步骤 10/11: 配置LM Studio模型"
bash scripts/09_download_lm_model.sh || echo "⚠️  LM Studio配置跳过"
echo ""

# 步骤10：配置ES Connector
echo "步骤 11/11: 配置ES Connector"
bash scripts/10_configure_es_connector.sh || echo "⚠️  Connector配置跳过"
echo ""

# 启动Python Dashboard
echo "🐍 启动Python Dashboard..."
cd python_dashboard
# 检查并停止旧的Dashboard进程
if [ -f dashboard.pid ]; then
    OLD_PID=$(cat dashboard.pid)
    if ps -p $OLD_PID > /dev/null; then
        echo "ℹ️  停止旧的Dashboard进程 (PID: $OLD_PID)..."
        kill $OLD_PID || true
        sleep 2
    fi
    rm -f dashboard.pid
fi
source .venv/bin/activate
# 加载环境变量
set -a; source ../.env 2>/dev/null || true; set +a
nohup uvicorn main:app --host 0.0.0.0 --port ${DASHBOARD_PORT:-8000} > dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > dashboard.pid
cd ..
echo "✅ Python Dashboard已在后台启动，PID: $DASHBOARD_PID。日志文件: python_dashboard/dashboard.log"

echo ""
echo "✅ 所有服务启动完成！"
echo ""
echo "===================================="
echo "🔗 服务访问地址："
echo "===================================="
echo "📊 管理控制台: http://localhost:8000"
echo "🔍 Elasticsearch: http://localhost:9200"
echo "📈 Kibana: http://localhost:5601"
echo "📮 Logstash: localhost:5044"
echo "🔄 NewFlow: http://localhost:5677"
echo "🤖 LM Studio: http://localhost:1234"
echo ""
echo "🔐 默认凭据:"
echo "   Elasticsearch/Kibana: elastic / changeme123"
echo ""
echo "📝 提示："
echo "   • 查看日志: tail -f python_dashboard/dashboard.log"
echo "   • 停止服务: bash scripts/stop_all.sh"
echo "   • MCP服务器管理: http://localhost:8000 (Dashboard)"
echo ""

