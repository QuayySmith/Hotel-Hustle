/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, DollarSign, Check, ShoppingCart, HelpCircle } from 'lucide-react';
import { Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface UpgradesViewProps {
  money: number;
  upgrades: Upgrade[];
  onBuyUpgrade: (upgradeId: string) => void;
  onBackToHotel: () => void;
}

export default function UpgradesView({
  money,
  upgrades,
  onBuyUpgrade,
  onBackToHotel,
}: UpgradesViewProps) {
  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none"></div>

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-orange-500/20 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playSound('click'); onBackToHotel(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-orange-500 hover:text-orange-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-orange-400 uppercase flex items-center gap-1.5">
              🛒 UPGRADES SHOP
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Upgrade your kitchen tools and diner layout for maximum efficiency
            </p>
          </div>
        </div>

        {/* Current Money balance */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl px-4 py-1.5 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-base font-black text-emerald-400">
            ${money.toFixed(2)}
          </span>
        </div>
      </header>

      {/* ==================== CONTENT LIST ==================== */}
      <main className="flex-1 w-full p-6 overflow-y-auto relative z-10 bg-slate-900/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {upgrades.map((up) => {
            const canAfford = money >= up.cost;
            
            return (
              <div 
                key={up.id}
                className="bg-slate-950 border border-slate-850 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/40 transition-all shadow-lg group relative overflow-hidden"
              >
                {/* Visual Glow Header bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

                <div className="flex items-start gap-4 mb-4">
                  {/* Upgrade Icon Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                    {up.icon}
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-sm font-black text-slate-100 tracking-tight">{up.name}</h3>
                      {/* Bought status */}
                      {up.purchased && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-mono text-[9px] font-bold uppercase">
                          Purchased
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1 min-h-[34px]">
                      {up.description}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">ITEM COST</span>
                    <span className="text-xs font-bold text-orange-400 font-mono">
                      ${up.cost}
                    </span>
                  </div>

                  {up.purchased ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs font-sans">
                      <Check className="w-4 h-4" />
                      OWNED
                    </div>
                  ) : (
                    <button
                      onClick={() => { playSound('powerup'); onBuyUpgrade(up.id); }}
                      disabled={!canAfford}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-sans font-black text-xs tracking-wide transition-all ${
                        canAfford 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-[1.03] text-slate-950 shadow-lg cursor-pointer font-extrabold' 
                          : 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      BUY UPGRADE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
