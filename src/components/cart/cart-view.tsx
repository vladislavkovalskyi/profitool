"use client";

import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { brandBySlug } from "@/data/taxonomy";
import { cartTotals, FREE_DELIVERY_FROM, href, imageOf, keyValue, price, productHref } from "@/lib/shop";
import { useCart } from "@/store/shop";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCart, IconMinus, IconPlus, IconTrash } from "@/components/ui/icons";

export function CartView() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);

  if (!mounted) return <div className="min-h-[40vh]" role="status" aria-busy="true" />;

  const { lines, gross, discount, subtotal, delivery, total, pieces } = cartTotals(items);

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<IconCart className="h-12 w-12" strokeWidth={1.2} />}
        title={dict.cart.empty}
        text={dict.cart.emptyText}
        cta={{ href: href(locale, "/catalog"), label: dict.cart.emptyCta }}
      />
    );
  }

  const left = FREE_DELIVERY_FROM - subtotal;

  return (
    <div className="grid gap-x-[72px] gap-y-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <section aria-label={dict.cart.label} className="border-b border-[var(--hair)]">
        {lines.map(({ product, qty, sum }) => {
          const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
          const name = `${brand} ${product.model}`;
          return (
            <article
              key={product.slug}
              className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-5 gap-y-4 border-t border-[var(--hair)] py-6 sm:grid-cols-[120px_minmax(0,1fr)_auto_auto_auto] sm:gap-x-7"
            >
              <Link href={productHref(locale, product.slug)} className="relative block h-[88px] w-[88px] sm:h-[120px] sm:w-[120px]">
                <Image src={imageOf(product)} alt={name} fill sizes="120px" className="object-contain" />
              </Link>

              <div className="min-w-0">
                <span className="text-sm text-bone-dim">{brand}</span>
                <Link
                  href={productHref(locale, product.slug)}
                  className="mt-1 block text-xl font-medium leading-snug text-bone transition-colors hover:text-signal-text"
                >
                  {product.model}
                </Link>
                <span className="mt-1.5 block text-sm text-bone-dim">{keyValue(product, locale)}</span>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-3 sm:contents">
                <div className="flex items-center rounded-full border border-[var(--hair-strong)]">
                  <button
                    type="button"
                    onClick={() => setQty(product.slug, qty - 1)}
                    aria-label={dict.cart.dec}
                    className="icon-btn !h-[50px] !w-12"
                  >
                    <IconMinus className="h-4 w-4" />
                  </button>
                  <span className="t-price w-7 text-center text-[17px]" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(product.slug, Math.min(qty + 1, product.stock))}
                    disabled={qty >= product.stock}
                    aria-label={dict.cart.inc}
                    className="icon-btn !h-[50px] !w-12 disabled:opacity-35"
                  >
                    <IconPlus className="h-4 w-4" />
                  </button>
                </div>

                <span className="t-price text-xl text-bone sm:w-[150px] sm:text-right sm:text-2xl">{price(sum)} ₴</span>

                <button
                  type="button"
                  onClick={() => remove(product.slug)}
                  aria-label={dict.cart.removeItem(name)}
                  className="icon-btn hover:!text-signal-text"
                >
                  <IconTrash className="h-5 w-5" />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <aside aria-label={dict.cart.summary} className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <dl>
          <Row label={dict.cart.items(pieces)} value={`${price(gross)} ₴`} first />
          {discount > 0 ? <Row label={dict.common.discount} value={`−${price(discount)} ₴`} accent /> : null}
          <Row
            label={dict.cart.delivery}
            value={delivery === 0 ? dict.cart.deliveryFree : `${price(delivery)} ₴`}
            plain
          />
        </dl>

        {left > 0 ? (
          <div className="mt-4">
            <p className="text-sm text-bone-dim">{dict.cart.freeLeft(price(left))}</p>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-600">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-baseline justify-between gap-4">
          <span className="text-xl font-medium">{dict.cart.total}</span>
          <span className="t-price text-3xl lg:text-[34px]">{price(total)} ₴</span>
        </div>

        <Link href={href(locale, "/checkout")} className="signal-btn btn-lg mt-6 w-full">
          {dict.cart.checkout}
        </Link>
        <Link href={href(locale, "/catalog")} className="ghost-btn mt-3 w-full">
          {dict.cart.continue}
        </Link>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  plain,
  first,
}: {
  label: string;
  value: string;
  accent?: boolean;
  plain?: boolean;
  first?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-[var(--hair)] py-3.5 ${
        first ? "border-t" : ""
      }`}
    >
      <dt className="text-base text-bone-dim">{label}</dt>
      <dd className={plain ? "text-base text-bone" : `t-price text-lg ${accent ? "text-signal-text" : "text-bone"}`}>
        {value}
      </dd>
    </div>
  );
}
