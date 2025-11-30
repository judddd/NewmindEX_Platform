#!/bin/bash

# NewMind AI Platform - 数据重置脚本
# 用途: 在不卸载应用的情况下，清空所有业务数据、数据库账户、日志和配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${RED}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     NewMind AI Platform - 数据重置工具                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}⚠️  警告: 此操作将永久删除所有业务数据！${NC}"
echo -e "${YELLOW}包括: Elasticsearch索引、NewFlow工作流、NewRAG知识库、MinIO文件、所有日志和账户信息。${NC}"
echo -e "${GREEN}应用本身、依赖环境和AI模型文件将被保留。${NC}"
echo ""

read -p "确定要继续吗? (输入 'yes' 确认): " -r
if [[ $REPLY != "yes" ]]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo -e "${BLUE}步骤 1/5: 停止所有服务...${NC}"
# 调用 stop_all.sh
if [ -f "scripts/stop_all.sh" ]; then
    bash scripts/stop_all.sh
else
    # 备用停止逻辑
    echo "停止 Docker 服务..."
    docker-compose down 2>/dev/null || true
    echo "停止本地进程..."
    pkill -f "python_dashboard" || true
    pkill -f "newrag-main" || true
    pkill -f "newflow-main" || true
fi

echo ""
echo -e "${BLUE}步骤 2/5: 清理 Docker 数据卷 (Elasticsearch)...${NC}"
# 使用 docker-compose down -v 删除关联的命名卷
if command -v docker-compose &> /dev/null; then
    echo "移除 Docker 容器和数据卷..."
    docker-compose down -v
else
    echo "⚠️  未找到 docker-compose，尝试手动清理卷..."
    # 手动尝试清理可能残留的卷
    docker volume ls -q | grep "esdata" | xargs -r docker volume rm || true
fi

echo ""
echo -e "${BLUE}步骤 3/5: 清理本地数据目录...${NC}"

# MinIO
if [ -d "minio_data" ]; then
    echo "  • 清空 MinIO 数据 (minio_data/)"
    rm -rf minio_data/*
    # 保留个空文件防止目录丢失? MinIO会自动创建
fi

# NewFlow
if [ -d "newflow_data" ]; then
    echo "  • 清空 NewFlow 数据 (newflow_data/)"
    rm -rf newflow_data/*.sqlite*
    rm -rf newflow_data/*.log
    rm -rf newflow_data/.initialized
    rm -rf newflow_data/crash.journal
    rm -rf newflow_data/config
    rm -rf newflow_data/binaryData/*
    # 只有 gitkeep 或必要结构保留
fi

# NewRAG
if [ -d "newrag-main" ]; then
    echo "  • 清空 NewRAG 数据库和上传文件"
    rm -rf newrag-main/data/*
    rm -rf newrag-main/uploads/*
    rm -rf newrag-main/logs/*
fi

# MCP Dashboard Data
if [ -f "python_dashboard/mcp_instances.db" ]; then
    echo "  • 删除 MCP 实例数据库 (mcp_instances.db)"
    rm -f python_dashboard/mcp_instances.db
fi

# Certs (可选，既然是重置数据，证书也算配置的一部分，但也可能用户想保留)
# 这里选择保留 certs 目录结构，但删除内容，除非用户特别想留着
# 考虑到证书制作麻烦，也许保留？
# 用户说 "清空所有内置数据集"，证书不算数据集。保留证书比较好。
echo "  • (保留自定义 SSL 证书)"

echo ""
echo -e "${BLUE}步骤 4/5: 清理日志文件...${NC}"
rm -rf logs/*.log logs/*.log.* logs/*.txt
rm -rf logs/mcp_containers/*
rm -rf python_dashboard/*.log
rm -rf python_dashboard/mcp_logs/*
# 重新创建日志目录结构
mkdir -p logs/mcp_containers
mkdir -p python_dashboard/mcp_logs

echo ""
echo -e "${BLUE}步骤 5/5: 清理缓存和临时文件...${NC}"
rm -f .install_state
rm -f python_dashboard/dashboard.pid
rm -rf python_dashboard/mcp_pids/*
rm -rf python_dashboard/__pycache__
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ 数据重置完成！                                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "您现在拥有一个全新的环境。"
echo "请运行 ./scripts/start_all.sh 重新启动服务并初始化新数据。"
echo ""

