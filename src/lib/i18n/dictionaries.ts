import "server-only";
import { notFound } from "next/navigation";
import { type Locale, isLocale } from "./config";

const dictionaries = {
  ha: () => import("@/dictionaries/ha.json").then((m) => m.default),
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ha"]>>;

export async function getDictionary(locale: string): Promise<Dictionary> {
  if (!isLocale(locale)) notFound();
  return dictionaries[locale]();
}

export type { Locale };
