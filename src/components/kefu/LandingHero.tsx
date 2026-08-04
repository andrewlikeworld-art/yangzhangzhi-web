"use client";

// 落地页头图(Monocle 配方签名动作 · 2026-08-04 结构重做)。
//
// 配方原文:「Lead photograph cropped tight at one edge, headline tucked into the
// empty negative space」——头图压住一边裁紧,标题塞进另一侧的负空间。
//
// 为什么这个做法对这批素材特别合适:商品图是竖构图街拍,人物基本居中占满,
// **没有留白可以压字**。传统「整幅铺满 + 文字叠在图上」会把字压在人脸上。
// 压边裁切把图和字分开放,反而让这批图能当头图用——这是配方救了素材,不是硬套。
//
// 三层结构(红色引题 → 衬线标题 → 斜体副题)是 Monocle 的识别核心,由
// globals.css 的 .u-kicker / .u-headline / .u-dek 统一定义,这里只负责摆位置。
import { sizedImage } from "@/lib/image";
import type { Product } from "@/lib/types";

/** 头图是首屏最大的一张,给到 1200 覆盖 2 倍屏下的半幅宽度 */
const HERO_IMG_WIDTH = 1200;

export function LandingHero({
  product,
  onOpenDetail,
}: {
  /** 用作头图的商品(取第一件在售);没有图时整块不渲染 */
  product: Product | null;
  onOpenDetail: (id: string) => void;
}) {
  const cover = product?.image_url ? sizedImage(product.image_url, HERO_IMG_WIDTH) : null;

  return (
    <section className="border-b">
      {/* 高度必须**夹紧**:早先用 min-h-[76vh],在高视口(如 2700px)下头图会涨到
          2000px+,object-cover 把人裁得只剩腿。clamp 给出下限/理想/上限三个值,
          既保证够大气,又不会随视口无限长高。 */}
      <div className="mx-auto grid max-w-[var(--measure-page)] grid-cols-1 items-stretch md:h-[clamp(32rem,68vh,44rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* 文字侧:负空间。上下用 space-7(96px)撑开杂志感 */}
        <div className="flex flex-col justify-center px-4 py-12 md:px-8 md:py-16">
          <p className="u-kicker">Autumn / Winter · 本季精选</p>

          <h1 className="u-headline mt-5 text-[2.5rem] md:mt-6 md:text-[3.75rem] lg:text-[4.5rem]">
            穿在街上的
            <br />
            衣服
          </h1>

          <p className="u-dek mt-5 max-w-[34ch] text-[1.0625rem] md:mt-6 md:text-[1.25rem]">
            不是影棚里的样子,是它真正被穿出门时的样子。
            每一件都由店主亲自试过、拍过。
          </p>

          {/* 配方:CTA 不做成按钮,做成带发丝线的排版链接 */}
          {product && (
            <button
              type="button"
              onClick={() => onOpenDetail(product.id)}
              className="mt-8 inline-flex w-fit items-center gap-3 border-b border-ink pb-1 text-[0.8125rem] text-ink transition-colors hover:border-[var(--editorial-red)] hover:text-[var(--editorial-red)] md:mt-10"
              style={{ transitionDuration: "var(--dur-fast)" }}
            >
              <span>看这一件</span>
              <span aria-hidden>→</span>
            </button>
          )}
        </div>

        {/* 图侧:压住右边缘裁紧。手机上退到文字下方。
            ⚠️ 手机高度必须 >120vw:商品封面是竖图两侧补虚化边条凑成的 1:1 方图,
            容器一旦接近正方,object-cover 就不裁边,那两条模糊竖条会直接露出来
            (2026-08-04 实测 92vw 时可见)。120vw 让比例到 0.83,两侧各裁掉约 8%。 */}
        <div className="relative h-[120vw] bg-muted md:h-full">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product?.title ?? ""}
              // 焦点上移到 32%:这批是全身街拍,居中裁切会把脸切掉只剩躯干
              className="absolute inset-0 size-full object-cover object-[center_32%]"
              // 头图是 LCP 元素:**绝不能 lazy**,否则首屏观感直接慢一拍
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
