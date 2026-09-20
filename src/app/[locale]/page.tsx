import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/i18n";
import { categories } from "@/data/taxonomy";
import { productBySlug } from "@/data/products";
import { bestsellers, categoryHref, categoryIcon, discounted, href } from "@/lib/shop";
import { ProductRail } from "@/components/catalog/product-rail";
import { PlatformPicker } from "@/components/catalog/platform-picker";
import { IconArrow } from "@/components/ui/icons";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />

      <div className="shell space-y-24 py-24">
        <Categories locale={locale} dict={dict} />
        <ProductRail title={dict.home.bestsellers} items={bestsellers(10)} href={href(locale, "/catalog")} />
        <PlatformPicker />
        <ProductRail
          title={dict.common.discount}
          items={discounted(8)}
          href={`${href(locale, "/catalog")}?sort=cheap`}
        />
      </div>
    </>
  );
}

type Ctx = { locale: Locale; dict: ReturnType<typeof getDict> };

function Hero({ locale, dict }: Ctx) {
  const product = productBySlug.get("milwaukee-m18-chx")!;

  return (
    <section className="relative overflow-hidden">
      <span className="pointer-events-none absolute left-[58%] top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,74,0,.22),transparent_70%)] blur-3xl" />

      <div className="shell relative grid items-center gap-2 py-12 lg:grid-cols-2 lg:gap-10 lg:py-24">
        <div className="max-w-xl">
          <h1 className="t-hero rise text-bone">
            {dict.home.heroLine1}
            <br />
            {dict.home.heroLine2}
          </h1>

          <p className="rise mt-8 max-w-md text-[17px] leading-relaxed text-bone-dim [animation-delay:120ms]">
            {dict.home.heroText}
          </p>

          <div className="rise mt-10 flex flex-wrap gap-3 [animation-delay:200ms]">
            <Link href="#platform" className="signal-btn">
              {dict.home.heroCta}
            </Link>
            <Link href={href(locale, "/catalog")} className="ghost-btn">
              {dict.home.heroCatalog}
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative rise order-first lg:order-none [animation-delay:80ms]">
          <Image
            src={glassImage(product.category)}
            alt={product.model}
            width={900}
            height={900}
            priority
            className="mx-auto w-full max-w-[320px] drop-shadow-[0_40px_80px_rgba(0,0,0,.8)] sm:max-w-[440px] lg:max-w-[600px]"
          />
        </div>
      </div>
    </section>
  );
}

function Categories({ locale, dict }: Ctx) {
  return (
    <section>
      <h2 className="t-h2 text-bone">{dict.home.categories}</h2>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="group relative overflow-hidden rounded-[18px] bg-ink-800 p-4 transition-colors duration-300 hover:bg-ink-750 sm:p-6"
          >
            <span className="relative block h-24 sm:h-32">
              <Image
                src={categoryIcon(category.slug)}
                alt=""
                fill
                sizes="300px"
                className="object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="mt-4 block text-[15px] leading-snug text-bone transition-colors group-hover:text-signal sm:mt-5 sm:text-[17px]">
              {category.name[locale]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function glassImage(categorySlug: string): string {
  const tool = categories.find((category) => category.slug === categorySlug)?.tool ?? "drill";
  return `/products/${tool}-milwaukee-glass.png`;
}
