import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { brands, categories } from "@/data/taxonomy";
import { categoryHref, href } from "@/lib/shop";
import { Logo } from "@/components/layout/logo";

export function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  const link = "text-[15px] text-bone-dim transition-colors hover:text-signal-text";

  return (
    <footer className="mt-24 border-t border-[var(--hair)]">
      <div className="shell grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo href={href(locale)} />
          <p className="mt-6 max-w-[260px] text-[15px] leading-relaxed text-bone-dim">
            {dict.common.footerAddress}
            <br />
            {dict.common.footerHours}
          </p>
          <a
            href="tel:0800331122"
            className="t-price mt-5 block text-2xl text-bone transition-colors hover:text-signal-text"
          >
            {dict.common.phone}
          </a>
        </div>

        <nav aria-label={dict.nav.catalog}>
          <p className="t-eyebrow text-bone">{dict.nav.catalog}</p>
          <ul className="mt-5 grid gap-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(locale, category.slug)} className={link}>
                  {category.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Profitool">
          <p className="t-eyebrow text-bone">Profitool</p>
          <ul className="mt-5 grid gap-3">
            <li>
              <Link href={href(locale, "/cart")} className={link}>
                {dict.nav.cart}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/compare")} className={link}>
                {dict.nav.compare}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/wishlist")} className={link}>
                {dict.nav.wishlist}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/account")} className={link}>
                {dict.nav.account}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="t-eyebrow text-bone">{dict.nav.brands}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {brands.map((brand) => (
              <Link key={brand.slug} href={`${href(locale, "/catalog")}?brand=${brand.slug}`} className="chip">
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="shell border-t border-[var(--hair)] py-6">
        <p className="text-sm text-bone-dim">© 2026 Profitool. {dict.common.footerRights}</p>
      </div>
    </footer>
  );
}
