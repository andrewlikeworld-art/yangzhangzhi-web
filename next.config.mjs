/** @type {import('next').NextConfig} */
const nextConfig = {
  // 微信云托管是容器部署 → standalone 输出,Dockerfile 里只拷 .next/standalone 即可跑。
  output: "standalone",

  // 商品图来自云开发/COS,域名由 site.config 决定;这里用 <img> 直出不走 next/image
  // 优化管道(省掉 sharp 依赖和域名白名单维护),所以无 images 配置。

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
