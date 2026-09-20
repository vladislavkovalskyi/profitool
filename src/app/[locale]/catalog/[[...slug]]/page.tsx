import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDict, isLocale } from "@/i18n";
import { categories, categoryBySlug } from "@/data/taxonomy";
import { applyQuery, categoryHref, href, parseQuery } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { Filters, SortSelect } from "@/components/catalog/filters";
import { IconChevron } from "@/components/ui/icons";

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

  return (
    <div className="shell py-10">
      <nav className="flex items-center gap-2 text-[13px] text-bone-faint">
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
            <span className="text-bone">{category.name[locale]}</span>
          </>
        ) : null}
      </nav>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-5 pb-2">
        <div>
          <h1 className="t-h1 text-bone">{category ? category.name[locale] : dict.catalog.all}</h1>
          <p className="mt-3 text-[14px] text-bone-dim">
            {dict.catalog.found(found.length)}
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
            <Link
              key={item.slug}
              href={categoryHref(locale, item.slug)}
              className="rounded-full bg-ink-800 px-4 py-2.5 text-[14px] text-bone-dim transition-colors hover:bg-ink-750 hover:text-bone"
            >
              {item.name[locale]}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <Suspense fallback={null}>
            <Filters total={found.length} />
          </Suspense>
        </aside>

        <div>
          {found.length === 0 ? (
            <div className="rounded-[24px] bg-ink-800 px-6 py-24 text-center">
              <p className="t-h2 text-bone">{dict.catalog.empty}</p>
              <p className="mt-4 text-bone-dim">{dict.catalog.emptyText}</p>
              <Link href={categoryHref(locale)} className="ghost-btn mt-8 inline-flex">
                {dict.catalog.resetAll}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {found.map((product, index) => (
                <ProductCard key={product.slug} product={product} priority={index < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
