"use client";

// 首页区块组件集(2026-08-04,按参考图复刻结构)。
//
// 参考图是完整电商首页(9 个区块)。本站只有商品数据 + AI 咨询两项能力,
// 所以凡是需要"活动/合集/物流承诺"的区块,一律换成**本站真实存在的能力**,
// 而不是编内容填格子。逐条替换理由写在各组件头部。
//
// 放在一个文件里是有意的:这些区块只服务首页、互相之间共享排版常量,
// 拆成 9 个文件会让"改一处版式要开九个文件"。
import { Heart, ShoppingBag, MessageCircle, Ruler, Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImage } from "@/lib/image";
import { siteConfig } from "@/site.config";
import { SCENARIOS, categoryOf, type Category } from "@/lib/catalog";
import type { Product } from "@/lib/types";

const PAGE = "mx-auto w-full max-w-[var(--measure-page)] px-4 md:px-8";

/* ══════════ 1 · 公告条 ══════════
   参考图这里是「满 $75 包邮 | 轻松退货」。
   🔴 不能照抄:kefu 知识库明文写着「发货时效按店铺规则答,别承诺具体日期」
   「退换以店铺售后规则为准」——服务端自己都不敢承诺的事,官网更不能印上去。
   换成本站真实成立的一句。 */
export function AnnouncementBar({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="bg-ink text-[var(--paper)]">
      <div className={cn(PAGE, "flex items-center justify-center gap-4 py-2 text-[0.6875rem]")}>
        <span className="u-label uppercase">店主实穿实拍 · AI 尺码顾问在线</span>
        <button
          type="button"
          onClick={onOpenChat}
          className="hidden shrink-0 border-b border-[var(--paper)]/60 pb-px hover:border-[var(--paper)] sm:inline"
        >
          问尺码
        </button>
      </div>
    </div>
  );
}

/* ══════════ 2 · 主导航 ══════════
   参考图右侧有搜索/账号/心愿单/购物车四个图标。
   🔴 本站没有搜索、没有账号、没有购物车——画上去就是四个死链。
   只保留真实存在的两个:已选计数(心选)+ AI 咨询。 */
export function SiteNav({
  categories,
  active,
  onSelect,
  selectedCount,
  onOpenChat,
}: {
  categories: Array<Category & { count: number }>;
  active: string | null;
  onSelect: (id: string | null) => void;
  selectedCount: number;
  onOpenChat: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/95 backdrop-blur">
      <div className={cn(PAGE, "flex h-16 items-center gap-6")}>
        <button type="button" onClick={() => onSelect(null)} className="shrink-0 text-left">
          <p className="u-wordmark text-[0.8125rem] font-medium uppercase leading-none text-ink">
            {siteConfig.wordmark}
          </p>
          <p className="u-label mt-1 text-[0.5625rem] leading-none text-muted-foreground">
            {siteConfig.shopName}
          </p>
        </button>

        {/* 中间分类:横向可滚,手机上不换行不挤压 */}
        <nav className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center gap-5 whitespace-nowrap md:justify-center md:gap-7">
            <li>
              <CatLink label="全部" active={active === null} onClick={() => onSelect(null)} />
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <CatLink
                  label={c.label}
                  active={active === c.id}
                  onClick={() => onSelect(c.id)}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          {selectedCount > 0 && (
            <span className="u-numeral hidden text-[0.6875rem] sm:inline">
              已选 {selectedCount}
            </span>
          )}
          <button
            type="button"
            onClick={onOpenChat}
            aria-label="打开 AI 客服"
            className="u-hit relative inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-[0.6875rem] text-ink hover:border-[var(--editorial-red)] hover:text-[var(--editorial-red)]"
          >
            <MessageCircle className="size-3.5" />
            <span className="hidden sm:inline">AI 咨询</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function CatLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "u-label border-b pb-0.5 text-[0.6875rem] uppercase transition-colors",
        active
          ? "border-ink text-ink"
          : "border-transparent text-muted-foreground hover:text-ink",
      )}
      style={{ transitionDuration: "var(--dur-fast)" }}
    >
      {label}
    </button>
  );
}

/* ══════════ 3 · Hero 分栏 ══════════
   参考图:左文右图,两个 CTA(实心 + 描边)。完整复刻。 */
export function Hero({
  product,
  onOpenDetail,
  onOpenChat,
}: {
  product: Product | null;
  onOpenDetail: (id: string) => void;
  onOpenChat: () => void;
}) {
  const cover = product?.image_url ? sizedImage(product.image_url, 1400) : null;
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto grid max-w-[var(--measure-page)] grid-cols-1 items-stretch md:h-[clamp(30rem,64vh,40rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col justify-center px-4 py-12 md:px-8 md:py-14">
          <p className="u-kicker">New Season · 本季上新</p>
          <h1 className="u-headline mt-4 text-[2.5rem] md:text-[3.5rem] lg:text-[4rem]">
            穿在街上的
            <br />
            衣服
          </h1>
          <p className="u-dek mt-4 max-w-[32ch] text-[1rem] md:text-[1.125rem]">
            不是影棚里的样子,是它真正被穿出门时的样子。每一件都由店主亲自试过、拍过。
          </p>
          {/* 参考图的双 CTA:实心 + 描边 */}
          <div className="mt-8 flex flex-wrap gap-3">
            {product && (
              <button
                type="button"
                onClick={() => onOpenDetail(product.id)}
                className="bg-ink px-6 py-3 text-[0.75rem] uppercase tracking-[0.12em] text-[var(--paper)] transition-colors hover:bg-[var(--editorial-red)]"
                style={{ transitionDuration: "var(--dur-fast)" }}
              >
                看这一件
              </button>
            )}
            <button
              type="button"
              onClick={onOpenChat}
              className="border border-ink px-6 py-3 text-[0.75rem] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-[var(--paper)]"
              style={{ transitionDuration: "var(--dur-fast)" }}
            >
              问 AI 顾问
            </button>
          </div>
        </div>

        {/* 手机高度必须 >120vw:封面是竖图两侧补虚化边凑成的方图,
            容器接近正方就不裁边,两条模糊竖条会露出来 */}
        <div className="relative h-[120vw] bg-muted md:h-full">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product?.title ?? ""}
              className="absolute inset-0 size-full object-cover object-[center_32%]"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════ 4 · 信任条 ══════════
   参考图:包邮 / 30天退货 / 安全支付 / 门店查询。
   🔴 四条我一条都不能照抄——本站不经手支付、没有门店,而物流退换的具体承诺
   kefu 自己都被禁止说死。换成**四条能当场验证**的事实。 */
const TRUST = [
  { icon: Camera, title: "实穿实拍", desc: "商品图都是店主本人穿出门拍的" },
  { icon: Ruler, title: "尺码表可查", desc: "每件都有平铺尺寸,点开就能看" },
  { icon: Sparkles, title: "AI 尺码顾问", desc: "报身高体重,按商家尺码表给建议" },
  { icon: MessageCircle, title: "真人兜底", desc: "AI 答不了的转主理人微信" },
];

export function TrustBar() {
  return (
    <section className="border-b border-hairline">
      <div className={cn(PAGE, "grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4 md:py-10")}>
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-start gap-3">
            <t.icon className="mt-0.5 size-4 shrink-0 text-[var(--editorial-red)]" />
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-medium text-ink">{t.title}</p>
              <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">
                {t.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════ 5 · 分类圆环 ══════════
   参考图:一排圆形分类缩略图。分类从商品标题派生(见 lib/catalog.ts),
   缩略图用该分类下第一件商品的封面——不用图标,让真实衣服当入口。 */
export function CategoryCircles({
  categories,
  products,
  active,
  onSelect,
}: {
  categories: Array<Category & { count: number }>;
  products: Product[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <section className={cn(PAGE, "py-10 md:py-14")}>
      <SectionHead kicker="Shop by category" title="按类目看" />
      <div className="mt-6 flex gap-5 overflow-x-auto pb-2 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          // ⚠️ 必须用 categoryOf 而不是 keywords.some:后者不认优先级,
          // 「吊带连衣裙」会同时命中 连衣裙/半身裙(裙)/上衣(吊带),
          // 结果三个圆环取到同一张图(2026-08-04 实测)
          const sample = products.find((p) => p.image_url && categoryOf(p) === c.id);
          const on = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(on ? null : c.id)}
              className="w-20 shrink-0 text-center md:w-24"
            >
              <div
                className={cn(
                  "aspect-square w-full overflow-hidden rounded-full border-2 bg-muted transition-colors",
                  // 未选中时也要有发丝线:街拍图上部常是浅色背景(白窗帘/浅墙),
                  // 裁成小圆后一片米白,压在奶油底上会像"没加载出来"(2026-08-04 实测)
                  on ? "border-[var(--editorial-red)]" : "border-hairline",
                )}
                style={{ transitionDuration: "var(--dur-fast)" }}
              >
                {sample?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sizedImage(sample.image_url, 240)}
                    alt=""
                    // 焦点取 44%:全身街拍的衣服在画面中部,取太靠上只会裁到背景
                    className="size-full object-cover object-[center_44%]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ShoppingBag className="size-5 opacity-50" />
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "mt-2.5 text-[0.75rem]",
                  on ? "text-[var(--editorial-red)]" : "text-foreground/85",
                )}
              >
                {c.label}
              </p>
              <p className="u-numeral text-[0.625rem] text-muted-foreground">{c.count}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** 参考图的区块头:左侧标题 + 副题,右侧「View all」。统一成一个组件避免各写各的 */
export function SectionHead({
  kicker,
  title,
  sub,
  right,
}: {
  kicker: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-hairline pb-4">
      <div className="min-w-0">
        <p className="u-kicker">{kicker}</p>
        <h2 className="u-headline mt-2 text-[1.5rem] md:text-[2rem]">{title}</h2>
        {sub && <p className="u-dek mt-1.5 text-[0.875rem]">{sub}</p>}
      </div>
      {right && <div className="shrink-0 pb-1">{right}</div>}
    </div>
  );
}

/* ══════════ 6 · 商品网格 ══════════
   参考图:6 列,心形收藏在图右上,名称 + 价格 + 色板圆点。
   色板圆点本站没有颜色数据(WebProduct 无 colors 字段),不做——
   画几个假圆点等于告诉顾客"有这些颜色可选",是会导致退货纠纷的假信息。 */
export function ProductGrid({
  products,
  selectedIds,
  onToggle,
  onOpenDetail,
}: {
  products: Product[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">这个类目下暂时没有商品</p>
    );
  }
  return (
    <div className="mt-8 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 sm:grid-cols-[repeat(3,minmax(0,1fr))] md:gap-x-6 lg:grid-cols-[repeat(4,minmax(0,1fr))] xl:grid-cols-[repeat(6,minmax(0,1fr))]">
      {products.map((p, i) => {
        const on = selectedIds.includes(p.id);
        return (
          <article key={p.id} className="min-w-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => onOpenDetail(p.id)}
                className="block w-full overflow-hidden bg-muted"
                aria-label={`查看「${p.title}」详情`}
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sizedImage(p.image_url, 600)}
                    alt={p.title}
                    className="aspect-[3/4] w-full object-cover transition-opacity hover:opacity-[0.88]"
                    style={{ transitionDuration: "var(--dur-base)" }}
                    loading={i < 6 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center text-muted-foreground">
                    <ShoppingBag className="size-6 opacity-60" />
                  </div>
                )}
              </button>
              {/* 参考图心形在**右上**(我上一版在左上),照参考图改 */}
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                aria-label={on ? `取消选中「${p.title}」` : `选中「${p.title}」`}
                aria-pressed={on}
                className="u-hit absolute right-2 top-2 z-10 inline-flex size-7 items-center justify-center rounded-full bg-[var(--paper)]/85 backdrop-blur-sm"
              >
                <Heart
                  className={cn(
                    "size-3.5",
                    on
                      ? "fill-[var(--editorial-red)] text-[var(--editorial-red)]"
                      : "text-ink",
                  )}
                />
              </button>
            </div>
            <div className="mt-3">
              <p className="line-clamp-2 text-[0.8125rem] leading-snug text-foreground/85">
                {p.title}
              </p>
              {p.price && (
                <p className="u-numeral mt-1.5 text-[0.8125rem] leading-none">{p.price}</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ══════════ 7+8 · 场景入口(替换促销横幅 + 合集卡)══════════
   参考图这两块是「学生 9 折 / 新季新装 / 到店体验」+ 四张合集卡。
   🔴 本站没有活动数据、没有合集数据、没有门店。编出来的折扣是**假承诺**。
   换成场景入口:点一下带着问题直接进 AI 咨询——这是本站真实存在的能力
   (kefu 的场景推荐工具本来就吃这类问法)。 */
export function ScenarioCards({
  products,
  onAsk,
}: {
  products: Product[];
  onAsk: (prompt: string) => void;
}) {
  return (
    <section className={cn(PAGE, "py-10 md:py-14")}>
      <SectionHead
        kicker="Ask the stylist"
        title="不知道穿什么?"
        sub="点一下,直接问店里的 AI 顾问"
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {SCENARIOS.map((s, i) => {
          const bg = products[(i + 1) % Math.max(products.length, 1)];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onAsk(s.prompt)}
              className="group relative h-52 overflow-hidden bg-muted text-left md:h-64"
            >
              {bg?.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sizedImage(bg.image_url, 800)}
                  alt=""
                  className="absolute inset-0 size-full object-cover object-[center_28%] transition-opacity group-hover:opacity-90"
                  style={{ transitionDuration: "var(--dur-base)" }}
                  loading="lazy"
                  decoding="async"
                />
              )}
              {/* 压一层墨色渐变保证白字可读——不是装饰,是对比度。
                  浅色照片(米白衣服 + 白窗帘)上 80% 不够,实测要压到 92% 才稳过 4.5:1 */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/5" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[1.125rem] font-medium text-[var(--paper)]">{s.label}</p>
                <p className="mt-1 text-[0.75rem] text-[var(--paper)]/80">{s.hint}</p>
                <span className="mt-3 inline-block border-b border-[var(--paper)] pb-px text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--paper)]">
                  去问 →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════ 9 · 页脚 ══════════
   参考图底部是「可持续материals / 道德生产 / 社区」三条价值主张。
   🔴 这三条都是**无法核实的品牌声明**,替商家写等于替他背书。
   换成品牌真实信息 + 法定备案位。 */
export function HomeFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className={cn(PAGE, "py-10 md:py-14")}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="u-wordmark text-[0.875rem] font-medium uppercase leading-none text-ink">
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
