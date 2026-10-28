import { getCurrency, type CurrencyCode } from './currency';

export const DEFAULT_LOCALE = 'en-CA';

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: CurrencyCode, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  const cached = formatters.get(key);
  if (cached) return cached;
  const digits = getCurrency(currency).minorUnitDigits;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  formatters.set(key, formatter);
  return formatter;
}

/** Formats integer minor units for display, e.g. 123456 CAD -> "$1,234.56". */
export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode,
  locale: string = DEFAULT_LOCALE,
): string {
  const digits = getCurrency(currency).minorUnitDigits;
  return formatterFor(currency, locale).format(amountMinor / 10 ** digits);
}
