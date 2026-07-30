"use client";

import { FIELD_LABEL, type SizeSpec } from "@/lib/kefu/size-spec";
import { cn } from "@/lib/utils";

// 商品详情页尺码表:列=测量字段(标准字段中文名/extra 原名),行=尺码。
// 移动端首列尺码名 sticky、其余横向滚动;judge_fields 列表头加圆点标"关键尺寸"。

const STD_ORDER = ["shoulder", "bust", "waist", "hip", "thigh", "length", "sleeve"];

export function SizeTable({
  spec,
  note = "平铺测量,单位 cm,误差 ±2cm 属正常范围",
}: {
  spec: SizeSpec;
  note?: string;
}) {
  // 标准字段列(按固定顺序,存在才显示)
  const stdCols = STD_ORDER.filter((f) =>
    spec.sizes.some((s) => (s.measurements as Record<string, number>)[f] != null),
  );
  // extra 字段列(排除半围换算这类注记)
  const extraCols = Array.from(
    new Set(
      spec.sizes.flatMap((s) =>
        Object.keys(s.extra ?? {}).filter((k) => !k.includes("半围换算")),
      ),
    ),
  );
  const cols = [...stdCols, ...extraCols];
  const judge = new Set(spec.judge_fields);

  const cellVal = (s: SizeSpec["sizes"][number], col: string) => {
    const v =
      (s.measurements as Record<string, number>)[col] ?? s.extra?.[col];
    return v ?? "—";
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 font-medium">
                尺码
              </th>
              {cols.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                  <span className="inline-flex items-center gap-1">
                    {judge.has(c) && (
                      <span
                        className="inline-block size-1.5 rounded-full bg-rose-500"
                        title="关键尺寸"
                      />
                    )}
                    {FIELD_LABEL[c] ?? c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.sizes.map((s, i) => (
              <tr
                key={s.name}
                className={cn("border-t border-border", i % 2 === 1 && "bg-muted/20")}
              >
                <th
                  className={cn(
                    "sticky left-0 z-10 px-3 py-2 text-left font-semibold",
                    i % 2 === 1 ? "bg-[color-mix(in_srgb,var(--color-muted)_20%,var(--color-background))]" : "bg-background",
                  )}
                >
                  {s.name}
                </th>
                {cols.map((c) => (
                  <td
                    key={c}
                    className={cn(
                      "whitespace-nowrap px-3 py-2 tabular-nums",
                      judge.has(c) && "font-medium",
                    )}
                  >
                    {cellVal(s, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="inline-block size-1.5 rounded-full bg-rose-500" />
        关键尺寸 · {note}
      </p>
    </div>
  );
}
