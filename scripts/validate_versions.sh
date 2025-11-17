#!/bin/bash

# 版本一致性验证脚本
# 检查 docker-compose.yml、config.yaml 和 .env 中的版本号是否一致

set -e

echo "🔍 检查版本一致性..."
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 错误计数
ERRORS=0

# 加载 .env 文件（只提取变量，忽略注释）
if [ -f .env ]; then
    set -a
    source <(grep -v '^#' .env | grep -E '^[A-Z_]+=' | sed 's/#.*$//')
    set +a
else
    echo -e "${YELLOW}⚠️  .env 文件不存在${NC}"
fi

# ==================== 检查 Elasticsearch 版本 ====================
echo -e "${BLUE}📦 Elasticsearch 版本检查${NC}"

# 从 .env 读取
ES_VERSION_ENV="${ES_VERSION:-未设置}"

# 从 docker-compose.yml 读取（获取默认值）
ES_VERSION_COMPOSE=$(grep "elasticsearch:.*{ES_VERSION" docker-compose.yml | head -1 | sed 's/.*:-//' | sed 's/}//' || echo "未参数化")

# 从 config.yaml 读取
ES_VERSION_CONFIG=$(grep -A5 "elasticsearch:" config.yaml | grep "remote:" | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" || echo "未找到")

echo "   .env:             $ES_VERSION_ENV"
echo "   docker-compose:   默认值 $ES_VERSION_COMPOSE"
echo "   config.yaml:      $ES_VERSION_CONFIG"

if [ "$ES_VERSION_CONFIG" != "$ES_VERSION_COMPOSE" ]; then
    echo -e "${RED}   ❌ 版本不一致！${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ 版本一致${NC}"
fi
echo ""

# ==================== 检查 Kibana 版本 ====================
echo -e "${BLUE}📊 Kibana 版本检查${NC}"

KIBANA_VERSION_ENV="${KIBANA_VERSION:-未设置}"
KIBANA_VERSION_COMPOSE=$(grep "kibana:.*{KIBANA_VERSION" docker-compose.yml | head -1 | sed 's/.*:-//' | sed 's/}//' || echo "未参数化")
KIBANA_VERSION_CONFIG=$(grep -A5 "kibana:" config.yaml | grep "remote:" | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" || echo "未找到")

echo "   .env:             $KIBANA_VERSION_ENV"
echo "   docker-compose:   默认值 $KIBANA_VERSION_COMPOSE"
echo "   config.yaml:      $KIBANA_VERSION_CONFIG"

if [ "$KIBANA_VERSION_CONFIG" != "$KIBANA_VERSION_COMPOSE" ]; then
    echo -e "${RED}   ❌ 版本不一致！${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ 版本一致${NC}"
fi
echo ""

# ==================== 检查 Logstash 版本 ====================
echo -e "${BLUE}📡 Logstash 版本检查${NC}"

LOGSTASH_VERSION_ENV="${LOGSTASH_VERSION:-未设置}"
LOGSTASH_VERSION_COMPOSE=$(grep "logstash:.*{LOGSTASH_VERSION" docker-compose.yml | head -1 | sed 's/.*:-//' | sed 's/}//' || echo "未参数化")
LOGSTASH_VERSION_CONFIG=$(grep -A5 "logstash:" config.yaml | grep "remote:" | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" || echo "未找到")

echo "   .env:             $LOGSTASH_VERSION_ENV"
echo "   docker-compose:   默认值 $LOGSTASH_VERSION_COMPOSE"
echo "   config.yaml:      $LOGSTASH_VERSION_CONFIG"

if [ "$LOGSTASH_VERSION_CONFIG" != "$LOGSTASH_VERSION_COMPOSE" ]; then
    echo -e "${RED}   ❌ 版本不一致！${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ 版本一致${NC}"
fi
echo ""

# ==================== 检查 Newflow 版本 ====================
echo -e "${BLUE}🌊 Newflow 版本检查${NC}"

NEWFLOW_VERSION_ENV="${NEWFLOW_VERSION:-未设置}"
NEWFLOW_VERSION_COMPOSE=$(grep "image: newflow:" docker-compose.yml | sed 's/.*:-//' | sed 's/}//' || echo "未参数化")
NEWFLOW_VERSION_CONFIG=$(grep -A5 "newflow:" config.yaml | grep "remote:" | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | head -1 || echo "未找到")

echo "   .env:             $NEWFLOW_VERSION_ENV"
echo "   docker-compose:   默认值 $NEWFLOW_VERSION_COMPOSE"
echo "   config.yaml:      $NEWFLOW_VERSION_CONFIG"

if [ "$NEWFLOW_VERSION_CONFIG" != "$NEWFLOW_VERSION_COMPOSE" ]; then
    echo -e "${RED}   ❌ 版本不一致！${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ 版本一致${NC}"
fi
echo ""

# ==================== 检查实际文件是否存在 ====================
echo -e "${BLUE}📁 检查安装包文件${NC}"

check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}   ✅ $name 存在${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $name 不存在: $file${NC}"
    fi
}

check_file "installers/docker_images/elasticsearch-${ES_VERSION_CONFIG}.tar" "Elasticsearch ${ES_VERSION_CONFIG}"
check_file "installers/docker_images/kibana-${KIBANA_VERSION_CONFIG}.tar" "Kibana ${KIBANA_VERSION_CONFIG}"
check_file "installers/docker_images/logstash-${LOGSTASH_VERSION_CONFIG}.tar" "Logstash ${LOGSTASH_VERSION_CONFIG}"
check_file "installers/newflow-${NEWFLOW_VERSION_CONFIG}.tar" "Newflow ${NEWFLOW_VERSION_CONFIG}"

echo ""

# ==================== 总结 ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有版本号一致！${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $ERRORS 个版本不一致问题${NC}"
    echo ""
    echo "建议："
    echo "1. 更新 .env 文件中的版本号"
    echo "2. 或修改 config.yaml 中的版本号"
    echo "3. 确保 docker-compose.yml 使用环境变量"
    exit 1
fi

