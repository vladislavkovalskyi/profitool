import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales } from "@/i18n";
import { productBySlug, products } from "@/data/products";
import { brandBySlug, categoryBySlug, specLabels } from "@/data/taxonomy";
import { localize } from "@/data/types";
import { categoryHref, href, imageOf, relatedTo } from "@/lib/shop";
import { BuyBox } from "@/components/product/buy-box";
import { ProductRail } from "@/components/catalog/product-rail";
import { IconChevron, IconShield, IconTruck, IconWrench } from "@/components/ui/icons";

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = productBySlug.get(slug);
  if (!product || !isLocale(locale)) return {};
  const brand = brandBySlug.get(product.brand);
  return {
    title: `${brand?.name} ${product.model} — Profitool`,
    description: product.description[locale],
  };
}

export default async function ProductPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  const product = productBySlug.get(slug);
  if (!product) notFound();

  const brand = brandBySlug.get(product.brand);
  const category = categoryBySlug.get(product.category);
  const related = relatedTo(product, 8);

  return (
    <div className="shell py-10">
      <nav className="flex flex-wrap items-center gap-2 text-[13px] text-bone-faint">
        <Link href={href(locale)} className="transition-colors hover:text-signal">
          Profitool
        </Link>
        <IconChevron className="h-3 w-3" />
        <Link href={categoryHref(locale)} className="transition-colors hover:text-signal">
          {dict.catalog.title}
        </Link>
        {category ? (
          <>
            <IconChevron className="h-3 w-3" />
            <Link
              href={categoryHref(locale, category.slug)}
              className="transition-colors hover:text-signal"
            >
              {category.name[locale]}
            </Link>
          </>
        ) : null}
        <IconChevron className="h-3 w-3" />
        <span className="text-bone">{product.model}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${href(locale, "/catalog")}?brand=${product.brand}`}
                className="text-[17px] font-semibold text-signal"
              >
                {brand?.name}
              </Link>
              {product.badges.includes("new") ? (
                <span className="rounded-full bg-bone px-3 py-1 text-[12px] font-semibold text-ink-900">{dict.common.new}</span>
              ) : null}
              {product.badges.includes("hit") ? (
                <span className="rounded-full bg-ink-700 px-3 py-1 text-[12px] font-semibold text-bone">{dict.common.hit}</span>
              ) : null}
            </div>

            <h1 className="t-h1 mt-4 text-bone">{product.model}</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-bone-dim">
              {product.description[locale]}
            </p>
          </header>

          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[24px] bg-ink-800">
            <Image
              src={imageOf(product)}
              alt={`${brand?.name} ${product.model}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-contain p-8 drop-shadow-[0_30px_50px_rgba(0,0,0,.6)]"
            />
          </div>

          <section className="mt-12">
            <h2 className="t-h2 text-bone">{dict.product.specs}</h2>
            <div className="mt-2">
              {product.specs.map(([key, value]) => (
                <div key={key} className="spec-row">
                  <span className="leader text-[15px]">{specLabels[key][locale]}</span>
                  <span className="t-num text-[15px] text-bone">{localize(value, locale)}</span>
                </div>
              ))}
              <div className="spec-row">
                <span className="leader text-[15px]">{dict.product.warranty}</span>
                <span className="t-num text-[15px] text-bone">
                  {dict.product.warrantyValue(product.warranty)}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="t-h2 text-bone">{dict.product.kit}</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.kit.map((item) => (
                <li key={item[locale]} className="flex items-center gap-3 rounded-[14px] bg-ink-800 px-4 py-3.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                  <span className="text-sm text-bone-dim">{item[locale]}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:sticky lg:top-[92px] lg:self-start">
          <BuyBox product={product} />

          <div className="mt-3 grid gap-2">
            <Service icon={<IconTruck className="h-[18px] w-[18px]" />} title={dict.cart.delivery}>
              {locale === "ua"
                ? "Нова пошта 1–2 дні. Безкоштовно від 5 000 ₴"
                : "Новая почта 1–2 дня. Бесплатно от 5 000 ₴"}
            </Service>
            <Service icon={<IconShield className="h-[18px] w-[18px]" />} title={dict.product.warranty}>
              {dict.product.warrantyValue(product.warranty)}
              {locale === "ua" ? ", офіційна від виробника" : ", официальная от производителя"}
            </Service>
            <Service icon={<IconWrench className="h-[18px] w-[18px]" />} title={dict.nav.service}>
              {locale === "ua"
                ? "Власний сервіс, Київ, вул. Кирилівська 102"
                : "Свой сервис, Киев, ул. Кирилловская 102"}
            </Service>
          </div>
        </div>
      </div>

      {related.length ? (
        <div className="mt-20">
          <ProductRail
            title={dict.product.related}
            items={related}
            href={categoryHref(locale, product.category)}
          />
        </div>
      ) : null}
    </div>
  );
}

function Service({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-[18px] bg-ink-800 px-5 py-4">
      <span className="mt-0.5 text-signal">{icon}</span>
      <span>
        <span className="t-tag block text-bone">{title}</span>
        <span className="mt-1.5 block text-xs leading-relaxed text-bone-dim">{children}</span>
      </span>
    </div>
  );
}
