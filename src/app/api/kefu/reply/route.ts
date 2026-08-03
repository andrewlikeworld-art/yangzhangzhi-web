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
    const res = await fetch(
      `${base}/api/reply?message_id=${encodeURIComponent(messageId)}`,
      {
        headers: kefuAuthHeader(),
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
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[kefu/reply] 上游请求失败:", err);
    return NextResponse.json({ error: "取回复失败" }, { status: 502 });
  }
}
