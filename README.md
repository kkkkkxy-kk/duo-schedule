# 双人日程

面向 2 人的移动端日程管理 PWA：录入待办、标记完成/亮点、互相点赞，早晚通过微信推送提醒。

## 功能

- 创建工作区 / 邀请码加入（最多 2 人）
- 默认双人视图：双方待办与完成进度
- 待办：描述 + 优先级（高/中/低）
- 状态：待办 → 已完成 → 亮点完成（可填亮点内容）
- 互相点赞：仅可对对方已完成的待办点赞，支持取消
- 历史日期：查看往日待办与完成情况
- 早晚推送：WxPusher 推送到个人微信
- 点赞通知：对方点赞时微信提醒
- 一键复制群消息：粘贴到微信群
- PWA：可添加到手机主屏幕

## 本地开发

```bash
cd d:\duo-schedule
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000（前端通过 `/api` 代理）

## 环境变量

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 签名密钥 |
| `WXPUSHER_APP_TOKEN` | WxPusher 应用 Token（在 wxpusher.zjiecode.com 创建应用获取） |
| `BASE_URL` | 前端访问地址（推送消息中的链接） |
| `DB_PATH` | SQLite 数据库路径（默认 `packages/server/data/duo-schedule.db`） |
| `SERVE_STATIC` | `true` 时后端同时托管前端静态文件 |
| `PORT` | 服务端口（默认 3000） |

复制 `.env.example` 为 `.env` 并填写后用于 Docker 部署。

## WxPusher 配置

### 1. 部署者：配置 AppToken

1. 登录 [wxpusher.zjiecode.com](https://wxpusher.zjiecode.com)
2. 创建应用，复制 **AppToken**
3. 写入环境变量 `WXPUSHER_APP_TOKEN`

### 2. 用户：绑定 UID

1. 在 WxPusher 应用中扫码关注
2. 在 **用户管理** 复制个人 UID（格式 `UID_xxx`）
3. 在 App **设置页** 粘贴 UID 并保存

两人都需要各自绑定 UID 才能收到推送。

## Docker 部署

```bash
cd d:\duo-schedule
cp .env.example .env   # 编辑 .env 填入真实值
docker compose up -d --build
```

访问 http://localhost:3000（或你配置的 `BASE_URL`）

数据持久化在 Docker 卷 `duo-data` 中。

## 使用流程

1. 用户 A 创建工作区，获得 6 位邀请码
2. 用户 B 输入邀请码加入
3. 两人分别在设置页绑定 WxPusher UID
4. 设置推送时间（默认早 8:00 / 晚 21:00）
5. 录入每日待办，完成后可互相点赞
6. 晚上点击「复制群消息」粘贴到微信群

## 技术栈

- 前端：React 19 + Vite + Tailwind + PWA
- 后端：Fastify + Node.js 内置 SQLite + node-cron + WxPusher

## 项目结构

```
duo-schedule/
├── packages/web/       # PWA 前端
├── packages/server/    # API + 定时推送
├── docker-compose.yml
└── .env.example
```
