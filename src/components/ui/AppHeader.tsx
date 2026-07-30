// 站点顶栏:左侧店名(取自 site.config),右侧由页面塞操作区。
// 相对 roundtable 版去掉了返回上级的 next/link 导航 —— 顾客站是单页两视图,不需要。
import { siteConfig } from "@/site.config";

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-widest">{siteConfig.shopName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </header>
  );
}
