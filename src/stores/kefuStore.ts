import { create } from "zustand";

// 顾客站前端状态。不持久化(刷新清空);会话历史在 cn-kefu 侧落库,
// 将来要「续聊」再从 GET /api/history 拉。
//
// 相对 roundtable 版删掉的(顾客站不该有):
//   - selectedModelId:2026-07-03 已定「客人不选模型、不见模型身份」
//   - model / latencyMs / inputTokens / outputTokens / costCny:运营信息,只在后台看
//   - kind:"product_confirm" 商品确认卡:商城浮层入口 2026-07-29 已移除,插入路径已失效

export interface KefuMsg {
  id: string;
  /** system = 居中系统提示(如转人工) */
  role: "user" | "assistant" | "system";
  content: string;
  /** 展示时间戳,push 时定死,避免每次渲染跳动 */
  createdAt: string;
  streaming?: boolean;
  error?: boolean;
  /** 客服调用 show_fit_visualizer 时记该商品 id → 气泡下渲染 <FitVisualizer/> */
  fitVisualizerProductId?: string;
}

interface KefuState {
  /** recommend = 店主推荐落地页,consult = 商品咨询(聊天)页 */
  view: "recommend" | "consult";
  setView: (v: "recommend" | "consult") => void;

  /** 推荐页点心选中的商品,咨询页顶部显示这些并注入客服上下文 */
  selectedProductIds: string[];
  toggleSelectedProduct: (id: string) => void;

  /** 推荐页输入框发出的首条消息:切到咨询页后由 KefuChat 自动发送 */
  pendingMessage: string | null;
  setPendingMessage: (t: string | null) => void;

  /** 当前「正在看的那件」,注入 PRODUCT_DETAIL */
  currentProductId: string | null;
  setCurrentProduct: (id: string | null) => void;

  draft: string;
  setDraft: (t: string) => void;
  clearDraft: () => void;

  messages: KefuMsg[];
  pushMessage: (m: KefuMsg) => void;
  patchMessage: (id: string, patch: (m: KefuMsg) => Partial<KefuMsg>) => void;
  resetMessages: () => void;

  sending: boolean;
  setSending: (v: boolean) => void;

  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export const useKefuStore = create<KefuState>((set) => ({
  view: "recommend",
  setView: (v) => set({ view: v }),

  selectedProductIds: [],
  toggleSelectedProduct: (id) =>
    set((s) => ({
      selectedProductIds: s.selectedProductIds.includes(id)
        ? s.selectedProductIds.filter((x) => x !== id)
        : [...s.selectedProductIds, id],
    })),

  pendingMessage: null,
  setPendingMessage: (t) => set({ pendingMessage: t }),

  currentProductId: null,
  setCurrentProduct: (id) => set({ currentProductId: id }),

  draft: "",
  setDraft: (t) => set({ draft: t }),
  clearDraft: () => set({ draft: "" }),

  messages: [],
  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  patchMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch(m) } : m)),
    })),
  // 新会话:消息和 session_id 一起清,否则新消息会挂到旧会话上
  resetMessages: () => set({ messages: [], sessionId: null }),

  sending: false,
  setSending: (v) => set({ sending: v }),

  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
}));
