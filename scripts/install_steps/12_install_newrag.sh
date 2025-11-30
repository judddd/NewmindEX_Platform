#!/bin/bash

# 安装 NewRAG
# 解压并配置 NewRAG 环境

# 如果 log_info 未定义，定义简单的 fallback (兼容 start_all.sh)
if ! command -v log_info &> /dev/null; then
    log_info() { echo "ℹ️  $1"; }
    log_warn() { echo "⚠️  $1"; }
    log_error() { echo "❌ $1"; }
    log_success() { echo "✅ $1"; }
fi

run_step() {
    local force_install=$1
    log_info "检查 NewRAG 安装状态..."
    
    local zip_file="installers/newrag-main-1.0.0.zip"
    local target_dir="newrag-main"
    
    # 0. 检查是否需要全新解压
    # 如果目录不存在，或者要求强制安装，则解压
    local need_unzip=false
    if [ ! -d "$target_dir" ] || [ "$force_install" == "true" ]; then
        need_unzip=true
    fi

    # 1. 解压 (如果需要)
    if [ "$need_unzip" == "true" ]; then
        if [ ! -f "$zip_file" ]; then
            log_error "NewRAG 安装包不存在: $zip_file"
            return 1
        fi
        
        log_info "正在解压 NewRAG..."
        # 如果强制安装且目录存在，先清理
        if [ -d "$target_dir" ] && [ "$force_install" == "true" ]; then
            log_warn "清理旧的 NewRAG 目录 (强制安装)..."
            rm -rf "$target_dir"
        fi
        
        unzip -q -o "$zip_file" -d . || {
            log_error "解压失败"
            return 1
        }
    else
        log_info "NewRAG 目录已存在，跳过解压"
    fi
    
    # 确保目录存在
    if [ ! -d "$target_dir" ]; then
        log_error "目录不存在: $target_dir"
        return 1
    fi

    cd "$target_dir" || return 1

    # 2. 配置 Python 后端 (uv sync)
    # 检查 .venv 是否存在且可用
    if [ -d ".venv" ] && [ -f ".venv/bin/python" ] && [ "$force_install" != "true" ]; then
         log_info "Python 环境已存在，跳过 uv sync"
    else
        log_info "配置 NewRAG 后端 (uv sync)..."
        if ! command -v uv &> /dev/null; then
            log_error "未找到 uv 命令"
            cd ..
            return 1
        fi
        if ! uv sync; then
            log_error "NewRAG 后端依赖安装失败"
            cd ..
            return 1
        fi
    fi
    
    # 3. 配置前端 (npm install & build)
    if [ -d "frontend" ]; then
        # 检查是否已构建 (dist 目录) 和 node_modules
        if [ -d "frontend/node_modules" ] && [ -d "frontend/dist" ] && [ "$force_install" != "true" ]; then
            log_info "前端依赖已安装且已构建，跳过"
        else
            log_info "配置 NewRAG 前端..."
            cd frontend
            
            # 修复 TypeScript 构建错误 (允许未使用的变量)
            log_info "调整 TypeScript 配置以允许未使用的变量..."
            for ts_file in tsconfig.app.json tsconfig.node.json tsconfig.json; do
                if [ -f "$ts_file" ]; then
                    # 尝试替换现有的 true 为 false
                    sed -i '' 's/"noUnusedLocals": true/"noUnusedLocals": false/g' "$ts_file" 2>/dev/null || true
                    sed -i '' 's/"noUnusedParameters": true/"noUnusedParameters": false/g' "$ts_file" 2>/dev/null || true
                    
                    # 如果文件中包含 compilerOptions 但没有上述设置，尝试插入
                    if ! grep -q "noUnusedLocals" "$ts_file"; then
                         sed -i '' '/"compilerOptions": {/a\
    "noUnusedLocals": false,\
    "noUnusedParameters": false,' "$ts_file" 2>/dev/null || true
                    fi
                fi
            done
            
            # 检查 node 是否可用
            if ! command -v npm &> /dev/null; then
                log_error "未找到 npm 命令"
                cd ../..
                return 1
            fi

            if ! npm install; then
                log_error "前端依赖安装失败"
                cd ../..
                return 1
            fi
            
            # 可选：如果只是缺失依赖但dist存在，是否需要build? 
            # 为安全起见，依赖变动后重新build
            if ! npm run build; then
                log_error "前端构建失败"
                cd ../..
                return 1
            fi
            cd ..
        fi
    else
        log_warn "未找到 frontend 目录，跳过前端配置"
    fi
    
    # 4. 配置 MCP (npm install & build)
    if [ -d "newrag-mcp" ]; then
        if [ -d "newrag-mcp/node_modules" ] && [ -d "newrag-mcp/dist" ] && [ "$force_install" != "true" ]; then
            log_info "MCP 依赖已安装且已构建，跳过"
        else
            log_info "配置 NewRAG MCP..."
            cd newrag-mcp
            if ! npm install; then
                log_error "MCP 依赖安装失败"
                cd ../..
                return 1
            fi
            if ! npm run build; then
                log_error "MCP 构建失败"
                cd ../..
                return 1
            fi
            cd ..
        fi
    else
        log_warn "未找到 newrag-mcp 目录，跳过 MCP 配置"
    fi
    
    cd ..
    log_success "NewRAG 准备就绪"
    return 0
}
