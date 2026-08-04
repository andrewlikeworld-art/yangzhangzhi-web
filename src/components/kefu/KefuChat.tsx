"use client";

// 商品咨询页(移植自 roundtable feat/kefu-buyer-redesign)。
//
// 相对 roundtable 版删掉的:
//   - PromptEditor:在线改 system_prompt 的面板。那是 Andrew 的后台工具,
//     顾客站放出去等于让访客改客服人设,**绝不能带**。
//   - agent 概念(Supabase kefu_agents):店铺身份来自 site.config + cn-kefu 的 SHOP_NAME
//   - 商品确认卡(kind:"product_confirm"):商城浮层入口 2026-07-29 已移除,插入路径已失效
//
// 传输从 SSE 换成 cn-kefu 的发/取轮询,细节全在 lib/kefu-client.ts;
// 这里只消费回调,所以将来换回 SSE 也不用改本文件。
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Store, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { useKefuStore } from "@/stores/kefuStore";
import type { KefuMsg } from "@/stores/kefuStore";
import { siteConfig } from "@/site.config";
import { streamKefuReply } from "@/lib/kefu-client";
import { shouldRenderSizeTable, normalizeShapeSpec, FIELD_LABEL } from "@/lib/kefu/size-spec";
import type { Product } from "@/lib/types";
import { KefuProductSheet } from "./KefuProductSheet";
import { FitVisualizer } from "./FitVisualizer";
import { ProductCardsRow } from "./ProductCardsRow";

export function KefuChat({ products }: { products: Product[] }) {
  const currentProductId = useKefuStore((s) => s.currentProductId);
  const setCurrentProduct = useKefuStore((s) => s.setCurrentProduct);
  const draft = useKefuStore((s) => s.draft);
  const setDraft = useKefuStore((s) => s.setDraft);
  const clearDraft = useKefuStore((s) => s.clearDraft);
  const messages = useKefuStore((s) => s.messages);
  const pushMessage = useKefuStore((s) => s.pushMessage);
  const patchMessage = useKefuStore((s) => s.patchMessage);
  const resetMessages = useKefuStore((s) => s.resetMessages);
  const sending = useKefuStore((s) => s.sending);
  const setSending = useKefuStore((s) => s.setSending);
  const sessionId = useKefuStore((s) => s.sessionId);
  const setSessionId = useKefuStore((s) => s.setSessionId);
  const setView = useKefuStore((s) => s.setView);
  const selectedIds = useKefuStore((s) => s.selectedProductIds);
  const toggleSelected = useKefuStore((s) => s.toggleSelectedProduct);
  const pendingMessage = useKefuStore((s) => s.pendingMessage);
  const setPendingMessage = useKefuStore((s) => s.setPendingMessage);

  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const currentProduct = products.find((p) => p.id === currentProductId) ?? null;
  // 被选商品(推荐页点心的),按点选顺序
  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  const detailProduct = detailId ? (products.find((p) => p.id === detailId) ?? null) : null;

  // 推荐页带过来的首条消息:挂载后自动发送。
  // 从 getState 现读并先清空,StrictMode 双跑时第二次读到 null,不会发两遍。
  useEffect(() => {
    const pending = useKefuStore.getState().pendingMessage;
    if (!pending) return;
    setPendingMessage(null);
    void send(pending);
    // send 每次渲染都是新函数,这里只认 pendingMessage 作触发条件
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage]);

  // 顾客在 FitVisualizer 里点「问客服」:把身材数据 + 推荐拼成一条用户消息发进对话
  function handleAskAgent(bodyData: Record<string, number>, rec: string | null) {
    const parts = Object.entries(bodyData)
      .map(([f, v]) => `${FIELD_LABEL[f] ?? f}${v}cm`)
      .join("、");
    void send(
      `我的身材:${parts}。试穿组件${rec ? `推荐 ${rec} 码` : "没给明确推荐"},我还是拿不准,帮我看看穿哪个码?`,
    );
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? draft).trim();
    if (!text || sending) return;
    const ts = Date.now();
    const assistantId = `a-${ts}`;

    pushMessage({ id: `u-${ts}`, role: "user", content: text, createdAt: new Date(ts).toISOString() });
    pushMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date(ts + 1).toISOString(),
      streaming: true,
    });
    if (!overrideText) clearDraft();
    setSending(true);

    // 工具轮提示的清除收口在这一个函数里(照小程序端的做法):正文到达/done/error
    // 全走这里,顺手清 label。按状态逐分支清容易漏,按出口收口不会。
    const updateAssistant = (patch: (m: KefuMsg) => Partial<KefuMsg>) =>
      patchMessage(assistantId, (m) => ({ toolRunningLabel: undefined, ...patch(m) }));

    await streamKefuReply(
      {
        message: text,
        sessionId,
        productId: currentProductId,
        // 现读 store:首条消息自动发送时,闭包里的订阅值可能还没更新
        selectedProductIds: useKefuStore.getState().selectedProductIds,
      },
      {
        onSession: (id) => {
          if (!useKefuStore.getState().sessionId) setSessionId(id);
        },
        // content 是全量,直接覆盖(不是 SSE 的增量 delta)。
        // 真流式(kefu 08-03)下 content 还可能变短/清空重来,全量覆盖天然无感
        onContent: (content) => updateAssistant(() => ({ content })),
        onEscalated: () =>
          pushMessage({
            id: `sys-${Date.now()}`,
            role: "system",
            content: "已为你转接人工客服,稍等一下哈~",
            createdAt: new Date().toISOString(),
          }),
        onFitVisualizer: () => {
          // cn-kefu 的 fit_visualizer 事件不带 product_id → 回落到「正在看的那件」,
          // 没有正在看的就用第一件被选商品
          const pid =
            useKefuStore.getState().currentProductId ??
            useKefuStore.getState().selectedProductIds[0];
          if (pid) patchMessage(assistantId, () => ({ fitVisualizerProductId: pid }));
        },
        // 卡片走事件通道,挂在气泡下;不清 label(工具轮可能还在继续)
        onProductCards: (cards) =>
          patchMessage(assistantId, (m) => ({ cards: [...(m.cards ?? []), ...cards] })),
        onToolRunning: (label) => patchMessage(assistantId, () => ({ toolRunningLabel: label })),
        onDone: () => updateAssistant(() => ({ streaming: false })),
        onError: (msg) =>
          updateAssistant((m) =>
            m.content
              ? // 屏上已有半截正文:保留 + 追加,不整段抹掉(与 kefu 服务端超时收场同构)
                { content: `${m.content}\n\n(${msg})`, streaming: false }
              : { content: `⚠️ ${msg}`, streaming: false, error: true },
          ),
      },
    );

    setSending(false);
  }

  return (
    // 咨询页保留 app 壳:输入框钉底、消息区内部滚动,是 product UI 的正确形态。
    // 2026-08-04 结构重做后 h-app 由本组件自己套(原先在 root layout,把落地页也锁死了)。
    <div className="relative flex h-app flex-col overflow-hidden">
      <AppHeader
        right={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("recommend")}
              title="回店主推荐"
              aria-label="回店主推荐"
            >
              <Store className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetMessages}
              disabled={messages.length === 0 || sending}
              title="重新开始"
              aria-label="重新开始"
            >
              <RotateCcw className="size-4" />
            </Button>
          </>
        }
      />

      {/* 被选商品行(点开半屏详情,不跳页面) */}
      {selectedProducts.length > 0 && (
        <div className="shrink-0 border-b">
          <div className="flex gap-2 overflow-x-auto px-3 py-2">
            {selectedProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDetailId(p.id)}
                className="w-20 shrink-0 text-left"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="aspect-[3/4] w-full border border-hairline object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center border border-hairline bg-muted text-muted-foreground">
                    <ShoppingBag className="size-5 opacity-60" />
                  </div>
                )}
                <p className="mt-1 truncate text-[11px] leading-tight">{p.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 当前商品条(有则显示,可清除) */}
      {currentProduct && (
        <div className="flex shrink-0 items-center gap-2 border-b bg-muted/40 px-3 py-1.5 text-xs">
          <ShoppingBag className="size-3.5 text-[var(--editorial-red)]" />
          <span className="truncate">
            当前咨询商品:<span className="font-medium">{currentProduct.title}</span>
            {currentProduct.price ? ` · ${currentProduct.price}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setCurrentProduct(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            清除
          </button>
        </div>
      )}

      {/* 消息 */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-[var(--measure-prose)] px-6 py-16 text-center">
            <ShoppingBag className="mx-auto mb-3 size-8 text-[var(--editorial-red)] opacity-50" />
            <p className="text-sm text-muted-foreground">{siteConfig.consultEmptyHint}</p>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((m) => {
              const fitProduct = m.fitVisualizerProductId
                ? products.find((p) => p.id === m.fitVisualizerProductId)
                : undefined;
              const fitSpec = fitProduct ? shouldRenderSizeTable(fitProduct.size_spec) : null;
              return (
                <div key={m.id}>
                  <MessageBubble msg={m} personaName={siteConfig.personaName} />
                  {m.cards && m.cards.length > 0 && (
                    <div className="mx-auto mb-3 max-w-[var(--measure-prose)] px-4">
                      {/* 点卡片开半屏详情;卡 id 不在本页商品列表里时 detailProduct 落 null,自然无事发生 */}
                      <ProductCardsRow cards={m.cards} onOpen={setDetailId} />
                    </div>
                  )}
                  {fitSpec && (
                    <div className="mx-auto mb-3 max-w-[var(--measure-prose)] px-4">
                      <FitVisualizer
                        spec={fitSpec}
                        shape={normalizeShapeSpec(fitProduct?.shape_spec, fitSpec.category)}
                        onAskAgent={handleAskAgent}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 输入 */}
      <div className="shrink-0 border-t bg-background">
        <div className="mx-auto max-w-[var(--measure-prose)]">
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={() => void send()}
            disabled={sending}
            placeholder={sending ? "客服正在回复…" : "问点什么…"}
          />
        </div>
        <p className="pb-1.5 text-center text-[10px] text-muted-foreground/70">
          {siteConfig.disclaimer}
        </p>
      </div>

      {/* 半屏商品详情 */}
      {detailProduct && (
        <KefuProductSheet
          product={detailProduct}
          selected={selectedIds.includes(detailProduct.id)}
          onToggleSelected={() => toggleSelected(detailProduct.id)}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
