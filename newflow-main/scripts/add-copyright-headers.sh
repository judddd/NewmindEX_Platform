#!/bin/bash

# NewFlow 版权头添加脚本
# 只添加版权声明，不添加版本标识到所有文件

set -e

ROOT_DIR="/Users/macbook2022/Downloads/project_agent/elk-analysis-agent/n8n"
cd "$ROOT_DIR"

echo "🚀 开始添加 NewFlow 版权头..."
echo ""

# 定义版权头模板
create_ts_header() {
    cat << 'EOF'
/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 * 
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

EOF
}

create_vue_header() {
    cat << 'EOF'
<!--
  Modified by NewFlow Team
  Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
  Modified work: Copyright (c) 2024, NewFlow Team
  
  This file is part of NewFlow, a modified version of n8n.
  License: Sustainable Use License (see LICENSE.md)
-->

EOF
}

# 统计变量
count_ts=0
count_vue=0
count_skipped=0

# 处理 TypeScript 文件
echo "📝 处理 TypeScript 文件..."
find packages/cli/src packages/core/src packages/workflow/src \
     packages/frontend/editor-ui/src packages/@newflow/*/src \
     -name "*.ts" -type f 2>/dev/null | while read file; do
    
    # 跳过已经有 NewFlow 标记的文件
    if grep -q "Modified by NewFlow Team" "$file" 2>/dev/null; then
        ((count_skipped++)) || true
        continue
    fi
    
    # 跳过 node_modules 和 dist
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"/dist/"* ]]; then
        continue
    fi
    
    # 添加头部
    create_ts_header > /tmp/newflow_header.tmp
    cat "$file" >> /tmp/newflow_header.tmp
    mv /tmp/newflow_header.tmp "$file"
    
    ((count_ts++)) || true
    
    # 每 50 个文件输出一次进度
    if [ $((count_ts % 50)) -eq 0 ]; then
        echo "  已处理 $count_ts 个 TS 文件..."
    fi
done

echo "✅ TypeScript 文件处理完成: $count_ts 个"
echo ""

# 处理 Vue 文件
echo "🎨 处理 Vue 文件..."
find packages/frontend/editor-ui/src packages/@newflow/*/src \
     -name "*.vue" -type f 2>/dev/null | while read file; do
    
    # 跳过已经有 NewFlow 标记的文件
    if grep -q "Modified by NewFlow Team" "$file" 2>/dev/null; then
        ((count_skipped++)) || true
        continue
    fi
    
    # 跳过 node_modules 和 dist
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"/dist/"* ]]; then
        continue
    fi
    
    # 添加头部
    create_vue_header > /tmp/newflow_header.tmp
    cat "$file" >> /tmp/newflow_header.tmp
    mv /tmp/newflow_header.tmp "$file"
    
    ((count_vue++)) || true
    
    # 每 50 个文件输出一次进度
    if [ $((count_vue % 50)) -eq 0 ]; then
        echo "  已处理 $count_vue 个 Vue 文件..."
    fi
done

echo "✅ Vue 文件处理完成: $count_vue 个"
echo ""

# 只在关键位置添加版本标识
echo "🔖 添加版本标识到关键位置..."

# 1. CLI 入口
cat > packages/cli/src/newflow-version.ts << 'VERSION_EOF'
/**
 * NewFlow Version Information
 */

export const NEWFLOW_INFO = {
	version: '1.0.0',
	buildDate: '2024-11-18',
	forkFrom: 'n8n@1.110.0',
	description: 'NewFlow - AI-powered workflow automation',
	modifications: [
		'Removed enterprise features (SSO, LDAP, External Secrets, etc.)',
		'Removed telemetry and diagnostics',
		'Re-branded from n8n to NewFlow',
		'Optimized for AI agent workflows',
		'Prepared for MCP integration',
	],
	license: 'Sustainable Use License (from n8n)',
	originalProject: 'https://github.com/n8n-io/n8n',
};
VERSION_EOF

echo "  ✅ packages/cli/src/newflow-version.ts"

# 2. 前端常量
if ! grep -q "NEWFLOW_INFO" packages/frontend/editor-ui/src/constants.ts; then
cat >> packages/frontend/editor-ui/src/constants.ts << 'CONST_EOF'

// NewFlow Version Info
export const NEWFLOW_INFO = {
	version: '1.0.0',
	forkFrom: 'n8n@1.110.0',
	buildDate: '2024-11-18',
};
CONST_EOF
    echo "  ✅ packages/frontend/editor-ui/src/constants.ts"
fi

echo ""
echo "📊 统计结果："
echo "  TypeScript 文件: $count_ts 个"
echo "  Vue 文件: $count_vue 个"
echo "  跳过文件: $count_skipped 个"
echo "  版本标识: 2 个关键位置"
echo ""
echo "✅ 全部完成！"
echo ""
echo "💡 提示："
echo "  - 所有源文件已添加 NewFlow 版权头"
echo "  - 文件哈希值已全部改变"
echo "  - 可以运行 'git diff' 查看改动"
echo "  - 建议先 commit 这些改动"
