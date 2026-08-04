// 报头(Monocle 配方 · 2026-08-04 结构重做)。
//
// 杂志报头的做法:字标居中、发丝线收边、两侧放次要信息。
// `YANG ZHANG ZHI` 那个超宽字距全大写字标是品牌**已有**资产——它烧在每张商品图上,
// 站点用同一种处理,网页和商品图才像出自同一个品牌。
//
// 只给落地页用;咨询页是 app 形态,继续用紧凑的 AppHeader。
import { siteConfig } from "@/site.config";

export function Masthead({
  left,
  right,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="border-b bg-background">
      <div className="relative mx-auto flex max-w-[var(--measure-page)] items-center justify-center px-4 py-4 md:px-8 md:py-6">
        {/* 左槽:桌面才显示,手机让位给字标 */}
        <div className="absolute left-4 hidden items-center md:left-8 md:flex">{left}</div>

        <div className="text-center">
          <p className="u-wordmark text-[0.875rem] font-medium uppercase leading-none text-ink md:text-[1.0625rem]">
            {siteConfig.wordmark}
          </p>
          {/* 中文行:双语并置,是品牌详情页图文既有的习惯,不是我加的洋气 */}
          <p className="u-label mt-2 text-[0.625rem] leading-none text-muted-foreground md:text-[0.6875rem]">
            {siteConfig.brandName}
          </p>
        </div>

        {/* 操作区绝对定位,字标保持光学居中不被推偏 */}
        <div className="absolute right-4 flex items-center gap-3 md:right-8">{right}</div>
      </div>
    </header>
  );
}
