"use client";

// AI 客服悬浮挂件(2026-08-04,按参考图右下角那个聊天窗复刻)。
//
// 为什么值得从「整页切换」改成「悬浮挂件」:参考图把 AI 助手放在右下角常驻,
// 顾客**不用离开正在浏览的商品**就能问。原先的做法是整页切走,回来还得重新找
// 刚才看的那件——对一个「边看边问尺码」的场景是反的。
//
// 桌面:右下角 400×620 面板。手机:铺满(小屏上任何浮窗都不好用,直接全屏最省事)。
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { KefuChat } from "./KefuChat";

export function ChatDock({
  products,
  open,
  onOpen,
  onClose,
}: {
  products: Product[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  // 手机上面板铺满时锁住背景滚动,否则手指滑动会穿透到底下的商品列表
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc 收起:浮层的基本礼貌
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* 收起态:右下角常驻圆钮。参考图那个位置就是它 */}
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="打开 AI 客服"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-[0.8125rem] text-[var(--paper)] shadow-lg transition-colors hover:bg-[var(--editorial-red)] md:bottom-8 md:right-8"
          style={{ transitionDuration: "var(--dur-fast)" }}
        >
          <MessageCircle className="size-4" />
          <span>问 AI 顾问</span>
        </button>
      )}

      {/* 展开态 */}
      {open && (
        <div
          className={cn(
            "fixed z-40 flex flex-col overflow-hidden border border-hairline bg-background shadow-2xl",
            // 手机铺满(用 dvh 而不是 vh:iOS 地址栏收放时 vh 不跟着变)
            "inset-0 h-dvh",
            // 桌面右下角定尺面板
            "md:inset-auto md:bottom-8 md:right-8 md:h-[38rem] md:w-[25rem]",
          )}
          role="dialog"
          aria-label="AI 客服"
        >
          <KefuChat products={products} dock onClose={onClose} />
        </div>
      )}
    </>
  );
}
