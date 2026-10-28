import { err, ok, type Result } from '../result';

import { getCurrency, type CurrencyCode } from './currency';

const INVALID = 'Enter a valid amount.';
const TOO_LARGE = 'That amount is too large.';
const LEADING_SYMBOLS = /^[^\d.,-]+/;
const DECIMAL_COMMA = /^\d+,\d{1,2}$/;
const GROUPED_COMMAS = /^\d{1,3}(,\d{3})+(\.\d*)?$/;
const PLAIN_NUMBER = /^(\d*)(?:\.(\d*))?$/;

/**
 * Parses user-typed money ("$1,234.56", "12,50", "1 000") into integer minor
 * units for `currency`. Negative numbers and exponents are rejected.
 */
export function parseAmount(input: string, currency: CurrencyCode): Result<number> {
  const normalized = normalizeSeparators(
    input.trim().replace(LEADING_SYMBOLS, '').replace(/\s/g, ''),
  );
  const match = normalized === null ? null : PLAIN_NUMBER.exec(normalized);
  if (!match) return err(INVALID);

  const [, whole = '', fraction = ''] = match;
  if (whole === '' && fraction === '') return err(INVALID);

  const digits = getCurrency(currency).minorUnitDigits;
  if (fraction.length > digits) {
    return err(
      digits === 0 ? `${currency} has no decimal places.` : `Use at most ${digits} decimal places.`,
    );
  }

  const minor =
    BigInt(whole || '0') * 10n ** BigInt(digits) + BigInt(fraction.padEnd(digits, '0') || '0');
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) return err(TOO_LARGE);
  return ok(Number(minor));
}

/** Formats minor units as a plain decimal string for editable inputs ("12.50"). */
export function toMajorString(amountMinor: number, currency: CurrencyCode): string {
  const digits = getCurrency(currency).minorUnitDigits;
  const sign = amountMinor < 0 ? '-' : '';
  const padded = Math.abs(amountMinor)
    .toString()
    .padStart(digits + 1, '0');
  if (digits === 0) return sign + padded;
  return `${sign}${padded.slice(0, -digits)}.${padded.slice(-digits)}`;
}

/** Rewrites comma decimals and comma grouping into a plain "1234.56" form. */
function normalizeSeparators(value: string): string | null {
  if (!value.includes(',')) return value;
  if (DECIMAL_COMMA.test(value)) return value.replace(',', '.');
  if (GROUPED_COMMAS.test(value)) return value.replace(/,/g, '');
  return null;
}
