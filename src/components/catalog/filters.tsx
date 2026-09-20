"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import { brands, platforms } from "@/data/taxonomy";
import { products } from "@/data/products";
import { parseQuery, queryToParams, type CatalogQuery } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconBattery, IconClose, IconFilter } from "@/components/ui/icons";

/** Фильтры пишут в адресную строку: ссылку можно переслать, «назад» работает. */
function useCatalogQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = parseQuery(new URLSearchParams(params.toString()));

  const push = (next: CatalogQuery) => {
    const search = queryToParams(next).toString();
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  return { query, push };
}

const cleared: Partial<CatalogQuery> = {
  brands: [],
  platforms: [],
  inStock: false,
  onSale: false,
  power: undefined,
  min: undefined,
  max: undefined,
};

export function Filters({ total, category }: { total: number; category?: string }) {
  const { dict } = useI18n();
  const { query, push } = useCatalogQuery();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const savedPlatform = usePlatform((state) => state.slug);

  const scope = products.filter((product) => !category || product.category === category);
  const brandRows = brands
    .map((brand) => ({ ...brand, count: scope.filter((p) => p.brand === brand.slug).length }))
    .filter((row) => row.count > 0);
  const platformRows = platforms
    .map((platform) => ({ ...platform, count: scope.filter((p) => p.platform === platform.slug).length }))
    .filter((row) => row.count > 0);
  const powerRows = (["cordless", "corded"] as const)
    .map((power) => ({ power, count: scope.filter((p) => p.power === power).length }))
    .filter((row) => row.count > 0);

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
    (query.onSale ? 1 : 0) +
    (query.power ? 1 : 0) +
    (query.min || query.max ? 1 : 0);

  // Мобильный ящик ведёт себя как модалка: Escape закрывает, Tab не уходит за край, фокус возвращается.
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const button = trigger.current;
    document.body.style.overflow = "hidden";
    node?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = node.querySelectorAll<HTMLElement>("button, input, a[href], select");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="ghost-btn w-full lg:hidden"
      >
        <IconFilter className="h-[18px] w-[18px]" />
        {dict.catalog.filters}
        {active > 0 ? (
          <span className="t-num grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1.5 text-[12px] text-black">
            {active}
          </span>
        ) : null}
      </button>

      <div
        ref={dialog}
        tabIndex={-1}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={dict.catalog.filters}
        className={`outline-none ${
          open
            ? "fixed inset-0 z-[60] flex flex-col bg-ink-900"
            : "hidden lg:block"
        }`}
      >
        <div className={open ? "flex-1 overflow-y-auto px-[var(--gutter)] pb-6" : ""}>
          <div className="flex items-center justify-between border-b border-[var(--hair)] pb-3.5 pt-1 lg:pt-0">
            <span className="t-eyebrow text-bone-dim">{dict.catalog.filters}</span>
            <div className="flex items-center gap-3">
              {active > 0 ? (
                <button
                  type="button"
                  onClick={() => push({ ...query, ...cleared })}
                  className="text-sm text-signal-text hover:underline"
                >
                  {dict.catalog.reset}
                </button>
              ) : null}
              {open ? (
                <button type="button" onClick={() => setOpen(false)} aria-label={dict.nav.close} className="icon-btn !text-bone">
                  <IconClose className="h-6 w-6" />
                </button>
              ) : null}
            </div>
          </div>

          {savedPlatform && platformRows.some((row) => row.slug === savedPlatform) ? (
            <SavedPlatform
              slug={savedPlatform}
              applied={query.platforms.includes(savedPlatform)}
              onToggle={() => toggleIn("platforms", savedPlatform)}
              label={dict.nav.myBattery}
            />
          ) : null}

          {powerRows.length > 1 ? (
            <Group title={dict.catalog.power}>
              {powerRows.map(({ power, count }) => (
                <Check
                  key={power}
                  checked={query.power === power}
                  onChange={() => push({ ...query, power: query.power === power ? undefined : power })}
                  label={power === "corded" ? dict.catalog.corded : dict.catalog.cordless}
                  count={count}
                />
              ))}
            </Group>
          ) : null}

          {brandRows.length > 1 ? (
            <Group title={dict.catalog.brand}>
              {brandRows.map((brand) => (
                <Check
                  key={brand.slug}
                  checked={query.brands.includes(brand.slug)}
                  onChange={() => toggleIn("brands", brand.slug)}
                  label={brand.name}
                  count={brand.count}
                />
              ))}
            </Group>
          ) : null}

          <Group title={dict.catalog.price}>
            {/* key: при сбросе фильтров поля заполняются заново из адреса */}
            <PriceRange key={`${query.min ?? ""}-${query.max ?? ""}`} query={query} onChange={push} />
          </Group>

          {platformRows.length > 0 ? (
            <Group title={dict.catalog.platform}>
              <div className="flex flex-wrap gap-2 pb-3">
                {platformRows.map((platform) => (
                  <button
                    key={platform.slug}
                    type="button"
                    aria-pressed={query.platforms.includes(platform.slug)}
                    onClick={() => toggleIn("platforms", platform.slug)}
                    className="chip"
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </Group>
          ) : null}

          <Group title={dict.catalog.availability} last>
            <Check
              checked={query.inStock}
              onChange={() => push({ ...query, inStock: !query.inStock })}
              label={dict.catalog.inStockOnly}
            />
            <Check
              checked={query.onSale}
              onChange={() => push({ ...query, onSale: !query.onSale })}
              label={dict.catalog.onSaleOnly}
            />
          </Group>
        </div>

        {open ? (
          <div className="border-t border-[var(--hair)] p-[var(--gutter)]">
            <button type="button" onClick={() => setOpen(false)} className="signal-btn w-full">
              {dict.catalog.showResults(total)}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

/** Выбранные фильтры чипами: каждый снимается одним нажатием. */
export function ActiveFilters() {
  const { dict } = useI18n();
  const { query, push } = useCatalogQuery();

  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const slug of query.brands) {
    const name = brands.find((brand) => brand.slug === slug)?.name ?? slug;
    chips.push({ key: `b-${slug}`, label: name, remove: () => push({ ...query, brands: query.brands.filter((v) => v !== slug) }) });
  }
  for (const slug of query.platforms) {
    const name = platforms.find((platform) => platform.slug === slug)?.name ?? slug;
    chips.push({ key: `p-${slug}`, label: name, remove: () => push({ ...query, platforms: query.platforms.filter((v) => v !== slug) }) });
  }
  if (query.power)
    chips.push({
      key: "power",
      label: query.power === "corded" ? dict.catalog.corded : dict.catalog.cordless,
      remove: () => push({ ...query, power: undefined }),
    });
  if (query.min || query.max)
    chips.push({
      key: "price",
      label: `${query.min ?? "0"} – ${query.max ?? "∞"} ₴`,
      remove: () => push({ ...query, min: undefined, max: undefined }),
    });
  if (query.inStock)
    chips.push({ key: "stock", label: dict.catalog.inStockOnly, remove: () => push({ ...query, inStock: false }) });
  if (query.onSale)
    chips.push({ key: "sale", label: dict.catalog.onSaleOnly, remove: () => push({ ...query, onSale: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 pb-6">
      <span className="text-[15px] text-bone-dim">{dict.catalog.selected}:</span>
      {chips.map((chip) => (
        <span key={chip.key} className="chip !h-9 !gap-1 !pr-1.5 text-sm">
          {chip.label}
          <button
            type="button"
            onClick={chip.remove}
            aria-label={dict.catalog.removeFilter(chip.label)}
            className="grid h-7 w-7 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
          >
            <IconClose className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </span>
      ))}
    </div>
  );
}

function SavedPlatform({
  slug,
  applied,
  onToggle,
  label,
}: {
  slug: string;
  applied: boolean;
  onToggle: () => void;
  label: string;
}) {
  const platform = platforms.find((item) => item.slug === slug);
  const mounted = useMounted();
  if (!mounted || !platform) return null;

  return (
    <div className="border-b border-[var(--hair)] py-5">
      <button type="button" onClick={onToggle} aria-pressed={applied} className="chip !h-11 w-full !justify-start">
        <IconBattery className="h-5 w-5 shrink-0" />
        <span className="text-bone-dim">{label}</span>
        <span className="font-medium">{platform.name}</span>
      </button>
    </div>
  );
}

function Group({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={`pb-2 pt-5 ${last ? "" : "border-b border-[var(--hair)]"}`}>
      <p className="text-base font-medium text-bone">{title}</p>
      <div className="mt-3">{children}</div>
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
    <label className="flex min-h-11 items-center gap-3 text-base text-bone">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="check"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-sm text-bone-dim">{count}</span> : null}
    </label>
  );
}

function PriceRange({ query, onChange }: { query: CatalogQuery; onChange: (next: CatalogQuery) => void }) {
  const { dict } = useI18n();
  const [min, setMin] = useState(query.min ? String(query.min) : "");
  const [max, setMax] = useState(query.max ? String(query.max) : "");

  const commit = () =>
    onChange({
      ...query,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    });

  const input = "field !h-12 !px-3.5 text-[15px] t-num";

  return (
    <div className="flex items-center gap-2.5 pb-3">
      <input
        inputMode="numeric"
        value={min}
        onChange={(event) => setMin(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceFrom}
        aria-label={dict.catalog.priceFrom}
        className={input}
      />
      <span className="text-bone-dim">—</span>
      <input
        inputMode="numeric"
        value={max}
        onChange={(event) => setMax(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceTo}
        aria-label={dict.catalog.priceTo}
        className={input}
      />
    </div>
  );
}

/** Сортировка отдельно: она живёт над сеткой, а не в колонке фильтров. */
export function SortSelect() {
  const { dict } = useI18n();
  const { query, push } = useCatalogQuery();

  const options = [
    { value: "popular", label: dict.catalog.sortPopular },
    { value: "cheap", label: dict.catalog.sortCheap },
    { value: "expensive", label: dict.catalog.sortExpensive },
    { value: "new", label: dict.catalog.sortNew },
  ] as const;

  return (
    <label className="flex items-center gap-3 text-[15px] text-bone-dim">
      <span className="hidden sm:block">{dict.catalog.sort}</span>
      <select
        value={query.sort}
        onChange={(event) => push({ ...query, sort: event.target.value as CatalogQuery["sort"] })}
        className="h-12 rounded-full border border-[var(--hair-strong)] bg-ink-900 px-4 text-[15px] text-bone outline-none focus:border-signal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
