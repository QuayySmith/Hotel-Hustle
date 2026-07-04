/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Settings, BookOpen, HelpCircle, Volume2, VolumeX, Music, Info, X, RefreshCw } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  soundOn: boolean;
  musicOn: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onResetData: () => void;
}

export default function MainMenu({
  onPlay,
  soundOn,
  musicOn,
  onToggleSound,
  onToggleMusic,
  onResetData,
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<'none' | 'settings' | 'rules' | 'help'>('none');

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between bg-radial from-slate-900 via-slate-950 to-black p-6 text-white select-none">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none animate-pulse [animation-delay:2s]"></div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Top Bar with Volume shortcut */}
      <div className="relative z-10 w-full flex justify-between items-center max-w-4xl">
        <div className="flex gap-2">
          <button
            onClick={onToggleSound}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all text-slate-300"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
          <button
            onClick={onToggleMusic}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 transition-all text-slate-300"
          >
            <Music className={`w-5 h-5 ${musicOn ? 'text-pink-400' : 'text-slate-500'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span className="font-mono text-[10px] tracking-wider text-slate-400 font-bold">VER 1.4.0 (STABLE)</span>
        </div>
      </div>

      {/* Main Logo & Buttons */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Game Title with Glow Shadow */}
        <div className="text-center mb-8 relative">
          <div className="absolute -inset-1 rounded-full bg-pink-500/10 blur-xl"></div>
          <h1 className="font-sans text-6xl md:text-7xl font-black tracking-tightest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-fuchsia-600 drop-shadow-[0_6px_15px_rgba(0,0,0,0.9)] uppercase relative">
            Suite Hustle
          </h1>
          <p className="font-sans text-xs tracking-widest text-cyan-400 font-bold uppercase mt-1">
            🛎️ 2D HOTEL MANAGEMENT &amp; COOKING SIMULATOR 🛎️
          </p>
        </div>

        {/* Menu Actions */}
        <div className="flex flex-col gap-3.5 w-64">
          <button
            onClick={onPlay}
            className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-fuchsia-600 text-white font-sans text-base font-black tracking-widest shadow-[0_0_20px_rgba(236,72,153,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.55)] border border-yellow-300/30 hover:scale-[1.04] active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white text-white group-hover:scale-125 transition-transform" />
            PLAY GAME
          </button>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 transition-all hover:scale-105"
            >
              <Settings className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="font-sans text-[10px] font-bold tracking-wider text-slate-300">SETUP</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-fuchsia-500/50 transition-all hover:scale-105"
            >
              <BookOpen className="w-5 h-5 text-fuchsia-400 mb-1" />
              <span className="font-sans text-[10px] font-bold tracking-wider text-slate-300">RULES</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-yellow-400/50 transition-all hover:scale-105"
            >
              <HelpCircle className="w-5 h-5 text-yellow-400 mb-1" />
              <span className="font-sans text-[10px] font-bold tracking-wider text-slate-300">HELP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center pb-4 text-slate-500 text-[11px] font-sans">
        Suite Hustle Co. &copy; 2026. Made with premium React &amp; Tailwind CSS.
      </div>

      {/* OVERLAY DRAWERS */}
      {activeTab !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                {activeTab === 'settings' && <Settings className="w-5 h-5 text-cyan-400" />}
                {activeTab === 'rules' && <BookOpen className="w-5 h-5 text-fuchsia-400" />}
                {activeTab === 'help' && <HelpCircle className="w-5 h-5 text-yellow-400" />}
                <h2 className="font-sans text-xl font-black uppercase tracking-wide">
                  {activeTab === 'settings' && 'Game Configuration'}
                  {activeTab === 'rules' && 'Hotel Regulations'}
                  {activeTab === 'help' && 'Staff Guidebook'}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('none')}
                className="w-8 h-8 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="font-sans text-sm text-slate-300 leading-relaxed">
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-4">
                  {/* Music controls */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className="font-bold text-slate-200">Ambient Soundtrack</p>
                        <p className="text-xs text-slate-500">Enable soothing retro-synth loops</p>
                      </div>
                    </div>
                    <button
                      onClick={onToggleMusic}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                        musicOn ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {musicOn ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Sound controls */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="font-bold text-slate-200">Sfx / Alert Sounds</p>
                        <p className="text-xs text-slate-500">Play kitchen bells and elevator repairs</p>
                      </div>
                    </div>
                    <button
                      onClick={onToggleSound}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                        soundOn ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {soundOn ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Reset button */}
                  <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
                    <h3 className="font-bold text-rose-400 mb-1">DANGER ZONE</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Erase all hotel levels, employee contracts, upgrades, and financial balances. This cannot be undone.
                    </p>
                    <button
                      onClick={() => {
                        onResetData();
                        setActiveTab('none');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl font-bold text-xs transition-all w-full justify-center"
                    >
                      <RefreshCw className="w-4 h-4" />
                      RESET HOTEL SAVE DATA
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                    <h3 className="font-black text-fuchsia-400 mb-1 tracking-wide text-xs uppercase">1. Lobby Management</h3>
                    <p className="text-xs text-slate-400">
                      Check-in guests by dragging or assigning them to clean rooms. Assigning them matches their luggage and checks them in safely.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                    <h3 className="font-black text-cyan-400 mb-1 tracking-wide text-xs uppercase">2. Cooking Mastery</h3>
                    <p className="text-xs text-slate-400">
                      Step into the kitchen! Cook dishes perfectly on the grill. Perfect flips and correct toppings secure massive multi-multiplier tips.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                    <h3 className="font-black text-yellow-400 mb-1 tracking-wide text-xs uppercase">3. Elevator Breakdown</h3>
                    <p className="text-xs text-slate-400">
                      Your magnetic elevator drops passengers or food. It might stall! Tap it rapidly to trigger high-speed engineering repairs.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                    <h3 className="font-black text-emerald-400 mb-1 tracking-wide text-xs uppercase">4. Staff Expansion</h3>
                    <p className="text-xs text-slate-400">
                      Stretched thin? Recipient desk duties, pan sizzles, room housekeeping, and delivery can be fully outsourced. Keep upgrading staff!
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="flex flex-col gap-3 text-xs text-slate-400">
                  <p>
                    Welcome to <span className="text-white font-bold">Suite Hustle</span>! Grow your boutique suite from Level 1 all the way to Level 100!
                  </p>
                  <p>
                    Each checkout rewards your hotel with rent. Use your hard-earned funds to buy Upgrades like faster stoves or premium TVs that lock guest patience.
                  </p>
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-start gap-3 mt-2">
                    <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Make sure to watch your <span className="text-cyan-400 font-bold">Overall Star Rating</span>. Poorly cooked burgers, messy uncleaned sheets, or sluggish deliveries will prompt customers to drop negative feedback on HustleAdvisor!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
