#!/bin/bash

# scripts/package_offline_models.sh
# 功能：打包本地的 EasyOCR 和 PaddleOCR 模型，用于离线安装

set -e

# 获取脚本所在目录的父目录 (项目根目录)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALLERS_DIR="$PROJECT_ROOT/installers"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 开始打包离线 OCR 模型...${NC}"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
MODELS_DIR="$TEMP_DIR/offline_models"
mkdir -p "$MODELS_DIR"

HAS_MODELS=false

# 1. 打包 EasyOCR 模型
EASYOCR_HOME="$HOME/.EasyOCR"
if [ -d "$EASYOCR_HOME/model" ]; then
    echo -e "${GREEN}✓ 发现 EasyOCR 模型目录: $EASYOCR_HOME${NC}"
    mkdir -p "$MODELS_DIR/EasyOCR"
    cp -r "$EASYOCR_HOME/model" "$MODELS_DIR/EasyOCR/"
    HAS_MODELS=true
else
    echo -e "${YELLOW}⚠️  未找到 EasyOCR 模型 ($EASYOCR_HOME/model)，跳过${NC}"
fi

# 2. 打包 PaddleOCR 模型
PADDLEX_HOME="$HOME/.paddlex"
if [ -d "$PADDLEX_HOME" ]; then
    echo -e "${GREEN}✓ 发现 PaddleX 模型目录: $PADDLEX_HOME${NC}"
    cp -r "$PADDLEX_HOME" "$MODELS_DIR/paddlex"
    HAS_MODELS=true
else
    echo -e "${YELLOW}⚠️  未找到 PaddleX 模型 ($PADDLEX_HOME)，跳过${NC}"
fi

# 检查是否有模型被打包
if [ "$HAS_MODELS" = false ]; then
    echo -e "${YELLOW}❌ 没有找到任何模型，退出打包${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# 3. 创建压缩包
OUTPUT_FILE="$INSTALLERS_DIR/offline_ocr_models.tar.gz"
echo -e "${BLUE}正在创建压缩包: $OUTPUT_FILE ...${NC}"

# 进入临时目录打包，避免包含完整路径
cd "$TEMP_DIR"
tar -czf "$OUTPUT_FILE" offline_models

# 清理
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ 离线模型包已生成: $OUTPUT_FILE${NC}"
echo -e "${BLUE}大小: $(du -h "$OUTPUT_FILE" | cut -f1)${NC}"

