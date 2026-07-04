/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Volume2 } from 'lucide-react';
import { CustomerOrder, FryerBasket, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface FryerStationProps {
  orders: CustomerOrder[];
  baskets: FryerBasket[];
  onAddBasket: (slotIdx: number) => void;
  onUpdateBaskets: (updated: FryerBasket[]) => void;
  onCompleteFries: (basketId: string) => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function FryerStation({
  orders,
  baskets,
  onAddBasket,
  onUpdateBaskets,
  onCompleteFries,
  upgrades,
  activeStation,
}: FryerStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [shakingBasketId, setShakingBasketId] = useState<string | null>(null);

  const hasAutoLifter = upgrades.find((u) => u.id === 'fryer_super')?.purchased;

  const fryOrders = orders.filter(o => o.fries);

  useEffect(() => {
    if (fryOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(fryOrders[0].id);
    }
  }, [orders]);

  // Frying timer loop
  useEffect(() => {
    if (activeStation !== 'fryer') return;

    const interval = setInterval(() => {
      const updated = baskets.map((b) => {
        if (!b.isFrying || b.isPulledUp) return b;

        let nextProg = b.cookedProgress + (Math.random() * 2.8 + 2.0);
        let nextFrying: boolean = b.isFrying;
        let nextPulled: boolean = b.isPulledUp;

        // Auto-lifter upgrade pulls the basket up automatically at 88%!
        if (hasAutoLifter && nextProg >= 88 && !b.isPulledUp) {
          nextPulled = true;
          nextFrying = false;
          nextProg = 88;
          playSound('ding');
        }

        return {
          ...b,
          cookedProgress: Math.min(100, nextProg),
          isFrying: nextFrying,
          isPulledUp: nextPulled,
        };
      });

      onUpdateBaskets(updated);
    }, 400);

    return () => clearInterval(interval);
  }, [baskets, activeStation, hasAutoLifter]);

  const handleBasketToggle = (slotIdx: number) => {
    const basket = baskets[slotIdx];
    if (!basket) {
      playSound('click');
      onAddBasket(slotIdx);
    } else {
      playSound('sweep');
      const updated = [...baskets];
      if (basket.isFrying) {
        // Pull up
        updated[slotIdx] = { ...basket, isFrying: false, isPulledUp: true };
      } else if (basket.isPulledUp && !basket.isPackaged) {
        // Put back down
        updated[slotIdx] = { ...basket, isFrying: true, isPulledUp: false };
      }
      onUpdateBaskets(updated);
    }
  };

  const handleShakeSalt = (slotIdx: number) => {
    const basket = baskets[slotIdx];
    if (!basket || !basket.isPulledUp || basket.isPackaged) return;

    playSound('click');
    setShakingBasketId(basket.id);
    setTimeout(() => setShakingBasketId(null), 300);

    const updated = [...baskets];
    updated[slotIdx] = { ...basket, isSalted: true };
    onUpdateBaskets(updated);
  };

  const handlePackageFries = (slotIdx: number) => {
    const basket = baskets[slotIdx];
    if (!basket || !basket.isPulledUp || basket.isPackaged) return;

    playSound('coin');
    onCompleteFries(basket.id);
  };

  const activeTicket = fryOrders.find(o => o.id === selectedTicketId);

  const getFryStatusLabel = (prog: number) => {
    if (prog < 30) return { label: 'Raw Slices', color: 'text-slate-400 bg-slate-900' };
    if (prog < 70) return { label: 'Soft Pale', color: 'text-yellow-500/80 bg-yellow-950/20' };
    if (prog < 96) return { label: 'Golden Crisp!', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900 animate-pulse' };
    return { label: 'BURNT CHAR!', color: 'text-red-500 bg-red-950/60 font-black' };
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-yellow-600/10 via-slate-900 to-yellow-950/20 font-sans p-3">
      
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(12px) scale(0.6); opacity: 0; }
          40% { opacity: 0.7; }
          100% { transform: translateY(-12px) scale(1.1); opacity: 0; }
        }
        .fry-bubble { animation: bubble 0.6s infinite ease-out; }
      `}</style>

      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* Active Ticket Banner */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Fryer Tickets</span>
            {activeTicket && (
              <span className="font-mono text-[9.5px] text-yellow-400 font-bold uppercase">
                Goal: Salted Golden Potato Fries
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {fryOrders.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => { playSound('click'); setSelectedTicketId(ticket.id); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTicketId === ticket.id
                    ? 'bg-yellow-500/15 border-yellow-500/60 text-yellow-300 font-black'
                    : 'bg-slate-900/60 border-slate-850 text-slate-400'
                }`}
              >
                <span>{ticket.avatarEmoji}</span>
                <div className="text-left">
                  <p className="font-sans text-[10px] font-bold truncate max-w-[80px]">{ticket.customerName}</p>
                  <p className="font-mono text-[8px] uppercase tracking-wider text-amber-500 font-bold">Fries</p>
                </div>
              </button>
            ))}
            {fryOrders.length === 0 && (
              <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active fry orders on line.</p>
            )}
          </div>
        </div>

        {/* Deep Fryer Workspace */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🍟</span>
              <h2 className="font-sans font-black text-xs text-white uppercase tracking-wider">Dual deep-fryer wells</h2>
            </div>
            {hasAutoLifter && (
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">⏰ AUTO-LIFTER ENGAGED</span>
            )}
          </div>

          {/* Baskets Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full my-auto">
            {[0, 1].map((slotIdx) => {
              const basket = baskets[slotIdx];
              const isShaking = basket && shakingBasketId === basket.id;

              return (
                <div 
                  key={slotIdx}
                  className="relative rounded-2xl bg-slate-950 border border-slate-850 shadow-inner p-3 flex flex-col justify-between items-center overflow-hidden aspect-[4/5]"
                >
                  {/* Frying bubbles overlay */}
                  {basket && basket.isFrying && !basket.isPulledUp && (
                    <div className="absolute inset-0 bg-yellow-500/10 z-0 pointer-events-none overflow-hidden">
                      <div className="absolute bottom-4 left-1/4 w-1 h-1 bg-yellow-400/80 rounded-full fry-bubble"></div>
                      <div className="absolute bottom-6 left-1/2 w-1.5 h-1.5 bg-yellow-300/80 rounded-full fry-bubble" style={{ animationDelay: '0.15s' }}></div>
                      <div className="absolute bottom-2 right-1/4 w-1 h-1 bg-yellow-400/80 rounded-full fry-bubble" style={{ animationDelay: '0.3s' }}></div>
                      <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-yellow-300/60 rounded-full fry-bubble" style={{ animationDelay: '0.45s' }}></div>
                    </div>
                  )}

                  {/* Basket header info */}
                  <div className="w-full text-center border-b border-slate-900 pb-1 shrink-0 z-10">
                    <span className="font-mono text-[7px] text-slate-500 font-bold uppercase tracking-wider">Fry Well {slotIdx + 1}</span>
                  </div>

                  {/* Central interactive basket visual */}
                  <AnimatePresence mode="wait">
                    {!basket ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-4 z-10">
                        <span className="text-2xl mb-1.5 opacity-20">🥔</span>
                        <button
                          onClick={() => { playSound('click'); onAddBasket(slotIdx); }}
                          className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 text-slate-950 rounded-lg text-[9px] font-black uppercase transition-transform active:scale-95 cursor-pointer"
                        >
                          🍟 drop slices
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 w-full flex flex-col justify-between pt-2.5 z-10">
                        
                        {/* Dynamic status tag */}
                        <div className="text-center">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-900 ${getFryStatusLabel(basket.cookedProgress).color}`}>
                            {getFryStatusLabel(basket.cookedProgress).label}
                          </span>
                        </div>

                        {/* Interactive wire basket container */}
                        <motion.div 
                          className="w-14 h-14 border border-slate-700 bg-slate-900/80 rounded-xl mx-auto relative flex items-center justify-center overflow-hidden shadow-inner cursor-pointer"
                          animate={isShaking ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                          onClick={() => handleBasketToggle(slotIdx)}
                        >
                          {/* Slices inside */}
                          <span className="text-xl">
                            {basket.isPulledUp ? '🍟' : '🫧'}
                          </span>
                        </motion.div>

                        {/* Timer Progress */}
                        <div className="w-full">
                          <div className="flex justify-between text-[6.5px] font-mono text-slate-400 mb-0.5 px-0.5">
                            <span>Sizzling</span>
                            <span>{Math.round(basket.cookedProgress)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                basket.cookedProgress < 70 ? 'bg-amber-500/70' : basket.cookedProgress < 96 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                              }`}
                              style={{ width: `${basket.cookedProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Control actions */}
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          <button
                            onClick={() => handleBasketToggle(slotIdx)}
                            className="py-1 bg-slate-900 border border-slate-800 text-[8px] font-black text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer uppercase"
                          >
                            {basket.isPulledUp ? 'Lower 📥' : 'Lift 📤'}
                          </button>

                          <button
                            disabled={!basket.isPulledUp || basket.isSalted}
                            onClick={() => handleShakeSalt(slotIdx)}
                            className={`py-1 rounded-lg text-[8px] font-black transition-all cursor-pointer uppercase border ${
                              basket.isPulledUp && !basket.isSalted
                                ? 'bg-yellow-500 text-slate-950 border-transparent hover:bg-yellow-400'
                                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                            }`}
                          >
                            {basket.isSalted ? '✓ Salted' : '🧂 Salt'}
                          </button>
                        </div>

                        {/* Packaging scoop */}
                        {basket.isPulledUp && (
                          <button
                            disabled={basket.cookedProgress > 96} // burnt fries can't be packaged!
                            onClick={() => handlePackageFries(slotIdx)}
                            className="mt-1.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-sans text-[8.5px] font-black rounded-lg transition-transform active:scale-95 cursor-pointer uppercase text-center shadow animate-pulse"
                          >
                            📥 Scoop To Tray
                          </button>
                        )}

                      </div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
