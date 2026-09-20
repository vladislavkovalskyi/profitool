import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { applyQuery, emptyQuery, href } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { IconSearch } from "@/components/ui/icons";

type Params = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ params, searchParams }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const query = (await searchParams).q?.trim() ?? "";

  const found = query ? applyQuery({ ...emptyQuery(), search: query }) : [];

  return (
    <div className="shell py-10">
      <h1 className="t-h1 text-bone">{dict.search.title}</h1>

      {!query ? (
        <p className="mt-5 text-bone-dim">{dict.search.hint}</p>
      ) : (
        <p className="t-tag mt-5 text-bone-faint">{dict.search.results(found.length, query)}</p>
      )}

      {query && found.length === 0 ? (
        <div className="mt-10 border border-[var(--hair)] bg-ink-800 px-6 py-20 text-center">
          <IconSearch className="mx-auto h-12 w-12 text-ink-500" strokeWidth={1} />
          <p className="t-h2 mt-6 text-bone">{dict.search.empty(query)}</p>
          <p className="mt-4 text-bone-dim">{dict.search.emptyText}</p>
          <Link href={href(locale, "/catalog")} className="signal-btn mt-8 inline-flex">
            {dict.catalog.all}
          </Link>
        </div>
      ) : null}

      {found.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
          {found.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 4} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
