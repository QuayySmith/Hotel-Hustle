/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, RefreshCw } from 'lucide-react';
import { CustomerOrder, Patty, Upgrade } from '../types';
import { playSound, startSizzle, stopSizzle } from '../lib/audio';

interface GrillStationProps {
  money: number;
  orders: CustomerOrder[];
  patties: Patty[];
  onAddPattyToGrill: (slotIndex: number, targetDoneness: 'rare' | 'medium' | 'well') => void;
  onFlipPatty: (pattyId: string) => void;
  onRemovePattyFromGrill: (pattyId: string) => void;
  onUpdatePatties: (updated: Patty[]) => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export const getAchievedDoneness = (p: Patty): 'raw' | 'rare' | 'medium' | 'well' | 'burnt' => {
  if (p.isBurnt) return 'burnt';
  const avg = p.isFlipped ? (p.side1Cooked + p.side2Cooked) / 2 : p.side1Cooked;
  if (avg < 20) return 'raw';
  if (avg < 50) return 'rare';
  if (avg < 80) return 'medium';
  if (avg < 96) return 'well';
  return 'burnt';
};

export default function GrillStation({
  money,
  orders,
  patties,
  onAddPattyToGrill,
  onFlipPatty,
  onRemovePattyFromGrill,
  onUpdatePatties,
  upgrades,
  activeStation,
}: GrillStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [flippingPattyIds, setFlippingPattyIds] = useState<Record<string, boolean>>({});

  const hasGrillBooster = upgrades.find((u) => u.id === 'grill_booster')?.purchased;
  const hasPattyAlarm = upgrades.find((u) => u.id === 'grill_timer')?.purchased;
  const hasHeatLamp = upgrades.find((u) => u.id === 'heat_lamp')?.purchased;

  const burgerOrders = orders.filter(o => o.burger);

  useEffect(() => {
    if (burgerOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(burgerOrders[0].id);
    }
  }, [orders]);

  // Sizzle SFX control and cooking tick loop
  useEffect(() => {
    if (activeStation !== 'grill') {
      stopSizzle();
      return;
    }

    const activeOnGrill = patties.filter(p => p.grillIndex !== null);
    if (activeOnGrill.length > 0) {
      startSizzle();
    } else {
      stopSizzle();
    }

    const interval = setInterval(() => {
      const speedMultiplier = hasGrillBooster ? 1.45 : 1.0;
      
      const nextPatties = patties.map((p) => {
        if (p.grillIndex === null) return p;

        let nextSide1 = p.side1Cooked;
        let nextSide2 = p.side2Cooked;
        const cookIncrement = (Math.random() * 2.5 + 2.0) * speedMultiplier;

        if (!p.isFlipped) {
          nextSide1 = Math.min(100, nextSide1 + cookIncrement);
        } else {
          nextSide2 = Math.min(100, nextSide2 + cookIncrement);
        }

        const isBurnt = nextSide1 >= 97 || nextSide2 >= 97;

        if (hasPattyAlarm) {
          const currentSideVal = p.isFlipped ? nextSide2 : nextSide1;
          const prevSideVal = p.isFlipped ? p.side2Cooked : p.side1Cooked;
          const milestones = [20, 50, 80, 96];
          milestones.forEach((threshold) => {
            if (prevSideVal < threshold && currentSideVal >= threshold) {
              playSound('ding');
            }
          });
        }

        let currentDoneness: 'rare' | 'medium' | 'well' = 'medium';
        const avg = p.isFlipped ? (nextSide1 + nextSide2) / 2 : nextSide1;
        if (avg < 50) currentDoneness = 'rare';
        else if (avg < 80) currentDoneness = 'medium';
        else currentDoneness = 'well';

        return {
          ...p,
          side1Cooked: nextSide1,
          side2Cooked: nextSide2,
          isBurnt,
          targetDoneness: currentDoneness,
        };
      });

      onUpdatePatties(nextPatties);
    }, 450);

    return () => {
      clearInterval(interval);
      stopSizzle();
    };
  }, [patties, activeStation, hasGrillBooster]);

  const activeTicket = burgerOrders.find(o => o.id === selectedTicketId);

  const getCookStatus = (pct: number) => {
    if (pct < 20) return { label: 'Raw', color: 'text-rose-400 bg-rose-950/40 border-rose-900/60' };
    if (pct < 50) return { label: 'Rare', color: 'text-red-400 bg-red-950/60 border-red-800' };
    if (pct < 80) return { label: 'Medium', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    if (pct < 96) return { label: 'Well Done', color: 'text-yellow-600 bg-yellow-950/60 border-yellow-900' };
    return { label: 'BURNT!', color: 'text-red-500 bg-red-950 border-red-900' };
  };

  const getPattyVisuals = (p: Patty) => {
    const cook = p.isFlipped ? p.side2Cooked : p.side1Cooked;
    if (p.isBurnt) {
      return {
        bg: 'radial-gradient(circle, #1c1917 20%, #09090b 90%)',
        textColor: 'text-red-500',
        label: 'BURNT CHARCOAL',
        sears: 'rgba(0, 0, 0, 0.95)',
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        fleckOpacity: 0.1,
      };
    }
    if (cook < 20) {
      return {
        bg: 'radial-gradient(circle, #f43f5e 10%, #be123c 80%)',
        textColor: 'text-rose-200',
        label: 'RAW BEEF',
        sears: 'rgba(251, 113, 133, 0.25)',
        shadow: 'shadow-md',
        fleckOpacity: 0.8,
      };
    }
    if (cook < 50) {
      return {
        bg: 'radial-gradient(circle, #e11d48 10%, #881337 90%)',
        textColor: 'text-rose-100',
        label: 'RARE SEAR',
        sears: 'rgba(127, 29, 29, 0.45)',
        shadow: 'shadow-lg',
        fleckOpacity: 0.4,
      };
    }
    if (cook < 80) {
      return {
        bg: 'radial-gradient(circle, #78350f 15%, #451a03 85%)',
        textColor: 'text-amber-200',
        label: 'MED SIZZLE',
        sears: 'rgba(28, 25, 23, 0.75)',
        shadow: 'shadow-lg',
        fleckOpacity: 0.2,
      };
    }
    return {
      bg: 'radial-gradient(circle, #292524 25%, #1c1917 100%)',
      textColor: 'text-yellow-600',
      label: 'WELL DONE',
      sears: 'rgba(0, 0, 0, 0.85)',
      shadow: 'shadow-xl',
      fleckOpacity: 0.05,
    };
  };

  const handleFlipClick = (pattyId: string) => {
    playSound('sweep');
    setFlippingPattyIds(prev => ({ ...prev, [pattyId]: true }));
    onFlipPatty(pattyId);
    setTimeout(() => {
      setFlippingPattyIds(prev => ({ ...prev, [pattyId]: false }));
    }, 450);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-orange-600/10 via-slate-900 to-orange-950/20 font-sans p-3">
      
      {/* Dynamic Sizzling particles */}
      <style>{`
        @keyframes steamUp {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 0.35; }
          100% { transform: translateY(-30px) scale(1.4); opacity: 0; }
        }
        .steam-cloud { animation: steamUp 1.5s infinite linear; }
      `}</style>

      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* TOP: Tickets Row */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Burger Tickets</span>
            {activeTicket && activeTicket.burger && (
              <span className="font-mono text-[9.5px] text-orange-400 font-bold uppercase">
                Goal: {activeTicket.burger.doneness} ({activeTicket.burger.pattiesCount} Patty Required)
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {burgerOrders.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => { playSound('click'); setSelectedTicketId(ticket.id); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTicketId === ticket.id
                    ? 'bg-orange-500/15 border-orange-500/60 text-orange-300 font-black'
                    : 'bg-slate-900/60 border-slate-850 text-slate-400'
                }`}
              >
                <span>{ticket.avatarEmoji}</span>
                <div className="text-left">
                  <p className="font-sans text-[10px] font-bold truncate max-w-[80px]">{ticket.customerName}</p>
                  <p className="font-mono text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                    {ticket.burger?.doneness}
                  </p>
                </div>
              </button>
            ))}
            {burgerOrders.length === 0 && (
              <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active burger orders in progress.</p>
            )}
          </div>
        </div>

        {/* MIDDLE: Flattop Griddles */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <h2 className="font-sans font-black text-xs text-white uppercase tracking-wider">Sizzling Flattop Grill</h2>
            </div>
            {hasGrillBooster && (
              <span className="text-[8px] font-mono text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900">⚡ INFRARED BOOST ON</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full my-auto">
            {[0, 1, 2, 3].map((slotIdx) => {
              const patty = patties.find((p) => p.grillIndex === slotIdx);
              const isFlipping = patty ? flippingPattyIds[patty.id] : false;

              return (
                <div 
                  key={slotIdx}
                  className="aspect-square relative rounded-2xl bg-slate-950 border border-slate-850 shadow-inner flex flex-col items-center justify-center overflow-hidden"
                >
                  {/* Heating iron bars background decoration */}
                  <div className="absolute inset-x-0 h-[2px] bg-red-950/30 top-1/4"></div>
                  <div className="absolute inset-x-0 h-[2px] bg-red-950/30 top-1/2"></div>
                  <div className="absolute inset-x-0 h-[2px] bg-red-950/30 top-3/4"></div>

                  <AnimatePresence mode="wait">
                    {!patty ? (
                      <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center w-full h-full">
                        <span className="text-xl opacity-20 mb-1">🥩</span>
                        <p className="font-mono text-[6.5px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Grill Slot {slotIdx + 1}</p>
                        <button
                          onClick={() => { playSound('click'); onAddPattyToGrill(slotIdx, 'medium'); }}
                          className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg font-sans text-[8.5px] font-black hover:scale-102 transition-transform uppercase cursor-pointer"
                        >
                          🥩 Lay Patty
                        </button>
                      </div>
                    ) : (
                      <div className="relative z-10 w-full h-full p-2 flex flex-col justify-between items-center overflow-hidden">
                        
                        {/* Steam indicator */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                          <div className="absolute bottom-6 left-1/3 w-3 h-3 bg-white/5 blur-md rounded-full steam-cloud"></div>
                          <div className="absolute bottom-8 right-1/3 w-4 h-4 bg-white/5 blur-md rounded-full steam-cloud" style={{ animationDelay: '0.5s' }}></div>
                        </div>

                        <div 
                          className="relative flex items-center justify-center my-auto"
                          style={{
                            transform: isFlipping ? 'rotateX(180deg) scale(0.92)' : 'rotateX(0deg) scale(1)',
                            transition: 'transform 0.4s ease-out'
                          }}
                        >
                          {/* Outer Dial timer */}
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" className="stroke-slate-900" strokeWidth="3" fill="transparent" />
                            <circle
                              cx="32" cy="32" r="28"
                              className="stroke-rose-600"
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - patty.side1Cooked / 100)}`}
                            />
                            {patty.isFlipped && (
                              <circle
                                cx="32" cy="32" r="23"
                                className="stroke-amber-400"
                                strokeWidth="2.5"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 23}`}
                                strokeDashoffset={`${2 * Math.PI * 23 * (1 - patty.side2Cooked / 100)}`}
                              />
                            )}
                          </svg>

                          {/* Patty disk */}
                          <div 
                            className={`absolute w-12 h-12 rounded-full border flex flex-col items-center justify-center ${getPattyVisuals(patty).shadow}`}
                            style={{
                              background: getPattyVisuals(patty).bg,
                              borderColor: '#111'
                            }}
                          >
                            <span className={`font-black text-[6.5px] leading-none z-10 select-none bg-black/60 px-1 py-0.5 rounded ${getPattyVisuals(patty).textColor}`}>
                              {getPattyVisuals(patty).label}
                            </span>
                          </div>
                        </div>

                        {/* Readout stats */}
                        <div className="grid grid-cols-2 gap-1 w-full text-center mt-1">
                          <div className="bg-slate-900/80 p-0.5 rounded border border-slate-800">
                            <p className="text-[6px] text-slate-500 font-bold leading-none uppercase">S1</p>
                            <span className="text-[7px] font-black text-slate-300">
                              {Math.round(patty.side1Cooked)}%
                            </span>
                          </div>
                          <div className="bg-slate-900/80 p-0.5 rounded border border-slate-800">
                            <p className="text-[6px] text-slate-500 font-bold leading-none uppercase">S2</p>
                            <span className="text-[7px] font-black text-slate-300">
                              {patty.isFlipped ? `${Math.round(patty.side2Cooked)}%` : 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Flipping actions */}
                        <div className="w-full mt-1 shrink-0">
                          {!patty.isFlipped ? (
                            <button
                              onClick={() => handleFlipClick(patty.id)}
                              className="w-full py-0.5 bg-amber-500 text-slate-950 font-sans text-[7.5px] font-black rounded transition-all cursor-pointer uppercase shadow"
                            >
                              Flip Side 🔁
                            </button>
                          ) : (
                            <button
                              onClick={() => { playSound('coin'); onRemovePattyFromGrill(patty.id); }}
                              className="w-full py-0.5 bg-emerald-500 text-white font-sans text-[7.5px] font-black rounded transition-all cursor-pointer uppercase shadow animate-pulse"
                            >
                              To Tray 📥
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM: Rest Tray shelf */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Grill Tray inventory</span>
            {hasHeatLamp && (
              <span className="text-[7px] font-bold text-yellow-400 uppercase tracking-widest">💡 Heat Lamp Installed</span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin max-h-12 items-center">
            {patties.filter((p) => p.grillIndex === null).length === 0 ? (
              <p className="font-sans text-[8.5px] text-slate-500 italic py-1 pl-1">No cooked patties resting on the tray yet.</p>
            ) : (
              patties.filter((p) => p.grillIndex === null).map((p) => {
                const doneness = getAchievedDoneness(p);
                return (
                  <div 
                    key={p.id} 
                    className="flex-shrink-0 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5"
                  >
                    <span className="text-[10px]">🥩</span>
                    <span className="font-sans font-black text-[8px] text-slate-200 uppercase">
                      Patty ({doneness})
                    </span>
                    {p.isBurnt && (
                      <span className="px-1 bg-red-950 border border-red-900 text-red-500 text-[6px] font-bold rounded">BURNT</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
