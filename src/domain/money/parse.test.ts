import { describe, expect, it } from 'vitest';

import { parseAmount, toMajorString } from './parse';

describe('parseAmount', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['0.07', 7],
    ['.5', 50],
    ['$12.50', 1250],
    [' 1,234.56 ', 123456],
    ['1 234.56', 123456],
    ['12,50', 1250],
    ['0', 0],
  ])('parses %j as %i cents in CAD', (input, expected) => {
    expect(parseAmount(input, 'CAD')).toEqual({ ok: true, value: expected });
  });

  it('parses whole yen', () => {
    expect(parseAmount('1,000', 'JPY')).toEqual({ ok: true, value: 1000 });
  });

  it('rejects decimals for zero-decimal currencies', () => {
    expect(parseAmount('10.5', 'JPY')).toEqual({ ok: false, error: 'JPY has no decimal places.' });
  });

  it('rejects more decimals than the currency allows', () => {
    expect(parseAmount('1.234', 'CAD')).toEqual({
      ok: false,
      error: 'Use at most 2 decimal places.',
    });
  });

  it.each(['', '   ', 'abc', '12.3.4', '-5', '1e5', '$', '1,2,3', '12,34.5'])(
    'rejects %j',
    (input) => {
      const result = parseAmount(input, 'CAD');
      expect(result.ok).toBe(false);
    },
  );

  it('rejects amounts beyond the safe range', () => {
    expect(parseAmount('999999999999999', 'CAD')).toEqual({
      ok: false,
      error: 'That amount is too large.',
    });
  });
});

describe('toMajorString', () => {
  it.each([
    [1250, 'CAD', '12.50'],
    [7, 'CAD', '0.07'],
    [-1250, 'CAD', '-12.50'],
    [1000, 'JPY', '1000'],
    [0, 'USD', '0.00'],
  ] as const)('formats %i %s as %j', (minor, currency, expected) => {
    expect(toMajorString(minor, currency)).toBe(expected);
  });
});
