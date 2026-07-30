# yangzhangzhi-web

杨张治服饰的 Web 端(顾客站):**店主推荐** + **AI 客服咨询**两页。
微信小程序那条线继续跑现有 cn-kefu,本仓库只做 Web。

架构与决策背景见 [../docs/multi-site-discussion.md](../docs/multi-site-discussion.md)。

---

## 跑起来

```bash
pnpm install
pnpm dev          # → http://localhost:3600
```

**不用配任何环境变量就能跑**:没有 `KEFU_API_BASE` 时自动走离线假客服 + mock 商品,
两页交互、尺码表、试穿组件全都能点。接真后端见 `.env.example`。

```bash
pnpm typecheck    # 提交前必跑
pnpm build        # 生产构建(standalone,给容器用)
```

端口固定 **3600**,不要改用其它端口(工作站上 3000/3100/3200/3500 已被别的项目占了)。

---

## 这个站怎么跟 kefu 智能体中台对接

```
浏览器 ──▶ 本服务(Next.js) ──内网+Bearer──▶ cn-kefu ──▶ 云开发库(商品/店铺配置)
                  BFF                      智能体核心
```

- 浏览器**只**打本服务的 `/api/kefu/*`;cn-kefu 的地址和密钥永不下发到前端。
- 传输是 cn-kefu 的**发/取轮询伪流式**,不是 SSE:
  `POST /api/chat` 立即返回 `message_id` → `GET /api/reply` 每秒轮询取已生成部分。
- 全部细节封在 [src/lib/kefu-client.ts](src/lib/kefu-client.ts) 一个文件里。

### 两个容易踩的语义差异

| | cn-kefu(本站用的) | roundtable SSE 版 |
|---|---|---|
| `content` | **全量**(已生成部分全量返回)→ 直接覆盖 | 增量 delta → 拼接 |
| `fit_visualizer` 事件 | **不带** `product_id` → 回落到「正在看的那件」 | 带 `product_id` |

### 契约纪律

**客户端必须忽略未知 event type。** 后端加新事件不能让老站点崩。
改 `kefu-client.ts` 的事件处理要**单独 commit**,因为这层改动会影响所有站点。

---

## 目录:哪些是共享的,哪些是本站的

```
src/
├── site.config.ts        ★ 本站专属 —— 店名/文案/域名。换商家改这里
├── app/globals.css       ★ 本站专属 —— 色板(--brand 等 theme 层)
├── data/mock-products.ts ★ 临时 —— 真实商品数据到位后删掉
│
├── components/kefu/      ◆ 跨站共享 —— buyer UI(改动要考虑回流模板仓)
├── components/ui/        ◆ 跨站共享 —— 通用组件
├── lib/kefu/             ◆ 跨站共享 —— 尺码引擎(纯函数,有上游真源,尽量别改)
├── lib/kefu-client.ts    ◆ 跨站共享 —— API client(改动影响所有站,单独 commit)
└── app/api/kefu/         ◆ 跨站共享 —— BFF 转发层
```

**★ 本站专属**:随便改,不回流。
**◆ 跨站共享**:改之前先想「这是本站特有需求,还是所有站都该有的改进?」
后者要回流模板仓 —— 提 PR 时在描述里说明是哪一类。

`lib/kefu/` 的尺码引擎(size-spec / fit / fit-geometry / garment-templates / body-estimate)
有上游真源(kefu 仓),这里是副本。**判定逻辑归纯函数、阈值从数据读**是既有原则,
不要改成让模型凭印象报数字。要改先跟 Andrew 说。

---

## 当前用 mock 的地方(等真实数据/后端)

| 位置 | 现状 | 接真的方式 |
|---|---|---|
| 商品数据 | `data/mock-products.ts` 6 件占位 | 数据通道待拍板,只改 `lib/products.ts` 一个函数 |
| 商品图 | `public/placeholder/*.svg` 三张线稿 | 换成云存储/COS 真实图 URL |
| AI 回复 | `lib/mock-kefu.ts` 关键词匹配 | 配 `KEFU_API_BASE` 即自动切真后端 |

mock 商品刻意造了两条渲染路径:带 `size_spec` 的会渲染尺码图 + 尺码表,
只有 `size_chart` 原文的降级显示原文。验收时两种都要看。

---

## 相对 roundtable 原版刻意删掉的东西

移植时没带过来,**不是漏了**:

- **PromptEditor** —— 在线改客服 system_prompt 的面板。那是运营后台工具,
  放在顾客站等于让访客改客服人设。
- **模型选择 / token 数 / 费用显示** —— 运营信息,顾客不该看到
  (2026-07-03 已定:客人不选模型、不见模型身份)。
- **商品确认卡**(`product_confirm`)—— 商城浮层入口 2026-07-29 已移除,插入路径已失效。
- **语音输入** —— 依赖 ASR 服务,按需再加(`ChatInput` 留着扩展位)。
- **Supabase / Vercel 相关的一切** —— 本站全链路境内。

## 已知待办

- 访客身份:cn-kefu 的会话身份建在微信 openid 上,Web 访客没有 →
  历史续聊暂不可用,内容安全过检通道也要换(`msgSecCheck` 要求小程序 openid)。
  见讨论文档未决 B,**这是上线前必须解决的合规项**。
- `selected_product_ids`:前端已在传,cn-kefu 侧尚未支持,当前被忽略(未决 I)。
- ICP 备案进行中,备案完成后才能绑 `yangzhangzhi.com`。
