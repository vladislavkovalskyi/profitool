"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { brands, platforms } from "@/data/taxonomy";
import { countForPlatform, parseQuery, queryToParams, type CatalogQuery } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconBattery, IconCheck, IconClose, IconFilter } from "@/components/ui/icons";

/** Фильтры пишут в адресную строку: ссылку можно переслать, «назад» работает. */
export function Filters({ total }: { total: number }) {
  const { dict } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const savedPlatform = usePlatform((state) => state.slug);

  const query = parseQuery(new URLSearchParams(params.toString()));

  const push = (next: CatalogQuery) => {
    const search = queryToParams(next).toString();
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  const toggleIn = (key: "brands" | "platforms", value: string) => {
    const current = query[key];
    push({
      ...query,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const active =
    query.brands.length +
    query.platforms.length +
    (query.inStock ? 1 : 0) +
    (query.power ? 1 : 0) +
    (query.min || query.max ? 1 : 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-ink-800 text-[15px] font-semibold text-bone lg:hidden"
      >
        <IconFilter className="h-[18px] w-[18px]" />
        {dict.catalog.filters}
        {active > 0 ? (
          <span className="t-num grid h-5 min-w-5 place-items-center bg-signal px-1 text-[11px] text-black">
            {active}
          </span>
        ) : null}
      </button>

      <div
        className={`fixed inset-0 z-[60] bg-ink-900 p-6 lg:static lg:z-auto lg:block lg:overflow-visible lg:bg-transparent lg:p-0 ${
          open ? "overflow-y-auto" : "hidden"
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="t-h3 text-bone">{dict.catalog.filters}</span>
          <button type="button" onClick={() => setOpen(false)} aria-label={dict.nav.close}>
            <IconClose className="h-6 w-6 text-bone" />
          </button>
        </div>

        <div className="space-y-2">
          {savedPlatform ? (
            <SavedPlatformHint
              slug={savedPlatform}
              applied={query.platforms.includes(savedPlatform)}
              onApply={() => toggleIn("platforms", savedPlatform)}
              label={dict.nav.myBattery}
            />
          ) : null}

          <Group title={dict.catalog.platform}>
            {platforms.map((platform) => (
              <Check
                key={platform.slug}
                checked={query.platforms.includes(platform.slug)}
                onChange={() => toggleIn("platforms", platform.slug)}
                label={platform.name}
                count={countForPlatform(platform.slug)}
              />
            ))}
          </Group>

          <Group title={dict.catalog.brand}>
            {brands.map((brand) => (
              <Check
                key={brand.slug}
                checked={query.brands.includes(brand.slug)}
                onChange={() => toggleIn("brands", brand.slug)}
                label={brand.name}
              />
            ))}
          </Group>

          <Group title={dict.catalog.power}>
            {(["corded", "cordless"] as const).map((power) => (
              <Check
                key={power}
                checked={query.power === power}
                onChange={() => push({ ...query, power: query.power === power ? undefined : power })}
                label={power === "corded" ? dict.catalog.corded : dict.catalog.cordless}
              />
            ))}
          </Group>

          <Group title={dict.catalog.price}>
            <PriceRange query={query} onChange={push} dict={dict} />
          </Group>

          <Group title={dict.catalog.availability}>
            <Check
              checked={query.inStock}
              onChange={() => push({ ...query, inStock: !query.inStock })}
              label={dict.catalog.inStockOnly}
            />
          </Group>
        </div>

        {active > 0 ? (
          <button
            type="button"
            onClick={() => push({ ...query, brands: [], platforms: [], inStock: false, power: undefined, min: undefined, max: undefined })}
            className="mt-3 w-full rounded-full bg-ink-800 py-3 text-[14px] text-bone-dim transition-colors hover:text-signal"
          >
            {dict.catalog.resetAll}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="signal-btn mt-4 w-full lg:hidden"
        >
          {dict.catalog.apply} · {total}
        </button>
      </div>
    </>
  );
}

function SavedPlatformHint({
  slug,
  applied,
  onApply,
  label,
}: {
  slug: string;
  applied: boolean;
  onApply: () => void;
  label: string;
}) {
  const platform = platforms.find((item) => item.slug === slug);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !platform) return null;

  return (
    <button
      type="button"
      onClick={onApply}
      className={`flex w-full items-center gap-3 rounded-[18px] px-5 py-4 text-left transition-colors ${
        applied ? "bg-signal/15" : "bg-ink-800 hover:bg-ink-750"
      }`}
    >
      <IconBattery className={`h-5 w-5 shrink-0 ${applied ? "text-signal" : "text-bone-faint"}`} />
      <span className="min-w-0 flex-1">
        <span className="t-tag block text-bone-faint">{label}</span>
        <span className="mt-1 block text-[16px] font-semibold text-bone">
          {platform.name}
        </span>
      </span>
      {applied ? <IconCheck className="h-4 w-4 shrink-0 text-signal" /> : null}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] bg-ink-800 px-5 py-5">
      <p className="t-tag text-bone-faint">{title}</p>
      <div className="mt-3.5 space-y-0.5">{children}</div>
    </section>
  );
}

function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-signal ${
          checked ? "bg-signal text-black" : "bg-ink-700 text-transparent"
        }`}
      >
        <IconCheck className="h-3 w-3" strokeWidth={2.4} />
      </span>
      <span
        className={`flex-1 text-sm transition-colors ${checked ? "text-bone" : "text-bone-dim group-hover:text-bone"}`}
      >
        {label}
      </span>
      {count !== undefined ? <span className="t-num text-xs text-bone-faint">{count}</span> : null}
    </label>
  );
}

function PriceRange({
  query,
  onChange,
  dict,
}: {
  query: CatalogQuery;
  onChange: (next: CatalogQuery) => void;
  dict: ReturnType<typeof useI18n>["dict"];
}) {
  const [min, setMin] = useState(query.min ? String(query.min) : "");
  const [max, setMax] = useState(query.max ? String(query.max) : "");

  const commit = () =>
    onChange({
      ...query,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    });

  return (
    <div className="flex items-center gap-2">
      <input
        inputMode="numeric"
        value={min}
        onChange={(event) => setMin(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceFrom}
        aria-label={dict.catalog.priceFrom}
        className="t-num h-11 w-full rounded-[12px] bg-ink-700 px-3.5 text-sm text-bone outline-none transition-colors focus:bg-ink-600"
      />
      <span className="text-bone-faint">—</span>
      <input
        inputMode="numeric"
        value={max}
        onChange={(event) => setMax(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceTo}
        aria-label={dict.catalog.priceTo}
        className="t-num h-11 w-full rounded-[12px] bg-ink-700 px-3.5 text-sm text-bone outline-none transition-colors focus:bg-ink-600"
      />
    </div>
  );
}

/** Сортировка отдельно: она живёт над сеткой, а не в колонке фильтров. */
export function SortSelect() {
  const { dict } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = parseQuery(new URLSearchParams(params.toString()));

  const options = [
    { value: "popular", label: dict.catalog.sortPopular },
    { value: "cheap", label: dict.catalog.sortCheap },
    { value: "expensive", label: dict.catalog.sortExpensive },
    { value: "new", label: dict.catalog.sortNew },
  ] as const;

  return (
    <label className="flex items-center gap-2.5">
      <span className="t-tag hidden text-bone-faint sm:block">{dict.catalog.sort}</span>
      <select
        value={query.sort}
        onChange={(event) => {
          const next = queryToParams({ ...query, sort: event.target.value as CatalogQuery["sort"] });
          const search = next.toString();
          router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
        }}
        className="h-11 rounded-full bg-ink-800 px-4 text-sm text-bone outline-none transition-colors hover:bg-ink-750"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-800">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
