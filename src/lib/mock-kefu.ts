// 未配 KEFU_API_BASE 时的离线假客服 —— 让雏形不依赖 cn-kefu 内网就能演示交互。
// 只为「看得见交互」存在,不模拟任何真实业务判定;接上真后端后这个文件不再被调用。
//
// 状态挂 globalThis:Next dev 的模块热重载会重建模块作用域,挂模块级 Map 会丢 job。

/** 与 cn-kefu store.ts 的 JobEvent 线上形状对齐(mock 只造用得到的那几种) */
type MockEvent =
  | { type: "escalated" }
  | { type: "fit_visualizer" }
  | { type: "tool_running"; label: string }
  | {
      type: "product_cards";
      products: { id: string; title: string; price: string; cover: string; reason?: string }[];
    };

interface MockJob {
  full: string;
  events: MockEvent[];
  /** 出字前的静默期(模拟工具轮):此间只有 earlyEvents,content 为空 */
  delayMs?: number;
  /** 静默期就下发的事件(tool_running 要在 content 出字前显示才验得到) */
  earlyEvents?: MockEvent[];
  startedAt: number;
}

const store: Map<string, MockJob> = ((globalThis as Record<string, unknown>).__mockKefuJobs ??=
  new Map()) as Map<string, MockJob>;

/** 出字速度:每 40ms 一个字,和真模型的体感接近 */
const CHARS_PER_MS = 1 / 40;

export function createMockJob(message: string): { sessionId: string; messageId: string } {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { reply, events, delayMs, earlyEvents } = pickReply(message);
  store.set(messageId, { full: reply, events, delayMs, earlyEvents, startedAt: Date.now() });
  // 只留最近 50 条,防内存无限涨
  if (store.size > 50) {
    for (const k of Array.from(store.keys()).slice(0, store.size - 50)) store.delete(k);
  }
  return { sessionId: "mock-session", messageId };
}

export function readMockJob(
  messageId: string,
): { status: "generating" | "done"; content: string; events: MockEvent[] } | null {
  const job = store.get(messageId);
  if (!job) return null;
  // delayMs 是出字前的静默期(模拟工具轮):此间 content 为空,只发 earlyEvents
  const chars = Math.max(
    0,
    Math.floor((Date.now() - job.startedAt - (job.delayMs ?? 0)) * CHARS_PER_MS),
  );
  const done = chars >= job.full.length;
  return {
    status: done ? "done" : "generating",
    content: job.full.slice(0, chars),
    // earlyEvents 一开始就在;其余事件出字过半后才给,模拟工具调用发生在回复中途
    events: [
      ...(job.earlyEvents ?? []),
      ...(chars > job.full.length / 2 ? job.events : []),
    ],
  };
}

function pickReply(message: string): {
  reply: string;
  events: MockEvent[];
  delayMs?: number;
  earlyEvents?: MockEvent[];
} {
  const m = message.toLowerCase();

  // 推荐/搭配 → 商品卡 + 工具轮提示(验收 product_cards 与 tool_running 两条渲染路径)
  if (/推荐|搭配|配什么|穿什么|怎么配|上班穿|约会穿|面试穿/.test(m)) {
    return {
      reply:
        "按你说的场景,我挑了这几件,风格和场合都对得上:\n\n" +
        "第一件垂坠感好、显利落;配第二件的直筒裤不挑腿型。想看细节点卡片,我再给你讲。",
      // 出字前 1.8 秒静默,模拟工具轮 —— tool_running 提示只在这段能看到
      delayMs: 1800,
      earlyEvents: [{ type: "tool_running", label: "正在挑选商品" }],
      events: [
        {
          type: "product_cards",
          products: [
            { id: "mock-1", title: "醋酸缎面吊带连衣裙", price: "¥459", cover: "/placeholder/dress.svg", reason: "recommend" },
            { id: "mock-2", title: "水洗棉宽松直筒长裤", price: "¥329", cover: "/placeholder/pants.svg", reason: "outfit" },
            { id: "mock-6", title: "细羊毛圆领针织衫", price: "¥429", cover: "", reason: "outfit" },
          ],
        },
      ],
    };
  }

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
