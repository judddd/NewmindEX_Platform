#!/bin/bash

# 安装步骤 06: 复制 AI 模型
# 将AI模型从安装包复制到LM Studio模型目录

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/utils.sh"
source "$SCRIPT_DIR/../lib/checks.sh"
source "$SCRIPT_DIR/../lib/state.sh"

STEP_ID="06_copy_models"

# 模型目标目录
MODELS_TARGET_DIR="$HOME/.lmstudio/models"

# ==================== 主函数 ====================

run_step() {
    log_info "开始复制 AI 模型..."
    mark_step_in_progress "$STEP_ID"
    
    # 检查模型源目录
    if [ ! -d "installers/models" ]; then
        log_warn "模型源目录不存在: installers/models"
        log_info "跳过模型复制，可稍后手动下载"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 检查是否有模型（直接在models下的目录）
    local model_count=$(find installers/models -maxdepth 1 -type d -name "qwen*" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$model_count" -eq 0 ]; then
        log_warn "未发现AI模型文件"
        log_info "跳过模型复制，可稍后手动下载"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 显示模型列表
    show_models_list
    
    # 询问是否复制
    echo ""
    log_warn "复制AI模型需要15-20分钟，占用约135GB空间"
    if ! ask_proceed "是否复制AI模型"; then
        log_info "跳过模型复制"
        mark_step_completed "$STEP_ID"
        return 0
    fi
    
    # 创建目标目录
    mkdir -p "$MODELS_TARGET_DIR"
    
    # 复制模型
    if copy_all_models; then
        if verify_step; then
            mark_step_completed "$STEP_ID"
            return 0
        else
            log_warn "模型复制完成但验证有问题"
            mark_step_completed "$STEP_ID"
            return 0
        fi
    else
        log_error "模型复制失败"
        mark_step_failed "$STEP_ID" "复制失败"
        return 1
    fi
}

# 显示模型列表
show_models_list() {
    echo ""
    echo -e "${CYAN}发现以下AI模型:${NC}"
    echo ""
    
    local total_size=0
    local model_num=0
    
    # 直接遍历models目录下的模型
    for model_dir in installers/models/qwen*; do
        if [ ! -d "$model_dir" ]; then
            continue
        fi
        
        model_num=$((model_num + 1))
        local model_name=$(basename "$model_dir")
        local size=$(du -sh "$model_dir" 2>/dev/null | cut -f1)
        
        echo -e "  ${GREEN}$model_num.${NC} $model_name ${YELLOW}($size)${NC}"
        
        # 累加大小（近似）
        local size_gb=$(du -sg "$model_dir" 2>/dev/null | cut -f1)
        total_size=$((total_size + size_gb))
    done
    
    echo ""
    echo -e "${CYAN}总计: $model_num 个模型, 约 ${total_size}GB${NC}"
}

# 复制所有模型
copy_all_models() {
    log_info "开始复制模型文件..."
    echo ""
    
    local model_num=0
    local total_models=$(find installers/models -maxdepth 1 -type d -name "qwen*" | wc -l | tr -d ' ')
    
    if [ "$total_models" -eq 0 ]; then
        log_warn "未找到模型文件"
        return 1
    fi
    
    start_timer
    
    # 直接复制models目录下的模型到LM Studio目录
    # LM Studio的模型目录结构: ~/.lmstudio/models/provider/model-name
    # 我们将qwen3-xxx放到 lmstudio-community 目录下
    for model_dir in installers/models/qwen*; do
        if [ ! -d "$model_dir" ]; then
            continue
        fi
        
        model_num=$((model_num + 1))
        local model_name=$(basename "$model_dir")
        
        log_info "[$model_num/$total_models] 复制模型: $model_name"
        
        # 目标路径 - LM Studio使用 provider/model 结构
        # 根据模型名称判断provider
        local provider="lmstudio-community"
        if [[ "$model_name" == *"qwen"* ]]; then
            provider="lmstudio-community"
        fi
        
        local target_provider_dir="$MODELS_TARGET_DIR/$provider"
        local target_model_dir="$target_provider_dir/$model_name"
        
        # 如果已存在，询问是否覆盖
        if [ -d "$target_model_dir" ]; then
            log_warn "模型已存在: $model_name"
            echo -ne "${YELLOW}是否覆盖? [y/N] ${NC}"
            read -r response
            # 转换为小写（兼容旧版bash）
            response=$(echo "$response" | tr '[:upper:]' '[:lower:]')
            if [[ ! "$response" =~ ^(y|yes)$ ]]; then
                log_info "跳过: $model_name"
                continue
            fi
            rm -rf "$target_model_dir"
        fi
        
        # 创建目标目录
        mkdir -p "$target_provider_dir"
        
        # 复制（使用cp -R，兼容性最好）
        log_info "   正在复制..."
        if cp -R "$model_dir" "$target_model_dir"; then
            local size=$(du -sh "$target_model_dir" | cut -f1)
            log_success "完成: $model_name ($size)"
            
            # 显示进度
            show_progress $model_num $total_models "总体进度"
            
            # 显示预计剩余时间
            local remaining=$(estimate_remaining_time $model_num $total_models)
            echo -e "${CYAN}   预计剩余时间: $remaining${NC}"
            echo ""
        else
            log_error "复制失败: $model_name"
            return 1
        fi
    done
    
    local elapsed=$(get_elapsed_time)
    local elapsed_formatted=$(format_time $elapsed)
    
    log_success "所有模型复制完成！耗时: $elapsed_formatted"
    return 0
}

# 验证步骤
verify_step() {
    log_info "验证模型复制..."
    
    if [ ! -d "$MODELS_TARGET_DIR" ]; then
        log_warn "模型目录不存在（可能跳过了复制）"
        return 0
    fi
    
    local installed_count=$(find "$MODELS_TARGET_DIR" -type d -mindepth 2 -maxdepth 2 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$installed_count" -gt 0 ]; then
        log_success "已安装模型数量: $installed_count"
        return 0
    else
        log_warn "未发现已安装的模型"
        return 0
    fi
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    run_step
fi

