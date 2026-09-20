"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { brandBySlug } from "@/data/taxonomy";
import { discountPercent, imageOf, price, productHref } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare } from "@/store/shop";
import { IconCart, IconCheck, IconCompare } from "@/components/ui/icons";

type Props = { product: Product; priority?: boolean };

export function ProductCard({ product, priority }: Props) {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.some((item) => item.slug === product.slug));
  const toggleCompare = useCompare((state) => state.toggle);
  const compareSlugs = useCompare((state) => state.slugs);

  useEffect(() => setMounted(true), []);

  const brand = brandBySlug.get(product.brand);
  const discount = discountPercent(product);
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const out = product.stock === 0;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[18px] bg-ink-800 transition-colors duration-300 group-hover:bg-ink-750">
        <Link href={productHref(locale, product.slug)} className="block">
          <div className="relative aspect-square">
            <Image
              src={imageOf(product)}
              alt={`${brand?.name} ${product.model}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 30vw, 300px"
              priority={priority}
              className={`object-contain p-6 transition-transform duration-500 group-hover:scale-105 ${
                out ? "opacity-40" : ""
              }`}
            />
          </div>
        </Link>

        {discount ? (
          <span className="absolute left-4 top-4 rounded-full bg-signal px-2.5 py-1 text-[12px] font-semibold text-black">
            −{discount}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => toggleCompare(product.slug)}
          disabled={compareFull}
          aria-label={dict.product.compare}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full transition-all duration-300 ${
            inCompare
              ? "bg-signal text-black opacity-100"
              : "bg-ink-700/80 text-bone-dim opacity-0 backdrop-blur group-hover:opacity-100 hover:text-bone"
          }`}
        >
          <IconCompare className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => add(product.slug)}
          disabled={out}
          className={`absolute inset-x-3 bottom-3 flex h-11 translate-y-3 items-center justify-center gap-2 rounded-full text-[14px] font-semibold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
            out
              ? "cursor-not-allowed bg-ink-700 text-bone-faint"
              : mounted && inCart
                ? "bg-stock text-ink-900"
                : "bg-signal text-black hover:bg-signal-hot"
          }`}
        >
          {mounted && inCart ? <IconCheck className="h-4 w-4" /> : <IconCart className="h-4 w-4" />}
          {out ? dict.stock.out : mounted && inCart ? dict.product.inCart : dict.product.addToCart}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <span className="text-[13px] text-bone-faint">{brand?.name}</span>
        <Link
          href={productHref(locale, product.slug)}
          className="mt-1 text-[16px] leading-snug text-bone transition-colors hover:text-signal"
        >
          {product.model}
        </Link>

        <div className="mt-auto flex items-baseline gap-2.5 pt-3">
          <span className="t-num text-[20px] text-bone">
            {price(product.price)} <span className="font-normal text-bone-dim">₴</span>
          </span>
          {product.oldPrice ? (
            <span className="t-num text-[14px] font-normal text-bone-faint line-through">
              {price(product.oldPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
