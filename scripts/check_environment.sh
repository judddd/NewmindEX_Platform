#!/bin/bash

echo "=========================================="
echo "   NewmindEX Platform 部署检查清单"
echo "=========================================="

# 检测 IP
echo -e "\n1️⃣ 检测本机 IP："
en0_ip=$(ifconfig en0 2>/dev/null | grep 'inet ' | awk '{print $2}')
en1_ip=$(ifconfig en1 2>/dev/null | grep 'inet ' | awk '{print $2}')

if [ ! -z "$en0_ip" ]; then
    echo "   ✅ en0: $en0_ip"
else
    echo "   ⚠️ en0: 未配置"
fi

if [ ! -z "$en1_ip" ]; then
    echo "   ✅ en1: $en1_ip"
else
    echo "   ⚠️ en1: 未配置"
fi

# 检测端口占用
echo -e "\n2️⃣ 检测端口占用："
for port in 8000 3000 8080 3001 9200 5601 9000 1234; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "   ✅ $port 已使用"
    else
        echo "   ⚠️ $port 未使用"
    fi
done

# 检测 Docker
echo -e "\n3️⃣ 检测 Docker："
if command -v docker >/dev/null 2>&1; then
    echo "   ✅ Docker 已安装: $(docker --version)"
    if docker ps >/dev/null 2>&1; then
        echo "   ✅ Docker 运行正常"
    else
        echo "   ❌ Docker 未运行"
    fi
else
    echo "   ❌ Docker 未安装"
fi

# 检测 Python
echo -e "\n4️⃣ 检测 Python："
if command -v python3 >/dev/null 2>&1; then
    echo "   ✅ Python3: $(python3 --version)"
else
    echo "   ❌ Python3 未安装"
fi

# 检测 UV
echo -e "\n5️⃣ 检测 UV："
if command -v uv >/dev/null 2>&1; then
    echo "   ✅ UV: $(uv --version)"
else
    echo "   ⚠️ UV 未安装（NewRAG 需要）"
fi

# 检测 Node.js
echo -e "\n6️⃣ 检测 Node.js："
if command -v node >/dev/null 2>&1; then
    echo "   ✅ Node.js: $(node --version)"
    echo "   ✅ npm: $(npm --version)"
else
    echo "   ❌ Node.js 未安装"
fi

echo -e "\n=========================================="
echo "  提示：部署前请确保所有依赖已安装"
echo "=========================================="
