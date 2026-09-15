import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims);

  return (
    <header className="border-b border-line bg-parchment">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={`/${lang}`}
          className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bottle"
        >
          {dict.common.siteName}
        </Link>

        <div className="flex items-center gap-6">
          <LanguageSwitcher current={lang} />
          {isAuthed ? (
            <Link
              href={`/${lang}/dashboard`}
              className="text-sm font-medium text-bottle hover:text-bottle-light transition-colors"
            >
              {dict.nav.dashboard}
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/login`}
                className="text-sm font-medium text-ink hover:text-bottle transition-colors"
              >
                {dict.nav.login}
              </Link>
              <Link
                href={`/${lang}/register`}
                className="rounded-sm bg-bottle px-4 py-2 text-sm font-medium text-parchment hover:bg-bottle-light transition-colors"
              >
                {dict.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
