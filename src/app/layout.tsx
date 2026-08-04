import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.brandName,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 顾客站是聊天形态,禁止双指缩放导致布局错位
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 移动端键盘弹起时 100dvh 不收缩 → 用 visualViewport 的真实高度。
            内联脚本先于首屏绘制执行,避免打开瞬间高度跳一下。 */}
        <script
          dangerouslySetInnerHTML={{
            // ⚠️ 高度为 0 时必须**不写**这个变量,让 CSS 回落到 100dvh。
            //    后台标签页 / 预渲染 / 标签恢复时 visualViewport.height 可能是 0,
            //    写进去会让整条 flex 布局塌成 0 高:内容区没了、输入框自增高算歪,
            //    而且要等一次 resize 才自愈(2026-08-04 目录式改版验收时实测撞到)。
            __html: `(function(){var v=window.visualViewport;if(!v)return;function s(){if(v.height>0)document.documentElement.style.setProperty('--app-height',v.height+'px')}s();v.addEventListener('resize',s)})()`,
          }}
        />
        <div className="h-app overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
