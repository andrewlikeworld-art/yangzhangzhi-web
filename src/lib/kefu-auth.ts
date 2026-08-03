// cn-kefu 的 Bearer 鉴权头(只在服务端用,永不下发到浏览器)。
//
// 2026-08-04 key 收窄:此前三处 BFF(chat/reply/products)全用管理 key(KEFU_SHARED_KEY)
// ——那把 key 能导出全部顾客对话,不该躺在前台站的部署环境变量里;而且 kefu 侧限流
// 会把它计进 admin 维度,web 渠道 500 次/天的闸对真实流量形同虚设。
// 收窄为 web 专用 key(KEFU_WEB_KEY):权限只够商品/发消息/取回复,
// 碰 /api/admin/* 会 403 —— 那是 kefu 侧刻意收窄的,不是 bug。
//
// KEFU_SHARED_KEY 仅作过渡兜底:部署环境还没配上新变量时不至于直接 401 白屏。
// 部署侧换好 KEFU_WEB_KEY 并删掉旧变量后,这个兜底自然失效,届时可删。
export function kefuAuthHeader(): Record<string, string> {
  const key = process.env.KEFU_WEB_KEY ?? process.env.KEFU_SHARED_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}
