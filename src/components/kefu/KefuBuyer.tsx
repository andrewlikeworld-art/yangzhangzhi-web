"use client";

// 首页(2026-08-04,按参考图「C-STYLE」复刻版式)。
//
// 区块序与参考图一一对应:公告条 → 导航(logo/分类/搜索/心愿/客服)→ Hero →
// 悬浮信任卡 → 分类圆环(含黑圆 AI 位)→ 货架(单行轮播 + 查看全部展开网格)→
// 三联横幅 → 合集卡 → 黑条页脚 → 右下角悬浮客服。
//
// 需要「活动/物流承诺/购物车」的格子换成本站真实能力,理由在 HomeSections.tsx 各组件头部。
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
  ProductShelf,
  PromoTrio,
  CollectionCards,
  FooterStrip,
} from "./HomeSections";
import { KefuProductSheet } from "./KefuProductSheet";
import { ChatDock } from "./ChatDock";

export function KefuBuyer({ products }: { products: Product[] }) {
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);
  const setPendingMessage = useKefuStore((s) => s.setPendingMessage);

  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const categories = useMemo(() => activeCategories(products), [products]);

  // 货架 = 类目 ∩ 搜索词 ∩ (只看已选)。三个筛选都是导航上的真功能
  const shown = useMemo(() => {
    let list = filterByCategory(products, category);
    const q = query.trim();
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    if (selectedOnly) list = list.filter((p) => selectedIds.includes(p.id));
    return list;
  }, [products, category, query, selectedOnly, selectedIds]);

  const detail = detailId ? (products.find((p) => p.id === detailId) ?? null) : null;
  const hero = products.find((p) => p.image_url) ?? null;

  /** 场景卡/圆环黑圆:带着预置问题开客服。pendingMessage 由 KefuChat 挂载后自动发送 */
  function askWithPrompt(prompt: string) {
    setPendingMessage(prompt);
    setChatOpen(true);
  }

  /** 合集卡:筛选货架、展开为网格、滚过去 */
  function pickCollection(id: string) {
    setCategory(id);
    setViewAll(true);
    document.getElementById("shelf")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-dvh">
      <AnnouncementBar onOpenChat={() => setChatOpen(true)} />
      <SiteNav
        categories={categories}
        active={category}
        onSelect={setCategory}
        query={query}
        onQuery={setQuery}
        selectedCount={selectedIds.length}
        selectedOnly={selectedOnly}
        onToggleSelectedOnly={() => setSelectedOnly((v) => !v)}
        onOpenChat={() => setChatOpen(true)}
      />
      <Hero product={hero} onOpenDetail={setDetailId} onOpenChat={() => setChatOpen(true)} />
      <TrustBar />
      <CategoryCircles
        categories={categories}
        products={products}
        active={category}
        onSelect={setCategory}
        onOpenChat={() => setChatOpen(true)}
      />
      <ProductShelf
        products={shown}
        selectedIds={selectedIds}
        onToggle={toggleSelected}
        onOpenDetail={setDetailId}
        viewAll={viewAll}
        onToggleViewAll={() => setViewAll((v) => !v)}
      />
      <PromoTrio products={products} onAsk={askWithPrompt} />
      <CollectionCards categories={categories} products={products} onPick={pickCollection} />
      <FooterStrip />

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
