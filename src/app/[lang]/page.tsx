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
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide text-brass">
        {dict.landing.tagline}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-semibold leading-tight text-bottle sm:text-5xl">
        {dict.common.siteName}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
        {dict.landing.description}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/${lang}/register`}
          className="rounded-sm bg-bottle px-6 py-3 text-base font-medium text-parchment transition-colors hover:bg-bottle-light"
        >
          {dict.landing.cta}
        </Link>
        <Link
          href={`/${lang}/login`}
          className="text-base font-medium text-bottle underline decoration-brass decoration-2 underline-offset-4 hover:text-bottle-light"
        >
          {dict.landing.loginCta}
        </Link>
      </div>
    </div>
  );
}
