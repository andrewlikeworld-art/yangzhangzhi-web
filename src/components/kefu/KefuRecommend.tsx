"use client";

// 店主推荐 = 目录页(Hallmark macrostructure 11 Catalogue,2026-08-04 改版)。
//
// 改版前是「两行横向轮播」——那是手机 webview 的形态,搬到桌面上会出现
// 「一屏只露 2.5 件、右侧大片空白、还得横向拖」。改成真正的响应式网格后,
// 桌面一屏能看完大半个货架,这正是网页相对小程序的唯一优势。
//
// 刻意**不做 hero 大图**:商品图是街拍方图(1280×1280,竖图两侧补虚化边条凑成方),
// 没有能放标题的留白。硬造 hero 是这套素材最容易翻车的地方——目录式让货品自己说话。
//
// 3:4 裁切是有意的:方图用 object-cover 裁成 3:4,正好把两侧的虚化边条切掉,
// 只留中间的人。换成 1:1 反而会把补边露出来。
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImage } from "@/lib/image";
import { useKefuStore } from "@/stores/kefuStore";
import { siteConfig } from "@/site.config";
import type { Product } from "@/lib/types";

/** 网格里每格最宽约 300px(宽屏 5 列 @ 1600 版心),取 600 覆盖 2 倍屏 */
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
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        店主还没有上架推荐商品
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[var(--measure-page)] px-3 pb-10 pt-5 md:px-8 md:pt-8">
        {/* 栏目头:双语并置 + 件数。双语是品牌既有习惯(详情页图文就是
            「商品信息 / Commodity Information」这么排的),不是我加的洋气。 */}
        <div className="mb-4 flex items-baseline justify-between border-b pb-2.5 md:mb-7 md:pb-3">
          <h2 className="text-[0.6875rem] leading-none text-foreground/75">
            <span className="u-label uppercase">{siteConfig.recommendTitle}</span>
            <span className="ml-3 text-muted-foreground">Selected</span>
          </h2>
          <span className="text-[0.6875rem] leading-none tabular-nums text-muted-foreground">
            {products.length} 件
          </span>
        </div>

        {/* 目录网格:手机 2 列 → 平板 3 → 桌面 4 → 宽屏 5。
            minmax(0,1fr) 而不是裸 1fr——含图的网格轨道用裸 1fr 会被图片撑破。 */}
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-7 sm:grid-cols-[repeat(3,minmax(0,1fr))] md:gap-x-5 md:gap-y-10 lg:grid-cols-[repeat(4,minmax(0,1fr))] xl:grid-cols-[repeat(5,minmax(0,1fr))]">
          {products.map((p, i) => {
            const selected = selectedIds.includes(p.id);
            // 首排 5 张不 lazy:它们是首屏 LCP 元素,懒加载会拖慢首屏观感
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
                        className="aspect-[3/4] w-full object-cover transition-opacity hover:opacity-88"
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

                  {/* 心选:左上角。命中区 ≥28px,移动端够点 */}
                  <button
                    type="button"
                    onClick={() => toggleSelected(p.id)}
                    aria-label={selected ? `取消选中「${p.title}」` : `选中「${p.title}」`}
                    aria-pressed={selected}
                    className="u-hit absolute left-1.5 top-1.5 z-10 inline-flex size-7 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm md:left-2 md:top-2"
                  >
                    <Heart
                      className={cn(
                        "size-4",
                        selected ? "fill-[var(--brand)] text-[var(--brand)]" : "text-white",
                      )}
                    />
                  </button>
                </div>

                {/* 说明文字:图外、左对齐、两行内。
                    标题两行是有意的——商品名普遍很长,单行截断会把款式信息全切掉。 */}
                <div className="mt-2.5">
                  <p className="line-clamp-2 text-[0.75rem] leading-snug text-foreground/85">
                    {p.title}
                  </p>
                  {p.price && (
                    <p className="mt-1 text-[0.75rem] leading-none tabular-nums text-muted-foreground">
                      {p.price}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

/** 页脚(Hallmark Ft2 单行)。两页站没有站点地图可放,四列索引式页脚是虚张声势。
 *  ICP 备案号是境内站的法定展示项,备案下来填 site.config 即自动出现。 */
function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-[var(--measure-page)] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-3 py-5 text-[0.625rem] text-muted-foreground md:px-8 md:text-[0.6875rem]">
        <span className="u-label uppercase">{siteConfig.wordmark}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{siteConfig.brandName}</span>
          {siteConfig.icpNumber && (
            <>
              <span aria-hidden>·</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {siteConfig.icpNumber}
              </a>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
