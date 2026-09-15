export const locales = ["ha", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ha";

export const localeNames: Record<Locale, string> = {
  ha: "Hausa",
  ar: "العربية",
  en: "English",
};

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  ha: "ltr",
  ar: "rtl",
  en: "ltr",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
