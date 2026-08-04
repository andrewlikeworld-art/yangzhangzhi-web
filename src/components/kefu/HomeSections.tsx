"use client";

// 首页区块集(2026-08-04,按参考图「C-STYLE」逐区块复刻版式)。
//
// 复刻口径(用户定的):版式/结构/卡片样式/间距对齐参考图;文字与功能用本站
// 真实内容——参考图里需要「活动/物流承诺/购物车」的格子,换成本站真实能力,
// 不编假信息。逐条替换理由写在各组件头部。
//
// 参考图的版式要点:白底 · 内容区约 1280 · 圆角卡(图垫 12px,横幅 16px)·
// 按钮全胶囊 · 信任条是**压在 Hero 底边上的悬浮白卡** · 分类是圆形头像 ·
// 区块头「标题+灰副题」左、「查看全部+圆形箭头」右。
import { useRef } from "react";
import {
  Heart,
  Search,
  ShoppingBag,
  MessageCircle,
  Ruler,
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sizedImage } from "@/lib/image";
import { siteConfig } from "@/site.config";
import { SCENARIOS, categoryOf, type Category } from "@/lib/catalog";
import type { Product } from "@/lib/types";

const PAGE = "mx-auto w-full max-w-[var(--measure-page)] px-4 md:px-6";

/* ══════════ 1 · 公告条 ══════════
   参考图:「FREE SHIPPING OVER $75 | EASY RETURNS」居中,右侧 Store Locator·Help。
   🔴 物流/退货承诺不能写(kefu 知识库明令「别承诺具体日期」「以店铺售后规则为准」),
   换成真实成立的一句;右侧换成真功能入口。 */
export function AnnouncementBar({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="bg-ink text-white">
      <div className={cn(PAGE, "relative flex items-center justify-center py-2")}>
        <p className="text-[0.6875rem] tracking-[0.08em]">
          店主实穿实拍 · AI 尺码顾问在线
        </p>
        <div className="absolute right-4 hidden items-center gap-4 text-[0.6875rem] text-white/70 md:right-6 md:flex">
          <button type="button" onClick={onOpenChat} className="hover:text-white">
            问尺码
          </button>
          <button type="button" onClick={onOpenChat} className="hover:text-white">
            转人工
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════ 2 · 主导航 ══════════
   参考图:logo 左 · 分类链接中 · 右侧「搜索胶囊 + 账号 + 心愿单 + 购物车(角标)」。
   🔴 账号/购物车本站没有,画上去是死链;搜索和心愿单**做成真的**:
   搜索=按商品名过滤;心形=「只看已选」开关,角标是已选件数(对应参考图购物车角标位)。 */
export function SiteNav({
  categories,
  active,
  onSelect,
  query,
  onQuery,
  selectedCount,
  selectedOnly,
  onToggleSelectedOnly,
  onOpenChat,
}: {
  categories: Array<Category & { count: number }>;
  active: string | null;
  onSelect: (id: string | null) => void;
  query: string;
  onQuery: (q: string) => void;
  selectedCount: number;
  selectedOnly: boolean;
  onToggleSelectedOnly: () => void;
  onOpenChat: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur">
      <div className={cn(PAGE, "flex h-16 items-center gap-5")}>
        {/* 字标:与商品图水印同源的处理 */}
        <button type="button" onClick={() => onSelect(null)} className="shrink-0 text-left">
          <p className="u-wordmark text-[0.8125rem] font-semibold uppercase leading-none text-ink">
            {siteConfig.wordmark}
          </p>
          <p className="u-label mt-1 text-[0.5625rem] leading-none text-muted-foreground">
            {siteConfig.shopName}
          </p>
        </button>

        {/* 中列分类:桌面显示;手机挪到下面第二行 */}
        <nav className="hidden min-w-0 flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-7 whitespace-nowrap">
            <li>
              <CatLink label="全部" active={active === null} onClick={() => onSelect(null)} />
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <CatLink label={c.label} active={active === c.id} onClick={() => onSelect(c.id)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* 搜索胶囊(真的:按商品名过滤下方货架) */}
          <label className="hidden h-9 w-52 items-center gap-2 rounded-full bg-surface px-3.5 md:flex">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="搜商品名…"
              className="min-w-0 flex-1 bg-transparent text-[0.8125rem] outline-none placeholder:text-muted-foreground"
            />
          </label>

          {/* 心形+角标:参考图购物车角标的位置,装的是真实的「已选」 */}
          <button
            type="button"
            onClick={onToggleSelectedOnly}
            aria-pressed={selectedOnly}
            aria-label={selectedOnly ? "显示全部商品" : "只看已选商品"}
            className="u-hit relative inline-flex size-9 items-center justify-center rounded-full hover:bg-surface"
          >
            <Heart
              className={cn(
                "size-[1.125rem]",
                selectedOnly ? "fill-[var(--editorial-red)] text-[var(--editorial-red)]" : "text-ink",
              )}
            />
            {selectedCount > 0 && (
              <span className="u-numeral absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-ink text-[0.5625rem] leading-none text-white">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            aria-label="打开 AI 客服"
            className="u-hit relative inline-flex size-9 items-center justify-center rounded-full hover:bg-surface"
          >
            <MessageCircle className="size-[1.125rem] text-ink" />
          </button>
        </div>
      </div>

      {/* 手机第二行:分类横滑 */}
      <nav className="border-t border-hairline lg:hidden">
        <ul className="flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li>
            <CatLink label="全部" active={active === null} onClick={() => onSelect(null)} />
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <CatLink label={c.label} active={active === c.id} onClick={() => onSelect(c.id)} />
            </li>
          ))}
        </ul>
      </nav>
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
        "text-[0.8125rem] transition-colors",
        active
          ? "font-semibold text-ink underline decoration-2 underline-offset-8"
          : "text-foreground/70 hover:text-ink",
      )}
      style={{ transitionDuration: "var(--dur-fast)" }}
    >
      {label}
    </button>
  );
}

/* ══════════ 3 · Hero ══════════
   参考图:米灰底整幅,左侧衬线大标题(第一行常规、第二行加粗)+ 短段落 +
   双胶囊按钮(实心黑 + 描边),模特照片占右半贴边。 */
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
    <section className="bg-[var(--hero-ground)]">
      <div className="mx-auto grid max-w-[var(--measure-page)] grid-cols-1 md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-4 pb-16 pt-10 md:px-6 md:py-16">
          <h1
            className="font-serif text-ink"
            style={{ letterSpacing: "var(--track-display)" }}
          >
            <span className="block text-[2.25rem] font-normal leading-[1.15] md:text-[3rem]">
              穿在街上的
            </span>
            <span className="block text-[2.75rem] font-bold leading-[1.1] md:text-[3.625rem]">
              衣服
            </span>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[0.875rem] leading-relaxed text-ink/75 md:text-[0.9375rem]">
            不是影棚里的样子,是它被穿出门时的样子。每一件都由店主亲自试过、拍过。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {product && (
              <button
                type="button"
                onClick={() => onOpenDetail(product.id)}
                className="rounded-full bg-ink px-6 py-3 text-[0.8125rem] font-medium text-white transition-colors hover:bg-ink/85"
                style={{ transitionDuration: "var(--dur-fast)" }}
              >
                看这一件
              </button>
            )}
            <button
              type="button"
              onClick={onOpenChat}
              className="rounded-full border border-ink px-6 py-3 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-ink hover:text-white"
              style={{ transitionDuration: "var(--dur-fast)" }}
            >
              问 AI 顾问
            </button>
          </div>
        </div>

        {/* 手机高度必须 >120vw:封面是补虚化边的方图,容器近正方会露边条(实测) */}
        <div className="relative h-[120vw] md:h-auto md:min-h-[30rem]">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product?.title ?? ""}
              className="absolute inset-0 size-full object-cover object-[center_30%]"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════ 4 · 信任条(悬浮白卡)══════════
   参考图的招牌细节:白色圆角卡**压在 Hero 底边上**(负上边距 + 阴影),
   四格用细分隔线隔开,每格「图标 + 粗标题 + 灰小字」。
   🔴 内容换成四条能当场验证的事实(不写包邮/退货/支付/门店,理由同公告条)。 */
const TRUST = [
  { icon: Camera, title: "实穿实拍", desc: "商品图都是店主本人穿出门拍的" },
  { icon: Ruler, title: "尺码表可查", desc: "每件都有平铺尺寸,点开就能看" },
  { icon: Sparkles, title: "AI 尺码顾问", desc: "报身高体重,按尺码表给建议" },
  { icon: MessageCircle, title: "真人兜底", desc: "AI 答不了的转主理人微信" },
];

export function TrustBar() {
  return (
    <div className={cn(PAGE, "relative z-10 -mt-9")}>
      <div className="grid grid-cols-2 gap-y-5 rounded-2xl bg-white py-5 shadow-[0_12px_32px_rgba(20,20,20,0.10)] md:grid-cols-4 md:divide-x md:divide-hairline md:py-6">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-start gap-3 px-5 md:px-6">
            <t.icon className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-ink">{t.title}</p>
              <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                {t.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 区块头(参考图式):左「粗标题 + 灰副题」,右「查看全部 + 圆形箭头钮」 */
export function SectionHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[1.125rem] font-bold tracking-[0.01em] text-ink md:text-[1.25rem]">
          {title}
        </h2>
        {sub && <p className="mt-1 text-[0.75rem] text-muted-foreground">{sub}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2 pb-0.5">{right}</div>}
    </div>
  );
}

/** 参考图的圆形箭头钮 */
export function CircleArrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "向左看" : "向右看"}
      className="inline-flex size-8 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:bg-surface disabled:opacity-40"
      style={{ transitionDuration: "var(--dur-fast)" }}
    >
      <Icon className="size-4" />
    </button>
  );
}

/* ══════════ 5 · 分类圆环 ══════════
   参考图:一排圆形分类头像,最后一个是黑底白字的「SALE」圆。
   🔴 本站没有促销,黑圆换成「AI 顾问」入口——同一个视觉记号,装真功能。 */
export function CategoryCircles({
  categories,
  products,
  active,
  onSelect,
  onOpenChat,
}: {
  categories: Array<Category & { count: number }>;
  products: Product[];
  active: string | null;
  onSelect: (id: string | null) => void;
  onOpenChat: () => void;
}) {
  if (categories.length === 0) return null;
  return (
    <section className={cn(PAGE, "pb-2 pt-10 md:pt-14")}>
      <SectionHead
        title="按类目看"
        right={
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex items-center gap-1.5 text-[0.75rem] text-ink hover:text-foreground/70"
          >
            查看全部
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-hairline">
              <ArrowRight className="size-3.5" />
            </span>
          </button>
        }
      />
      {/* 参考图排版:圆环**均匀铺满整行**(两端对齐,剩余空间平摊),不是固定间距靠左。
          手机上放不下时退回横滑。 */}
      <div className="mt-6 flex gap-6 overflow-x-auto pb-2 md:justify-between md:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          // ⚠️ 用 categoryOf 而不是 keywords.some:后者不认优先级,会取错样图(实测)
          const sample = products.find((p) => p.image_url && categoryOf(p) === c.id);
          const on = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(on ? null : c.id)}
              className="w-20 shrink-0 text-center md:w-28"
            >
              <div
                className={cn(
                  "aspect-square w-full overflow-hidden rounded-full bg-surface transition-shadow",
                  on && "ring-2 ring-ink ring-offset-2",
                )}
              >
                {sample?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sizedImage(sample.image_url, 240)}
                    alt=""
                    // 焦点 44%:全身街拍衣服在中部,太靠上会裁到浅色背景像没加载(实测)
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
              <p className={cn("mt-2 text-[0.75rem]", on ? "font-semibold text-ink" : "text-foreground/80")}>
                {c.label}
              </p>
            </button>
          );
        })}

        {/* 黑圆:参考图 SALE 位,装 AI 顾问 */}
        <button type="button" onClick={onOpenChat} className="w-20 shrink-0 text-center md:w-28">
          <div className="flex aspect-square w-full items-center justify-center rounded-full bg-ink">
            <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white">
              AI 顾问
            </span>
          </div>
          <p className="mt-2 text-[0.75rem] text-foreground/80">问穿搭</p>
        </button>
      </div>
    </section>
  );
}

/* ══════════ 6 · 货架(参考图 NEW ARRIVALS)══════════
   参考图:单行 6 张卡 + 右上「View all + 前后圆箭头」;卡=浅灰圆角图垫 +
   右上白圆心形 + 名称一行 + 粗价格 + 色点行。
   🔴 色点:商品数据无颜色字段,画假色点=告诉顾客有这些颜色可选,会招退货纠纷。
   同一行位改放**面料**(真实字段,同等视觉重量)。
   「View all」做成真的:展开为多行网格。 */
export function ProductShelf({
  products,
  selectedIds,
  onToggle,
  onOpenDetail,
  viewAll,
  onToggleViewAll,
}: {
  products: Product[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
  viewAll: boolean;
  onToggleViewAll: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const slide = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="shelf" className={cn(PAGE, "py-10 md:py-14")}>
      <SectionHead
        title="店主推荐"
        sub="每一件都由店主亲自试过、拍过"
        right={
          <>
            <button
              type="button"
              onClick={onToggleViewAll}
              className="mr-1 text-[0.75rem] text-ink underline-offset-4 hover:underline"
            >
              {viewAll ? "收起" : "查看全部"}
            </button>
            {!viewAll && (
              <>
                <CircleArrow dir="left" onClick={() => slide(-1)} />
                <CircleArrow dir="right" onClick={() => slide(1)} />
              </>
            )}
          </>
        }
      />

      {products.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">
          没有匹配的商品,换个词或清掉筛选试试
        </p>
      ) : viewAll ? (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((p, i) => (
            <ShelfCard
              key={p.id}
              p={p}
              eager={i < 6}
              selected={selectedIds.includes(p.id)}
              onToggle={onToggle}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div
          ref={railRef}
          className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              className="w-[46%] shrink-0 snap-start sm:w-[30.5%] md:w-[23%] xl:w-[calc((100%-5rem)/6)]"
            >
              <ShelfCard
                p={p}
                eager={i < 6}
                selected={selectedIds.includes(p.id)}
                onToggle={onToggle}
                onOpenDetail={onOpenDetail}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ShelfCard({
  p,
  eager,
  selected,
  onToggle,
  onOpenDetail,
}: {
  p: Product;
  eager: boolean;
  selected: boolean;
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  return (
    <article className="min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenDetail(p.id)}
          className="block w-full overflow-hidden rounded-xl bg-surface"
          aria-label={`查看「${p.title}」详情`}
        >
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sizedImage(p.image_url, 600)}
              alt={p.title}
              className="aspect-[3/4] w-full object-cover transition-opacity hover:opacity-[0.9]"
              style={{ transitionDuration: "var(--dur-base)" }}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-6 opacity-60" />
            </div>
          )}
        </button>
        {/* 参考图:白圆心形在右上,带一点阴影 */}
        <button
          type="button"
          onClick={() => onToggle(p.id)}
          aria-label={selected ? `取消选中「${p.title}」` : `选中「${p.title}」`}
          aria-pressed={selected}
          className="u-hit absolute right-2.5 top-2.5 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(20,20,20,0.12)]"
        >
          <Heart
            className={cn(
              "size-4",
              selected ? "fill-[var(--editorial-red)] text-[var(--editorial-red)]" : "text-ink",
            )}
          />
        </button>
      </div>
      <div className="mt-2.5">
        <p className="truncate text-[0.8125rem] text-foreground/85" title={p.title}>
          {p.title}
        </p>
        <p className="u-numeral mt-1 text-[0.875rem] font-semibold leading-none text-ink">
          {p.price ?? ""}
        </p>
        {/* 参考图此处是色点行。颜色名不猜色值(「孔雀蓝」映不准),用文字呈现;
            shop 通道已按其口径滤掉隐藏 SKU 的颜色。没颜色数据才退回面料行 */}
        {p.colors && p.colors.length > 0 ? (
          <p className="mt-1 truncate text-[0.6875rem] text-muted-foreground">
            {p.colors.join(" / ")}
          </p>
        ) : (
          p.fabric && (
            <p className="mt-1 truncate text-[0.6875rem] text-muted-foreground">{p.fabric}</p>
          )
        )}
      </div>
    </article>
  );
}

/* ══════════ 7 · 三联横幅(参考图促销位)══════════
   参考图:黑卡(学生 9 折)+ 米卡(新季新装)+ 图卡(到店体验),
   三种处理:深底文字卡 / 浅底文字卡 / 整图叠字卡。
   🔴 没有活动、没有门店——三张卡装三个**场景提问**,点了真的带问题开客服。
   版式(圆角/内边距/按钮形)照参考图。 */
export function PromoTrio({
  products,
  onAsk,
}: {
  products: Product[];
  onAsk: (prompt: string) => void;
}) {
  const [sizeQ, dateQ, workQ] = SCENARIOS.filter((s) =>
    ["size", "date", "work"].includes(s.id),
  ).sort((a, b) => ["size", "date", "work"].indexOf(a.id) - ["size", "date", "work"].indexOf(b.id));
  const img = (i: number) => products[i % Math.max(products.length, 1)]?.image_url;

  return (
    <section className={cn(PAGE, "pb-10 md:pb-14")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 卡 A:深底(参考图「STUDENTS GET 10% OFF」位) */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-ink md:h-60">
          {img(1) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sizedImage(img(1)!, 600)}
              alt=""
              className="absolute inset-y-0 right-0 w-[46%] object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-ink/10" />
          <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
            <div>
              <p className="u-kicker !text-white/60">{sizeQ?.hint}</p>
              <p className="mt-2 text-[1.375rem] font-bold leading-tight text-white">
                {sizeQ?.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => sizeQ && onAsk(sizeQ.prompt)}
              className="w-fit rounded-full bg-white px-4 py-2 text-[0.6875rem] font-semibold text-ink hover:bg-white/85"
            >
              去问 →
            </button>
          </div>
        </div>

        {/* 卡 B:浅底(参考图「NEW SEASON NEW LOOK」位) */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-[var(--hero-ground)] md:h-60">
          {img(3) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sizedImage(img(3)!, 600)}
              alt=""
              className="absolute inset-y-0 right-0 w-[46%] object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--hero-ground)] via-[var(--hero-ground)]/95 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
            <div>
              <p className="u-kicker">{dateQ?.hint}</p>
              <p className="mt-2 font-serif text-[1.375rem] font-semibold leading-tight text-ink">
                {dateQ?.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dateQ && onAsk(dateQ.prompt)}
              className="w-fit rounded-full bg-ink px-4 py-2 text-[0.6875rem] font-semibold text-white hover:bg-ink/85"
            >
              去问 →
            </button>
          </div>
        </div>

        {/* 卡 C:整图(参考图「VISIT US IN STORE」位) */}
        <div className="relative h-56 overflow-hidden rounded-2xl md:h-60">
          {img(4) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sizedImage(img(4)!, 800)}
              alt=""
              className="absolute inset-0 size-full object-cover object-[center_30%]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/5" />
          <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
            <p className="u-kicker !text-white/70">{workQ?.hint}</p>
            <p className="mt-2 text-[1.375rem] font-bold leading-tight text-white">
              {workQ?.label}
            </p>
            <button
              type="button"
              onClick={() => workQ && onAsk(workQ.prompt)}
              className="mt-3 w-fit rounded-full border border-white px-4 py-2 text-[0.6875rem] font-semibold text-white hover:bg-white hover:text-ink"
            >
              去问 →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════ 8 · 合集卡(参考图 EXPLORE COLLECTIONS)══════════
   参考图:四张竖图卡,底部渐变压白字标题+副题+链接。
   🔴 没有人工策划的合集——用**类目**当合集(真实分组),点了筛选货架并滚过去。 */
export function CollectionCards({
  categories,
  products,
  onPick,
}: {
  categories: Array<Category & { count: number }>;
  products: Product[];
  onPick: (id: string) => void;
}) {
  const four = categories.slice(0, 4);
  if (four.length === 0) return null;
  return (
    <section className={cn(PAGE, "pb-12 md:pb-16")}>
      <SectionHead title="按系列逛" sub="按类目整理好的衣橱" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {four.map((c) => {
          const sample = products.find((p) => p.image_url && categoryOf(p) === c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="group relative h-56 overflow-hidden rounded-2xl bg-surface text-left md:h-64"
            >
              {sample?.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sizedImage(sample.image_url, 800)}
                  alt=""
                  className="absolute inset-0 size-full object-cover object-[center_30%] transition-opacity group-hover:opacity-90"
                  style={{ transitionDuration: "var(--dur-base)" }}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <p className="text-[1rem] font-semibold text-white">{c.label}</p>
                <p className="u-numeral mt-0.5 text-[0.6875rem] text-white/75">{c.count} 件</p>
                <span className="mt-2 inline-block border-b border-white pb-px text-[0.6875rem] font-medium text-white">
                  去看看 →
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
   参考图:黑色横条,三条价值主张(图标+粗题+灰字)。
   🔴 「可持续材料/道德生产」是无法核实的品牌背书,不能替商家写。
   换成三条从本站真实功能推出来的陈述;下面加法定信息行(ICP 备案位)。 */
const FOOT = [
  { icon: Camera, title: "店主亲选", desc: "上架的每一件,店主都亲自试穿过" },
  { icon: Sparkles, title: "实拍呈现", desc: "商品图为实穿实拍,所见即所得" },
  { icon: MessageCircle, title: "咨询不打烊", desc: "AI 即时回答,答不了转真人" },
];

export function FooterStrip() {
  return (
    <footer>
      <div className="bg-ink text-white">
        <div className={cn(PAGE, "grid grid-cols-1 gap-6 py-7 md:grid-cols-3 md:py-8")}>
          {FOOT.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25">
                <f.icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-semibold">{f.title}</p>
                <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-white/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 法定信息行:ICP 备案是境内站上线必须展示的,备案下来填 site.config 即出现 */}
      <div className={cn(PAGE, "flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-4")}>
        <span className="u-label text-[0.625rem] uppercase text-muted-foreground">
          {siteConfig.wordmark}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] text-muted-foreground">
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
        </span>
        <span className="w-full text-[0.625rem] leading-relaxed text-muted-foreground md:w-auto">
          {siteConfig.disclaimer}
        </span>
      </div>
    </footer>
  );
}
