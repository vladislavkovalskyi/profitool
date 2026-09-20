"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { productBySlug } from "@/data/products";
import { href, imageOf } from "@/lib/shop";
import { useCompare } from "@/store/shop";
import { IconArrow, IconClose } from "@/components/ui/icons";

/** Липкая панель сравнения: видно выбор, не уходя из листинга. */
export function CompareBar() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const slugs = useCompare((state) => state.slugs);
  const toggle = useCompare((state) => state.toggle);
  const clear = useCompare((state) => state.clear);

  useEffect(() => setMounted(true), []);
  if (!mounted || slugs.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hair-strong)] bg-ink-850/95 backdrop-blur-xl">
      <div className="shell flex items-center gap-5 py-3.5">
        <span className="t-tag hidden shrink-0 text-bone-dim sm:block">{dict.compare.bar(slugs.length)}</span>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {slugs.map((slug) => {
            const product = productBySlug.get(slug);
            if (!product) return null;
            return (
              <div
                key={slug}
                className="group relative h-14 w-14 shrink-0 border border-[var(--hair)] bg-ink-800"
              >
                <Image src={imageOf(product)} alt={product.model} fill className="object-contain p-1.5" />
                <button
                  type="button"
                  onClick={() => toggle(slug)}
                  aria-label={dict.cart.remove}
                  className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center bg-ink-600 text-bone opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={clear} className="t-tag shrink-0 text-bone-faint hover:text-bone">
          {dict.compare.clear}
        </button>

        <Link
          href={href(locale, "/compare")}
          className="signal-btn h-11 shrink-0 px-5 py-0 text-[15px]"
        >
          {dict.compare.open}
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
