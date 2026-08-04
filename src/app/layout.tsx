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
  // 2026-08-04:恢复双指缩放。原先 maximumScale:1 + userScalable:false 是
  // 小程序 webview 时代留下的,搬到公开网页上是无障碍缺陷(WCAG 1.4.4)——
  // 视力不好的顾客放不大页面。布局错位应该靠响应式解决,不是靠禁用缩放。
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
        {/* 2026-08-04 结构重做:这里原本是 <div class="h-app overflow-hidden">,
            它把**整站**锁成不可滚动的固定高度壳——正是「手机 UI 投射到网页」的病根:
            落地页再长也滚不动,只能靠内部容器滚。
            现在壳由各视图自己决定:落地页走正常文档流,咨询页自己套 h-app。 */}
        {children}
      </body>
    </html>
  );
}
