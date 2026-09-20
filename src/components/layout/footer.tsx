import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { categories } from "@/data/taxonomy";
import { categoryHref, href } from "@/lib/shop";
import { Logo } from "@/components/layout/logo";

export function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  return (
    <footer className="mt-24 border-t border-[var(--hair)]">
      <div className="shell flex flex-col gap-10 py-14 lg:flex-row lg:justify-between">
        <div>
          <Logo href={href(locale)} />
          <a
            href="tel:0800331122"
            className="mt-5 block text-[22px] text-bone transition-colors hover:text-signal"
          >
            {dict.common.phone}
          </a>
          <p className="mt-2 text-sm text-bone-faint">{dict.common.footerHours}</p>
        </div>

        <nav className="grid gap-x-12 gap-y-2.5 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={categoryHref(locale, category.slug)}
              className="text-sm text-bone-dim transition-colors hover:text-signal"
            >
              {category.name[locale]}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-bone-faint">
          <p>{dict.common.footerAddress}</p>
          <Link href={href(locale, "/catalog")} className="mt-2 block transition-colors hover:text-signal">
            {dict.catalog.all}
          </Link>
        </div>
      </div>

      <div className="shell border-t border-[var(--hair)] py-6">
        <p className="text-xs text-bone-faint">© 2026 Profitool. {dict.common.footerRights}</p>
      </div>
    </footer>
  );
}
