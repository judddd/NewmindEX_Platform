#!/bin/bash

# 模块：生成服务器端清单
# 功能：SSH连接到服务器，扫描目录，生成可用文件清单

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         生成服务器端文件清单                                   ║"
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
OUTPUT_FILE="server_manifest.yaml"

echo -e "${BLUE}📡 连接到服务器...${NC}"
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connected'" &> /dev/null; then
    echo -e "${RED}❌ 无法连接到服务器: $SERVER${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 服务器连接成功${NC}"
echo ""

echo -e "${BLUE}📋 扫描服务器目录...${NC}"
echo -e "${CYAN}   路径: $REMOTE_PATH${NC}"
echo ""

# 生成清单
ssh "$SERVER" "cd $REMOTE_PATH && cat > manifest.yaml << 'YAML_START'
# NewMind AI Platform - 服务器文件清单
# 生成时间: \$(date '+%Y-%m-%d %H:%M:%S')
# 服务器: $SERVER
# 路径: $REMOTE_PATH
# 下载URL: https://xiaopenges.tocharian.eu/download/

server:
  host: \"xiaopenges.tocharian.eu\"
  path: \"$REMOTE_PATH\"
  base_url: \"https://xiaopenges.tocharian.eu/download\"

files:
YAML_START

# 扫描并添加文件信息
for file in *; do
    if [ -f \"\$file\" ] && [ \"\$file\" != \"manifest.yaml\" ]; then
        size=\$(du -h \"\$file\" | cut -f1)
        md5=\$(md5sum \"\$file\" 2>/dev/null | cut -d' ' -f1 || echo 'N/A')
        mtime=\$(stat -c %y \"\$file\" 2>/dev/null | cut -d'.' -f1 || stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' \"\$file\" 2>/dev/null || echo 'N/A')
        
        # 确定文件类型
        file_type=\"unknown\"
        case \"\$file\" in
            *.dmg) file_type=\"application\" ;;
            *.pkg) file_type=\"system\" ;;
            *.tar) file_type=\"docker_image\" ;;
            *.tar.gz) file_type=\"model\" ;;
            *.sh) file_type=\"script\" ;;
        esac
        
        echo \"  - name: \\\"\$file\\\"\" >> manifest.yaml
        echo \"    size: \\\"\$size\\\"\" >> manifest.yaml
        echo \"    md5: \\\"\$md5\\\"\" >> manifest.yaml
        echo \"    type: \\\"\$file_type\\\"\" >> manifest.yaml
        echo \"    modified: \\\"\$mtime\\\"\" >> manifest.yaml
        echo \"    url: \\\"https://xiaopenges.tocharian.eu/download/\$file\\\"\" >> manifest.yaml
        echo \"\" >> manifest.yaml
    fi
done

# 添加统计信息
echo \"statistics:\" >> manifest.yaml
echo \"  total_files: \$(ls -1 | wc -l | tr -d ' ')\" >> manifest.yaml
echo \"  total_size: \$(du -sh . | cut -f1)\" >> manifest.yaml
echo \"  applications: \$(ls -1 *.dmg 2>/dev/null | wc -l | tr -d ' ')\" >> manifest.yaml
echo \"  docker_images: \$(ls -1 *.tar 2>/dev/null | wc -l | tr -d ' ')\" >> manifest.yaml
echo \"  models: \$(ls -1 *.tar.gz 2>/dev/null | wc -l | tr -d ' ')\" >> manifest.yaml
"

echo -e "${GREEN}✅ 服务器端清单已生成${NC}"
echo ""

# 下载清单到本地
echo -e "${BLUE}📥 下载清单到本地...${NC}"
if scp "$SERVER:$REMOTE_PATH/manifest.yaml" "$OUTPUT_FILE"; then
    echo -e "${GREEN}✅ 清单已保存到: $OUTPUT_FILE${NC}"
    echo ""
    
    # 显示清单内容
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}服务器文件清单${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 解析并显示统计信息
    if command -v yq &> /dev/null; then
        echo -e "${YELLOW}统计信息:${NC}"
        yq eval '.statistics' "$OUTPUT_FILE"
        echo ""
    else
        # 简单解析（不依赖yq）
        echo -e "${YELLOW}统计信息:${NC}"
        grep -A5 "^statistics:" "$OUTPUT_FILE" | sed 's/^/  /'
        echo ""
    fi
    
    # 显示文件列表
    echo -e "${YELLOW}文件列表:${NC}"
    if command -v yq &> /dev/null; then
        yq eval '.files[] | "  • " + .name + " (" + .size + ")"' "$OUTPUT_FILE"
    else
        grep "name:" "$OUTPUT_FILE" | sed 's/.*name: "\(.*\)"/  • \1/'
    fi
    
else
    echo -e "${RED}❌ 下载清单失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ 完成！                                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "生成的文件:"
echo -e "  • ${CYAN}$OUTPUT_FILE${NC} - 本地清单"
echo -e "  • ${CYAN}$REMOTE_PATH/manifest.yaml${NC} - 服务器端清单"
echo ""
echo -e "下载URL: ${CYAN}https://xiaopenges.tocharian.eu/download/manifest.yaml${NC}"
echo ""

