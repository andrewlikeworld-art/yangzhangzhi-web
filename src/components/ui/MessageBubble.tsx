"use client";

// 顾客站气泡:直接吃 KefuMsg,不再经 roundtable 的 Supabase Message 形状转换。
// 三种形态:user 右对齐 / assistant 左对齐带客服名 / system 居中细字(转人工提示)。
// 刻意不显示模型名、token 数、费用——那些是后台运营信息,顾客不该看到。
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { KefuMsg } from "@/stores/kefuStore";

export function MessageBubble({ msg, personaName }: { msg: KefuMsg; personaName: string }) {
  if (msg.role === "system") {
    return (
      <div className="px-4 py-2 text-center">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {msg.content}
        </span>
      </div>
    );
  }

  const isUser = msg.role === "user";

  return (
    <div className={cn("flex px-4 py-2", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("min-w-0 max-w-[85%] md:max-w-[75%]")}>
        {!isUser && (
          <p className="mb-1 text-[11px] tracking-wide text-muted-foreground">{personaName}</p>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-[var(--bubble-user)] text-[var(--bubble-user-fg)]"
              : "border bg-card text-card-foreground",
            msg.error && "border-destructive/40 text-destructive",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <>
              <div className="prose-chat break-words">
                <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
              </div>
              {/* 工具轮状态提示:content 还没出字时显示(如「正在核对尺码表」),
                  出字或到终态由 KefuChat 的更新收口清掉 —— 填的是工具轮那段空白 */}
              {msg.streaming && !msg.content && msg.toolRunningLabel && (
                <span className="animate-pulse text-xs text-muted-foreground">
                  {msg.toolRunningLabel}…
                </span>
              )}
              {/* 还在出字:末尾跟一个呼吸光标,空内容时也有反馈 */}
              {msg.streaming && (
                <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
