/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Volume2, AlertTriangle } from 'lucide-react';
import { CustomerOrder, PizzaState, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface PizzaStationProps {
  orders: CustomerOrder[];
  pizza: PizzaState;
  onUpdatePizza: (updated: PizzaState) => void;
  onCompletePizza: () => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function PizzaStation({
  orders,
  pizza,
  onUpdatePizza,
  onCompletePizza,
  upgrades,
  activeStation,
}: PizzaStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const hasBrickOvenUpgrade = upgrades.find((u) => u.id === 'pizza_oven')?.purchased;
  const pizzaOrders = orders.filter((o) => o.pizza);

  useEffect(() => {
    if (pizzaOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(pizzaOrders[0].id);
    }
  }, [orders]);

  // Baking loop
  useEffect(() => {
    if (activeStation !== 'pizza' || !pizza.isBaking || pizza.isBakeCompleted) return;

    const interval = setInterval(() => {
      const speed = hasBrickOvenUpgrade ? 3.0 : 2.0;
      let nextProgress = pizza.bakeProgress + (Math.random() * 2.0 + speed);
      let isBurnt = pizza.isBurnt;

      if (nextProgress >= 100) {
        nextProgress = 100;
        isBurnt = true;
      }

      onUpdatePizza({
        ...pizza,
        bakeProgress: nextProgress,
        isBurnt,
      });
    }, 450);

    return () => clearInterval(interval);
  }, [pizza, activeStation, hasBrickOvenUpgrade]);

  const handleStretch = () => {
    playSound('click');
    onUpdatePizza({ ...pizza, step: 'sauce' });
  };

  const handleAddSauce = () => {
    playSound('click');
    onUpdatePizza({ ...pizza, step: 'cheese', hasSauce: true });
  };

  const handleAddCheese = () => {
    playSound('click');
    onUpdatePizza({ ...pizza, step: 'toppings', hasCheese: true });
  };

  const handleAddTopping = (topping: string) => {
    playSound('click');
    const updatedToppings = [...pizza.toppings];
    if (!updatedToppings.includes(topping)) {
      updatedToppings.push(topping);
    }
    onUpdatePizza({ ...pizza, toppings: updatedToppings });
  };

  const handleSlideIntoOven = () => {
    playSound('chime');
    onUpdatePizza({ ...pizza, isBaking: true });
  };

  const handlePullFromOven = () => {
    playSound('sweep');
    onUpdatePizza({ ...pizza, isBaking: false, isBakeCompleted: true, step: 'slice' });
  };

  const handleSlice = () => {
    playSound('click');
    onUpdatePizza({ ...pizza, step: 'box', isSliced: true });
  };

  const handleBox = () => {
    playSound('coin');
    onCompletePizza();
  };

  const handleDiscard = () => {
    playSound('sweep');
    onUpdatePizza({
      step: 'stretch',
      hasSauce: false,
      hasCheese: false,
      toppings: [],
      isBaking: false,
      bakeProgress: 0,
      isBakeCompleted: false,
      isSliced: false,
      isBurnt: false,
    });
  };

  const activeTicket = pizzaOrders.find((o) => o.id === selectedTicketId);

  const getBakeStatusLabel = (prog: number) => {
    if (prog === 0) return { label: 'Uncooked', color: 'text-slate-400 bg-slate-900 border-slate-800' };
    if (prog < 50) return { label: 'Rising...', color: 'text-yellow-500/80 bg-yellow-950/20 border-yellow-900/40' };
    if (prog < 75) return { label: 'Melting cheese', color: 'text-orange-400 bg-orange-950/30 border-orange-900' };
    if (prog < 96) return { label: 'GOLDEN BAKE! 🔥', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900 animate-pulse' };
    return { label: 'BURNT COAL! 💣', color: 'text-red-500 bg-red-950 border-red-900' };
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-yellow-700/10 via-slate-900 to-yellow-950/20 font-sans p-3">
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* Active Ticket Header */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Pizza Oven Tickets</span>
            <div className="flex gap-1 overflow-x-auto max-w-[180px] scrollbar-none">
              {pizzaOrders.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { playSound('click'); setSelectedTicketId(t.id); }}
                  className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg border text-[8.5px] font-black transition-all cursor-pointer ${
                    selectedTicketId === t.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                      : 'bg-slate-900 border-slate-850 text-slate-400'
                  }`}
                >
                  {t.avatarEmoji} {t.customerName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {activeTicket && activeTicket.pizza ? (
            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-sm shrink-0">{activeTicket.avatarEmoji}</span>
                <div>
                  <h4 className="font-sans font-black text-[9.5px] leading-none text-slate-850">{activeTicket.customerName}</h4>
                  <p className="font-mono text-[7px] text-slate-400 uppercase mt-0.5">Craves: Craft Pizza</p>
                </div>
              </div>

              {/* Pizza requirements list */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                <span className="text-[9px] font-bold text-slate-500 mr-1">Toppings:</span>
                {activeTicket.pizza.toppings.length === 0 ? (
                  <span className="text-[9.5px] font-black text-amber-700">Plain Cheese 🧀</span>
                ) : (
                  activeTicket.pizza.toppings.map((top) => (
                    <span key={top} className="text-[10px]" title={top}>
                      {top === 'pepperoni' ? '🍕' : '🍄'}
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active pizza orders in progress.</p>
          )}
        </div>

        {/* Workspace Oven & Table */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              🍕 Brickoven Hearth Table
            </span>
            <button
              onClick={handleDiscard}
              className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg font-sans text-[8px] font-bold transition-all uppercase cursor-pointer"
            >
              Discard Pizza
            </button>
          </div>

          <div className="flex-1 flex gap-3 items-center justify-between min-h-0">
            
            {/* LEFT SIDE: Oven Hearth */}
            <div className="w-1/2 aspect-square max-w-[160px] bg-slate-950 border-2 border-orange-950 rounded-2xl p-2.5 flex flex-col justify-between items-center relative overflow-hidden shadow-inner">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-orange-500/20 to-transparent pointer-events-none"></div>
              
              <span className="font-mono text-[7px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-900 w-full text-center pb-0.5">
                🔥 WOOD OVEN
              </span>

              {/* Pizza baking visual */}
              {pizza.isBaking ? (
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center animate-pulse">
                  <span className="text-3xl animate-bounce">🍕</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border border-dashed border-slate-900 flex items-center justify-center text-slate-700">
                  <span className="text-xs">Oven Empty</span>
                </div>
              )}

              {/* Bake status & bar */}
              <div className="w-full text-center">
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${getBakeStatusLabel(pizza.bakeProgress).color}`}>
                  {getBakeStatusLabel(pizza.bakeProgress).label}
                </span>

                <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      pizza.bakeProgress < 75 ? 'bg-amber-500' : pizza.bakeProgress < 96 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${pizza.bakeProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Dough Prep Board */}
            <div className="w-1/2 aspect-square max-w-[160px] bg-amber-950/20 border border-slate-850 rounded-2xl p-2 flex flex-col justify-between items-center relative shadow-inner">
              
              <span className="font-mono text-[7px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-900 w-full text-center pb-0.5">
                📋 BOARD
              </span>

              {/* Pizza Board illustration based on step */}
              <div className="flex-1 flex items-center justify-center py-1">
                {pizza.step === 'stretch' && (
                  <div className="w-20 h-20 rounded-full bg-amber-100/30 border-2 border-dashed border-amber-400/50 flex items-center justify-center shadow-lg">
                    <span className="text-2xl animate-pulse">🌾</span>
                  </div>
                )}
                {pizza.step === 'sauce' && (
                  <div className="w-24 h-24 rounded-full bg-[#f5deb3] border-2 border-[#d2b48c] shadow-lg flex items-center justify-center">
                    <span className="text-[8px] font-black text-amber-850 uppercase tracking-wider">Raw Dough</span>
                  </div>
                )}
                {pizza.step === 'cheese' && (
                  <div className="w-24 h-24 rounded-full bg-[#f5deb3] border-2 border-[#d2b48c] shadow-lg relative flex items-center justify-center overflow-hidden">
                    {/* sauce overlay */}
                    <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-red-600 to-red-800 border border-red-900 shadow-inner flex items-center justify-center">
                      <span className="text-[8px] font-black text-red-100 uppercase tracking-widest opacity-90">Sauce</span>
                    </div>
                  </div>
                )}
                {(pizza.step === 'toppings' || pizza.isBaking) && (
                  <div className={`w-24 h-24 rounded-full ${pizza.isBurnt ? 'bg-stone-900 border-stone-950' : 'bg-[#f5deb3] border-[#d2b48c]'} border-2 shadow-lg relative flex items-center justify-center overflow-hidden`}>
                    {/* sauce and cheese overlays */}
                    <div className={`w-[84px] h-[84px] rounded-full ${pizza.isBurnt ? 'bg-stone-800 border-stone-900' : 'bg-gradient-to-br from-amber-400 via-yellow-400 to-yellow-300 border-amber-500'} border relative shadow-inner`}>
                      {/* Topping scatter spots */}
                      {[
                        { top: '15%', left: '15%' },
                        { top: '15%', right: '15%' },
                        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                        { bottom: '15%', left: '15%' },
                        { bottom: '15%', right: '15%' },
                      ].map((pos, idx) => {
                        return (
                          <div key={idx} className="absolute pointer-events-none" style={pos}>
                            <div className="flex flex-wrap gap-0.5 justify-center items-center w-5 h-5">
                              {pizza.toppings.map((t) => {
                                if (t === 'pepperoni') return <span key={t} className="text-[8px] leading-none">🍕</span>;
                                if (t === 'mushroom') return <span key={t} className="text-[8px] leading-none">🍄</span>;
                                if (t === 'onion') return <span key={t} className="text-[8px] leading-none">🧅</span>;
                                if (t === 'peppers') return <span key={t} className="text-[8px] leading-none">🫑</span>;
                                if (t === 'sausage') return <span key={t} className="text-[8px] leading-none">🟤</span>;
                                if (t === 'olives') return <span key={t} className="text-[8px] leading-none">🖤</span>;
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {!pizza.isBurnt && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                          <span className="text-[6px] font-black text-amber-900 tracking-widest uppercase">Cheese</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {pizza.step === 'slice' && (
                  <div className={`w-24 h-24 rounded-full ${pizza.isBurnt ? 'bg-stone-900' : 'bg-[#eab308]'} border-2 border-amber-600 shadow-xl relative flex items-center justify-center overflow-hidden`}>
                    <span className="text-3xl">🍕</span>
                    {pizza.isSliced && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-950/60 transform -translate-x-1/2"></div>
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-amber-950/60 transform -translate-y-1/2"></div>
                      </div>
                    )}
                  </div>
                )}
                {pizza.step === 'box' && (
                  <div className="w-24 h-24 bg-gradient-to-b from-amber-800 to-amber-950 border-2 border-amber-900 rounded-lg shadow-xl relative flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                    <span className="absolute bottom-1 text-[6.5px] font-black text-amber-200 uppercase tracking-widest leading-none">BOXED</span>
                  </div>
                )}
              </div>

              {/* Prep steps actions */}
              <div className="w-full">
                {pizza.step === 'stretch' && (
                  <button
                    onClick={handleStretch}
                    className="w-full py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all"
                  >
                    🌾 Roll Dough
                  </button>
                )}
                {pizza.step === 'sauce' && (
                  <button
                    onClick={handleAddSauce}
                    className="w-full py-1 bg-red-600 hover:bg-red-500 text-white font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all"
                  >
                    🍅 Spread Sauce
                  </button>
                )}
                {pizza.step === 'cheese' && (
                  <button
                    onClick={handleAddCheese}
                    className="w-full py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all"
                  >
                    🧀 Sprinkle Cheese
                  </button>
                )}
                {pizza.step === 'toppings' && !pizza.isBaking && (
                  <div className="flex flex-col gap-1 w-full">
                    {/* Grid of 6 toppings from concept images */}
                    <div className="grid grid-cols-3 gap-0.5">
                      {[
                        { id: 'pepperoni', label: '🍕 Pep', color: 'bg-red-500 hover:bg-red-400' },
                        { id: 'mushroom', label: '🍄 Mush', color: 'bg-stone-500 hover:bg-stone-400' },
                        { id: 'onion', label: '🧅 Onion', color: 'bg-purple-500 hover:bg-purple-400' },
                        { id: 'peppers', label: '🫑 Pepper', color: 'bg-green-600 hover:bg-green-500' },
                        { id: 'sausage', label: '🟤 Sausage', color: 'bg-amber-800 hover:bg-amber-700' },
                        { id: 'olives', label: '🖤 Olive', color: 'bg-slate-800 hover:bg-slate-700' },
                      ].map((t) => {
                        const active = pizza.toppings.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleAddTopping(t.id)}
                            className={`py-0.5 text-[6.5px] font-black rounded border transition-all ${
                              active ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed' : `${t.color} text-white border-transparent cursor-pointer`
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                    {/* Slide into Oven action */}
                    <button
                      onClick={handleSlideIntoOven}
                      className="w-full py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[7.5px] font-black rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Bake 🚀
                    </button>
                  </div>
                )}
                {pizza.isBaking && (
                  <button
                    onClick={handlePullFromOven}
                    className="w-full py-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all animate-pulse"
                  >
                    📤 Pull Oven
                  </button>
                )}
                {pizza.step === 'slice' && (
                  <button
                    onClick={handleSlice}
                    className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all"
                  >
                    🔪 Slice 6-Portions
                  </button>
                )}
                {pizza.step === 'box' && (
                  <button
                    disabled={pizza.isBurnt}
                    onClick={handleBox}
                    className="w-full py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-sans text-[8px] font-black rounded-lg uppercase tracking-wider transition-all"
                  >
                    📦 Box Pizza To Tray
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
