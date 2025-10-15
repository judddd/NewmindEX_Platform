#!/bin/bash

echo "🧹 完全清理环境，准备全新部署..."
echo "=================================================="
echo ""

# 1. 停止所有Docker容器
echo "📦 步骤 1/8: 停止Docker容器..."
docker-compose down -v 2>/dev/null || true
docker stop $(docker ps -a -q) 2>/dev/null || true
echo "✅ Docker容器已停止"
echo ""

# 2. 删除项目相关的Docker资源
echo "🗑️  步骤 2/8: 清理Docker资源..."
docker rm -f es01 es02 es03 kibana logstash newflow 2>/dev/null || true
docker volume rm deploy_newmind_esdata01 deploy_newmind_esdata02 deploy_newmind_esdata03 deploy_newmind_newflow_data 2>/dev/null || true
docker network rm deploy_newmind_elastic 2>/dev/null || true
echo "✅ Docker资源已清理"
echo ""

# 3. 清理Python虚拟环境
echo "🐍 步骤 3/8: 清理Python虚拟环境..."
rm -rf python_dashboard/.venv
rm -rf python_dashboard/__pycache__
rm -rf python_dashboard/*.pyc
rm -rf python_dashboard/.pytest_cache
rm -rf python_dashboard/*.egg-info
echo "✅ Python虚拟环境已清理"
echo ""

# 4. 清理Python进程和日志
echo "📝 步骤 4/8: 清理Python进程和日志..."
if [ -f python_dashboard/dashboard.pid ]; then
    PID=$(cat python_dashboard/dashboard.pid)
    kill $PID 2>/dev/null || true
    rm -f python_dashboard/dashboard.pid
fi
rm -f python_dashboard/dashboard.log
rm -f python_dashboard/*.db
rm -f python_dashboard/*.sqlite
echo "✅ Python进程和日志已清理"
echo ""

# 5. 清理MCP相关
echo "🔧 步骤 5/8: 清理MCP运行时..."
rm -rf python_dashboard/mcp_pids
rm -rf python_dashboard/mcp_logs
rm -rf mcp_tool/*/node_modules
rm -rf mcp_tool/*/dist
rm -rf mcp_tool/*/build
echo "✅ MCP运行时已清理"
echo ""

# 6. 清理LM Studio进程
echo "🤖 步骤 6/8: 清理LM Studio进程..."
pkill -f "lms server" 2>/dev/null || true
rm -f lmstudio_server.log
rm -f lmstudio.log
echo "✅ LM Studio进程已清理"
echo ""

# 7. 清理NewFlow本地数据（保留原始导出的数据）
echo "🔄 步骤 7/8: 清理NewFlow临时数据..."
# 不删除newflow_data，因为包含用户数据
# 如果需要完全重置NewFlow，取消下面这行注释
# rm -rf newflow_data
echo "✅ NewFlow数据保留（含用户信息）"
echo ""

# 8. 清理临时文件
echo "🗂️  步骤 8/8: 清理临时文件..."
rm -f .env.bak
rm -f *.log
rm -f docker-compose.3nodes.yml.bak 2>/dev/null || true
echo "✅ 临时文件已清理"
echo ""

echo "=================================================="
echo "✅ 环境清理完成！"
echo ""
echo "📋 保留的文件："
echo "   • installers/           - 安装包"
echo "   • newflow_data/         - NewFlow用户数据"
echo "   • workflow_conf/        - 工作流配置"
echo "   • mcp_tool/             - MCP源代码"
echo "   • scripts/              - 部署脚本"
echo "   • .env                  - 环境配置"
echo ""
echo "🚀 下一步："
echo "   bash scripts/start_all.sh"
echo ""
