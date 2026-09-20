"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { platforms } from "@/data/taxonomy";
import { countForPlatform, href } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconArrow } from "@/components/ui/icons";

/**
 * Главная фича магазина: покупатель отмечает платформу, которая у него уже есть,
 * и дальше видит только совместимый инструмент. Выбор живёт между визитами.
 */
export function PlatformPicker() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const selected = usePlatform((state) => state.slug);
  const choose = usePlatform((state) => state.set);

  useEffect(() => setMounted(true), []);
  const active = mounted ? selected : null;

  return (
    <section id="platform" className="scroll-mt-28 rounded-[24px] bg-ink-800 p-8 sm:p-12">
      <h2 className="t-h2 max-w-lg text-bone">{dict.home.platformPick}</h2>
      <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-bone-dim">
        {dict.home.platformText}
      </p>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {platforms.map((platform) => {
          const isActive = active === platform.slug;
          return (
            <button
              key={platform.slug}
              type="button"
              onClick={() => choose(isActive ? null : platform.slug)}
              aria-pressed={isActive}
              className={`rounded-full px-5 py-3 text-[15px] transition-colors ${
                isActive
                  ? "bg-signal text-black"
                  : "bg-ink-700 text-bone-dim hover:bg-ink-600 hover:text-bone"
              }`}
            >
              {platform.name}
              <span className={`ml-2 ${isActive ? "text-black/70" : "text-bone-faint"}`}>
                {countForPlatform(platform.slug)}
              </span>
            </button>
          );
        })}
      </div>

      <Link
        href={`${href(locale, "/catalog")}${active ? `?platform=${active}` : ""}`}
        className="signal-btn mt-9 inline-flex"
      >
        {active ? dict.catalog.apply : dict.home.heroCatalog}
        <IconArrow className="h-4 w-4" />
      </Link>
    </section>
  );
}
