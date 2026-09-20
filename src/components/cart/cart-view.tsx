"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { brandBySlug } from "@/data/taxonomy";
import { cartTotals, FREE_DELIVERY_FROM, href, imageOf, price, productHref } from "@/lib/shop";
import { useCart } from "@/store/shop";
import { IconArrow, IconCart, IconMinus, IconPlus, IconTrash } from "@/components/ui/icons";

export function CartView() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[40vh]" />;

  const { lines, subtotal, delivery, total } = cartTotals(items);

  if (lines.length === 0) {
    return (
      <div className="rounded-[24px] bg-ink-800 px-6 py-24 text-center">
        <IconCart className="mx-auto h-12 w-12 text-ink-500" strokeWidth={1} />
        <p className="t-h2 mt-6 text-bone">{dict.cart.empty}</p>
        <p className="mt-4 text-bone-dim">{dict.cart.emptyText}</p>
        <Link href={href(locale, "/catalog")} className="signal-btn mt-8 inline-flex">
          {dict.cart.emptyCta}
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const left = FREE_DELIVERY_FROM - subtotal;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {lines.map(({ product, qty, sum }) => {
          const brand = brandBySlug.get(product.brand);
          return (
            <article key={product.slug} className="flex gap-4 rounded-[20px] bg-ink-800 p-4 sm:gap-6 sm:p-5">
              <Link
                href={productHref(locale, product.slug)}
                className="relative h-24 w-24 shrink-0 rounded-[14px] bg-ink-700 sm:h-28 sm:w-28"
              >
                <Image src={imageOf(product)} alt={product.model} fill className="object-contain p-2" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] text-bone-faint">{brand?.name}</span>
                <Link
                  href={productHref(locale, product.slug)}
                  className="mt-1.5 text-[17px] leading-tight text-bone transition-colors hover:text-signal"
                >
                  {product.model}
                </Link>
                

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="flex items-center rounded-full bg-ink-700">
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty - 1)}
                      aria-label="−"
                      className="grid h-10 w-9 place-items-center text-bone-dim transition-colors hover:text-bone"
                    >
                      <IconMinus className="h-3.5 w-3.5" />
                    </button>
                    <span className="t-num w-8 text-center text-sm text-bone">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, Math.min(qty + 1, product.stock))}
                      disabled={qty >= product.stock}
                      aria-label="+"
                      className="grid h-10 w-9 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-35"
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="t-num text-xl font-bold text-bone">
                      {price(sum)}
                      <span className="ml-1 font-ui text-sm font-normal text-bone-dim">₴</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(product.slug)}
                      aria-label={dict.cart.remove}
                      className="text-bone-faint transition-colors hover:text-signal"
                    >
                      <IconTrash className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="lg:sticky lg:top-[92px] lg:self-start">
        <div className="rounded-[24px] bg-ink-800 p-6">
          <dl className="space-y-3.5">
            <Row label={dict.cart.subtotal} value={`${price(subtotal)} ₴`} />
            <Row
              label={dict.cart.delivery}
              value={delivery === 0 ? dict.cart.deliveryFree : `${price(delivery)} ₴`}
              accent={delivery === 0}
            />
          </dl>

          {left > 0 ? (
            <div className="mt-5">
              <p className="t-tag text-bone-faint">{dict.cart.freeLeft(price(left))}</p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full bg-signal transition-[width] duration-500"
                  style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-end justify-between border-t border-[var(--hair)] pt-5">
            <span className="t-tag text-bone-dim">{dict.cart.total}</span>
            <span className="t-num text-[32px] font-bold leading-none text-bone">
              {price(total)}
              <span className="ml-1.5 font-ui text-lg font-normal text-bone-dim">₴</span>
            </span>
          </div>

          <Link href={href(locale, "/checkout")} className="signal-btn mt-6 w-full">
            {dict.cart.checkout}
            <IconArrow className="h-4 w-4" />
          </Link>
          <Link
            href={href(locale, "/catalog")}
            className="mt-3 block text-center text-sm text-bone-dim transition-colors hover:text-signal"
          >
            {dict.cart.continue}
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-bone-dim">{label}</dt>
      <dd className={`t-num text-sm ${accent ? "text-stock" : "text-bone"}`}>{value}</dd>
    </div>
  );
}
