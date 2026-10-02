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
    <header className="sticky top-0 z-30 border-b border-line bg-parchment/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={`/${lang}`}
          className="btn shrink-0 rounded-sm px-1.5 py-1"
          aria-label={dict.common.siteName}
        >
          {/* Compact mark on small screens: a circular initial only, so it
              never competes for space with nav controls. The full name
              only appears once there's room for it. */}
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bottle font-[family-name:var(--font-heading)] text-sm font-semibold text-parchment"
          >
            م
          </span>
          <span className="hidden font-[family-name:var(--font-heading)] text-base font-semibold text-bottle sm:inline">
            {dict.common.siteName}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher current={lang} />

          {isAuthed ? (
            <Link
              href={`/${lang}/dashboard`}
              className="btn btn-secondary text-sm"
            >
              {dict.nav.dashboard}
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`/${lang}/login`}
                className="btn px-3 py-1.5 text-sm font-medium text-ink"
              >
                {dict.nav.login}
              </Link>
              <Link
                href={`/${lang}/register`}
                className="btn btn-primary px-4 py-1.5 text-sm"
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
