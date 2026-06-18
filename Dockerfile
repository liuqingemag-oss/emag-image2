# 阶段 1: 构建阶段
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 在构建时注入 API Key (可选，取决于您的构建流程)
# ARG GEMINI_API_KEY
# ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# 阶段 2: 运行阶段
FROM nginx:alpine
# 复制构建产物到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html
# 复制自定义 Nginx 配置以支持 SPA 路由
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
