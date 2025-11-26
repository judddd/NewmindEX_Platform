#!/bin/bash

# CMDB MCP Server 集成验证脚本
# 检查所有必要的文件和配置是否正确

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   CMDB MCP Server 集成验证${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SUCCESS=0
FAIL=0

check_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $desc"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}❌${NC} $desc - 文件不存在: $file"
        ((FAIL++))
        return 1
    fi
}

check_executable() {
    local file=$1
    local desc=$2
    
    if [ -x "$file" ]; then
        echo -e "${GREEN}✅${NC} $desc (可执行)"
        ((SUCCESS++))
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $desc (不可执行，但存在)"
        ((SUCCESS++))
        return 0
    fi
}

check_string_in_file() {
    local file=$1
    local pattern=$2
    local desc=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $desc"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}❌${NC} $desc - 未找到: $pattern"
        ((FAIL++))
        return 1
    fi
}

echo -e "${YELLOW}📋 检查 CMDB MCP Server 文件${NC}"
echo ""

# 1. 检查 CMDB 目录文件
check_file "$SCRIPT_DIR/Dockerfile" "Dockerfile"
check_file "$SCRIPT_DIR/build-docker.sh" "Docker构建脚本"
check_executable "$SCRIPT_DIR/build-docker.sh" "Docker构建脚本"
check_file "$SCRIPT_DIR/start-http-example.sh" "HTTP启动示例"
check_file "$SCRIPT_DIR/DOCKER_BUILD_GUIDE.md" "Docker构建指南"
check_file "$SCRIPT_DIR/INTEGRATION_SUMMARY.md" "集成总结文档"
check_file "$SCRIPT_DIR/package.json" "package.json"
check_file "$SCRIPT_DIR/index.ts" "主入口文件"
check_file "$SCRIPT_DIR/README.md" "README文档"

echo ""
echo -e "${YELLOW}📋 检查系统集成${NC}"
echo ""

# 2. 检查系统文件更新
check_string_in_file "$PROJECT_ROOT/mcp_tool/DOCKER_BUILD_README.md" "CMDB" "MCP构建文档包含CMDB"
check_string_in_file "$PROJECT_ROOT/python_dashboard/mcp_templates.py" "cmdb" "Dashboard模板包含CMDB"
check_string_in_file "$PROJECT_ROOT/python_dashboard/mcp_manager.py" "cmdb" "MCP管理器支持CMDB"
check_string_in_file "$PROJECT_ROOT/python_dashboard/main.py" "cmdb" "Dashboard主程序支持CMDB"
check_string_in_file "$PROJECT_ROOT/scripts/build_mcp_images.sh" "cmdb" "构建脚本包含CMDB"

echo ""
echo -e "${YELLOW}📋 检查 Node.js 依赖${NC}"
echo ""

# 3. 检查 Node.js 环境
if [ -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${GREEN}✅${NC} Node.js依赖已安装"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️${NC}  Node.js依赖未安装 (运行 npm install)"
fi

if [ -d "$SCRIPT_DIR/dist" ]; then
    echo -e "${GREEN}✅${NC} TypeScript已编译"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️${NC}  TypeScript未编译 (运行 npm run build)"
fi

echo ""
echo -e "${YELLOW}📋 检查 Docker 环境${NC}"
echo ""

# 4. 检查 Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker已安装"
    ((SUCCESS++))
    
    # 检查 Docker 是否运行
    if docker info &> /dev/null; then
        echo -e "${GREEN}✅${NC} Docker正在运行"
        ((SUCCESS++))
        
        # 检查镜像是否存在
        ARCH=$(uname -m)
        if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
            DOCKER_ARCH="arm64"
        else
            DOCKER_ARCH="amd64"
        fi
        
        if docker images | grep -q "newmind-mcp-cmdb.*${DOCKER_ARCH}"; then
            echo -e "${GREEN}✅${NC} CMDB Docker镜像已构建 (${DOCKER_ARCH})"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠️${NC}  CMDB Docker镜像未构建 (运行 ./build-docker.sh)"
        fi
    else
        echo -e "${YELLOW}⚠️${NC}  Docker未运行"
    fi
else
    echo -e "${RED}❌${NC} Docker未安装"
    ((FAIL++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   验证结果${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "✅ 成功: ${GREEN}${SUCCESS}${NC}"
echo -e "❌ 失败: ${RED}${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 集成验证通过！${NC}"
    echo ""
    echo "下一步操作："
    echo "  1. 构建Docker镜像: ./build-docker.sh"
    echo "  2. 启动Dashboard: cd ../../python_dashboard && uv run main.py"
    echo "  3. 访问Web界面: http://localhost:8088"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  存在 ${FAIL} 个问题需要修复${NC}"
    echo ""
    exit 1
fi

