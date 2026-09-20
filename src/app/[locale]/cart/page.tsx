import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { CartView } from "@/components/cart/cart-view";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell py-10">
      <h1 className="t-h1 border-b border-[var(--hair)] pb-5 text-bone">{dict.cart.title}</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
