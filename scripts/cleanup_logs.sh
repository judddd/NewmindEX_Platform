#!/bin/bash
# 日志清理脚本 - 删除90天前的日志，压缩30天前的日志

set -e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"

# 配置参数
RETENTION_DAYS=90        # 保留90天
COMPRESS_AFTER_DAYS=30   # 30天后压缩

echo "======================================"
echo "日志清理工具"
echo "======================================"
echo "日志目录: $LOGS_DIR"
echo "保留期限: ${RETENTION_DAYS} 天"
echo "压缩策略: ${COMPRESS_AFTER_DAYS} 天后压缩"
echo ""

# 确保日志目录存在
if [ ! -d "$LOGS_DIR" ]; then
    echo "❌ 日志目录不存在: $LOGS_DIR"
    exit 1
fi

cd "$LOGS_DIR"

# 1. 删除90天前的日志文件
echo "🗑️  清理 ${RETENTION_DAYS} 天前的日志..."
DELETED_COUNT=0

# 删除主日志文件
for pattern in "*.log" "*.log.*" "*.gz"; do
    if files=$(find . -name "$pattern" -type f -mtime +$RETENTION_DAYS 2>/dev/null); then
        for file in $files; do
            rm -f "$file"
            DELETED_COUNT=$((DELETED_COUNT + 1))
            echo "  删除: $file"
        done
    fi
done

# 删除MCP容器日志
if [ -d "mcp_containers" ]; then
    if files=$(find mcp_containers -type f -mtime +$RETENTION_DAYS 2>/dev/null); then
        for file in $files; do
            rm -f "$file"
            DELETED_COUNT=$((DELETED_COUNT + 1))
            echo "  删除: $file"
        done
    fi
    
    # 删除空目录
    find mcp_containers -type d -empty -delete 2>/dev/null || true
fi

if [ $DELETED_COUNT -eq 0 ]; then
    echo "  ✓ 没有需要删除的旧日志"
else
    echo "  ✅ 已删除 $DELETED_COUNT 个旧日志文件"
fi

# 2. 压缩30天前的日志文件
echo ""
echo "📦 压缩 ${COMPRESS_AFTER_DAYS} 天前的日志..."
COMPRESSED_COUNT=0

# 压缩主日志文件（排除已压缩的）
for log_file in $(find . -name "*.log" -type f -mtime +$COMPRESS_AFTER_DAYS -mtime -$RETENTION_DAYS 2>/dev/null); do
    if [ -f "$log_file" ]; then
        gzip "$log_file"
        COMPRESSED_COUNT=$((COMPRESSED_COUNT + 1))
        echo "  压缩: $log_file -> ${log_file}.gz"
    fi
done

# 压缩轮转日志
for log_file in $(find . -name "*.log.*" -type f ! -name "*.gz" -mtime +$COMPRESS_AFTER_DAYS -mtime -$RETENTION_DAYS 2>/dev/null); do
    if [ -f "$log_file" ]; then
        gzip "$log_file"
        COMPRESSED_COUNT=$((COMPRESSED_COUNT + 1))
        echo "  压缩: $log_file -> ${log_file}.gz"
    fi
done

if [ $COMPRESSED_COUNT -eq 0 ]; then
    echo "  ✓ 没有需要压缩的日志"
else
    echo "  ✅ 已压缩 $COMPRESSED_COUNT 个日志文件"
fi

# 3. 显示日志统计信息
echo ""
echo "📊 日志统计信息："
echo "----------------------------------------"

# 统计各类日志文件数量和大小
for log_type in "dashboard" "operations" "mcp_calls" "audit"; do
    count=$(find . -name "${log_type}*.log*" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        size=$(du -sh $(find . -name "${log_type}*.log*" -type f 2>/dev/null) 2>/dev/null | awk '{total+=$1}END{print total}')
        echo "  ${log_type}: ${count} 个文件"
    fi
done

# 统计MCP容器日志
if [ -d "mcp_containers" ]; then
    count=$(find mcp_containers -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        size=$(du -sh mcp_containers 2>/dev/null | awk '{print $1}')
        echo "  MCP容器日志: ${count} 个文件 (${size})"
    fi
fi

# 总体统计
total_size=$(du -sh . 2>/dev/null | awk '{print $1}')
echo "  总计: ${total_size}"

echo ""
echo "✅ 日志清理完成！"


