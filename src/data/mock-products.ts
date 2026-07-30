// 占位商品数据 —— 等杨张治店铺云开发库的真实 products JSON 灌进来后整个文件删掉。
//
// 字段结构与真源一致(见 lib/types.ts 注释),所以替换时是平移不是重构。
// 刻意造出两条渲染路径,方便验收:
//   - 带 size_spec 的(1/2/4/5 件)→ 渲染 <SizeDiagram/> + <SizeTable/>,客服可触发试穿组件
//   - 不带 size_spec 只有 size_chart 原文的(3/6 件)→ 降级显示原文
import type { Product } from "@/lib/types";

export const mockProducts: Product[] = [
  {
    id: "mock-1",
    title: "醋酸缎面吊带连衣裙",
    price: "¥459",
    fabric: "醋酸纤维 68% 粘纤 32%",
    size_chart: null,
    detail_text:
      "垂坠感强的醋酸缎面,自带微光泽但不廉价。后背隐形拉链,内衬同色。\n模特身高 168cm 体重 50kg,穿 S 码。",
    image_url: "/placeholder/dress.svg",
    images: ["/placeholder/dress.svg"],
    size_spec: {
      category: "dress",
      unit: "cm",
      stretch: "none",
      sizes: [
        { name: "S", measurements: { bust: 86, waist: 68, hip: 92, length: 118 } },
        { name: "M", measurements: { bust: 90, waist: 72, hip: 96, length: 120 } },
        { name: "L", measurements: { bust: 94, waist: 76, hip: 100, length: 122 } },
      ],
      judge_fields: ["bust", "waist", "hip"],
      fit_rules: {
        bust: { min_ease: 4, max_ease: 12, tolerance: 2 },
        waist: { min_ease: 3, max_ease: 10, tolerance: 2 },
        hip: { min_ease: 4, max_ease: 14, tolerance: 2 },
      },
    },
    shape_spec: { sleeve: "none", silhouette: "straight", hem_flare: 0.2 },
    sort_order: 1,
  },
  {
    id: "mock-2",
    title: "水洗棉宽松直筒长裤",
    price: "¥329",
    fabric: "水洗棉 100%",
    size_chart: null,
    detail_text:
      "落地垂感的直筒版型,腰头后侧松紧。水洗工艺,越穿越软。\n模特身高 172cm 体重 54kg,穿 M 码。",
    image_url: "/placeholder/pants.svg",
    images: ["/placeholder/pants.svg"],
    size_spec: {
      category: "pants",
      unit: "cm",
      stretch: "slight",
      sizes: [
        { name: "S", measurements: { waist: 66, hip: 94, thigh: 58, length: 100 } },
        { name: "M", measurements: { waist: 70, hip: 98, thigh: 60, length: 102 } },
        { name: "L", measurements: { waist: 74, hip: 102, thigh: 62, length: 104 } },
        { name: "XL", measurements: { waist: 78, hip: 106, thigh: 64, length: 106 } },
      ],
      judge_fields: ["waist", "hip", "thigh"],
      fit_rules: {
        waist: { min_ease: 0, max_ease: 6, tolerance: 2 },
        hip: { min_ease: 6, max_ease: 16, tolerance: 2 },
        thigh: { min_ease: 4, max_ease: 14, tolerance: 2 },
      },
    },
    shape_spec: { sleeve: "none", silhouette: "straight", hem_flare: 0.15 },
    sort_order: 2,
  },
  {
    id: "mock-3",
    title: "真丝小方领衬衫",
    price: "¥599",
    fabric: "桑蚕丝 100%(16 姆米)",
    // 这件没有结构化尺码表,走 size_chart 原文降级路径
    size_chart: "S 肩38 胸92 衣长62\nM 肩39 胸96 衣长63\nL 肩40 胸100 衣长64",
    detail_text: "16 姆米重磅真丝,不透。小方领可开可扣。建议手洗或干洗。",
    image_url: "/placeholder/top.svg",
    images: ["/placeholder/top.svg"],
    size_spec: null,
    shape_spec: null,
    sort_order: 3,
  },
  {
    id: "mock-4",
    title: "羊毛混纺廓形西装外套",
    price: "¥899",
    fabric: "羊毛 70% 聚酯纤维 30%",
    size_chart: null,
    detail_text:
      "垫肩廓形但不夸张,可内搭薄毛衫。双开衩后摆。\n模特身高 170cm 体重 52kg,穿 S 码。",
    image_url: "/placeholder/top.svg",
    images: ["/placeholder/top.svg"],
    size_spec: {
      category: "outerwear",
      unit: "cm",
      stretch: "none",
      sizes: [
        { name: "S", measurements: { shoulder: 40, bust: 98, waist: 90, length: 72, sleeve: 58 } },
        { name: "M", measurements: { shoulder: 41, bust: 102, waist: 94, length: 74, sleeve: 59 } },
        { name: "L", measurements: { shoulder: 42, bust: 106, waist: 98, length: 76, sleeve: 60 } },
      ],
      judge_fields: ["bust", "shoulder"],
      fit_rules: {
        bust: { min_ease: 10, max_ease: 22, tolerance: 3 },
        shoulder: { min_ease: 1, max_ease: 5, tolerance: 1 },
      },
    },
    shape_spec: { sleeve: "long", silhouette: "straight", hem_flare: 0.1 },
    sort_order: 4,
  },
  {
    id: "mock-5",
    title: "高腰 A 字半身裙",
    price: "¥379",
    fabric: "涤纶 95% 氨纶 5%",
    size_chart: null,
    detail_text: "高腰显腿长,A 字摆走路有型。侧隐形拉链,内衬防走光。",
    image_url: "/placeholder/dress.svg",
    images: ["/placeholder/dress.svg"],
    size_spec: {
      category: "skirt",
      unit: "cm",
      stretch: "slight",
      sizes: [
        { name: "S", measurements: { waist: 64, hip: 90, length: 72 } },
        { name: "M", measurements: { waist: 68, hip: 94, length: 74 } },
        { name: "L", measurements: { waist: 72, hip: 98, length: 76 } },
      ],
      judge_fields: ["waist", "hip"],
      fit_rules: {
        waist: { min_ease: 0, max_ease: 4, tolerance: 1.5 },
        hip: { min_ease: 4, max_ease: 14, tolerance: 2 },
      },
    },
    shape_spec: { sleeve: "none", silhouette: "aline", hem_flare: 0.55 },
    sort_order: 5,
  },
  {
    id: "mock-6",
    title: "细羊毛圆领针织衫",
    price: "¥429",
    fabric: "羊毛 50% 腈纶 50%",
    size_chart: "均码 胸围 96 衣长 58 袖长 57(弹性大,适合 S-L)",
    detail_text: "细羊毛不扎人,弹性大所以做均码。冷水手洗平铺阴干。",
    image_url: "/placeholder/top.svg",
    images: ["/placeholder/top.svg"],
    size_spec: null,
    shape_spec: null,
    sort_order: 6,
  },
];
