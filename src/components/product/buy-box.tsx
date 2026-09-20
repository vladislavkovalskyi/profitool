"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import { useState } from "react";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { brandBySlug, platformBySlug } from "@/data/taxonomy";
import { discountPercent, href, price } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare, usePlatform, useWishlist } from "@/store/shop";
import { IconCheck, IconCompare, IconHeart, IconMinus, IconPlus } from "@/components/ui/icons";

export function BuyBox({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const [qty, setQty] = useState(1);

  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.find((item) => item.slug === product.slug));
  const toggleCompare = useCompare((state) => state.toggle);
  const compareSlugs = useCompare((state) => state.slugs);
  const toggleWish = useWishlist((state) => state.toggle);
  const wishSlugs = useWishlist((state) => state.slugs);
  const myPlatform = usePlatform((state) => state.slug);

  const out = product.stock === 0;
  const discount = discountPercent(product);
  const platform = product.platform ? platformBySlug.get(product.platform) : null;
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const wished = mounted && wishSlugs.includes(product.slug);
  const fits = mounted && !!myPlatform && product.platform === myPlatform;
  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="t-price text-4xl text-bone lg:text-[44px]">{price(product.price)} ₴</span>
        {product.oldPrice ? (
          <span className="text-lg text-bone-dim line-through">{price(product.oldPrice)}</span>
        ) : null}
        {discount ? (
          <span className="inline-flex h-7 items-center rounded-full bg-signal px-3 text-sm font-semibold text-black">
            −{discount}%
          </span>
        ) : null}
      </div>

      <Availability product={product} />

      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex shrink-0 items-center rounded-full border border-[var(--hair-strong)]">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            disabled={out || qty <= 1}
            aria-label={dict.cart.dec}
            className="icon-btn !h-[50px] !w-12 disabled:opacity-35"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <span className="t-price w-7 text-center text-[17px] text-bone" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))}
            disabled={out || qty >= product.stock}
            aria-label={dict.cart.inc}
            className="icon-btn !h-[50px] !w-12 disabled:opacity-35"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => add(product.slug, qty)}
          disabled={out}
          className="signal-btn min-w-0 flex-1"
        >
          {mounted && inCart ? (
            <>
              <IconCheck className="h-5 w-5" />
              {dict.product.inCart} · {inCart.qty}
            </>
          ) : out ? (
            dict.stock.out
          ) : (
            dict.product.addToCart
          )}
        </button>
      </div>

      {mounted && inCart ? (
        <Link href={href(locale, "/cart")} className="ghost-btn mt-3 w-full">
          {dict.product.toCart}
        </Link>
      ) : null}

      <div className="mt-2 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={wished}
          className={`inline-flex h-11 items-center gap-2 text-[15px] transition-colors ${
            wished ? "text-signal-text" : "text-bone-dim hover:text-bone"
          }`}
        >
          <IconHeart className="h-5 w-5" filled={wished} />
          {wished ? dict.product.inWishlist : dict.product.addToWishlist}
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.slug)}
          disabled={compareFull}
          aria-pressed={inCompare}
          className={`inline-flex h-11 items-center gap-2 text-[15px] transition-colors disabled:opacity-40 ${
            inCompare ? "text-signal-text" : "text-bone-dim hover:text-bone"
          }`}
        >
          <IconCompare className="h-5 w-5" />
          {inCompare ? dict.product.inCompare : dict.product.compare}
        </button>
      </div>

      {platform ? (
        <div className="mt-8 border-t border-[var(--hair)] pt-6">
          <p className="text-base font-medium text-bone">{dict.product.compatible}</p>
          <p className="t-h3 mt-2 text-bone">
            {brand} {platform.name}
          </p>
          <p className="mt-2 text-[15px] text-bone-dim">{platform.note[locale]}</p>
          {fits ? (
            <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-stock">
              <IconCheck className="h-4 w-4" />
              {dict.home.platformPick}
            </p>
          ) : (
            <Link
              href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
              className="chip mt-4 !h-11 !px-5"
            >
              {dict.product.sameSeries}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Availability({ product }: { product: Product }) {
  const { dict } = useI18n();

  const state =
    product.stock === 0
      ? { dot: "bg-bone-faint", text: `${dict.stock.out}. ${dict.stock.outNote}`, color: "text-bone-dim" }
      : product.stock <= 5
        ? { dot: "bg-signal", text: dict.stock.low(product.stock), color: "text-signal-text" }
        : { dot: "bg-stock", text: dict.stock.in, color: "text-bone" };

  return (
    <p className={`mt-4 flex items-center gap-2.5 text-base ${state.color}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${state.dot}`} aria-hidden />
      {state.text}
    </p>
  );
}
