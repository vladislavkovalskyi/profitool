import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { CompareTable } from "@/components/catalog/compare-table";

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell py-10 pb-32">
      <h1 className="t-h1 border-b border-[var(--hair)] pb-5 text-bone">{dict.compare.title}</h1>
      <div className="mt-8">
        <CompareTable />
      </div>
    </div>
  );
}
