#!/bin/bash

# 模块：目录结构设置
# 功能：创建所有必要的目录结构

set -e

echo "📁 创建目录结构..."

# Elasticsearch数据目录
mkdir -p elasticsearch/node1
mkdir -p elasticsearch/node2
mkdir -p elasticsearch/node3
mkdir -p elasticsearch/config
mkdir -p elasticsearch/branding

# Kibana配置目录
mkdir -p kibana/config

# Logstash配置目录
mkdir -p logstash/config
mkdir -p logstash/pipeline

# Python Dashboard目录
mkdir -p python_dashboard/static/css
mkdir -p python_dashboard/static/js
mkdir -p python_dashboard/templates
mkdir -p python_dashboard/mcp_pids
mkdir -p python_dashboard/mcp_logs

# Scripts目录
mkdir -p scripts

# Workflow配置目录
mkdir -p workflow_conf

echo "✅ 目录结构创建完成！"

# 设置权限（ES需要特定权限）
echo "🔐 设置目录权限..."
chmod -R 777 elasticsearch/node1 elasticsearch/node2 elasticsearch/node3

echo "✅ 权限设置完成！"

