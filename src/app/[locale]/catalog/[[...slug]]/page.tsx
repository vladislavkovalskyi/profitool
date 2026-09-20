import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDict, isLocale } from "@/i18n";
import { categories, categoryBySlug } from "@/data/taxonomy";
import { applyQuery, categoryHref, href, parseQuery } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { ActiveFilters, Filters, SortSelect } from "@/components/catalog/filters";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

type Params = {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ params, searchParams }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  const categorySlug = slug?.[0];
  const category = categorySlug ? categoryBySlug.get(categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") search.set(key, value);
  }
  const query = parseQuery(search, categorySlug);
  const found = applyQuery(query);

  const crumbs = [
    { label: dict.common.home, href: href(locale) },
    { label: dict.catalog.title, href: category ? categoryHref(locale) : undefined },
    ...(category ? [{ label: category.name[locale] }] : []),
  ];

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      <header className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="t-h1 text-bone">{category ? category.name[locale] : dict.catalog.all}</h1>
          <p className="mt-3.5 text-[17px] text-bone-dim">
            {dict.catalog.models(found.length)}
            {category ? ` · ${category.blurb[locale]}` : ""}
          </p>
        </div>
        <Suspense fallback={null}>
          <SortSelect />
        </Suspense>
      </header>

      {!category ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link key={item.slug} href={categoryHref(locale, item.slug)} className="chip !h-11 !px-5">
              {item.name[locale]}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-9 grid gap-x-14 gap-y-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start">
        <aside aria-label={dict.catalog.filters}>
          <Suspense fallback={null}>
            <Filters total={found.length} category={categorySlug} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>

          {found.length === 0 ? (
            <div className="border-t border-[var(--hair)] py-24 text-center">
              <p className="t-h2 text-bone">{dict.catalog.empty}</p>
              <p className="mt-4 text-bone-dim">{dict.catalog.emptyText}</p>
              <Link href={category ? categoryHref(locale, category.slug) : categoryHref(locale)} className="ghost-btn mt-8">
                {dict.catalog.resetAll}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-12 xl:grid-cols-3">
              {found.map((product, index) => (
                <ProductCard key={product.slug} product={product} size="catalog" priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
