"use client";

// 输入条:自增高 textarea + 发送键。Enter 发送,Shift+Enter 换行;移动端不抢 Enter。
// 相对 roundtable 版去掉了语音输入(MicButton)—— 它依赖 ASR 服务,顾客站按需再加。
import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // 自增高:内容变化时重算,上限 5 行
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-2 px-3 py-2.5">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // 输入法组合中(中文拼音未上屏)不能当发送,否则会吞掉候选词确认
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSend();
          }
        }}
        rows={1}
        placeholder={placeholder}
        className={cn(
          "min-h-9 flex-1 resize-none rounded-2xl border bg-background px-3.5 py-2 text-sm leading-relaxed",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        aria-label="发送"
        className={cn(
          // u-hit:视觉仍是 36px 圆钮,可点范围补到 52px(手机上 36px 点不准)。
          // relative 是 u-hit 的前提——伪元素要定位在自己身上,不能挂到祖先上
          "u-hit relative inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-primary/85"
            : "bg-muted text-muted-foreground",
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
