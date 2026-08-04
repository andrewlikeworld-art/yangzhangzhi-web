// 咨询页顶栏(Monocle 配方 · 2026-08-04 改皮)。
//
// 落地页用居中报头(Masthead);这里是 app 形态,需要紧凑单行 + 两侧操作位,
// 所以是另一个组件。但视觉语言要一致:同样的字标处理、发丝线、零圆角。
import { siteConfig } from "@/site.config";

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-4 md:px-6">
      <div className="min-w-0 flex-1">
        {/* 字标用与商品图水印同源的处理,只是尺寸收小 */}
        <p className="u-wordmark truncate text-[0.75rem] font-medium uppercase leading-none text-ink">
          {siteConfig.wordmark}
        </p>
        <p className="u-label mt-1.5 truncate text-[0.5625rem] leading-none text-muted-foreground">
          {siteConfig.shopName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </header>
  );
}
