#!/bin/bash

# NewMind AI Platform - 安装包上传脚本
# 功能：压缩模型、生成清单、上传到服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务器配置
SERVER="root@xiaopenges.tocharian.eu"
REMOTE_PATH="/var/www/newmind-download"

# 工作目录
WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORK_DIR"

# 临时目录
TEMP_DIR="$WORK_DIR/temp_upload"
COMPRESSED_DIR="$WORK_DIR/installers/compressed_models"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     NewMind AI Platform - 上传安装包到服务器                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==================== 步骤 1: 准备工作 ====================

echo -e "${BLUE}步骤 1/5: 准备工作...${NC}"

# 创建临时目录
mkdir -p "$TEMP_DIR"
mkdir -p "$COMPRESSED_DIR"

# 清单文件
MANIFEST_FILE="$TEMP_DIR/upload_manifest.txt"
CHECKSUM_FILE="$TEMP_DIR/upload_checksums.txt"

# 创建空文件（不写入空行）
> "$MANIFEST_FILE"
> "$CHECKSUM_FILE"

echo -e "${GREEN}✓ 准备完成${NC}"
echo ""

# ==================== 步骤 2: 压缩AI模型 ====================

echo -e "${BLUE}步骤 2/5: 压缩AI模型...${NC}"
echo ""

if [ -d "installers/models" ]; then
    for model_dir in installers/models/qwen3-*; do
        if [ -d "$model_dir" ]; then
            model_name=$(basename "$model_dir")
            compressed_file="${COMPRESSED_DIR}/${model_name}.tar.gz"
            
            if [ -f "$compressed_file" ]; then
                echo -e "${YELLOW}  ⊙ $model_name.tar.gz 已存在，跳过${NC}"
            else
                echo -e "${BLUE}  → 压缩 $model_name...${NC}"
                # 进入models目录压缩（使用绝对路径）
                (cd "installers/models" && tar -czf "${compressed_file}" "$model_name")
                
                if [ -f "$compressed_file" ]; then
                    size=$(du -h "$compressed_file" | cut -f1)
                    echo -e "${GREEN}  ✓ 完成: $size${NC}"
                else
                    echo -e "${RED}  ✗ 压缩失败${NC}"
                fi
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠️  models 目录不存在${NC}"
fi

echo ""
echo -e "${GREEN}✓ 模型压缩完成${NC}"
echo ""

# ==================== 步骤 3: 生成上传清单 ====================

echo -e "${BLUE}步骤 3/5: 生成上传清单和校验和...${NC}"
echo ""

# 函数：添加文件到清单
add_to_manifest() {
    local file=$1
    local remote_name=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}  ⚠️  文件不存在: $file${NC}"
        return
    fi
    
    local size=$(du -h "$file" | cut -f1)
    local md5=$(md5 -q "$file" 2>/dev/null || md5sum "$file" | cut -d' ' -f1)
    
    echo "$file|$remote_name|$size|$md5" >> "$MANIFEST_FILE"
    echo "$md5  $remote_name" >> "$CHECKSUM_FILE"
    
    echo -e "${GREEN}  ✓ $remote_name ($size)${NC}"
}

# 系统依赖
echo -e "${BLUE}【系统依赖】${NC}"
add_to_manifest "installers/Docker.dmg" "Docker.dmg"
add_to_manifest "installers/system/python-3.11.7-macos11.pkg" "python-3.11.7-macos11.pkg"
add_to_manifest "installers/system/node-v20.18.1.pkg" "node-v20.18.1.pkg"
add_to_manifest "installers/uv-aarch64-apple-darwin.tar.gz" "uv-aarch64-apple-darwin.tar.gz"

echo ""
echo -e "${BLUE}【应用程序】${NC}"
add_to_manifest "installers/LM-Studio-0.3.30-1-arm64.dmg" "LM-Studio-0.3.30-1-arm64.dmg"
add_to_manifest "installers/NewChat-1.0.3-mac-arm64.dmg" "NewChat-1.0.3-mac-arm64.dmg"

echo ""
echo -e "${BLUE}【Docker镜像】${NC}"
add_to_manifest "installers/docker_images/elasticsearch-8.17.3.tar" "elasticsearch-8.17.3.tar"
add_to_manifest "installers/docker_images/kibana-8.17.3.tar" "kibana-8.17.3.tar"
add_to_manifest "installers/docker_images/logstash-8.17.3.tar" "logstash-8.17.3.tar"
add_to_manifest "installers/newflow-1.0.3.tar" "newflow-1.0.3.tar"
add_to_manifest "installers/newflow-docs-1.0.tar" "newflow-docs-1.0.tar"
add_to_manifest "installers/newchat-docs-1.0.1.tar" "newchat-docs-1.0.1.tar"
add_to_manifest "installers/newmind-mcp-elasticsearch-1.0.0.tar" "newmind-mcp-elasticsearch-1.0.0.tar"
add_to_manifest "installers/newmind-mcp-kibana-1.0.0.tar" "newmind-mcp-kibana-1.0.0.tar"
add_to_manifest "installers/newmind-mcp-newflow-1.0.0.tar" "newmind-mcp-newflow-1.0.0.tar"

echo ""
echo -e "${BLUE}【AI模型】${NC}"
for model_tar in "$COMPRESSED_DIR"/qwen3-*.tar.gz; do
    if [ -f "$model_tar" ]; then
        model_name=$(basename "$model_tar")
        add_to_manifest "$model_tar" "$model_name"
    fi
done

echo ""
echo -e "${GREEN}✓ 清单生成完成${NC}"
echo ""

# ==================== 步骤 4: 显示上传计划 ====================

echo -e "${BLUE}步骤 4/5: 上传计划${NC}"
echo ""

total_count=$(wc -l < "$MANIFEST_FILE" | tr -d ' ')
echo -e "${BLUE}📦 待上传文件: $total_count 个${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
printf "%-50s %10s\n" "文件名" "大小"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

while IFS='|' read -r local_path remote_name size md5; do
    printf "%-50s %10s\n" "$remote_name" "$size"
done < "$MANIFEST_FILE"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 确认上传
echo -e "${YELLOW}⚠️  即将上传到服务器: ${SERVER}${NC}"
echo -e "${YELLOW}   目标目录: ${REMOTE_PATH}${NC}"
echo ""
read -p "确认开始上传? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消上传${NC}"
    exit 0
fi

# ==================== 步骤 5: 上传文件 ====================

echo ""
echo -e "${BLUE}步骤 5/5: 上传文件到服务器...${NC}"
echo ""

# 测试SSH连接
echo -e "${BLUE}→ 测试SSH连接...${NC}"
if ! ssh -n -o ConnectTimeout=5 "$SERVER" "echo '连接成功'" &>/dev/null; then
    echo -e "${RED}❌ 无法连接到服务器: $SERVER${NC}"
    echo -e "${YELLOW}   请检查SSH配置和网络连接${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH连接正常${NC}"
echo ""

# 确保远程目录存在
echo -e "${BLUE}→ 创建远程目录...${NC}"
ssh -n "$SERVER" "mkdir -p $REMOTE_PATH"
echo -e "${GREEN}✓ 远程目录已就绪${NC}"
echo ""

# 上传文件
upload_count=0
success_count=0
failed_files=()

while IFS='|' read -r local_path remote_name size md5; do
    upload_count=$((upload_count + 1))
    
    # 调试：显示读取到的值
    # echo "[DEBUG] local_path=[$local_path] remote_name=[$remote_name] size=[$size] md5=[$md5]"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[$upload_count/$total_count] 上传: $remote_name ($size)${NC}"
    
    # 检查远程文件是否已存在且MD5相同
    # 注意：必须使用 -n 防止SSH从stdin读取（会破坏while循环）
    remote_md5=$(ssh -n "$SERVER" "md5sum $REMOTE_PATH/$remote_name 2>/dev/null | cut -d' ' -f1" || echo "")
    
    if [ "$remote_md5" = "$md5" ]; then
        echo -e "${GREEN}  ✓ 文件已存在且校验通过，跳过${NC}"
        success_count=$((success_count + 1))
        continue
    fi
    
    # 上传文件（显示进度）
    echo -e "${YELLOW}  → 上传中...${NC}"
    
    # 使用rsync显示进度（推荐）
    if command -v rsync &> /dev/null; then
        # rsync会显示详细进度信息
        if rsync -avz --progress -e ssh "$local_path" "$SERVER:$REMOTE_PATH/$remote_name"; then
            upload_success=true
        else
            upload_success=false
        fi
    else
        # 使用pv显示进度（如果可用）
        if command -v pv &> /dev/null; then
            echo -e "${BLUE}  文件大小: $size${NC}"
            if pv "$local_path" | ssh "$SERVER" "cat > $REMOTE_PATH/$remote_name"; then
                upload_success=true
            else
                upload_success=false
            fi
        else
            # 降级使用scp（无进度显示）
            echo -e "${YELLOW}  提示: 安装rsync或pv可显示进度 (brew install rsync pv)${NC}"
            if scp "$local_path" "$SERVER:$REMOTE_PATH/$remote_name"; then
                upload_success=true
            else
                upload_success=false
            fi
        fi
    fi
    
    if [ "$upload_success" = true ]; then
        # 验证上传后的MD5
        remote_md5=$(ssh -n "$SERVER" "md5sum $REMOTE_PATH/$remote_name | cut -d' ' -f1")
        
        if [ "$remote_md5" = "$md5" ]; then
            echo -e "${GREEN}  ✓ 上传成功，校验通过${NC}"
            success_count=$((success_count + 1))
        else
            echo -e "${RED}  ✗ 上传后校验失败${NC}"
            echo -e "${YELLOW}    本地MD5: $md5${NC}"
            echo -e "${YELLOW}    远程MD5: $remote_md5${NC}"
            failed_files+=("$remote_name")
        fi
    else
        echo -e "${RED}  ✗ 上传失败${NC}"
        failed_files+=("$remote_name")
    fi
    
done < "$MANIFEST_FILE"

# ==================== 上传校验文件 ====================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}→ 上传校验文件...${NC}"
scp -q "$CHECKSUM_FILE" "$SERVER:$REMOTE_PATH/checksums.txt"
echo -e "${GREEN}✓ checksums.txt 已上传${NC}"

# ==================== 总结 ====================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    上传完成                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✓ 成功: $success_count/$total_count 个文件${NC}"

if [ ${#failed_files[@]} -gt 0 ]; then
    echo -e "${RED}✗ 失败: ${#failed_files[@]} 个文件${NC}"
    echo ""
    echo -e "${YELLOW}失败的文件:${NC}"
    for file in "${failed_files[@]}"; do
        echo -e "${YELLOW}  • $file${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 建议:${NC}"
    echo -e "${YELLOW}   1. 检查网络连接${NC}"
    echo -e "${YELLOW}   2. 检查服务器磁盘空间${NC}"
    echo -e "${YELLOW}   3. 重新运行此脚本（已成功的文件会自动跳过）${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 所有文件上传成功！${NC}"
    echo ""
    echo -e "${BLUE}服务器信息:${NC}"
    echo -e "  • 服务器: $SERVER"
    echo -e "  • 路径: $REMOTE_PATH"
    echo -e "  • 文件数: $total_count"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  • https://xiaopenges.tocharian.eu/download/"
    echo ""
    echo -e "${BLUE}校验文件:${NC}"
    echo -e "  • https://xiaopenges.tocharian.eu/download/checksums.txt"
fi

# 清理临时文件
rm -rf "$TEMP_DIR"

echo ""

