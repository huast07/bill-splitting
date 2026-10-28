export interface AllocateOptions {
  /**
   * Indexes that win ties for leftover units, in order. Remaining ties fall
   * back to index order. Pass the payer first so the payer absorbs rounding.
   */
  readonly priority?: readonly number[];
}

/**
 * Splits an integer total into integer shares proportional to `weights` using
 * the largest remainder method. Shares always sum exactly to `total`, and each
 * share differs from its exact proportional value by less than one unit.
 */
export function allocate(
  total: number,
  weights: readonly number[],
  options: AllocateOptions = {},
): number[] {
  assertAllocatable(total, weights, options.priority ?? []);

  if (total < 0) {
    return allocate(-total, weights, options).map((share) => (share === 0 ? 0 : -share));
  }

  const bigTotal = BigInt(total);
  const bigWeights = weights.map(BigInt);
  const weightSum = bigWeights.reduce((a, b) => a + b, 0n);

  const floors = bigWeights.map((w) => (bigTotal * w) / weightSum);
  const remainders = bigWeights.map((w) => (bigTotal * w) % weightSum);
  const leftover = Number(bigTotal - floors.reduce((a, b) => a + b, 0n));

  const rank = tieBreakRank(weights.length, options.priority ?? []);
  const winners = new Set(
    weights
      .map((_, i) => i)
      .sort((a, b) => compareBigDesc(remainders[a], remainders[b]) || rank[a] - rank[b])
      .slice(0, leftover),
  );

  return floors.map((floor, i) => Number(floor) + (winners.has(i) ? 1 : 0));
}

/** Splits an integer total into `count` near-equal integer shares. */
export function allocateEqually(
  total: number,
  count: number,
  options: AllocateOptions = {},
): number[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('allocateEqually needs at least one share.');
  }
  return allocate(
    total,
    Array.from({ length: count }, () => 1),
    options,
  );
}

function assertAllocatable(
  total: number,
  weights: readonly number[],
  priority: readonly number[],
): void {
  if (!Number.isSafeInteger(total)) {
    throw new RangeError(`Total must be a safe integer, got ${total}.`);
  }
  if (weights.length === 0) {
    throw new RangeError('allocate needs at least one weight.');
  }
  if (!weights.every((w) => Number.isSafeInteger(w) && w >= 0)) {
    throw new RangeError('Weights must be non-negative integers.');
  }
  if (!weights.some((w) => w > 0)) {
    throw new RangeError('At least one weight must be positive.');
  }
  if (!priority.every((i) => Number.isInteger(i) && i >= 0 && i < weights.length)) {
    throw new RangeError('Every priority index must point at a weight.');
  }
}

/** Lower rank wins ties: priority indexes first, then everything else by index. */
function tieBreakRank(length: number, priority: readonly number[]): number[] {
  const order = [...new Set(priority)];
  const rest = Array.from({ length }, (_, i) => i).filter((i) => !order.includes(i));
  const rank = new Array<number>(length);
  [...order, ...rest].forEach((index, position) => {
    rank[index] = position;
  });
  return rank;
}

function compareBigDesc(a: bigint, b: bigint): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}
