"use client";

// 店主推荐区 v3(2026-07-29 第三轮验收调整):
// 顶栏叫 Buyer,「店主推荐」作为栏目标题和图片放在一起;图片再小一点,
// 一屏直观看到更多商品;2 行排版,横向连续滑动看更多(可拖动),
// 没滑到底的一侧才显示圆形箭头(点击滑一屏)。视觉仍是 PORTER 编辑风:
// 图片无边框同尺寸,描述字图外分行左对齐。
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKefuStore } from "@/stores/kefuStore";
import type { Product } from "@/lib/types";

export function KefuRecommend({
  products,
  onOpenDetail,
}: {
  products: Product[];
  onOpenDetail: (id: string) => void;
}) {
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);

  // 两侧箭头只在还没滑到底时显示
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, products.length]);

  function slide(dir: 1 | -1) {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        店主还没有上架推荐商品
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-6 py-5 md:px-12 md:py-8">
        {/* 栏目标题:和图片放在一起 */}
        <h2 className="mb-4 text-sm font-semibold tracking-[0.35em] text-foreground/80 md:mb-6">
          店主推荐
        </h2>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* 2 行横向网格:列宽比上一版收窄,一屏露出更多商品 */}
            <div className="grid auto-cols-[40%] grid-flow-col grid-rows-2 gap-x-4 gap-y-6 sm:auto-cols-[28%] md:auto-cols-[20%] md:gap-x-7 md:gap-y-8">
              {products.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <div key={p.id} className="min-w-0">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(p.id)}
                        className="block w-full"
                        aria-label={`查看「${p.title}」详情`}
                      >
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="aspect-[3/4] w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex aspect-[3/4] w-full items-center justify-center bg-muted text-muted-foreground">
                            <ShoppingBag className="size-6 opacity-60" />
                          </div>
                        )}
                      </button>
                      {/* 心:左上角,点了=列为被选商品 */}
                      <button
                        type="button"
                        onClick={() => toggleSelected(p.id)}
                        aria-label={selected ? `取消选中「${p.title}」` : `选中「${p.title}」`}
                        className="absolute left-1.5 top-1.5 z-10 inline-flex size-7 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
                      >
                        <Heart
                          className={cn(
                            "size-4",
                            selected ? "fill-[var(--brand)] text-[var(--brand)]" : "text-white",
                          )}
                        />
                      </button>
                    </div>
                    {/* 描述字:图片外、分行、与图片左缘对齐 */}
                    <div className="mt-2.5 space-y-0.5">
                      <p className="truncate text-xs tracking-widest text-foreground/80">
                        {p.title}
                      </p>
                      {p.price && (
                        <p className="truncate text-xs tracking-wide text-muted-foreground">
                          {p.price}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 边界箭头:圆形浮钮,滑到底自动消失 */}
          {canLeft && (
            <button
              type="button"
              onClick={() => slide(-1)}
              aria-label="向左看"
              className="absolute -left-2 top-[38%] z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-md backdrop-blur-sm hover:bg-accent md:-left-4"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              onClick={() => slide(1)}
              aria-label="向右看"
              className="absolute -right-2 top-[38%] z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-md backdrop-blur-sm hover:bg-accent md:-right-4"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
