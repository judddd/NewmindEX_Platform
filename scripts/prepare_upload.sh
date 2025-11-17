#!/bin/bash

# 模块：准备上传文件
# 功能：压缩模型、生成MD5校验、创建上传清单

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         准备上传文件到服务器                                   ║"
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

# 输出文件
CHECKSUMS_FILE="upload_checksums.txt"
MANIFEST_FILE="upload_manifest.txt"
COMPRESSED_MODELS_DIR="installers/compressed_models"

# 清理旧文件
rm -f "$CHECKSUMS_FILE" "$MANIFEST_FILE"
mkdir -p "$COMPRESSED_MODELS_DIR"

echo -e "${BLUE}步骤 1/4: 压缩AI模型${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 压缩模型函数
compress_model() {
    local model_dir=$1
    local model_name=$(basename "$model_dir")
    local output_file="${COMPRESSED_MODELS_DIR}/${model_name}.tar.gz"
    
    if [ ! -d "$model_dir" ]; then
        echo -e "${YELLOW}⚠️  模型目录不存在: $model_dir${NC}"
        return 1
    fi
    
    if [ -f "$output_file" ]; then
        echo -e "${CYAN}ℹ️  已存在: ${model_name}.tar.gz${NC}"
        return 0
    fi
    
    echo -e "${BLUE}📦 压缩: $model_name${NC}"
    local start_time=$(date +%s)
    
    # 获取原始大小
    local original_size=$(du -sh "$model_dir" | cut -f1)
    echo -e "   原始大小: $original_size"
    
    # 压缩（显示进度）
    cd "$(dirname "$model_dir")"
    tar -czf "$output_file" "$(basename "$model_dir")" 2>&1 | while read line; do
        echo -n "."
    done &
    
    # 实际执行压缩
    tar -czf "$output_file" "$(basename "$model_dir")"
    wait
    
    cd "$PROJECT_ROOT"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local compressed_size=$(du -sh "$output_file" | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ 完成: ${model_name}.tar.gz${NC}"
    echo -e "   压缩后大小: $compressed_size"
    echo -e "   用时: ${duration}秒"
    echo ""
}

# 压缩所有模型
if [ -d "installers/models" ]; then
    for model_dir in installers/models/qwen3-*; do
        if [ -d "$model_dir" ]; then
            compress_model "$model_dir"
        fi
    done
else
    echo -e "${YELLOW}⚠️  模型目录不存在，跳过压缩${NC}"
fi

echo ""
echo -e "${BLUE}步骤 2/4: 生成MD5校验和${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 生成MD5校验和
generate_md5() {
    local file=$1
    if [ -f "$file" ]; then
        if command -v md5sum &> /dev/null; then
            md5sum "$file" >> "$CHECKSUMS_FILE"
        elif command -v md5 &> /dev/null; then
            # macOS 使用 md5 命令
            md5 -r "$file" >> "$CHECKSUMS_FILE"
        else
            echo -e "${YELLOW}⚠️  未找到MD5工具${NC}"
            return 1
        fi
    fi
}

echo "生成文件校验和..."

# DMG文件
for file in installers/*.dmg; do
    [ -f "$file" ] && generate_md5 "$file" && echo "  ✓ $(basename "$file")"
done

# PKG文件
for file in installers/system/*.pkg; do
    [ -f "$file" ] && generate_md5 "$file" && echo "  ✓ $(basename "$file")"
done

# Docker tar文件
for file in installers/*.tar installers/docker_images/*.tar; do
    [ -f "$file" ] && generate_md5 "$file" && echo "  ✓ $(basename "$file")"
done

# 压缩的模型文件
for file in "${COMPRESSED_MODELS_DIR}"/*.tar.gz; do
    [ -f "$file" ] && generate_md5 "$file" && echo "  ✓ $(basename "$file")"
done

echo -e "${GREEN}✅ MD5校验和已保存到: $CHECKSUMS_FILE${NC}"

echo ""
echo -e "${BLUE}步骤 3/4: 创建上传清单${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 创建上传清单
cat > "$MANIFEST_FILE" << 'EOF'
# NewMind AI Platform - 上传清单
# 格式: 本地路径|远程文件名|文件大小|MD5
# 
# 使用方法:
#   1. 查看此清单，确认要上传的文件
#   2. 运行: bash scripts/upload_to_server.sh
#

EOF

# 函数：添加文件到清单
add_to_manifest() {
    local local_path=$1
    local remote_name=$2
    
    if [ ! -f "$local_path" ]; then
        return 1
    fi
    
    local size=$(du -h "$local_path" | cut -f1)
    local md5=""
    
    if command -v md5sum &> /dev/null; then
        md5=$(md5sum "$local_path" | cut -d' ' -f1)
    elif command -v md5 &> /dev/null; then
        md5=$(md5 -q "$local_path")
    fi
    
    echo "${local_path}|${remote_name}|${size}|${md5}" >> "$MANIFEST_FILE"
}

# 添加应用程序
echo "# ═══════════════ 应用程序 ═══════════════" >> "$MANIFEST_FILE"
add_to_manifest "installers/NewChat-1.0.4-mac-arm64.dmg" "NewChat-1.0.4-mac-arm64.dmg"
add_to_manifest "installers/LM-Studio-0.3.30-1-arm64.dmg" "LM-Studio-0.3.30-1-arm64.dmg"
add_to_manifest "installers/Docker.dmg" "Docker.dmg"

# 添加系统依赖
echo "" >> "$MANIFEST_FILE"
echo "# ═══════════════ 系统依赖 ═══════════════" >> "$MANIFEST_FILE"
add_to_manifest "installers/system/node-v20.18.1.pkg" "node-v20.18.1.pkg"
add_to_manifest "installers/system/uv-installer.sh" "uv-installer.sh"

# 添加Docker镜像
echo "" >> "$MANIFEST_FILE"
echo "# ═══════════════ Docker镜像 ═══════════════" >> "$MANIFEST_FILE"
add_to_manifest "installers/docker_images/elasticsearch-8.17.3.tar" "elasticsearch-8.17.3.tar"
add_to_manifest "installers/docker_images/kibana-8.17.3.tar" "kibana-8.17.3.tar"
add_to_manifest "installers/docker_images/logstash-8.17.3.tar" "logstash-8.17.3.tar"
add_to_manifest "installers/newflow-1.0.3.tar" "newflow-1.0.3.tar"
add_to_manifest "installers/newflow-docs-1.0.tar" "newflow-docs-1.0.tar"
add_to_manifest "installers/newchat-docs-1.0.1.tar" "newchat-docs-1.0.1.tar"
add_to_manifest "installers/newmind-mcp-elasticsearch-1.0.0.tar" "newmind-mcp-elasticsearch-1.0.0.tar"
add_to_manifest "installers/newmind-mcp-kibana-1.0.0.tar" "newmind-mcp-kibana-1.0.0.tar"
add_to_manifest "installers/newmind-mcp-newflow-1.0.0.tar" "newmind-mcp-newflow-1.0.0.tar"

# 添加AI模型（压缩包）
echo "" >> "$MANIFEST_FILE"
echo "# ═══════════════ AI模型（压缩包）═══════════════" >> "$MANIFEST_FILE"
for model_file in "${COMPRESSED_MODELS_DIR}"/*.tar.gz; do
    if [ -f "$model_file" ]; then
        add_to_manifest "$model_file" "$(basename "$model_file")"
    fi
done

echo -e "${GREEN}✅ 上传清单已保存到: $MANIFEST_FILE${NC}"

echo ""
echo -e "${BLUE}步骤 4/4: 统计信息${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 统计
total_files=$(grep -v "^#" "$MANIFEST_FILE" | grep -v "^$" | wc -l | tr -d ' ')
echo -e "${CYAN}📊 准备上传的文件: $total_files 个${NC}"
echo ""

# 按类别统计
echo "文件分类:"
echo "  • 应用程序: $(grep -A3 "应用程序" "$MANIFEST_FILE" | grep -v "^#" | grep -v "^$" | wc -l | tr -d ' ') 个"
echo "  • 系统依赖: $(grep -A2 "系统依赖" "$MANIFEST_FILE" | grep -v "^#" | grep -v "^$" | wc -l | tr -d ' ') 个"
echo "  • Docker镜像: $(grep -A10 "Docker镜像" "$MANIFEST_FILE" | grep -v "^#" | grep -v "^$" | wc -l | tr -d ' ') 个"
echo "  • AI模型: $(grep -A5 "AI模型" "$MANIFEST_FILE" | grep -v "^#" | grep -v "^$" | wc -l | tr -d ' ') 个"
echo ""

# 计算总大小（近似）
echo "文件大小（近似）:"
if [ -f "$MANIFEST_FILE" ]; then
    total_size_mb=0
    while IFS='|' read -r local_path remote_name size md5; do
        if [ -n "$size" ] && [ "$size" != "文件大小" ]; then
            # 转换为MB（简单估算）
            size_num=$(echo "$size" | sed 's/[^0-9.]//g')
            unit=$(echo "$size" | sed 's/[0-9.]//g' | tr '[:lower:]' '[:upper:]')
            
            case "$unit" in
                *G*)
                    size_mb=$(echo "$size_num * 1024" | bc 2>/dev/null || echo "0")
                    ;;
                *M*)
                    size_mb=$size_num
                    ;;
                *)
                    size_mb=0
                    ;;
            esac
            
            total_size_mb=$(echo "$total_size_mb + $size_mb" | bc 2>/dev/null || echo "$total_size_mb")
        fi
    done < <(grep -v "^#" "$MANIFEST_FILE" | grep -v "^$")
    
    total_size_gb=$(echo "scale=2; $total_size_mb / 1024" | bc 2>/dev/null || echo "0")
    echo -e "  总计: ${YELLOW}~${total_size_gb}GB${NC} (约 ${total_size_mb}MB)"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ 准备完成！                                                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "生成的文件:"
echo -e "  • ${CYAN}$CHECKSUMS_FILE${NC} - MD5校验和"
echo -e "  • ${CYAN}$MANIFEST_FILE${NC} - 上传清单"
echo -e "  • ${CYAN}$COMPRESSED_MODELS_DIR/${NC} - 压缩后的模型"
echo ""
echo -e "下一步："
echo -e "  运行上传脚本: ${YELLOW}bash scripts/upload_to_server.sh${NC}"
echo ""

