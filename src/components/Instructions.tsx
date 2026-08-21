interface Props {
  onGetStarted: () => void;
}

export default function Instructions({ onGetStarted }: Props) {
  const steps = [
    {
      num: '01',
      title: 'The XP Seed',
      icon: '🌱',
      color: '#20c040',
      desc: "Every player has a hidden 32-bit XP seed stored in their save file. This seed controls exactly what enchantments your table will ever offer — 4 billion possible seeds, one per player.",
    },
    {
      num: '02',
      title: 'Cracking the Seed',
      icon: '🔍',
      color: '#2080f0',
      desc: "By reading the 3 slot numbers shown at your enchanting table with known bookshelf counts, we can reverse-engineer your XP seed. Each reading drastically narrows the possibilities. Usually 2–3 readings give a unique match.",
    },
    {
      num: '03',
      title: 'Item Drop Manipulation',
      icon: '📦',
      color: '#e040a0',
      desc: "Throwing (dropping) items onto the ground advances your Player RNG by exactly 4 steps per item. This shifts which enchantments the table will offer next. By counting throws precisely, you control the outcome.",
    },
    {
      num: '04',
      title: 'Getting Your Enchant',
      icon: '✨',
      color: '#f0a020',
      desc: "After throwing the calculated number of items, enchant a dummy item first (to apply the RNG change to your XP seed), then enchant your real item in the indicated slot with the shown bookshelf count.",
    },
  ];

  const warnings = [
    "❌ Do NOT sprint (generates RNG steps)",
    "❌ Do NOT take damage (generates RNG steps)",
    "❌ Do NOT let mobs attack you",
    "❌ Do NOT die or relog",
    "❌ Do NOT use mending items while gaining XP",
    "❌ Do NOT use Unbreaking items",
    "❌ Do NOT eat or drink",
    "❌ Do NOT use an anvil",
    "❌ Do NOT kill any mobs",
    "✅ Use a chest to store items (not dropping!)",
    "✅ Throw items ONE at a time (not as stacks)",
    "✅ Pick them all back up after",
  ];

  return (
    <div className="space-y-6">
      {/* How It Works */}
      <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-6">
        <h2 className="text-2xl font-black text-[#ffe080] mb-2 flex items-center gap-2">
          <span>📖</span> How Enchant Seed Manipulation Works
        </h2>
        <p className="text-[#b08050] mb-6 text-sm">
          Minecraft's enchanting table uses a deterministic random number generator. Once we know your seed, enchantments become predictable — and controllable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map(step => (
            <div key={step.num} className="bg-[#120c04] border border-[#3a2808] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{step.icon}</span>
                <div>
                  <div className="text-xs font-mono" style={{ color: step.color }}>STEP {step.num}</div>
                  <div className="font-bold text-[#ffe0a0] text-base">{step.title}</div>
                </div>
              </div>
              <p className="text-[#a08050] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preparation */}
      <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-6">
        <h2 className="text-xl font-black text-[#ffe080] mb-4 flex items-center gap-2">
          <span>🎒</span> What You Need to Prepare
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-[#80d080] mb-3">Required Materials</h3>
            <ul className="space-y-2 text-sm text-[#a08050]">
              <li className="flex items-start gap-2"><span>⚗️</span><span>An <strong className="text-[#ffe080]">Enchanting Table</strong> with up to 15 bookshelves around it</span></li>
              <li className="flex items-start gap-2"><span>🪨</span><span><strong className="text-[#ffe080]">Dummy items</strong> to enchant (e.g. stone swords, wooden pickaxes) — at least 3-4</span></li>
              <li className="flex items-start gap-2"><span>💎</span><span>The <strong className="text-[#ffe080]">item you actually want</strong> enchanted (kept safe in a chest until needed)</span></li>
              <li className="flex items-start gap-2"><span>💜</span><span><strong className="text-[#ffe080]">Lapis Lazuli</strong> — at least 15 pieces</span></li>
              <li className="flex items-start gap-2"><span>📦</span><span><strong className="text-[#ffe080]">5+ stacks of any throwable item</strong> (e.g. cobblestone, sticks) to drop</span></li>
              <li className="flex items-start gap-2"><span>🔦</span><span><strong className="text-[#ffe080]">Torches</strong> to block bookshelves (1 bookshelf per torch slot)</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-[#f06060] mb-3">⚠️ Critical Rules (While Using Tool)</h3>
            <ul className="space-y-1 text-sm text-[#a08050]">
              {warnings.map((w, i) => (
                <li key={i} className={w.startsWith('✅') ? 'text-[#70c070]' : 'text-[#c07070]'}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Step by Step */}
      <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-6">
        <h2 className="text-xl font-black text-[#ffe080] mb-4 flex items-center gap-2">
          <span>📋</span> Step-by-Step Workflow
        </h2>
        <ol className="space-y-4">
          {[
            {
              step: 1, color: '#20c040',
              title: 'Get initial enchanting data',
              desc: 'Put a dummy item in the enchanting table. Read all 3 slot numbers AND hover each slot for the enchantment hint. Enter this into the Seed Cracker tab.',
            },
            {
              step: 2, color: '#2080f0',
              title: 'Enchant the dummy item (slot 1 only)',
              desc: 'Click the cheapest enchant (top slot, costs 1 level + 1 lapis). This advances your XP seed. Put another dummy item in the table.',
            },
            {
              step: 3, color: '#e040a0',
              title: 'Read the table again',
              desc: 'Record the new 3 slot numbers. Add this as a second reading. Repeat until the tool finds a unique seed (usually 2–3 readings).',
            },
            {
              step: 4, color: '#f0a020',
              title: 'Select your desired enchantment',
              desc: 'Go to Step 2: Plan Enchants. Choose your item and select the enchantments you want. The tool shows if they\'re possible and how many items to throw.',
            },
            {
              step: 5, color: '#c040f0',
              title: 'Throw the items & enchant dummy',
              desc: 'Drop the calculated number of items ONE AT A TIME (Q key). Then enchant a dummy in the slot shown. Finally, enchant your real item!',
            },
          ].map(({ step, color, title, desc }) => (
            <li key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: color, color: '#000' }}>
                {step}
              </div>
              <div>
                <div className="font-bold text-[#ffe0a0]">{title}</div>
                <div className="text-sm text-[#907050] mt-0.5">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Technical Info */}
      <div className="bg-[#0e1e14] border border-[#1a4030] rounded-xl p-6">
        <h2 className="text-xl font-black text-[#80e0b0] mb-3 flex items-center gap-2">
          <span>🔬</span> Technical Background
        </h2>
        <div className="text-sm text-[#60a080] space-y-2 leading-relaxed">
          <p>• Minecraft uses Java's <code className="bg-[#0a1a10] px-1 rounded">java.util.Random</code> LCG with multiplier <code className="bg-[#0a1a10] px-1 rounded">0x5DEECE66D</code> and addend <code className="bg-[#0a1a10] px-1 rounded">0xB</code> on a 48-bit state.</p>
          <p>• The XP seed (32-bit) is stored in player NBT as <code className="bg-[#0a1a10] px-1 rounded">XpSeed</code>. It equals <code className="bg-[#0a1a10] px-1 rounded">(int)(playerSeed &gt;&gt;&gt; 17)</code>.</p>
          <p>• Slot levels use 2 RNG calls: <code className="bg-[#0a1a10] px-1 rounded">nextInt(8)</code> and <code className="bg-[#0a1a10] px-1 rounded">nextInt(bookshelves+1)</code>. The formula: <code className="bg-[#0a1a10] px-1 rounded">base = r1+1 + ⌊b/2⌋ + r2</code>.</p>
          <p>• Enchantment selection uses: modified cost = <code className="bg-[#0a1a10] px-1 rounded">round((level + 1 + nextInt(E/4) + nextInt(E/4)) × [0.85..1.15])</code> where E is enchantability.</p>
          <p>• Item throws: each dropped item advances the 48-bit player RNG by exactly <strong>4 steps</strong>, shifting the next XP seed derivation.</p>
          <p>• This technique is used in competitive and technical Minecraft to guarantee specific enchants without multiple rerolls.</p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-[#6d4c1f] border-2 border-[#f0a020] text-[#ffe080] font-black text-lg rounded-xl
            hover:bg-[#8d6c3f] hover:shadow-lg hover:shadow-[#f0a02040] transition-all"
        >
          🔍 Start Cracking Your Seed →
        </button>
      </div>
    </div>
  );
}
