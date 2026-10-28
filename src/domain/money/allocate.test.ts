import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { allocate, allocateEqually } from './allocate';

describe('allocate', () => {
  it('splits 100.00 three ways as 33.34, 33.33, 33.33', () => {
    expect(allocate(10000, [1, 1, 1])).toEqual([3334, 3333, 3333]);
  });

  it('gives tied leftover cents to the priority index first', () => {
    expect(allocate(10000, [1, 1, 1], { priority: [2] })).toEqual([3333, 3333, 3334]);
  });

  it('uses priority order for every leftover cent before falling back to index order', () => {
    expect(allocate(200, [1, 1, 1], { priority: [2, 1] })).toEqual([66, 67, 67]);
  });

  it('gives leftover cents to the largest remainders before priority', () => {
    // 1000 * [1, 2] / 3 = [333.33, 666.67]: the leftover cent goes to index 1.
    expect(allocate(1000, [1, 2], { priority: [0] })).toEqual([333, 667]);
  });

  it('splits by weighted shares', () => {
    expect(allocate(5000, [2, 3])).toEqual([2000, 3000]);
  });

  it('allocates proportionally to large minor-unit weights', () => {
    expect(allocate(520, [3500, 2500])).toEqual([303, 217]);
  });

  it('gives zero to zero-weight entries', () => {
    expect(allocate(1000, [0, 1, 0, 1])).toEqual([0, 500, 0, 500]);
  });

  it('allocates negative totals symmetrically', () => {
    expect(allocate(-10000, [1, 1, 1])).toEqual([-3334, -3333, -3333]);
  });

  it('returns all zeros for a zero total', () => {
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
  });

  it('rejects an empty weight list', () => {
    expect(() => allocate(100, [])).toThrow('at least one weight');
  });

  it('rejects weights that sum to zero', () => {
    expect(() => allocate(100, [0, 0])).toThrow('positive');
  });

  it('rejects negative or fractional weights', () => {
    expect(() => allocate(100, [1, -1])).toThrow('non-negative integers');
    expect(() => allocate(100, [1.5, 1])).toThrow('non-negative integers');
  });

  it('rejects a non-integer total', () => {
    expect(() => allocate(10.5, [1])).toThrow('integer');
  });

  it('rejects out-of-range priority indexes', () => {
    expect(() => allocate(100, [1, 1], { priority: [5] })).toThrow('priority');
  });

  it('always sums exactly to the total and never deviates more than one unit from the exact share', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10_000_000, max: 10_000_000 }),
        fc.array(fc.integer({ min: 0, max: 100_000 }), { minLength: 1, maxLength: 30 }),
        (total, weights) => {
          fc.pre(weights.some((w) => w > 0));
          const shares = allocate(total, weights);
          const weightSum = weights.reduce((a, b) => a + b, 0);
          expect(shares.reduce((a, b) => a + b, 0)).toBe(total);
          shares.forEach((share, i) => {
            const exact = (total * weights[i]) / weightSum;
            expect(Math.abs(share - exact)).toBeLessThan(1 + 1e-9);
          });
        },
      ),
    );
  });
});

describe('allocateEqually', () => {
  it('splits 1000 JPY three ways as 334, 333, 333', () => {
    expect(allocateEqually(1000, 3)).toEqual([334, 333, 333]);
  });

  it('honours the priority option', () => {
    expect(allocateEqually(100, 3, { priority: [1] })).toEqual([33, 34, 33]);
  });

  it('rejects a non-positive count', () => {
    expect(() => allocateEqually(100, 0)).toThrow('at least one');
  });
});
