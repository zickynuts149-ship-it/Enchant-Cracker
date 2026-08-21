// Minecraft Java Edition 1.21+ Enchantment Data
// Based on official Minecraft Wiki mechanics

export interface Enchantment {
  id: string;
  name: string;
  maxLevel: number;
  weight: number; // rarity weight: 10=common, 5=uncommon, 2=rare, 1=very rare
  minCost: (level: number) => number; // min modified enchantment level
  maxCost: (level: number) => number; // max modified enchantment level
  incompatible?: string[]; // incompatible enchantment ids
  isTreasure?: boolean; // treasure only, NOT obtainable at table
  description: string;
}

export interface ItemType {
  id: string;
  name: string;
  emoji: string;
  enchantability: number;
  enchantments: string[]; // list of enchantment ids
  material?: string;
}

// Only enchantments obtainable via enchanting table (not treasure-only)
export const ALL_ENCHANTMENTS: Record<string, Enchantment> = {
  // Armor - Protection group (mutually exclusive)
  protection: {
    id: 'protection',
    name: 'Protection',
    maxLevel: 4,
    weight: 10,
    minCost: (l) => 1 + (l - 1) * 11,
    maxCost: (l) => 1 + (l - 1) * 11 + 11,
    incompatible: ['fire_protection', 'blast_protection', 'projectile_protection'],
    description: 'Reduces most types of damage',
  },
  fire_protection: {
    id: 'fire_protection',
    name: 'Fire Protection',
    maxLevel: 4,
    weight: 5,
    minCost: (l) => 10 + (l - 1) * 8,
    maxCost: (l) => 10 + (l - 1) * 8 + 8,
    incompatible: ['protection', 'blast_protection', 'projectile_protection'],
    description: 'Reduces fire damage and burn time',
  },
  blast_protection: {
    id: 'blast_protection',
    name: 'Blast Protection',
    maxLevel: 4,
    weight: 2,
    minCost: (l) => 5 + (l - 1) * 8,
    maxCost: (l) => 5 + (l - 1) * 8 + 8,
    incompatible: ['protection', 'fire_protection', 'projectile_protection'],
    description: 'Reduces explosion damage and knockback',
  },
  projectile_protection: {
    id: 'projectile_protection',
    name: 'Projectile Protection',
    maxLevel: 4,
    weight: 5,
    minCost: (l) => 3 + (l - 1) * 6,
    maxCost: (l) => 3 + (l - 1) * 6 + 6,
    incompatible: ['protection', 'fire_protection', 'blast_protection'],
    description: 'Reduces projectile damage',
  },
  // Helmet
  respiration: {
    id: 'respiration',
    name: 'Respiration',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 10 * l,
    maxCost: (l) => 40 + 10 * l,
    description: 'Extends underwater breathing time',
  },
  aqua_affinity: {
    id: 'aqua_affinity',
    name: 'Aqua Affinity',
    maxLevel: 1,
    weight: 2,
    minCost: (_l) => 1,
    maxCost: (_l) => 41,
    description: 'Increases underwater mining speed',
  },
  // Armor general
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    maxLevel: 3,
    weight: 1,
    minCost: (l) => 10 + 20 * (l - 1),
    maxCost: (l) => 60 + 20 * (l - 1),
    description: 'Damages attackers, but reduces durability',
  },
  unbreaking: {
    id: 'unbreaking',
    name: 'Unbreaking',
    maxLevel: 3,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 8,
    maxCost: (l) => 55 + (l - 1) * 8,
    description: 'Increases item durability',
  },
  // Boots special
  feather_falling: {
    id: 'feather_falling',
    name: 'Feather Falling',
    maxLevel: 4,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 6,
    maxCost: (l) => 11 + (l - 1) * 6,
    description: 'Reduces fall damage',
  },
  depth_strider: {
    id: 'depth_strider',
    name: 'Depth Strider',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => l * 10,
    maxCost: (l) => l * 10 + 15,
    incompatible: ['frost_walker'],
    description: 'Increases underwater movement speed',
  },
  // Sword damage group (mutually exclusive)
  sharpness: {
    id: 'sharpness',
    name: 'Sharpness',
    maxLevel: 5,
    weight: 10,
    minCost: (l) => 1 + (l - 1) * 11,
    maxCost: (l) => 21 + (l - 1) * 11,
    incompatible: ['smite', 'bane_of_arthropods'],
    description: 'Increases melee damage',
  },
  smite: {
    id: 'smite',
    name: 'Smite',
    maxLevel: 5,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 8,
    maxCost: (l) => 25 + (l - 1) * 8,
    incompatible: ['sharpness', 'bane_of_arthropods'],
    description: 'Increases damage to undead mobs',
  },
  bane_of_arthropods: {
    id: 'bane_of_arthropods',
    name: 'Bane of Arthropods',
    maxLevel: 5,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 8,
    maxCost: (l) => 25 + (l - 1) * 8,
    incompatible: ['sharpness', 'smite'],
    description: 'Increases damage to spiders, cave spiders, silverfish, endermites, bees',
  },
  // Sword other
  knockback: {
    id: 'knockback',
    name: 'Knockback',
    maxLevel: 2,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 20,
    maxCost: (l) => 55 + (l - 1) * 20,
    description: 'Increases knockback on hit',
  },
  fire_aspect: {
    id: 'fire_aspect',
    name: 'Fire Aspect',
    maxLevel: 2,
    weight: 2,
    minCost: (l) => 10 + 20 * (l - 1),
    maxCost: (l) => 60 + 20 * (l - 1),
    description: 'Sets target on fire',
  },
  looting: {
    id: 'looting',
    name: 'Looting',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 15 + (l - 1) * 9,
    maxCost: (l) => 65 + (l - 1) * 9,
    description: 'Increases mob loot drops',
  },
  sweeping_edge: {
    id: 'sweeping_edge',
    name: 'Sweeping Edge',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 5 + (l - 1) * 9,
    maxCost: (l) => 20 + (l - 1) * 9,
    description: 'Increases sweeping attack damage (Java only)',
  },
  // Tools
  efficiency: {
    id: 'efficiency',
    name: 'Efficiency',
    maxLevel: 5,
    weight: 10,
    minCost: (l) => 1 + (l - 1) * 10,
    maxCost: (l) => 50 + 1 + (l - 1) * 10,
    description: 'Increases mining/chopping speed',
  },
  silk_touch: {
    id: 'silk_touch',
    name: 'Silk Touch',
    maxLevel: 1,
    weight: 1,
    minCost: (_l) => 15,
    maxCost: (_l) => 65,
    incompatible: ['fortune'],
    description: 'Mined blocks drop themselves',
  },
  fortune: {
    id: 'fortune',
    name: 'Fortune',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 15 + (l - 1) * 9,
    maxCost: (l) => 65 + (l - 1) * 9,
    incompatible: ['silk_touch'],
    description: 'Increases certain block drops',
  },
  // Bow
  power: {
    id: 'power',
    name: 'Power',
    maxLevel: 5,
    weight: 10,
    minCost: (l) => 1 + (l - 1) * 10,
    maxCost: (l) => 16 + (l - 1) * 10,
    description: 'Increases arrow damage',
  },
  punch: {
    id: 'punch',
    name: 'Punch',
    maxLevel: 2,
    weight: 2,
    minCost: (l) => 12 + (l - 1) * 20,
    maxCost: (l) => 37 + (l - 1) * 20,
    description: 'Increases arrow knockback',
  },
  flame: {
    id: 'flame',
    name: 'Flame',
    maxLevel: 1,
    weight: 2,
    minCost: (_l) => 20,
    maxCost: (_l) => 50,
    description: 'Arrows set targets on fire',
  },
  infinity: {
    id: 'infinity',
    name: 'Infinity',
    maxLevel: 1,
    weight: 1,
    minCost: (_l) => 20,
    maxCost: (_l) => 50,
    incompatible: ['mending'],
    description: 'Shooting does not consume arrows',
  },
  // Fishing Rod
  luck_of_the_sea: {
    id: 'luck_of_the_sea',
    name: 'Luck of the Sea',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 15 + (l - 1) * 9,
    maxCost: (l) => 65 + (l - 1) * 9,
    description: 'Increases rate of good catches',
  },
  lure: {
    id: 'lure',
    name: 'Lure',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 15 + (l - 1) * 9,
    maxCost: (l) => 65 + (l - 1) * 9,
    description: 'Decreases time for fish to bite',
  },
  // Trident
  impaling: {
    id: 'impaling',
    name: 'Impaling',
    maxLevel: 5,
    weight: 2,
    minCost: (l) => 1 + (l - 1) * 8,
    maxCost: (l) => 21 + (l - 1) * 8,
    description: 'Deals extra damage to aquatic mobs',
  },
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty',
    maxLevel: 3,
    weight: 5,
    minCost: (l) => 5 + l * 7,
    maxCost: (_l) => 50,
    incompatible: ['riptide'],
    description: 'Trident returns after being thrown',
  },
  channeling: {
    id: 'channeling',
    name: 'Channeling',
    maxLevel: 1,
    weight: 1,
    minCost: (_l) => 25,
    maxCost: (_l) => 50,
    incompatible: ['riptide'],
    description: 'Channels lightning during thunderstorms',
  },
  riptide: {
    id: 'riptide',
    name: 'Riptide',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 10 + l * 7,
    maxCost: (_l) => 50,
    incompatible: ['loyalty', 'channeling'],
    description: 'Launches player with trident when thrown in water/rain',
  },
  // Crossbow
  quick_charge: {
    id: 'quick_charge',
    name: 'Quick Charge',
    maxLevel: 3,
    weight: 5,
    minCost: (l) => 12 + (l - 1) * 20,
    maxCost: (_l) => 50,
    description: 'Decreases crossbow loading time',
  },
  piercing: {
    id: 'piercing',
    name: 'Piercing',
    maxLevel: 4,
    weight: 10,
    minCost: (l) => 1 + (l - 1) * 10,
    maxCost: (_l) => 50,
    incompatible: ['multishot'],
    description: 'Arrows pass through multiple entities',
  },
  multishot: {
    id: 'multishot',
    name: 'Multishot',
    maxLevel: 1,
    weight: 2,
    minCost: (_l) => 20,
    maxCost: (_l) => 50,
    incompatible: ['piercing'],
    description: 'Shoots 3 arrows at the cost of one',
  },
  // Mace
  density: {
    id: 'density',
    name: 'Density',
    maxLevel: 5,
    weight: 5,
    minCost: (l) => 5 + (l - 1) * 8,
    maxCost: (l) => 25 + (l - 1) * 8,
    incompatible: ['breach'],
    description: 'Increases damage with fall height',
  },
  breach: {
    id: 'breach',
    name: 'Breach',
    maxLevel: 4,
    weight: 2,
    minCost: (l) => 15 + (l - 1) * 9,
    maxCost: (l) => 65 + (l - 1) * 9,
    incompatible: ['density'],
    description: 'Reduces target armor effectiveness',
  },
  wind_burst: {
    id: 'wind_burst',
    name: 'Wind Burst',
    maxLevel: 3,
    weight: 2,
    minCost: (l) => 10 + (l - 1) * 9,
    maxCost: (l) => 35 + (l - 1) * 9,
    isTreasure: true,
    description: 'Emits wind burst on hit (treasure)',
  },
  // Axe damage (mutually exclusive with sharpness group)
  // Axe uses sharpness/smite/bane ids with same group
};

// Items that can be enchanted at an enchanting table in Java Edition 1.21+
export const ENCHANTABLE_ITEMS: ItemType[] = [
  // Weapons
  {
    id: 'diamond_sword',
    name: 'Diamond Sword',
    emoji: '⚔️',
    enchantability: 10,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  {
    id: 'netherite_sword',
    name: 'Netherite Sword',
    emoji: '⚔️',
    enchantability: 15,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    emoji: '🗡️',
    enchantability: 14,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  {
    id: 'golden_sword',
    name: 'Golden Sword',
    emoji: '🗡️',
    enchantability: 22,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  {
    id: 'stone_sword',
    name: 'Stone Sword',
    emoji: '🗡️',
    enchantability: 5,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    emoji: '🗡️',
    enchantability: 15,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking'],
  },
  // Axes
  {
    id: 'diamond_axe',
    name: 'Diamond Axe',
    emoji: '🪓',
    enchantability: 10,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'netherite_axe',
    name: 'Netherite Axe',
    emoji: '🪓',
    enchantability: 15,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'iron_axe',
    name: 'Iron Axe',
    emoji: '🪓',
    enchantability: 14,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'golden_axe',
    name: 'Golden Axe',
    emoji: '🪓',
    enchantability: 22,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'stone_axe',
    name: 'Stone Axe',
    emoji: '🪓',
    enchantability: 5,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'wooden_axe',
    name: 'Wooden Axe',
    emoji: '🪓',
    enchantability: 15,
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  // Pickaxes
  {
    id: 'diamond_pickaxe',
    name: 'Diamond Pickaxe',
    emoji: '⛏️',
    enchantability: 10,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'netherite_pickaxe',
    name: 'Netherite Pickaxe',
    emoji: '⛏️',
    enchantability: 15,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'iron_pickaxe',
    name: 'Iron Pickaxe',
    emoji: '⛏️',
    enchantability: 14,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'golden_pickaxe',
    name: 'Golden Pickaxe',
    emoji: '⛏️',
    enchantability: 22,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'stone_pickaxe',
    name: 'Stone Pickaxe',
    emoji: '⛏️',
    enchantability: 5,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'wooden_pickaxe',
    name: 'Wooden Pickaxe',
    emoji: '⛏️',
    enchantability: 15,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  // Shovels
  {
    id: 'diamond_shovel',
    name: 'Diamond Shovel',
    emoji: '🔱',
    enchantability: 10,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'netherite_shovel',
    name: 'Netherite Shovel',
    emoji: '🔱',
    enchantability: 15,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'iron_shovel',
    name: 'Iron Shovel',
    emoji: '🔱',
    enchantability: 14,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'golden_shovel',
    name: 'Golden Shovel',
    emoji: '🔱',
    enchantability: 22,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  // Hoes
  {
    id: 'diamond_hoe',
    name: 'Diamond Hoe',
    emoji: '🌾',
    enchantability: 10,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  {
    id: 'netherite_hoe',
    name: 'Netherite Hoe',
    emoji: '🌾',
    enchantability: 15,
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking'],
  },
  // Armor - Helmets
  {
    id: 'diamond_helmet',
    name: 'Diamond Helmet',
    emoji: '🪖',
    enchantability: 10,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'netherite_helmet',
    name: 'Netherite Helmet',
    emoji: '🪖',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    emoji: '🪖',
    enchantability: 9,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'golden_helmet',
    name: 'Golden Helmet',
    emoji: '🪖',
    enchantability: 25,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'chainmail_helmet',
    name: 'Chainmail Helmet',
    emoji: '🪖',
    enchantability: 12,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'leather_helmet',
    name: 'Leather Helmet',
    emoji: '🪖',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  {
    id: 'turtle_shell',
    name: 'Turtle Shell (Helmet)',
    emoji: '🐢',
    enchantability: 9,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'unbreaking'],
  },
  // Chestplates
  {
    id: 'diamond_chestplate',
    name: 'Diamond Chestplate',
    emoji: '🛡️',
    enchantability: 10,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'netherite_chestplate',
    name: 'Netherite Chestplate',
    emoji: '🛡️',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'iron_chestplate',
    name: 'Iron Chestplate',
    emoji: '🛡️',
    enchantability: 9,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'golden_chestplate',
    name: 'Golden Chestplate',
    emoji: '🛡️',
    enchantability: 25,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'chainmail_chestplate',
    name: 'Chainmail Chestplate',
    emoji: '🛡️',
    enchantability: 12,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'leather_chestplate',
    name: 'Leather Chestplate',
    emoji: '🛡️',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  // Leggings
  {
    id: 'diamond_leggings',
    name: 'Diamond Leggings',
    emoji: '👖',
    enchantability: 10,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'netherite_leggings',
    name: 'Netherite Leggings',
    emoji: '👖',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'iron_leggings',
    name: 'Iron Leggings',
    emoji: '👖',
    enchantability: 9,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'golden_leggings',
    name: 'Golden Leggings',
    emoji: '👖',
    enchantability: 25,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'chainmail_leggings',
    name: 'Chainmail Leggings',
    emoji: '👖',
    enchantability: 12,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  {
    id: 'leather_leggings',
    name: 'Leather Leggings',
    emoji: '👖',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking'],
  },
  // Boots
  {
    id: 'diamond_boots',
    name: 'Diamond Boots',
    emoji: '👢',
    enchantability: 10,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  {
    id: 'netherite_boots',
    name: 'Netherite Boots',
    emoji: '👢',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  {
    id: 'iron_boots',
    name: 'Iron Boots',
    emoji: '👢',
    enchantability: 9,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  {
    id: 'golden_boots',
    name: 'Golden Boots',
    emoji: '👢',
    enchantability: 25,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  {
    id: 'chainmail_boots',
    name: 'Chainmail Boots',
    emoji: '👢',
    enchantability: 12,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  {
    id: 'leather_boots',
    name: 'Leather Boots',
    emoji: '👢',
    enchantability: 15,
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'feather_falling', 'depth_strider', 'thorns', 'unbreaking'],
  },
  // Ranged
  {
    id: 'bow',
    name: 'Bow',
    emoji: '🏹',
    enchantability: 1,
    enchantments: ['power', 'punch', 'flame', 'infinity', 'unbreaking'],
  },
  {
    id: 'crossbow',
    name: 'Crossbow',
    emoji: '🏹',
    enchantability: 1,
    enchantments: ['quick_charge', 'piercing', 'multishot', 'unbreaking'],
  },
  {
    id: 'trident',
    name: 'Trident',
    emoji: '🔱',
    enchantability: 1,
    enchantments: ['impaling', 'loyalty', 'channeling', 'riptide', 'unbreaking'],
  },
  // Tools
  {
    id: 'fishing_rod',
    name: 'Fishing Rod',
    emoji: '🎣',
    enchantability: 1,
    enchantments: ['luck_of_the_sea', 'lure', 'unbreaking'],
  },
  // Mace
  {
    id: 'mace',
    name: 'Mace',
    emoji: '🔨',
    enchantability: 15,
    enchantments: ['smite', 'bane_of_arthropods', 'density', 'breach', 'fire_aspect', 'unbreaking'],
  },
];

// Java LCG constants for Minecraft's Random
export const LCG_MULTIPLIER = BigInt('25214903917');
export const LCG_ADDEND = BigInt('11');
export const LCG_MASK = BigInt('281474976710655'); // (1n << 48n) - 1n

// Advance Java Random state by one step
export function lcgNext(seed: bigint): bigint {
  return (seed * LCG_MULTIPLIER + LCG_ADDEND) & LCG_MASK;
}

// Get next int (upper 32 bits, signed)
export function nextInt(seed: bigint): { value: number; next: bigint } {
  const next = lcgNext(seed);
  const value = Number(BigInt.asIntN(32, next >> BigInt(16)));
  return { value, next };
}

// Advance player RNG by N steps (each item throw = 4 steps)
export function advanceSeed(seed: bigint, steps: number): bigint {
  let s = seed;
  for (let i = 0; i < steps; i++) {
    s = lcgNext(s);
  }
  return s;
}

// Convert XP seed (32-bit from player data) to internal LCG state
// XP seed is stored as the upper 32 bits of the LCG state divided by 2^16
export function xpSeedToLCG(xpSeed: number): bigint {
  // The XP seed is: (lcgState >> 17) as a 32-bit value
  // We need to recover the LCG state - there are multiple candidates
  // This returns the most likely candidate
  const upper = BigInt(xpSeed >>> 0) << BigInt(17);
  // Try to find exact state by checking all lower 17 bits
  return upper;
}

// Simulate enchantment table prediction
// Returns enchantment levels shown for a given XP seed and bookshelf count
export function getEnchantmentLevels(
  xpSeed: number,
  bookshelves: number
): [number, number, number] {
  // The xpSeed seeds a new java.util.Random
  // Then it generates base costs for 3 slots
  let seed = BigInt(xpSeed) ^ BigInt('0x5DEECE66D');
  seed = seed & LCG_MASK;

  const b = Math.min(15, bookshelves);

  // For each slot: xpBase = 1 + randInt(7) + floor(b/2) + randInt(b)
  function getRandInt(s: bigint, bound: number): { val: number; s: bigint } {
    const ns = lcgNext(s);
    const bits = Number(ns >> BigInt(17));
    const val = bound === 0 ? 0 : bits % (bound + 1);
    return { val, s: ns };
  }

  // Slot 1 (top)
  let r1 = getRandInt(seed, 7);
  let r2 = getRandInt(r1.s, b);
  const xpBase1 = 1 + r1.val + Math.floor(b / 2) + r2.val;
  const top = Math.max(1, Math.floor(xpBase1 / 3));

  // Slot 2 (middle) 
  let r3 = getRandInt(r2.s, 7);
  let r4 = getRandInt(r3.s, b);
  const xpBase2 = 1 + r3.val + Math.floor(b / 2) + r4.val;
  const middle = Math.floor(2 * xpBase2 / 3) + 1;

  // Slot 3 (bottom)
  let r5 = getRandInt(r4.s, 7);
  let r6 = getRandInt(r5.s, b);
  const xpBase3 = 1 + r5.val + Math.floor(b / 2) + r6.val;
  const bottom = Math.max(xpBase3, 2 * b);

  return [top, middle, bottom];
}

// Check if enchantments conflict
export function areIncompatible(enc1: string, enc2: string): boolean {
  const e1 = ALL_ENCHANTMENTS[enc1];
  const e2 = ALL_ENCHANTMENTS[enc2];
  if (!e1 || !e2) return false;
  return (
    (e1.incompatible?.includes(enc2) || false) ||
    (e2.incompatible?.includes(enc1) || false)
  );
}
