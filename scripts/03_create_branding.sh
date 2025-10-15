#!/bin/bash

# 模块：品牌资源创建
# 功能：创建Kibana自定义Logo和品牌资源

set -e

echo "🎨 创建品牌资源..."

# 创建占位符Logo SVG
cat > elasticsearch/branding/kibana_logo.svg << 'EOF'
<svg width="600" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="120" fill="#1a1a2e"/>
  <text x="50" y="70" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
    NewMind AI
  </text>
</svg>
EOF

# 创建占位符图标 SVG
cat > elasticsearch/branding/kibana_mark.svg << 'EOF'
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#667eea"/>
  <text x="32" y="42" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">
    NM
  </text>
</svg>
EOF

# 创建横幅 SVG
cat > elasticsearch/branding/kibana_banner.svg << 'EOF'
<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="200" fill="url(#grad1)"/>
  <text x="400" y="110" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle">
    NewMind AI Platform
  </text>
  <text x="400" y="150" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle" opacity="0.9">
    Enterprise AI Workflow Solution
  </text>
</svg>
EOF

echo "✅ 品牌资源创建完成！"
echo "   提示：您可以替换 elasticsearch/branding/ 目录下的SVG文件为自定义Logo"

