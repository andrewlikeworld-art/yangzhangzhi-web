// 客服面板头部(2026-08-04,按参考图聊天挂件的头部复刻):
// 黑圆头像 + 名称 + 灰色状态行,右侧操作钮。
import { siteConfig } from "@/site.config";

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-hairline bg-white px-4">
      {/* 头像:黑圆 + 字标首字母,和站内黑圆语言一致 */}
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-[0.9375rem] text-white">
        {siteConfig.shopName.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8125rem] font-semibold leading-tight text-ink">
          {siteConfig.shopName} · AI 顾问
        </p>
        {/* 状态行只写真话:AI 即时回复,支持转人工 */}
        <p className="truncate text-[0.625rem] leading-tight text-muted-foreground">
          即时回复 · 答不了转真人
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </header>
  );
}
