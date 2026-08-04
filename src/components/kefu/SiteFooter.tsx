// 页脚(Monocle 配方 · 2026-08-04)。
//
// 两页站没有站点地图可放,四列索引式页脚是虚张声势。用杂志刊记(colophon)的做法:
// 字标 + 一句话 + 法定信息,发丝线收边。
//
// ICP 备案号是境内站上线的法定展示项,备案下来填 site.config 即自动出现;
// 留空时整段不渲染,避免线上出现「待填」。
import { siteConfig } from "@/site.config";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[var(--measure-page)] px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="u-wordmark text-[0.8125rem] font-medium uppercase leading-none text-ink md:text-[0.9375rem]">
              {siteConfig.wordmark}
            </p>
            <p className="u-dek mt-3 max-w-[38ch] text-[0.9375rem]">{siteConfig.description}</p>
          </div>

          <div className="flex flex-col gap-1.5 text-[0.6875rem] text-muted-foreground md:items-end">
            <span>{siteConfig.brandName}</span>
            {siteConfig.icpNumber && (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                {siteConfig.icpNumber}
              </a>
            )}
            <span className="u-numeral">{siteConfig.domain}</span>
          </div>
        </div>

        <p className="mt-8 border-t border-hairline pt-5 text-[0.625rem] leading-relaxed text-muted-foreground md:mt-12">
          {siteConfig.disclaimer}
        </p>
      </div>
    </footer>
  );
}
