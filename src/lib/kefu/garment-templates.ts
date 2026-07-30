// 服装线稿模板库:标准黑白轮廓图(手绘 SVG path,无版权问题),
// 详情页尺寸标注图用。按 品类 + shape_spec + 长度 自动选款;
// 图是"标准款示意"不按比例,尺寸以标注数字为准(2026-07-05 Andrew 决策:
// 参数化画形不像衣服,换标准线稿+标数字)。
// viewBox 统一 286×380(右侧留标注区),中线 cx=120。

import type { GarmentCategory, ShapeSpec } from "./size-spec";

export const TPL_W = 286;
export const TPL_H = 380;

export interface GarmentTemplate {
  key: string;
  paths: { d: string; dashed?: boolean }[];
  // 横向尺寸标注位(field 有测量值才画)
  slots: { field: string; y: number; x1: number; x2: number }[];
  // 衣长/裤长/裙长竖向标注线
  lengthLine: { x: number; y1: number; y2: number };
}

const T: Record<string, GarmentTemplate> = {
  top_short: {
    key: "top_short",
    paths: [
      {
        d: "M 92 66 Q 120 78 148 66 L 186 84 L 208 142 L 174 156 L 168 138 L 170 300 L 70 300 L 72 138 L 66 156 L 32 142 L 54 84 Z",
      },
      { d: "M 92 66 Q 120 98 148 66" }, // 领口
      { d: "M 72 138 L 58 88" }, // 左袖笼线
      { d: "M 168 138 L 182 88" }, // 右袖笼线
    ],
    slots: [
      { field: "shoulder", y: 84, x1: 54, x2: 186 },
      { field: "bust", y: 170, x1: 71, x2: 169 },
    ],
    lengthLine: { x: 232, y1: 66, y2: 300 },
  },
  top_long: {
    key: "top_long",
    paths: [
      {
        d: "M 92 66 Q 120 78 148 66 L 186 84 L 204 250 L 172 256 L 168 138 L 170 300 L 70 300 L 72 138 L 68 256 L 36 250 L 54 84 Z",
      },
      { d: "M 92 66 Q 120 98 148 66" },
      { d: "M 72 138 L 58 88" },
      { d: "M 168 138 L 182 88" },
    ],
    slots: [
      { field: "shoulder", y: 84, x1: 54, x2: 186 },
      { field: "bust", y: 170, x1: 71, x2: 169 },
    ],
    lengthLine: { x: 232, y1: 66, y2: 300 },
  },
  top_sleeveless: {
    key: "top_sleeveless",
    paths: [
      {
        d: "M 96 62 Q 120 72 144 62 L 164 68 C 154 96 152 118 164 140 L 166 300 L 74 300 L 76 140 C 88 118 86 96 76 68 Z",
      },
      { d: "M 96 62 Q 120 100 144 62" },
    ],
    slots: [
      { field: "shoulder", y: 66, x1: 76, x2: 164 },
      { field: "bust", y: 160, x1: 75, x2: 165 },
    ],
    lengthLine: { x: 232, y1: 62, y2: 300 },
  },
  pants_straight: {
    key: "pants_straight",
    paths: [
      { d: "M 76 60 L 164 60 L 164 74 L 76 74 Z" }, // 腰头
      {
        d: "M 76 74 C 70 108 68 132 70 152 L 66 350 L 106 350 L 118 168 L 122 168 L 134 350 L 174 350 L 170 152 C 172 132 170 108 164 74 Z",
      },
      { d: "M 118 76 C 112 100 112 132 118 162", dashed: true }, // 门襟
    ],
    slots: [
      { field: "waist", y: 67, x1: 76, x2: 164 },
      { field: "hip", y: 122, x1: 69, x2: 171 },
      { field: "thigh", y: 200, x1: 66, x2: 117 },
    ],
    lengthLine: { x: 232, y1: 60, y2: 350 },
  },
  pants_wide: {
    key: "pants_wide",
    paths: [
      { d: "M 76 60 L 164 60 L 164 74 L 76 74 Z" },
      {
        d: "M 76 74 C 68 110 64 140 62 170 L 54 350 L 112 350 L 118 172 L 122 172 L 128 350 L 186 350 L 178 170 C 176 140 172 110 164 74 Z",
      },
      { d: "M 118 76 C 112 100 112 134 118 166", dashed: true },
    ],
    slots: [
      { field: "waist", y: 67, x1: 76, x2: 164 },
      { field: "hip", y: 122, x1: 67, x2: 173 },
      { field: "thigh", y: 200, x1: 59, x2: 117 },
    ],
    lengthLine: { x: 232, y1: 60, y2: 350 },
  },
  shorts: {
    key: "shorts",
    paths: [
      { d: "M 76 60 L 164 60 L 164 74 L 76 74 Z" },
      {
        d: "M 76 74 C 70 100 68 120 68 140 L 66 190 L 112 190 L 118 160 L 122 160 L 128 190 L 174 190 L 172 140 C 172 120 170 100 164 74 Z",
      },
      { d: "M 118 76 C 113 96 113 128 118 154", dashed: true },
    ],
    slots: [
      { field: "waist", y: 67, x1: 76, x2: 164 },
      { field: "hip", y: 118, x1: 68, x2: 172 },
      { field: "thigh", y: 172, x1: 66, x2: 117 },
    ],
    lengthLine: { x: 232, y1: 60, y2: 190 },
  },
  skirt_short: {
    key: "skirt_short",
    paths: [
      { d: "M 82 70 L 158 70 L 158 82 L 82 82 Z" },
      { d: "M 82 82 C 76 112 70 146 60 180 Q 120 192 180 180 C 170 146 164 112 158 82 Z" },
    ],
    slots: [
      { field: "waist", y: 76, x1: 82, x2: 158 },
      { field: "hip", y: 124, x1: 73, x2: 167 },
    ],
    lengthLine: { x: 232, y1: 70, y2: 186 },
  },
  skirt_long: {
    key: "skirt_long",
    paths: [
      { d: "M 82 70 L 158 70 L 158 82 L 82 82 Z" },
      { d: "M 82 82 C 74 160 66 240 56 330 Q 120 344 184 330 C 174 240 166 160 158 82 Z" },
    ],
    slots: [
      { field: "waist", y: 76, x1: 82, x2: 158 },
      { field: "hip", y: 134, x1: 73, x2: 167 },
    ],
    lengthLine: { x: 232, y1: 70, y2: 337 },
  },
  dress: {
    key: "dress",
    paths: [
      {
        d: "M 94 64 Q 120 74 146 64 L 170 74 L 184 108 L 162 118 C 156 150 154 170 158 190 C 168 240 176 290 184 330 Q 120 344 56 330 C 64 290 72 240 82 190 C 86 170 84 150 78 118 L 56 108 L 70 74 Z",
      },
      { d: "M 94 64 Q 120 96 146 64" },
    ],
    slots: [
      { field: "bust", y: 132, x1: 79, x2: 161 },
      { field: "waist", y: 190, x1: 82, x2: 158 },
      { field: "hip", y: 244, x1: 74, x2: 166 },
    ],
    lengthLine: { x: 232, y1: 64, y2: 337 },
  },
};

// 选款:品类 + 袖型 + 长度(cm)+ 下摆张开度。图为示意,不追求精确比例。
export function pickGarmentTemplate(
  category: GarmentCategory,
  shape: ShapeSpec | null | undefined,
  get: (f: string) => number | undefined,
): GarmentTemplate {
  const len = get("length");
  if (category === "pants") {
    if (len != null && len < 70) return T.shorts;
    if (shape && (shape.hem_flare > 0.45 || shape.silhouette === "wide" || shape.silhouette === "aline"))
      return T.pants_wide;
    return T.pants_straight;
  }
  if (category === "skirt") {
    return len != null && len < 65 ? T.skirt_short : T.skirt_long;
  }
  if (category === "dress") return T.dress;
  // top / outerwear
  if (shape?.sleeve === "long") return T.top_long;
  if (shape?.sleeve === "none") return T.top_sleeveless;
  return T.top_short;
}
