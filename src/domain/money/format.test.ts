import { describe, expect, it } from 'vitest';

import { formatMoney } from './format';

describe('formatMoney', () => {
  it('formats CAD with a plain dollar sign in en-CA', () => {
    expect(formatMoney(123456, 'CAD')).toBe('$1,234.56');
  });

  it('disambiguates USD in en-CA', () => {
    expect(formatMoney(1250, 'USD')).toBe('US$12.50');
  });

  it('formats zero-decimal currencies without decimals, distinguishing yen from yuan', () => {
    expect(formatMoney(1000, 'JPY')).toBe('JP¥1,000');
    expect(formatMoney(1000, 'CNY')).toBe('CN¥10.00');
  });

  it('formats negative amounts', () => {
    expect(formatMoney(-250, 'CAD')).toBe('-$2.50');
  });

  it('accepts another locale', () => {
    expect(formatMoney(1250, 'EUR', 'fr-CA')).toBe('12,50 €');
  });
});
