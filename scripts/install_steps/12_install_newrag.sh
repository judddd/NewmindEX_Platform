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
    
    local zip_file="installers/newrag-main-1.1.0.zip"
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

    # 2. 配置 Python 后端（联网安装）
    if [ -d ".venv" ] && [ -f ".venv/bin/python" ] && [ "$force_install" != "true" ]; then
         log_info "Python 环境已存在，跳过配置"
    else
        log_info "配置 NewRAG 后端 (uv sync)..."
        if ! command -v uv &> /dev/null; then
            log_error "未找到 uv 命令"
            cd ..
            return 1
        fi
        
        # 设置超时时间（防止大包下载断开）
        export UV_HTTP_TIMEOUT=300
        
        # 直接联网安装
        log_info "从 PyPI 在线安装依赖..."
        if uv sync; then
            log_success "NewRAG 后端依赖安装完成"
        else
            log_warn "官方源下载失败，尝试切换到清华镜像源..."
            export UV_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple"
            
            if uv sync; then
                log_success "NewRAG 后端依赖安装完成 (镜像源)"
            else
                log_error "NewRAG 后端依赖安装失败"
                cd ..
                return 1
            fi
        fi
    fi
    
    # 3. 配置前端 (npm install only，开发模式不需要 build)
    if [ -d "frontend" ]; then
        # 只检查 node_modules，不检查 dist（开发模式不需要）
        if [ -d "frontend/node_modules" ] && [ "$force_install" != "true" ]; then
            log_info "前端依赖已安装，跳过"
        else
            log_info "配置 NewRAG 前端..."
            cd frontend
            
            # 修复 TypeScript 配置 (允许未使用的变量)
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
            
            # 自动修复 npm 缓存权限
            if [ -d "$HOME/.npm" ]; then
                local npm_owner=$(stat -f '%u' "$HOME/.npm" 2>/dev/null || stat -c '%u' "$HOME/.npm" 2>/dev/null)
                if [ "$npm_owner" != "$(id -u)" ]; then
                    log_warn "检测到 npm 缓存权限问题，尝试修复..."
                    sudo chown -R $(id -u):$(id -g) "$HOME/.npm" 2>/dev/null || log_warn "自动修复失败，请手动运行: sudo chown -R \$(id -u) ~/.npm"
                fi
            fi

            if ! npm install; then
                log_error "前端依赖安装失败"
                cd ../..
                return 1
            fi
            
            log_success "前端依赖安装完成（开发模式，跳过 build）"
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

    # 5. 修复权限 (关键步骤)
    log_info "正在修复文件权限..."
    # 确保当前用户拥有 newrag-main 的所有权
    if command -v sudo &> /dev/null; then
        # 尝试使用 sudo 修复权限 (如果用户有 sudo 权限且需要密码，这可能会卡住，但这里假设脚本运行环境允许或者用户交互)
        # 为了安全，我们只修改当前目录下的 newrag-main
        # 但如果在脚本中运行 sudo 可能会打断流程。
        # 更好的方式是确保 install.sh 本身以非 root 运行，但创建的文件归属当前用户。
        # 如果之前的步骤（如 npm install）使用了 sudo，这里才需要修复。
        # 假设脚本以普通用户运行：
        
        # 确保关键目录存在
        mkdir -p "newrag-main/logs" "newrag-main/data" "newrag-main/uploads" "newrag-main/web/static/processed_docs"
        
        # 尝试修改权限 (忽略错误，因为如果不是 root 可能无法修改 root 拥有的文件)
        chmod -R 755 "newrag-main" 2>/dev/null || true
        
        # 如果是 Mac/Linux，且 owner 不对，提示用户
        local current_user=$(whoami)
        # 简单检查一下 logs 的 owner
        if [ -d "newrag-main/logs" ]; then
             local dir_owner=$(ls -ld "newrag-main/logs" | awk '{print $3}')
             if [ "$dir_owner" != "$current_user" ]; then
                 log_warn "检测到 newrag-main/logs 属于 $dir_owner，尝试修复..."
                 if sudo -n true 2>/dev/null; then
                     sudo chown -R "$current_user" "newrag-main"
                 else
                     log_warn "需要 sudo 权限来修复文件所有权，请输入密码："
                     sudo chown -R "$current_user" "newrag-main"
                 fi
             fi
        fi
    fi
    
    log_success "NewRAG 准备就绪"
    return 0
}
