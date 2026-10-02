import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="enter font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide text-brass">
        {dict.landing.tagline}
      </p>
      <h1 className="enter enter-stagger-1 mt-4 text-balance font-[family-name:var(--font-heading)] text-4xl font-semibold leading-tight text-bottle sm:text-5xl">
        {dict.common.siteName}
      </h1>
      <p className="enter enter-stagger-2 mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
        {dict.landing.description}
      </p>
      <div className="enter enter-stagger-3 mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link href={`/${lang}/register`} className="btn btn-primary text-base">
          {dict.landing.cta}
        </Link>
        <Link
          href={`/${lang}/login`}
          className="link-accent text-base font-medium"
        >
          {dict.landing.loginCta}
        </Link>
      </div>
    </div>
  );
}
