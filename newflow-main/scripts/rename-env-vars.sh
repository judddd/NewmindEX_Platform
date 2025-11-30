#!/bin/bash

# 将所有 N8N_ 环境变量改为 NEWFLOW_

set -e

ROOT_DIR="/Users/macbook2022/Downloads/project_agent/elk-analysis-agent/n8n"
cd "$ROOT_DIR"

echo "🚀 开始替换 N8N_ 环境变量为 NEWFLOW_..."
echo ""

# 统计
total_files=0
total_replacements=0

# 需要处理的文件类型和目录
TARGETS=(
    "packages/cli/src"
    "packages/core/src"
    "packages/workflow/src"
    "packages/@newflow/*/src"
    "packages/frontend/editor-ui/src"
)

echo "📝 第一步：替换代码中的 N8N_ 引用..."

# 1. 替换 process.env.N8N_ 
find packages -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" \) \
    ! -path "*/node_modules/*" ! -path "*/dist/*" | while read file; do
    
    if grep -q "N8N_" "$file" 2>/dev/null; then
        # 替换各种形式的 N8N_ 引用
        sed -i '' \
            -e 's/process\.env\.N8N_/process.env.NEWFLOW_/g' \
            -e "s/process\.env\['N8N_/process.env['NEWFLOW_/g" \
            -e 's/process\.env\["N8N_/process.env["NEWFLOW_/g' \
            -e "s/'N8N_/'NEWFLOW_/g" \
            -e 's/"N8N_/"NEWFLOW_/g' \
            -e 's/`N8N_/`NEWFLOW_/g' \
            -e 's/\${N8N_/\${NEWFLOW_/g' \
            -e 's/N8N_VERSION/NEWFLOW_VERSION/g' \
            "$file"
        
        ((total_files++)) || true
        
        if [ $((total_files % 50)) -eq 0 ]; then
            echo "  已处理 $total_files 个文件..."
        fi
    fi
done

echo "✅ 代码文件替换完成: $total_files 个"
echo ""

# 2. 替换配置文件中的 N8N_
echo "⚙️  第二步：替换配置文件..."

find . -type f \( \
    -name "*.yml" -o -name "*.yaml" -o \
    -name "*.json" -o -name "*.env*" -o \
    -name "Dockerfile*" -o -name "docker-compose*" \
    \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.git/*" | while read file; do
    
    if grep -q "N8N_" "$file" 2>/dev/null; then
        sed -i '' 's/N8N_/NEWFLOW_/g' "$file"
        echo "  ✓ $file"
    fi
done

echo "✅ 配置文件替换完成"
echo ""

# 3. 替换 README 和文档
echo "📚 第三步：替换文档..."

find . -type f \( -name "*.md" -o -name "*.txt" \) \
    ! -path "*/node_modules/*" ! -path "*/.git/*" | while read file; do
    
    if grep -q "N8N_" "$file" 2>/dev/null; then
        sed -i '' 's/N8N_/NEWFLOW_/g' "$file"
        echo "  ✓ $file"
    fi
done

echo "✅ 文档替换完成"
echo ""

# 4. 特殊处理：package.json 中的脚本
echo "📦 第四步：替换 package.json..."

find packages -name "package.json" ! -path "*/node_modules/*" | while read file; do
    if grep -q "N8N_" "$file" 2>/dev/null; then
        sed -i '' 's/N8N_/NEWFLOW_/g' "$file"
        echo "  ✓ $file"
    fi
done

echo "✅ package.json 替换完成"
echo ""

# 5. 替换 bin 脚本
echo "🔧 第五步：替换可执行脚本..."

find packages -type f -name "n8n" -o -name "*.sh" | while read file; do
    if grep -q "N8N_" "$file" 2>/dev/null; then
        sed -i '' 's/N8N_/NEWFLOW_/g' "$file"
        echo "  ✓ $file"
    fi
done

echo "✅ 可执行脚本替换完成"
echo ""

# 统计最终结果
echo "📊 最终统计："
final_count=$(grep -r "N8N_" packages --include="*.ts" --include="*.js" --include="*.vue" \
    --include="*.json" --include="*.yml" --include="*.yaml" \
    --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | wc -l)
echo "  剩余 N8N_ 引用: $final_count 处（主要在注释中）"
echo ""

echo "✅ 环境变量重命名完成！"
echo ""
echo "⚠️  重要提示："
echo "  1. 运行 'git diff' 查看所有改动"
echo "  2. 更新你的 .env 文件和部署配置"
echo "  3. 更新文档说明新的环境变量名"
echo "  4. 考虑提供迁移脚本给用户"
