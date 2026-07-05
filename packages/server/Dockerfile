FROM node:22-alpine AS builder

WORKDIR /app

# 国内服务器构建加速
RUN npm config set registry https://registry.npmmirror.com

COPY package.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/

RUN npm install --workspace=@duo-schedule/server --workspace=@duo-schedule/web

COPY packages/server ./packages/server
COPY packages/web ./packages/web

RUN npm run build -w @duo-schedule/web
RUN npm run build -w @duo-schedule/server

FROM node:22-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package.json ./
COPY packages/server/package.json ./packages/server/

RUN npm install --workspace=@duo-schedule/server --omit=dev

COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/web/dist ./packages/web/dist

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/duo-schedule.db
ENV SERVE_STATIC=true

EXPOSE 3000

VOLUME ["/data"]

CMD ["node", "packages/server/dist/index.js"]
