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
            __html: `(function(){var v=window.visualViewport;if(!v)return;function s(){document.documentElement.style.setProperty('--app-height',v.height+'px')}s();v.addEventListener('resize',s)})()`,
          }}
        />
        <div className="h-app overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
