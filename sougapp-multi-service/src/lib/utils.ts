import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount in Mauritanian Ouguiya (MRU).
 * Compact form (e.g. "1,2 M") for large figures on tiles, full form otherwise.
 */
export function formatMRU(
  amount: number,
  locale = "fr",
  opts: { compact?: boolean } = {},
) {
  const intlLocale =
    locale === "ar" ? "ar-MR" : locale === "en" ? "en-US" : "fr-FR";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "MRU",
    maximumFractionDigits: opts.compact ? 1 : 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(amount);
}

/** Format a plain integer with locale-aware grouping. */
export function formatNumber(value: number, locale = "fr") {
  const intlLocale =
    locale === "ar" ? "ar-MR" : locale === "en" ? "en-US" : "fr-FR";
  return new Intl.NumberFormat(intlLocale).format(value);
}

/** Signed percentage delta, e.g. "+12,4 %". */
export function formatDelta(value: number, locale = "fr") {
  const intlLocale =
    locale === "ar" ? "ar-MR" : locale === "en" ? "en-US" : "fr-FR";
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "always",
  }).format(value / 100);
}
