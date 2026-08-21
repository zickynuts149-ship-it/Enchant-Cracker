import { useState } from 'react';
import Header from './components/Header';
import Instructions from './components/Instructions';
import SeedCracker from './components/SeedCracker';
import EnchantPlanner from './components/EnchantPlanner';

type Tab = 'instructions' | 'seed' | 'planner';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('instructions');
  const [crackedSeed, setCrackedSeed] = useState<number | null>(null);

  const tabs: { id: Tab; label: string; icon: string; desc: string }[] = [
    { id: 'instructions', label: 'How It Works', icon: '📖', desc: 'Learn the mechanics' },
    { id: 'seed', label: 'Find Your Seed', icon: '🔍', desc: 'Crack the XP seed' },
    { id: 'planner', label: 'Plan Enchants', icon: '✨', desc: 'Find throw plans' },
  ];

  return (
    <div className="min-h-screen bg-[#130e06] text-[#f0d080]" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(120,80,20,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(40,60,120,0.06) 0%, transparent 60%)
          `
        }}
      />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(255,200,80,0.5) 16px),
          repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,200,80,0.5) 16px)`
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="pt-8 pb-6">
          <Header />
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-3 rounded-xl border-2 font-bold transition-all text-center
                ${activeTab === tab.id
                  ? 'border-[#f0a020] text-[#ffe080] shadow-lg shadow-[#f0a02030]'
                  : 'border-[#3a2808] text-[#907050] hover:border-[#6a4820] hover:text-[#c0a060]'
                }`}
              style={{
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #3a2010, #2a1808)'
                  : '#1a1008',
              }}
            >
              {/* Step number */}
              <div className={`absolute top-2 left-2.5 text-xs font-black ${
                activeTab === tab.id ? 'text-[#f0a020]' : 'text-[#503820]'
              }`}>
                {i + 1}
              </div>
              <div className="text-2xl mb-0.5">{tab.icon}</div>
              <div className="text-sm font-black leading-tight">{tab.label}</div>
              <div className="text-xs opacity-70 hidden sm:block mt-0.5">{tab.desc}</div>
              {tab.id === 'planner' && crackedSeed !== null && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#20c040] text-black text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  READY
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'instructions' && (
            <Instructions onGetStarted={() => setActiveTab('seed')} />
          )}
          {activeTab === 'seed' && (
            <SeedCracker
              onSeedFound={(seed: number) => {
                setCrackedSeed(seed);
                setActiveTab('planner');
              }}
              crackedSeed={crackedSeed}
            />
          )}
          {activeTab === 'planner' && (
            <EnchantPlanner
              xpSeed={crackedSeed}
              onGoToSeed={() => setActiveTab('seed')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2a1808] text-center text-xs text-[#504030] space-y-1">
          <div>Minecraft Enchant Seed Calculator · Java Edition 26.2 / 1.21.x</div>
          <div className="text-[#403020]">
            Based on Earthcomputer's EnchantmentCracker research and the Minecraft Wiki enchanting algorithm.
            All enchantment data verified against official Minecraft Java Edition source.
          </div>
          <div className="text-[#403020]">
            ⚠️ This tool is for single-player use. Server rules may prohibit RNG manipulation.
          </div>
        </div>
      </div>
    </div>
  );
}
