"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { swapLocale, type Locale } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { brands, categories, platforms } from "@/data/taxonomy";
import { bestsellers, categoryHref, categoryIcon, countForPlatform, href, imageOf, price } from "@/lib/shop";
import { useCart, useCompare, usePlatform } from "@/store/shop";
import { Logo } from "@/components/layout/logo";
import {
  IconBattery,
  IconBurger,
  IconCart,
  IconClose,
  IconCompare,
  IconSearch,
} from "@/components/ui/icons";

export function Header() {
  const { locale, dict } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-[var(--hair)] bg-ink-900/80 backdrop-blur-2xl">
        <div className="shell flex h-[76px] items-center gap-5">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-bone lg:hidden"
            aria-label={dict.nav.menu}
          >
            {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconBurger className="h-6 w-6" />}
          </button>

          <Logo href={href(locale)} />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className={`hidden shrink-0 rounded-metal px-5 py-2.5 text-[15px] transition-colors lg:block ${
              menuOpen ? "bg-ink-700 text-bone" : "text-bone-dim hover:text-bone"
            }`}
          >
            {dict.nav.catalog}
          </button>

          <SearchBox className="relative hidden max-w-xl flex-1 md:block" />

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Actions />
            <LangSwitch locale={locale} pathname={pathname} />
          </div>
        </div>

        {/* На телефоне поиск не помещается в строку с логотипом, поэтому живёт под ней. */}
        <div className="shell pb-3 md:hidden">
          <SearchBox className="relative" />
        </div>
      </div>

      {menuOpen ? <MegaMenu onClose={() => setMenuOpen(false)} /> : null}
      {mobileOpen ? <MobileMenu /> : null}
    </header>
  );
}

function LangSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  const other: Locale = locale === "ua" ? "ru" : "ua";
  return (
    <Link
      href={swapLocale(pathname, other)}
      className="ml-2 rounded-metal px-2.5 py-2 text-[13px] font-medium uppercase text-bone-dim transition-colors hover:text-bone"
    >
      {other}
    </Link>
  );
}

function SearchBox({ className }: { className: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const box = useRef<HTMLFormElement>(null);

  const matches = value.trim().length > 1 ? searchHints(value) : [];

  return (
    <form
      ref={box}
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        router.push(`${href(locale, "/search")}?q=${encodeURIComponent(value.trim())}`);
        setFocused(false);
      }}
      className={className}
      role="search"
    >
      <div
        className={`flex h-11 items-center gap-3 rounded-metal px-4 transition-colors ${
          focused ? "bg-ink-700" : "bg-ink-800 hover:bg-ink-750"
        }`}
      >
        <IconSearch className="h-[18px] w-[18px] shrink-0 text-bone-faint" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder={dict.nav.searchPlaceholder}
          aria-label={dict.nav.search}
          className="w-full bg-transparent text-[15px] text-bone outline-none placeholder:text-bone-faint"
        />
      </div>

      {focused && matches.length > 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-metal bg-ink-750 shadow-[0_30px_70px_rgba(0,0,0,.8)]">
          {matches.map((product) => (
            <Link
              key={product.slug}
              href={`${href(locale, "/product/")}${product.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-ink-700"
            >
              <Image src={imageOf(product)} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              <span className="min-w-0 flex-1 truncate text-sm text-bone">
                {brandName(product.brand)} {product.model}
              </span>
              <span className="t-num shrink-0 text-sm text-bone-dim">{price(product.price)} ₴</span>
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function searchHints(value: string) {
  const needle = value.trim().toLowerCase();
  return bestsellers(60)
    .filter((product) => `${product.brand} ${product.model}`.toLowerCase().includes(needle))
    .slice(0, 5);
}

function brandName(slug: string) {
  return brands.find((brand) => brand.slug === slug)?.name ?? slug;
}

function Actions() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCart((state) => state.items.reduce((acc, item) => acc + item.qty, 0));
  const compareCount = useCompare((state) => state.slugs.length);
  const platformSlug = usePlatform((state) => state.slug);

  useEffect(() => setMounted(true), []);
  const platform = platforms.find((item) => item.slug === platformSlug);

  return (
    <>
      {mounted && platform ? (
        <Link
          href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
          className="mr-1 hidden items-center gap-2 rounded-metal bg-signal/12 px-3.5 py-2.5 text-[13px] text-signal transition-colors hover:bg-signal/20 xl:flex"
        >
          <IconBattery className="h-4 w-4" />
          {platform.name}
        </Link>
      ) : null}

      <Action href={href(locale, "/compare")} label={dict.nav.compare} count={mounted ? compareCount : 0}>
        <IconCompare className="h-[21px] w-[21px]" />
      </Action>
      <Action href={href(locale, "/cart")} label={dict.nav.cart} count={mounted ? cartCount : 0}>
        <IconCart className="h-[21px] w-[21px]" />
      </Action>
    </>
  );
}

function Action({
  href: to,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      aria-label={label}
      className="relative grid h-11 w-11 place-items-center rounded-metal text-bone-dim transition-colors hover:bg-ink-800 hover:text-bone"
    >
      {children}
      {count > 0 ? (
        <span className="t-num absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[11px] font-bold text-black">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const { locale, dict } = useI18n();

  return (
    <>
      <div className="fixed inset-0 top-[76px] bg-black/70" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 top-full border-b border-[var(--hair)] bg-ink-850">
        <div className="shell grid gap-12 py-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(locale, category.slug)}
                className="group flex items-center gap-4 rounded-metal px-3 py-3 transition-colors hover:bg-ink-800"
              >
                <span className="relative h-12 w-12 shrink-0">
                  <Image
                    src={categoryIcon(category.slug)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </span>
                <span className="text-[16px] text-bone transition-colors group-hover:text-signal">
                  {category.name[locale]}
                </span>
              </Link>
            ))}
          </div>

          <div>
            <p className="t-tag text-bone-faint">{dict.catalog.platform}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
                  className="rounded-metal bg-ink-800 px-3.5 py-2.5 text-[14px] text-bone-dim transition-colors hover:bg-ink-700 hover:text-bone"
                >
                  {platform.name}
                  <span className="ml-2 text-bone-faint">{countForPlatform(platform.slug)}</span>
                </Link>
              ))}
            </div>

            <p className="t-tag mt-8 text-bone-faint">{dict.nav.brands}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`${href(locale, "/catalog")}?brand=${brand.slug}`}
                  className="rounded-metal bg-ink-800 px-3.5 py-2.5 text-[14px] text-bone-dim transition-colors hover:bg-ink-700 hover:text-bone"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileMenu() {
  const { locale } = useI18n();
  return (
    <div className="border-b border-[var(--hair)] bg-ink-850 lg:hidden">
      <div className="shell grid gap-1 py-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="flex items-center gap-4 rounded-metal px-3 py-3 transition-colors hover:bg-ink-800"
          >
            <span className="relative h-10 w-10 shrink-0">
              <Image src={categoryIcon(category.slug)} alt="" fill sizes="40px" className="object-contain" />
            </span>
            <span className="text-[16px] text-bone">{category.name[locale]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}


