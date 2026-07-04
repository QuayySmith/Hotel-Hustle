/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Volume2 } from 'lucide-react';
import { CustomerOrder, DrinkState, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface DrinkStationProps {
  orders: CustomerOrder[];
  drink: DrinkState;
  onUpdateDrink: (updated: DrinkState) => void;
  onCompleteDrink: () => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function DrinkStation({
  orders,
  drink,
  onUpdateDrink,
  onCompleteDrink,
  upgrades,
  activeStation,
}: DrinkStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isPouring, setIsPouring] = useState(false);

  const hasAutoFiller = upgrades.find((u) => u.id === 'fountain_booster')?.purchased;
  const drinkOrders = orders.filter((o) => o.drink);

  useEffect(() => {
    if (drinkOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(drinkOrders[0].id);
    }
  }, [orders]);

  // Soda Pouring tick interval
  useEffect(() => {
    if (activeStation !== 'drink' || !isPouring || drink.fillProgress >= 100) {
      if (isPouring) setIsPouring(false);
      return;
    }

    const interval = setInterval(() => {
      let nextFill = drink.fillProgress + (Math.random() * 3.5 + 4.0);
      let isOverflowed = drink.isOverflowed;

      if (nextFill >= 100) {
        nextFill = 100;
        isOverflowed = true;
        setIsPouring(false);
        playSound('fail');
      } else {
        playSound('click');
      }

      onUpdateDrink({
        ...drink,
        fillProgress: nextFill,
        isOverflowed,
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPouring, drink, activeStation]);

  const handleSelectSize = (size: 'Medium' | 'Large') => {
    playSound('click');
    onUpdateDrink({ ...drink, step: 'ice', size });
  };

  const handleAddIce = () => {
    playSound('click');
    onUpdateDrink({ ...drink, step: 'flavor', hasIce: true });
  };

  const handleSelectFlavor = (flavor: 'Cola' | 'Lemon Lime' | 'Orange Soda') => {
    playSound('click');
    onUpdateDrink({ ...drink, step: 'pour', flavor });
  };

  const handlePourStart = () => {
    if (drink.fillProgress >= 100) return;
    playSound('sweep');
    setIsPouring(true);
  };

  const handlePourEnd = () => {
    setIsPouring(false);
  };

  const handleAutoFill = () => {
    playSound('chime');
    setIsPouring(false);
    onUpdateDrink({
      ...drink,
      step: 'cap',
      fillProgress: 88,
      isOverflowed: false,
    });
  };

  const handleCapStraw = () => {
    playSound('coin');
    onCompleteDrink();
  };

  const handleDiscard = () => {
    playSound('sweep');
    setIsPouring(false);
    onUpdateDrink({
      step: 'size',
      size: null,
      hasIce: false,
      flavor: null,
      fillProgress: 0,
      isOverflowed: false,
    });
  };

  const activeTicket = drinkOrders.find((o) => o.id === selectedTicketId);

  const getSodaColor = (flavor: string | null) => {
    if (flavor === 'Cola') return 'linear-gradient(to top, #451a03 20%, #1c1917 80%)';
    if (flavor === 'Lemon Lime') return 'linear-gradient(to top, #84cc16 30%, #bef264 90%)';
    if (flavor === 'Orange Soda') return 'linear-gradient(to top, #ea580c 20%, #f97316 80%)';
    return 'transparent';
  };

  const getFillStatus = (pct: number) => {
    if (pct === 0) return { label: 'Empty Cup', color: 'text-slate-400 bg-slate-900 border-slate-800' };
    if (pct < 40) return { label: 'Shallow Fill', color: 'text-amber-500/80 bg-amber-950/20 border-amber-900/40' };
    if (pct < 75) return { label: 'Half Filled', color: 'text-cyan-400 bg-cyan-950/30 border-cyan-900' };
    if (pct < 96) return { label: 'PERFECT POUR! 🥤', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900 animate-pulse' };
    return { label: 'OVERFLOW SPILL! 🌊', color: 'text-red-500 bg-red-950 border-red-900' };
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-cyan-600/10 via-slate-900 to-cyan-950/20 font-sans p-3">
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* Ticket Banner */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Fountain Drink Tickets</span>
            <div className="flex gap-1 overflow-x-auto max-w-[180px] scrollbar-none">
              {drinkOrders.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { playSound('click'); setSelectedTicketId(t.id); }}
                  className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg border text-[8.5px] font-black transition-all cursor-pointer ${
                    selectedTicketId === t.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                      : 'bg-slate-900 border-slate-850 text-slate-400'
                  }`}
                >
                  {t.avatarEmoji} {t.customerName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {activeTicket && activeTicket.drink ? (
            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-sm shrink-0">{activeTicket.avatarEmoji}</span>
                <div>
                  <h4 className="font-sans font-black text-[9.5px] leading-none text-slate-850">{activeTicket.customerName}</h4>
                  <p className="font-mono text-[7px] text-slate-400 uppercase mt-0.5">Craving: Soda</p>
                </div>
              </div>

              {/* Requirement badge */}
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-cyan-100 border border-cyan-200 text-cyan-700 text-[9.5px] font-black rounded uppercase">
                  🥤 {activeTicket.drink.size} Cup
                </span>
                <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 text-[9.5px] font-black rounded uppercase">
                  {activeTicket.drink.flavor}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active drink orders in progress.</p>
          )}
        </div>

        {/* Soda Dispenser Workspace */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              🥤 Fountain Soda Dispenser
            </span>
            <button
              onClick={handleDiscard}
              className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg font-sans text-[8px] font-bold transition-all uppercase cursor-pointer"
            >
              Discard cup
            </button>
          </div>

          <div className="flex-1 flex gap-4 items-center justify-center my-auto w-full">
            
            {/* Fountain Nozzles column left */}
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-2.5 shrink-0 shadow-lg">
              <span className="font-mono text-[6px] text-slate-500 font-bold uppercase tracking-wider text-center">NOZZLES</span>
              <div className="w-1.5 h-6 bg-slate-400 mx-auto rounded-b"></div>
              
              <div className="w-20 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-orange-500 rounded-full"></div>
            </div>

            {/* Core soda cup display */}
            <div className="flex-1 flex flex-col justify-between items-center h-48 py-1.5 relative">
              {drink.step !== 'size' && drink.size ? (
                <div className="relative flex flex-col items-center justify-end h-32 w-28">
                  
                  {/* The cup outline with semi-transparent walls */}
                  <div 
                    className="border-2 border-slate-300 bg-slate-950/40 relative overflow-hidden shadow-lg flex flex-col justify-end p-0.5"
                    style={{
                      width: drink.size === 'Large' ? '80px' : '68px',
                      height: drink.size === 'Large' ? '120px' : '100px',
                      borderRadius: '4px 4px 16px 16px'
                    }}
                  >
                    {/* Pouring stream visual overlay */}
                    {isPouring && (
                      <div 
                        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 opacity-90 z-10"
                        style={{ background: getSodaColor(drink.flavor) }}
                      ></div>
                    )}

                    {/* Rising Soda liquid */}
                    <div 
                      className="w-full transition-all duration-150 relative"
                      style={{
                        height: `${drink.fillProgress}%`,
                        background: getSodaColor(drink.flavor),
                        borderRadius: '0 0 14px 14px'
                      }}
                    >
                      {/* Fizz bubbles */}
                      {isPouring && (
                        <div className="absolute top-0 inset-x-0 h-2 bg-white/40 blur-xs animate-pulse rounded-full"></div>
                      )}
                    </div>

                    {/* Ice Cubes */}
                    {drink.hasIce && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        <span className="text-[10px] select-none opacity-80">🧊</span>
                        <span className="text-[10px] select-none opacity-80">🧊</span>
                      </div>
                    )}

                    {/* Straw on cap step */}
                    {drink.step === 'cap' && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-slate-500 border border-slate-300 rounded flex justify-center z-20">
                        <div className="w-1.5 h-16 bg-red-500 border-x border-white -mt-12 rotate-12 rounded"></div>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-[8px] text-slate-400 font-bold uppercase mt-2">
                    {drink.size} Cup • {drink.flavor || 'No Flavor'}
                  </span>
                </div>
              ) : (
                <div className="w-24 h-28 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600">
                  <span className="text-[9px] uppercase tracking-wider font-bold">No Cup Loaded</span>
                </div>
              )}

              {/* Status display & nozzle pouring actions */}
              <div className="w-full text-center">
                <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border ${getFillStatus(drink.fillProgress).color}`}>
                  {getFillStatus(drink.fillProgress).label}
                </span>
              </div>
            </div>

          </div>

          {/* Interaction controls block */}
          <div className="mt-2.5 w-full max-w-sm mx-auto shrink-0">
            {drink.step === 'size' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectSize('Medium')}
                  className="py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all"
                >
                  🥤 Medium Cup
                </button>
                <button
                  onClick={() => handleSelectSize('Large')}
                  className="py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all"
                >
                  🥤 Large Cup
                </button>
              </div>
            )}

            {drink.step === 'ice' && (
              <button
                onClick={handleAddIce}
                className="w-full py-1.5 bg-cyan-500 text-slate-950 font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all"
              >
                🧊 Drop Ice Chunks
              </button>
            )}

            {drink.step === 'flavor' && (
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleSelectFlavor('Cola')}
                  className="py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded-lg text-[8px] font-black uppercase"
                >
                  🥤 Cola
                </button>
                <button
                  onClick={() => handleSelectFlavor('Lemon Lime')}
                  className="py-1.5 bg-lime-900 hover:bg-lime-800 text-lime-100 border border-lime-700 rounded-lg text-[8px] font-black uppercase"
                >
                  🍋 Lime
                </button>
                <button
                  onClick={() => handleSelectFlavor('Orange Soda')}
                  className="py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-200 border border-orange-800 rounded-lg text-[8px] font-black uppercase"
                >
                  🍊 Orange
                </button>
              </div>
            )}

            {drink.step === 'pour' && (
              <div className="flex gap-2">
                {hasAutoFiller ? (
                  <button
                    onClick={handleAutoFill}
                    className="flex-1 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-[8px] font-black rounded-xl uppercase animate-pulse"
                  >
                    ⚡ Auto-Fill Fountain Nozzle
                  </button>
                ) : (
                  <button
                    onMouseDown={handlePourStart}
                    onMouseUp={handlePourEnd}
                    onMouseLeave={handlePourEnd}
                    onTouchStart={handlePourStart}
                    onTouchEnd={handlePourEnd}
                    className="flex-1 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 active:from-yellow-400 text-slate-950 font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all select-none cursor-pointer"
                  >
                    {isPouring ? '🌊 POURING SODA...' : '👇 HOLD DOWN TO POUR'}
                  </button>
                )}
                {drink.fillProgress > 0 && (
                  <button
                    onClick={() => onUpdateDrink({ ...drink, step: 'cap' })}
                    className="px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[8.5px] font-black rounded-xl uppercase"
                  >
                    Done ✓
                  </button>
                )}
              </div>
            )}

            {drink.step === 'cap' && (
              <button
                disabled={drink.isOverflowed}
                onClick={handleCapStraw}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-sans text-[8.5px] font-black rounded-xl uppercase tracking-wider transition-all shadow"
              >
                Cap Dome Lid &amp; Straw To Tray ✓
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
