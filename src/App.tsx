import { useState, useRef } from 'react';
import { ENCHANTABLE_ITEMS, ALL_ENCHANTMENTS } from './data/enchantments';
import {
  slotLevels,
  simulateEnchantments,
  crackXpSeedAsync,
  findThrowPlanAsync,
  type SeedReading,
  type ThrowPlan,
  type EnchantResult,
} from './utils/seedEngine';

// ─── Types & Helpers ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'howto', label: '📖 How It Works' },
  { id: 'cracker', label: '🧮 Seed Cracker' },
  { id: 'planner', label: '🎯 Enchant Planner' },
  { id: 'bestsets', label: '⭐ Best Sets' },
] as const;
type TabId = typeof TABS[number]['id'];

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function romanLevel(n: number) {
  return ['', 'I', 'II', 'III', 'IV', 'V'][n] ?? String(n);
}

const ITEM_CATEGORIES = [
  { label: '⚔️ Swords', ids: ['diamond_sword', 'netherite_sword', 'iron_sword', 'golden_sword', 'stone_sword', 'wooden_sword'] },
  { label: '🪓 Axes', ids: ['diamond_axe', 'netherite_axe', 'iron_axe', 'golden_axe', 'stone_axe', 'wooden_axe'] },
  { label: '⛏️ Pickaxes', ids: ['diamond_pickaxe', 'netherite_pickaxe', 'iron_pickaxe', 'golden_pickaxe', 'stone_pickaxe', 'wooden_pickaxe'] },
  { label: '🔱 Shovels', ids: ['diamond_shovel', 'netherite_shovel', 'iron_shovel', 'golden_shovel'] },
  { label: '🌾 Hoes', ids: ['diamond_hoe', 'netherite_hoe'] },
  { label: '🪖 Helmets', ids: ['diamond_helmet', 'netherite_helmet', 'iron_helmet', 'golden_helmet', 'chainmail_helmet', 'leather_helmet', 'turtle_shell'] },
  { label: '🛡️ Chestplates', ids: ['diamond_chestplate', 'netherite_chestplate', 'iron_chestplate', 'golden_chestplate', 'chainmail_chestplate', 'leather_chestplate'] },
  { label: '👖 Leggings', ids: ['diamond_leggings', 'netherite_leggings', 'iron_leggings', 'golden_leggings', 'chainmail_leggings', 'leather_leggings'] },
  { label: '👢 Boots', ids: ['diamond_boots', 'netherite_boots', 'iron_boots', 'golden_boots', 'chainmail_boots', 'leather_boots'] },
  { label: '🏹 Ranged', ids: ['bow', 'crossbow', 'trident'] },
  { label: '🔨 Other', ids: ['mace', 'fishing_rod'] },
];

// ─── Best Sets Data ───────────────────────────────────────────────────────────

interface BestSetPiece {
  itemId: string;
  enchants: { id: string; level: number }[];
  notes?: string;
}

function getDiamondArmorSet(withThorns: boolean): BestSetPiece[] {
  return [
    {
      itemId: 'diamond_helmet',
      enchants: [
        { id: 'protection', level: 4 },
        { id: 'unbreaking', level: 3 },
        { id: 'respiration', level: 3 },
        { id: 'aqua_affinity', level: 1 },
        ...(withThorns ? [{ id: 'thorns', level: 3 }] : []),
      ],
      notes: 'Protection IV for general damage reduction. Respiration III + Aqua Affinity I are essential for underwater play.',
    },
    {
      itemId: 'diamond_chestplate',
      enchants: [
        { id: 'protection', level: 4 },
        { id: 'unbreaking', level: 3 },
        ...(withThorns ? [{ id: 'thorns', level: 3 }] : []),
      ],
      notes: withThorns
        ? 'Thorns is best on the chestplate — it has the highest durability pool so the extra durability cost is manageable.'
        : 'Pure tanking. Consider Blast Protection IV instead if you fight creepers often.',
    },
    {
      itemId: 'diamond_leggings',
      enchants: [
        { id: 'protection', level: 4 },
        { id: 'unbreaking', level: 3 },
        ...(withThorns ? [{ id: 'thorns', level: 3 }] : []),
      ],
    },
    {
      itemId: 'diamond_boots',
      enchants: [
        { id: 'protection', level: 4 },
        { id: 'unbreaking', level: 3 },
        { id: 'feather_falling', level: 4 },
        { id: 'depth_strider', level: 3 },
        ...(withThorns ? [{ id: 'thorns', level: 3 }] : []),
      ],
      notes: 'Feather Falling IV is one of the most important enchantments. Depth Strider III (mutually exclusive with Frost Walker) for water mobility.',
    },
  ];
}

function getDiamondSwordSet(_withThorns: boolean): BestSetPiece[] {
  return [
    {
      itemId: 'diamond_sword',
      enchants: [
        { id: 'sharpness', level: 5 },
        { id: 'unbreaking', level: 3 },
        { id: 'looting', level: 3 },
        { id: 'sweeping_edge', level: 3 },
        { id: 'fire_aspect', level: 2 },
        { id: 'knockback', level: 2 },
      ],
      notes: 'Sharpness V is king for general combat. Sweeping Edge III greatly boosts crowd damage. Looting III maximizes mob drops. Note: Mending must be added via villager trade.',
    },
  ];
}

function getDiamondPickaxeSet(withSilkTouch: boolean): BestSetPiece[] {
  return [
    {
      itemId: 'diamond_pickaxe',
      enchants: [
        { id: 'efficiency', level: 5 },
        { id: 'unbreaking', level: 3 },
        ...(withSilkTouch
          ? [{ id: 'silk_touch', level: 1 }]
          : [{ id: 'fortune', level: 3 }]),
      ],
      notes: withSilkTouch
        ? 'Silk Touch lets you collect spawners, glass, ice, bookshelves, ores in original form. Mutually exclusive with Fortune.'
        : 'Fortune III maximizes diamond, ancient debris, coal, lapis, and other ore drops. The go-to for mining.',
    },
  ];
}

function getDiamondAxeSet(withSilkTouch: boolean): BestSetPiece[] {
  return [
    {
      itemId: 'diamond_axe',
      enchants: [
        { id: 'sharpness', level: 5 },
        { id: 'efficiency', level: 5 },
        { id: 'unbreaking', level: 3 },
        ...(withSilkTouch
          ? [{ id: 'silk_touch', level: 1 }]
          : [{ id: 'fortune', level: 3 }]),
      ],
      notes: withSilkTouch
        ? 'Combat axe + wood chopping + silk touch for beehives, mushroom blocks, etc. Great multipurpose tool.'
        : 'Combat + wood cutting + Fortune for extra seeds, apples, saplings when chopping trees.',
    },
  ];
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function EnchantmentBadge({ id, level, color = 'purple' }: { id: string; level: number; color?: string }) {
  const enc = ALL_ENCHANTMENTS[id];
  if (!enc) return null;
  const colors: Record<string, string> = {
    purple: 'bg-purple-900/60 border border-purple-500/40 text-purple-200',
    blue: 'bg-blue-900/60 border border-blue-500/40 text-blue-200',
    green: 'bg-green-900/60 border border-green-500/40 text-green-200',
    yellow: 'bg-yellow-900/60 border border-yellow-500/40 text-yellow-200',
    red: 'bg-red-900/60 border border-red-500/40 text-red-200',
    amber: 'bg-amber-900/60 border border-amber-500/40 text-amber-200',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1', colors[color] || colors.purple)}>
      {enc.name}{enc.maxLevel > 1 ? ` ${romanLevel(level)}` : ''}
    </span>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 p-5', className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children, color = 'text-emerald-400' }: { children: React.ReactNode; color?: string }) {
  return <h2 className={cn('text-lg font-bold mb-1', color)}>{children}</h2>;
}

// ─── How It Works Tab ─────────────────────────────────────────────────────────

function HowItWorksTab() {
  return (
    <div className="space-y-5 text-slate-300">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-700/40 p-6 bg-gradient-to-br from-purple-950/60 via-slate-900 to-blue-950/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🔮</span>
            <div>
              <h1 className="text-2xl font-black text-white">Enchantment RNG Manipulation</h1>
              <p className="text-purple-300 text-sm">Control your enchanting table completely — Java Edition only</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Minecraft's enchanting table uses a hidden <span className="text-yellow-300 font-semibold">32-bit XP Seed</span> stored in
            your player data. This single number determines every enchantment you will ever see until you enchant something.
            By finding your seed and manipulating the player RNG via item drops, you can get <em>any enchantment</em> you want.
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-700/40">
          <div className="text-3xl mb-3">🔢</div>
          <h3 className="font-bold text-emerald-400 mb-2">Step 1: Find Your Seed</h3>
          <ol className="space-y-2 text-sm text-slate-300">
            <li><span className="text-emerald-400 font-bold">→</span> Open an enchanting table with 15 bookshelves</li>
            <li><span className="text-emerald-400 font-bold">→</span> Place any item (dirt works)</li>
            <li><span className="text-emerald-400 font-bold">→</span> Note the 3 numbers shown (e.g. <span className="text-white font-mono">5 · 11 · 30</span>)</li>
            <li><span className="text-emerald-400 font-bold">→</span> Enter them in the <strong>Seed Cracker</strong> tab</li>
            <li><span className="text-emerald-400 font-bold">→</span> Repeat with fewer bookshelves for accuracy</li>
          </ol>
        </Card>

        <Card className="border-blue-700/40">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-bold text-blue-400 mb-2">Step 2: Plan Your Enchant</h3>
          <ol className="space-y-2 text-sm text-slate-300">
            <li><span className="text-blue-400 font-bold">→</span> Go to <strong>Enchantment Planner</strong> tab</li>
            <li><span className="text-blue-400 font-bold">→</span> Enter your cracked XP seed</li>
            <li><span className="text-blue-400 font-bold">→</span> Pick the item to enchant</li>
            <li><span className="text-blue-400 font-bold">→</span> Select enchantments you WANT ✓</li>
            <li><span className="text-blue-400 font-bold">→</span> Mark enchantments you DON'T want ✕</li>
            <li><span className="text-blue-400 font-bold">→</span> Click Calculate — get exact throw count!</li>
          </ol>
        </Card>

        <Card className="border-yellow-700/40">
          <div className="text-3xl mb-3">🎲</div>
          <h3 className="font-bold text-yellow-400 mb-2">Step 3: Execute In-Game</h3>
          <ol className="space-y-2 text-sm text-slate-300">
            <li><span className="text-yellow-400 font-bold">→</span> Collect cheap throw items (wooden tools, gravel)</li>
            <li><span className="text-yellow-400 font-bold">→</span> Drop them <strong>one at a time</strong> using Q key</li>
            <li><span className="text-yellow-400 font-bold">→</span> Each throw = <span className="text-yellow-300">4 RNG steps</span></li>
            <li><span className="text-yellow-400 font-bold">→</span> <span className="text-red-400">DON'T</span> sprint/eat/take damage between throws</li>
            <li><span className="text-yellow-400 font-bold">→</span> After the correct throws, enchant immediately!</li>
          </ol>
        </Card>
      </div>

      {/* Mechanics Deep Dive */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-slate-200 mb-3">⚙️ The RNG Mechanics</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900/60 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Java LCG Formula</p>
              <p className="font-mono text-yellow-300 text-xs">next = (seed × 25214903917 + 11) mod 2⁴⁸</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">XP Seed Extraction</p>
              <p className="font-mono text-blue-300 text-xs">xpSeed = (lcgState {'>'}{'>'}{'>'} 17) as 32-bit signed int</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Enchantment Cost</p>
              <p className="font-mono text-green-300 text-xs">eCost = round((lvl + 1 + rand(E/4) + rand(E/4)) × (1 + tri(0.15)))</p>
              <p className="text-slate-500 text-xs mt-1">E = enchantability (diamond=10, gold armor=25)</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-200 mb-3">⚠️ Important Rules</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2 items-start">
              <span className="text-red-400 text-lg leading-none mt-0.5">✗</span>
              <span className="text-slate-300"><strong className="text-red-300">Mending, Frost Walker, Soul Speed, Swift Sneak</strong> are treasure enchantments — NOT obtainable at enchanting table</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-400 text-lg leading-none mt-0.5">✗</span>
              <span className="text-slate-300">Sprinting, eating, taking damage, Mending proc — all advance the RNG unexpectedly</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-red-400 text-lg leading-none mt-0.5">✗</span>
              <span className="text-slate-300">Ctrl+Q drops the whole stack — use Q only to drop one at a time</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-green-400 text-lg leading-none mt-0.5">✓</span>
              <span className="text-slate-300">The XP seed is per-player — same wherever you are</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-green-400 text-lg leading-none mt-0.5">✓</span>
              <span className="text-slate-300">After enchanting, your seed changes — repeat the process for the next enchantment</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-green-400 text-lg leading-none mt-0.5">✓</span>
              <span className="text-slate-300">Works on any server (it's client-side player RNG)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Enchantability Table */}
      <Card>
        <h3 className="font-bold text-slate-200 mb-3">📊 Enchantability by Material</h3>
        <p className="text-slate-400 text-xs mb-3">Higher enchantability = more likely to get high-level and multiple enchantments</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            { mat: 'Gold Armor', val: 25, color: 'text-yellow-300' },
            { mat: 'Gold Tools', val: 22, color: 'text-yellow-400' },
            { mat: 'Netherite/Leather/Wood', val: 15, color: 'text-orange-300' },
            { mat: 'Iron Tools', val: 14, color: 'text-slate-300' },
            { mat: 'Chainmail Armor', val: 12, color: 'text-slate-300' },
            { mat: 'Diamond', val: 10, color: 'text-blue-300' },
            { mat: 'Iron Armor', val: 9, color: 'text-slate-400' },
            { mat: 'Stone/Bow/Rod', val: 5, color: 'text-slate-500' },
          ].map((e) => (
            <div key={e.mat} className="bg-slate-900/50 rounded-lg p-2.5 text-center">
              <div className={cn('text-xl font-bold', e.color)}>{e.val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{e.mat}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Seed Cracker Tab ─────────────────────────────────────────────────────────

function SeedCrackerTab() {
  const [readings, setReadings] = useState<SeedReading[]>([
    { bookshelves: 15, top: 0, middle: 0, bottom: 0 },
  ]);
  const [crackedSeeds, setCrackedSeeds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [previewSeed, setPreviewSeed] = useState<number | null>(null);
  const [previewBs, setPreviewBs] = useState(15);
  const [copiedSeed, setCopiedSeed] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addReading = () => {
    setReadings([...readings, { bookshelves: 15, top: 0, middle: 0, bottom: 0 }]);
  };

  const removeReading = (i: number) => {
    setReadings(readings.filter((_, idx) => idx !== i));
  };

  const updateReading = (i: number, field: keyof SeedReading, value: number) => {
    const next = readings.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    setReadings(next);
  };

  const handleSearch = async () => {
    const valid = readings.filter(r => r.top > 0 && r.middle > 0 && r.bottom > 0);
    if (valid.length === 0) {
      setError('Enter at least one complete reading (all 3 slot values > 0).');
      return;
    }
    setError('');
    setSearching(true);
    setCrackedSeeds([]);
    setProgress(0);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const results = await crackXpSeedAsync(valid, (f) => setProgress(Math.round(f * 100)), abort.signal);
      setCrackedSeeds(results);
      if (results.length === 0 && !abort.signal.aborted) {
        setError('No matching seed found. Check your readings — they must exactly match the game display.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setSearching(false);
  };

  const handleCopy = (seed: number) => {
    navigator.clipboard.writeText(String(seed >>> 0));
    setCopiedSeed(seed);
    setTimeout(() => setCopiedSeed(null), 2000);
  };

  const previewLevels = previewSeed !== null ? slotLevels(previewSeed, previewBs) : null;

  return (
    <div className="space-y-5">
      {/* Instructions Banner */}
      <div className="bg-blue-950/50 border border-blue-700/40 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold text-sm mb-2">📋 Quick Instructions</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Open enchanting table. Place any item. Write down the <strong>3 level numbers</strong> shown.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Add readings below. For <strong>faster, unique results</strong>, add 2+ readings with different bookshelf counts.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Hit <strong>Search</strong> — the tool checks all ~4.3 billion seeds. Takes 1–5 minutes.</span>
          </div>
        </div>
      </div>

      {/* Readings */}
      <Card>
        <SectionTitle color="text-emerald-400">🔢 Enchanting Table Readings</SectionTitle>
        <p className="text-slate-400 text-xs mb-4">The numbers shown in the enchanting table UI (top slot, middle slot, bottom slot)</p>

        <div className="space-y-3">
          {readings.map((r, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl border border-slate-600/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-200">📖 Reading #{i + 1}</span>
                {readings.length > 1 && (
                  <button onClick={() => removeReading(i)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-700/40 rounded">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">📚 Bookshelves (0–15)</label>
                  <input
                    type="number" min={0} max={15}
                    value={r.bookshelves}
                    onChange={(e) => updateReading(i, 'bookshelves', Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">🔼 Top Slot Level</label>
                  <input
                    type="number" min={1} max={30}
                    value={r.top || ''}
                    onChange={(e) => updateReading(i, 'top', parseInt(e.target.value) || 0)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">➡️ Middle Slot Level</label>
                  <input
                    type="number" min={1} max={30}
                    value={r.middle || ''}
                    onChange={(e) => updateReading(i, 'middle', parseInt(e.target.value) || 0)}
                    placeholder="e.g. 11"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">🔽 Bottom Slot Level</label>
                  <input
                    type="number" min={1} max={30}
                    value={r.bottom || ''}
                    onChange={(e) => updateReading(i, 'bottom', parseInt(e.target.value) || 0)}
                    placeholder="e.g. 30"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addReading}
          className="mt-3 text-sm text-slate-300 border border-slate-600 hover:border-emerald-600 hover:text-emerald-400 rounded-lg px-4 py-2 transition-all"
        >
          + Add Another Reading (different bookshelf count)
        </button>
      </Card>

      {error && (
        <div className="bg-red-950/50 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Search Button / Progress */}
      {!searching ? (
        <button
          onClick={handleSearch}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-base"
        >
          🔍 Search All 4,294,967,296 Seeds
        </button>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Searching {(progress / 100 * 4294967296 / 1000000).toFixed(0)}M / 4,294M seeds...
            </span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">This may take 2–5 minutes in your browser. You can keep using other tabs.</p>
            <button onClick={handleStop} className="text-xs px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors">
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {crackedSeeds.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-5">
          <h3 className="text-emerald-400 font-bold text-lg mb-1">
            🎉 Found {crackedSeeds.length} Matching Seed{crackedSeeds.length > 1 ? 's' : ''}!
          </h3>
          {crackedSeeds.length > 1 && (
            <p className="text-slate-400 text-sm mb-3">
              Multiple candidates found. Add more readings with different bookshelf counts to narrow to one.
            </p>
          )}
          <div className="space-y-2 mt-3">
            {crackedSeeds.map((seed) => (
              <div key={seed} className="flex flex-wrap items-center justify-between gap-2 bg-slate-800 rounded-xl px-4 py-3">
                <div>
                  <span className="text-yellow-300 font-mono font-bold text-xl">{seed >>> 0}</span>
                  <span className="text-slate-500 text-sm ml-3 font-mono">0x{(seed >>> 0).toString(16).toUpperCase().padStart(8, '0')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(seed)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-lg transition-colors',
                      copiedSeed === seed
                        ? 'bg-green-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    )}
                  >
                    {copiedSeed === seed ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => setPreviewSeed(seed === previewSeed ? null : seed)}
                    className="text-xs px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {previewSeed === seed ? 'Hide Preview' : '🔮 Preview'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Seed Preview */}
          {previewSeed !== null && (
            <div className="mt-4 bg-slate-800/80 rounded-xl border border-blue-600/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">Slot Levels Preview — Seed {previewSeed >>> 0}</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Bookshelves:</label>
                  <input
                    type="range" min={0} max={15} value={previewBs}
                    onChange={(e) => setPreviewBs(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-white font-bold text-sm w-4">{previewBs}</span>
                </div>
              </div>
              {previewLevels && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  {(['Top', 'Middle', 'Bottom'] as const).map((lbl, idx) => (
                    <div key={lbl} className={cn(
                      'rounded-xl p-4 border',
                      idx === 0 ? 'bg-slate-700/60 border-slate-600' :
                      idx === 1 ? 'bg-indigo-900/30 border-indigo-600/40' :
                      'bg-purple-900/30 border-purple-600/40'
                    )}>
                      <div className="text-xs text-slate-400 mb-1">{lbl} Slot</div>
                      <div className="text-3xl font-black text-white">{previewLevels[idx]}</div>
                      <div className="text-xs text-slate-500 mt-1">levels req.</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 bg-blue-950/40 border border-blue-700/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm font-semibold">✅ Next Step:</p>
            <p className="text-slate-300 text-sm mt-1">
              Copy your seed and go to the <strong>🎯 Enchantment Planner</strong> tab to find how many items to throw for your desired enchantment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Enchantment Planner Tab ──────────────────────────────────────────────────

function EnchantmentPlannerTab() {
  const [xpSeed, setXpSeed] = useState('');
  const [selectedItem, setSelectedItem] = useState('diamond_sword');
  const [bookshelves, setBookshelves] = useState(15);
  const [throwItem, setThrowItem] = useState('wooden_pickaxe');
  const [wanted, setWanted] = useState<Record<string, number>>({});
  const [unwanted, setUnwanted] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState<ThrowPlan | null>(null);
  const [computing, setComputing] = useState(false);
  const [computeProgress, setComputeProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewSlots, setPreviewSlots] = useState<EnchantResult[][] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const item = ENCHANTABLE_ITEMS.find((i) => i.id === selectedItem);
  const enchantments = item?.enchantments || [];

  const seedNum = parseInt(xpSeed);
  const seedValid = !isNaN(seedNum);

  const toggleWanted = (encId: string, level: number) => {
    setWanted((prev) => {
      const next = { ...prev };
      if (next[encId] === level) delete next[encId];
      else next[encId] = level;
      return next;
    });
    setUnwanted((prev) => { const n = new Set(prev); n.delete(encId); return n; });
  };

  const toggleUnwanted = (encId: string) => {
    setUnwanted((prev) => {
      const n = new Set(prev);
      if (n.has(encId)) n.delete(encId); else n.add(encId);
      return n;
    });
    setWanted((prev) => { const n = { ...prev }; delete n[encId]; return n; });
  };

  const handlePreview = () => {
    if (!seedValid) { setError('Enter a valid XP seed'); return; }
    const all = [0, 1, 2].map((slot) => simulateEnchantments(seedNum, selectedItem, slot as 0|1|2, bookshelves));
    setPreviewSlots(all);
    setError('');
  };

  const handleCalculate = async () => {
    if (!seedValid) { setError('Enter a valid XP seed from the Seed Cracker tab'); return; }
    if (Object.keys(wanted).length === 0) { setError('Select at least one enchantment you want (click a level button)'); return; }
    setError('');
    setComputing(true);
    setPlan(null);
    setComputeProgress(0);
    const abort = new AbortController();
    abortRef.current = abort;
    const wantedList = Object.entries(wanted).map(([id, level]) => ({ id, level }));
    const unwantedList = Array.from(unwanted);
    try {
      const result = await findThrowPlanAsync(
        seedNum, selectedItem, wantedList, unwantedList,
        bookshelves, 1_000_000, throwItem,
        (t, max) => setComputeProgress(Math.round((t / max) * 100)),
        abort.signal
      );
      if (!abort.signal.aborted) setPlan(result);
    } finally {
      setComputing(false);
    }
  };

  const handleStop = () => { abortRef.current?.abort(); setComputing(false); };

  const wantedCount = Object.keys(wanted).length;
  const unwantedCount = unwanted.size;

  return (
    <div className="space-y-5">
      {/* Setup */}
      <Card>
        <SectionTitle color="text-blue-400">⚙️ Configuration</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">🔑 XP Seed (from Seed Cracker)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={xpSeed}
                onChange={(e) => setXpSeed(e.target.value)}
                placeholder="e.g. 1234567890"
                className={cn(
                  'flex-1 bg-slate-900 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors',
                  seedValid && xpSeed ? 'border-emerald-600 focus:border-emerald-500' : 'border-slate-600 focus:border-blue-500'
                )}
              />
              <button
                onClick={handlePreview}
                className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                👁 Preview
              </button>
            </div>
            {seedValid && xpSeed && (
              <p className="text-xs text-emerald-500 mt-1">✓ Valid seed</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">🔨 Item to Enchant</label>
            <select
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value);
                setWanted({}); setUnwanted(new Set()); setPlan(null); setPreviewSlots(null);
              }}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <optgroup key={cat.label} label={cat.label}>
                  {cat.ids.map((id) => {
                    const it = ENCHANTABLE_ITEMS.find((i) => i.id === id);
                    return it ? <option key={id} value={id}>{it.emoji} {it.name}</option> : null;
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              📚 Max Active Bookshelves: <span className="text-white font-bold">{bookshelves}</span>
              <span className="text-slate-500 ml-2">({bookshelves === 15 ? 'Max enchants' : `Level ${slotLevels(seedValid ? seedNum : 0, bookshelves)[2]} bottom slot`})</span>
            </label>
            <input type="range" min={0} max={15} value={bookshelves}
              onChange={(e) => setBookshelves(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">🗑️ Throw Item (cheap item to drop)</label>
            <select
              value={throwItem}
              onChange={(e) => setThrowItem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="wooden_pickaxe">🪵 Wooden Pickaxe</option>
              <option value="stone_pickaxe">⬛ Stone Pickaxe</option>
              <option value="wooden_sword">🗡️ Wooden Sword</option>
              <option value="gravel">🪨 Gravel</option>
              <option value="dirt">🟫 Dirt</option>
              <option value="cobblestone">🟤 Cobblestone</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">You'll drop this many times. Use any cheap/available item.</p>
          </div>
        </div>
      </Card>

      {/* Preview Slots */}
      {previewSlots && (
        <Card className="border-blue-700/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">🔮 Current Slot Enchantments (Seed {seedNum >>> 0})</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {previewSlots.map((slot, idx) => (
              <div key={idx} className={cn(
                'rounded-lg p-3 border',
                idx === 0 ? 'bg-slate-700/40 border-slate-600' :
                idx === 1 ? 'bg-indigo-900/20 border-indigo-700/40' :
                'bg-purple-900/20 border-purple-700/40'
              )}>
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  {['Top', 'Middle', 'Bottom'][idx]} Slot
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {slot.length > 0
                    ? slot.map((e, i) => <EnchantmentBadge key={i} id={e.id} level={e.level} color={['blue', 'purple', 'amber'][idx] as any} />)
                    : <span className="text-slate-600 text-xs">No enchantments</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Enchantment Selector */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <SectionTitle color="text-purple-400">🎯 Choose Enchantments</SectionTitle>
          {(wantedCount > 0 || unwantedCount > 0) && (
            <div className="flex gap-2 text-xs">
              {wantedCount > 0 && <span className="bg-green-900/50 border border-green-700/40 text-green-300 px-2 py-1 rounded-full">{wantedCount} wanted</span>}
              {unwantedCount > 0 && <span className="bg-red-900/50 border border-red-700/40 text-red-300 px-2 py-1 rounded-full">{unwantedCount} excluded</span>}
            </div>
          )}
        </div>
        <p className="text-slate-400 text-xs mb-4">
          Click a <span className="text-green-400">level button</span> to WANT that enchantment at that level.
          Click <span className="text-red-400">✕</span> to EXCLUDE it. Only enchantments obtainable from the table are shown.
        </p>

        <div className="space-y-2">
          {enchantments.map((encId) => {
            const enc = ALL_ENCHANTMENTS[encId];
            if (!enc) return null;
            const isWanted = wanted[encId] !== undefined;
            const isUnwanted = unwanted.has(encId);
            const conflictsWithWanted = Object.keys(wanted).some(wid => {
              if (wid === encId) return false;
              return enc.incompatible?.includes(wid) || ALL_ENCHANTMENTS[wid]?.incompatible?.includes(encId);
            });

            return (
              <div key={encId} className={cn(
                'rounded-xl border p-3 transition-all',
                isWanted ? 'bg-green-950/40 border-green-600/50' :
                isUnwanted ? 'bg-red-950/40 border-red-600/50' :
                conflictsWithWanted ? 'bg-slate-900/30 border-slate-700/30 opacity-50' :
                'bg-slate-900/40 border-slate-700/40 hover:border-slate-600'
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        'font-semibold text-sm',
                        isWanted ? 'text-green-300' : isUnwanted ? 'text-red-300' : 'text-slate-200'
                      )}>
                        {enc.name}
                        {enc.maxLevel > 1 && <span className="text-slate-500 text-xs ml-1">max {romanLevel(enc.maxLevel)}</span>}
                      </span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        enc.weight === 10 ? 'bg-green-900/40 text-green-400' :
                        enc.weight === 5 ? 'bg-blue-900/40 text-blue-400' :
                        enc.weight === 2 ? 'bg-orange-900/40 text-orange-400' :
                        'bg-red-900/40 text-red-400'
                      )}>
                        {enc.weight === 10 ? 'Common' : enc.weight === 5 ? 'Uncommon' : enc.weight === 2 ? 'Rare' : 'Very Rare'}
                      </span>
                      {conflictsWithWanted && !isWanted && !isUnwanted && (
                        <span className="text-xs text-amber-500">⚠️ conflicts</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{enc.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {enc.maxLevel > 1 ? (
                      <div className="flex gap-1">
                        {Array.from({ length: enc.maxLevel }, (_, i) => i + 1).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => toggleWanted(encId, lvl)}
                            disabled={conflictsWithWanted && wanted[encId] !== lvl}
                            className={cn(
                              'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                              wanted[encId] === lvl
                                ? 'bg-green-600 text-white shadow shadow-green-900'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                              conflictsWithWanted && wanted[encId] !== lvl ? 'cursor-not-allowed opacity-40' : ''
                            )}
                          >
                            {romanLevel(lvl)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleWanted(encId, 1)}
                        disabled={conflictsWithWanted && !isWanted}
                        className={cn(
                          'px-3 h-7 rounded-lg text-xs font-bold transition-all',
                          isWanted ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                          conflictsWithWanted && !isWanted ? 'cursor-not-allowed opacity-40' : ''
                        )}
                      >
                        ✓ Want
                      </button>
                    )}
                    <button
                      onClick={() => toggleUnwanted(encId)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                        isUnwanted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-red-950 hover:text-red-400 border border-slate-700'
                      )}
                      title="Exclude this enchantment"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {error && (
        <div className="bg-red-950/50 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">⚠️ {error}</div>
      )}

      {/* Calculate */}
      {!computing ? (
        <button
          onClick={handleCalculate}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 text-base"
        >
          🎯 Calculate Throw Plan
        </button>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Scanning seeds... ({computeProgress}%)
            </span>
            <button onClick={handleStop} className="text-xs px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg">Stop</button>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all" style={{ width: `${computeProgress}%` }} />
          </div>
        </div>
      )}

      {/* Plan Result */}
      {plan && (
        <div className={cn(
          'rounded-2xl border p-6',
          plan.possible ? 'bg-emerald-950/40 border-emerald-600/40' : 'bg-red-950/40 border-red-600/40'
        )}>
          {plan.possible ? (
            <>
              <h3 className="text-2xl font-black text-emerald-400 mb-5">✅ Plan Found!</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/60 rounded-2xl p-5 text-center border border-yellow-700/30">
                  <div className="text-4xl font-black text-yellow-300">{plan.throws}</div>
                  <div className="text-sm text-slate-400 mt-1 font-medium">Items to Throw</div>
                  <div className="text-xs text-slate-500 mt-1">Q key, one at a time</div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-5 text-center border border-blue-700/30">
                  <div className="text-4xl font-black text-blue-300">{plan.bookshelves}</div>
                  <div className="text-sm text-slate-400 mt-1 font-medium">Bookshelves Active</div>
                  <div className="text-xs text-slate-500 mt-1">Block others w/ torches</div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-5 text-center border border-purple-700/30">
                  <div className="text-2xl font-black text-purple-300">Bottom</div>
                  <div className="text-sm text-slate-400 mt-1 font-medium">Use Bottom Slot</div>
                  <div className="text-xs text-slate-500 mt-1">Highest enchant level</div>
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-xl p-4 mb-5">
                <h4 className="text-sm font-bold text-slate-200 mb-2">🎁 You'll Receive These Enchantments:</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.expectedEnchantments.map((e, i) => (
                    <EnchantmentBadge key={i} id={e.id} level={e.level} color="green" />
                  ))}
                </div>
              </div>

              <div className="bg-yellow-950/40 border border-yellow-700/40 rounded-xl p-5">
                <h4 className="text-yellow-400 font-bold mb-3 text-sm">📋 Step-by-Step In-Game Guide:</h4>
                <ol className="space-y-2.5 text-sm text-slate-300">
                  {plan.bookshelves < bookshelves && (
                    <li className="flex gap-2.5">
                      <span className="text-yellow-400 font-bold shrink-0">Step 1.</span>
                      <span>Block <strong>{bookshelves - plan.bookshelves} bookshelf/shelves</strong> with a torch or carpet so only <strong>{plan.bookshelves}</strong> are active.</span>
                    </li>
                  )}
                  <li className="flex gap-2.5">
                    <span className="text-yellow-400 font-bold shrink-0">Step {plan.bookshelves < bookshelves ? 2 : 1}.</span>
                    <span>Grab <strong>{plan.throws} {plan.throwItem.replace(/_/g, ' ')}{plan.throws !== 1 ? 's' : ''}</strong> from your inventory (or any cheap items).</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-yellow-400 font-bold shrink-0">Step {plan.bookshelves < bookshelves ? 3 : 2}.</span>
                    <span>
                      <strong>Drop exactly {plan.throws} item{plan.throws !== 1 ? 's' : ''}</strong> using
                      <kbd className="bg-slate-700 border border-slate-500 px-1.5 py-0.5 rounded text-xs mx-1 font-mono">Q</kbd>
                      {plan.throws !== 1 && '(one at a time — do NOT use Ctrl+Q which drops the whole stack)'}.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-yellow-400 font-bold shrink-0">Step {plan.bookshelves < bookshelves ? 4 : 3}.</span>
                    <span className="text-red-300">⚠️ Do NOT sprint, eat, take damage, use mending, or do anything else between throws. These advance the RNG unexpectedly.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-yellow-400 font-bold shrink-0">Step {plan.bookshelves < bookshelves ? 5 : 4}.</span>
                    <span>Immediately open the enchanting table, place your item, and <strong>click the bottom slot</strong> to enchant.</span>
                  </li>
                </ol>
              </div>

              {plan.throws === 0 && (
                <div className="mt-3 bg-emerald-950/40 border border-emerald-700/30 rounded-lg p-3">
                  <p className="text-emerald-300 text-sm">🎊 No throws needed! Enchant immediately with your current seed.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-black text-red-400 mb-3">❌ Cannot Achieve This</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{plan.reason}</p>
              <div className="mt-4 bg-slate-800/40 rounded-lg p-4 text-sm text-slate-400 space-y-1.5">
                <p>💡 <strong>Suggestions:</strong></p>
                <p>• Treasure enchantments (Mending, Frost Walker, Soul Speed, Swift Sneak) cannot come from the table</p>
                <p>• Sharpness V alone is very achievable but combined with multiple others may need many throws</p>
                <p>• Try targeting one or two specific enchantments per session</p>
                <p>• Use the <strong>⭐ Best Sets</strong> tab to see what's realistically achievable in one enchantment</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Best Sets Tab ────────────────────────────────────────────────────────────

function BestSetsTab() {
  const [withThorns, setWithThorns] = useState(false);
  const [pickaxeSilk, setPickaxeSilk] = useState(false);
  const [axeSilk, setAxeSilk] = useState(false);
  const [activeSet, setActiveSet] = useState<'armor' | 'sword' | 'pickaxe' | 'axe'>('armor');

  const currentSet =
    activeSet === 'armor' ? getDiamondArmorSet(withThorns) :
    activeSet === 'sword' ? getDiamondSwordSet(withThorns) :
    activeSet === 'pickaxe' ? getDiamondPickaxeSet(pickaxeSilk) :
    getDiamondAxeSet(axeSilk);

  const itemMeta = ENCHANTABLE_ITEMS.reduce((acc, i) => {
    acc[i.id] = { emoji: i.emoji, name: i.name };
    return acc;
  }, {} as Record<string, { emoji: string; name: string }>);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-950/50 to-orange-950/30 border border-amber-700/40 rounded-2xl p-5">
        <h2 className="text-xl font-black text-amber-400 mb-1">⭐ Best Diamond Gear Enchantment Sets</h2>
        <p className="text-slate-400 text-sm">Optimal enchantments for end-game diamond gear. Toggle options with the switches below.</p>
      </div>

      {/* Set Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {([
          { key: 'armor', icon: '🛡️', label: 'Full Armor Set' },
          { key: 'sword', icon: '⚔️', label: 'Diamond Sword' },
          { key: 'pickaxe', icon: '⛏️', label: 'Diamond Pickaxe' },
          { key: 'axe', icon: '🪓', label: 'Diamond Axe' },
        ] as const).map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSet(s.key)}
            className={cn(
              'py-3 px-3 rounded-xl text-sm font-semibold transition-all text-center',
              activeSet === s.key
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            )}
          >
            <div className="text-xl mb-1">{s.icon}</div>
            {s.label}
          </button>
        ))}
      </div>

      {/* Toggle Options */}
      <Card className="border-slate-600">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">⚙️ Options</h3>
        <div className="flex flex-wrap gap-4">
          {(activeSet === 'armor' || activeSet === 'sword') && (
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                onClick={() => setWithThorns(!withThorns)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-all',
                  withThorns ? 'bg-emerald-600' : 'bg-slate-600'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow',
                  withThorns ? 'right-1' : 'left-1'
                )} />
              </button>
              <span className="text-sm text-slate-300">
                Include <span className="text-purple-300 font-semibold">Thorns III</span>
              </span>
              <span className="text-xs text-slate-500">(reflects damage, costs more durability)</span>
            </label>
          )}
          {activeSet === 'pickaxe' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                onClick={() => setPickaxeSilk(!pickaxeSilk)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-all',
                  pickaxeSilk ? 'bg-blue-600' : 'bg-amber-600'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow',
                  pickaxeSilk ? 'right-1' : 'left-1'
                )} />
              </button>
              <span className="text-sm text-slate-300">
                {pickaxeSilk
                  ? <span><span className="text-blue-300 font-semibold">🪄 Silk Touch</span> edition</span>
                  : <span><span className="text-amber-300 font-semibold">💎 Fortune III</span> edition</span>
                }
              </span>
              <span className="text-xs text-slate-500">(mutually exclusive)</span>
            </label>
          )}
          {activeSet === 'axe' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                onClick={() => setAxeSilk(!axeSilk)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-all',
                  axeSilk ? 'bg-blue-600' : 'bg-amber-600'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow',
                  axeSilk ? 'right-1' : 'left-1'
                )} />
              </button>
              <span className="text-sm text-slate-300">
                {axeSilk
                  ? <span><span className="text-blue-300 font-semibold">🪄 Silk Touch</span> edition</span>
                  : <span><span className="text-amber-300 font-semibold">💎 Fortune III</span> edition</span>
                }
              </span>
            </label>
          )}
        </div>
      </Card>

      {/* Equipment Cards */}
      <div className="space-y-4">
        {currentSet.map((piece) => {
          const meta = itemMeta[piece.itemId] || { emoji: '📦', name: piece.itemId };
          const totalEnchants = piece.enchants.length;
          return (
            <div key={piece.itemId} className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-900/60 border-b border-slate-700">
                <span className="text-3xl">{meta.emoji}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{meta.name}</h3>
                  <p className="text-xs text-slate-500">{totalEnchants} enchantment{totalEnchants !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="p-5">
                {/* Enchantment Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {piece.enchants.map((e, i) => (
                    <EnchantmentBadge key={i} id={e.id} level={e.level} color="purple" />
                  ))}
                </div>

                {/* Detailed Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {piece.enchants.map((e) => {
                    const enc = ALL_ENCHANTMENTS[e.id];
                    return enc ? (
                      <div key={e.id} className="flex items-start gap-2.5 bg-slate-900/40 rounded-lg p-2.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            {enc.name}{enc.maxLevel > 1 ? ` ${romanLevel(e.level)}` : ''}
                          </div>
                          <div className="text-xs text-slate-500">{enc.description}</div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>

                {piece.notes && (
                  <div className="flex gap-2 bg-blue-950/30 border border-blue-800/30 rounded-lg p-3">
                    <span className="text-blue-400 shrink-0">💡</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{piece.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* General Tips */}
      <Card className="border-amber-700/30">
        <h3 className="text-amber-400 font-bold mb-3">💡 Pro Tips</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="space-y-2">
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span><strong>Mending</strong> MUST come from fishing/librarians — not obtainable at table</span></p>
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span><strong>Sharpness V</strong> beats Fire Aspect in raw DPS — prioritize it</span></p>
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span>Keep <strong>two pickaxes</strong>: one Fortune III (ore mining), one Silk Touch (glass/spawners)</span></p>
          </div>
          <div className="space-y-2">
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span><strong>Protection IV</strong> is generally better than specialized protections unless you have a specific threat</span></p>
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span><strong>Feather Falling IV</strong> is often more valuable than extra protection — fall damage is deadly</span></p>
            <p className="flex gap-2"><span className="text-amber-400">•</span> <span>Use the <strong>Enchantment Planner</strong> to get these exact enchantments from the table!</span></p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('howto');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="text-3xl">🔮</div>
              <div className="absolute -bottom-1 -right-1 text-xs">✨</div>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-white leading-tight">
                Minecraft Enchantment Seed Calculator
              </h1>
              <p className="text-xs text-slate-400">Java Edition 1.21+ · RNG Manipulation · Item Drop Method</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0',
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'howto' && <HowItWorksTab />}
        {activeTab === 'cracker' && <SeedCrackerTab />}
        {activeTab === 'planner' && <EnchantmentPlannerTab />}
        {activeTab === 'bestsets' && <BestSetsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 mt-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            Minecraft Enchantment Seed Calculator · Java Edition 1.21+ · Based on{' '}
            <span className="text-slate-500">Earthcomputer's EnchantmentCracker</span> research
          </p>
          <p className="text-slate-700 text-xs mt-1">
            Not affiliated with Mojang Studios. For educational and single-player use.
          </p>
        </div>
      </footer>
    </div>
  );
}
