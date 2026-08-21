import { useState, useRef } from 'react';
import { verifyReading, type TableReading } from '../engine/rng';

interface Props {
  onSeedFound: (seed: number) => void;
  crackedSeed: number | null;
}

const SLOT_COLORS = ['#80c080', '#80a0e0', '#e0a040'];

export default function SeedCracker({ onSeedFound, crackedSeed }: Props) {
  const [readings, setReadings] = useState<TableReading[]>([]);
  const [bookshelves, setBookshelves] = useState(15);
  const [topLevel, setTopLevel] = useState('');
  const [midLevel, setMidLevel] = useState('');
  const [botLevel, setBotLevel] = useState('');
  const [cracking, setCracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<number[] | null>(null);
  const [manualSeed, setManualSeed] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const workerRef = useRef<boolean>(false);

  const addReading = () => {
    const top = parseInt(topLevel);
    const mid = parseInt(midLevel);
    const bot = parseInt(botLevel);
    if (isNaN(top) || isNaN(mid) || isNaN(bot)) return;
    if (top < 1 || mid < 1 || bot < 1) return;
    setReadings(prev => [...prev, { bookshelves, topLevel: top, midLevel: mid, botLevel: bot }]);
    setTopLevel('');
    setMidLevel('');
    setBotLevel('');
    setResults(null);
  };

  const removeReading = (idx: number) => {
    setReadings(prev => prev.filter((_, i) => i !== idx));
    setResults(null);
  };

  // Crack seed in batches using setTimeout to avoid UI freeze
  const crackSeed = async () => {
    if (readings.length === 0) return;
    setCracking(true);
    setProgress(0);
    setResults(null);
    workerRef.current = true;

    const found: number[] = [];
    const first = readings[0];
    const b0 = Math.min(first.bookshelves, 15);

    // Find valid (r1Raw, r2) pairs
    interface Pair { r1Raw: number; r2: number }
    const pairs: Pair[] = [];
    for (let base = 1; base <= 45; base++) {
      const calcTop = Math.max(Math.floor(base / 3), 1);
      const calcMid = Math.floor((base * 2) / 3) + 1;
      const calcBot = Math.max(base, b0 * 2);
      if (calcTop !== first.topLevel || calcMid !== first.midLevel || calcBot !== first.botLevel) continue;

      const floorHalfB = Math.floor(b0 / 2);
      const needed = base - floorHalfB;
      for (let r1Raw = 0; r1Raw < 8; r1Raw++) {
        const r2 = needed - (r1Raw + 1);
        if (r2 >= 0 && r2 <= b0) {
          pairs.push({ r1Raw, r2 });
        }
      }
    }

    if (pairs.length === 0) {
      setResults([]);
      setCracking(false);
      return;
    }

    const CHUNK = 100000;
    const TOTAL = 0x100000000;

    const mask47 = (BigInt(1) << BigInt(48)) - BigInt(1);

    const checkSeed = (xpSeed: number): boolean => {
      // Simulate makeEnchantRng(xpSeed): seed = (xpSeed ^ mult) & mask
      const initSeed = (BigInt(xpSeed >>> 0) ^ BigInt('0x5DEECE66D')) & mask47;
      // next(31) = ((initSeed * mult + add) & mask) >> 17
      const s1 = (initSeed * BigInt('0x5DEECE66D') + BigInt(0xB)) & mask47;
      const got1 = Number(s1 >> BigInt(17)) % 8; // nextInt(8)

      let r1Match = -1;
      let expectedR2 = -1;
      for (const { r1Raw, r2 } of pairs) {
        if (got1 === r1Raw) {
          r1Match = r1Raw;
          expectedR2 = r2;
          break;
        }
      }
      if (r1Match === -1) return false;

      // nextInt(b0+1)
      const s2 = (s1 * BigInt('0x5DEECE66D') + BigInt(0xB)) & mask47;
      const bound = b0 + 1;
      let got2: number;
      if ((bound & (bound - 1)) === 0) {
        got2 = Math.floor(Number(s2 >> BigInt(17)) * bound / 2147483648);
      } else {
        got2 = Number(s2 >> BigInt(17)) % bound;
      }

      if (got2 !== expectedR2) return false;

      // Verify additional readings
      for (let ri = 1; ri < readings.length; ri++) {
        if (!verifyReading(xpSeed, readings[ri])) return false;
      }
      return true;
    };

    for (let start = 0; start < TOTAL && workerRef.current; start += CHUNK) {
      const end = Math.min(start + CHUNK, TOTAL);
      for (let seed = start; seed < end; seed++) {
        if (checkSeed(seed)) {
          found.push(seed);
          if (found.length >= 50) {
            workerRef.current = false;
            break;
          }
        }
      }
      setProgress(Math.floor((end / TOTAL) * 100));
      await new Promise(r => setTimeout(r, 0));
    }

    setResults(found);
    setCracking(false);
    workerRef.current = false;

    if (found.length === 1) {
      onSeedFound(found[0]);
    }
  };

  const stopCracking = () => {
    workerRef.current = false;
  };

  const handleManualSeed = () => {
    const v = parseInt(manualSeed, 16);
    if (!isNaN(v)) {
      onSeedFound(v >>> 0);
    } else {
      const n = parseInt(manualSeed, 10);
      if (!isNaN(n)) onSeedFound(n >>> 0);
    }
  };

  const slotRanges = (b: number) => {
    const bCap = Math.min(b, 15);
    const minBase = 1 + Math.floor(bCap / 2) + 0 + 1; // r1Raw=0, r2=0
    const maxBase = 8 + Math.floor(bCap / 2) + bCap + 1 - 1; // r1Raw=7, r2=b
    return {
      topMin: Math.max(Math.floor(minBase / 3), 1),
      topMax: Math.max(Math.floor(maxBase / 3), 1),
      midMin: Math.floor((minBase * 2) / 3) + 1,
      midMax: Math.floor((maxBase * 2) / 3) + 1,
      botMin: Math.max(minBase, bCap * 2),
      botMax: Math.max(maxBase, bCap * 2),
    };
  };

  const ranges = slotRanges(bookshelves);

  return (
    <div className="space-y-6">
      {/* Current Seed Display */}
      {crackedSeed !== null && (
        <div className="bg-[#0e1e14] border-2 border-[#20c040] rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">✅</span>
          <div>
            <div className="text-[#20c040] font-bold">Seed Cracked!</div>
            <div className="text-[#80e080] font-mono text-lg">
              XP Seed: {crackedSeed} (0x{(crackedSeed >>> 0).toString(16).toUpperCase().padStart(8, '0')})
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Input */}
        <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
          <h2 className="text-lg font-black text-[#ffe080] mb-1 flex items-center gap-2">
            <span>📊</span> Add Table Reading
          </h2>
          <p className="text-[#907050] text-xs mb-4">
            Open your enchanting table with a dummy item inside. Read the 3 green numbers (minimum level requirements).
          </p>

          <div className="mb-4">
            <label className="block text-[#c0a060] text-xs font-bold mb-1">
              Bookshelves active ({bookshelves})
            </label>
            <input
              type="range" min={0} max={15} value={bookshelves}
              onChange={e => setBookshelves(+e.target.value)}
              className="w-full accent-[#f0a020]"
            />
            <div className="flex justify-between text-[#605030] text-xs mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
            </div>
            <div className="text-xs text-[#706040] mt-1">
              Expected ranges: Top {ranges.topMin}–{ranges.topMax} | Mid {ranges.midMin}–{ranges.midMax} | Bot {ranges.botMin}–{ranges.botMax}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Top Slot', value: topLevel, set: setTopLevel, color: SLOT_COLORS[0] },
              { label: 'Mid Slot', value: midLevel, set: setMidLevel, color: SLOT_COLORS[1] },
              { label: 'Bot Slot', value: botLevel, set: setBotLevel, color: SLOT_COLORS[2] },
            ].map(({ label, value, set, color }) => (
              <div key={label}>
                <label className="block text-xs font-bold mb-1" style={{ color }}>{label}</label>
                <input
                  type="number" min={1} max={30} value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full bg-[#120c04] border border-[#4a3010] rounded-lg px-3 py-2 text-center
                    text-[#ffe080] font-mono text-lg focus:outline-none focus:border-[#f0a020]"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addReading}
            disabled={!topLevel || !midLevel || !botLevel}
            className="w-full py-3 bg-[#2a4a1a] border border-[#4a8030] text-[#80e060] font-bold rounded-lg
              hover:bg-[#3a6a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            + Add This Reading
          </button>
        </div>

        {/* Readings List */}
        <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
          <h2 className="text-lg font-black text-[#ffe080] mb-1 flex items-center gap-2">
            <span>📋</span> Recorded Readings
          </h2>
          <p className="text-[#907050] text-xs mb-4">
            Each reading narrows down the seed. You typically need 2–4 readings for a unique result. Enchant a dummy item between readings to change the table.
          </p>

          {readings.length === 0 ? (
            <div className="text-center py-8 text-[#504030]">
              <div className="text-4xl mb-2">📖</div>
              <div>No readings yet. Add your first table reading.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {readings.map((r, i) => (
                <div key={i} className="bg-[#120c04] border border-[#3a2808] rounded-lg p-3 flex items-center gap-3">
                  <div className="text-[#f0a020] font-black text-sm w-6">#{i + 1}</div>
                  <div className="flex-1 text-sm">
                    <span className="text-[#807060]">{r.bookshelves}📚 · </span>
                    <span style={{ color: SLOT_COLORS[0] }}>Top:{r.topLevel}</span>
                    <span className="text-[#504030]"> / </span>
                    <span style={{ color: SLOT_COLORS[1] }}>Mid:{r.midLevel}</span>
                    <span className="text-[#504030]"> / </span>
                    <span style={{ color: SLOT_COLORS[2] }}>Bot:{r.botLevel}</span>
                  </div>
                  <button
                    onClick={() => removeReading(i)}
                    className="text-[#c04040] hover:text-[#ff4040] text-lg leading-none"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {readings.length >= 1 && (
            <div className="mt-4 text-xs text-[#605030]">
              💡 Enchant a dummy item (cheapest slot) between readings to change the table state.
            </div>
          )}
        </div>
      </div>

      {/* Crack Button */}
      <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5">
        <h2 className="text-lg font-black text-[#ffe080] mb-4 flex items-center gap-2">
          <span>🔍</span> Crack the Seed
        </h2>

        {!cracking ? (
          <div className="space-y-3">
            <button
              onClick={crackSeed}
              disabled={readings.length === 0}
              className="w-full py-4 bg-[#4a2c0e] border-2 border-[#f0a020] text-[#ffe080] font-black text-lg rounded-xl
                hover:bg-[#6a4c2e] hover:shadow-lg hover:shadow-[#f0a02030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              🔍 Search All {(4294967296).toLocaleString()} Seeds
            </button>
            <p className="text-[#605030] text-xs text-center">
              ⚠️ This searches ~4 billion seeds. With more readings it finds a unique result faster.
              Typically takes 30–120 seconds depending on your device. With {readings.length} reading{readings.length !== 1 ? 's' : ''},
              expect {readings.length >= 3 ? 'a unique match' : readings.length >= 2 ? '10–100 matches' : 'thousands of matches'}.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#f0a020] font-bold animate-pulse">🔍 Searching...</span>
              <span className="text-[#ffe080] font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-[#120c04] rounded-full h-4 border border-[#3a2808]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f0a020, #ffe080)' }}
              />
            </div>
            <button
              onClick={stopCracking}
              className="mt-3 w-full py-2 border border-[#c04040] text-[#c04040] rounded-lg hover:bg-[#4a1010] transition-all"
            >
              ⏹ Stop Search
            </button>
          </div>
        )}

        {/* Results */}
        {results !== null && !cracking && (
          <div className="mt-4">
            {results.length === 0 && (
              <div className="bg-[#2a0808] border border-[#c04040] rounded-lg p-4 text-[#e08080]">
                <strong>❌ No seeds found.</strong> Your readings may be inconsistent.
                Make sure you haven't done anything that advances the RNG between readings
                (sprinting, taking damage, etc.). Try re-entering your readings.
              </div>
            )}
            {results.length === 1 && (
              <div className="bg-[#082a10] border border-[#20c040] rounded-lg p-4">
                <div className="text-[#20c040] font-black text-lg">✅ Unique Seed Found!</div>
                <div className="font-mono text-[#80e080] text-xl mt-1">
                  Decimal: {results[0]}<br />
                  Hex: 0x{(results[0] >>> 0).toString(16).toUpperCase().padStart(8, '0')}
                </div>
                <p className="text-[#40a060] text-sm mt-2">Your XP seed is confirmed. Proceed to the Enchant Planner!</p>
              </div>
            )}
            {results.length > 1 && (
              <div className="bg-[#1a1a08] border border-[#c0c040] rounded-lg p-4">
                <div className="text-[#e0e060] font-black">⚠️ {results.length} possible seeds found</div>
                <p className="text-[#a0a040] text-sm mt-1">Add more readings (enchant a dummy item first to change the table) to narrow it down to 1.</p>
                {results.length <= 10 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-[#808040]">Candidates:</div>
                    {results.slice(0, 10).map(s => (
                      <div key={s} className="flex items-center gap-3">
                        <span className="font-mono text-[#c0c060] text-sm">
                          {s} (0x{(s >>> 0).toString(16).toUpperCase().padStart(8, '0')})
                        </span>
                        <button
                          onClick={() => onSeedFound(s)}
                          className="text-xs text-[#8080e0] hover:text-[#c0c0ff] underline"
                        >
                          Use this seed
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Entry & Demo */}
      <div className="bg-[#1e140a] border border-[#4a3010] rounded-xl p-5 space-y-4">
        <div>
          <button
            onClick={() => setManualMode(!manualMode)}
            className="text-[#907050] text-sm hover:text-[#c0a070] flex items-center gap-2"
          >
            <span>{manualMode ? '▼' : '▶'}</span> Already know your seed? Enter it manually
          </button>
          {manualMode && (
            <div className="mt-3 flex gap-3">
              <input
                value={manualSeed}
                onChange={e => setManualSeed(e.target.value)}
                placeholder="Decimal or 0x hex (e.g. 12345678 or 0xABCD1234)"
                className="flex-1 bg-[#120c04] border border-[#4a3010] rounded-lg px-4 py-2
                  text-[#ffe080] font-mono focus:outline-none focus:border-[#f0a020]"
              />
              <button
                onClick={handleManualSeed}
                className="px-4 py-2 bg-[#2a4a1a] border border-[#4a8030] text-[#80e060] font-bold rounded-lg hover:bg-[#3a6a2a]"
              >
                Set Seed
              </button>
            </div>
          )}
        </div>

        {/* Demo Seeds */}
        <div>
          <div className="text-[#706040] text-xs font-bold mb-2">🎮 Demo / Test Seeds — try the planner without cracking:</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Seed A', seed: 0x12345678, desc: 'Example seed #1' },
              { label: 'Seed B', seed: 0xDEADBEEF, desc: 'Example seed #2' },
              { label: 'Seed C', seed: 0xC0FFEE42, desc: 'Example seed #3' },
              { label: 'Seed D', seed: 0x7F000001, desc: 'Example seed #4' },
            ].map(({ label, seed, desc }) => (
              <button
                key={label}
                onClick={() => onSeedFound(seed >>> 0)}
                title={desc}
                className="px-3 py-1.5 bg-[#1a1a2a] border border-[#3030a0] text-[#8080e0] text-xs font-bold rounded-lg
                  hover:bg-[#2a2a4a] hover:border-[#6060e0] transition-all"
              >
                {label}: 0x{(seed >>> 0).toString(16).toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-[#504030] text-xs mt-1">These are example seeds. In real play, crack your actual seed above.</div>
        </div>
      </div>
    </div>
  );
}
