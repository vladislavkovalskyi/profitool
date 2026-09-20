"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { platformBySlug } from "@/data/taxonomy";
import { discountPercent, href, price } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare, usePlatform } from "@/store/shop";
import { IconArrow, IconBattery, IconCart, IconCheck, IconCompare, IconMinus, IconPlus } from "@/components/ui/icons";

export function BuyBox({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [qty, setQty] = useState(1);

  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.find((item) => item.slug === product.slug));
  const toggleCompare = useCompare((state) => state.toggle);
  const compareSlugs = useCompare((state) => state.slugs);
  const myPlatform = usePlatform((state) => state.slug);

  useEffect(() => setMounted(true), []);

  const out = product.stock === 0;
  const discount = discountPercent(product);
  const platform = product.platform ? platformBySlug.get(product.platform) : null;
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const fits = mounted && myPlatform && product.platform === myPlatform;

  return (
    <div className="overflow-hidden rounded-[24px] bg-ink-800">
      <div className="p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            {product.oldPrice ? (
              <p className="t-num text-sm text-bone-faint line-through">{price(product.oldPrice)} ₴</p>
            ) : null}
            <p className="t-num mt-1 text-[42px] font-bold leading-none text-bone">
              {price(product.price)}
              <span className="ml-2 font-ui text-2xl font-normal text-bone-dim">₴</span>
            </p>
          </div>
          {discount ? (
            <span className="rounded-full bg-signal px-3 py-1.5 text-[13px] font-semibold text-black">−{discount}%</span>
          ) : null}
        </div>

        <Availability product={product} dict={dict} />

        <div className="mt-6 flex items-stretch gap-2">
          <div className="flex shrink-0 items-center rounded-full bg-ink-700">
            <button
              type="button"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              disabled={out || qty <= 1}
              aria-label="−"
              className="grid h-[54px] w-11 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-35"
            >
              <IconMinus className="h-4 w-4" />
            </button>
            <span className="t-num w-9 text-center text-[17px] text-bone">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))}
              disabled={out || qty >= product.stock}
              aria-label="+"
              className="grid h-[54px] w-11 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-35"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => add(product.slug, qty)}
            disabled={out}
            className={`flex h-[54px] flex-1 items-center justify-center gap-2.5 rounded-full text-[16px] font-semibold transition-colors ${
              out
                ? "cursor-not-allowed bg-ink-700 text-bone-faint"
                : mounted && inCart
                  ? "bg-stock text-ink-900"
                  : "bg-signal text-black hover:bg-signal-hot"
            }`}
          >
            {mounted && inCart ? (
              <>
                <IconCheck className="h-5 w-5" />
                {dict.product.inCart} · {inCart.qty}
              </>
            ) : (
              <>
                <IconCart className="h-5 w-5" />
                {dict.product.addToCart}
              </>
            )}
          </button>
        </div>

        {mounted && inCart ? (
          <Link
            href={href(locale, "/cart")}
            className="ghost-btn mt-2.5 flex h-[50px] w-full py-0 text-[15px]"
          >
            {dict.cart.checkout}
            <IconArrow className="h-4 w-4" />
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => toggleCompare(product.slug)}
          disabled={compareFull}
          className={`mt-2.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-full text-sm transition-colors ${
            inCompare
              ? "bg-signal/12 text-signal"
              : "bg-ink-700 text-bone-dim hover:text-bone disabled:opacity-40"
          }`}
        >
          <IconCompare className="h-4 w-4" />
          {inCompare ? dict.product.inCompare : dict.product.compare}
        </button>
      </div>

      {platform ? (
        <div
          className={`px-6 py-5 ${fits ? "bg-stock/10" : "bg-ink-750"}`}
        >
          <p className="t-tag flex items-center gap-2 text-bone-faint">
            <IconBattery className={`h-4 w-4 ${fits ? "text-stock" : "text-signal"}`} />
            {dict.product.compatible}
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-[19px] font-semibold text-bone">{platform.name}</span>
            {fits ? (
              <span className="t-tag flex items-center gap-1.5 text-stock">
                <IconCheck className="h-3.5 w-3.5" />
                {locale === "ua" ? "Твоя платформа" : "Твоя платформа"}
              </span>
            ) : (
              <Link
                href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
                className="t-tag text-bone-dim transition-colors hover:text-signal"
              >
                {dict.product.sameSeries}
              </Link>
            )}
          </div>
          <p className="mt-2 text-xs text-bone-dim">{platform.note[locale]}</p>
        </div>
      ) : null}
    </div>
  );
}

function Availability({ product, dict }: { product: Product; dict: ReturnType<typeof useI18n>["dict"] }) {
  if (product.stock === 0) {
    return (
      <p className="mt-5 flex items-center gap-2 text-[14px] text-bone-faint">
        <span className="h-2 w-2 rounded-full bg-bone-faint" />
        {dict.stock.out} · {dict.stock.outNote}
      </p>
    );
  }
  if (product.stock <= 5) {
    return (
      <p className="mt-5 flex items-center gap-2 text-[14px] text-warn">
        <span className="h-2 w-2 rounded-full bg-warn" />
        {dict.stock.low(product.stock)}
      </p>
    );
  }
  return (
    <p className="mt-5 flex items-center gap-2 text-[14px] text-stock">
      <span className="h-2 w-2 rounded-full bg-stock" />
      {dict.stock.in}
    </p>
  );
}
