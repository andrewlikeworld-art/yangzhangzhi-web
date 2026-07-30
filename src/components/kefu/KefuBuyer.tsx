"use client";

// Buyer 两页壳(移植自 roundtable feat/kefu-buyer-redesign,2026-07-29 手绘稿定稿):
// recommend = 店主推荐落地页(网格选款)/ consult = 商品咨询页(KefuChat)。
// 两页共用顶栏 + 底部输入条;推荐页输入任意一句话 → 切到咨询页,该句作为首条消息。
//
// 相对 roundtable 版的改动:商品由 page.tsx(server component)拉好传进来,
// 不再走 useKefuData(Supabase RLS 查询);文案统一取 site.config。
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
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

  return (
    <div className="relative flex h-full flex-col">
      <AppHeader
        right={
          <>
            {selectedIds.length > 0 && (
              <span className="text-xs text-muted-foreground">已选 {selectedIds.length} 件</span>
            )}
            {/* 不打字也能直接进聊天页 */}
            <button
              type="button"
              onClick={() => setView("consult")}
              className="mr-1 inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-medium hover:bg-accent"
            >
              <MessageCircle className="size-3.5" />
              聊天咨询
            </button>
          </>
        }
      />

      <KefuRecommend products={products} onOpenDetail={setDetailId} />

      {/* 底部输入条:推荐页也永远在 */}
      <div className="shrink-0 border-t bg-background">
        <div className="mx-auto max-w-2xl">
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
