import { useState, useMemo } from 'react';
import { ENCHANTABLE_ITEMS, ENCHANTMENTS, ITEM_CATEGORIES, type EnchantmentId } from '../data/enchantments';
import {
  simulateTable,
  findAllPlans,
  isAchievable,
  type WantedEnchant,
  type EnchantmentResult,
  type ThrowPlan,
} from '../engine/enchantEngine';

interface Props {
  xpSeed: number | null;
  onGoToSeed: () => void;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const SLOT_NAMES = ['Top', 'Middle', 'Bottom'];
const SLOT_COLORS = ['#80c080', '#80a0e0', '#e0a040'];
const SLOT_COSTS = ['1 lvl + 1 🪸', '2 lvl + 2 🪸', '3 lvl + 3 🪸'];

export default function EnchantPlanner({ xpSeed, onGoToSeed }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Swords');
  const [selectedItemId, setSelectedItemId] = useState('diamond_sword');
  const [bookshelves, setBookshelves] = useState(15);
  const [wanted, setWanted] = useState<WantedEnchant[]>([]);
  const [unwanted, setUnwanted] = useState<EnchantmentId[]>([]);
  const [plans, setPlans] = useState<ThrowPlan[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [maxThrows, setMaxThrows] = useState(320);
  const [activeTab, setActiveTab] = useState<'plan' | 'preview'>('plan');
  const [selectedPlan, setSelectedPlan] = useState(0);

  const categoryItems = ENCHANTABLE_ITEMS.filter(i => i.category === selectedCategory);
  const selectedItem = ENCHANTABLE_ITEMS.find(i => i.id === selectedItemId);

  const tablePreview = useMemo(() => {
    if (xpSeed === null || !selectedItem) return null;
    return simulateTable(xpSeed, selectedItemId, bookshelves);
  }, [xpSeed, selectedItemId, bookshelves]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const first = ENCHANTABLE_ITEMS.find(i => i.category === cat);
    if (first) {
      setSelectedItemId(first.id);
      setWanted([]);
      setUnwanted([]);
      setPlans(null);
    }
  };

  const handleItemChange = (id: string) => {
    setSelectedItemId(id);
    setWanted([]);
    setUnwanted([]);
    setPlans(null);
  };

  const toggleWanted = (enchId: EnchantmentId) => {
    setWanted(prev => {
      const ench = ENCHANTMENTS[enchId];
      if (!ench) return prev;
      const existing = prev.find(w => w.id === enchId);
      if (existing) {
        const nextLevel = (existing.minLevel % ench.maxLevel) + 1;
        if (nextLevel === 1 && existing.minLevel === ench.maxLevel) {
          return prev.filter(w => w.id !== enchId);
        }
        return prev.map(w => w.id === enchId ? { ...w, minLevel: nextLevel } : w);
      }
      return [...prev, { id: enchId, minLevel: 1 }];
    });
    setPlans(null);
  };

  const toggleUnwanted = (enchId: EnchantmentId, e: React.MouseEvent) => {
    e.preventDefault();
    setUnwanted(prev =>
      prev.includes(enchId) ? prev.filter(id => id !== enchId) : [...prev, enchId]
    );
    setPlans(null);
  };

  const findPlan = () => {
    if (xpSeed === null) return;
    setSearching(true);
    setPlans(null);
    setSelectedPlan(0);
    setTimeout(() => {
      const results = findAllPlans(xpSeed, selectedItemId, wanted, unwanted, maxThrows, bookshelves);
      setPlans(results);
      setSearching(false);
    }, 50);
  };

  const renderEnchantTags = (enchants: EnchantmentResult[], highlight: WantedEnchant[] = []) => (
    <div className="flex flex-wrap gap-1.5">
      {enchants.map(e => {
        const ench = ENCHANTMENTS[e.id];
        if (!ench) return null;
        const isWanted = highlight.some(w => w.id === e.id);
        return (
          <span key={e.id} className={`px-2 py-0.5 rounded text-xs font-bold border ${
            isWanted
              ? 'bg-[#0a3a1a] border-[#20a040] text-[#40e060]'
              : 'bg-[#1a2a10] border-[#2a4020] text-[#70a060]'
          }`}>
            {ench.name} {ROMAN[e.level]}{isWanted ? ' ⭐' : ''}
          </span>
        );
      })}
    </div>
  );

  const getWantedLevel = (enchId: EnchantmentId): number | null =>
    wanted.find(w => w.id === enchId)?.minLevel ?? null;

  const tableEnchants = selectedItem
    ? selectedItem.enchantments.filter(id => !ENCHANTMENTS[id]?.treasure)
    : [];
  const treasureEnchants = selectedItem
    ? selectedItem.enchantments.filter(id => ENCHANTMENTS[id]?.treasure)
    : [];

  const bestPlan = plans && plans.length > 0 ? plans[selectedPlan] ?? plans[0] : null;

  return (
    <div className="space-y-5">
      {/* No Seed Warning */}
      {xpSeed === null && (
        <div className="bg-[#2a1a08] border-2 border-[#c07020] rounded-xl p-5 flex items-center gap-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <div className="text-[#f0b040] font-black text-lg">No Seed Loaded</div>
            <div className="text-[#907040] text-sm mt-1">
              Crack your XP seed first, then come back here to plan enchantments.
            </div>
            <button onClick={onGoToSeed}
              className="mt-2 px-4 py-2 bg-[#4a3010] border border-[#f0a020] text-[#ffe080] font-bold rounded-lg text-sm hover:bg-[#6a5030] transition-all">
              → Go to Seed Cracker
            </button>
          </div>
        </div>
      )}

      {xpSeed !== null && (
        <div className="bg-[#0e1e14] border border-[#20c040] rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm">
          <span className="text-[#20c040] text-lg">✅</span>
          <div>
            <span className="text-[#60c080]">Active XP Seed: </span>
            <span className="font-mono text-[#80e0a0]">
              {xpSeed.toLocaleString()} · 0x{(xpSeed >>> 0).toString(16).toUpperCase().padStart(8, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-[#3a2808] pb-2">
        {(['plan', 'preview'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-t-lg font-bold text-sm border transition-all ${activeTab === t
              ? 'bg-[#2a1808] border-[#f0a020] border-b-[#2a1808] text-[#ffe080] -mb-[2px]'
              : 'bg-[#1a1008] border-[#2a1808] text-[#807050] hover:text-[#c0a060]'}`}>
            {t === 'plan' ? '✨ Enchant Planner' : '🔭 Table Preview'}
          </button>
        ))}
      </div>

      {activeTab === 'plan' && (
        <div className="space-y-5">
          {/* Item Selector */}
          <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
            <h2 className="text-base font-black text-[#ffe080] mb-3 flex items-center gap-2">
              <span>🎒</span> Item to Enchant
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {ITEM_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${selectedCategory === cat
                    ? 'bg-[#4a3010] border-[#c07020] text-[#ffe080]'
                    : 'bg-[#120c04] border-[#3a2010] text-[#806050] hover:border-[#5a4020] hover:text-[#c09060]'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryItems.map(item => (
                <button key={item.id} onClick={() => handleItemChange(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all flex items-center gap-1.5 ${selectedItemId === item.id
                    ? 'bg-[#4a3010] border-[#f0a020] text-[#ffe080]'
                    : 'bg-[#120c04] border-[#3a2010] text-[#a08060] hover:border-[#6a4020] hover:text-[#c0a070]'}`}>
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <span className="text-[#504030] text-[10px]">E:{item.enchantability}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bookshelf + Throw Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-[#ffe080] flex items-center gap-2">
                  <span>📚</span> Max Bookshelves
                </span>
                <span className="text-[#f0a020] font-black">{bookshelves}</span>
              </div>
              <input type="range" min={0} max={15} value={bookshelves}
                onChange={e => setBookshelves(+e.target.value)}
                className="w-full accent-[#f0a020]" />
              <div className="text-xs text-[#605030] mt-1">
                {bookshelves === 15 ? '✅ Max (Level 30)' : `${bookshelves === 0 ? 'No bookshelves' : `Level up to ${bookshelves * 2}`}`}
              </div>
            </div>
            <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-[#ffe080] flex items-center gap-2">
                  <span>📦</span> Max Throws to Search
                </span>
                <span className="text-[#f0a020] font-black">{maxThrows}</span>
              </div>
              <input type="range" min={10} max={640} step={10} value={maxThrows}
                onChange={e => setMaxThrows(+e.target.value)}
                className="w-full accent-[#f0a020]" />
              <div className="text-xs text-[#605030] mt-1">
                {Math.floor(maxThrows / 64)} stacks + {maxThrows % 64} items
              </div>
            </div>
          </div>

          {/* Enchantment Selector */}
          {selectedItem && (
            <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
              <h2 className="text-base font-black text-[#ffe080] mb-1 flex items-center gap-2">
                <span>✨</span> Select Enchantments
              </h2>
              <p className="text-[#807050] text-xs mb-4">
                <strong className="text-[#80e060]">Left-click</strong> to mark WANTED (cycles levels, click beyond max to deselect) ·
                <strong className="text-[#e06060]"> Right-click</strong> to mark AVOID
              </p>

              {tableEnchants.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs text-[#50d050] font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#1a3a10]" />
                    ✅ Available from Enchanting Table
                    <div className="h-px flex-1 bg-[#1a3a10]" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {tableEnchants.map(enchId => {
                      const ench = ENCHANTMENTS[enchId];
                      if (!ench) return null;
                      const wantedLevel = getWantedLevel(enchId);
                      const isUnwanted = unwanted.includes(enchId);
                      const achievable = isAchievable(enchId, 1, selectedItemId, bookshelves);

                      let bgClass = '';
                      let borderClass = '';
                      let textClass = '';
                      if (isUnwanted) {
                        bgClass = 'bg-[#3a0808]'; borderClass = 'border-[#c04040]'; textClass = 'text-[#e06060]';
                      } else if (wantedLevel) {
                        bgClass = 'bg-[#0a3a1a]'; borderClass = 'border-[#20c040]'; textClass = 'text-[#40e060]';
                      } else if (!achievable) {
                        bgClass = 'bg-[#100e08]'; borderClass = 'border-[#2a2010]'; textClass = 'text-[#504030]';
                      } else {
                        bgClass = 'bg-[#1a1408]'; borderClass = 'border-[#4a4010]'; textClass = 'text-[#c0a040]';
                      }

                      return (
                        <div key={enchId} className="relative group">
                          <button
                            onClick={() => {
                              if (isUnwanted) { toggleUnwanted(enchId, { preventDefault: () => {} } as React.MouseEvent); }
                              else { toggleWanted(enchId); }
                            }}
                            onContextMenu={(e) => toggleUnwanted(enchId, e)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition-all
                              ${bgClass} ${borderClass} ${textClass}
                              ${achievable && !isUnwanted ? 'hover:brightness-125' : ''}`}
                          >
                            <div className="font-black text-sm">{ench.name}</div>
                            <div className="text-[10px] opacity-70 mt-0.5">max {ROMAN[ench.maxLevel]}</div>
                            {wantedLevel && (
                              <div className="text-[#40e060] text-xs font-black mt-1">
                                ✓ Want ≥{ROMAN[wantedLevel]}
                              </div>
                            )}
                            {isUnwanted && <div className="text-[#e06060] text-xs font-black mt-1">✗ Avoid</div>}
                            {!achievable && !isUnwanted && !wantedLevel && (
                              <div className="text-[#503020] text-[10px] mt-1">needs more shelves</div>
                            )}
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-20
                            bg-[#0a0806] border border-[#5a4020] rounded-lg p-3 w-52 text-xs shadow-xl pointer-events-none">
                            <div className="font-black text-[#ffe080] mb-1">{ench.name}</div>
                            <div className="text-[#a08050] mb-1">{ench.description}</div>
                            <div className="text-[#706040]">Weight: {ench.weight} (higher = more common)</div>
                            {ench.incompatible.length > 0 && (
                              <div className="mt-1 text-[#a06060] text-[10px]">
                                ⚠ Conflicts: {ench.incompatible.map(id => ENCHANTMENTS[id]?.name).join(', ')}
                              </div>
                            )}
                            <div className="mt-2 text-[#504030] text-[10px]">
                              Power ranges:
                              {ench.levels.map((l, i) => (
                                <span key={i} className="ml-1">{ROMAN[i+1]}:[{l.min}-{l.max}]</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {treasureEnchants.length > 0 && (
                <div>
                  <div className="text-xs text-[#c06060] font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#3a1010]" />
                    🔒 Treasure Only (not from table)
                    <div className="h-px flex-1 bg-[#3a1010]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {treasureEnchants.map(enchId => {
                      const ench = ENCHANTMENTS[enchId];
                      if (!ench) return null;
                      return (
                        <div key={enchId} className="relative group">
                          <div className="px-3 py-2 rounded-lg text-xs border bg-[#120808] border-[#3a1010] text-[#805050] cursor-not-allowed">
                            <div className="font-bold">{ench.name}</div>
                            <div className="text-[#603030] text-[10px]">🔒 {ench.curse ? 'Curse' : 'Treasure'}</div>
                          </div>
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-20
                            bg-[#0a0806] border border-[#5a2020] rounded-lg p-3 w-52 text-xs shadow-xl pointer-events-none">
                            <div className="font-black text-[#ffe080] mb-1">{ench.name}</div>
                            <div className="text-[#c07070] mb-1">⚠️ Cannot be obtained from enchanting table</div>
                            <div className="text-[#806050]">{ench.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selection Summary */}
              {(wanted.length > 0 || unwanted.length > 0) && (
                <div className="mt-4 bg-[#120c04] border border-[#3a2808] rounded-lg p-3 space-y-2">
                  {wanted.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#40d040] text-xs font-black uppercase">Wanted:</span>
                      {wanted.map(w => (
                        <button key={w.id} onClick={() => toggleWanted(w.id)}
                          className="text-[#80e080] text-xs bg-[#0a2a10] border border-[#1a5020] px-2 py-0.5 rounded-full hover:bg-[#0a3a18]">
                          {ENCHANTMENTS[w.id]?.name} ≥{ROMAN[w.minLevel]} ✕
                        </button>
                      ))}
                    </div>
                  )}
                  {unwanted.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#d04040] text-xs font-black uppercase">Avoiding:</span>
                      {unwanted.map(id => (
                        <button key={id} onClick={() => setUnwanted(prev => prev.filter(i => i !== id))}
                          className="text-[#e06060] text-xs bg-[#2a0808] border border-[#5a1010] px-2 py-0.5 rounded-full hover:bg-[#3a1010]">
                          {ENCHANTMENTS[id]?.name} ✕
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Find Plan Button */}
          <button
            onClick={findPlan}
            disabled={xpSeed === null || wanted.length === 0 || searching}
            className={`w-full py-4 font-black text-lg rounded-xl border-2 transition-all
              ${xpSeed !== null && wanted.length > 0 && !searching
                ? 'bg-[#4a2c0e] border-[#f0a020] text-[#ffe080] hover:bg-[#6a4c2e] hover:shadow-xl hover:shadow-[#f0a02040] cursor-pointer'
                : 'bg-[#1e1408] border-[#3a2810] text-[#605040] cursor-not-allowed opacity-50'}`}
          >
            {searching ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🔄</span> Searching throw plans...
              </span>
            ) : (
              <span>✨ Find Best Throw Plan</span>
            )}
          </button>

          {/* Plans */}
          {plans !== null && (
            <div>
              {plans.length === 0 ? (
                <div className="bg-[#2a0808] border-2 border-[#c04040] rounded-xl p-5">
                  <div className="text-[#e06060] font-black text-xl mb-2">❌ No Plan Found</div>
                  <p className="text-[#a05050] text-sm mb-3">
                    No throw combination within {maxThrows} items achieves your desired enchantments.
                  </p>
                  <ul className="space-y-1 text-sm text-[#905050]">
                    <li>• Try increasing max throws (up to 640)</li>
                    <li>• Try reducing the minimum level for some enchantments</li>
                    <li>• Remove some wanted enchantments (fewer requirements = easier to satisfy)</li>
                    <li>• Some enchantment combinations are very rare — try searching for fewer at once</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Plan Selector */}
                  {plans.length > 1 && (
                    <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-4">
                      <div className="text-sm font-black text-[#ffe080] mb-2">
                        Found {plans.length} plan{plans.length > 1 ? 's' : ''}! (showing closest first)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plans.map((p, i) => (
                          <button key={i} onClick={() => setSelectedPlan(i)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedPlan === i
                              ? 'bg-[#4a3010] border-[#f0a020] text-[#ffe080]'
                              : 'bg-[#120c04] border-[#3a2010] text-[#907050] hover:border-[#6a4020]'}`}>
                            Plan {i + 1}: {p.throws} throws · {p.bookshelves}📚 · {SLOT_NAMES[p.slot]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Plan Details */}
                  {bestPlan && (
                    <PlanCard
                      plan={bestPlan}
                      wanted={wanted}
                      itemName={selectedItem?.name ?? ''}
                      maxBookshelves={bookshelves}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-5">
          {/* Current Table State */}
          <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
            <h2 className="text-base font-black text-[#ffe080] mb-1 flex items-center gap-2">
              <span>🔭</span> Current Table Offers
              {xpSeed !== null && <span className="text-[#60a080] text-xs font-normal">(with your current seed)</span>}
            </h2>

            {!xpSeed ? (
              <div className="text-center py-8 text-[#504030]">
                <div className="text-4xl mb-2">🔒</div>
                <div>Crack your seed first to see table predictions</div>
              </div>
            ) : !tablePreview ? (
              <div className="text-center py-4 text-[#504030]">Select an item above</div>
            ) : (
              <>
                {/* Bookshelf selector for preview */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs text-[#907050]">Bookshelves:</span>
                  <input type="range" min={0} max={15} value={bookshelves}
                    onChange={e => setBookshelves(+e.target.value)}
                    className="flex-1 accent-[#f0a020]" />
                  <span className="text-[#f0a020] font-bold w-4">{bookshelves}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {tablePreview.slots.map((slot, i) => (
                    <div key={i} className="bg-[#120c04] border rounded-lg p-4"
                      style={{ borderColor: SLOT_COLORS[i] + '40' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-black text-sm" style={{ color: SLOT_COLORS[i] }}>
                          {SLOT_NAMES[i]} Slot
                        </div>
                        <div className="text-[#f0a020] font-mono font-black text-lg">
                          Lv.{slot.displayLevel}
                        </div>
                      </div>
                      <div className="text-[#505040] text-[10px] mb-2">
                        Cost: {SLOT_COSTS[i]} | Power: {slot.enchantmentCost}
                      </div>
                      {slot.enchantments.length > 0
                        ? renderEnchantTags(slot.enchantments)
                        : <div className="text-[#403030] text-xs italic">No enchantments available</div>
                      }
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* All Bookshelf Counts */}
          {xpSeed !== null && selectedItem && (
            <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
              <h2 className="text-base font-black text-[#ffe080] mb-3 flex items-center gap-2">
                <span>📚</span> All Bookshelf Counts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-[#806050] border-b border-[#3a2010]">
                      <th className="text-left py-2 px-2 font-bold">📚</th>
                      {SLOT_NAMES.map((n, i) => (
                        <th key={i} className="text-left py-2 px-2 font-bold" style={{ color: SLOT_COLORS[i] }}>
                          {n} Slot
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 16 }, (_, i) => 15 - i).map(bs => {
                      const preview = simulateTable(xpSeed, selectedItemId, bs);
                      return (
                        <tr key={bs} className="border-b border-[#1a1008] hover:bg-[#1a1006]">
                          <td className="py-2 px-2 text-[#c0a060] font-bold">{bs}</td>
                          {preview.slots.map((slot, si) => (
                            <td key={si} className="py-2 px-2">
                              <div className="text-[#606050] text-[10px] mb-0.5">Lv.{slot.displayLevel}</div>
                              <div className="flex flex-wrap gap-0.5">
                                {slot.enchantments.map(e => (
                                  <span key={e.id} className="px-1 rounded text-[9px] bg-[#1a2a10] text-[#60a050] border border-[#2a4010]">
                                    {ENCHANTMENTS[e.id]?.name?.split(' ').map(w => w[0]).join('')}{ROMAN[e.level]}
                                  </span>
                                ))}
                                {slot.enchantments.length === 0 && <span className="text-[#403030]">—</span>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Achievability Grid */}
          {selectedItem && (
            <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
              <h2 className="text-base font-black text-[#ffe080] mb-3 flex items-center gap-2">
                <span>📊</span> Achievability with {bookshelves} Bookshelves
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedItem.enchantments.map(enchId => {
                  const ench = ENCHANTMENTS[enchId];
                  if (!ench) return null;
                  return (
                    <div key={enchId} className="bg-[#120c04] border border-[#2a1808] rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-[#c0a060]">{ench.name}</span>
                        {ench.treasure && <span className="text-[#c04040] text-[10px] font-bold">🔒 TREASURE</span>}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: ench.maxLevel }, (_, i) => i + 1).map(lvl => {
                          const ok = !ench.treasure && isAchievable(enchId, lvl, selectedItemId, bookshelves);
                          return (
                            <span key={lvl}
                              title={ench.treasure ? 'Treasure - not from table' : ok ? `${ench.name} ${ROMAN[lvl]} achievable` : `Needs higher modified level`}
                              className={`px-1.5 py-0.5 rounded text-xs font-black cursor-help ${
                                ench.treasure
                                  ? 'bg-[#1a0808] text-[#604040] border border-[#3a1818]'
                                  : ok
                                    ? 'bg-[#0a2a10] text-[#40d040] border border-[#1a5020]'
                                    : 'bg-[#1a1008] text-[#604030] border border-[#2a1810]'
                              }`}>
                              {ROMAN[lvl]}{ench.treasure ? '—' : ok ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-[#504030] text-[10px] mt-1 leading-tight">{ench.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



function PlanCard({
  plan, wanted, itemName, maxBookshelves
}: {
  plan: ThrowPlan;
  wanted: WantedEnchant[];
  itemName: string;
  maxBookshelves: number;
}) {
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
  const SLOT_NAMES = ['Top', 'Middle', 'Bottom'];
  const SLOT_COLORS = ['#80c080', '#80a0e0', '#e0a040'];

  const stepsToDisplay: { n: number; text: string; color?: string }[] = [];
  let stepNum = 1;

  if (plan.bookshelves < maxBookshelves) {
    stepsToDisplay.push({
      n: stepNum++,
      text: `Block ${maxBookshelves - plan.bookshelves} bookshelf/shelves with torches (place a torch in the gap between the shelf and table). Leave only ${plan.bookshelves} active.`,
      color: '#f0c040'
    });
  }

  if (plan.throws > 0) {
    const stacks = Math.floor(plan.throws / 64);
    const remainder = plan.throws % 64;
    stepsToDisplay.push({
      n: stepNum++,
      text: `Drop EXACTLY ${plan.throws} items ONE AT A TIME (press Q while holding them, NOT the stack). That's ${stacks > 0 ? `${stacks} full stack${stacks > 1 ? 's' : ''}${remainder > 0 ? ` + ${remainder} individual item${remainder > 1 ? 's' : ''}` : ''}` : `${plan.throws} individual item${plan.throws > 1 ? 's' : ''}`}. Pick them all back up afterward.`,
      color: '#f0a020'
    });
  } else {
    stepsToDisplay.push({
      n: stepNum++,
      text: 'No items need to be thrown — proceed directly.',
      color: '#80c080'
    });
  }

  stepsToDisplay.push({
    n: stepNum++,
    text: `Enchant a DUMMY item in the ${SLOT_NAMES[plan.slot]} slot (costs ${plan.slot + 1} level${plan.slot > 0 ? 's' : ''} + ${plan.slot + 1} lapis). Use a cheap item like a stone sword or book. This applies the RNG shift.`,
    color: SLOT_COLORS[plan.slot]
  });

  stepsToDisplay.push({
    n: stepNum,
    text: `Now enchant your ${itemName} in the same ${SLOT_NAMES[plan.slot]} slot. You will receive the enchantments shown below!`,
    color: '#80e080'
  });

  return (
    <div className="bg-[#082a10] border-2 border-[#20c040] rounded-xl p-5">
      <div className="text-[#20c040] font-black text-xl mb-4 flex items-center gap-2">
        <span>✅</span> Plan Found!
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#041a08] rounded-lg p-3 text-center border border-[#1a4020]">
          <div className="text-[#40a060] text-xs mb-1">Items to Throw</div>
          <div className="text-[#80e0a0] font-black text-3xl">{plan.throws}</div>
          {plan.throws > 0 && (
            <div className="text-[#304028] text-xs mt-1">
              {Math.floor(plan.throws / 64)}×64 + {plan.throws % 64}
            </div>
          )}
        </div>
        <div className="bg-[#041a08] rounded-lg p-3 text-center border border-[#1a4020]">
          <div className="text-[#40a060] text-xs mb-1">Bookshelves</div>
          <div className="text-[#80e0a0] font-black text-3xl">{plan.bookshelves}</div>
          <div className="text-[#304028] text-xs mt-1">active shelves</div>
        </div>
        <div className="bg-[#041a08] rounded-lg p-3 text-center border border-[#1a4020]">
          <div className="text-[#40a060] text-xs mb-1">Enchant Slot</div>
          <div className="font-black text-2xl" style={{ color: SLOT_COLORS[plan.slot] }}>
            {SLOT_NAMES[plan.slot]}
          </div>
          <div className="text-[#304028] text-xs mt-1">
            {plan.slot + 1} lvl + {plan.slot + 1} lapis
          </div>
        </div>
        <div className="bg-[#041a08] rounded-lg p-3 text-center border border-[#1a4020]">
          <div className="text-[#40a060] text-xs mb-1">Enchants</div>
          <div className="text-[#80e0a0] font-black text-3xl">{plan.enchantments.length}</div>
          <div className="text-[#304028] text-xs mt-1">you'll receive</div>
        </div>
      </div>

      {/* You'll Get */}
      <div className="bg-[#041408] border border-[#1a3018] rounded-lg p-3 mb-4">
        <div className="text-[#40c060] text-xs font-black mb-2">🎁 ENCHANTMENTS YOU'LL RECEIVE:</div>
        <div className="flex flex-wrap gap-2">
          {plan.enchantments.map(e => {
            const ench = ENCHANTMENTS[e.id];
            if (!ench) return null;
            const isWanted = wanted.some(w => w.id === e.id);
            return (
              <span key={e.id}
                className={`px-3 py-1 rounded-full text-sm font-black border ${
                  isWanted
                    ? 'bg-[#0a3a18] border-[#20c040] text-[#40e060]'
                    : 'bg-[#1a2a10] border-[#2a4a18] text-[#70b060]'
                }`}>
                {isWanted ? '⭐ ' : ''}{ench.name} {ROMAN[e.level]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-[#041408] border border-[#1a3018] rounded-lg p-4">
        <div className="text-[#40c060] font-black mb-3">📋 Follow These Steps Exactly:</div>
        <ol className="space-y-3">
          {stepsToDisplay.map(step => (
            <li key={step.n} className="flex gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-black"
                style={{ background: step.color || '#60c060' }}>
                {step.n}
              </div>
              <div className="text-[#70a070] text-sm leading-relaxed pt-0.5">{step.text}</div>
            </li>
          ))}
        </ol>
      </div>

      {/* Warning */}
      <div className="mt-4 bg-[#1a1208] border border-[#4a3010] rounded-lg p-3 text-xs text-[#907050]">
        <strong className="text-[#c09060]">⚠️ IMPORTANT:</strong> From now until you complete step {stepsToDisplay.length},
        do NOT: sprint, jump (to fall), take damage, eat/drink, die, use mending/unbreaking items, kill mobs, or relog.
        Any of these advance your player RNG and will desync everything!
      </div>
    </div>
  );
}
