#!/bin/bash

# 安装步骤 07: AI 模型说明
# 指导用户手动下载模型

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="07_copy_models"

run_step() {
    log_info "AI 模型配置说明"
    mark_step_in_progress "$STEP_ID"
    
    echo ""
    log_warn "注意：本安装包不再预置 AI 模型"
    echo ""
    echo "请在安装完成后，打开 LM Studio 手动下载所需模型："
    echo ""
    echo "1. 视觉模型 (推荐): Qwen3-VL-30B"
    echo "   - 用于多模态视觉理解和代码生成"
    echo ""
    echo "2. 聊天模型 (推荐): Qwen3-Next-80B"
    echo "   - 用于通用对话、逻辑推理和复杂任务"
    echo ""
    echo "3. 向量模型 (推荐): text-embedding-qwen3-embedding-4b"
    echo "   - 用于 RAG 知识库向量化"
    echo ""
    echo "下载方法："
    echo "   打开 LM Studio -> 点击左侧搜索图标 -> 输入模型名称 -> 点击下载"
    echo ""
    
    mark_step_completed "$STEP_ID"
    return 0
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi
