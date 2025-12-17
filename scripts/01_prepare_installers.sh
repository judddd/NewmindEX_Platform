#!/bin/bash

# 模块：安装包准备
# 功能：检查、下载、验证安装包

set -e

echo "📦 准备安装包..."

# 加载配置读取库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/config_reader.sh"

# 加载环境变量
load_env

# 创建installers目录
mkdir -p installers

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 下载服务器基础URL (从 config.yaml 读取)
DOWNLOAD_BASE_URL=$(get_download_base_url)

# ⚠️  注意：使用 -k 参数忽略SSL证书验证（用于自签名证书或开发环境）
# 如果在生产环境中，建议使用有效的SSL证书

# ============================================
# 通用下载和验证函数
# ============================================

# 下载文件并验证
download_file() {
    local url=$1
    local output_file=$2
    local file_name=$(basename "$output_file")
    
    echo -e "${BLUE}📥 下载 ${file_name}...${NC}"
    
    # 使用临时文件下载
    local temp_file="${output_file}.tmp"
    
    if curl -k -L --fail --progress-bar "$url" -o "$temp_file"; then
        # 检查文件大小（至少应该大于1MB）
        local file_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file" 2>/dev/null)
        if [ "$file_size" -lt 1048576 ]; then
            echo -e "${RED}❌ 下载失败：文件大小异常 (${file_size} bytes)${NC}"
            rm -f "$temp_file"
            return 1
        fi
        
        # 移动临时文件到最终位置
        mv "$temp_file" "$output_file"
        echo -e "${GREEN}✅ 下载成功: ${file_name} ($(du -h "$output_file" | cut -f1))${NC}"
        return 0
    else
        echo -e "${RED}❌ 下载失败: ${url}${NC}"
        rm -f "$temp_file"
        return 1
    fi
}

# 验证文件完整性
verify_file() {
    local file=$1
    local file_name=$(basename "$file")
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 文件不存在: ${file_name}${NC}"
        return 1
    fi
    
    local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    
    # 基本检查：文件大小应该大于1MB
    if [ "$file_size" -lt 1048576 ]; then
        echo -e "${RED}❌ 文件损坏：大小异常 (${file_size} bytes)${NC}"
        return 1
    fi
    
    # 根据文件类型进行特定验证
    case "$file_name" in
        *.dmg)
            # DMG文件验证 - 改进验证逻辑以支持现代DMG格式
            # 检查文件类型是否包含 DMG、disk image、zlib 等关键词
            local file_type=$(file "$file")
            if echo "$file_type" | grep -qiE "(disk image|Apple|DMG|zlib|bzip2|Macintosh)"; then
                echo -e "${GREEN}✅ DMG文件验证通过${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠️  DMG文件类型: $file_type${NC}"
                echo -e "${YELLOW}⚠️  文件大小正常，可能是新格式DMG，跳过格式检查${NC}"
                # 只要文件大小正常，就认为可能是有效的DMG
                return 0
            fi
            ;;
        *.tar)
            # TAR文件验证
            if tar -tzf "$file" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ TAR文件验证通过${NC}"
                return 0
            else
                echo -e "${RED}❌ TAR文件损坏${NC}"
                return 1
            fi
            ;;
        *)
            echo -e "${YELLOW}⚠️  未知文件类型，跳过详细验证${NC}"
            return 0
            ;;
    esac
}

# 检查或下载文件
check_or_download() {
    local file_path=$1
    local download_url=$2
    local file_name=$(basename "$file_path")
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}检查: ${file_name}${NC}"
    
    if [ -f "$file_path" ]; then
        echo -e "${YELLOW}📄 文件已存在，验证中...${NC}"
        if verify_file "$file_path"; then
            echo -e "${GREEN}✅ ${file_name} 可用${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  文件损坏，重新下载...${NC}"
            rm -f "$file_path"
        fi
    fi
    
    # 文件不存在或已损坏，尝试下载
    if [ -z "$download_url" ]; then
        echo -e "${RED}❌ 文件不存在且未配置下载地址${NC}"
        return 1
    fi
    
    if download_file "$download_url" "$file_path"; then
        if verify_file "$file_path"; then
            return 0
        else
            echo -e "${YELLOW}⚠️  下载的文件验证失败，但文件已保留${NC}"
            echo -e "${YELLOW}   文件位置: $file_path${NC}"
            echo -e "${YELLOW}   如果确认文件正常，下次运行将直接使用${NC}"
            # 不删除文件，让用户决定
            return 1
        fi
    else
        return 1
    fi
}

# ============================================
# 检查各个安装包
# ============================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         开始检查安装包                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"

# 1. NewChat (从 config.yaml 读取)
NEWCHAT_DMG=$(get_newchat_file)
NEWCHAT_FILENAME=$(basename "$NEWCHAT_DMG")
NEWCHAT_URL="${DOWNLOAD_BASE_URL}/${NEWCHAT_FILENAME}"
check_or_download "$NEWCHAT_DMG" "$NEWCHAT_URL" || echo -e "${YELLOW}⚠️  NewChat 将稍后手动安装${NC}"

# 2. LM Studio (从 config.yaml 读取)
LMSTUDIO_DMG=$(get_lmstudio_file)
LMSTUDIO_FILENAME=$(basename "$LMSTUDIO_DMG")
LMSTUDIO_URL="${LMSTUDIO_DMG_URL:-}"
if [ -n "$LMSTUDIO_URL" ]; then
    check_or_download "$LMSTUDIO_DMG" "$LMSTUDIO_URL" || echo -e "${YELLOW}⚠️  LM Studio 需要手动下载${NC}"
else
    if [ -f "$LMSTUDIO_DMG" ]; then
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}检查: ${LMSTUDIO_FILENAME}${NC}"
        verify_file "$LMSTUDIO_DMG" && echo -e "${GREEN}✅ LM Studio 可用${NC}"
    else
        echo -e "${YELLOW}⚠️  LM Studio 未配置下载地址，请手动下载${NC}"
    fi
fi

# 3. NewFlow Docs
NEWFLOW_DOCS="installers/newflow-docs-1.0.0.tar"
NEWFLOW_DOCS_URL="${DOWNLOAD_BASE_URL}/newflow-docs-1.0.0.tar"
check_or_download "$NEWFLOW_DOCS" "$NEWFLOW_DOCS_URL" || echo -e "${YELLOW}⚠️  NewFlow Docs 可选${NC}"

# 5. NewChat Docs (从 config.yaml 读取)
NEWCHAT_DOCS=$(get_newchat_docs_tar)
NEWCHAT_DOCS_FILENAME=$(basename "$NEWCHAT_DOCS")
NEWCHAT_DOCS_URL="${DOWNLOAD_BASE_URL}/${NEWCHAT_DOCS_FILENAME}"
check_or_download "$NEWCHAT_DOCS" "$NEWCHAT_DOCS_URL" || echo -e "${YELLOW}⚠️  NewChat Docs 可选${NC}"

# 6. MCP Elasticsearch
MCP_ES="installers/newmind-mcp-elasticsearch-1.0.0.tar"
MCP_ES_URL="${DOWNLOAD_BASE_URL}/newmind-mcp-elasticsearch-1.0.0.tar"
check_or_download "$MCP_ES" "$MCP_ES_URL" || echo -e "${YELLOW}⚠️  MCP Elasticsearch 可选${NC}"

# 7. MCP Kibana
MCP_KIBANA="installers/newmind-mcp-kibana-1.0.0.tar"
MCP_KIBANA_URL="${DOWNLOAD_BASE_URL}/newmind-mcp-kibana-1.0.0.tar"
check_or_download "$MCP_KIBANA" "$MCP_KIBANA_URL" || echo -e "${YELLOW}⚠️  MCP Kibana 可选${NC}"

# 8. MCP NewFlow
MCP_NEWFLOW="installers/newmind-mcp-newflow-1.0.0.tar"
MCP_NEWFLOW_URL="${DOWNLOAD_BASE_URL}/newmind-mcp-newflow-1.0.0.tar"
check_or_download "$MCP_NEWFLOW" "$MCP_NEWFLOW_URL" || echo -e "${YELLOW}⚠️  MCP NewFlow 可选${NC}"

# ============================================
# AI模型下载和解压（可选）
# ============================================

# 用户要求手动管理模型，跳过自动检查和下载
echo ""
echo -e "${BLUE}ℹ️  AI模型管理: 请手动通过 LM Studio 下载模型${NC}"
echo ""

# ============================================
# 总结
# ============================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           安装包检查完成                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📊 安装包状态:${NC}"
ls -lh installers/ 2>/dev/null | grep -E '\.(dmg|tar)$' || echo "无安装包"

echo ""
echo -e "${GREEN}✅ 安装包准备完成！${NC}"
echo ""
