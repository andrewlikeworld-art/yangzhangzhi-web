"use client";

// 商品详情悬浮层 v2(2026-07-29 第三轮:半屏横滑面板 → 居中悬浮窗):
// 点商品图弹出,展示全部图片 + 详情(价格/面料/尺码表/商品详情),纵向滚动;
// 点单张图可再放大全屏。不跳页面,推荐区和咨询页共用;头部心形可选中/取消。
import { useState } from "react";
import { Heart, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldRenderSizeTable, normalizeShapeSpec } from "@/lib/kefu/size-spec";
import { SizeTable } from "./SizeTable";
import { SizeDiagram } from "./SizeDiagram";
import type { Product } from "@/lib/types";

export function KefuProductSheet({
  product,
  selected,
  onToggleSelected,
  onClose,
}: {
  product: Product;
  selected: boolean;
  onToggleSelected: () => void;
  onClose: () => void;
}) {
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  return (
    <>
      <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-8">
        {/* 遮罩:点空白处关闭 */}
        <button
          type="button"
          aria-label="关闭商品详情"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-black/45"
        />
        <div className="relative z-10 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
          {/* 头:标题 + 心 + 关闭 */}
          <div className="flex shrink-0 items-center gap-1 border-b py-1.5 pl-4 pr-1.5">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{product.title}</p>
            <button
              type="button"
              onClick={onToggleSelected}
              aria-label={selected ? "取消选中" : "选中这件"}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-accent"
            >
              <Heart
                className={cn(
                  "size-5",
                  selected ? "fill-[var(--editorial-red)] text-[var(--editorial-red)]" : "text-muted-foreground",
                )}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* 全部图片 + 详情,纵向滚动 */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {images.length > 0 ? (
              images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFullscreenSrc(src)}
                  className="block w-full"
                  aria-label={`放大第 ${i + 1} 张图`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${product.title} ${i + 1}`}
                    className="w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </button>
              ))
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
                <ShoppingBag className="size-8 opacity-60" />
              </div>
            )}
            <div className="space-y-3 p-4">
              <div>
                <h2 className="text-base font-semibold">{product.title}</h2>
                {product.price && (
                  <p className="mt-1 font-medium text-[var(--editorial-red)]">{product.price}</p>
                )}
              </div>
              {product.fabric && <Row label="面料">{product.fabric}</Row>}
              {(() => {
                const spec = shouldRenderSizeTable(product.size_spec);
                if (spec) {
                  return (
                    <div className="pt-1">
                      <p className="mb-1.5 text-xs text-muted-foreground">尺码</p>
                      <SizeDiagram
                        spec={spec}
                        shape={normalizeShapeSpec(product.shape_spec, spec.category)}
                      />
                      <div className="mt-3" />
                      <SizeTable spec={spec} />
                    </div>
                  );
                }
                return product.size_chart ? <Row label="尺码">{product.size_chart}</Row> : null;
              })()}
              {product.detail_text && (
                <div className="pt-1">
                  <p className="mb-1 text-xs text-muted-foreground">商品详情</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {product.detail_text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 全屏图预览:点任意处关闭 */}
      {fullscreenSrc && (
        <button
          type="button"
          aria-label="关闭大图"
          onClick={() => setFullscreenSrc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreenSrc}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-10 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
