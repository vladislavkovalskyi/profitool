"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/i18n/context";
import { cartTotals, DELIVERY_COST, FREE_DELIVERY_FROM, href, imageOf, price } from "@/lib/shop";
import { useCart } from "@/store/shop";
import { IconArrow, IconCheck } from "@/components/ui/icons";

type Method = "novapost" | "courier" | "pickup";
type Payment = "card" | "delivery" | "invoice";

export function CheckoutForm() {
  const { locale, dict } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<Method>("novapost");
  const [payment, setPayment] = useState<Payment>("card");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);

  useEffect(() => setMounted(true), []);

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(3, dict.checkout.errName)
          .refine((value) => value.split(/\s+/).length >= 2, dict.checkout.errName),
        phone: z
          .string()
          .trim()
          .regex(/^\+?380\d{9}$/, dict.checkout.errPhone),
        email: z.string().trim().email(dict.checkout.errEmail),
        city: z.string().trim().min(2, dict.checkout.errCity),
        branch: z.string().trim().min(1, dict.checkout.errBranch),
        comment: z.string().trim().optional(),
      }),
    [dict],
  );

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  const { lines, subtotal } = cartTotals(items);
  const delivery = method === "pickup" || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;
  const total = subtotal + delivery;

  if (!mounted) return <div className="h-[40vh]" />;

  if (orderNumber) {
    return (
      <div className="rounded-[24px] bg-stock/10 px-6 py-24 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-stock/15 text-stock">
          <IconCheck className="h-8 w-8" strokeWidth={1.6} />
        </span>
        <h2 className="t-h1 mt-7 text-bone">{dict.checkout.doneTitle}</h2>
        <p className="mx-auto mt-5 max-w-md text-bone-dim">{dict.checkout.doneText(orderNumber)}</p>
        <Link href={href(locale, "/catalog")} className="signal-btn mt-9 inline-flex">
          {dict.checkout.doneCta}
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[24px] bg-ink-800 px-6 py-24 text-center">
        <p className="t-h2 text-bone">{dict.cart.empty}</p>
        <Link href={href(locale, "/catalog")} className="signal-btn mt-7 inline-flex">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const onSubmit = handleSubmit(async () => {
    // Бэкенда нет: подтверждаем заказ локально и чистим корзину.
    const number = `PT-${String(Math.floor(100000 + Math.random() * 899999))}`;
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    clear();
    setOrderNumber(number);
  });

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-3">
        <Section title={dict.checkout.contacts} n="01">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={dict.checkout.name} error={errors.name?.message}>
              <input {...register("name")} autoComplete="name" className={inputClass(!!errors.name)} />
            </Field>
            <Field label={dict.checkout.phone} error={errors.phone?.message}>
              <input
                {...register("phone")}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+380"
                className={inputClass(!!errors.phone)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={dict.checkout.email} error={errors.email?.message}>
                <input
                  {...register("email")}
                  inputMode="email"
                  autoComplete="email"
                  className={inputClass(!!errors.email)}
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title={dict.checkout.deliveryTitle} n="02">
          <div className="grid gap-2 sm:grid-cols-3">
            <Choice
              checked={method === "novapost"}
              onChange={() => setMethod("novapost")}
              label={dict.checkout.methodNovaPost}
              note={`${price(DELIVERY_COST)} ₴`}
            />
            <Choice
              checked={method === "courier"}
              onChange={() => setMethod("courier")}
              label={dict.checkout.methodCourier}
              note={`${price(DELIVERY_COST)} ₴`}
            />
            <Choice
              checked={method === "pickup"}
              onChange={() => setMethod("pickup")}
              label={dict.checkout.methodPickup}
              note={dict.cart.deliveryFree}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={dict.checkout.city} error={errors.city?.message}>
              <input
                {...register("city")}
                autoComplete="address-level2"
                className={inputClass(!!errors.city)}
              />
            </Field>
            <Field
              label={method === "novapost" ? dict.checkout.branch : dict.checkout.address}
              error={errors.branch?.message}
            >
              <input
                {...register("branch")}
                autoComplete="street-address"
                className={inputClass(!!errors.branch)}
              />
            </Field>
          </div>
        </Section>

        <Section title={dict.checkout.payment} n="03">
          <div className="grid gap-2 sm:grid-cols-3">
            <Choice checked={payment === "card"} onChange={() => setPayment("card")} label={dict.checkout.payCard} />
            <Choice
              checked={payment === "delivery"}
              onChange={() => setPayment("delivery")}
              label={dict.checkout.payOnDelivery}
            />
            <Choice
              checked={payment === "invoice"}
              onChange={() => setPayment("invoice")}
              label={dict.checkout.payInvoice}
            />
          </div>

          <div className="mt-4">
            <Field label={dict.checkout.comment}>
              <textarea
                {...register("comment")}
                rows={3}
                placeholder={dict.checkout.commentPlaceholder}
                className={`${inputClass(false)} h-auto resize-none py-3`}
              />
            </Field>
          </div>
        </Section>
      </div>

      <aside className="lg:sticky lg:top-[92px]">
        <div className="overflow-hidden rounded-[24px] bg-ink-800">
          <div className="space-y-3 border-b border-[var(--hair)] p-5">
            {lines.map(({ product, qty, sum }) => (
              <div key={product.slug} className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 rounded-[10px] bg-ink-700">
                  <Image src={imageOf(product)} alt="" fill className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-bone">{product.model}</span>
                  <span className="t-tag text-bone-faint">
                    {qty} × {price(product.price)} ₴
                  </span>
                </span>
                <span className="t-num shrink-0 text-sm text-bone">{price(sum)} ₴</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-bone-dim">{dict.cart.subtotal}</span>
              <span className="t-num text-bone">{price(subtotal)} ₴</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bone-dim">{dict.cart.delivery}</span>
              <span className={`t-num ${delivery === 0 ? "text-stock" : "text-bone"}`}>
                {delivery === 0 ? dict.cart.deliveryFree : `${price(delivery)} ₴`}
              </span>
            </div>

            <div className="flex items-end justify-between border-t border-[var(--hair)] pt-4">
              <span className="t-tag text-bone-dim">{dict.cart.total}</span>
              <span className="t-num text-[30px] font-bold leading-none text-bone">
                {price(total)}
                <span className="ml-1.5 font-ui text-base font-normal text-bone-dim">₴</span>
              </span>
            </div>

            <button type="submit" disabled={isSubmitting} className="signal-btn mt-4 w-full">
              {dict.checkout.submit}
            </button>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-bone-faint">
              {locale === "ua"
                ? "Демонстрація: замовлення нікуди не відправляється"
                : "Демонстрация: заказ никуда не отправляется"}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return `h-12 w-full rounded-[12px] px-4 text-[15px] text-bone outline-none transition-colors placeholder:text-bone-faint ${
    invalid ? "bg-signal/10 ring-1 ring-signal" : "bg-ink-700 focus:bg-ink-600"
  }`;
}

function Section({ title, children }: { title: string; n?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-ink-800 p-5 sm:p-7">
      <h2 className="text-[19px] font-semibold text-bone">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] text-bone-faint">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1.5 block text-[13px] text-signal">{error}</span> : null}
    </label>
  );
}

function Choice({
  checked,
  onChange,
  label,
  note,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  note?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-[14px] p-4 transition-colors ${
        checked ? "bg-signal/15" : "bg-ink-700 hover:bg-ink-600"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input type="radio" checked={checked} onChange={onChange} className="peer sr-only" />
        <span
          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${
            checked ? "border-signal" : "border-[var(--hair-strong)]"
          }`}
        >
          {checked ? <span className="h-2 w-2 rounded-full bg-signal" /> : null}
        </span>
        <span className={`text-[13px] leading-tight ${checked ? "text-bone" : "text-bone-dim"}`}>
          {label}
        </span>
      </span>
      {note ? <span className="pl-[26px] text-[12px] text-bone-faint">{note}</span> : null}
    </label>
  );
}
