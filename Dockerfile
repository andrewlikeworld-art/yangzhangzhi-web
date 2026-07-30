# 云托管容器镜像:Next.js standalone 输出
# 境内构建机加固照抄 cn-kefu 仓已踩通的配置:corepack 关交互提示 + npm 镜像源(官源在境内常超时)
FROM node:20-alpine AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --registry=https://registry.npmmirror.com
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# 云托管默认转发 80;standalone 的 server.js 读 PORT/HOSTNAME
ENV PORT=80 HOSTNAME=0.0.0.0
EXPOSE 80
CMD ["node", "server.js"]
