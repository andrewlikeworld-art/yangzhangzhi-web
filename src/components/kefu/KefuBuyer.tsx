"use client";

// 首页(2026-08-04 按参考图复刻结构)。
//
// 结构变化:原先是「推荐页 ⇄ 咨询页」整页切换的两视图壳;现在是**一张完整首页**
// (公告条→导航→Hero→信任条→分类圆环→商品网格→场景入口→页脚),
// AI 客服改成右下角悬浮挂件,顾客不用离开商品浏览就能问。
//
// ⚠️ 参考图里需要"活动/合集/物流承诺"的区块,本站一样数据都没有,
// 全部换成本站真实存在的能力。逐条替换理由写在 HomeSections.tsx 各组件头部。
import { useMemo, useState } from "react";
import { useKefuStore } from "@/stores/kefuStore";
import { activeCategories, filterByCategory } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import {
  AnnouncementBar,
  SiteNav,
  Hero,
  TrustBar,
  CategoryCircles,
  SectionHead,
  ProductGrid,
  ScenarioCards,
  HomeFooter,
} from "./HomeSections";
import { KefuProductSheet } from "./KefuProductSheet";
import { ChatDock } from "./ChatDock";

export function KefuBuyer({ products }: { products: Product[] }) {
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);
  const setPendingMessage = useKefuStore((s) => s.setPendingMessage);

  const [category, setCategory] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const categories = useMemo(() => activeCategories(products), [products]);
  const shown = useMemo(() => filterByCategory(products, category), [products, category]);
  const detail = detailId ? (products.find((p) => p.id === detailId) ?? null) : null;
  const hero = products.find((p) => p.image_url) ?? null;

  /** 场景卡:带着预置问题打开客服。pendingMessage 由 KefuChat 挂载后自动发送 */
  function askWithPrompt(prompt: string) {
    setPendingMessage(prompt);
    setChatOpen(true);
  }

  return (
    <div className="min-h-dvh">
      <AnnouncementBar onOpenChat={() => setChatOpen(true)} />
      <SiteNav
        categories={categories}
        active={category}
        onSelect={setCategory}
        selectedCount={selectedIds.length}
        onOpenChat={() => setChatOpen(true)}
      />
      <Hero
        product={hero}
        onOpenDetail={setDetailId}
        onOpenChat={() => setChatOpen(true)}
      />
      <TrustBar />
      <CategoryCircles
        categories={categories}
        products={products}
        active={category}
        onSelect={setCategory}
      />

      <section className="mx-auto w-full max-w-[var(--measure-page)] px-4 pb-4 md:px-8">
        <SectionHead
          kicker="Selected"
          title="店主推荐"
          sub={category ? "已按类目筛选" : "每一件都由店主亲自试过、拍过"}
          right={
            <span className="u-numeral text-[0.9375rem] md:text-[1.125rem]">
              {String(shown.length).padStart(2, "0")}
            </span>
          }
        />
        <ProductGrid
          products={shown}
          selectedIds={selectedIds}
          onToggle={toggleSelected}
          onOpenDetail={setDetailId}
        />
      </section>

      <ScenarioCards products={products} onAsk={askWithPrompt} />
      <HomeFooter />

      {/* 半屏商品详情(不跳页面) */}
      {detail && (
        <KefuProductSheet
          product={detail}
          selected={selectedIds.includes(detail.id)}
          onToggleSelected={() => toggleSelected(detail.id)}
          onClose={() => setDetailId(null)}
        />
      )}

      <ChatDock
        products={products}
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
