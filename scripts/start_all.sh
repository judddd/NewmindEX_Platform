#!/bin/bash

# 一键启动所有服务
# 这是主入口脚本，按顺序调用所有模块化脚本

set -e

echo "🚀 NewMind AI Platform - 一键启动"
echo "===================================="
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

# 检查是否首次运行（检查安装状态）
if [ ! -f ".install_state" ] && [ ! -d "python_dashboard/.venv" ]; then
    echo "⚠️  检测到这是首次运行"
    echo ""
    echo "建议使用安装脚本进行完整安装："
    echo "  ./install.sh"
    echo ""
    echo "如果您确定已手动安装所有组件，可以继续运行此脚本。"
    echo ""
    read -p "是否继续? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消。请运行: ./install.sh"
        exit 1
    fi
fi

# 步骤0：检查依赖
echo "步骤 1/11: 检查系统依赖"
bash scripts/00_check_dependencies.sh
echo ""

# 步骤1：准备安装包
echo "步骤 2/11: 准备安装包"
bash scripts/01_prepare_installers.sh
echo ""

# 步骤2：设置目录结构
echo "步骤 3/11: 创建目录结构"
bash scripts/02_setup_directories.sh
echo ""

# 步骤3：创建品牌资源
echo "步骤 4/11: 创建品牌资源"
bash scripts/03_create_branding.sh
echo ""

# 步骤4：构建MCP服务器
echo "步骤 5/11: 构建MCP服务器"
bash scripts/04_build_mcp_servers.sh
echo ""

# 步骤5：安装LM Studio
echo "步骤 6/11: 安装LM Studio"
bash scripts/05_install_lmstudio.sh || echo "⚠️  LM Studio安装跳过，请手动安装"
echo ""

# 步骤6：初始化Python项目
echo "步骤 7/11: 初始化Python项目"
bash scripts/06_init_python_project.sh
echo ""

# 步骤7：导入MCP Docker镜像
echo "步骤 8/13: 导入MCP Docker镜像"
bash scripts/07_load_mcp_images.sh || echo "⚠️  MCP镜像导入跳过，将使用Node模式"
echo ""

# 步骤8：启动Docker服务（智能检测，仅启动未运行的服务）
echo "步骤 9/13: 启动Docker服务"
echo "🔍 检查Docker服务状态..."

# 检查 Docker 是否正在运行
check_and_start_docker() {
    echo "🐳 检查 Docker 运行状态..."
    
    # 尝试连接 Docker daemon
    if docker info > /dev/null 2>&1; then
        echo "✅ Docker 正在运行"
        return 0
    fi
    
    echo "⚠️  Docker 未运行，正在自动启动 Docker Desktop..."
    
    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if [ -d "/Applications/Docker.app" ]; then
            echo "📂 找到 Docker.app，正在启动..."
            open -a Docker
        else
            echo "❌ 未找到 Docker Desktop，请先安装 Docker Desktop"
            echo "   下载地址: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - 尝试启动 Docker 服务
        echo "🐧 检测到 Linux 系统，尝试启动 Docker 服务..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start docker || {
                echo "❌ 无法启动 Docker 服务，请手动启动"
                exit 1
            }
        else
            echo "❌ 未找到 systemctl，请手动启动 Docker"
            exit 1
        fi
    else
        echo "❌ 不支持的操作系统: $OSTYPE"
        exit 1
    fi
    
    # 等待 Docker daemon 启动
    echo "⏳ 等待 Docker 启动..."
    MAX_WAIT=60
    ELAPSED=0
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        if docker info > /dev/null 2>&1; then
            echo "✅ Docker 已成功启动"
            return 0
        fi
        sleep 2
        ELAPSED=$((ELAPSED + 2))
        printf "."
    done
    
    echo ""
    echo "❌ Docker 启动超时（等待 ${MAX_WAIT}s），请手动检查 Docker Desktop"
    echo "   提示：首次启动 Docker Desktop 可能需要更长时间"
    exit 1
}

# 执行 Docker 检查和启动
check_and_start_docker
echo ""

# 检查哪些服务需要启动
SERVICES_TO_START=()
SERVICES_RUNNING=()

# 检查ES集群
if docker ps --format '{{.Names}}' | grep -q '^es01$' && \
   docker ps --format '{{.Names}}' | grep -q '^es02$' && \
   docker ps --format '{{.Names}}' | grep -q '^es03$'; then
    SERVICES_RUNNING+=("Elasticsearch")
    echo "   ✅ Elasticsearch 集群已运行，跳过启动"
else
    SERVICES_TO_START+=("es01" "es02" "es03")
fi

# 检查Kibana
if docker ps --format '{{.Names}}' | grep -q '^kibana$'; then
    SERVICES_RUNNING+=("Kibana")
    echo "   ✅ Kibana 已运行，跳过启动"
else
    SERVICES_TO_START+=("kibana")
fi

# 检查Logstash
if docker ps --format '{{.Names}}' | grep -q '^logstash$'; then
    SERVICES_RUNNING+=("Logstash")
    echo "   ✅ Logstash 已运行，跳过启动"
else
    SERVICES_TO_START+=("logstash")
fi

# 检查MinIO
if docker ps --format '{{.Names}}' | grep -q '^minio$'; then
    SERVICES_RUNNING+=("MinIO")
    echo "   ✅ MinIO 已运行，跳过启动"
else
    SERVICES_TO_START+=("minio")
fi

# 根据需要启动服务
if [ ${#SERVICES_TO_START[@]} -eq 0 ]; then
    echo "✅ 所有Docker服务都已运行，无需启动"
else
    echo "🚀 启动以下服务: ${SERVICES_TO_START[*]}"
    for service in "${SERVICES_TO_START[@]}"; do
        echo "   启动 $service..."
        docker compose up -d $service
    done
    echo "✅ Docker服务启动完成"
    
    # 如果启动了ES，等待其就绪
    if [[ " ${SERVICES_TO_START[@]} " =~ " es01 " ]] || \
       [[ " ${SERVICES_TO_START[@]} " =~ " es02 " ]] || \
       [[ " ${SERVICES_TO_START[@]} " =~ " es03 " ]]; then
        echo "⏳ 等待 Elasticsearch 集群就绪..."
        sleep 10
        MAX_WAIT=120
        ELAPSED=0
        while [ $ELAPSED -lt $MAX_WAIT ]; do
            if curl -s http://localhost:${ES_PORT_1:-9200}/_cluster/health > /dev/null 2>&1; then
                echo "✅ Elasticsearch 已就绪"
                break
            fi
            sleep 5
            ELAPSED=$((ELAPSED + 5))
        done
        if [ $ELAPSED -ge $MAX_WAIT ]; then
            echo "⚠️  Elasticsearch 启动超时，请检查日志: docker logs es01"
        fi
    fi
    
    # 如果启动了Kibana，等待其就绪
    if [[ " ${SERVICES_TO_START[@]} " =~ " kibana " ]]; then
        echo "⏳ 等待 Kibana 就绪..."
        sleep 5
        MAX_WAIT=60
        ELAPSED=0
        while [ $ELAPSED -lt $MAX_WAIT ]; do
            if curl -s http://localhost:${KIBANA_PORT:-5601}/api/status > /dev/null 2>&1; then
                echo "✅ Kibana 已就绪"
                break
            fi
            sleep 5
            ELAPSED=$((ELAPSED + 5))
        done
        if [ $ELAPSED -ge $MAX_WAIT ]; then
            echo "⚠️  Kibana 启动超时，请检查日志: docker logs kibana"
        fi
    fi
    
    # 如果启动了MinIO，等待其就绪
    if [[ " ${SERVICES_TO_START[@]} " =~ " minio " ]]; then
        echo "⏳ 等待 MinIO 就绪..."
        sleep 3
        MAX_WAIT=30
        ELAPSED=0
        while [ $ELAPSED -lt $MAX_WAIT ]; do
            if curl -s http://localhost:${MINIO_API_PORT:-9000}/minio/health/live > /dev/null 2>&1; then
                echo "✅ MinIO 已就绪"
                break
            fi
            sleep 3
            ELAPSED=$((ELAPSED + 3))
        done
        if [ $ELAPSED -ge $MAX_WAIT ]; then
            echo "⚠️  MinIO 启动超时，请检查日志: docker logs minio"
        fi
    fi
fi
echo ""

# 步骤8：激活试用许可
echo "步骤 9/11: 激活ES试用许可"
bash scripts/08_activate_trial_license.sh || echo "⚠️  许可激活失败，继续..."
echo ""

# 步骤9：下载LM模型
echo "步骤 10/11: 配置LM Studio模型"
bash scripts/09_download_lm_model.sh || echo "⚠️  LM Studio配置跳过"
echo ""

# 步骤10：配置ES Connector
echo "步骤 11/12: 配置ES Connector"
bash scripts/10_configure_es_connector.sh || echo "⚠️  Connector配置跳过"
echo ""

# 等待所有关键服务就绪
echo "⏳ 等待所有服务就绪..."
echo ""

# 检查 ES 是否就绪
ES_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${ES_PORT_1:-9200}/_cluster/health > /dev/null 2>&1; then
        echo "✅ Elasticsearch 已就绪"
        ES_READY=true
        break
    fi
    sleep 2
done

if [ "$ES_READY" = "false" ]; then
    echo "⚠️  警告：Elasticsearch 未就绪，Dashboard 可能无法正常工作"
fi

# 检查 Kibana 是否就绪
KIBANA_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${KIBANA_PORT:-5601}/api/status > /dev/null 2>&1; then
        echo "✅ Kibana 已就绪"
        KIBANA_READY=true
        break
    fi
    sleep 2
done

if [ "$KIBANA_READY" = "false" ]; then
    echo "⚠️  警告：Kibana 未就绪，Dashboard 可能无法正常工作"
fi

# 检查 Newflow 是否就绪
NEWFLOW_READY=false
for i in {1..30}; do
    if curl -s http://localhost:${NEWFLOW_PORT:-5678} > /dev/null 2>&1; then
        echo "✅ Newflow 已就绪"
        NEWFLOW_READY=true
        break
    fi
    sleep 2
done

if [ "$NEWFLOW_READY" = "false" ]; then
    echo "⚠️  警告：Newflow 未就绪，Dashboard 可能无法正常工作"
fi

echo ""
echo "=========================================="
echo ""

# 启动Python Dashboard（智能检测）
echo "步骤 12/12: 启动Python Dashboard..."
cd python_dashboard

# 检查Dashboard是否已经运行
DASHBOARD_RUNNING=false
if [ -f dashboard.pid ]; then
    OLD_PID=$(cat dashboard.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        # 验证是否是我们的Dashboard进程
        if ps -p $OLD_PID -o command | grep -q "uvicorn main:app"; then
            DASHBOARD_RUNNING=true
            echo "✅ Dashboard 已运行 (PID: $OLD_PID)，跳过启动"
        fi
    fi
fi

# 如果通过进程名也能找到，说明已运行
if ! $DASHBOARD_RUNNING && pgrep -f "uvicorn main:app" > /dev/null 2>&1; then
    RUNNING_PID=$(pgrep -f "uvicorn main:app" | head -1)
    DASHBOARD_RUNNING=true
    # 更新PID文件
    echo $RUNNING_PID > dashboard.pid
    echo "✅ Dashboard 已运行 (PID: $RUNNING_PID)，跳过启动"
fi

# 只有在未运行时才启动
if ! $DASHBOARD_RUNNING; then
    # 清理可能残留的旧PID文件
    rm -f dashboard.pid
    
    # 加载环境变量
    set -a; source ../.env 2>/dev/null || true; set +a
    
    # 使用 uv 启动
    nohup uv run uvicorn main:app --host 0.0.0.0 --port ${DASHBOARD_PORT:-80} > dashboard.log 2>&1 &
    DASHBOARD_PID=$!
    echo $DASHBOARD_PID > dashboard.pid
    echo "✅ Python Dashboard已在后台启动，PID: $DASHBOARD_PID。日志文件: python_dashboard/dashboard.log"
fi

cd ..
echo ""

# 步骤13：启动 NewRAG
echo "步骤 13/13: 启动 NewRAG..."

# 定义启动函数
start_newrag() {
    local NEWRAG_PID_FILE="python_dashboard/newrag.pid"
    
    cd newrag-main
    # 确保日志目录存在
    mkdir -p ../python_dashboard
    
    # 启动
    # 使用 nohup 和 setsid 启动
    nohup uv run dev.py > ../python_dashboard/newrag.log 2>&1 &
    local PID=$!
    
    # 等待一小会儿确认没立即挂掉
    sleep 3
    if ps -p $PID > /dev/null 2>&1; then
        echo $PID > ../$NEWRAG_PID_FILE
        echo "✅ NewRAG 已启动 (PID: $PID)"
        cd ..
        return 0
    else
        echo "❌ NewRAG 启动失败，进程已退出"
        # 显示最后几行日志
        if [ -f "../python_dashboard/newrag.log" ]; then
            echo "--- 日志片段 ---"
            tail -n 5 ../python_dashboard/newrag.log
            echo "----------------"
        fi
        cd ..
        return 1
    fi
}

# 1. 尝试智能安装 (只会补全缺失的部分)
# 引用安装脚本
if [ -f "scripts/install_steps/12_install_newrag.sh" ]; then
    source scripts/install_steps/12_install_newrag.sh
    
    # 运行安装检查 (force=false)
    echo "🔍 检查 NewRAG 环境..."
    if run_step "false"; then
        # 2. 尝试启动
        NEWRAG_PID_FILE="python_dashboard/newrag.pid"
        NEWRAG_RUNNING=false
        
        if [ -f "$NEWRAG_PID_FILE" ]; then
            if [ -s "$NEWRAG_PID_FILE" ]; then
                PID=$(cat "$NEWRAG_PID_FILE")
                if ps -p $PID > /dev/null 2>&1; then
                    NEWRAG_RUNNING=true
                    echo "✅ NewRAG 已经在运行 (PID: $PID)"
                else
                    rm "$NEWRAG_PID_FILE"
                fi
            else
                rm "$NEWRAG_PID_FILE"
            fi
        fi
        
        if ! $NEWRAG_RUNNING; then
            if ! start_newrag; then
                echo "⚠️  启动失败，尝试强制修复依赖并重试..."
                # 3. 启动失败，强制重装 (force=true)
                if run_step "true"; then
                    echo "🔄 依赖修复完成，再次尝试启动..."
                    if ! start_newrag; then
                        echo "❌ 重试启动仍然失败，请检查 logs/newrag.log"
                    fi
                else
                    echo "❌ 依赖修复失败"
                fi
            fi
        fi
    else
        echo "❌ NewRAG 环境检查/安装失败"
    fi
else
    echo "⚠️  找不到安装脚本 scripts/install_steps/12_install_newrag.sh，跳过 NewRAG 启动"
fi
echo ""

# 步骤14：启动 NewFlow
echo "步骤 14/14: 启动 NewFlow..."

# NewFlow 安装与启动（通过 Python Dashboard API 统一管理）
if [ -f "scripts/install_steps/13_install_newflow.sh" ]; then
    source scripts/install_steps/13_install_newflow.sh
    
    echo "🔍 检查 NewFlow 环境..."
    if run_step "false"; then
        echo "✅ NewFlow 环境就绪"
        
        # 通过 Dashboard API 启动 NewFlow（确保使用统一的启动逻辑）
        echo "🚀 通过 Dashboard API 启动 NewFlow..."
        
        # 等待 Dashboard API 就绪
        MAX_WAIT=30
        ELAPSED=0
        while [ $ELAPSED -lt $MAX_WAIT ]; do
            if curl -s http://localhost:${DASHBOARD_PORT:-80}/api/status > /dev/null 2>&1; then
                break
            fi
            sleep 1
            ELAPSED=$((ELAPSED + 1))
        done
        
        # 调用 API 启动 NewFlow
        RESPONSE=$(curl -s -X POST http://localhost:${DASHBOARD_PORT:-80}/api/newflow/toggle 2>&1)
        
        # 检查启动结果
        sleep 3
        if curl -s http://localhost:5678 > /dev/null 2>&1; then
            echo "✅ NewFlow 已启动"
        else
            echo "⚠️  NewFlow 启动可能失败，请检查 Dashboard 或手动启动"
        fi
    else
        echo "❌ NewFlow 环境检查/安装失败"
    fi
else
    echo "⚠️  找不到安装脚本 13_install_newflow.sh"
fi
echo ""

# 步骤11：初始化默认MCP实例
echo "🔧 初始化默认MCP实例（3001-3003端口）..."
bash scripts/11_init_default_mcp_instances.sh || echo "⚠️  MCP实例初始化失败，可在Dashboard中手动创建"
echo ""

echo "✅ 所有服务启动完成！"
echo ""
echo "===================================="
echo "🔗 服务访问地址："
echo "===================================="
echo "📊 管理控制台: http://localhost:${DASHBOARD_PORT:-80}"
echo "🔍 Elasticsearch: http://localhost:9200"
echo "📈 Kibana: http://localhost:5601"
echo "📮 Logstash: localhost:5044"
echo "🔄 NewFlow: http://localhost:5678"
echo "🤖 LM Studio: http://localhost:1234"
echo ""
echo "🔐 默认凭据:"
echo "   Elasticsearch/Kibana: elastic / changeme123"
echo ""
echo "🔌 MCP服务地址:"
echo "   • Elasticsearch MCP: http://localhost:3001/mcp"
echo "   • Kibana MCP: http://localhost:3002/mcp"
echo "   • NewFlow MCP: http://localhost:3003/mcp"
echo ""
echo "📝 提示："
echo "   • 查看日志: tail -f python_dashboard/dashboard.log"
echo "   • 停止服务: bash scripts/stop_all.sh"
echo "   • MCP服务器管理: http://localhost:${DASHBOARD_PORT:-80} (Dashboard)"
echo ""

