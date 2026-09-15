import type { Metadata } from "next";
import { Lora, Inter, Amiri, Noto_Naskh_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, localeDirections } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SiteHeader } from "@/components/site-header";

const heading = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const arabicHeading = Amiri({
  variable: "--font-arabic-heading",
  subsets: ["arabic"],
  weight: ["700"],
});

const arabicBody = Noto_Naskh_Arabic({
  variable: "--font-arabic-body",
  subsets: ["arabic"],
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.common.siteName,
    description: dict.landing.description,
  };
}

export function generateStaticParams() {
  return [{ lang: "ha" }, { lang: "ar" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const dir = localeDirections[lang];

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${heading.variable} ${body.variable} ${arabicHeading.variable} ${arabicBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        <SiteHeader lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
