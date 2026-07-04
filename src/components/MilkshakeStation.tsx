/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Volume2 } from 'lucide-react';
import { CustomerOrder, MilkshakeState, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface MilkshakeStationProps {
  orders: CustomerOrder[];
  shake: MilkshakeState;
  onUpdateShake: (updated: MilkshakeState) => void;
  onCompleteShake: () => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function MilkshakeStation({
  orders,
  shake,
  onUpdateShake,
  onCompleteShake,
  upgrades,
  activeStation,
}: MilkshakeStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [blendingProgress, setBlendingProgress] = useState(0);

  const hasSpeedBlender = upgrades.find((u) => u.id === 'shake_blender')?.purchased;
  const shakeOrders = orders.filter((o) => o.milkshake);

  useEffect(() => {
    if (shakeOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(shakeOrders[0].id);
    }
  }, [orders]);

  // Blender tick interval
  useEffect(() => {
    if (activeStation !== 'milkshake' || !shake.isBlending || shake.isBlended) return;

    const interval = setInterval(() => {
      const speed = hasSpeedBlender ? 12 : 8;
      const nextProg = blendingProgress + speed;
      
      if (nextProg >= 100) {
        setBlendingProgress(100);
        onUpdateShake({ ...shake, isBlending: false, isBlended: true, step: 'toppings' });
        playSound('ding');
      } else {
        setBlendingProgress(nextProg);
        // Synthesizer hum sound
        playSound('click');
      }
    }, 300);

    return () => clearInterval(interval);
  }, [shake, activeStation, blendingProgress, hasSpeedBlender]);

  const handleSelectCup = () => {
    playSound('click');
    onUpdateShake({ ...shake, step: 'flavor', cupSelected: true });
  };

  const handleSelectFlavor = (flavor: 'Chocolate' | 'Strawberry' | 'Vanilla') => {
    playSound('click');
    onUpdateShake({ ...shake, step: 'blend', flavor });
  };

  const handleStartBlend = () => {
    playSound('sweep');
    setBlendingProgress(0);
    onUpdateShake({ ...shake, isBlending: true });
  };

  const handleAddWhipped = () => {
    playSound('click');
    onUpdateShake({ ...shake, hasWhippedCream: true });
  };

  const handleAddCherry = () => {
    playSound('click');
    onUpdateShake({ ...shake, hasCherry: true });
  };

  const handleCapAndLid = () => {
    playSound('coin');
    onCompleteShake();
    // Reset local state
    setBlendingProgress(0);
  };

  const handleDiscard = () => {
    playSound('sweep');
    setBlendingProgress(0);
    onUpdateShake({
      step: 'cup',
      cupSelected: false,
      flavor: null,
      isBlending: false,
      isBlended: false,
      hasWhippedCream: false,
      hasCherry: false,
    });
  };

  const activeTicket = shakeOrders.find((o) => o.id === selectedTicketId);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-pink-600/10 via-slate-900 to-pink-950/20 font-sans p-3">
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* Active Ticket Banner */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Shake Blender Tickets</span>
            <div className="flex gap-1 overflow-x-auto max-w-[180px] scrollbar-none">
              {shakeOrders.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { playSound('click'); setSelectedTicketId(t.id); }}
                  className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg border text-[8.5px] font-black transition-all cursor-pointer ${
                    selectedTicketId === t.id
                      ? 'bg-pink-500 text-slate-950 border-pink-400 font-extrabold'
                      : 'bg-slate-900 border-slate-850 text-slate-400'
                  }`}
                >
                  {t.avatarEmoji} {t.customerName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {activeTicket && activeTicket.milkshake ? (
            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-sm shrink-0">{activeTicket.avatarEmoji}</span>
                <div>
                  <h4 className="font-sans font-black text-[9.5px] leading-none text-slate-850">{activeTicket.customerName}</h4>
                  <p className="font-mono text-[7px] text-slate-400 uppercase mt-0.5">Craving: Shake</p>
                </div>
              </div>

              {/* Flavor requirement badge */}
              <span className="px-2 py-0.5 bg-pink-100 border border-pink-200 text-pink-700 text-[9.5px] font-black rounded uppercase">
                🍦 {activeTicket.milkshake.flavor} Flavor
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active milkshake orders in progress.</p>
          )}
        </div>

        {/* Blender Workspace */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              🥤 Creamy Shake Mixer
            </span>
            <button
              onClick={handleDiscard}
              className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg font-sans text-[8px] font-bold transition-all uppercase cursor-pointer"
            >
              Discard cup
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center my-auto">
            
            {/* Stainless Steel Blender Mixer Stand */}
            <div className="relative w-36 h-48 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-x-4 border-slate-500 rounded-3xl flex flex-col justify-between p-3 shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-600"></div>
              
              <div className="text-center z-10">
                <span className="font-mono text-[7px] text-slate-600 font-black tracking-widest uppercase">STAINLESS MIXER</span>
              </div>

              {/* Blender Cup slot */}
              <div className="flex-1 flex items-end justify-center py-2 relative z-10">
                {shake.cupSelected ? (
                  <motion.div 
                    className="w-16 h-24 relative flex flex-col justify-between items-center p-1 border-t border-white shadow-lg overflow-hidden"
                    style={{
                      background: shake.flavor === 'Chocolate' 
                        ? 'linear-gradient(to bottom, #7c2d12, #451a03)' 
                        : shake.flavor === 'Strawberry' 
                          ? 'linear-gradient(to bottom, #f43f5e, #be123c)' 
                          : shake.flavor === 'Vanilla' 
                            ? 'linear-gradient(to bottom, #fef08a, #ca8a04)' 
                            : 'linear-gradient(to bottom, #f1f5f9, #cbd5e1)',
                      borderRadius: '8px 8px 16px 16px'
                    }}
                    animate={shake.isBlending ? { rotate: [0, -3, 3, -3, 3, 0], scale: [1, 0.98, 1, 0.98, 1] } : {}}
                  >
                    {/* Whipped cream swirl */}
                    {shake.hasWhippedCream && (
                      <div className="absolute -top-1 w-12 h-6 bg-slate-50 rounded-full border border-slate-200 shadow-sm flex items-center justify-center">
                        <span className="text-[10px]">🍥</span>
                      </div>
                    )}

                    {/* Cherry on top */}
                    {shake.hasCherry && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm z-20">🍒</div>
                    )}

                    <div className="text-center select-none">
                      <span className="font-sans font-black text-[9px] text-slate-950 bg-white/60 px-1 py-0.5 rounded leading-none">
                        {shake.flavor || 'CUP READY'}
                      </span>
                    </div>

                    <span className="text-2xl select-none">🥤</span>
                  </motion.div>
                ) : (
                  <div className="w-16 h-24 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider font-bold">No Cup</span>
                  </div>
                )}
              </div>

              {/* Blender mixing progress bar */}
              {shake.isBlending && (
                <div className="w-full shrink-0 z-10">
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${blendingProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Interaction controls block */}
            <div className="mt-3.5 w-full max-w-xs">
              {shake.step === 'cup' && (
                <button
                  onClick={handleSelectCup}
                  className="w-full py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all"
                >
                  🥤 Load Blender Cup
                </button>
              )}

              {shake.step === 'flavor' && (
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleSelectFlavor('Chocolate')}
                    className="py-1 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded-lg text-[8px] font-black uppercase"
                  >
                    🍫 Choc
                  </button>
                  <button
                    onClick={() => handleSelectFlavor('Strawberry')}
                    className="py-1 bg-rose-900 hover:bg-rose-800 text-rose-100 border border-rose-700 rounded-lg text-[8px] font-black uppercase"
                  >
                    🍓 Straw
                  </button>
                  <button
                    onClick={() => handleSelectFlavor('Vanilla')}
                    className="py-1 bg-yellow-100 hover:bg-white text-yellow-800 border border-yellow-300 rounded-lg text-[8px] font-black uppercase"
                  >
                    🍌 Van
                  </button>
                </div>
              )}

              {shake.step === 'blend' && !shake.isBlending && (
                <button
                  onClick={handleStartBlend}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all"
                >
                  ⚡ Whirl Stainless Blender
                </button>
              )}

              {shake.step === 'toppings' && (
                <div className="flex gap-1.5">
                  <button
                    disabled={shake.hasWhippedCream}
                    onClick={handleAddWhipped}
                    className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase border transition-all ${
                      shake.hasWhippedCream ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    🍥 Whip Cream
                  </button>
                  <button
                    disabled={shake.hasCherry}
                    onClick={handleAddCherry}
                    className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase border transition-all ${
                      shake.hasCherry ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-red-500 text-white border-transparent'
                    }`}
                  >
                    🍒 Cherry
                  </button>
                  <button
                    onClick={handleCapAndLid}
                    className="flex-1 py-1 bg-emerald-500 text-white text-[8px] font-black rounded-lg uppercase"
                  >
                    Cap Lid ✓
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
