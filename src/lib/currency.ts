const DISPLAY_CURRENCY_CODE = "OMR";
const DISPLAY_LOCALE = "en-OM";
const SOURCE_DEFAULT = "INR";

const ENV_RATE = Number(process.env.NEXT_PUBLIC_INR_TO_OMR_RATE ?? "0.0048");
const INR_TO_OMR_RATE = Number.isFinite(ENV_RATE) && ENV_RATE > 0 ? ENV_RATE : 0.0048;

const baseFormatter = new Intl.NumberFormat(DISPLAY_LOCALE, {
  style: "currency",
  currency: DISPLAY_CURRENCY_CODE,
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export const displayCurrencyCode = DISPLAY_CURRENCY_CODE;
export const displayCurrencyLocale = DISPLAY_LOCALE;

export const convertAmountToDisplayCurrency = (value: number, currency: string = SOURCE_DEFAULT): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  // Display exact value from database in OMR (no conversion)
  // If currency is already OMR, return as is
  if (currency === DISPLAY_CURRENCY_CODE) {
    return value;
  }

  // For INR or any other currency, return the same value (no conversion)
  // This displays the exact database price in OMR format
  return value;
};

export const formatDisplayCurrency = (
  value: number,
  currency: string = SOURCE_DEFAULT,
  options?: Intl.NumberFormatOptions,
) => {
  const converted = convertAmountToDisplayCurrency(value, currency);
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: DISPLAY_CURRENCY_CODE,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    ...options,
  }).format(converted);
};

export const formatCompactCurrency = (value: number, currency: string = SOURCE_DEFAULT) => {
  const converted = convertAmountToDisplayCurrency(value, currency);
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: DISPLAY_CURRENCY_CODE,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(converted);
};

