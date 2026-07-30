// 商品数据源(只在服务端调用)。
//
// 当前:mock。真实数据通道还没拍板 —— 见 docs/multi-site-discussion.md 未决 C:
//   候选 1(倾向):cn-kefu 加 GET /api/products,本服务内网调,鉴权与聊天同一条
//   候选 2:Next 服务端直读云开发库,少一跳但商品字段映射会出现第二份
//            (shop.ts 已有一份,重复实现容易漂移)
//
// 拍板后只改这个函数,组件和页面不用动。
import type { Product } from "./types";
import { mockProducts } from "@/data/mock-products";

export async function getProducts(): Promise<Product[]> {
  const base = process.env.KEFU_API_BASE;
  if (!base) return mockProducts;

  // 通道未定,先按候选 1 的形状试探;上游还没这个端点时静默回落 mock,
  // 让页面永远有东西可看(顾客站不该因为商品接口挂了就白屏)。
  try {
    const res = await fetch(`${base}/api/products`, {
      headers: process.env.KEFU_SHARED_KEY
        ? { Authorization: `Bearer ${process.env.KEFU_SHARED_KEY}` }
        : {},
      signal: AbortSignal.timeout(8_000),
      // 商品变动不频繁,60s 缓存与 cn-kefu 的 shop.ts 缓存窗口对齐
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`[products] 上游 ${res.status},回落 mock`);
      return mockProducts;
    }
    const payload = (await res.json()) as { products?: Product[] };
    return payload.products?.length ? payload.products : mockProducts;
  } catch (err) {
    console.warn("[products] 上游不可用,回落 mock:", err instanceof Error ? err.message : err);
    return mockProducts;
  }
}
