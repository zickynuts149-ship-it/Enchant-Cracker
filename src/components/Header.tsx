export default function Header() {
  return (
    <div className="text-center py-2">
      {/* Enchanting table icon row */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-4xl opacity-60">📚</span>
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-xl bg-[#f0a020] opacity-20 rounded-full scale-150" />
          <span className="relative text-6xl">🔮</span>
        </div>
        <span className="text-4xl opacity-60">📚</span>
      </div>

      <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight"
        style={{
          color: '#ffe080',
          textShadow: '0 0 30px #f0a02080, 0 0 60px #f0a02040, 0 3px 6px #000',
        }}>
        Minecraft Enchant Seed
      </h1>
      <h1 className="text-2xl md:text-4xl font-black tracking-tight"
        style={{
          color: '#c0d0ff',
          textShadow: '0 0 20px #8090ff60, 0 2px 4px #000',
        }}>
        Calculator & Manipulator
      </h1>

      <p className="text-[#b09060] text-sm md:text-base mt-3 max-w-xl mx-auto">
        Crack your hidden XP seed · Predict enchantments · Control outcomes with item drops
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 bg-[#1a1408] border border-[#3a2c10] rounded-full px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#20c040] inline-block animate-pulse" />
          <span className="text-[#80c080]">Java Edition</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1a1408] border border-[#3a2c10] rounded-full px-3 py-1.5 text-xs">
          <span className="text-[#f0a020]">⚡</span>
          <span className="text-[#c09060]">Version 26.2 / 1.21.x</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1a1408] border border-[#3a2c10] rounded-full px-3 py-1.5 text-xs">
          <span className="text-[#8080ff]">🎲</span>
          <span className="text-[#9090d0]">LCG RNG Manipulation</span>
        </div>
      </div>
    </div>
  );
}
