"use client";

import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { ProductCard } from "./product-card";
import { IconChevron } from "@/components/ui/icons";

type Props = {
  title: string;
  items: Product[];
  href?: string;
};

/** Горизонтальная витрина: на десктопе листается стрелками, на телефоне пальцем. */
export function ProductRail({ title, items, href }: Props) {
  const { dict } = useI18n();
  const track = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.min(node.clientWidth * 0.8, 900), behavior: "smooth" });
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <h2 className="t-h2 text-bone">{title}</h2>

        <div className="flex items-center gap-4">
          {href ? (
            <Link
              href={href}
              className="t-tag hidden whitespace-nowrap text-bone-dim transition-colors hover:text-signal sm:block"
            >
              {dict.home.viewAll}
            </Link>
          ) : null}
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="←"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink-800 text-bone-dim transition-colors hover:bg-ink-700 hover:text-bone"
            >
              <IconChevron className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="→"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink-800 text-bone-dim transition-colors hover:bg-ink-700 hover:text-bone"
            >
              <IconChevron className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className="scrollbar-none -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2"
      >
        {items.map((product) => (
          <div
            key={product.slug}
            className="w-[260px] shrink-0 snap-start sm:w-[290px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
