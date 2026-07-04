/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Settings, BookOpen, Volume2, VolumeX, Music, Info, X, Sparkles, Trophy, Users, Heart } from 'lucide-react';
import { playSound } from '../lib/audio';

interface MainMenuProps {
  onPlay: () => void;
  onContinue: () => void;
  soundOn: boolean;
  musicOn: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onResetData: () => void;
  hasSavedData: boolean;
}

export default function MainMenu({
  onPlay,
  onContinue,
  soundOn,
  musicOn,
  onToggleSound,
  onToggleMusic,
  onResetData,
  hasSavedData,
}: MainMenuProps) {
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'settings' | 'rules' | 'credits'>('none');

  const handleMenuClick = (overlay: 'settings' | 'rules' | 'credits') => {
    playSound('click');
    setActiveOverlay(overlay);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950/25 p-5 text-white select-none">
      
      {/* Background Ambient Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none animate-pulse [animation-delay:2s]"></div>

      {/* Top Banner and System Status */}
      <div className="relative z-10 w-full flex justify-between items-center max-w-5xl">
        <div className="flex gap-2">
          <button
            onClick={() => { playSound('click'); onToggleSound(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition-all text-slate-300 cursor-pointer"
            title="Toggle Sound Effects"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => { playSound('click'); onToggleMusic(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all text-slate-300 cursor-pointer"
            title="Toggle Music"
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-amber-400' : 'text-slate-500'}`} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-850 rounded-full">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
          <span className="font-mono text-[9px] tracking-wider text-slate-400 font-bold">STATION SIMULATOR V1.1</span>
        </div>
      </div>

      {/* Main Brand Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="text-center mb-6 relative">
          <div className="absolute -inset-2 rounded-full bg-orange-500/5 blur-2xl"></div>
          
          {/* Chef Mascot/Food Logo */}
          <div className="text-6xl md:text-7xl mb-2.5 drop-shadow-lg flex gap-1 justify-center items-center">
            <span>🍕</span>
            <span className="animate-bounce">🍔</span>
            <span>🍟</span>
          </div>

          <h1 className="font-sans text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] uppercase relative">
            Quazzys Foodaria
          </h1>
          
          <p className="font-sans text-[10px] tracking-widest text-orange-400 font-black uppercase mt-1">
            🔥 THE WORLD-FAMOUS NINE-STATION COOKING EMPIRE 🔥
          </p>
        </div>

        {/* 5-Button Menu Controller */}
        <div className="flex flex-col gap-2.5 w-72">
          
          {/* 1. PLAY BUTTON */}
          <button
            onClick={() => { playSound('chime'); onPlay(); }}
            className="group flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-slate-950 font-sans text-sm font-black tracking-widest hover:scale-102 active:scale-95 transition-all cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.3)]"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950 group-hover:scale-125 transition-transform" />
            NEW GAME
          </button>

          {/* 2. CONTINUE BUTTON */}
          <button
            onClick={() => { 
              if (hasSavedData) {
                playSound('chime'); 
                onContinue(); 
              } else {
                playSound('fail');
              }
            }}
            disabled={!hasSavedData}
            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl font-sans text-xs font-black tracking-widest border transition-all cursor-pointer ${
              hasSavedData
                ? 'bg-slate-900 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:scale-102 active:scale-95'
                : 'bg-slate-950/40 border-slate-900 text-slate-650 cursor-not-allowed'
            }`}
          >
            <Trophy className={`w-3.5 h-3.5 ${hasSavedData ? 'text-amber-400' : 'text-slate-650'}`} />
            CONTINUE SAVED GAME
          </button>

          {/* 3. SETTINGS, RULES, CREDITS row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleMenuClick('settings')}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/90 border border-slate-850 hover:border-orange-500/50 transition-all hover:scale-102 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-orange-400 mb-1" />
              <span className="font-sans text-[8.5px] font-black tracking-wider text-slate-300">SETTINGS</span>
            </button>

            <button
              onClick={() => handleMenuClick('rules')}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/90 border border-slate-850 hover:border-amber-500/50 transition-all hover:scale-102 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400 mb-1" />
              <span className="font-sans text-[8.5px] font-black tracking-wider text-slate-300">RULES</span>
            </button>

            <button
              onClick={() => handleMenuClick('credits')}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/90 border border-slate-850 hover:border-rose-400/50 transition-all hover:scale-102 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-400 mb-1" />
              <span className="font-sans text-[8.5px] font-black tracking-wider text-slate-300">CREDITS</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 text-center pb-2 text-slate-500 text-[10px] font-mono tracking-wide">
        QUAZZYS FOODARIA INC. &copy; 2026. ALL RIGHTS RESERVED.
      </div>

      {/* MODAL DRAWERS */}
      {activeOverlay !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                {activeOverlay === 'settings' && <Settings className="w-4.5 h-4.5 text-orange-400" />}
                {activeOverlay === 'rules' && <BookOpen className="w-4.5 h-4.5 text-amber-400" />}
                {activeOverlay === 'credits' && <Heart className="w-4.5 h-4.5 text-rose-400" />}
                <h2 className="font-sans text-base font-black uppercase tracking-widest">
                  {activeOverlay === 'settings' && 'Settings'}
                  {activeOverlay === 'rules' && 'Game Rules & Stations'}
                  {activeOverlay === 'credits' && 'Game Credits'}
                </h2>
              </div>
              <button
                onClick={() => { playSound('click'); setActiveOverlay('none'); }}
                className="w-7 h-7 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Contents */}
            <div className="font-sans text-xs text-slate-300 leading-relaxed">
              
              {/* SETTINGS MENU */}
              {activeOverlay === 'settings' && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-200">Diner Audio Effects</p>
                      <p className="text-[10px] text-slate-500">Enable spatula flips, sizzles, and rings</p>
                    </div>
                    <button
                      onClick={() => { playSound('click'); onToggleSound(); }}
                      className={`px-3 py-1 rounded-lg font-black text-[10px] transition-all cursor-pointer ${
                        soundOn ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {soundOn ? 'ENABLED' : 'MUTED'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-200">Retro Synthesizer Music</p>
                      <p className="text-[10px] text-slate-500">Play synthetic loops in the background</p>
                    </div>
                    <button
                      onClick={() => { playSound('click'); onToggleMusic(); }}
                      className={`px-3 py-1 rounded-lg font-black text-[10px] transition-all cursor-pointer ${
                        musicOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {musicOn ? 'ENABLED' : 'MUTED'}
                    </button>
                  </div>

                  <div className="p-3.5 border border-red-500/20 bg-red-500/5 rounded-xl">
                    <h3 className="font-bold text-red-400 mb-1 uppercase tracking-wide">Danger Zone</h3>
                    <p className="text-[10px] text-slate-400 mb-2.5 leading-normal">
                      Erase all unlocked upgrades, critic reviews, high scores, and money. This operation is irreversible.
                    </p>
                    <button
                      onClick={() => {
                        onResetData();
                        setActiveOverlay('none');
                      }}
                      className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer uppercase"
                    >
                      💣 Wipe Save File
                    </button>
                  </div>
                </div>
              )}

              {/* RULES MENU */}
              {activeOverlay === 'rules' && (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-black text-amber-400 block mb-0.5">1. ORDER STATION</span>
                    <p className="text-[10.5px] text-slate-400">Greet arriving customer. Taking their order generates custom tickets detailing their feast.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-black text-orange-400 block mb-0.5">2. GRILL &amp; FRYER STATIONS</span>
                    <p className="text-[10.5px] text-slate-400">Sear burger patties to specified doneness (rare/medium/well), and deep fry wedges to perfect gold color.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-black text-rose-400 block mb-0.5">3. BUILD STATION &amp; PIZZA OVEN</span>
                    <p className="text-[10.5px] text-slate-400">Stack burger ingredients organically on the prep tray. Stretch, sauce, cheese, top, and bake brickoven pizzas.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-black text-cyan-400 block mb-0.5">4. MILKSHAKES &amp; DRINK FILLER</span>
                    <p className="text-[10.5px] text-slate-400">Blend creamy ice cream shakes with cherries. Fill fizzy cups with ice, delicious flavors, and straws.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-black text-emerald-400 block mb-0.5">5. PACKAGING &amp; SERVE</span>
                    <p className="text-[10.5px] text-slate-400">Pack all completed feast items in the paper bag, apply sealing mascot sticker, and deliver to get rated!</p>
                  </div>
                </div>
              )}

              {/* CREDITS MENU */}
              {activeOverlay === 'credits' && (
                <div className="text-center py-2 space-y-4">
                  <div className="flex justify-center mb-1">
                    <div className="p-2.5 bg-slate-950 rounded-full border border-slate-800 animate-spin-slow">
                      🔮
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-amber-400 uppercase tracking-widest text-xs">Aesthetic Direction</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Quazzys Foodaria Development Group</p>
                  </div>

                  <div>
                    <h3 className="font-black text-orange-400 uppercase tracking-widest text-xs">Audio Engineering</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Web Audio Synthesized Chiptune Loops</p>
                  </div>

                  <div>
                    <h3 className="font-black text-rose-400 uppercase tracking-widest text-xs">Technical Craft</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">React 18 + Vite Native ESM Module State Engine</p>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    Specifically crafted with extreme high-fidelity vector layouts and fluid visual feedback loops.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
