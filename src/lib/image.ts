// 商品图按实际显示尺寸取图。
//
// 为什么需要:商家图源是手机原图。2026-08-04 实测线上 28 张封面,尺寸从 800×800
// 一直到 **2916×3888(4.96 MB)**,而推荐页网格里每格只有约 224px 宽。
// 直出原图 = 28 件商品几十 MB 首屏,手机上是灾难。
//
// 腾讯云 CDN 支持 imageMogr2 按需裁切,实测 4.96 MB → 199 KB(25 倍)。
//
// ⚠️ 两条守卫,别去掉:
//   1. 非 http(s) 的路径原样返回 —— 本地 mock 的 /placeholder/*.svg 走这条
//   2. **URL 已带查询串时原样返回** —— kefu 契约里商品图是「2 小时有效的临时链接」,
//      带签名的链接追加参数可能让签名失效。宁可不优化,不能把图搞裂。
export function sizedImage(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.includes("?")) return url;
  return `${url}?imageMogr2/thumbnail/${width}x`;
}
