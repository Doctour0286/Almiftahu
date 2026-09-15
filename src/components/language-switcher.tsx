"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(locale: Locale) {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/") || "/");
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-current={locale === current}
          className={
            locale === current
              ? "font-semibold text-bottle"
              : "text-ink/60 hover:text-ink transition-colors"
          }
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
