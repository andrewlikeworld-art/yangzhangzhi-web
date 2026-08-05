"use client";

// ★ API client 层 ★ —— 站点前端与 kefu 中台之间的唯一通道。
//
// 这一层的契约纪律(沿用 cn-kefu 既有原文):**客户端必须忽略未知 event type**。
// 后端加新事件不会让老站点崩,所以改这里要单独 commit、并同步回模板仓。
//
// 传输形态是 cn-kefu 的「发/取轮询伪流式」,不是 SSE:
//   1. POST /api/kefu/chat  → { session_id, message_id }   立即返回,后台生成
//   2. GET  /api/kefu/reply?message_id=…  每秒轮询 → { status, content, events }
//
// ⚠️ 两个与 roundtable SSE 版的语义差异,改这层时容易踩:
//   - content 是**全量**(已生成部分全量返回),不是增量 delta → 直接覆盖,不要拼接
//   - fit_visualizer 事件**不带 product_id** → 回落到「当前正在看的那件」

/** cn-kefu store.ts 的 ProductCard,逐字对齐(reason 2026-08-01 加,可选) */
export interface KefuProductCard {
  id: string;
  title: string;
  price: string;
  cover: string;
  /** 这批卡是哪个工具发的:outfit=搭配推荐,recommend=场景/类目推荐。读不到按 undefined 处理 */
  reason?: "outfit" | "recommend";
}

/** cn-kefu store.ts 的 JobEvent,逐字对齐 */
type KefuEvent =
  | { type: "escalated" }
  | { type: "fit_visualizer" }
  | { type: "product_cards"; products: unknown[] }
  | { type: "tool_running"; label: string };

interface ReplyPayload {
  status: string;
  content: string;
  events?: KefuEvent[];
  error?: string;
}

export interface KefuSendRequest {
  message: string;
  sessionId: string | null;
  productId: string | null;
  /** 推荐页心选清单,cn-kefu 注入「客人已选中」上下文(07-31 起已支持,上限 24 个) */
  selectedProductIds: string[];
}

export interface KefuStreamCallbacks {
  onSession: (sessionId: string) => void;
  /** 全量内容,直接覆盖 */
  onContent: (content: string) => void;
  onEscalated: () => void;
  onFitVisualizer: () => void;
  /** AI 推荐的商品卡。⚠️ 走 events 通道,不在 content 正文里。
   *  可选:老站点不实现也能编译(与「忽略未知事件」同一条纪律) */
  onProductCards?: (products: KefuProductCard[]) => void;
  /** 工具轮状态提示(label 是服务端代码文案,≤12 汉字)。
   *  渲染契约:pending 且 content 为空时显示最新一条;content 一有字或到终态就清;不落历史 */
  onToolRunning?: (label: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/** 宽容解析:上游字段缺损时丢弃单张卡,不让整轮渲染崩掉 */
function parseCards(products: unknown[]): KefuProductCard[] {
  return products.filter(
    (p): p is KefuProductCard =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as { id?: unknown }).id === "string" &&
      typeof (p as { title?: unknown }).title === "string",
  );
}

/** 稳定访客标识:cn-kefu 将来按人限流用(当前忽略,提前带上,届时自动生效)。
 *  要求:同一访客稳定不变、纯随机、不含任何个人信息——见 限流429说明 第五节。 */
const VISITOR_ID_KEY = "yzz_visitor_id";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      // 非安全上下文(如局域网 http 调试)没有 crypto.randomUUID,退化到普通随机串
      id =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return ""; // 隐私模式等存储不可用时不带标识,BFF 会跳过该头
  }
}

/** 300ms:kefu 08-03 真流式上线后,轮询间隔直接决定出字观感。
 *  /api/reply 永不限流(kefu 契约,重申过两次),单实例下轮询读内存,300ms 拿得到收益。
 *  与小程序端的 300ms 看齐。 */
const POLL_INTERVAL_MS = 300;
/** 客户端兜底:从拿到 message_id 起算墙钟 60 秒(2026-08-03 与 kefu 信箱对齐)。
 *  🔴 必须大于 kefu 服务端整轮预算 TURN_BUDGET_MS=40 秒,否则顾客看到的是这边的
 *  兜底话术而不是 kefu 那句具体的。服务端要调预算会先在信箱说,这边跟着改。
 *  刻意用墙钟不用轮询次数——间隔怎么调,兜底都还是 60 秒。 */
const POLL_TIMEOUT_MS = 60_000;

export async function streamKefuReply(
  req: KefuSendRequest,
  cb: KefuStreamCallbacks,
): Promise<void> {
  let messageId: string;
  try {
    const visitorId = getVisitorId();
    const res = await fetch("/api/kefu/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(visitorId ? { "X-Visitor-Id": visitorId } : {}),
      },
      body: JSON.stringify({
        message: req.message,
        session_id: req.sessionId,
        product_id: req.productId,
        selected_product_ids: req.selectedProductIds,
      }),
    });
    const body = (await res.json().catch(() => null)) as
      | { session_id?: string; message_id?: string; error?: string }
      | null;
    if (!res.ok || !body?.message_id) {
      // 429 = 渠道日额度用完,零点才恢复;这里绝不自动重试,也不提示"重试"
      if (res.status === 429) {
        cb.onError(body?.error ?? "今天的咨询次数已经用完啦,明天再来找我聊吧~");
        return;
      }
      cb.onError(body?.error ?? `发送失败(HTTP ${res.status})`);
      return;
    }
    if (body.session_id) cb.onSession(body.session_id);
    messageId = body.message_id;
  } catch {
    cb.onError("网络不太顺,消息没发出去,再试一次?");
    return;
  }

  // 事件只处理一次:content 是全量返回,events 也是全量数组,每轮都会带上老事件
  const seenEvents = new Set<string>();
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);

    let payload: ReplyPayload | null = null;
    try {
      const res = await fetch(`/api/kefu/reply?message_id=${encodeURIComponent(messageId)}`);
      payload = (await res.json().catch(() => null)) as ReplyPayload | null;
      if (!res.ok || !payload) {
        // 单次轮询失败不致命(网络抖动),继续下一轮;超时兜底在 while 条件上
        continue;
      }
    } catch {
      continue;
    }

    // content 全量覆盖:哪怕清空重来(真流式行为)也要传空串,不能用真值判断跳过
    cb.onContent(payload.content);

    for (const [i, ev] of (payload.events ?? []).entries()) {
      const key = `${i}:${ev.type}`;
      if (seenEvents.has(key)) continue;
      seenEvents.add(key);
      if (ev.type === "escalated") cb.onEscalated();
      else if (ev.type === "fit_visualizer") cb.onFitVisualizer();
      else if (ev.type === "product_cards") cb.onProductCards?.(parseCards(ev.products));
      else if (ev.type === "tool_running") cb.onToolRunning?.(ev.label);
      // 其它 type 不认识就跳过 —— 契约纪律:忽略未知,别抛错
    }

    if (payload.status === "done") {
      cb.onDone();
      return;
    }
    if (payload.status === "error") {
      cb.onError(payload.error ?? "客服这边出了点问题,稍后再试");
      return;
    }
  }

  cb.onError("客服回复超时了,你再说一遍?");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
