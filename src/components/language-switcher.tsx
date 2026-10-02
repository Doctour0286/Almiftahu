"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchTo(locale: Locale) {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/") || "/");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink"
      >
        <span aria-hidden className="text-xs">
          🌐
        </span>
        {localeNames[current]}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <path
            d="M1 3L5 7L9 3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="enter absolute end-0 top-full z-20 mt-2 min-w-[9rem] overflow-hidden rounded-sm border border-line bg-white shadow-lg"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              role="option"
              aria-selected={locale === current}
              onClick={() => switchTo(locale)}
              className="row-interactive block w-full px-4 py-2.5 text-start text-sm font-medium text-ink"
              style={
                locale === current
                  ? { color: "var(--color-bottle)", fontWeight: 600 }
                  : undefined
              }
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
