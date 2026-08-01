import { KefuBuyer } from "@/components/kefu/KefuBuyer";
import { getProducts } from "@/lib/products";

// 首页就是 Buyer 两页壳(店主推荐 / 商品咨询)——顾客一进来就能选款开口问。
// 商品在服务端拉好随首屏下发:SEO 能收到商品名,且商品接口的 key 不出服务端。
//
// force-dynamic:Docker 构建期没有 KEFU_API_BASE,不声明的话 Next 会把 mock 商品
// 预渲染成纯静态页,运行时环境变量配了也不生效。商品上游有 60s fetch 缓存兜着。
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  return <KefuBuyer products={products} />;
}
