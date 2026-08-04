// 分类派生与场景入口(2026-08-04,参考图复刻)。
//
// ⚠️ 为什么要"派生":cn-kefu 的 WebProduct **没有分类字段**(只有 title/price/fabric/
// 尺码表/图)。参考图那排分类圆环必须有分类才成立,所以从商品标题的关键词推。
//
// 这是**近似**不是真相:标题里没关键词的会落到「全部」。可接受的理由是——
// 派生错了顾客只是少看到一件,不会看到假信息;而假分类("全场 5 折")是会骗人的。
// 若将来 kefu 侧把 garmentPart 之类的标签开进 WebProduct,这里整块换掉即可。
import type { Product } from "./types";

export interface Category {
  id: string;
  label: string;
  /** 命中任一关键词即归入本类;顺序即优先级,先命中先归类 */
  keywords: string[];
}

/** 关键词按「越具体越靠前」排:先判"半身裙"再判"裙",避免连衣裙被归进半裙 */
export const CATEGORIES: Category[] = [
  { id: "dress", label: "连衣裙", keywords: ["连衣裙", "连身裙", "长裙", "吊带裙"] },
  { id: "skirt", label: "半身裙", keywords: ["半身裙", "半裙", "A字裙", "包臀裙", "裙"] },
  { id: "top", label: "上衣", keywords: ["衬衫", "上衣", "短袖", "T恤", "背心", "吊带"] },
  { id: "knit", label: "针织", keywords: ["针织", "毛衣", "羊毛", "羊绒"] },
  { id: "bottom", label: "下装", keywords: ["长裤", "牛仔裤", "阔腿裤", "短裤", "西裤", "裤"] },
  { id: "outer", label: "外套", keywords: ["外套", "西装", "夹克", "风衣", "大衣"] },
];

/** 单件商品归类。返回 null = 关键词都没命中,只出现在「全部」里 */
export function categoryOf(product: Product): string | null {
  const t = product.title;
  for (const c of CATEGORIES) {
    if (c.keywords.some((k) => t.includes(k))) return c.id;
  }
  return null;
}

/** 只返回**真的有商品**的分类。空分类不该出现在导航里——点进去一片空白比没有更糟 */
export function activeCategories(products: Product[]): Array<Category & { count: number }> {
  return CATEGORIES.map((c) => ({
    ...c,
    count: products.filter((p) => categoryOf(p) === c.id).length,
  })).filter((c) => c.count > 0);
}

export function filterByCategory(products: Product[], categoryId: string | null): Product[] {
  if (!categoryId) return products;
  return products.filter((p) => categoryOf(p) === categoryId);
}

// ── 场景入口 ──
//
// 参考图这个位置是「学生 9 折 / 新季新装 / 到店体验」三张促销横幅 + 四张合集卡。
// 那些都需要**真实的活动与合集数据**,本站一样都没有,编出来就是拿假承诺骗顾客。
//
// 换成场景入口:点一下带着问题直接进 AI 咨询。**这是本站真实存在的能力**
// (kefu 的 recommend_products 工具就吃场景标签),不是装饰。
export interface Scenario {
  id: string;
  label: string;
  /** 副题,说明这个场景解决什么 */
  hint: string;
  /** 点击后自动发给 AI 客服的第一句话 */
  prompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "work",
    label: "上班穿什么",
    hint: "通勤得体,又不像制服",
    prompt: "我想找几件上班穿的,要得体但别太像制服,帮我推荐一下",
  },
  {
    id: "date",
    label: "约会怎么搭",
    hint: "显气质,不用力过猛",
    prompt: "约会想穿得有气质但不用力过猛,有什么推荐?",
  },
  {
    id: "size",
    label: "我该穿什么码",
    hint: "报身高体重,按商家尺码表判",
    prompt: "我不确定自己该穿什么码,能帮我看看吗?",
  },
];
