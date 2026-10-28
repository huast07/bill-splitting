import { describe, expect, it } from 'vitest';

import { CURRENCIES, DEFAULT_CURRENCY, getCurrency, isCurrencyCode } from './currency';

describe('currency table', () => {
  it('defaults to CAD', () => {
    expect(DEFAULT_CURRENCY).toBe('CAD');
  });

  it('knows zero-decimal currencies', () => {
    expect(getCurrency('JPY').minorUnitDigits).toBe(0);
    expect(getCurrency('KRW').minorUnitDigits).toBe(0);
  });

  it('uses two decimals for CAD, USD and EUR', () => {
    expect(getCurrency('CAD').minorUnitDigits).toBe(2);
    expect(getCurrency('USD').minorUnitDigits).toBe(2);
    expect(getCurrency('EUR').minorUnitDigits).toBe(2);
  });

  it('lists CAD first so it leads currency pickers', () => {
    expect(CURRENCIES[0].code).toBe('CAD');
  });

  it('has unique codes', () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('recognises supported codes only', () => {
    expect(isCurrencyCode('USD')).toBe(true);
    expect(isCurrencyCode('usd')).toBe(false);
    expect(isCurrencyCode('XYZ')).toBe(false);
  });
});
