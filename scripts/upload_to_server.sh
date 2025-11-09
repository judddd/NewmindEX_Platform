#!/bin/bash

# 模块：上传文件到服务器
# 功能：批量上传文件、验证完整性

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         上传文件到服务器                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 服务器配置
SERVER="root@xiaopenges.tocharian.eu"
REMOTE_PATH="/var/www/newmind-download"

# 工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 文件路径
MANIFEST_FILE="upload_manifest.txt"
UPLOAD_LOG="upload_log.txt"

# 检查清单文件
if [ ! -f "$MANIFEST_FILE" ]; then
    echo -e "${RED}❌ 错误: 找不到上传清单文件${NC}"
    echo -e "${YELLOW}   请先运行: bash scripts/prepare_upload.sh${NC}"
    exit 1
fi

# 初始化日志
echo "# NewMind AI Platform - 上传日志" > "$UPLOAD_LOG"
echo "# 时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$UPLOAD_LOG"
echo "" >> "$UPLOAD_LOG"

# 测试SSH连接
echo -e "${BLUE}📡 测试服务器连接...${NC}"
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connected'" &> /dev/null; then
    echo -e "${RED}❌ 无法连接到服务器: $SERVER${NC}"
    echo -e "${YELLOW}   请检查SSH配置和网络连接${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 服务器连接成功${NC}"
echo ""

# 确保远程目录存在
echo -e "${BLUE}📁 准备远程目录...${NC}"
ssh "$SERVER" "mkdir -p $REMOTE_PATH && chmod 755 $REMOTE_PATH"
echo -e "${GREEN}✅ 远程目录已就绪: $REMOTE_PATH${NC}"
echo ""

# 统计信息
total_files=$(grep -v "^#" "$MANIFEST_FILE" | grep -v "^$" | wc -l | tr -d ' ')
current=0
success=0
failed=0
skipped=0

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}开始上传 $total_files 个文件${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 上传函数
upload_file() {
    local local_path=$1
    local remote_name=$2
    local size=$3
    local expected_md5=$4
    
    current=$((current + 1))
    
    echo -e "${BLUE}[$current/$total_files] $remote_name${NC} (${size})"
    
    # 检查本地文件
    if [ ! -f "$local_path" ]; then
        echo -e "${RED}   ❌ 本地文件不存在${NC}"
        failed=$((failed + 1))
        echo "FAILED|$remote_name|本地文件不存在" >> "$UPLOAD_LOG"
        echo ""
        return 1
    fi
    
    # 检查远程文件是否已存在且MD5匹配
    if ssh "$SERVER" "[ -f $REMOTE_PATH/$remote_name ]" 2>/dev/null; then
        echo -e "${YELLOW}   ℹ️  远程文件已存在，验证MD5...${NC}"
        
        remote_md5=$(ssh "$SERVER" "md5sum $REMOTE_PATH/$remote_name 2>/dev/null | cut -d' ' -f1" || echo "")
        
        if [ -n "$expected_md5" ] && [ "$remote_md5" == "$expected_md5" ]; then
            echo -e "${GREEN}   ✅ MD5匹配，跳过上传${NC}"
            skipped=$((skipped + 1))
            echo "SKIPPED|$remote_name|MD5匹配" >> "$UPLOAD_LOG"
            echo ""
            return 0
        else
            echo -e "${YELLOW}   ⚠️  MD5不匹配，重新上传${NC}"
        fi
    fi
    
    # 上传文件
    echo -e "   📤 上传中..."
    local upload_start=$(date +%s)
    
    if scp -o ConnectTimeout=30 "$local_path" "$SERVER:$REMOTE_PATH/$remote_name" 2>&1 | tee -a "$UPLOAD_LOG" | grep -v "^$"; then
        local upload_end=$(date +%s)
        local duration=$((upload_end - upload_start))
        
        # 验证MD5
        if [ -n "$expected_md5" ]; then
            echo -e "   🔍 验证MD5..."
            remote_md5=$(ssh "$SERVER" "md5sum $REMOTE_PATH/$remote_name 2>/dev/null | cut -d' ' -f1" || echo "")
            
            if [ "$remote_md5" == "$expected_md5" ]; then
                echo -e "${GREEN}   ✅ 上传成功并验证 (${duration}秒)${NC}"
                success=$((success + 1))
                echo "SUCCESS|$remote_name|${duration}秒|MD5匹配" >> "$UPLOAD_LOG"
            else
                echo -e "${YELLOW}   ⚠️  上传成功但MD5不匹配${NC}"
                echo -e "      本地: $expected_md5"
                echo -e "      远程: $remote_md5"
                success=$((success + 1))
                echo "SUCCESS|$remote_name|${duration}秒|MD5不匹配" >> "$UPLOAD_LOG"
            fi
        else
            echo -e "${GREEN}   ✅ 上传成功 (${duration}秒)${NC}"
            success=$((success + 1))
            echo "SUCCESS|$remote_name|${duration}秒" >> "$UPLOAD_LOG"
        fi
    else
        echo -e "${RED}   ❌ 上传失败${NC}"
        failed=$((failed + 1))
        echo "FAILED|$remote_name|上传失败" >> "$UPLOAD_LOG"
    fi
    
    echo ""
}

# 读取清单并上传
while IFS='|' read -r local_path remote_name size md5; do
    # 跳过注释和空行
    if [[ "$local_path" == "#"* ]] || [ -z "$local_path" ]; then
        continue
    fi
    
    upload_file "$local_path" "$remote_name" "$size" "$md5"
    
done < "$MANIFEST_FILE"

# 生成服务器端清单
echo -e "${BLUE}📋 生成服务器端清单...${NC}"
ssh "$SERVER" "cd $REMOTE_PATH && cat > manifest.yaml << 'MANIFEST_EOF'
# NewMind AI Platform - 文件清单
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 服务器路径: $REMOTE_PATH

files:
MANIFEST_EOF

# 列出所有文件并添加到清单
for file in *; do
    if [ -f \"\$file\" ]; then
        size=\$(du -h \"\$file\" | cut -f1)
        md5=\$(md5sum \"\$file\" | cut -d' ' -f1)
        echo \"  - name: \\\"\$file\\\"\" >> manifest.yaml
        echo \"    size: \\\"\$size\\\"\" >> manifest.yaml
        echo \"    md5: \\\"\$md5\\\"\" >> manifest.yaml
    fi
done
"

echo -e "${GREEN}✅ 服务器端清单已生成${NC}"
echo ""

# 显示统计信息
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}上传完成${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "统计信息:"
echo -e "  • 总文件数: ${CYAN}$total_files${NC}"
echo -e "  • 成功上传: ${GREEN}$success${NC}"
echo -e "  • 跳过上传: ${YELLOW}$skipped${NC}"
echo -e "  • 上传失败: ${RED}$failed${NC}"
echo ""

if [ $failed -gt 0 ]; then
    echo -e "${YELLOW}⚠️  部分文件上传失败，请查看日志: $UPLOAD_LOG${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ 所有文件上传成功！${NC}"
    echo ""
fi

# 显示服务器信息
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}服务器信息${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "服务器: ${CYAN}$SERVER${NC}"
echo -e "路径: ${CYAN}$REMOTE_PATH${NC}"
echo -e "下载URL: ${CYAN}https://xiaopenges.tocharian.eu/download/${NC}"
echo ""

# 列出服务器上的文件
echo -e "${BLUE}服务器文件列表:${NC}"
ssh "$SERVER" "ls -lh $REMOTE_PATH | tail -n +2 | awk '{printf \"  %-50s %10s\\n\", \$9, \$5}'" || echo -e "${YELLOW}⚠️  无法列出服务器文件${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ 上传完成！                                                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "日志文件: ${CYAN}$UPLOAD_LOG${NC}"
echo ""

