// 商品类型:脱离 Supabase 自持一份。
//
// 字段刻意与两侧真源保持一致,灌真实数据时是平移映射而不是重构:
//   - roundtable Supabase `kefu_products` 表(buyer UI 原本吃的形状)
//   - 云开发库 `products` 集合(cn-kefu 的 shop.ts 直读的真源)—— 主键是文档 `_id`,
//     取数据时映射 `_id` → `id` 即可。
//
// size_spec / shape_spec 保持 unknown:它们由 lib/kefu/size-spec.ts 的
// shouldRenderSizeTable / normalizeShapeSpec 做运行时校验,解析失败就降级渲染原文
// (沿用既有原则:LLM 只解析,判定归纯函数;数据脏了不崩,降级)。
export interface Product {
  id: string;
  title: string;
  /** 价格是字符串:真源里存的是「¥299」这类带符号原文,不做数值化 */
  price: string | null;
  fabric: string | null;
  /** 尺码表原文,size_spec 解析不出来时降级显示这个 */
  size_chart: string | null;
  detail_text: string | null;
  image_url: string | null;
  images: string[];
  size_spec: unknown;
  shape_spec: unknown;
  sort_order: number;

  /* ── 2026-08-04 起,shop 直连接口才有的字段(kefu/mock 通道下为空)── */
  /** 商家后台填的真品类(上衣/裤装/裙装/连衣裙/套装/外套,历史数据有别名),按字符串用 */
  category?: string | null;
  /** 颜色名数组。shop 侧已按其口径过滤掉隐藏 SKU 的颜色,web 直接渲染即可 */
  colors?: string[];
}

/** 穿搭灵感(shop /web/catalog?scope=inspirations,形状照库) */
export interface Look {
  id: string;
  title: string;
  /** 眉题(卡片上方那行小字) */
  eyebrow: string | null;
  desc: string | null;
  cover: string | null;
  /** ≤6 张,3:4 */
  images: string[];
  /** 关联商品 id,保序 */
  productIds: string[];
}
