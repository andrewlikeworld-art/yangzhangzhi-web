"use client";

// 店主推荐目录(Monocle 配方 · 2026-08-04 结构重做)。
//
// 改版前是「两行横向轮播」——手机 webview 的形态,搬到桌面上一屏只露 2.5 件、
// 右侧大片空白、还得横向拖。现在是真正的响应式网格,纵向滚动。
//
// 3:4 裁切是有意的:商品封面是 1280×1280 方图(竖图两侧补虚化边条凑成方),
// 用 object-cover 裁成 3:4 正好把两侧补边切掉只留中间的人。换 1:1 反而露馅。
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImage } from "@/lib/image";
import { useKefuStore } from "@/stores/kefuStore";
import type { Product } from "@/lib/types";

/** 网格每格最宽约 300px(宽屏 5 列 @ 1560 版心),取 600 覆盖 2 倍屏 */
const GRID_IMG_WIDTH = 600;

export function KefuRecommend({
  products,
  onOpenDetail,
}: {
  products: Product[];
  onOpenDetail: (id: string) => void;
}) {
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--measure-page)] px-4 py-16 text-center text-sm text-muted-foreground md:px-8">
        店主还没有上架推荐商品
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[var(--measure-page)] px-4 py-12 md:px-8 md:py-20">
      {/* 栏目头:Monocle 三层结构的缩略版(引题 + 标题),右侧编号式计数 */}
      <div className="mb-8 flex items-end justify-between border-b border-hairline pb-4 md:mb-12">
        <div>
          <p className="u-kicker">Selected</p>
          <h2 className="u-headline mt-2.5 text-[1.75rem] md:text-[2.25rem]">店主推荐</h2>
        </div>
        <p className="u-numeral shrink-0 pb-1 text-[0.9375rem] md:text-[1.125rem]">
          {String(products.length).padStart(2, "0")}
        </p>
      </div>

      {/* 手机 2 列 → 平板 3 → 桌面 4 → 宽屏 5。
          minmax(0,1fr) 而不是裸 1fr:含图的网格轨道用裸 1fr 会被图片撑破。 */}
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 sm:grid-cols-[repeat(3,minmax(0,1fr))] md:gap-x-6 md:gap-y-14 lg:grid-cols-[repeat(4,minmax(0,1fr))] xl:grid-cols-[repeat(5,minmax(0,1fr))]">
        {products.map((p, i) => {
          const selected = selectedIds.includes(p.id);
          // 首排 5 张不 lazy:它们在首屏内,懒加载会拖慢观感
          const eager = i < 5;
          return (
            <article key={p.id} className="min-w-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onOpenDetail(p.id)}
                  className="block w-full overflow-hidden bg-muted"
                  aria-label={`查看「${p.title}」详情`}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sizedImage(p.image_url, GRID_IMG_WIDTH)}
                      alt={p.title}
                      className="aspect-[3/4] w-full object-cover transition-opacity hover:opacity-[0.88]"
                      style={{ transitionDuration: "var(--dur-base)" }}
                      loading={eager ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] w-full items-center justify-center text-muted-foreground">
                      <ShoppingBag className="size-6 opacity-60" />
                    </div>
                  )}
                </button>

                {/* 心选。配方零圆角,但这个是叠在图上的功能钮,方形会糊成一块——
                    保留圆形并用 u-hit 把命中区补到 44px */}
                <button
                  type="button"
                  onClick={() => toggleSelected(p.id)}
                  aria-label={selected ? `取消选中「${p.title}」` : `选中「${p.title}」`}
                  aria-pressed={selected}
                  className="u-hit absolute left-2 top-2 z-10 inline-flex size-7 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm"
                >
                  <Heart
                    className={cn(
                      "size-4",
                      selected
                        ? "fill-[var(--editorial-red)] text-[var(--editorial-red)]"
                        : "text-white",
                    )}
                  />
                </button>
              </div>

              {/* 说明文字在图外、左对齐。标题两行:商品名普遍很长,单行截断会切掉款式信息 */}
              <div className="mt-3">
                <p className="line-clamp-2 text-[0.8125rem] leading-snug text-foreground/85">
                  {p.title}
                </p>
                {p.price && (
                  <p className="u-numeral mt-1.5 text-[0.8125rem] leading-none">{p.price}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
