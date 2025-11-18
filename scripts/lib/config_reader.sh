#!/bin/bash

# 配置读取库
# 统一从 .env 和 config.yaml 读取配置

# ==================== 从 config.yaml 读取配置 ====================

# 检查是否安装了 yq
has_yq() {
    command -v yq &> /dev/null
}

# 读取 config.yaml 中的值（纯 bash 方案）
read_config_yaml() {
    local key_path=$1
    local config_file="${2:-config.yaml}"
    
    if [ ! -f "$config_file" ]; then
        echo ""
        return 1
    fi
    
    # 使用 grep + awk 简单解析 YAML
    # 例如：读取 applications.newchat.file
    case "$key_path" in
        ".applications.newchat.file")
            grep -A3 "newchat:" "$config_file" | grep "file:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".applications.newchat.version")
            grep -A3 "newchat:" "$config_file" | grep "version:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".applications.lmstudio.file")
            grep -A3 "lmstudio:" "$config_file" | grep "file:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".applications.lmstudio.version")
            grep -A3 "lmstudio:" "$config_file" | grep "version:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".docker_images.newflow.file")
            grep -A5 "newflow:" "$config_file" | grep "file:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".docker_images.newflow_docs.file")
            grep -A5 "newflow_docs:" "$config_file" | grep "file:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".docker_images.newchat_docs.file")
            grep -A5 "newchat_docs:" "$config_file" | grep "file:" | head -1 | awk -F'"' '{print $2}'
            ;;
        ".download_sources.base_url")
            grep "base_url:" "$config_file" | head -1 | awk -F'"' '{print $2}'
            ;;
        *)
            echo ""
            ;;
    esac
}

# ==================== 获取应用程序配置 ====================

# 获取 NewChat 配置
get_newchat_file() {
    read_config_yaml ".applications.newchat.file"
}

get_newchat_version() {
    read_config_yaml ".applications.newchat.version"
}

# 获取 LM Studio 配置
get_lmstudio_file() {
    read_config_yaml ".applications.lmstudio.file"
}

get_lmstudio_version() {
    read_config_yaml ".applications.lmstudio.version"
}

# 获取 Docker 镜像配置
get_newflow_tar() {
    read_config_yaml ".docker_images.newflow.file"
}

get_newflow_docs_tar() {
    read_config_yaml ".docker_images.newflow_docs.file"
}

get_newchat_docs_tar() {
    read_config_yaml ".docker_images.newchat_docs.file"
}

# ==================== 从 .env 读取 Docker 配置 ====================

# 加载 .env 文件
load_env() {
    local env_file="${1:-.env}"
    
    if [ ! -f "$env_file" ]; then
        # 如果 .env 不存在，尝试 env.copy
        env_file="env.copy"
        if [ ! -f "$env_file" ]; then
            return 1
        fi
    fi
    
    # 只加载环境变量，忽略注释和空行
    set -a
    source <(grep -v '^#' "$env_file" | grep -E '^[A-Z_]+=' | sed 's/#.*$//')
    set +a
}

# 获取 Docker 版本配置
get_es_version() {
    read_config_yaml ".docker_images.elasticsearch.version" || echo "8.17.3"
}

get_kibana_version() {
    read_config_yaml ".docker_images.kibana.version" || echo "8.17.3"
}

get_logstash_version() {
    read_config_yaml ".docker_images.logstash.version" || echo "8.17.3"
}

get_newflow_version() {
    read_config_yaml ".docker_images.newflow.version" || echo "1.0.4"
}

get_newchat_docs_version() {
    read_config_yaml ".docker_images.newchat_docs.version" || echo "1.0.1"
}

# ==================== 下载地址配置 ====================

# 获取下载基础 URL
get_download_base_url() {
    read_config_yaml ".download_sources.base_url"
}

# ==================== 辅助函数 ====================

# 打印配置摘要（调试用）
print_config_summary() {
    echo "=== 配置摘要 ==="
    echo "Docker 版本 (从 .env):"
    echo "  ES:      $(get_es_version)"
    echo "  Kibana:  $(get_kibana_version)"
    echo "  Logstash: $(get_logstash_version)"
    echo "  Newflow: $(get_newflow_version)"
    echo ""
    echo "应用程序 (从 config.yaml):"
    echo "  NewChat: $(get_newchat_file)"
    echo "  LM Studio: $(get_lmstudio_file)"
    echo ""
    echo "下载地址:"
    echo "  Base URL: $(get_download_base_url)"
    echo "================"
}

