"use client";

// 商品详情页尺寸标注图:标准服装线稿(garment-templates,黑白轮廓)+ 尺寸标注线,
// 切换尺码数字联动。图为标准款示意不按比例,尺寸以标注数字为准。
// 纯前端消费 size_spec + shape_spec,零 AI 零请求。

import { useState } from "react";
import { pickGarmentTemplate, TPL_W, TPL_H } from "@/lib/kefu/garment-templates";
import { FIELD_LABEL, type SizeSpec, type ShapeSpec } from "@/lib/kefu/size-spec";
import { cn } from "@/lib/utils";

export function SizeDiagram({
  spec,
  shape,
}: {
  spec: SizeSpec;
  shape?: ShapeSpec | null;
}) {
  const [idx, setIdx] = useState(0);
  const entry = spec.sizes[idx];
  if (!entry) return null;
  const get = (f: string) => (entry.measurements as Record<string, number>)[f];

  const tpl = pickGarmentTemplate(spec.category, shape, get);
  const dims = tpl.slots.filter((s) => get(s.field) != null);
  const length = get("length");
  const sleeve = get("sleeve");

  return (
    <div>
      {/* 尺码切换 */}
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {spec.sizes.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs transition-colors",
              i === idx ? "border-foreground/50 bg-accent font-medium" : "border-border hover:bg-accent/50",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${TPL_W} ${TPL_H}`}
        className="w-full max-w-[300px]"
        role="img"
        aria-label={`${entry.name} 码尺寸示意`}
      >
        {/* 线稿(黑白轮廓,主题色适配) */}
        {tpl.paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            className="stroke-foreground/70"
            strokeWidth={p.dashed ? 1.2 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
            {...(p.dashed ? { strokeDasharray: "4 4" } : {})}
          />
        ))}
        {/* 横向尺寸标注线 */}
        {dims.map((d) => (
          <g key={d.field} className="stroke-rose-500/80">
            <line x1={d.x1} y1={d.y} x2={d.x2} y2={d.y} strokeWidth={1} strokeDasharray="5 3" />
            <line x1={d.x1} y1={d.y - 4} x2={d.x1} y2={d.y + 4} strokeWidth={1} />
            <line x1={d.x2} y1={d.y - 4} x2={d.x2} y2={d.y + 4} strokeWidth={1} />
            <text
              x={(d.x1 + d.x2) / 2}
              y={d.y - 5}
              textAnchor="middle"
              className="fill-rose-600 stroke-none text-[13px] dark:fill-rose-400"
            >
              {FIELD_LABEL[d.field] ?? d.field} {get(d.field)}
            </text>
          </g>
        ))}
        {/* 衣长/裤长/裙长竖向标注(右侧) */}
        {length != null && (
          <g className="stroke-rose-500/80">
            <line x1={tpl.lengthLine.x} y1={tpl.lengthLine.y1} x2={tpl.lengthLine.x} y2={tpl.lengthLine.y2} strokeWidth={1} strokeDasharray="5 3" />
            <line x1={tpl.lengthLine.x - 4} y1={tpl.lengthLine.y1} x2={tpl.lengthLine.x + 4} y2={tpl.lengthLine.y1} strokeWidth={1} />
            <line x1={tpl.lengthLine.x - 4} y1={tpl.lengthLine.y2} x2={tpl.lengthLine.x + 4} y2={tpl.lengthLine.y2} strokeWidth={1} />
            <text
              x={tpl.lengthLine.x + 8}
              y={(tpl.lengthLine.y1 + tpl.lengthLine.y2) / 2}
              textAnchor="middle"
              transform={`rotate(90 ${tpl.lengthLine.x + 8} ${(tpl.lengthLine.y1 + tpl.lengthLine.y2) / 2})`}
              className="fill-rose-600 stroke-none text-[13px] dark:fill-rose-400"
            >
              长 {length}
            </text>
          </g>
        )}
      </svg>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        标准款示意图,不按比例;单位 cm,平铺测量
        {sleeve != null ? `;袖长 ${sleeve}` : ""}
        ;其余尺寸见下表
      </p>
    </div>
  );
}
