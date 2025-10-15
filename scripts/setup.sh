#!/bin/bash

# 快速安装脚本 - 仅执行安装步骤，不启动服务
# 适合首次安装或重新配置环境

set -e

echo "⚙️  NewMind AI Platform - 安装配置"
echo "===================================="
echo ""

cd "$(dirname "$0")/.."

echo "步骤 1/7: 检查系统依赖"
bash scripts/00_check_dependencies.sh
echo ""

echo "步骤 2/7: 准备安装包"
bash scripts/01_prepare_installers.sh
echo ""

echo "步骤 3/7: 创建目录结构"
bash scripts/02_setup_directories.sh
echo ""

echo "步骤 4/7: 创建品牌资源"
bash scripts/03_create_branding.sh
echo ""

echo "步骤 5/7: 构建MCP服务器"
bash scripts/04_build_mcp_servers.sh
echo ""

echo "步骤 6/7: 安装LM Studio"
bash scripts/05_install_lmstudio.sh || echo "⚠️  LM Studio安装跳过"
echo ""

echo "步骤 7/7: 初始化Python项目"
bash scripts/06_init_python_project.sh
echo ""

echo "✅ 安装配置完成！"
echo ""
echo "📝 下一步："
echo "   启动所有服务: bash scripts/start_all.sh"
echo "   或分步启动："
echo "     1. bash scripts/07_start_docker_services.sh"
echo "     2. bash scripts/08_activate_trial_license.sh"
echo "     3. bash scripts/09_download_lm_model.sh"
echo "     4. bash scripts/10_configure_es_connector.sh"

