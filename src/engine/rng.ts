/**
 * Minecraft Java Edition RNG engine
 * Implements the LCG (Linear Congruential Generator) used for enchantments
 *
 * The player's XP seed is a 32-bit integer.
 * The XP seed is: (int)(playerSeed >>> 17)
 *
 * For the enchanting table:
 * - The XP seed determines what enchantments show up
 * - The player seed (48-bit) controls item throw RNG
 * - Each thrown item advances player RNG by exactly 4 steps
 */

// Java Random LCG constants
const MULTIPLIER = BigInt('0x5DEECE66D');
const ADDEND = BigInt(0xB);
export const MASK = (BigInt(1) << BigInt(48)) - BigInt(1);

export class JavaRandom {
  private seed: bigint;

  constructor(seed: bigint) {
    this.seed = (seed ^ MULTIPLIER) & MASK;
  }

  static fromRawSeed(seed: bigint): JavaRandom {
    const r = new JavaRandom(BigInt(0));
    r.seed = seed & MASK;
    return r;
  }

  next(bits: number): number {
    this.seed = (this.seed * MULTIPLIER + ADDEND) & MASK;
    return Number(this.seed >> BigInt(48 - bits));
  }

  nextInt(bound?: number): number {
    if (bound === undefined) {
      return this.next(32);
    }
    if (bound <= 1) return 0;
    if ((bound & (bound - 1)) === 0) {
      return Math.floor((bound * this.next(31)) / 2147483648);
    }
    let bits: number, val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }

  nextFloat(): number {
    return this.next(24) / (1 << 24);
  }

  getSeed(): bigint {
    return this.seed;
  }

  clone(): JavaRandom {
    return JavaRandom.fromRawSeed(this.seed);
  }

  advance(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.seed = (this.seed * MULTIPLIER + ADDEND) & MASK;
    }
  }
}

export function makeEnchantRng(xpSeed: number): JavaRandom {
  return new JavaRandom(BigInt(xpSeed >>> 0));
}

/**
 * Calculate the three slot levels shown on the enchanting table.
 * b = number of bookshelves (capped at 15)
 * Returns [top, middle, bottom] slot levels
 */
export function calcSlotLevels(rng: JavaRandom, bookshelves: number): [number, number, number] {
  const b = Math.min(bookshelves, 15);
  const r1Raw = rng.nextInt(8);
  const r2 = rng.nextInt(b + 1);
  const base = (r1Raw + 1) + Math.floor(b / 2) + r2;

  const top = Math.max(Math.floor(base / 3), 1);
  const mid = Math.floor((base * 2) / 3) + 1;
  const bot = Math.max(base, b * 2);

  return [top, mid, bot];
}

export interface TableReading {
  bookshelves: number;
  topLevel: number;
  midLevel: number;
  botLevel: number;
}

/**
 * Verify that a given XP seed produces the observed table reading.
 */
export function verifyReading(xpSeed: number, reading: TableReading): boolean {
  const b = Math.min(reading.bookshelves, 15);
  const rng = makeEnchantRng(xpSeed);
  const r1Raw = rng.nextInt(8);
  const r2 = rng.nextInt(b + 1);
  const base = (r1Raw + 1) + Math.floor(b / 2) + r2;
  const top = Math.max(Math.floor(base / 3), 1);
  const mid = Math.floor((base * 2) / 3) + 1;
  const bot = Math.max(base, b * 2);
  return top === reading.topLevel && mid === reading.midLevel && bot === reading.botLevel;
}

/**
 * Find valid base values consistent with observed slot levels and bookshelf count.
 */
export function getValidBases(reading: TableReading): number[] {
  const b = Math.min(reading.bookshelves, 15);
  const result: number[] = [];
  for (let base = 1; base <= 45; base++) {
    const calcTop = Math.max(Math.floor(base / 3), 1);
    const calcMid = Math.floor((base * 2) / 3) + 1;
    const calcBot = Math.max(base, b * 2);
    if (calcTop === reading.topLevel && calcMid === reading.midLevel && calcBot === reading.botLevel) {
      result.push(base);
    }
  }
  return result;
}

/**
 * Crack the XP seed given multiple table readings.
 * Runs asynchronously in chunks to avoid blocking the UI.
 * Returns null if no unique seed found.
 */
export async function crackSeedFromReadings(
  readings: TableReading[],
  onProgress: (pct: number) => void
): Promise<number[]> {
  if (readings.length === 0) return [];

  const first = readings[0];
  const b0 = Math.min(first.bookshelves, 15);
  const validBases = getValidBases(first);
  const floorHalfB0 = Math.floor(b0 / 2);

  // Collect (r1Raw, r2) pairs from first reading
  const pairs: Array<{ r1Raw: number; r2: number }> = [];
  for (const base of validBases) {
    const needed = base - floorHalfB0;
    for (let r1Raw = 0; r1Raw < 8; r1Raw++) {
      const r1 = r1Raw + 1;
      const r2 = needed - r1;
      if (r2 < 0 || r2 > b0) continue;
      pairs.push({ r1Raw, r2 });
    }
  }

  const candidates: number[] = [];
  const TOTAL = 0x100000000; // 4 billion
  const CHUNK = 500000;
  let processed = 0;

  for (let xpSeed = 0; xpSeed < TOTAL; xpSeed++) {
    // Check first reading quickly (inlined for speed)
    const rng = makeEnchantRng(xpSeed);
    const got1 = rng.nextInt(8);
    const got2 = rng.nextInt(b0 + 1);

    let firstMatch = false;
    for (const { r1Raw, r2 } of pairs) {
      if (got1 === r1Raw && got2 === r2) {
        firstMatch = true;
        break;
      }
    }

    if (firstMatch) {
      // Verify against additional readings
      let allMatch = true;
      for (let ri = 1; ri < readings.length; ri++) {
        if (!verifyReading(xpSeed, readings[ri])) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        candidates.push(xpSeed);
        if (candidates.length > 100) break; // Too many, need more readings
      }
    }

    processed++;
    if (processed % CHUNK === 0) {
      onProgress(Math.floor((processed / TOTAL) * 100));
      await new Promise(r => setTimeout(r, 0)); // yield to UI
    }
  }

  onProgress(100);
  return candidates;
}

/**
 * Calculate enchantment cost (modified enchantment level) from slot level and enchantability.
 */
export function calcEnchantmentCost(
  rng: JavaRandom,
  slotLevel: number,
  enchantability: number
): number {
  const r1 = rng.nextInt(Math.floor(enchantability / 4) + 1);
  const r2 = rng.nextInt(Math.floor(enchantability / 4) + 1);
  let cost = slotLevel + r1 + r2 + 1;

  const f1 = rng.nextFloat();
  const f2 = rng.nextFloat();
  const bonus = 1.0 + (f1 + f2 - 1.0) * 0.15;
  cost = Math.round(cost * bonus);
  if (cost < 1) cost = 1;
  return cost;
}

/**
 * Advance player RNG by n item throws (each throw = 4 RNG steps).
 */
export function advanceByThrows(playerSeed: bigint, throws: number): bigint {
  const rng = JavaRandom.fromRawSeed(playerSeed);
  rng.advance(throws * 4);
  return rng.getSeed();
}

/**
 * Get XP seed from 48-bit player seed.
 */
export function playerSeedToXpSeed(playerSeed: bigint): number {
  const shifted = playerSeed >> BigInt(17);
  const val = Number(shifted & BigInt(0xFFFFFFFF));
  return val > 0x7FFFFFFF ? val - 0x100000000 : val;
}
