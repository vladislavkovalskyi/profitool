import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Golos_Text, Unbounded } from "next/font/google";
import "../globals.css";
import { getDict, htmlLang, isLocale, locales, type Locale } from "@/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareBar } from "@/components/catalog/compare-bar";
import { LocaleProvider } from "@/i18n/context";

/** Заголовки, цены, слово в логотипе. Полная кириллица, включая ґ є і ї. */
const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["600", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

/** Весь остальной текст. */
const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-golos",
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
    icons: {
      icon: [
        { url: "/brand/logo.svg", type: "image/svg+xml" },
        { url: "/brand/mark-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/brand/apple-touch-icon.png",
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: "/brand/og-base.png", width: 1200, height: 630 }],
    },
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
      className={`${unbounded.variable} ${golos.variable}`}
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
