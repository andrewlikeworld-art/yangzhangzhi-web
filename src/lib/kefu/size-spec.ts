// SizeSpec 标准结构 + 纯工具(类型/校验/半围纠偏/渲染回退)。
// 纯模块,不引入 LLM/网络依赖,方便单测直接 import。
// LLM 解析在 size-parse.ts;判定在 fit.ts;渲染在 SizeTable/FitVisualizer。

export type GarmentCategory = "top" | "pants" | "skirt" | "dress" | "outerwear";
export type Stretch = "none" | "slight" | "high";

// 标准测量字段(其余无法映射的进 extra,保留原始中文名)
export type StdField = "shoulder" | "bust" | "waist" | "hip" | "thigh" | "length" | "sleeve";

export interface SizeEntry {
  name: string;
  measurements: Partial<Record<StdField, number>>;
  extra?: Record<string, number>;
}

export interface FitRule {
  min_ease?: number;
  max_ease?: number;
  tolerance?: number;
}

export interface SizeSpec {
  category: GarmentCategory;
  unit: "cm";
  stretch: Stretch;
  sizes: SizeEntry[];
  judge_fields: string[];
  fit_rules: Record<string, FitRule>;
}

export type SizeSpecResult = SizeSpec | { error: string };

export function isSizeSpec(v: unknown): v is SizeSpec {
  return (
    !!v &&
    typeof v === "object" &&
    Array.isArray((v as SizeSpec).sizes) &&
    Array.isArray((v as SizeSpec).judge_fields) &&
    !!(v as SizeSpec).fit_rules &&
    typeof (v as SizeSpec).fit_rules === "object"
  );
}

// 围度类字段的"全围下限":低于这个值基本可判定商家录的是半围/平铺单量。
// 判定层只吃全围,这里做一层防御性纠偏(LLM prompt 也会处理,双保险 + 可单测)。
const GIRTH_FLOOR: Record<string, number> = { bust: 65, waist: 45, hip: 60, thigh: 35 };

// 半围→全围防御纠偏:某围度字段明显只有一半时 ×2,并在该尺码 extra 记换算说明。
// 纯函数,不改入参,返回新对象。
export function normalizeSizeSpec(spec: SizeSpec): SizeSpec {
  const sizes = spec.sizes.map((s) => {
    const measurements = { ...s.measurements } as Record<string, number>;
    const extra = { ...(s.extra ?? {}) };
    for (const [field, floor] of Object.entries(GIRTH_FLOOR)) {
      const v = measurements[field];
      if (typeof v === "number" && v > 0 && v < floor && v * 2 <= 140) {
        measurements[field] = v * 2;
        extra[`${field}_半围换算`] = v;
      }
    }
    return { ...s, measurements, ...(Object.keys(extra).length ? { extra } : {}) };
  });
  return { ...spec, sizes };
}

// 前端用:size_spec 能不能渲染成表/组件。null / {error} / 结构不合法 → 回退原始文字。
export function shouldRenderSizeTable(v: unknown): SizeSpec | null {
  return isSizeSpec(v) ? v : null;
}

// ── ShapeSpec:商品轮廓参数(视觉模型看商品图识别一次,存 kefu_products.shape_spec)──
// 只描述"尺码表量不出"的形状信息;真实宽度永远以测量数据为准。

export type SleeveClass = "none" | "short" | "long";
export type SilhouetteClass = "slim" | "straight" | "aline" | "wide";

export interface ShapeSpec {
  sleeve: SleeveClass;
  silhouette: SilhouetteClass;
  hem_flare: number; // 0-1:下摆/脚口张开程度(紧0,直筒~0.15,A字~0.5,大摆~0.9)
  note?: string;
}

const SLEEVES: SleeveClass[] = ["none", "short", "long"];
const SILHOUETTES: SilhouetteClass[] = ["slim", "straight", "aline", "wide"];

// 归一化:钳制取值 + 下装强制 sleeve=none(VL 模型偶尔会给裤子发袖子)。
export function normalizeShapeSpec(
  raw: unknown,
  category: GarmentCategory,
): ShapeSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sleeve =
    category === "pants" || category === "skirt"
      ? "none"
      : SLEEVES.includes(o.sleeve as SleeveClass)
        ? (o.sleeve as SleeveClass)
        : "none";
  const silhouette = SILHOUETTES.includes(o.silhouette as SilhouetteClass)
    ? (o.silhouette as SilhouetteClass)
    : "straight";
  const f = Number(o.hem_flare);
  const hem_flare = Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : 0.15;
  return {
    sleeve,
    silhouette,
    hem_flare,
    ...(typeof o.note === "string" ? { note: o.note } : {}),
  };
}

// 标准字段的中文列名(展示用);extra 字段用原始中文名。
export const FIELD_LABEL: Record<string, string> = {
  shoulder: "肩宽",
  bust: "胸围",
  waist: "腰围",
  hip: "臀围",
  thigh: "大腿围",
  length: "衣长/裤长",
  sleeve: "袖长",
};
