// 未配 KEFU_API_BASE 时的离线假客服 —— 让雏形不依赖 cn-kefu 内网就能演示交互。
// 只为「看得见交互」存在,不模拟任何真实业务判定;接上真后端后这个文件不再被调用。
//
// 状态挂 globalThis:Next dev 的模块热重载会重建模块作用域,挂模块级 Map 会丢 job。

interface MockJob {
  full: string;
  events: { type: "escalated" | "fit_visualizer" }[];
  startedAt: number;
}

const store: Map<string, MockJob> = ((globalThis as Record<string, unknown>).__mockKefuJobs ??=
  new Map()) as Map<string, MockJob>;

/** 出字速度:每 40ms 一个字,和真模型的体感接近 */
const CHARS_PER_MS = 1 / 40;

export function createMockJob(message: string): { sessionId: string; messageId: string } {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { reply, events } = pickReply(message);
  store.set(messageId, { full: reply, events, startedAt: Date.now() });
  // 只留最近 50 条,防内存无限涨
  if (store.size > 50) {
    for (const k of Array.from(store.keys()).slice(0, store.size - 50)) store.delete(k);
  }
  return { sessionId: "mock-session", messageId };
}

export function readMockJob(
  messageId: string,
): { status: "generating" | "done"; content: string; events: MockJob["events"] } | null {
  const job = store.get(messageId);
  if (!job) return null;
  const chars = Math.floor((Date.now() - job.startedAt) * CHARS_PER_MS);
  const done = chars >= job.full.length;
  return {
    status: done ? "done" : "generating",
    content: job.full.slice(0, chars),
    // 事件在出字过半后才给,模拟工具调用发生在回复中途
    events: chars > job.full.length / 2 ? job.events : [],
  };
}

function pickReply(message: string): { reply: string; events: MockJob["events"] } {
  const m = message.toLowerCase();

  if (/码|尺寸|尺码|size|穿多大|身高|体重|胸围|腰围|臀围/.test(m)) {
    return {
      reply:
        "看你说的身材数据,这件我建议拿 **M 码**。\n\n" +
        "腰围按你的数字算是卡在 S 和 M 之间的,但这件面料没弹性,S 码坐下会绷,M 码腰上留 4cm 左右活动量刚好。\n\n" +
        "下面这个试穿图你可以拖着看各部位的余量,拿不准我再帮你看:",
      events: [{ type: "fit_visualizer" }],
    };
  }
  if (/面料|材质|成分|洗|缩水|起球/.test(m)) {
    return {
      reply:
        "这件的成分在商品详情里写着,我这边给你说重点:\n\n" +
        "- 手感偏垂坠,不是硬挺款\n" +
        "- 建议冷水手洗或干洗,不要机洗甩干\n" +
        "- 平铺阴干,别挂着晾,挂久了肩线会坠\n\n" +
        "还想知道什么?",
      events: [],
    };
  }
  if (/退|换|快递|发货|物流|几天|多久到/.test(m)) {
    return {
      reply:
        "发货和售后按店里规则来:\n\n" +
        "- 现货 48 小时内发出,预售看商品页标注的档期\n" +
        "- 吊牌未拆、无穿着痕迹,7 天内可退换\n\n" +
        "具体单子的情况我这边看不到,涉及金额和纠纷我帮你转人工跟进。",
      events: [{ type: "escalated" }],
    };
  }
  return {
    reply:
      "在的,你想问哪件?\n\n" +
      "你可以在店主推荐页点心选几件,我这边就能看到你在看什么,尺码、面料、洗护、搭配都能问我。",
    events: [],
  };
}
