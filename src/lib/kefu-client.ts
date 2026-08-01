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

/** cn-kefu store.ts 的 JobEvent,逐字对齐 */
type KefuEvent =
  | { type: "escalated" }
  | { type: "fit_visualizer" }
  | { type: "product_cards"; products: unknown[] };

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
  /** ⚠️ cn-kefu 侧尚未支持这个参数(见 docs 未决 I),当前会被忽略。
   *  后端补上 selected_product_ids 后本字段自动生效,前端不用改。 */
  selectedProductIds: string[];
}

export interface KefuStreamCallbacks {
  onSession: (sessionId: string) => void;
  /** 全量内容,直接覆盖 */
  onContent: (content: string) => void;
  onEscalated: () => void;
  onFitVisualizer: () => void;
  onDone: () => void;
  onError: (message: string) => void;
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

const POLL_INTERVAL_MS = 800;
/** 轮询上限:90 秒。超了就报错收尾,不让气泡永远转圈 */
const POLL_TIMEOUT_MS = 90_000;

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

    if (payload.content) cb.onContent(payload.content);

    for (const [i, ev] of (payload.events ?? []).entries()) {
      const key = `${i}:${ev.type}`;
      if (seenEvents.has(key)) continue;
      seenEvents.add(key);
      if (ev.type === "escalated") cb.onEscalated();
      else if (ev.type === "fit_visualizer") cb.onFitVisualizer();
      // product_cards 等其它 type 暂不渲染 —— 契约纪律:忽略未知,别抛错
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
