import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geologica, Sofia_Sans_Extra_Condensed } from "next/font/google";
import "../globals.css";
import { getDict, htmlLang, isLocale, locales, type Locale } from "@/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareBar } from "@/components/catalog/compare-bar";
import { LocaleProvider } from "@/i18n/context";

/** Трафаретный узкий гротеск: заголовки читаются как маркировка на ящике. */
const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sofia",
  display: "swap",
});

/** Интерфейсный. Ось SHRP заострена в globals.css до 28. */
const geologica = Geologica({
  subsets: ["cyrillic", "latin"],
  axes: ["SHRP"],
  variable: "--font-geologica",
  display: "swap",
});

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "ua");
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    icons: { icon: "/icons/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed: Locale = locale;
  const dict = getDict(typed);

  return (
    <html
      lang={htmlLang[typed]}
      className={`${sofia.variable} ${geologica.variable}`}
    >
      <body>
        <LocaleProvider locale={typed}>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer locale={typed} dict={dict} />
          <CompareBar />
        </LocaleProvider>
      </body>
    </html>
  );
}
