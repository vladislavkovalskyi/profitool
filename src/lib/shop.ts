import type { Locale } from "@/i18n";
import { categoryBySlug, platformBySlug } from "@/data/taxonomy";
import { productBySlug, products } from "@/data/products";
import { localize, type Product } from "@/data/types";
import { plural } from "@/i18n/plural";

/** Неразрывный пробел как разделитель разрядов: 12 490, а не 12490. */
export function price(value: number): string {
  return new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(value);
}

export function discountPercent(product: Product): number | null {
  if (!product.oldPrice || product.oldPrice <= product.price) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

const PIECES: Record<Locale, [string, string, string]> = {
  ua: ["предмет", "предмети", "предметів"],
  ru: ["предмет", "предмета", "предметов"],
};

/** Ключевой параметр с единицей. Почти везде она уже в значении, у наборов дописываем. */
export function keyValue(product: Product, locale: Locale): string {
  const raw = localize(product.key.value, locale);
  if (product.key.spec === "pieces") return `${raw} ${plural(Number(raw), PIECES[locale])}`;
  return raw;
}

/** Товар показываем настоящим снимком: покупатель должен узнать инструмент. */
export function imageOf(product: Product): string {
  const category = categoryBySlug.get(product.category);
  return `/products/${category?.tool ?? "drill"}-${product.brand}-photo.png`;
}

/** Иконка раздела — стеклянный рендер из Blender, он же в меню каталога. */
export function categoryIcon(slug: string): string {
  const tool = categoryBySlug.get(slug)?.tool ?? "drill";
  return `/products/${tool}-makita-glass.png`;
}

export function href(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

export function productHref(locale: Locale, slug: string): string {
  return `/${locale}/product/${slug}`;
}

export function categoryHref(locale: Locale, slug?: string): string {
  return slug ? `/${locale}/catalog/${slug}` : `/${locale}/catalog`;
}

export const FREE_DELIVERY_FROM = 5000;
export const DELIVERY_COST = 120;

export function cartTotals(items: { slug: string; qty: number }[]) {
  const lines = items
    .map((item) => {
      const product = productBySlug.get(item.slug);
      return product ? { product, qty: item.qty, sum: product.price * item.qty } : null;
    })
    .filter((line): line is { product: Product; qty: number; sum: number } => line !== null);

  const subtotal = lines.reduce((acc, line) => acc + line.sum, 0);
  // «Товары» считаем по старым ценам, разницу показываем строкой «Скидка».
  const gross = lines.reduce((acc, line) => acc + (line.product.oldPrice ?? line.product.price) * line.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;
  return {
    lines,
    gross,
    discount: gross - subtotal,
    subtotal,
    delivery,
    total: subtotal + delivery,
    count: lines.length,
    pieces: lines.reduce((acc, line) => acc + line.qty, 0),
  };
}

export type SortKey = "popular" | "cheap" | "expensive" | "new";

export type CatalogQuery = {
  category?: string;
  brands: string[];
  platforms: string[];
  min?: number;
  max?: number;
  inStock: boolean;
  onSale: boolean;
  power?: "corded" | "cordless";
  sort: SortKey;
  search?: string;
};

export function emptyQuery(): CatalogQuery {
  return { brands: [], platforms: [], inStock: false, onSale: false, sort: "popular" };
}

/** Читает фильтры из URL. Состояние живёт в адресе, а не в компоненте. */
export function parseQuery(params: URLSearchParams, category?: string): CatalogQuery {
  const list = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const num = (key: string) => {
    const raw = Number(params.get(key));
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  };
  const power = params.get("power");
  const sort = params.get("sort");

  return {
    category,
    brands: list("brand"),
    platforms: list("platform"),
    min: num("min"),
    max: num("max"),
    inStock: params.get("stock") === "1",
    onSale: params.get("sale") === "1",
    power: power === "corded" || power === "cordless" ? power : undefined,
    sort: sort === "cheap" || sort === "expensive" || sort === "new" ? sort : "popular",
    search: params.get("q") ?? undefined,
  };
}

export function queryToParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.brands.length) params.set("brand", query.brands.join(","));
  if (query.platforms.length) params.set("platform", query.platforms.join(","));
  if (query.min) params.set("min", String(query.min));
  if (query.max) params.set("max", String(query.max));
  if (query.inStock) params.set("stock", "1");
  if (query.onSale) params.set("sale", "1");
  if (query.power) params.set("power", query.power);
  if (query.sort !== "popular") params.set("sort", query.sort);
  if (query.search) params.set("q", query.search);
  return params;
}

export function applyQuery(query: CatalogQuery): Product[] {
  const needle = query.search?.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.brands.length && !query.brands.includes(product.brand)) return false;
    if (query.platforms.length && (!product.platform || !query.platforms.includes(product.platform)))
      return false;
    if (query.min && product.price < query.min) return false;
    if (query.max && product.price > query.max) return false;
    if (query.inStock && product.stock === 0) return false;
    if (query.onSale && !product.oldPrice) return false;
    if (query.power && product.power !== query.power) return false;
    if (needle) {
      const haystack = `${product.brand} ${product.model} ${product.sku} ${product.slug}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (query.sort === "cheap") sorted.sort((a, b) => a.price - b.price);
  else if (query.sort === "expensive") sorted.sort((a, b) => b.price - a.price);
  else if (query.sort === "new")
    sorted.sort((a, b) => Number(b.badges.includes("new")) - Number(a.badges.includes("new")));
  else sorted.sort((a, b) => b.sold - a.sold);

  return sorted;
}

export function countForPlatform(slug: string): number {
  return products.filter((product) => product.platform === slug).length;
}

export function platformName(slug?: string): string | null {
  return slug ? (platformBySlug.get(slug)?.name ?? null) : null;
}

/** Похожие: та же категория, а если мало — та же платформа. */
export function relatedTo(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category === product.category,
  );
  const samePlatform = product.platform
    ? products.filter(
        (candidate) =>
          candidate.slug !== product.slug &&
          candidate.platform === product.platform &&
          candidate.category !== product.category,
      )
    : [];
  return [...samePlatform, ...sameCategory].slice(0, limit);
}

export function bestsellers(limit = 8): Product[] {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit);
}

export function freshArrivals(limit = 8): Product[] {
  return products
    .filter((product) => product.badges.includes("new"))
    .concat([...products].sort((a, b) => b.price - a.price))
    .slice(0, limit);
}

export function discounted(limit = 8): Product[] {
  return products
    .filter((product) => product.oldPrice)
    .sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0))
    .slice(0, limit);
}

export function countIn(category: string): number {
  return products.filter((product) => product.category === category).length;
}
