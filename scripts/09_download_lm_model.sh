#!/bin/bash

# 模块：LM Studio模型下载
# 功能：下载Qwen模型并启动服务

set -e

echo "🤖 配置LM Studio模型..."

# 加载环境变量（安全方式）
if [ -f .env ]; then
    set -a
    source <(grep -v '^#' .env | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/#.*$//' | sed 's/[[:space:]]*$//')
    set +a
fi

LM_MODEL="${LM_MODEL:-qwen/qwen3-coder-30b}"
LM_VARIANT="${LM_VARIANT:-mlx}"
LM_PORT="${LMSTUDIO_PORT:-1234}"

# 检查lms命令
if ! command -v lms &> /dev/null; then
    echo "❌ lms命令不可用"
    echo "   请确保已安装LM Studio CLI工具"
    echo "   在LM Studio应用中: Settings > Developer > Install CLI"
    exit 1
fi

echo "✅ lms命令可用"

# 检查模型是否已下载
echo "🔍 检查模型状态..."
if lms ls | grep -q "$LM_MODEL"; then
    echo "✅ 模型已下载: $LM_MODEL"
else
    echo "📥 下载模型: $LM_MODEL (这可能需要较长时间，约30GB)..."
    echo "   变体: $LM_VARIANT"
    
    # 下载模型
    lms get "$LM_MODEL" --variant "$LM_VARIANT"
    
    echo "✅ 模型下载完成"
fi

# 检查LM Studio服务是否已运行
if lsof -Pi :$LM_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ LM Studio服务已在端口 $LM_PORT 运行"
    exit 0
fi

echo "🚀 启动LM Studio服务..."
echo "   模型: $LM_MODEL"
echo "   端口: $LM_PORT"

# 后台启动LM Studio服务
nohup lms server start --model "$LM_MODEL" --port "$LM_PORT" > lmstudio.log 2>&1 &

# 等待服务启动
echo "⏳ 等待服务启动..."
MAX_WAIT=60
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:$LM_PORT/v1/models > /dev/null 2>&1; then
        echo "✅ LM Studio服务启动成功"
        echo ""
        echo "🔗 服务地址: http://localhost:$LM_PORT"
        echo "📊 测试命令:"
        echo "   curl http://localhost:$LM_PORT/v1/models"
        exit 0
    fi
    
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "❌ LM Studio服务启动超时"
echo "   请检查日志: tail -f lmstudio.log"
exit 1

