// BFF:轮询取回复。见 chat/route.ts 顶部的部署与鉴权说明。
import { NextRequest, NextResponse } from "next/server";
import { readMockJob } from "@/lib/mock-kefu";
import { kefuAuthHeader } from "@/lib/kefu-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const messageId = req.nextUrl.searchParams.get("message_id");
  if (!messageId) {
    return NextResponse.json({ error: "缺 message_id" }, { status: 400 });
  }

  const base = process.env.KEFU_API_BASE;
  if (!base) {
    const job = readMockJob(messageId);
    if (!job) return NextResponse.json({ error: "message_id 不存在或已过期" }, { status: 404 });
    return NextResponse.json(job);
  }

  try {
    // 🔴 缓存三防线(2026-08-04,web 渠道生成全冻结的教训,复盘见中转站当日条):
    // cn-kefu 公网域名前有 CDN,而其 /api/reply 曾无 Cache-Control 有 ETag →
    // CDN 把首份 {status:"pending"} 按 URL 缓存,轮询永远读到它,顾客侧表现为全冻。
    // kefu 侧已修(no-store + 关 etag),但按「两边各守一道」的约定,这里独立自保:
    //   1. _t 时间戳:每次轮询 URL 唯一,任何按 URL 键控的缓存都必然 MISS(kefu 忽略多余参数)
    //   2. cache:"no-store":Next 14 的 fetch 默认会缓存,force-dynamic 之外再显式声明一次
    //   3. 响应头 no-store:本 BFF 自己的响应也不许任何中间层存
    const res = await fetch(
      `${base}/api/reply?message_id=${encodeURIComponent(messageId)}&_t=${Date.now()}`,
      {
        headers: kefuAuthHeader(),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: "取回复失败" },
        { status: res.status === 404 ? 404 : 502 },
      );
    }
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[kefu/reply] 上游请求失败:", err);
    return NextResponse.json({ error: "取回复失败" }, { status: 502 });
  }
}
