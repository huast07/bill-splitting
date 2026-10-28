import { describe, expect, it } from 'vitest';

import { addMoney, money, negateMoney, sumMoney } from './money';

describe('money', () => {
  it('creates an immutable value', () => {
    const m = money(1250, 'CAD');
    expect(m).toEqual({ amountMinor: 1250, currency: 'CAD' });
    expect(Object.isFrozen(m)).toBe(true);
  });

  it('rejects non-integer amounts', () => {
    expect(() => money(12.5, 'CAD')).toThrow('integer');
  });

  it('adds amounts in the same currency', () => {
    expect(addMoney(money(100, 'CAD'), money(250, 'CAD'))).toEqual(money(350, 'CAD'));
  });

  it('refuses to add different currencies', () => {
    expect(() => addMoney(money(100, 'CAD'), money(100, 'USD'))).toThrow('CAD and USD');
  });

  it('sums a list, returning zero for an empty list', () => {
    expect(sumMoney([money(1, 'EUR'), money(2, 'EUR')], 'EUR')).toEqual(money(3, 'EUR'));
    expect(sumMoney([], 'EUR')).toEqual(money(0, 'EUR'));
  });

  it('negates without producing negative zero', () => {
    expect(negateMoney(money(5, 'CAD'))).toEqual(money(-5, 'CAD'));
    expect(Object.is(negateMoney(money(0, 'CAD')).amountMinor, 0)).toBe(true);
  });
});
