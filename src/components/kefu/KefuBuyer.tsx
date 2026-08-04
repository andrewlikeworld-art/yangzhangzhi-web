"use client";

// Buyer 两页壳(移植自 roundtable feat/kefu-buyer-redesign,2026-07-29 手绘稿定稿):
// recommend = 店主推荐落地页(网格选款)/ consult = 商品咨询页(KefuChat)。
// 两页共用顶栏 + 底部输入条;推荐页输入任意一句话 → 切到咨询页,该句作为首条消息。
//
// 相对 roundtable 版的改动:商品由 page.tsx(server component)拉好传进来,
// 不再走 useKefuData(Supabase RLS 查询);文案统一取 site.config。
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Masthead } from "@/components/kefu/Masthead";
import { LandingHero } from "@/components/kefu/LandingHero";
import { SiteFooter } from "@/components/kefu/SiteFooter";
import { ChatInput } from "@/components/ui/ChatInput";
import { useKefuStore } from "@/stores/kefuStore";
import { siteConfig } from "@/site.config";
import type { Product } from "@/lib/types";
import { KefuChat } from "./KefuChat";
import { KefuRecommend } from "./KefuRecommend";
import { KefuProductSheet } from "./KefuProductSheet";

export function KefuBuyer({ products }: { products: Product[] }) {
  const view = useKefuStore((s) => s.view);
  const setView = useKefuStore((s) => s.setView);

  // 进站定起始页(2026-07-29 拍板):聊过天 → 直接回聊天界面;没聊过 → 店主推荐首页。
  // 推荐页的横滑位置是组件内 state,重进自动回起点。
  useEffect(() => {
    setView(useKefuStore.getState().messages.length > 0 ? "consult" : "recommend");
  }, [setView]);

  if (view === "consult") return <KefuChat products={products} />;
  return <RecommendPage products={products} />;
}

function RecommendPage({ products }: { products: Product[] }) {
  const setView = useKefuStore((s) => s.setView);
  const setPendingMessage = useKefuStore((s) => s.setPendingMessage);
  const draft = useKefuStore((s) => s.draft);
  const setDraft = useKefuStore((s) => s.setDraft);
  const clearDraft = useKefuStore((s) => s.clearDraft);
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);

  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = detailId ? (products.find((p) => p.id === detailId) ?? null) : null;

  // 任意输入都进咨询页,这句话作为首条消息(KefuChat 挂载后自动发送)
  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    clearDraft();
    setPendingMessage(text);
    setView("consult");
  }

  // 头图用第一件在售商品。取不到图就不渲染头图区,页面直接从目录开始
  const heroProduct = products.find((p) => p.image_url) ?? null;

  return (
    // 2026-08-04 结构重做:落地页走**正常文档流滚动**,不再是固定高度 app 壳。
    // 底部输入条改成 sticky 而不是 flex 固定行——页面能一直滚到页脚,
    // 输入条始终贴在视口底部可用。
    <div className="relative min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <Masthead
        left={
          selectedIds.length > 0 ? (
            <span className="u-numeral text-[0.6875rem]">已选 {selectedIds.length} 件</span>
          ) : null
        }
        right={
          /* 配方:CTA 不做成填充按钮,做成带发丝线的排版链接 */
          <button
            type="button"
            onClick={() => setView("consult")}
            className="u-hit relative inline-flex shrink-0 items-center gap-1.5 border-b border-ink pb-0.5 text-[0.6875rem] text-ink transition-colors hover:border-[var(--editorial-red)] hover:text-[var(--editorial-red)]"
            style={{ transitionDuration: "var(--dur-fast)" }}
          >
            <MessageCircle className="size-3.5" />
            聊天咨询
          </button>
        }
      />

      <LandingHero product={heroProduct} onOpenDetail={setDetailId} />

      <KefuRecommend products={products} onOpenDetail={setDetailId} />

      <SiteFooter />

      {/* 输入条:sticky 贴底,始终可用又不挡住文档滚动 */}
      <div className="sticky bottom-0 z-20 border-t border-hairline bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[var(--measure-prose)] px-2">
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            placeholder={siteConfig.recommendPlaceholder}
          />
        </div>
      </div>

      {/* 半屏商品详情(不跳页面) */}
      {detail && (
        <KefuProductSheet
          product={detail}
          selected={selectedIds.includes(detail.id)}
          onToggleSelected={() => toggleSelected(detail.id)}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
