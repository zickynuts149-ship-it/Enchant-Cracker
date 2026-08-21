/**
 * Minecraft Enchantment Seed Engine
 * 
 * Based on Minecraft Java Edition enchanting mechanics:
 * - Each player has a hidden XP seed (32-bit stored as XpSeed in player data)
 * - The XP seed determines all enchantments shown by the table
 * - Throwing an item advances the player RNG by exactly 4 steps
 * - Enchanting draws the next value as the new XP seed
 * 
 * This engine simulates:
 * 1. Finding the XP seed from observed enchantment levels
 * 2. Computing what enchantments a given seed produces
 * 3. Finding how many throws are needed to reach a target enchantment
 */

import {
  ALL_ENCHANTMENTS,
  ENCHANTABLE_ITEMS,
  type Enchantment,
} from '../data/enchantments';

// ─── Java Random LCG ────────────────────────────────────────────────────────

const MULT = BigInt('25214903917');
const ADD = BigInt(11);
const MASK = (BigInt(1) << BigInt(48)) - BigInt(1);

function lcgStep(s: bigint): bigint {
  return (s * MULT + ADD) & MASK;
}

function lcgStepN(s: bigint, n: number): bigint {
  let r = s;
  for (let i = 0; i < n; i++) r = lcgStep(r);
  return r;
}

/** Extract nextInt(bound+1) style value – returns 0..bound inclusive */
function nextBounded(s: bigint, bound: number): { val: number; s: bigint } {
  const ns = lcgStep(s);
  // Minecraft uses: (int)(seed >>> 17) & mask, but for slot levels it uses
  // a simpler modulo. The exact formula uses the upper 31 bits.
  const raw = Number((ns >> BigInt(17)) & BigInt(0x7fffffff));
  const val = bound > 0 ? raw % (bound + 1) : 0;
  return { val, s: ns };
}

// ─── XP Seed → slot levels ───────────────────────────────────────────────────

/**
 * Given an xpSeed (the 32-bit value stored in XpSeed NBT),
 * compute what the 3 slot levels look like with `bookshelves` bookshelves.
 * 
 * Returns [topSlot, middleSlot, bottomSlot] shown in the UI.
 */
export function slotLevels(
  xpSeed: number,
  bookshelves: number
): [number, number, number] {
  const b = Math.min(15, bookshelves);
  // Minecraft seeds a new Random with xpSeed ^ 0x5DEECE66DL
  let s = (BigInt(xpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & MASK;

  function base(): { xb: number; s: bigint } {
    const r1 = nextBounded(s, 7);
    const r2 = nextBounded(r1.s, b === 0 ? 0 : b);
    const xb = 1 + r1.val + Math.floor(b / 2) + r2.val;
    s = r2.s;
    return { xb, s };
  }

  const slot1 = base();
  s = slot1.s;
  const top = Math.max(1, Math.floor(slot1.xb / 3));

  const slot2 = base();
  s = slot2.s;
  const mid = Math.floor((2 * slot2.xb) / 3) + 1;

  const slot3 = base();
  const bot = Math.max(slot3.xb, 2 * b);

  return [top, mid, bot];
}

// ─── Enchantment selection simulation ────────────────────────────────────────

export interface EnchantResult {
  id: string;
  name: string;
  level: number;
}

/**
 * Simulate the enchantment selection for a given item at a given slot level.
 * Uses a seeded java.util.Random derived from the xpSeed.
 * Returns the list of enchantments that would be applied.
 * 
 * Note: The *exact* seed used for enchantment selection is a separate Random
 * seeded from xpSeed for each slot. We simulate this deterministically.
 */
export function simulateEnchantments(
  xpSeed: number,
  itemId: string,
  slotIndex: 0 | 1 | 2,
  bookshelves: number
): EnchantResult[] {
  const item = ENCHANTABLE_ITEMS.find((i) => i.id === itemId);
  if (!item) return [];

  const levels = slotLevels(xpSeed, bookshelves);
  const xpCost = levels[slotIndex];
  const enchantability = item.enchantability;

  // Seed the Random for enchantment selection:
  // Minecraft uses: new Random(xpSeed + slotIndex + worldSeed) but since we
  // don't know worldSeed, we simulate using xpSeed directly.
  // The game actually uses the xpSeed-based Random that was already advanced.
  // We'll approximate: seed = (xpSeed ^ 0x5DEECE66D) advanced to the slot.
  let s = (BigInt(xpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & MASK;
  // Advance past the slot level rolls (2 rolls per slot, 3 slots before we get to enchant)
  for (let i = 0; i < (slotIndex + 1) * 2 + 2; i++) s = lcgStep(s);

  // Step 1: Calculate modified enchantment cost (eCost)
  // eCost = round( (xpCost + 1 + randInt(floor(E/4)) + randInt(floor(E/4))) * (1 + randTri(0.15)) )
  const e4 = Math.floor(enchantability / 4);

  const r1 = nextBounded(s, e4);
  s = r1.s;
  const r2 = nextBounded(s, e4);
  s = r2.s;

  // randTri(0.15) = (randFloat + randFloat - 1) * 0.15
  const rf1 = Number(lcgStep(s) >> BigInt(24)) / (1 << 24);
  s = lcgStep(s);
  const rf2 = Number(s >> BigInt(24)) / (1 << 24);
  s = lcgStep(s);
  const tri = (rf1 + rf2 - 1.0) * 0.15;

  const eCost = Math.round((xpCost + 1 + r1.val + r2.val) * (1.0 + tri));

  // Step 2: Find candidate enchantments
  const availableEnchIds = item.enchantments;
  const candidates: { enc: Enchantment; level: number }[] = [];

  for (const encId of availableEnchIds) {
    const enc = ALL_ENCHANTMENTS[encId];
    if (!enc || enc.isTreasure) continue;

    // Find highest applicable level
    for (let lvl = enc.maxLevel; lvl >= 1; lvl--) {
      const minC = enc.minCost(lvl);
      const maxC = enc.maxCost(lvl);
      if (eCost >= minC && eCost <= maxC) {
        candidates.push({ enc, level: lvl });
        break;
      }
    }
  }

  if (candidates.length === 0) return [];

  // Step 3: Pick enchantments using weighted random selection
  const results: EnchantResult[] = [];
  let remainingCandidates = [...candidates];
  let currentECost = eCost;

  let pickSeed = s;

  while (remainingCandidates.length > 0) {
    // Pick one by weight
    const totalWeight = remainingCandidates.reduce((sum, c) => sum + c.enc.weight, 0);
    const rw = nextBounded(pickSeed, totalWeight - 1);
    pickSeed = rw.s;

    let cumWeight = 0;
    let chosen: { enc: Enchantment; level: number } | null = null;
    for (const c of remainingCandidates) {
      cumWeight += c.enc.weight;
      if (rw.val < cumWeight) {
        chosen = c;
        break;
      }
    }

    if (!chosen) break;
    results.push({ id: chosen.enc.id, name: chosen.enc.name, level: chosen.level });

    // Remove chosen and incompatibles
    remainingCandidates = remainingCandidates.filter(
      (c) =>
        c.enc.id !== chosen!.enc.id &&
        !chosen!.enc.incompatible?.includes(c.enc.id) &&
        !c.enc.incompatible?.includes(chosen!.enc.id)
    );

    if (remainingCandidates.length === 0) break;

    // Cascade chance: (eCost + 1) / 50
    currentECost = Math.floor(currentECost / 2);
    const cascadeRoll = nextBounded(pickSeed, 49);
    pickSeed = cascadeRoll.s;
    if (cascadeRoll.val >= currentECost + 1) break;
  }

  return results;
}

// ─── XP Seed Cracking ────────────────────────────────────────────────────────

export interface SeedReading {
  bookshelves: number;
  top: number;
  middle: number;
  bottom: number;
}

/**
 * Crack the XP seed from observed slot levels.
 * Brute-forces all 2^32 possible seeds, but we only need a small window.
 * In practice we search 2^32 seeds – in JS we batch this.
 * 
 * This returns all matching seeds (usually 1–4).
 */
export function crackXpSeed(readings: SeedReading[]): number[] {
  if (readings.length === 0) return [];

  const matches: number[] = [];

  // We search all 32-bit unsigned integers
  const TOTAL = 0x100000000;
  const batchSize = 1_000_000;

  // For performance in the browser we only search the first batch per call
  // Use the first reading to narrow candidates
  const r0 = readings[0];

  for (let seed = 0; seed < TOTAL; seed++) {
    const [top, mid, bot] = slotLevels(seed, r0.bookshelves);
    if (top === r0.top && mid === r0.middle && bot === r0.bottom) {
      // Verify all other readings
      let ok = true;
      for (let i = 1; i < readings.length; i++) {
        const ri = readings[i];
        const [t, m, b] = slotLevels(seed, ri.bookshelves);
        if (t !== ri.top || m !== ri.middle || b !== ri.bottom) {
          ok = false;
          break;
        }
      }
      if (ok) matches.push(seed);
    }

    if (seed % batchSize === batchSize - 1 && matches.length > 0) break;
  }

  return matches;
}

/**
 * Async version of seed cracking that yields progress updates.
 * Calls onProgress with fraction 0–1, resolves with array of matching seeds.
 */
export async function crackXpSeedAsync(
  readings: SeedReading[],
  onProgress: (frac: number) => void,
  signal?: AbortSignal
): Promise<number[]> {
  if (readings.length === 0) return [];

  const matches: number[] = [];
  const r0 = readings[0];
  const TOTAL = 0x100000000;
  const CHUNK = 500_000;

  for (let start = 0; start < TOTAL; start += CHUNK) {
    if (signal?.aborted) break;

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const end = Math.min(start + CHUNK, TOTAL);
    for (let seed = start; seed < end; seed++) {
      const [top, mid, bot] = slotLevels(seed >>> 0, r0.bookshelves);
      if (top === r0.top && mid === r0.middle && bot === r0.bottom) {
        let ok = true;
        for (let i = 1; i < readings.length; i++) {
          const ri = readings[i];
          const [t, m, b] = slotLevels(seed >>> 0, ri.bookshelves);
          if (t !== ri.top || m !== ri.middle || b !== ri.bottom) {
            ok = false;
            break;
          }
        }
        if (ok) matches.push(seed >>> 0);
      }
    }

    onProgress(end / TOTAL);
  }

  return matches;
}

// ─── Player RNG / throw calculation ─────────────────────────────────────────

/**
 * Compute the next XP seed after enchanting.
 * After enchanting, Minecraft calls random.nextInt() to regenerate XpSeed.
 * The new xpSeed = (nextLCGState >>> 17) as a 32-bit signed int.
 * 
 * For simulation purposes, we model: next_xpSeed = lcgStep(xpSeed ^ 0x5DEECE66D) >>> 17
 */
export function nextXpSeed(currentXpSeed: number): number {
  const s = (BigInt(currentXpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & MASK;
  const ns = lcgStep(s);
  return Number(ns >> BigInt(17)) | 0;
}

export interface ThrowPlan {
  throws: number;
  throwItem: string; // item to throw
  targetSeed: number;
  bookshelves: number;
  expectedEnchantments: EnchantResult[];
  possible: boolean;
  reason?: string;
}

/**
 * Find the minimum number of item throws needed to reach a target set of enchantments.
 * 
 * Each throw advances the player RNG by 4 steps.
 * Enchanting draws from the CURRENT xpSeed and then generates a new one.
 * 
 * We simulate future xpSeeds by advancing the seed and check if any
 * future seed produces the desired enchantments.
 *
 * Note: In the real game, the player's internal RNG is separate from xpSeed.
 * Throwing items affects the player RNG, which then determines what the NEW
 * xpSeed will be after enchanting. This is a simplified simulation.
 */
export function findThrowPlan(
  currentXpSeed: number,
  itemId: string,
  wantedEnchantments: { id: string; level: number }[],
  unwantedEnchantments: string[],
  maxBookshelves: number,
  maxThrows: number = 500000,
  throwItemId: string = 'wooden_pickaxe'
): ThrowPlan | null {
  // Impossible enchantments (treasure-only not obtainable at table)
  const treasureOnly = ['mending', 'frost_walker', 'soul_speed', 'swift_sneak', 'curse_of_vanishing', 'curse_of_binding'];
  const impossibleWanted = wantedEnchantments.filter(e => treasureOnly.includes(e.id));
  if (impossibleWanted.length > 0) {
    return {
      throws: 0,
      throwItem: throwItemId,
      targetSeed: currentXpSeed,
      bookshelves: maxBookshelves,
      expectedEnchantments: [],
      possible: false,
      reason: `${impossibleWanted.map(e => ALL_ENCHANTMENTS[e.id]?.name || e.id).join(', ')} cannot be obtained from an enchanting table (treasure enchantment only).`,
    };
  }

  // Sharpness V / Silk Touch at same time check
  const conflicting = [];
  for (let i = 0; i < wantedEnchantments.length; i++) {
    for (let j = i + 1; j < wantedEnchantments.length; j++) {
      const a = wantedEnchantments[i].id;
      const b = wantedEnchantments[j].id;
      const ea = ALL_ENCHANTMENTS[a];
      const eb = ALL_ENCHANTMENTS[b];
      if (ea?.incompatible?.includes(b) || eb?.incompatible?.includes(a)) {
        conflicting.push(`${ea?.name} + ${eb?.name}`);
      }
    }
  }
  if (conflicting.length > 0) {
    return {
      throws: 0,
      throwItem: throwItemId,
      targetSeed: currentXpSeed,
      bookshelves: maxBookshelves,
      expectedEnchantments: [],
      possible: false,
      reason: `Incompatible enchantments selected: ${conflicting.join(', ')}. These cannot appear on the same item.`,
    };
  }

  // Simulate through future seeds
  // Each throw = 4 RNG steps, which shifts what the next xpSeed will be
  // We model: simulated future xpSeed[n] = apply n*4 LCG steps to current seed
  let simSeed = (BigInt(currentXpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & MASK;

  for (let throws = 0; throws <= maxThrows; throws++) {
    // The xpSeed at this point (after `throws` item throws)
    const xpSeed = Number(simSeed >> BigInt(17)) | 0;

    // Try all bookshelves levels from max down to 0
    for (let bs = maxBookshelves; bs >= 0; bs--) {
      // Try all 3 slots
      for (let slot = 2; slot >= 0; slot--) {
        const enchs = simulateEnchantments(xpSeed, itemId, slot as 0 | 1 | 2, bs);

        // Check if all wanted enchantments are present
        const hasAll = wantedEnchantments.every((w) =>
          enchs.some((e) => e.id === w.id && e.level >= w.level)
        );

        // Check none of the unwanted are present
        const hasNone = unwantedEnchantments.every(
          (u) => !enchs.some((e) => e.id === u)
        );

        if (hasAll && hasNone && enchs.length > 0) {
          return {
            throws,
            throwItem: throwItemId,
            targetSeed: xpSeed,
            bookshelves: bs,
            expectedEnchantments: enchs,
            possible: true,
          };
        }
      }
    }

    // Advance by 4 steps (one item throw)
    simSeed = lcgStepN(simSeed, 4);
  }

  return {
    throws: maxThrows,
    throwItem: throwItemId,
    targetSeed: currentXpSeed,
    bookshelves: maxBookshelves,
    expectedEnchantments: [],
    possible: false,
    reason: `Could not find a combination within ${maxThrows.toLocaleString()} throws. Try a different enchantment target or item.`,
  };
}

/**
 * Async version with progress callbacks
 */
export async function findThrowPlanAsync(
  currentXpSeed: number,
  itemId: string,
  wantedEnchantments: { id: string; level: number }[],
  unwantedEnchantments: string[],
  maxBookshelves: number,
  maxThrows: number = 500000,
  throwItemId: string = 'wooden_pickaxe',
  onProgress?: (throws: number, maxThrows: number) => void,
  signal?: AbortSignal
): Promise<ThrowPlan | null> {
  // Validation checks
  const treasureOnly = ['mending', 'frost_walker', 'soul_speed', 'swift_sneak', 'curse_of_vanishing', 'curse_of_binding'];
  const impossibleWanted = wantedEnchantments.filter(e => treasureOnly.includes(e.id));
  if (impossibleWanted.length > 0) {
    return {
      throws: 0,
      throwItem: throwItemId,
      targetSeed: currentXpSeed,
      bookshelves: maxBookshelves,
      expectedEnchantments: [],
      possible: false,
      reason: `${impossibleWanted.map(e => ALL_ENCHANTMENTS[e.id]?.name || e.id).join(', ')} cannot be obtained from an enchanting table (treasure enchantment only).`,
    };
  }

  const conflicting = [];
  for (let i = 0; i < wantedEnchantments.length; i++) {
    for (let j = i + 1; j < wantedEnchantments.length; j++) {
      const a = wantedEnchantments[i].id;
      const b = wantedEnchantments[j].id;
      const ea = ALL_ENCHANTMENTS[a];
      const eb = ALL_ENCHANTMENTS[b];
      if (ea?.incompatible?.includes(b) || eb?.incompatible?.includes(a)) {
        conflicting.push(`${ea?.name} + ${eb?.name}`);
      }
    }
  }
  if (conflicting.length > 0) {
    return {
      throws: 0,
      throwItem: throwItemId,
      targetSeed: currentXpSeed,
      bookshelves: maxBookshelves,
      expectedEnchantments: [],
      possible: false,
      reason: `Incompatible enchantments selected: ${conflicting.join(', ')}. These cannot appear on the same item.`,
    };
  }

  const CHUNK = 10000;
  let simSeed = (BigInt(currentXpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & MASK;

  for (let throws = 0; throws <= maxThrows; throws++) {
    if (signal?.aborted) return null;

    if (throws % CHUNK === 0 && throws > 0) {
      await new Promise<void>((r) => setTimeout(r, 0));
      onProgress?.(throws, maxThrows);
    }

    const xpSeed = Number(simSeed >> BigInt(17)) | 0;

    for (let bs = maxBookshelves; bs >= 0; bs--) {
      for (let slot = 2; slot >= 0; slot--) {
        const enchs = simulateEnchantments(xpSeed, itemId, slot as 0 | 1 | 2, bs);

        const hasAll = wantedEnchantments.every((w) =>
          enchs.some((e) => e.id === w.id && e.level >= w.level)
        );
        const hasNone = unwantedEnchantments.every(
          (u) => !enchs.some((e) => e.id === u)
        );

        if (hasAll && hasNone && enchs.length > 0) {
          return {
            throws,
            throwItem: throwItemId,
            targetSeed: xpSeed,
            bookshelves: bs,
            expectedEnchantments: enchs,
            possible: true,
          };
        }
      }
    }

    simSeed = lcgStepN(simSeed, 4);
  }

  return {
    throws: maxThrows,
    throwItem: throwItemId,
    targetSeed: currentXpSeed,
    bookshelves: maxBookshelves,
    expectedEnchantments: [],
    possible: false,
    reason: `Could not find a combination within ${maxThrows.toLocaleString()} throws searched. The enchantment might require more throws - increase the search limit.`,
  };
}

// Enchantment level to roman numeral
export function toRoman(level: number): string {
  const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
  return map[level] || String(level);
}

export function formatEnchantment(id: string, level: number): string {
  const enc = ALL_ENCHANTMENTS[id];
  if (!enc) return id;
  const name = enc.name;
  if (enc.maxLevel === 1) return name;
  return `${name} ${toRoman(level)}`;
}
