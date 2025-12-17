#!/bin/bash

# 脚本：修补 NewRAG 压缩包，确保配置正确
# 用途：修改 zip 包里的文件，这样每次解压都是正确配置

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ZIP_FILE="$PROJECT_ROOT/installers/newrag-main-1.1.0.zip"
TEMP_DIR=$(mktemp -d)

echo -e "${BLUE}🔧 开始修补 NewRAG 压缩包...${NC}"

# 检查压缩包是否存在
if [ ! -f "$ZIP_FILE" ]; then
    echo -e "${YELLOW}⚠️  未找到: $ZIP_FILE${NC}"
    echo -e "${YELLOW}   当前只有: $(ls -1 $PROJECT_ROOT/installers/newrag-main-*.zip 2>/dev/null || echo '无')${NC}"
    exit 1
fi

echo -e "${BLUE}📦 解压到临时目录...${NC}"
cd "$TEMP_DIR"
unzip -q "$ZIP_FILE"

# 查找 web/app.py 文件
APP_PY=$(find . -name "app.py" -path "*/web/app.py" | head -1)

if [ -z "$APP_PY" ]; then
    echo -e "${YELLOW}❌ 未找到 web/app.py${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${BLUE}🔧 修补 $APP_PY...${NC}"

# 备份
cp "$APP_PY" "$APP_PY.backup"

# 1. 确保 routers 挂载在 /api 前缀下
sed -i.tmp 's/app\.include_router(document_router)$/app.include_router(document_router, prefix="\/api")/' "$APP_PY" 2>/dev/null || \
    sed -i.tmp '' -e 's/app\.include_router(document_router)$/app.include_router(document_router, prefix="\/api")/' "$APP_PY"

sed -i.tmp 's/app\.include_router(cleanup_router)$/app.include_router(cleanup_router, prefix="\/api")/' "$APP_PY" 2>/dev/null || \
    sed -i.tmp '' -e 's/app\.include_router(cleanup_router)$/app.include_router(cleanup_router, prefix="\/api")/' "$APP_PY"

# 2. 确保API路由有 /api 前缀
sed -i.tmp 's/@app\.post("\/search",/@app.post("\/api\/search",/' "$APP_PY" 2>/dev/null || \
    sed -i.tmp '' -e 's/@app\.post("\/search",/@app.post("\/api\/search",/' "$APP_PY"

sed -i.tmp 's/@app\.get("\/component\//@app.get("\/api\/component\//' "$APP_PY" 2>/dev/null || \
    sed -i.tmp '' -e 's/@app\.get("\/component\//@app.get("\/api\/component\//' "$APP_PY"

sed -i.tmp 's/@app\.get("\/stats")$/@app.get("\/api\/stats")/' "$APP_PY" 2>/dev/null || \
    sed -i.tmp '' -e 's/@app\.get("\/stats")$/@app.get("\/api\/stats")/' "$APP_PY"

# 清理临时文件
rm -f "$APP_PY.tmp" "$APP_PY.backup"

echo -e "${BLUE}📦 重新打包...${NC}"
# 删除旧的压缩包
rm "$ZIP_FILE"

# 重新打包
BASE_DIR=$(ls -d newrag-main* 2>/dev/null | head -1)
if [ -z "$BASE_DIR" ]; then
    BASE_DIR="newrag-main"
fi

zip -r -q "$ZIP_FILE" "$BASE_DIR"

# 清理临时目录
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ 修补完成！${NC}"
echo -e "${GREEN}   新的压缩包: $ZIP_FILE${NC}"
echo -e "${BLUE}ℹ️  下次安装时将自动使用正确配置${NC}"

