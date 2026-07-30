"use client";

// 交互式试穿组件(聊天内嵌):标准线稿 + 状态色 + 各部位余量标注。
// 2026-07-05 改版:放弃参数化人形/衣形叠加(画不像,Andrew 截图确认),
// 改用 garment-templates 线稿,松紧用颜色(绿合身/橙紧/红穿不上/灰蓝松)
// 和标注数字(腰围 +4cm)表达。判定仍走 fit.ts 真实数据引擎。

import { useMemo, useState } from "react";
import { pickGarmentTemplate, TPL_W, TPL_H } from "@/lib/kefu/garment-templates";
import { judgeAll, judgeSize, FIT_LABEL, type FitStatus } from "@/lib/kefu/fit";
import { estimateFemaleBody, canEstimate } from "@/lib/kefu/body-estimate";
import { FIELD_LABEL, type SizeSpec, type ShapeSpec } from "@/lib/kefu/size-spec";
import { FIELD_SLIDER } from "@/lib/kefu/fit-geometry";
import { cn } from "@/lib/utils";

const STATUS_HEX: Record<FitStatus, string> = {
  fit: "#10b981",
  tight: "#f59e0b",
  cant: "#ef4444",
  loose: "#64748b",
};
const STATUS_BADGE: Record<FitStatus, string> = {
  fit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  tight: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  cant: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  loose: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function FitVisualizer({
  spec,
  shape,
  onAskAgent,
}: {
  spec: SizeSpec;
  shape?: ShapeSpec | null;
  onAskAgent?: (body: Record<string, number>, recommended: string | null) => void;
}) {
  // 身体数据:每个 judge_field 一个滑块,初值取默认
  const [body, setBody] = useState<Record<string, number>>(() => {
    const b: Record<string, number> = {};
    for (const f of spec.judge_fields) b[f] = FIELD_SLIDER[f]?.def ?? 90;
    return b;
  });
  const [picked, setPicked] = useState<string | null>(null);
  // 身高体重入口:客户多半不知道自己三围,填这两个就自动估算(可再微调滑块)
  const [heightCm, setHeightCm] = useState("");
  const [weightJin, setWeightJin] = useState("");
  const [estimated, setEstimated] = useState(false);

  function applyEstimate(hStr: string, wStr: string) {
    const h = Number(hStr);
    const w = Number(wStr);
    if (!canEstimate(h, w)) return;
    const est = estimateFemaleBody(h, w) as unknown as Record<string, number>;
    setBody((prev) => {
      const next = { ...prev };
      for (const f of spec.judge_fields) if (est[f] != null) next[f] = est[f];
      return next;
    });
    setEstimated(true);
  }

  const judged = useMemo(() => judgeAll(spec, body), [spec, body]);
  const selectedName = picked ?? judged.recommended ?? spec.sizes[0]?.name ?? "";
  const selected = spec.sizes.find((s) => s.name === selectedName) ?? spec.sizes[0];
  const selResult = selected ? judgeSize(selected, body, spec) : null;
  const selStatus = selResult?.status ?? "fit";
  const hex = STATUS_HEX[selStatus];

  // 线稿模板(与详情页同一套,裤子一眼是裤子)
  const garmentGet = (f: string) =>
    (selected?.measurements as Record<string, number>)[f];
  const tpl = pickGarmentTemplate(spec.category, shape, garmentGet);
  // 图上标注:各 judge 字段的余量(标在模板对应标注位)
  const fieldByName = new Map(selResult?.fields.map((f) => [f.field, f]) ?? []);
  const annotations = tpl.slots
    .map((s) => ({ slot: s, fd: fieldByName.get(s.field) }))
    .filter((x): x is { slot: (typeof tpl.slots)[number]; fd: NonNullable<typeof x.fd> } => !!x.fd);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* 左:线稿 + 状态色 + 余量标注 */}
        <div className="shrink-0 self-center">
          <svg
            width={150}
            height={150 * (TPL_H / TPL_W)}
            viewBox={`0 0 ${TPL_W} ${TPL_H}`}
            role="img"
            aria-label="试穿示意"
          >
            {tpl.paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                // 只有闭合轮廓(Z 结尾)填状态色;领口/袖笼等细节线只描边
                fill={!p.dashed && p.d.trimEnd().endsWith("Z") ? hex : "none"}
                fillOpacity={0.15}
                stroke={p.dashed ? "currentColor" : hex}
                strokeOpacity={p.dashed ? 0.4 : 1}
                strokeWidth={p.dashed ? 1.2 : 2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
                {...(p.dashed ? { strokeDasharray: "4 4" } : {})}
              />
            ))}
            {/* 各部位余量标注 */}
            {annotations.map(({ slot, fd }) => {
              const c = STATUS_HEX[fd.status];
              const label =
                fd.kind === "tolerance"
                  ? fd.ease === 0
                    ? "正好"
                    : `${fd.ease > 0 ? "松" : "紧"}${Math.abs(fd.ease)}`
                  : fd.ease >= 0
                    ? `+${fd.ease}`
                    : `${fd.ease}`;
              return (
                <g key={slot.field}>
                  <line
                    x1={slot.x1}
                    y1={slot.y}
                    x2={slot.x2}
                    y2={slot.y}
                    stroke={c}
                    strokeWidth={1}
                    strokeDasharray="5 3"
                  />
                  <text
                    x={(slot.x1 + slot.x2) / 2}
                    y={slot.y - 5}
                    textAnchor="middle"
                    fill={c}
                    className="text-[13px] font-medium"
                  >
                    {FIELD_LABEL[slot.field] ?? slot.field} {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 右:控件 + 结果 */}
        <div className="min-w-0 flex-1">
          {/* 身高体重入口(不知道三围就填这个,自动估算) */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">不知道尺寸?</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="身高"
              value={heightCm}
              onChange={(e) => {
                setHeightCm(e.target.value);
                applyEstimate(e.target.value, weightJin);
              }}
              className="w-14 rounded border bg-background px-1.5 py-0.5 text-right tabular-nums"
            />
            <span className="text-muted-foreground">cm</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="体重"
              value={weightJin}
              onChange={(e) => {
                setWeightJin(e.target.value);
                applyEstimate(heightCm, e.target.value);
              }}
              className="w-14 rounded border bg-background px-1.5 py-0.5 text-right tabular-nums"
            />
            <span className="text-muted-foreground">斤</span>
            {estimated && (
              <span className="w-full text-[10px] text-muted-foreground sm:w-auto">
                → 已估算围度(±3cm,可在下方微调)
              </span>
            )}
          </div>

          {/* 尺码 chips */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {spec.sizes.map((s) => {
              const st = judgeSize(s, body, spec).status;
              const active = s.name === selectedName;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setPicked(s.name)}
                  className={cn(
                    "flex flex-col items-center rounded-md border px-2 py-1 text-xs transition-colors",
                    active ? "border-foreground/50 bg-accent" : "border-border hover:bg-accent/50",
                  )}
                >
                  <span className="font-medium">
                    {s.name}
                    {judged.recommended === s.name && (
                      <span className="ml-1 text-[9px] text-rose-500">荐</span>
                    )}
                  </span>
                  <span className={cn("mt-0.5 rounded px-1 text-[10px]", STATUS_BADGE[st])}>
                    {FIT_LABEL[st]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 滑块 */}
          <div className="space-y-2">
            {spec.judge_fields.map((f) => {
              const cfg = FIELD_SLIDER[f];
              if (!cfg) return null;
              return (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs text-muted-foreground">
                    {FIELD_LABEL[f] ?? cfg.label}
                  </span>
                  <input
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    value={body[f]}
                    onChange={(e) => setBody((b) => ({ ...b, [f]: Number(e.target.value) }))}
                    className="h-1 flex-1 accent-foreground"
                  />
                  <input
                    type="number"
                    min={cfg.min}
                    max={cfg.max}
                    value={body[f]}
                    onChange={(e) =>
                      setBody((b) => ({ ...b, [f]: Number(e.target.value) || cfg.min }))
                    }
                    className="w-14 rounded border bg-background px-1 py-0.5 text-right text-xs tabular-nums"
                  />
                  <span className="text-[10px] text-muted-foreground">cm</span>
                </div>
              );
            })}
          </div>

          {/* 结果卡 */}
          {selResult && (
            <div className="mt-2 rounded-lg bg-muted/40 p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{selectedName} 码</span>
                <span className={cn("rounded px-1.5 py-0.5", STATUS_BADGE[selStatus])}>
                  {FIT_LABEL[selStatus]}
                </span>
                {judged.consult && (
                  <span className="text-[10px] text-muted-foreground">建议咨询客服</span>
                )}
              </div>
              <div className="mt-1 text-muted-foreground">
                {selResult.fields.map((fd) => (
                  <span key={fd.field} className="mr-2 inline-block">
                    {FIELD_LABEL[fd.field] ?? fd.field}
                    {fd.kind === "tolerance"
                      ? fd.ease === 0
                        ? " 正好"
                        : `${fd.ease > 0 ? " 松" : " 紧"}${Math.abs(fd.ease)}cm`
                      : ` 余量${fd.ease}cm`}
                    (<span>{FIT_LABEL[fd.status]}</span>)
                  </span>
                ))}
              </div>
            </div>
          )}

          {onAskAgent && (
            <button
              type="button"
              onClick={() => onAskAgent(body, judged.recommended)}
              className="mt-2 text-xs text-rose-600 hover:underline"
            >
              还是拿不准?问客服 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
