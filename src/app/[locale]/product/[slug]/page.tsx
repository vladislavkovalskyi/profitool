import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales } from "@/i18n";
import { kitNoBattery, productBySlug, products } from "@/data/products";
import { brandBySlug, categoryBySlug, specLabels } from "@/data/taxonomy";
import { localize } from "@/data/types";
import { categoryHref, countIn, href, imageOf, relatedTo } from "@/lib/shop";
import { BuyBox } from "@/components/product/buy-box";
import { ProductSection } from "@/components/catalog/product-section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { IconAlert, IconCheck, IconClose, IconShield, IconTruck, IconWrench } from "@/components/ui/icons";

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
  const related = relatedTo(product, 4);
  const noBattery = product.kit.includes(kitNoBattery);

  const crumbs = [
    { label: dict.common.home, href: href(locale) },
    { label: dict.catalog.title, href: categoryHref(locale) },
    ...(category ? [{ label: category.name[locale], href: categoryHref(locale, category.slug) }] : []),
    { label: `${brand?.name} ${product.model}` },
  ];

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      {/* На телефоне порядок: заголовок и фото, покупка, остальное. На десктопе покупка
          стоит второй колонкой и едет за прокруткой. */}
      <div className="mt-8 grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <header>
            <Link
              href={`${href(locale, "/catalog")}?brand=${product.brand}`}
              className="text-base text-bone-dim transition-colors hover:text-signal-text"
            >
              {brand?.name}
            </Link>
            <h1 className="t-h1 mt-1 text-bone">{product.model}</h1>
            <p className="mt-3 text-sm text-bone-dim">
              {dict.product.article} {product.sku}
            </p>
            <p className="mt-5 max-w-xl text-[19px] leading-normal text-bone-dim">{product.description[locale]}</p>
          </header>

          <div className="relative mt-6 h-[300px] sm:h-[420px] lg:h-[480px]">
            <Image
              src={imageOf(product)}
              alt={`${brand?.name} ${product.model}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <BuyBox product={product} />

          <ul className="mt-8 border-t border-[var(--hair)]">
            <Service icon={<IconTruck className="h-5 w-5" />} title={dict.cart.delivery}>
              {dict.product.serviceDelivery}
            </Service>
            <Service icon={<IconShield className="h-5 w-5" />} title={dict.product.warranty}>
              {dict.product.warrantyValue(product.warranty)}, {dict.product.serviceWarranty}
            </Service>
            <Service icon={<IconWrench className="h-5 w-5" />} title={dict.nav.service}>
              {dict.product.serviceRepair}
            </Service>
          </ul>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          {noBattery ? (
            <div
              role="note"
              className="flex items-start gap-3.5 rounded-[24px] border border-signal p-5"
            >
              <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-signal-text" />
              <div>
                <p className="text-base font-medium text-bone">{dict.product.noBatteryTitle}</p>
                <p className="mt-1 text-[15px] leading-normal text-bone-dim">{dict.product.noBatteryText}</p>
              </div>
            </div>
          ) : null}

          <section className="mt-14">
            <h2 className="t-h2 text-bone">{dict.product.specs}</h2>
            <dl className="mt-4 grid gap-x-12 md:grid-cols-2">
              {[
                ...product.specs.map(([key, value]) => [specLabels[key][locale], localize(value, locale)] as const),
                [dict.product.warranty, dict.product.warrantyValue(product.warranty)] as const,
              ].map(([label, value]) => (
                <div key={label} className="spec-row">
                  <dt className="leader text-base">{label}</dt>
                  <dd className="t-num text-right text-base text-bone">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-14">
            <h2 className="t-h2 text-bone">{dict.product.kit}</h2>
            <ul className="mt-5 grid gap-x-12 gap-y-3.5 sm:grid-cols-2">
              {product.kit.map((item) => {
                const missing = item === kitNoBattery;
                return (
                  <li
                    key={item[locale]}
                    className={`flex items-center gap-3 text-base ${missing ? "text-bone-dim" : "text-bone"}`}
                  >
                    {missing ? (
                      <IconClose className="h-4 w-4 shrink-0" />
                    ) : (
                      <IconCheck className="h-4 w-4 shrink-0 text-signal-text" />
                    )}
                    {item[locale]}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      {related.length ? (
        <div className="mt-20">
          <ProductSection
            title={dict.product.related}
            items={related}
            size="rail"
            level="sub"
            action={
              category
                ? {
                    href: categoryHref(locale, category.slug),
                    label: dict.product.allModels(countIn(category.slug)),
                  }
                : undefined
            }
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
    <li className="flex items-start gap-4 border-b border-[var(--hair)] py-4">
      <span className="mt-0.5 text-signal-text">{icon}</span>
      <span>
        <span className="block text-base font-medium text-bone">{title}</span>
        <span className="mt-0.5 block text-[15px] leading-normal text-bone-dim">{children}</span>
      </span>
    </li>
  );
}
