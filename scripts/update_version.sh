#!/bin/bash

# 模块：版本管理工具
# 功能：更新 config.yaml 中的版本号并同步到相关脚本

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         NewMind AI Platform - 版本管理工具                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

CONFIG_FILE="config.yaml"

# 检查config.yaml是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ 错误: 找不到 config.yaml${NC}"
    exit 1
fi

# 显示帮助
show_help() {
    echo "用法:"
    echo "  $0 --component <组件名> --version <版本号>"
    echo ""
    echo "选项:"
    echo "  --component     组件名称 (newchat, lmstudio, elasticsearch, etc.)"
    echo "  --version       新版本号"
    echo "  --help          显示此帮助信息"
    echo ""
    echo "支持的组件:"
    echo "  applications:    newchat, lmstudio"
    echo "  docker_images:   elasticsearch, kibana, logstash, newflow,"
    echo "                   newflow_docs, newchat_docs, mcp_*"
    echo "  system:          nodejs, docker"
    echo ""
    echo "示例:"
    echo "  $0 --component newchat --version 1.0.2"
    echo "  $0 --component elasticsearch --version 8.18.0"
    echo ""
}

# 解析参数
COMPONENT=""
VERSION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --component)
            COMPONENT="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 未知参数: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 检查参数
if [ -z "$COMPONENT" ] || [ -z "$VERSION" ]; then
    echo -e "${RED}❌ 错误: 缺少必要参数${NC}"
    echo ""
    show_help
    exit 1
fi

echo -e "${CYAN}组件: $COMPONENT${NC}"
echo -e "${CYAN}新版本: $VERSION${NC}"
echo ""

# 更新config.yaml
echo -e "${BLUE}步骤 1/3: 更新 config.yaml${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

update_config() {
    local component=$1
    local new_version=$2
    
    # 根据组件类型确定路径
    case "$component" in
        newchat)
            # 更新应用程序版本
            sed -i.bak "s/version: \".*\"  # newchat/version: \"$new_version\"  # newchat/" "$CONFIG_FILE" 2>/dev/null || \
            sed -i.bak "/applications:/,/newchat:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        lmstudio)
            sed -i.bak "/applications:/,/lmstudio:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        elasticsearch|kibana|logstash)
            sed -i.bak "/docker_images:/,/$component:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        newflow|newflow_docs|newchat_docs)
            sed -i.bak "/docker_images:/,/$component:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        mcp_*)
            sed -i.bak "/docker_images:/,/$component:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        nodejs)
            sed -i.bak "/system:/,/nodejs:/{s/version: .*/version: \"$new_version\"/}" "$CONFIG_FILE"
            ;;
        *)
            echo -e "${YELLOW}⚠️  未知组件: $component${NC}"
            return 1
            ;;
    esac
    
    rm -f "${CONFIG_FILE}.bak"
    echo -e "${GREEN}✅ config.yaml 已更新${NC}"
}

update_config "$COMPONENT" "$VERSION"

# 更新相关脚本
echo ""
echo -e "${BLUE}步骤 2/3: 更新相关脚本${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

update_scripts() {
    local component=$1
    local new_version=$2
    local updated_count=0
    
    case "$component" in
        newchat)
            # 更新01_prepare_installers.sh
            if [ -f "scripts/01_prepare_installers.sh" ]; then
                sed -i.bak "s/NewChat-[0-9.]*-mac-arm64.dmg/NewChat-$new_version-mac-arm64.dmg/g" "scripts/01_prepare_installers.sh"
                rm -f "scripts/01_prepare_installers.sh.bak"
                updated_count=$((updated_count + 1))
            fi
            
            # 更新05_install_newchat.sh
            if [ -f "scripts/05_install_newchat.sh" ]; then
                sed -i.bak "s/NewChat-[0-9.]*-mac-arm64.dmg/NewChat-$new_version-mac-arm64.dmg/g" "scripts/05_install_newchat.sh"
                rm -f "scripts/05_install_newchat.sh.bak"
                updated_count=$((updated_count + 1))
            fi
            ;;
            
        lmstudio)
            if [ -f "scripts/01_prepare_installers.sh" ]; then
                sed -i.bak "s/LM-Studio-[0-9.-]*-arm64.dmg/LM-Studio-$new_version-arm64.dmg/g" "scripts/01_prepare_installers.sh"
                rm -f "scripts/01_prepare_installers.sh.bak"
                updated_count=$((updated_count + 1))
            fi
            
            if [ -f "scripts/05_install_lmstudio.sh" ]; then
                sed -i.bak "s/LM-Studio-[0-9.-]*-arm64.dmg/LM-Studio-$new_version-arm64.dmg/g" "scripts/05_install_lmstudio.sh"
                rm -f "scripts/05_install_lmstudio.sh.bak"
                updated_count=$((updated_count + 1))
            fi
            ;;
            
        elasticsearch|kibana|logstash)
            # 更新docker-compose.yml
            if [ -f "docker-compose.yml" ]; then
                sed -i.bak "s/docker.elastic.co\/${component}\/${component}:[0-9.]*/docker.elastic.co\/${component}\/${component}:${new_version}/g" "docker-compose.yml"
                rm -f "docker-compose.yml.bak"
                updated_count=$((updated_count + 1))
            fi
            ;;
            
        newflow)
            if [ -f "docker-compose.yml" ]; then
                sed -i.bak "s/newflow:[0-9.]*/newflow:${new_version}/g" "docker-compose.yml"
                rm -f "docker-compose.yml.bak"
                updated_count=$((updated_count + 1))
            fi
            ;;
    esac
    
    if [ $updated_count -gt 0 ]; then
        echo -e "${GREEN}✅ 已更新 $updated_count 个脚本文件${NC}"
    else
        echo -e "${YELLOW}ℹ️  无需更新脚本${NC}"
    fi
}

update_scripts "$COMPONENT" "$VERSION"

# 显示变更摘要
echo ""
echo -e "${BLUE}步骤 3/3: 变更摘要${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${CYAN}已更新的配置:${NC}"
echo -e "  • 组件: $COMPONENT"
echo -e "  • 版本: $VERSION"
echo ""

# 检查Git状态
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo -e "${YELLOW}Git 状态:${NC}"
    git status --short | head -5
    echo ""
    
    read -p "是否提交这些更改? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add config.yaml scripts/ docker-compose.yml 2>/dev/null || true
        git commit -m "Update $COMPONENT to version $VERSION" || echo -e "${YELLOW}⚠️  提交失败${NC}"
        echo -e "${GREEN}✅ 已提交更改${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ 版本更新完成！                                             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 后续步骤提示
echo -e "${YELLOW}后续步骤:${NC}"
echo -e "  1. 检查更新后的配置文件"
echo -e "  2. 如有新的安装包，更新 installers/ 目录"
echo -e "  3. 运行: ${CYAN}bash scripts/prepare_upload.sh${NC}"
echo -e "  4. 运行: ${CYAN}bash scripts/upload_to_server.sh${NC}"
echo ""

