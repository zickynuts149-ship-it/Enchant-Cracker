// Minecraft Java Edition 1.21.x (26.2) Enchantment Data
// Power ranges = modified enchantment level ranges [min, max] per level
// Treasure enchantments CANNOT be obtained from enchanting table
// Weight: Common=10, Uncommon=5, Rare=2, Very Rare=1

export type EnchantmentId = string;

export interface EnchantmentLevel {
  min: number;
  max: number;
}

export interface Enchantment {
  id: EnchantmentId;
  name: string;
  maxLevel: number;
  weight: number; // rarity weight for enchanting table
  treasure: boolean; // true = cannot get from table
  curse: boolean;
  levels: EnchantmentLevel[]; // per level [L1, L2, L3, ...]
  incompatible: EnchantmentId[];
  description: string;
}

export interface EnchantableItem {
  id: string;
  name: string;
  category: string;
  enchantability: number;
  icon: string;
  enchantments: EnchantmentId[];
}

// All enchantments with their power ranges (modified enchantment level windows)
export const ENCHANTMENTS: Record<EnchantmentId, Enchantment> = {
  protection: {
    id: 'protection',
    name: 'Protection',
    maxLevel: 4,
    weight: 10,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 12 },
      { min: 12, max: 23 },
      { min: 23, max: 34 },
      { min: 34, max: 45 },
    ],
    incompatible: ['fire_protection', 'blast_protection', 'projectile_protection'],
    description: 'Reduces most types of damage.',
  },
  fire_protection: {
    id: 'fire_protection',
    name: 'Fire Protection',
    maxLevel: 4,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 10, max: 18 },
      { min: 18, max: 26 },
      { min: 26, max: 34 },
      { min: 34, max: 42 },
    ],
    incompatible: ['protection', 'blast_protection', 'projectile_protection'],
    description: 'Reduces fire damage.',
  },
  feather_falling: {
    id: 'feather_falling',
    name: 'Feather Falling',
    maxLevel: 4,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 11 },
      { min: 11, max: 17 },
      { min: 17, max: 23 },
      { min: 23, max: 29 },
    ],
    incompatible: [],
    description: 'Reduces fall damage.',
  },
  blast_protection: {
    id: 'blast_protection',
    name: 'Blast Protection',
    maxLevel: 4,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 13 },
      { min: 13, max: 21 },
      { min: 21, max: 29 },
      { min: 29, max: 37 },
    ],
    incompatible: ['protection', 'fire_protection', 'projectile_protection'],
    description: 'Reduces explosion damage.',
  },
  projectile_protection: {
    id: 'projectile_protection',
    name: 'Projectile Protection',
    maxLevel: 4,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 3, max: 9 },
      { min: 9, max: 15 },
      { min: 15, max: 21 },
      { min: 21, max: 27 },
    ],
    incompatible: ['protection', 'fire_protection', 'blast_protection'],
    description: 'Reduces projectile damage.',
  },
  respiration: {
    id: 'respiration',
    name: 'Respiration',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 10, max: 40 },
      { min: 20, max: 50 },
      { min: 30, max: 60 },
    ],
    incompatible: [],
    description: 'Extends underwater breathing time.',
  },
  aqua_affinity: {
    id: 'aqua_affinity',
    name: 'Aqua Affinity',
    maxLevel: 1,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [{ min: 1, max: 41 }],
    incompatible: [],
    description: 'Increases underwater mining speed.',
  },
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    maxLevel: 3,
    weight: 1,
    treasure: false,
    curse: false,
    levels: [
      { min: 10, max: 60 },
      { min: 30, max: 80 },
      { min: 50, max: 100 },
    ],
    incompatible: [],
    description: 'Damages attackers.',
  },
  depth_strider: {
    id: 'depth_strider',
    name: 'Depth Strider',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 10, max: 25 },
      { min: 20, max: 35 },
      { min: 30, max: 45 },
    ],
    incompatible: ['frost_walker'],
    description: 'Increases underwater movement speed.',
  },
  frost_walker: {
    id: 'frost_walker',
    name: 'Frost Walker',
    maxLevel: 2,
    weight: 2,
    treasure: true,
    curse: false,
    levels: [
      { min: 10, max: 25 },
      { min: 20, max: 35 },
    ],
    incompatible: ['depth_strider'],
    description: 'Freezes water beneath you. (Treasure – not from table)',
  },
  sharpness: {
    id: 'sharpness',
    name: 'Sharpness',
    maxLevel: 5,
    weight: 10,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 21 },
      { min: 12, max: 32 },
      { min: 23, max: 43 },
      { min: 34, max: 54 },
      { min: 45, max: 65 },
    ],
    incompatible: ['smite', 'bane_of_arthropods'],
    description: 'Increases melee damage.',
  },
  smite: {
    id: 'smite',
    name: 'Smite',
    maxLevel: 5,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 25 },
      { min: 13, max: 33 },
      { min: 21, max: 41 },
      { min: 29, max: 49 },
      { min: 37, max: 57 },
    ],
    incompatible: ['sharpness', 'bane_of_arthropods'],
    description: 'Extra damage to undead mobs.',
  },
  bane_of_arthropods: {
    id: 'bane_of_arthropods',
    name: 'Bane of Arthropods',
    maxLevel: 5,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 25 },
      { min: 13, max: 33 },
      { min: 21, max: 41 },
      { min: 29, max: 49 },
      { min: 37, max: 57 },
    ],
    incompatible: ['sharpness', 'smite'],
    description: 'Extra damage to spiders/silverfish.',
  },
  knockback: {
    id: 'knockback',
    name: 'Knockback',
    maxLevel: 2,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 55 },
      { min: 25, max: 75 },
    ],
    incompatible: [],
    description: 'Increases knockback.',
  },
  fire_aspect: {
    id: 'fire_aspect',
    name: 'Fire Aspect',
    maxLevel: 2,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 10, max: 60 },
      { min: 30, max: 80 },
    ],
    incompatible: [],
    description: 'Sets enemies on fire.',
  },
  looting: {
    id: 'looting',
    name: 'Looting',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
    ],
    incompatible: [],
    description: 'Increases mob drops.',
  },
  sweeping_edge: {
    id: 'sweeping_edge',
    name: 'Sweeping Edge',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 20 },
      { min: 14, max: 29 },
      { min: 23, max: 38 },
    ],
    incompatible: [],
    description: 'Increases sweep attack damage. (Java only)',
  },
  efficiency: {
    id: 'efficiency',
    name: 'Efficiency',
    maxLevel: 5,
    weight: 10,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 51 },
      { min: 11, max: 61 },
      { min: 21, max: 71 },
      { min: 31, max: 81 },
      { min: 41, max: 91 },
    ],
    incompatible: [],
    description: 'Increases mining speed.',
  },
  silk_touch: {
    id: 'silk_touch',
    name: 'Silk Touch',
    maxLevel: 1,
    weight: 1,
    treasure: false,
    curse: false,
    levels: [{ min: 15, max: 65 }],
    incompatible: ['fortune'],
    description: 'Blocks drop themselves.',
  },
  unbreaking: {
    id: 'unbreaking',
    name: 'Unbreaking',
    maxLevel: 3,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 55 },
      { min: 13, max: 63 },
      { min: 21, max: 71 },
    ],
    incompatible: [],
    description: 'Reduces durability loss.',
  },
  fortune: {
    id: 'fortune',
    name: 'Fortune',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
    ],
    incompatible: ['silk_touch'],
    description: 'Increases block drops.',
  },
  power: {
    id: 'power',
    name: 'Power',
    maxLevel: 5,
    weight: 10,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 16 },
      { min: 11, max: 26 },
      { min: 21, max: 36 },
      { min: 31, max: 46 },
      { min: 41, max: 56 },
    ],
    incompatible: [],
    description: 'Increases arrow damage.',
  },
  punch: {
    id: 'punch',
    name: 'Punch',
    maxLevel: 2,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 12, max: 37 },
      { min: 32, max: 57 },
    ],
    incompatible: [],
    description: 'Increases arrow knockback.',
  },
  flame: {
    id: 'flame',
    name: 'Flame',
    maxLevel: 1,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [{ min: 20, max: 50 }],
    incompatible: [],
    description: 'Arrows set targets on fire.',
  },
  infinity: {
    id: 'infinity',
    name: 'Infinity',
    maxLevel: 1,
    weight: 1,
    treasure: false,
    curse: false,
    levels: [{ min: 20, max: 50 }],
    incompatible: ['mending'],
    description: 'Shooting doesn\'t consume arrows.',
  },
  luck_of_the_sea: {
    id: 'luck_of_the_sea',
    name: 'Luck of the Sea',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
    ],
    incompatible: [],
    description: 'Increases chances of finding valuables while fishing.',
  },
  lure: {
    id: 'lure',
    name: 'Lure',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
    ],
    incompatible: [],
    description: 'Increases fishing speed.',
  },
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty',
    maxLevel: 3,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 12, max: 50 },
      { min: 19, max: 50 },
      { min: 26, max: 50 },
    ],
    incompatible: ['riptide'],
    description: 'Trident returns after being thrown.',
  },
  impaling: {
    id: 'impaling',
    name: 'Impaling',
    maxLevel: 5,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 21 },
      { min: 9, max: 29 },
      { min: 17, max: 37 },
      { min: 25, max: 45 },
      { min: 33, max: 53 },
    ],
    incompatible: [],
    description: 'Extra damage to aquatic mobs.',
  },
  riptide: {
    id: 'riptide',
    name: 'Riptide',
    maxLevel: 3,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 17, max: 50 },
      { min: 24, max: 50 },
      { min: 31, max: 50 },
    ],
    incompatible: ['loyalty', 'channeling'],
    description: 'Propels player when thrown in water/rain.',
  },
  channeling: {
    id: 'channeling',
    name: 'Channeling',
    maxLevel: 1,
    weight: 1,
    treasure: false,
    curse: false,
    levels: [{ min: 25, max: 50 }],
    incompatible: ['riptide'],
    description: 'Summons lightning when thrown in thunderstorm.',
  },
  multishot: {
    id: 'multishot',
    name: 'Multishot',
    maxLevel: 1,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [{ min: 20, max: 50 }],
    incompatible: ['piercing'],
    description: 'Shoot 3 arrows at once.',
  },
  quick_charge: {
    id: 'quick_charge',
    name: 'Quick Charge',
    maxLevel: 3,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 12, max: 50 },
      { min: 32, max: 50 },
      { min: 52, max: 50 }, // level 3 is effectively unreachable from table
    ],
    incompatible: [],
    description: 'Reduces crossbow loading time.',
  },
  piercing: {
    id: 'piercing',
    name: 'Piercing',
    maxLevel: 4,
    weight: 10,
    treasure: false,
    curse: false,
    levels: [
      { min: 1, max: 50 },
      { min: 11, max: 50 },
      { min: 21, max: 50 },
      { min: 31, max: 50 },
    ],
    incompatible: ['multishot'],
    description: 'Arrows pierce through entities.',
  },
  mending: {
    id: 'mending',
    name: 'Mending',
    maxLevel: 1,
    weight: 2,
    treasure: true,
    curse: false,
    levels: [{ min: 25, max: 75 }],
    incompatible: ['infinity'],
    description: 'Repairs item using XP. (Treasure – not from table)',
  },
  vanishing_curse: {
    id: 'vanishing_curse',
    name: 'Curse of Vanishing',
    maxLevel: 1,
    weight: 1,
    treasure: true,
    curse: true,
    levels: [{ min: 25, max: 50 }],
    incompatible: [],
    description: 'Item disappears on death. (Treasure – not from table)',
  },
  binding_curse: {
    id: 'binding_curse',
    name: 'Curse of Binding',
    maxLevel: 1,
    weight: 1,
    treasure: true,
    curse: true,
    levels: [{ min: 25, max: 50 }],
    incompatible: [],
    description: 'Armor cannot be removed. (Treasure – not from table)',
  },
  soul_speed: {
    id: 'soul_speed',
    name: 'Soul Speed',
    maxLevel: 3,
    weight: 1,
    treasure: true,
    curse: false,
    levels: [
      { min: 10, max: 25 },
      { min: 20, max: 35 },
      { min: 30, max: 45 },
    ],
    incompatible: [],
    description: 'Speed on soul sand/soil. (Treasure – not from table)',
  },
  swift_sneak: {
    id: 'swift_sneak',
    name: 'Swift Sneak',
    maxLevel: 3,
    weight: 1,
    treasure: true,
    curse: false,
    levels: [
      { min: 25, max: 75 },
      { min: 50, max: 100 },
      { min: 75, max: 125 },
    ],
    incompatible: [],
    description: 'Move faster while sneaking. (Treasure – not from table)',
  },
  density: {
    id: 'density',
    name: 'Density',
    maxLevel: 5,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 25 },
      { min: 13, max: 33 },
      { min: 21, max: 41 },
      { min: 29, max: 49 },
      { min: 37, max: 57 },
    ],
    incompatible: ['breach', 'smite', 'bane_of_arthropods'],
    description: 'Increases mace damage based on fall distance.',
  },
  breach: {
    id: 'breach',
    name: 'Breach',
    maxLevel: 4,
    weight: 2,
    treasure: false,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
      { min: 42, max: 92 },
    ],
    incompatible: ['density', 'smite', 'bane_of_arthropods'],
    description: 'Reduces enemy armor effectiveness.',
  },
  wind_burst: {
    id: 'wind_burst',
    name: 'Wind Burst',
    maxLevel: 3,
    weight: 2,
    treasure: true,
    curse: false,
    levels: [
      { min: 15, max: 65 },
      { min: 24, max: 74 },
      { min: 33, max: 83 },
    ],
    incompatible: [],
    description: 'Emits wind burst on smash. (Treasure – not from table)',
  },
  lunge: {
    id: 'lunge',
    name: 'Lunge',
    maxLevel: 3,
    weight: 5,
    treasure: false,
    curse: false,
    levels: [
      { min: 5, max: 25 },
      { min: 13, max: 33 },
      { min: 21, max: 41 },
    ],
    incompatible: [],
    description: 'Propels player forward on jab attack with spear.',
  },
};

// All enchantable items in Java Edition 1.21.x (26.2)
// Enchantability values from the wiki
export const ENCHANTABLE_ITEMS: EnchantableItem[] = [
  // === SWORDS ===
  {
    id: 'wooden_sword', name: 'Wooden Sword', category: 'Swords', enchantability: 15, icon: '🗡️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_sword', name: 'Stone Sword', category: 'Swords', enchantability: 5, icon: '🗡️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_sword', name: 'Iron Sword', category: 'Swords', enchantability: 14, icon: '🗡️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_sword', name: 'Golden Sword', category: 'Swords', enchantability: 22, icon: '🗡️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_sword', name: 'Diamond Sword', category: 'Swords', enchantability: 10, icon: '⚔️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_sword', name: 'Netherite Sword', category: 'Swords', enchantability: 15, icon: '⚔️',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === SPEARS ===
  {
    id: 'wooden_spear', name: 'Wooden Spear', category: 'Spears', enchantability: 15, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_spear', name: 'Stone Spear', category: 'Spears', enchantability: 5, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_spear', name: 'Iron Spear', category: 'Spears', enchantability: 14, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_spear', name: 'Golden Spear', category: 'Spears', enchantability: 22, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_spear', name: 'Diamond Spear', category: 'Spears', enchantability: 10, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_spear', name: 'Netherite Spear', category: 'Spears', enchantability: 15, icon: '🔱',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'lunge', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === AXES ===
  {
    id: 'wooden_axe', name: 'Wooden Axe', category: 'Axes', enchantability: 15, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_axe', name: 'Stone Axe', category: 'Axes', enchantability: 5, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_axe', name: 'Iron Axe', category: 'Axes', enchantability: 14, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_axe', name: 'Golden Axe', category: 'Axes', enchantability: 22, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_axe', name: 'Diamond Axe', category: 'Axes', enchantability: 10, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_axe', name: 'Netherite Axe', category: 'Axes', enchantability: 15, icon: '🪓',
    enchantments: ['sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === PICKAXES ===
  {
    id: 'wooden_pickaxe', name: 'Wooden Pickaxe', category: 'Pickaxes', enchantability: 15, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_pickaxe', name: 'Stone Pickaxe', category: 'Pickaxes', enchantability: 5, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_pickaxe', name: 'Iron Pickaxe', category: 'Pickaxes', enchantability: 14, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_pickaxe', name: 'Golden Pickaxe', category: 'Pickaxes', enchantability: 22, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_pickaxe', name: 'Diamond Pickaxe', category: 'Pickaxes', enchantability: 10, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_pickaxe', name: 'Netherite Pickaxe', category: 'Pickaxes', enchantability: 15, icon: '⛏️',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === SHOVELS ===
  {
    id: 'wooden_shovel', name: 'Wooden Shovel', category: 'Shovels', enchantability: 15, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_shovel', name: 'Stone Shovel', category: 'Shovels', enchantability: 5, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_shovel', name: 'Iron Shovel', category: 'Shovels', enchantability: 14, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_shovel', name: 'Golden Shovel', category: 'Shovels', enchantability: 22, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_shovel', name: 'Diamond Shovel', category: 'Shovels', enchantability: 10, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_shovel', name: 'Netherite Shovel', category: 'Shovels', enchantability: 15, icon: '🌿',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === HOES ===
  {
    id: 'wooden_hoe', name: 'Wooden Hoe', category: 'Hoes', enchantability: 15, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'stone_hoe', name: 'Stone Hoe', category: 'Hoes', enchantability: 5, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'iron_hoe', name: 'Iron Hoe', category: 'Hoes', enchantability: 14, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'golden_hoe', name: 'Golden Hoe', category: 'Hoes', enchantability: 22, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'diamond_hoe', name: 'Diamond Hoe', category: 'Hoes', enchantability: 10, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  {
    id: 'netherite_hoe', name: 'Netherite Hoe', category: 'Hoes', enchantability: 15, icon: '🌾',
    enchantments: ['efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === BOWS ===
  {
    id: 'bow', name: 'Bow', category: 'Ranged', enchantability: 1, icon: '🏹',
    enchantments: ['power', 'punch', 'flame', 'infinity', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === CROSSBOWS ===
  {
    id: 'crossbow', name: 'Crossbow', category: 'Ranged', enchantability: 1, icon: '🏹',
    enchantments: ['multishot', 'quick_charge', 'piercing', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === TRIDENTS ===
  {
    id: 'trident', name: 'Trident', category: 'Ranged', enchantability: 1, icon: '🔱',
    enchantments: ['loyalty', 'impaling', 'riptide', 'channeling', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === MACE ===
  {
    id: 'mace', name: 'Mace', category: 'Weapons', enchantability: 1, icon: '🔨',
    enchantments: ['density', 'breach', 'smite', 'bane_of_arthropods', 'unbreaking', 'mending', 'wind_burst', 'vanishing_curse'],
  },
  // === HELMETS ===
  {
    id: 'leather_helmet', name: 'Leather Helmet', category: 'Helmets', enchantability: 15, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'chainmail_helmet', name: 'Chainmail Helmet', category: 'Helmets', enchantability: 12, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'iron_helmet', name: 'Iron Helmet', category: 'Helmets', enchantability: 9, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'golden_helmet', name: 'Golden Helmet', category: 'Helmets', enchantability: 25, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'diamond_helmet', name: 'Diamond Helmet', category: 'Helmets', enchantability: 10, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'netherite_helmet', name: 'Netherite Helmet', category: 'Helmets', enchantability: 15, icon: '🪖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'turtle_helmet', name: 'Turtle Helmet', category: 'Helmets', enchantability: 9, icon: '🐢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'respiration', 'aqua_affinity', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  // === CHESTPLATES ===
  {
    id: 'leather_chestplate', name: 'Leather Chestplate', category: 'Chestplates', enchantability: 15, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'chainmail_chestplate', name: 'Chainmail Chestplate', category: 'Chestplates', enchantability: 12, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'iron_chestplate', name: 'Iron Chestplate', category: 'Chestplates', enchantability: 9, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'golden_chestplate', name: 'Golden Chestplate', category: 'Chestplates', enchantability: 25, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'diamond_chestplate', name: 'Diamond Chestplate', category: 'Chestplates', enchantability: 10, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'netherite_chestplate', name: 'Netherite Chestplate', category: 'Chestplates', enchantability: 15, icon: '🦺',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'elytra', name: 'Elytra', category: 'Chestplates', enchantability: 1, icon: '🦋',
    enchantments: ['unbreaking', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  // === LEGGINGS ===
  {
    id: 'leather_leggings', name: 'Leather Leggings', category: 'Leggings', enchantability: 15, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'chainmail_leggings', name: 'Chainmail Leggings', category: 'Leggings', enchantability: 12, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'iron_leggings', name: 'Iron Leggings', category: 'Leggings', enchantability: 9, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'golden_leggings', name: 'Golden Leggings', category: 'Leggings', enchantability: 25, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'diamond_leggings', name: 'Diamond Leggings', category: 'Leggings', enchantability: 10, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'netherite_leggings', name: 'Netherite Leggings', category: 'Leggings', enchantability: 15, icon: '👖',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'swift_sneak', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  // === BOOTS ===
  {
    id: 'leather_boots', name: 'Leather Boots', category: 'Boots', enchantability: 15, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'chainmail_boots', name: 'Chainmail Boots', category: 'Boots', enchantability: 12, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'iron_boots', name: 'Iron Boots', category: 'Boots', enchantability: 9, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'golden_boots', name: 'Golden Boots', category: 'Boots', enchantability: 25, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'diamond_boots', name: 'Diamond Boots', category: 'Boots', enchantability: 10, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  {
    id: 'netherite_boots', name: 'Netherite Boots', category: 'Boots', enchantability: 15, icon: '👢',
    enchantments: ['protection', 'fire_protection', 'blast_protection', 'projectile_protection', 'thorns', 'unbreaking', 'feather_falling', 'depth_strider', 'frost_walker', 'soul_speed', 'mending', 'vanishing_curse', 'binding_curse'],
  },
  // === FISHING ROD ===
  {
    id: 'fishing_rod', name: 'Fishing Rod', category: 'Tools', enchantability: 1, icon: '🎣',
    enchantments: ['luck_of_the_sea', 'lure', 'unbreaking', 'mending', 'vanishing_curse'],
  },
  // === SHEARS ===
  {
    id: 'shears', name: 'Shears', category: 'Tools', enchantability: 1, icon: '✂️',
    enchantments: ['efficiency', 'silk_touch', 'unbreaking', 'mending', 'vanishing_curse'],
  },
];

export const ITEM_CATEGORIES = [...new Set(ENCHANTABLE_ITEMS.map(i => i.category))];
