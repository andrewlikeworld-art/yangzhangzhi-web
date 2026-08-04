"use client";

// AI 推荐商品卡行(events: product_cards)。
// cover 是 2 小时时效的临时 URL,不做任何本地缓存;本站消息本就不持久化,
// 刷新后卡片随消息一起消失是预期行为,不是丢数据。
import { ShoppingBag } from "lucide-react";
import { sizedImage } from "@/lib/image";
import type { KefuProductCard } from "@/lib/kefu-client";

/** 聊天里的卡只有 96px 宽,300 覆盖 2 倍屏足够 */
const CARD_IMG_WIDTH = 300;

/** reason → 角标文案。读不到 reason(旧版本/字段缺损)就不显示角标 */
const REASON_LABEL: Record<string, string> = { outfit: "搭配", recommend: "推荐" };

export function ProductCardsRow({
  cards,
  onOpen,
}: {
  cards: KefuProductCard[];
  /** 点卡片打开半屏详情;id 不在商品列表里时由调用方自然落空,这里不用管 */
  onOpen: (id: string) => void;
}) {
  if (cards.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {cards.map((c) => {
        const badge = c.reason ? REASON_LABEL[c.reason] : undefined;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c.id)}
            className="w-24 shrink-0 text-left"
          >
            <div className="relative">
              {c.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sizedImage(c.cover, CARD_IMG_WIDTH)}
                  alt={c.title}
                  className="aspect-[3/4] w-full border border-hairline object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center border border-hairline bg-muted text-muted-foreground">
                  <ShoppingBag className="size-5 opacity-60" />
                </div>
              )}
              {badge && (
                <span className="absolute left-1 top-1 rounded bg-[var(--editorial-red)] px-1 py-0.5 text-[10px] leading-none text-white">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-tight">{c.title}</p>
            {c.price && <p className="text-[11px] font-medium">{c.price}</p>}
          </button>
        );
      })}
    </div>
  );
}
