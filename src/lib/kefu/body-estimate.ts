// 身高体重 → 成年女性三围估算。纯函数,给 FitVisualizer 的"不知道尺寸"入口用。
//
// ⚠️ 这是经验近似(按 BMI + 身高线性拟合,用几组常见身材校准),不是医学模型。
// 同身高体重体型差异可达 ±3-5cm,所以 UI 必须标注"估算值,可微调",
// 结果话术要带范围,不装精确。

export interface BodyEstimate {
  bust: number;
  waist: number;
  hip: number;
  thigh: number;
  shoulder: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// heightCm 140-190,weightJin 60-220(斤;中国用户习惯用斤)。超界夹紧。
export function estimateFemaleBody(heightCm: number, weightJin: number): BodyEstimate {
  const h = clamp(heightCm, 140, 190);
  const kg = clamp(weightJin, 60, 220) / 2;
  const bmi = kg / (h / 100) ** 2;
  const r = Math.round;
  const hip = 1.36 * bmi + 0.16 * h + 37.9;
  return {
    bust: r(1.7 * bmi + 0.26 * h + 9.9),
    waist: r(2.0 * bmi + 0.16 * h + 0.8),
    hip: r(hip),
    thigh: r(hip * 0.57),
    shoulder: r(h * 0.235),
  };
}

// 输入是否够格触发估算(两个都填了且在人类范围内)。
export function canEstimate(heightCm: number, weightJin: number): boolean {
  return heightCm >= 140 && heightCm <= 190 && weightJin >= 60 && weightJin <= 220;
}

// ── 区间化输出(size-l1)──
// 查证结论(size-data-research.md 第四节):身高体重→围度没有公认解析公式,
// 拟合只能做兜底降级,必须区间化输出、置信度标低;实测和尺码锚定永远优先。

export interface RangeCm {
  low: number;
  high: number;
}

export interface FemaleBodyRangeEstimate {
  bust: RangeCm;
  waist: RangeCm;
  hip: RangeCm;
  confidence: "estimated"; // 恒为低置信兜底,话术必须带"估算"来源
}

// 点值 ±4cm:取自文件头注释"同身高体重体型差异可达 ±3-5cm"的中值。
const SPREAD = 4;

// 身高体重 → 三围区间。内部复用点值拟合(超界夹紧逻辑一并继承),只加不确定度包络。
export function estimateFemaleBodyRange(
  heightCm: number,
  weightJin: number,
): FemaleBodyRangeEstimate {
  const p = estimateFemaleBody(heightCm, weightJin);
  const around = (v: number): RangeCm => ({ low: v - SPREAD, high: v + SPREAD });
  return {
    bust: around(p.bust),
    waist: around(p.waist),
    hip: around(p.hip),
    confidence: "estimated",
  };
}
