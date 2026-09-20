"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { productBySlug } from "@/data/products";
import { brandBySlug, platformBySlug, specLabels } from "@/data/taxonomy";
import { localize, type SpecKey } from "@/data/types";
import { href, imageOf, price, productHref } from "@/lib/shop";
import { useCart, useCompare } from "@/store/shop";
import { IconArrow, IconCart, IconCheck, IconClose, IconCompare } from "@/components/ui/icons";

export function CompareTable() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const slugs = useCompare((state) => state.slugs);
  const toggle = useCompare((state) => state.toggle);
  const add = useCart((state) => state.add);
  // Селектор обязан возвращать стабильную ссылку: .map() создаёт новый массив
  // на каждый рендер и уводит подписку в бесконечный цикл.
  const cartItems = useCart((state) => state.items);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-[40vh]" />;

  const items = slugs.map((slug) => productBySlug.get(slug)).filter((p) => p !== undefined);

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] bg-ink-800 px-6 py-24 text-center">
        <IconCompare className="mx-auto h-12 w-12 text-ink-500" strokeWidth={1} />
        <p className="t-h2 mt-6 text-bone">
          {locale === "ua" ? "Поки нічого не обрано" : "Пока ничего не выбрано"}
        </p>
        <p className="mt-4 text-bone-dim">
          {locale === "ua"
            ? "Познач до чотирьох позицій у каталозі — порівняємо характеристики поруч."
            : "Отметь до четырёх позиций в каталоге — сравним характеристики рядом."}
        </p>
        <Link href={href(locale, "/catalog")} className="signal-btn mt-8 inline-flex">
          {dict.catalog.all}
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Порядок строк задаёт первый товар, остальные ключи дописываются следом.
  const keys: SpecKey[] = [];
  for (const product of items) {
    for (const [key] of product.specs) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-[160px] align-top" />
            {items.map((product) => {
              const brand = brandBySlug.get(product.brand);
              const platform = product.platform ? platformBySlug.get(product.platform) : null;
              const inCart = cartItems.some((item) => item.slug === product.slug);
              return (
                <th key={product.slug} className="p-3 align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggle(product.slug)}
                      aria-label={dict.cart.remove}
                      className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-ink-700/90 text-bone-dim backdrop-blur transition-colors hover:text-signal"
                    >
                      <IconClose className="h-3.5 w-3.5" />
                    </button>

                    <Link href={productHref(locale, product.slug)} className="block">
                      <span className="relative block aspect-square overflow-hidden rounded-[18px] bg-ink-800">
                        <Image
                          src={imageOf(product)}
                          alt={product.model}
                          fill
                          sizes="220px"
                          className="object-contain p-3"
                        />
                      </span>
                      <span className="mt-3 block text-left text-[13px] text-bone-faint">{brand?.name}</span>
                      <span className="mt-1.5 block text-left text-[15px] font-normal leading-tight text-bone">
                        {product.model}
                      </span>
                    </Link>

                    <p className="t-num mt-3 text-left text-xl font-bold text-bone">
                      {price(product.price)}
                      <span className="ml-1 font-ui text-sm font-normal text-bone-dim">₴</span>
                    </p>

                    {platform ? (
                      <p className="mt-2 text-left text-[12px] text-bone-faint">{platform.name}</p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => add(product.slug)}
                      disabled={product.stock === 0}
                      className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
                        product.stock === 0
                          ? "cursor-not-allowed bg-ink-700 text-bone-faint"
                          : inCart
                            ? "bg-stock text-ink-900"
                            : "bg-signal text-black hover:bg-signal-hot"
                      }`}
                    >
                      {inCart ? <IconCheck className="h-4 w-4" /> : <IconCart className="h-4 w-4" />}
                      {inCart ? dict.product.inCart : dict.product.addToCart}
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {keys.map((key, index) => (
            <tr key={key} className={index % 2 ? "bg-ink-850/60" : ""}>
              <td className="border-b border-[var(--hair)] px-3 py-3.5 align-middle text-[13px] text-bone-faint">
                {specLabels[key][locale]}
              </td>
              {items.map((product) => {
                const spec = product.specs.find(([specKey]) => specKey === key);
                return (
                  <td
                    key={product.slug}
                    className="t-num border-b border-[var(--hair)] px-3 py-3.5 text-center text-sm text-bone"
                  >
                    {spec ? localize(spec[1], locale) : <span className="text-bone-faint">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr>
            <td className="border-b border-[var(--hair)] px-3 py-3.5 text-[13px] text-bone-faint">
              {dict.product.warranty}
            </td>
            {items.map((product) => (
              <td
                key={product.slug}
                className="t-num border-b border-[var(--hair)] px-3 py-3.5 text-center text-sm text-bone"
              >
                {dict.product.warrantyValue(product.warranty)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
