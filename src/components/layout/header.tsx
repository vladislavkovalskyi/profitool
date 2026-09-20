"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { swapLocale, type Locale } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { brands, categories, platforms } from "@/data/taxonomy";
import {
  bestsellers,
  cartTotals,
  categoryHref,
  categoryIcon,
  countForPlatform,
  countIn,
  href,
  imageOf,
  price,
  productHref,
} from "@/lib/shop";
import { useCart, useCompare, useWishlist } from "@/store/shop";
import { Logo } from "@/components/layout/logo";
import { ThemeRow, ThemeToggle } from "@/components/layout/theme-toggle";
import {
  IconBurger,
  IconCart,
  IconClose,
  IconCompare,
  IconHeart,
  IconSearch,
  IconUser,
} from "@/components/ui/icons";

export function Header() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  // Меню открыто только на той странице, где его открыли: при переходе оно закрывается
  // само, без setState в эффекте.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [mobileFor, setMobileFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const mobileOpen = mobileFor === pathname;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuFor(null);
        setMobileFor(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Размытие на отдельном слое: backdrop-filter у самой шапки сделал бы её
          «содержащим блоком» для fixed-меню, и оно схлопнулось бы по высоте шапки. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-[var(--hair)] bg-ink-900/90 backdrop-blur-xl"
      />
      <div className="shell relative flex h-[var(--header-h)] items-center gap-2 lg:gap-7">
        <button
          type="button"
          onClick={() => setMobileFor(mobileOpen ? null : pathname)}
          aria-expanded={mobileOpen}
          aria-label={dict.nav.menu}
          className="icon-btn -ml-2.5 !text-bone lg:hidden"
        >
          {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconBurger className="h-6 w-6" />}
        </button>

        <Logo href={href(locale)} />

        <button
          type="button"
          onClick={() => setMenuFor(menuOpen ? null : pathname)}
          aria-expanded={menuOpen}
          className="signal-btn hidden shrink-0 lg:inline-flex"
        >
          {menuOpen ? <IconClose className="h-[18px] w-[18px]" /> : <IconBurger className="h-[18px] w-[18px]" />}
          {dict.nav.catalog}
        </button>

        <SearchBox className="relative ml-2 hidden flex-1 md:block lg:ml-0" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:ml-0">
          <Link
            href={href(locale, "/search")}
            aria-label={dict.nav.search}
            className="icon-btn !text-bone md:hidden"
          >
            <IconSearch className="h-[22px] w-[22px]" />
          </Link>
          <Actions />
        </div>
      </div>

      {menuOpen ? <MegaMenu onClose={() => setMenuFor(null)} /> : null}
      {mobileOpen ? <MobileMenu pathname={pathname} /> : null}
    </header>
  );
}

function Actions() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const cartItems = useCart((state) => state.items);
  const compareCount = useCompare((state) => state.slugs.length);
  const wishCount = useWishlist((state) => state.slugs.length);
  const pathname = usePathname();

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const cartSum = mounted ? cartTotals(cartItems).subtotal : 0;

  return (
    <>
      <div className="hidden items-center sm:flex">
        <IconLink
          to={href(locale, "/compare")}
          label={dict.nav.compare}
          count={mounted ? compareCount : 0}
          current={pathname.endsWith("/compare")}
        >
          <IconCompare className="h-[22px] w-[22px]" />
        </IconLink>
        <IconLink
          to={href(locale, "/wishlist")}
          label={dict.nav.wishlist}
          count={mounted ? wishCount : 0}
          current={pathname.endsWith("/wishlist")}
        >
          <IconHeart className="h-[22px] w-[22px]" />
        </IconLink>
        <IconLink to={href(locale, "/account")} label={dict.nav.account} current={pathname.endsWith("/account")}>
          <IconUser className="h-[22px] w-[22px]" />
        </IconLink>
        <ThemeToggle className="!h-[52px] !w-[52px] !text-bone hover:!text-signal-text" />
      </div>

      <Link
        href={href(locale, "/cart")}
        aria-label={`${dict.nav.cart}${cartCount ? `, ${cartCount}` : ""}`}
        className="relative ml-1 inline-flex h-11 items-center gap-2.5 rounded-full border border-[var(--hair-strong)] px-3 text-[15px] font-medium text-bone transition-colors hover:border-signal sm:h-[52px] sm:px-5 lg:ml-2"
      >
        <IconCart className="h-5 w-5" />
        <span className="hidden sm:inline">
          {cartSum > 0 ? <span className="t-num">{price(cartSum)} ₴</span> : dict.nav.cart}
        </span>
        {cartCount > 0 ? (
          <span className="t-num absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-signal px-1.5 text-[11px] font-semibold text-black sm:hidden">
            {cartCount}
          </span>
        ) : null}
      </Link>

      <LangSwitch locale={locale} pathname={pathname} />
    </>
  );
}

function IconLink({
  to,
  label,
  count = 0,
  current,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      aria-current={current ? "page" : undefined}
      className={`relative grid h-[52px] w-[52px] place-items-center rounded-full transition-colors ${
        current ? "text-signal-text" : "text-bone hover:text-signal-text"
      }`}
    >
      {children}
      {count > 0 ? (
        <span className="t-num absolute right-1 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[11px] font-semibold text-black">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function LangSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  const other: Locale = locale === "ua" ? "ru" : "ua";
  return (
    <Link
      href={swapLocale(pathname, other)}
      hrefLang={other === "ua" ? "uk" : "ru"}
      className="ml-1 hidden h-11 items-center rounded-full px-3 text-[15px] font-medium text-bone-dim transition-colors hover:text-bone lg:inline-flex"
    >
      {other === "ua" ? "UA" : "RU"}
    </Link>
  );
}

export function SearchBox({
  className,
  defaultValue = "",
  autoFocus,
}: {
  className: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
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
        className={`flex h-[52px] items-center rounded-full border pl-5 pr-1.5 transition-colors ${
          focused ? "border-signal" : "border-[var(--hair-strong)]"
        }`}
      >
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder={dict.nav.searchPlaceholder}
          aria-label={dict.nav.search}
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-bone outline-none placeholder:text-bone-faint"
        />
        <button type="submit" aria-label={dict.nav.searchSubmit} className="icon-btn">
          <IconSearch className="h-5 w-5" />
        </button>
      </div>

      {focused && matches.length > 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 py-2 shadow-[var(--shadow-pop)]">
          {matches.map((product) => (
            <Link
              key={product.slug}
              href={productHref(locale, product.slug)}
              className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-ink-700"
            >
              <Image src={imageOf(product)} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="min-w-0 flex-1 truncate text-[15px] text-bone">
                {brandName(product.brand)} {product.model}
              </span>
              <span className="t-num shrink-0 text-[15px] text-bone-dim">{price(product.price)} ₴</span>
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

function MegaMenu({ onClose }: { onClose: () => void }) {
  const { locale, dict } = useI18n();

  return (
    <>
      <div className="fixed inset-0 top-[var(--header-h)] bg-ink-900/70" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 top-full border-b border-[var(--hair)] bg-ink-900">
        <div className="shell grid gap-16 py-10 lg:grid-cols-[1.7fr_1fr]">
          <div className="grid gap-x-10 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(locale, category.slug)}
                className="group flex items-center gap-5 border-t border-[var(--hair)] py-4"
              >
                <span className="relative h-16 w-16 shrink-0">
                  <Image
                    src={categoryIcon(category.slug)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span>
                  <span className="block text-[18px] font-medium text-bone transition-colors group-hover:text-signal-text">
                    {category.name[locale]}
                  </span>
                  <span className="mt-0.5 block text-sm text-bone-dim">{category.blurb[locale]}</span>
                </span>
              </Link>
            ))}
          </div>

          <div>
            <p className="t-eyebrow text-bone-dim">{dict.catalog.platform}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
                  className="chip"
                >
                  {platform.name}
                  <span className="text-bone-dim">{countForPlatform(platform.slug)}</span>
                </Link>
              ))}
            </div>

            <p className="t-eyebrow mt-9 text-bone-dim">{dict.nav.brands}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link key={brand.slug} href={`${href(locale, "/catalog")}?brand=${brand.slug}`} className="chip">
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

function MobileMenu({ pathname }: { pathname: string }) {
  const { locale, dict } = useI18n();
  const other: Locale = locale === "ua" ? "ru" : "ua";

  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-ink-900 lg:hidden">
      <div className="shell pb-10 pt-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="flex items-center gap-4 border-b border-[var(--hair)] py-3"
          >
            <span className="relative h-14 w-14 shrink-0">
              <Image src={categoryIcon(category.slug)} alt="" fill sizes="56px" className="object-contain" />
            </span>
            <span className="flex-1 text-[18px] font-medium text-bone">{category.name[locale]}</span>
            <span className="text-[15px] text-bone-dim">{countIn(category.slug)}</span>
          </Link>
        ))}

        <div className="mt-6 grid gap-1">
          <MenuLink to={href(locale, "/compare")} icon={<IconCompare className="h-5 w-5" />}>
            {dict.nav.compare}
          </MenuLink>
          <MenuLink to={href(locale, "/wishlist")} icon={<IconHeart className="h-5 w-5" />}>
            {dict.nav.wishlist}
          </MenuLink>
          <MenuLink to={href(locale, "/account")} icon={<IconUser className="h-5 w-5" />}>
            {dict.nav.account}
          </MenuLink>
          <ThemeRow />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-[15px] text-bone-dim">{dict.nav.language}</span>
          <Link href={swapLocale(pathname, other)} className="chip">
            {other === "ua" ? "Українська" : "Русский"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={to} className="flex h-12 items-center gap-4 text-[17px] text-bone">
      <span className="text-bone-dim">{icon}</span>
      {children}
    </Link>
  );
}
