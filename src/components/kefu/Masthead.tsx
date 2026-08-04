// 报头式站头(Hallmark N6 · 2026-08-04 目录式改版)。
//
// 为什么是报头而不是普通左对齐顶栏:`YANG ZHANG ZHI` 那个超宽字距的全大写字标
// 是品牌**已有**的资产——它烧在每一张商品图上。把它做成页面锚点,站点和商品图
// 说的是同一种话;左上角塞个小店名则等于把这个资产浪费掉。
//
// 只给推荐页用。聊天页继续用 AppHeader(那里需要紧凑顶栏 + 双侧操作位)。
import { siteConfig } from "@/site.config";

export function Masthead({ right }: { right?: React.ReactNode }) {
  return (
    <header className="shrink-0 border-b bg-background">
      <div className="relative mx-auto flex max-w-[var(--measure-page)] items-center justify-center px-3 py-3.5 md:px-8 md:py-5">
        <div className="text-center">
          {/* 拉丁字标:与商品图水印同一种处理(全大写 + 超宽字距) */}
          <p className="u-wordmark text-[0.8125rem] font-medium uppercase leading-none md:text-[0.9375rem]">
            {siteConfig.wordmark}
          </p>
          {/* 中文行:双语并置,呼应详情页图文既有的「商品信息 / Commodity Information」习惯 */}
          <p className="u-label mt-1.5 text-[0.625rem] leading-none text-muted-foreground md:text-[0.6875rem]">
            {siteConfig.brandName}
          </p>
        </div>

        {/* 操作区绝对定位:字标保持光学居中,不被右侧按钮推偏 */}
        <div className="absolute right-3 flex items-center gap-2 md:right-8">{right}</div>
      </div>
    </header>
  );
}
