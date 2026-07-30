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
}
