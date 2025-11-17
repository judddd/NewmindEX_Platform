#!/bin/bash

# 一键启动所有服务
# 这是主入口脚本，按顺序调用所有模块化脚本

set -e

echo "🚀 NewMind AI Platform - 一键启动"
echo "===================================="
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

# 检查是否首次运行（检查安装状态）
if [ ! -f ".install_state" ] && [ ! -d "python_dashboard/.venv" ]; then
    echo "⚠️  检测到这是首次运行"
    echo ""
    echo "建议使用安装脚本进行完整安装："
    echo "  ./install.sh"
    echo ""
    echo "如果您确定已手动安装所有组件，可以继续运行此脚本。"
    echo ""
    read -p "是否继续? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消。请运行: ./install.sh"
        exit 1
    fi
fi

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

# 步骤7：导入MCP Docker镜像
echo "步骤 8/13: 导入MCP Docker镜像"
bash scripts/07_load_mcp_images.sh || echo "⚠️  MCP镜像导入跳过，将使用Node模式"
echo ""

# 步骤8：启动Docker服务
echo "步骤 9/13: 启动Docker服务"
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
echo "步骤 11/12: 配置ES Connector"
bash scripts/10_configure_es_connector.sh || echo "⚠️  Connector配置跳过"
echo ""

# 等待所有关键服务就绪
echo "⏳ 等待所有服务就绪..."
echo ""

# 检查 ES 是否就绪
ES_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${ES_PORT_1:-9200}/_cluster/health > /dev/null 2>&1; then
        echo "✅ Elasticsearch 已就绪"
        ES_READY=true
        break
    fi
    sleep 2
done

if [ "$ES_READY" = "false" ]; then
    echo "⚠️  警告：Elasticsearch 未就绪，Dashboard 可能无法正常工作"
fi

# 检查 Kibana 是否就绪
KIBANA_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${KIBANA_PORT:-5601}/api/status > /dev/null 2>&1; then
        echo "✅ Kibana 已就绪"
        KIBANA_READY=true
        break
    fi
    sleep 2
done

if [ "$KIBANA_READY" = "false" ]; then
    echo "⚠️  警告：Kibana 未就绪，Dashboard 可能无法正常工作"
fi

# 检查 Newflow 是否就绪
NEWFLOW_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${NEWFLOW_PORT:-5677} > /dev/null 2>&1; then
        echo "✅ Newflow 已就绪"
        NEWFLOW_READY=true
        break
    fi
    sleep 2
done

if [ "$NEWFLOW_READY" = "false" ]; then
    echo "⚠️  警告：Newflow 未就绪，Dashboard 可能无法正常工作"
fi

echo ""
echo "=========================================="
echo ""

# 启动Python Dashboard
echo "步骤 12/12: 启动Python Dashboard..."
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

# 步骤11：初始化默认MCP实例
echo "🔧 初始化默认MCP实例（3001-3003端口）..."
bash scripts/11_init_default_mcp_instances.sh || echo "⚠️  MCP实例初始化失败，可在Dashboard中手动创建"
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
echo "🔌 MCP服务地址:"
echo "   • Elasticsearch MCP: http://localhost:3001/mcp"
echo "   • Kibana MCP: http://localhost:3002/mcp"
echo "   • NewFlow MCP: http://localhost:3003/mcp"
echo ""
echo "📝 提示："
echo "   • 查看日志: tail -f python_dashboard/dashboard.log"
echo "   • 停止服务: bash scripts/stop_all.sh"
echo "   • MCP服务器管理: http://localhost:8000 (Dashboard)"
echo ""

