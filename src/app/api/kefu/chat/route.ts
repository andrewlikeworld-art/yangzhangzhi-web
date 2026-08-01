// BFF:发消息。浏览器只打这里,cn-kefu 的地址和 Bearer key 永不出服务端。
//
// 部署形态(见 docs/multi-site-discussion.md 决策 5):本服务与 cn-kefu 同处
// 微信云托管环境,KEFU_API_BASE 走**内网**地址 → cn-kefu 的公网访问保持关闭。
//
// ⚠️ 刻意不伪造 x-wx-openid:cn-kefu 的鉴权中间件见到该头就直接放行
// (kefu/src/index.ts:40-47),伪造它等于自己打开那个漏洞。这里只用 Bearer。
// 代价:cn-kefu 侧拿不到访客身份 → 历史续聊暂不可用(未决 B,待拍板访客身份方案)。

import { NextRequest, NextResponse } from "next/server";
import { createMockJob } from "@/lib/mock-kefu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LEN = 2000; // 与 cn-kefu 的入参校验对齐,前置挡掉省一次往返

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求格式不对" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json(
      { error: `消息必填,且不超过 ${MAX_MESSAGE_LEN} 字` },
      { status: 400 },
    );
  }

  const base = process.env.KEFU_API_BASE;
  if (!base) {
    // 离线雏形模式:没配后端就用假客服,交互照样能演示
    const { sessionId, messageId } = createMockJob(message);
    return NextResponse.json({ session_id: sessionId, message_id: messageId });
  }

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.KEFU_SHARED_KEY
          ? { Authorization: `Bearer ${process.env.KEFU_SHARED_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        message,
        session_id: typeof body.session_id === "string" ? body.session_id : null,
        product_id: typeof body.product_id === "string" ? body.product_id : null,
        // ⚠️ 止血(2026-08-01):带 selected_product_ids 的请求会让 cn-kefu(线上 045)
        // 整个生成队列卡死在 pending,连后续普通消息也不回——先不转发,等合伙人侧修复
        // 后把下面一行换回真实清单。复现记录见 docs/multi-site-discussion.md。
        selected_product_ids: [],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`[kefu/chat] 上游 ${res.status}:`, payload);
      return NextResponse.json({ error: "客服暂时联系不上,稍后再试" }, { status: 502 });
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[kefu/chat] 上游请求失败:", err);
    return NextResponse.json({ error: "客服暂时联系不上,稍后再试" }, { status: 502 });
  }
}
