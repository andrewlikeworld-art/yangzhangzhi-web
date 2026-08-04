// 小程序端目录接口对接层(2026-08-04,契约见 web-shop 信箱「请开只读数据接口」)。
//
// 架构决策(docs/data-channel-discussion.md):web 不配后台,商品与内容全部直连
// 小程序端的只读接口;kefu 只管 AI 对话。本文件是那条决策的唯一落点——
// 只在服务端调用,key 永不下发浏览器(与 kefu-auth 同一条纪律)。
//
// 契约要点(shop 08-04 回信原文口径):
//   GET {BASE}/web/catalog?scope=products|inspirations,Bearer 鉴权
//   响应 { ok: true, scope, list: [...] };失败走真 HTTP 状态码(401/400/429/500)
//   图片全部是 ~2h 时效的临时地址 → **每次请求重取,绝不落库**
//   在售 ~30 件一次全返无分页;只返回顾客可见在售(全售罄未隐藏的也在,与小程序同口径)
//   兼容纪律:对端只加字段;本层未知字段一律忽略
import type { Product, Look } from "./types";

const BASE = process.env.SHOP_CATALOG_BASE;
const KEY = process.env.SHOP_CATALOG_KEY;

/** 两个环境变量都配了才算启用;缺一个就让 products.ts 走 kefu/mock 回落 */
export function shopCatalogEnabled(): boolean {
  return Boolean(BASE && KEY);
}

async function fetchScope(scope: "products" | "inspirations"): Promise<unknown[] | null> {
  if (!BASE || !KEY) return null;
  try {
    const res = await fetch(`${BASE}/web/catalog?scope=${scope}`, {
      headers: { Authorization: `Bearer ${KEY}` },
      signal: AbortSignal.timeout(10_000),
      // 60s 数据缓存(shop 明说「你侧 60 秒缓存随意」);对端响应本身是 no-store,
      // 这里的缓存是 Next 数据层的,和那场 CDN 事故的形状无关
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`[shop-catalog] ${scope} 上游 ${res.status}`);
      return null;
    }
    const payload = (await res.json().catch(() => null)) as
      | { ok?: boolean; list?: unknown[] }
      | null;
    if (!payload?.ok || !Array.isArray(payload.list)) {
      console.warn(`[shop-catalog] ${scope} 响应形状不对`);
      return null;
    }
    return payload.list;
  } catch (err) {
    console.warn(`[shop-catalog] ${scope} 请求失败:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** 分 → 「¥459」/「¥459起」。价格区间时展示下限加「起」,与电商惯例一致 */
function formatPrice(minFen: unknown, maxFen: unknown): string | null {
  if (typeof minFen !== "number" || !Number.isFinite(minFen)) return null;
  const yuan = (fen: number) => (fen % 100 === 0 ? String(fen / 100) : (fen / 100).toFixed(2));
  const min = `¥${yuan(minFen)}`;
  if (typeof maxFen === "number" && Number.isFinite(maxFen) && maxFen > minFen) return `${min}起`;
  return min;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

/** 颜色名清洗(仅展示层):商家把政策塞进了颜色值——实测有「白色【付款后不退不换】」
 *  「红色(付款后不退不换)」。色点行只该是颜色;政策文案不属于这里,
 *  且商家的政策表述在小程序详情页有完整呈现,web 不替它转述。已在信箱向 shop 报备。 */
function cleanColor(name: string): string {
  return name.replace(/[【((\[].*$/u, "").trim();
}

/** shop 的结构化尺码表 → 可读文本(「S/26:裤长 101.5 / 腰围 66 / 臀围 82.5」逐行)。
 *  已是字符串就原样返回;形状不认识返回 null,详情页不渲染坏数据 */
function sizeChartText(v: unknown): string | null {
  if (typeof v === "string") return str(v);
  if (!Array.isArray(v)) return null;
  const lines: string[] = [];
  for (const row of v) {
    if (typeof row !== "object" || row === null) continue;
    const r = row as Record<string, unknown>;
    const name = str(r.sizeName);
    const measures = r.measures;
    if (!name || typeof measures !== "object" || measures === null) continue;
    const parts = Object.entries(measures as Record<string, unknown>)
      .filter(([, val]) => typeof val === "number" || typeof val === "string")
      .map(([k, val]) => `${k} ${val}`);
    if (parts.length > 0) lines.push(`${name}:${parts.join(" / ")}`);
  }
  return lines.length > 0 ? lines.join("\n") : null;
}
const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];

/** shop 商品 → web Product。宽容映射:单件字段缺损丢该件,不崩整列 */
function toProduct(raw: unknown, i: number): Product | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  const title = str(r.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    price: formatPrice(r.priceMinFen, r.priceMaxFen),
    // shop 初版清单没有面料与详情文案字段(已在验证回信里提);缺就空,卡片行自动让位给颜色
    fabric: null,
    // sizeChart 实测形态(2026-08-04 实连):[{sizeName, measures:{裤长:101.5,…}}]——
    // 中文部位键,和 web 的 SizeSpec(英文标准键)不同形。塞给 size_spec 会被
    // shouldRenderSizeTable 拒掉 → 详情页尺码表整个消失。所以先诚实降级:
    // 转成可读文本走 size_chart 原文通道,顾客照样看得到全部数字。
    // TODO(discussion 文档有账):移植 kefu 的中文部位→标准键映射,让试穿组件也能吃
    size_chart: sizeChartText(r.sizeChart),
    detail_text: null,
    image_url: str(r.cover),
    images: strArr(r.images),
    size_spec: null,
    shape_spec: null,
    sort_order: i,
    category: str(r.category),
    colors: [...new Set(strArr(r.colors).map(cleanColor).filter(Boolean))],
  };
}

function toLook(raw: unknown): Look | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  const title = str(r.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    eyebrow: str(r.eyebrow),
    desc: str(r.desc),
    cover: str(r.cover),
    images: strArr(r.images),
    productIds: strArr(r.productIds),
  };
}

export async function getShopProducts(): Promise<Product[] | null> {
  const list = await fetchScope("products");
  if (!list) return null;
  const mapped = list.map(toProduct).filter((p): p is Product => p !== null);
  // 上游有数据但全映射失败 = 形状变了,当上游失败处理让调用方回落,别渲染空货架
  return mapped.length > 0 ? mapped : null;
}

export async function getShopLooks(): Promise<Look[]> {
  const list = await fetchScope("inspirations");
  if (!list) return [];
  return list.map(toLook).filter((l): l is Look => l !== null);
}
