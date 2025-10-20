# Kibana MCP Server Docker Image
FROM node:20-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括devDependencies用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 清理devDependencies减小镜像大小
RUN npm prune --production

# 健康检查
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${MCP_HTTP_PORT:-3000}/health || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/index.js"]

