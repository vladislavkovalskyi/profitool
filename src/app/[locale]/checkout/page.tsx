import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { CheckoutForm } from "@/components/cart/checkout-form";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell py-10">
      <h1 className="t-h1 border-b border-[var(--hair)] pb-5 text-bone">{dict.checkout.title}</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
