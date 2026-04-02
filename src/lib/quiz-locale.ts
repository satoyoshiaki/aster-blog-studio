import { supportedLocales, type SupportedLocale } from "@/lib/quiz-types";

const supportedLocaleSet = new Set<string>(supportedLocales);

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return typeof value === "string" && supportedLocaleSet.has(value);
}

export function getLocaleFromSearchParam(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return isSupportedLocale(value) ? value : null;
}

export function normalizeBrowserLocale(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const exactMatch = supportedLocales.find((locale) => locale.toLowerCase() === value.toLowerCase());

  if (exactMatch) {
    return exactMatch;
  }

  const baseLanguage = value.split("-")[0]?.toLowerCase();

  if (baseLanguage === "zh") {
    return "zh-CN";
  }

  return supportedLocales.find((locale) => locale.toLowerCase().startsWith(baseLanguage)) ?? null;
}

export function detectPreferredLocale({
  searchParam,
  storedLocale,
  browserLanguage,
  fallback = "ja",
}: {
  searchParam?: string | null;
  storedLocale?: string | null;
  browserLanguage?: string | null;
  fallback?: SupportedLocale;
}) {
  return (
    getLocaleFromSearchParam(searchParam) ??
    getLocaleFromSearchParam(storedLocale) ??
    normalizeBrowserLocale(browserLanguage) ??
    fallback
  );
}
