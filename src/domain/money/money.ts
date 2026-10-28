import type { CurrencyCode } from './currency';

/** An exact amount of money in integer minor units (cents, or whole yen). */
export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

export function money(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError(`Money amounts must be safe integers, got ${amountMinor}.`);
  }
  // `+ 0` normalizes -0 to 0 so equality checks never trip on negative zero.
  return Object.freeze({ amountMinor: amountMinor + 0, currency });
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new TypeError(`Cannot add ${a.currency} and ${b.currency} without converting first.`);
  }
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function sumMoney(values: readonly Money[], currency: CurrencyCode): Money {
  return values.reduce(addMoney, money(0, currency));
}

export function negateMoney(value: Money): Money {
  return money(-value.amountMinor, value.currency);
}
