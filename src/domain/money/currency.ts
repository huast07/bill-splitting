export interface CurrencyInfo {
  readonly code: string;
  readonly name: string;
  /** Number of decimal places in the currency's minor unit (cents = 2). */
  readonly minorUnitDigits: number;
}

/** Supported currencies, CAD first. All are covered by the Frankfurter rate API. */
export const CURRENCIES = [
  { code: 'CAD', name: 'Canadian Dollar', minorUnitDigits: 2 },
  { code: 'USD', name: 'US Dollar', minorUnitDigits: 2 },
  { code: 'EUR', name: 'Euro', minorUnitDigits: 2 },
  { code: 'GBP', name: 'British Pound', minorUnitDigits: 2 },
  { code: 'MXN', name: 'Mexican Peso', minorUnitDigits: 2 },
  { code: 'JPY', name: 'Japanese Yen', minorUnitDigits: 0 },
  { code: 'KRW', name: 'South Korean Won', minorUnitDigits: 0 },
  { code: 'CNY', name: 'Chinese Yuan', minorUnitDigits: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', minorUnitDigits: 2 },
  { code: 'SGD', name: 'Singapore Dollar', minorUnitDigits: 2 },
  { code: 'THB', name: 'Thai Baht', minorUnitDigits: 2 },
  { code: 'INR', name: 'Indian Rupee', minorUnitDigits: 2 },
  { code: 'AUD', name: 'Australian Dollar', minorUnitDigits: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', minorUnitDigits: 2 },
  { code: 'CHF', name: 'Swiss Franc', minorUnitDigits: 2 },
  { code: 'SEK', name: 'Swedish Krona', minorUnitDigits: 2 },
  { code: 'NOK', name: 'Norwegian Krone', minorUnitDigits: 2 },
  { code: 'DKK', name: 'Danish Krone', minorUnitDigits: 2 },
  { code: 'BRL', name: 'Brazilian Real', minorUnitDigits: 2 },
  { code: 'ZAR', name: 'South African Rand', minorUnitDigits: 2 },
] as const satisfies readonly CurrencyInfo[];

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY: CurrencyCode = 'CAD';

const BY_CODE: ReadonlyMap<string, CurrencyInfo> = new Map(CURRENCIES.map((c) => [c.code, c]));

export function isCurrencyCode(value: string): value is CurrencyCode {
  return BY_CODE.has(value);
}

export function getCurrency(code: CurrencyCode): CurrencyInfo {
  // Every CurrencyCode is in the table by construction.
  return BY_CODE.get(code)!;
}
