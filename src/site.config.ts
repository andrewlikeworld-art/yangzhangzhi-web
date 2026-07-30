// ★ 站点差异全部收在这个文件里 ★
//
// 多站点复用的约定(见 docs/multi-site-discussion.md 决策 4):
// 换一个商家 = 改这个文件 + 换 theme 色板 + 换商品数据源,**不动 components/ 和 lib/**。
// 这样模板仓的通用改进能一路 git pull 下来,不跟站点定制打架。

export const siteConfig = {
  /** 店名。顶栏标题 + AI 客服自称「我是{店名}的客服」都用它 */
  shopName: "杨张治",

  /** 完整品牌名,用于 <title> 和 SEO */
  brandName: "杨张治服饰",

  /** 站点描述,用于 <meta description> */
  description: "杨张治女装 · 店主推荐与 AI 尺码顾问",

  /** 正式域名(备案完成后生效;本地开发不影响) */
  domain: "yangzhangzhi.com",

  /** 客服在聊天里的显示名。刻意不给 AI 起人名——2026-07-18 已定口径:
   *  客服无名无 IP,任何情况不自称名字,只说「我是{店名}的客服」 */
  personaName: "客服",

  /** 推荐页栏目标题 */
  recommendTitle: "店主推荐",

  /** 推荐页输入框占位文案 */
  recommendPlaceholder: "点心选好商品,说一句话进入咨询…",

  /** 咨询页空状态引导语 */
  consultEmptyHint: "回「店主推荐」点心选好商品再来问,或直接开口问尺码、面料、洗护~",

  /** 底部免责声明(AI 生成内容标注,合规要求) */
  disclaimer: "AI 客服自动回复,可能有误;下单/售后以人工确认为准",
} as const;

export type SiteConfig = typeof siteConfig;
