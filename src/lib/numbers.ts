const DEFAULT_LOCALE = "en-OM";

/**
 * Formats numeric values with a consistent locale so that SSR and CSR
 * renders stay in sync (avoids hydration mismatches from user locale drift).
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE,
) {
  return new Intl.NumberFormat(locale, options).format(value);
}

