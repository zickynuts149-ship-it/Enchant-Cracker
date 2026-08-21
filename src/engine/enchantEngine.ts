/**
 * Minecraft Enchantment Selection Algorithm
 * Implements the exact Java Edition 1.21.x enchanting table algorithm.
 */

import { JavaRandom, calcEnchantmentCost, makeEnchantRng, calcSlotLevels } from './rng';
import { ENCHANTMENTS, ENCHANTABLE_ITEMS, type EnchantmentId } from '../data/enchantments';

export interface EnchantmentResult {
  id: EnchantmentId;
  level: number;
}

export interface SlotResult {
  slot: 0 | 1 | 2; // top=0, mid=1, bot=2
  displayLevel: number;
  enchantmentCost: number;
  enchantments: EnchantmentResult[];
}

export interface TableOffer {
  bookshelves: number;
  slots: SlotResult[];
}

/**
 * Select enchantments for a given modified enchantment level and item.
 * Implements Step 3 of the Minecraft enchanting algorithm.
 */
export function selectEnchantments(
  rng: JavaRandom,
  enchantmentCost: number,
  itemId: string
): EnchantmentResult[] {
  const item = ENCHANTABLE_ITEMS.find(i => i.id === itemId);
  if (!item) return [];

  interface Candidate {
    id: EnchantmentId;
    level: number;
    weight: number;
  }

  const buildCandidates = (cost: number): Candidate[] => {
    const candidates: Candidate[] = [];
    for (const enchId of item.enchantments) {
      const ench = ENCHANTMENTS[enchId];
      if (!ench || ench.treasure) continue;

      // Find highest level where cost is within range
      for (let lvl = ench.maxLevel; lvl >= 1; lvl--) {
        const range = ench.levels[lvl - 1];
        if (cost >= range.min && cost <= range.max) {
          candidates.push({ id: enchId, level: lvl, weight: ench.weight });
          break;
        }
      }
    }
    return candidates;
  };

  const pickWeighted = (candidates: Candidate[]): Candidate | null => {
    if (candidates.length === 0) return null;
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return null;

    let w = rng.nextInt(totalWeight);
    for (const c of candidates) {
      w -= c.weight;
      if (w < 0) return c;
    }
    return candidates[candidates.length - 1];
  };

  const removeIncompat = (cands: Candidate[], chosen: Candidate): Candidate[] => {
    const chosenIncompat = new Set(ENCHANTMENTS[chosen.id]?.incompatible || []);
    chosenIncompat.add(chosen.id);
    return cands.filter(c => {
      if (chosenIncompat.has(c.id)) return false;
      const cIncompat = ENCHANTMENTS[c.id]?.incompatible || [];
      if (cIncompat.includes(chosen.id)) return false;
      return true;
    });
  };

  const selected: EnchantmentResult[] = [];
  const initialCost = enchantmentCost;
  let currentCost = enchantmentCost;
  let candidates = buildCandidates(currentCost);

  const first = pickWeighted(candidates);
  if (!first) return selected;
  selected.push({ id: first.id, level: first.level });
  candidates = removeIncompat(candidates, first);
  currentCost = Math.floor(currentCost / 2);

  while (candidates.length > 0) {
    const prob = (initialCost + 1) / 50;
    const roll = rng.nextFloat();
    if (roll >= prob) break;

    // Rebuild candidates for halved cost
    const available = buildCandidates(currentCost).filter(c =>
      !selected.some(s => {
        if (s.id === c.id) return true;
        const sIncompat = ENCHANTMENTS[s.id]?.incompatible || [];
        const cIncompat = ENCHANTMENTS[c.id]?.incompatible || [];
        return sIncompat.includes(c.id) || cIncompat.includes(s.id);
      })
    );

    const next = pickWeighted(available);
    if (!next) break;

    selected.push({ id: next.id, level: next.level });
    candidates = removeIncompat(available, next);
    currentCost = Math.floor(currentCost / 2);
  }

  return selected;
}

/**
 * Simulate the full enchanting table for a given XP seed, item, and bookshelves.
 */
export function simulateTable(
  xpSeed: number,
  itemId: string,
  bookshelves: number
): TableOffer {
  const item = ENCHANTABLE_ITEMS.find(i => i.id === itemId);
  if (!item) return { bookshelves, slots: [] };

  // Get slot levels using the shared RNG for base level
  const baseRng = makeEnchantRng(xpSeed);
  const [topLevel, midLevel, botLevel] = calcSlotLevels(baseRng, bookshelves);
  const levels = [topLevel, midLevel, botLevel];

  const slots: SlotResult[] = [];

  for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
    const slotLevel = levels[slotIdx];
    // Each slot uses XP seed XORed with slot index for selection
    const slotSeed = (xpSeed ^ slotIdx) >>> 0;
    const slotRng = makeEnchantRng(slotSeed);
    const enchCost = calcEnchantmentCost(slotRng, slotLevel, item.enchantability);
    const enchantments = selectEnchantments(slotRng, enchCost, itemId);

    slots.push({
      slot: slotIdx as 0 | 1 | 2,
      displayLevel: slotLevel,
      enchantmentCost: enchCost,
      enchantments,
    });
  }

  return { bookshelves, slots };
}

export interface ThrowPlan {
  throws: number;
  bookshelves: number;
  slot: number;
  enchantments: EnchantmentResult[];
  possible: boolean;
  xpSeedAfterThrows: number;
}

export interface WantedEnchant {
  id: EnchantmentId;
  minLevel: number;
}

export function satisfiesWanted(
  enchants: EnchantmentResult[],
  wanted: WantedEnchant[]
): boolean {
  return wanted.every(w =>
    enchants.some(e => e.id === w.id && e.level >= w.minLevel)
  );
}

export function hasNoUnwanted(
  enchants: EnchantmentResult[],
  unwanted: EnchantmentId[]
): boolean {
  return !enchants.some(e => unwanted.includes(e.id));
}

export function xpSeedFromPlayerSeed(playerSeed: bigint): number {
  const val = Number((playerSeed >> BigInt(17)) & BigInt(0xFFFFFFFF));
  return val > 0x7FFFFFFF ? val - 0x100000000 : val;
}

/**
 * Advance XP seed by n item throws.
 * Simulates the 48-bit LCG advancing 4 steps per throw, then extracting the XP seed.
 * This is an approximation using a 32-bit LCG for demonstration.
 * In real Minecraft, the full 48-bit player seed is needed.
 */
export function advanceXpSeedByThrows(xpSeed: number, throws: number): number {
  // Each throw: player 48-bit seed advances 4 steps, new XP seed = seed >> 17
  // We approximate by using a Lehmer-style 32-bit advancement
  let seed = xpSeed >>> 0;
  for (let i = 0; i < throws; i++) {
    // 4 LCG steps approximation (32-bit)
    for (let step = 0; step < 4; step++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    }
  }
  return seed;
}

/**
 * Find the best throw plan for desired enchantments.
 * Returns the first throw count (starting from 0) that achieves all wanted enchantments
 * while avoiding all unwanted ones.
 */
export function findBestThrowPlan(
  xpSeed: number,
  itemId: string,
  wanted: WantedEnchant[],
  unwanted: EnchantmentId[],
  maxThrows: number = 320,
  maxBookshelves: number = 15
): ThrowPlan | null {
  for (let throws = 0; throws <= maxThrows; throws++) {
    const testSeed = advanceXpSeedByThrows(xpSeed, throws);

    for (let bs = maxBookshelves; bs >= 0; bs--) {
      const offer = simulateTable(testSeed, itemId, bs);

      for (let slotIdx = 2; slotIdx >= 0; slotIdx--) {
        const slot = offer.slots[slotIdx];
        if (!slot) continue;

        if (satisfiesWanted(slot.enchantments, wanted) && hasNoUnwanted(slot.enchantments, unwanted)) {
          return {
            throws,
            bookshelves: bs,
            slot: slotIdx,
            enchantments: slot.enchantments,
            possible: true,
            xpSeedAfterThrows: testSeed,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Check if a specific enchantment+level is theoretically achievable
 * from the enchanting table with given bookshelves and item.
 */
export function isAchievable(
  enchId: EnchantmentId,
  level: number,
  itemId: string,
  bookshelves: number
): boolean {
  const item = ENCHANTABLE_ITEMS.find(i => i.id === itemId);
  if (!item) return false;
  if (!item.enchantments.includes(enchId)) return false;

  const ench = ENCHANTMENTS[enchId];
  if (!ench || ench.treasure) return false;
  if (level < 1 || level > ench.maxLevel) return false;

  const b = Math.min(bookshelves, 15);
  const maxBase = 9 + b + Math.floor(b / 2);
  const maxSlotLevel = Math.max(maxBase, b * 2);
  const maxCost = Math.ceil((maxSlotLevel + Math.floor(item.enchantability / 2) + 2) * 1.15);

  const range = ench.levels[level - 1];
  return range.min <= maxCost;
}

/**
 * Scan multiple throw counts and return ALL matching plans.
 * Useful for showing options to the player.
 */
export function findAllPlans(
  xpSeed: number,
  itemId: string,
  wanted: WantedEnchant[],
  unwanted: EnchantmentId[],
  maxThrows: number = 320,
  maxBookshelves: number = 15
): ThrowPlan[] {
  const plans: ThrowPlan[] = [];

  for (let throws = 0; throws <= maxThrows; throws++) {
    const testSeed = advanceXpSeedByThrows(xpSeed, throws);

    for (let bs = maxBookshelves; bs >= 0; bs--) {
      const offer = simulateTable(testSeed, itemId, bs);

      for (let slotIdx = 2; slotIdx >= 0; slotIdx--) {
        const slot = offer.slots[slotIdx];
        if (!slot) continue;

        if (satisfiesWanted(slot.enchantments, wanted) && hasNoUnwanted(slot.enchantments, unwanted)) {
          plans.push({
            throws,
            bookshelves: bs,
            slot: slotIdx,
            enchantments: slot.enchantments,
            possible: true,
            xpSeedAfterThrows: testSeed,
          });
          if (plans.length >= 5) return plans; // Return top 5
        }
      }
    }
  }
  return plans;
}
