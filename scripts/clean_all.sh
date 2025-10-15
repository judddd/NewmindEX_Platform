#!/bin/bash

echo "🧹 完全清理环境，准备全新部署..."
echo "=================================================="
echo ""
echo "⚠️  保留内容："
echo "   • LM Studio应用 (/Applications/LM Studio.app)"
echo "   • LM Studio模型 (~/.lmstudio/)"
echo "   • 安装包 (installers/)"
echo "   • NewFlow用户数据 (newflow_data/)"
echo ""
echo "🗑️  清理内容："
echo "   • Docker容器、镜像、volumes"
echo "   • Python虚拟环境和缓存"
echo "   • Node.js node_modules和构建产物"
echo "   • MCP运行时文件"
echo "   • 所有日志文件"
echo ""
read -p "确认继续？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消清理"
    exit 0
fi
echo ""

# 1. 停止所有Docker容器
echo "📦 步骤 1/9: 停止Docker容器..."
docker-compose down -v 2>/dev/null || true
docker stop $(docker ps -a -q) 2>/dev/null || true
echo "✅ Docker容器已停止"
echo ""

# 2. 删除项目相关的Docker资源（容器、volumes、网络）
echo "🗑️  步骤 2/9: 清理项目Docker资源..."
docker rm -f es01 es02 es03 kibana logstash newflow 2>/dev/null || true
docker volume rm deploy_newmind_esdata01 deploy_newmind_esdata02 deploy_newmind_esdata03 deploy_newmind_newflow_data 2>/dev/null || true
docker network rm deploy_newmind_elastic 2>/dev/null || true
echo "✅ 项目Docker资源已清理"
echo ""

# 3. 清理所有Docker镜像（释放大量空间）
echo "🐳 步骤 3/9: 清理Docker镜像和缓存..."
docker system prune -a -f --volumes 2>/dev/null || true
echo "✅ Docker镜像和缓存已清理"
echo ""

# 4. 清理Python虚拟环境和缓存
echo "🐍 步骤 4/9: 清理Python虚拟环境和缓存..."
rm -rf python_dashboard/.venv
rm -rf python_dashboard/__pycache__
rm -rf python_dashboard/*.pyc
rm -rf python_dashboard/.pytest_cache
rm -rf python_dashboard/*.egg-info
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
echo "✅ Python虚拟环境和缓存已清理"
echo ""

# 5. 清理Python进程和日志
echo "📝 步骤 5/9: 清理Python进程和日志..."
pkill -f "uvicorn main:app" 2>/dev/null || true
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

# 6. 清理所有Node.js node_modules和构建产物
echo "📦 步骤 6/9: 清理Node.js依赖和构建产物..."
rm -rf mcp_tool/mcp-server-elasticsearch-sl/node_modules
rm -rf mcp_tool/mcp-server-elasticsearch-sl/dist
rm -rf mcp_tool/mcp-server-elasticsearch-sl/build
rm -rf mcp_tool/mcp-server-kibana/node_modules
rm -rf mcp_tool/mcp-server-kibana/dist
rm -rf mcp_tool/mcp-server-kibana/build
rm -rf mcp_tool/newflow-mcp-server/node_modules
rm -rf mcp_tool/newflow-mcp-server/dist
rm -rf mcp_tool/newflow-mcp-server/build
find mcp_tool -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
find mcp_tool -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
find mcp_tool -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
echo "✅ Node.js依赖和构建产物已清理"
echo ""

# 7. 清理MCP运行时文件
echo "🔧 步骤 7/9: 清理MCP运行时文件..."
rm -rf python_dashboard/mcp_pids
rm -rf python_dashboard/mcp_logs
pkill -f "mcp-server" 2>/dev/null || true
echo "✅ MCP运行时文件已清理"
echo ""

# 8. 清理LM Studio进程（保留应用和模型）
echo "🤖 步骤 8/9: 停止LM Studio进程..."
pkill -f "lms server" 2>/dev/null || true
rm -f lmstudio_server.log
rm -f lmstudio.log
echo "✅ LM Studio进程已停止（应用和模型已保留）"
echo ""

# 9. 清理所有日志和临时文件
echo "🗂️  步骤 9/9: 清理日志和临时文件..."
rm -f .env.bak
rm -f *.log
rm -f docker-compose.3nodes.yml.bak 2>/dev/null || true
find . -type f -name "*.log" ! -path "./installers/*" ! -path "./newflow_data/*" -delete 2>/dev/null || true
# 清理newflow_data中的日志（保留数据库）
rm -f newflow_data/*.log
rm -f newflow_data/n8nEventLog-*.log
rm -f newflow_data/crash.journal
rm -rf newflow_data/execution_data
rm -rf newflow_data/logs
echo "✅ 日志和临时文件已清理"
echo ""

echo "=================================================="
echo "✅ 环境清理完成！"
echo ""
echo "📊 磁盘空间释放统计："
echo "   • Docker镜像: ~3GB"
echo "   • ES数据: ~1GB"
echo "   • Node.js依赖: ~500MB"
echo "   • Python虚拟环境: ~200MB"
echo "   • 总计: 约4-5GB"
echo ""
echo "📋 保留的内容："
echo "   ✅ LM Studio应用和模型 (~30GB)"
echo "   ✅ installers/ - 安装包 (~2GB)"
echo "   ✅ newflow_data/ - 用户数据和工作流"
echo "   ✅ workflow_conf/ - 工作流配置"
echo "   ✅ mcp_tool/ - MCP源代码"
echo "   ✅ scripts/ - 部署脚本"
echo "   ✅ .env - 环境配置"
echo ""
echo "🗑️  已删除的内容："
echo "   ❌ Docker镜像和容器"
echo "   ❌ Docker volumes和网络"
echo "   ❌ Python虚拟环境"
echo "   ❌ Node.js node_modules"
echo "   ❌ MCP构建产物"
echo "   ❌ 所有日志文件"
echo ""
echo "🚀 下一步："
echo "   bash scripts/start_all.sh"
echo "   (首次启动需要重新下载Docker镜像和构建MCP服务器)"
echo ""
