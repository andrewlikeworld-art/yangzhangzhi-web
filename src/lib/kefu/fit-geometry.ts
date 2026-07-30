// FitVisualizer 的滑块配置。
// 历史:本文件原是参数化人形/衣形绘制(anchors/silhouettePath/sleevePaths),
// 2026-07-05 Andrew 截图确认参数化画形不像衣服,绘制全面改用标准线稿模板
// (garment-templates.ts),参数化代码已删(要找看 git history 本文件旧版)。

// 滑块配置:judge_fields 决定显示哪些。min/max/默认值(cm)。
export const FIELD_SLIDER: Record<
  string,
  { label: string; min: number; max: number; def: number }
> = {
  bust: { label: "胸围", min: 76, max: 120, def: 88 },
  waist: { label: "腰围", min: 55, max: 105, def: 70 },
  hip: { label: "臀围", min: 78, max: 122, def: 92 },
  thigh: { label: "大腿围", min: 40, max: 72, def: 52 },
  shoulder: { label: "肩宽", min: 34, max: 46, def: 39 },
};
