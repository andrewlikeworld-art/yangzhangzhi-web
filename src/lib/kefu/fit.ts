// 尺码合身判定 —— 纯函数,无副作用,阈值全部从 SizeSpec.fit_rules 读,不硬编码。
// 判定逻辑见任务书;衣服尺寸来自 size_spec,身体尺寸来自顾客输入。

import type { SizeSpec, SizeEntry, FitRule } from "./size-spec";

export type FitStatus = "cant" | "tight" | "fit" | "loose";
// 从坏到好排序,整体状态取"最差"。
const RANK: Record<FitStatus, number> = { cant: 0, tight: 1, loose: 2, fit: 3 };

export interface FieldResult {
  field: string;
  garment: number; // 衣服尺寸
  body: number; // 身体尺寸
  ease: number; // 衣服 − 身体
  status: FitStatus;
  kind: "ease" | "tolerance";
}

export interface SizeFitResult {
  name: string;
  status: FitStatus; // 整体 = 各字段最差
  fields: FieldResult[];
}

export interface JudgeResult {
  results: SizeFitResult[];
  recommended: string | null; // 推荐码;null = 建议咨询客服
  consult: boolean; // true = 没有合身/宽松,建议咨询客服
}

// 单字段判定。ease 类看 min/max_ease;tolerance 类(肩宽)看 |diff|。
export function judgeField(garment: number, body: number, rule: FitRule): FitStatus {
  const ease = garment - body;
  if (rule.tolerance != null) {
    if (Math.abs(ease) <= rule.tolerance) return "fit";
    return ease < 0 ? "tight" : "loose";
  }
  const min = rule.min_ease ?? 0;
  const max = rule.max_ease ?? Infinity;
  if (ease < min - 3) return "cant";
  if (ease < min) return "tight";
  if (ease <= max) return "fit";
  return "loose";
}

// 一个尺码 vs 一组身体数据。只看 judge_fields 中"衣服和身体都有值"的字段。
export function judgeSize(
  entry: SizeEntry,
  body: Partial<Record<string, number>>,
  spec: SizeSpec,
): SizeFitResult {
  const fields: FieldResult[] = [];
  for (const field of spec.judge_fields) {
    const garment = (entry.measurements as Record<string, number>)[field];
    const b = body[field];
    const rule = spec.fit_rules[field];
    if (garment == null || b == null || !rule) continue;
    const status = judgeField(garment, b, rule);
    fields.push({
      field,
      garment,
      body: b,
      ease: garment - b,
      status,
      kind: rule.tolerance != null ? "tolerance" : "ease",
    });
  }
  // 整体 = 最差;没有可判定字段时按 fit(不阻塞,交给上层提示数据不足)
  const status =
    fields.length === 0
      ? "fit"
      : fields.reduce<FitStatus>(
          (worst, f) => (RANK[f.status] < RANK[worst] ? f.status : worst),
          "fit",
        );
  return { name: entry.name, status, fields };
}

// 全部尺码 + 推荐:第一个"合身"→ 否则第一个"宽松"→ 否则建议咨询客服。
export function judgeAll(
  spec: SizeSpec,
  body: Partial<Record<string, number>>,
): JudgeResult {
  const results = spec.sizes.map((s) => judgeSize(s, body, spec));
  const fit = results.find((r) => r.status === "fit");
  const loose = results.find((r) => r.status === "loose");
  const rec = fit ?? loose ?? null;
  return {
    results,
    recommended: rec?.name ?? null,
    consult: rec == null,
  };
}

export const FIT_LABEL: Record<FitStatus, string> = {
  cant: "穿不上",
  tight: "偏紧",
  fit: "合身",
  loose: "宽松",
};
