/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { CustomerOrder, Patty, Upgrade } from '../types';
import { BURGER_INGREDIENTS } from '../data';
import { playSound } from '../lib/audio';

interface StackedLayer {
  id: string;
  rotation: number;
  xOffset: number;
  uid: string;
}

interface BuildStationProps {
  orders: CustomerOrder[];
  patties: Patty[];
  onCompleteBurger: (
    orderId: string, 
    stack: string[], 
    pattyId: string | null
  ) => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function BuildStation({
  orders,
  patties,
  onCompleteBurger,
  upgrades,
  activeStation,
}: BuildStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeStack, setActiveStack] = useState<StackedLayer[]>([]);
  const [selectedPattyId, setSelectedPattyId] = useState<string | null>(null);

  const finishedPatties = patties.filter((p) => p.grillIndex === null);
  const burgerOrders = orders.filter((o) => o.burger);

  useEffect(() => {
    if (burgerOrders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(burgerOrders[0].id);
    }
  }, [orders]);

  const activeTicket = burgerOrders.find((o) => o.id === selectedTicketId);
  const hasGoldenSpatula = upgrades.find((u) => u.id === 'golden_spatula')?.purchased;

  const handleAddIngredient = (id: string) => {
    playSound('click');
    const newLayer: StackedLayer = {
      id,
      rotation: Math.random() * 8 - 4, // -4deg to +4deg
      xOffset: Math.random() * 10 - 5,  // -5px to +5px
      uid: Math.random().toString(),
    };
    setActiveStack((prev) => [...prev, newLayer]);
  };

  const handleAddCookedPatty = (patty: Patty) => {
    if (activeStack.some((l) => l.id === 'patty')) {
      playSound('fail');
      return;
    }
    playSound('click');
    setSelectedPattyId(patty.id);
    const newLayer: StackedLayer = {
      id: 'patty',
      rotation: Math.random() * 4 - 2,
      xOffset: Math.random() * 6 - 3,
      uid: Math.random().toString(),
    };
    setActiveStack((prev) => [...prev, newLayer]);
  };

  const handleResetStack = () => {
    playSound('sweep');
    setActiveStack([]);
    setSelectedPattyId(null);
  };

  const handleWrapClick = () => {
    if (!selectedTicketId || !activeTicket) return;
    
    const rawStackIds = activeStack.map(l => l.id);
    const hasProteinVal = rawStackIds.includes('patty') || rawStackIds.includes('grilled_chicken');
    if (!rawStackIds.includes('bun_bottom') || !rawStackIds.includes('bun_top') || !hasProteinVal) {
      playSound('fail');
      return;
    }

    playSound('coin');
    onCompleteBurger(selectedTicketId, rawStackIds, selectedPattyId);
    
    // Reset local plate state
    setActiveStack([]);
    setSelectedPattyId(null);
  };

  const hasBottomBun = activeStack.some(l => l.id === 'bun_bottom');
  const hasTopBun = activeStack.some(l => l.id === 'bun_top');
  const hasProtein = activeStack.some(l => l.id === 'patty' || l.id === 'grilled_chicken');

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-amber-600/10 via-slate-900 to-amber-950/20 font-sans p-3">
      
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* TOP: Active Ticket Receipt */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Burger Assembly Tickets</span>
            <div className="flex gap-1 overflow-x-auto max-w-[180px] scrollbar-none">
              {burgerOrders.map((t) => (
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

          {activeTicket && activeTicket.burger ? (
            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-2 text-slate-900 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-sm shrink-0">{activeTicket.avatarEmoji}</span>
                <div>
                  <h4 className="font-sans font-black text-[9.5px] leading-none text-slate-850">{activeTicket.customerName}</h4>
                  <p className="font-mono text-[7px] text-slate-400 uppercase mt-0.5">Craving: {activeTicket.favoriteBurgerName}</p>
                </div>
              </div>

              {/* Steps display */}
              <div className="flex gap-1 overflow-x-auto max-w-[140px] scrollbar-none px-1">
                {activeTicket.burger.layers.map((layerId, idx) => {
                  const ing = BURGER_INGREDIENTS[layerId];
                  return (
                    <div 
                      key={idx}
                      className="w-5 h-5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] shrink-0"
                      title={ing?.name}
                    >
                      {ing?.icon || '🍔'}
                    </div>
                  );
                })}
              </div>

              <div className="text-right">
                <span className="text-[6px] text-slate-400 uppercase block font-bold leading-none">Doneness</span>
                <span className="text-[7.5px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1 py-0.5 rounded uppercase font-mono leading-none">
                  {activeTicket.burger.doneness}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active burger orders in progress.</p>
          )}
        </div>

        {/* MIDDLE: Interactive Ceramic Prep Plate */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              🍽️ Prep Table
            </span>
            <div className="flex items-center gap-1.5">
              {hasGoldenSpatula && (
                <span className="px-2 py-0.5 bg-yellow-500 text-slate-950 text-[7px] font-black rounded tracking-widest uppercase animate-pulse">✨ GOLDEN SPATULA</span>
              )}
              <button
                onClick={handleResetStack}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg font-sans text-[8px] font-bold transition-all flex items-center gap-1 cursor-pointer uppercase"
              >
                <Trash2 className="w-2.5 h-2.5" />
                Discard Stack
              </button>
            </div>
          </div>

          {/* Stacking Plate Area */}
          <div className="flex-1 relative flex items-center justify-center py-2 min-h-[140px]">
            {/* White Plate Ring */}
            <div className="absolute bottom-4 w-44 h-8 bg-gradient-to-b from-slate-200 to-slate-400 border-t border-white rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.5)] z-0 flex items-center justify-center">
              <div className="w-4/5 h-2/3 border border-slate-300 rounded-full bg-slate-50 opacity-50"></div>
            </div>

            {/* Vertical Stack Columns */}
            <div className="relative z-10 flex flex-col-reverse items-center justify-center pb-6 w-full max-w-[240px]">
              <AnimatePresence>
                {activeStack.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    className="text-center py-4 select-none"
                  >
                    <span className="text-xl animate-bounce">🍽️</span>
                    <p className="font-sans font-black text-[8px] text-slate-400 uppercase tracking-widest mt-1">Plate Empty</p>
                    <p className="font-sans text-[7.5px] text-slate-500 max-w-[160px] leading-normal mx-auto mt-0.5">
                      Tap ingredients below to build.
                    </p>
                  </motion.div>
                ) : (
                  activeStack.map((layer, idx) => {
                    const layerId = layer.id;
                    const isPatty = layerId === 'patty';
                    const cookedPatty = isPatty ? patties.find((p) => p.id === selectedPattyId) : null;

                    const transformStyle = {
                      transform: `translateX(${layer.xOffset}px) rotate(${layer.rotation}deg)`,
                      zIndex: 10 + idx,
                    };

                    // Render gorgeous high-fidelity stacked layers
                    if (layerId === 'bun_bottom') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[110px] h-[22px] rounded-b-[18px] rounded-t-sm bg-gradient-to-b from-amber-300 to-amber-600 border-t border-amber-200 relative -mt-1 flex items-center justify-center"
                          style={{ ...transformStyle, boxShadow: '0 3px 5px rgba(0,0,0,0.35)' }}
                        >
                          <span className="text-[7px] font-black text-amber-950/70 tracking-widest">BOTTOM</span>
                        </motion.div>
                      );
                    }

                    if (layerId === 'bun_top') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[112px] h-[26px] rounded-t-[24px] rounded-b-sm bg-gradient-to-b from-amber-300 to-amber-600 border-b border-amber-700 relative -mt-1 flex items-center justify-center"
                          style={{ ...transformStyle, boxShadow: '0 3px 5px rgba(0,0,0,0.35)' }}
                        >
                          <span className="text-[7.5px] font-black text-amber-950/80 tracking-widest">CROWN</span>
                        </motion.div>
                      );
                    }

                    if (layerId === 'patty') {
                      const isBurnt = cookedPatty?.isBurnt;
                      const pBg = isBurnt 
                        ? 'radial-gradient(circle, #292524, #121212)' 
                        : 'radial-gradient(circle, #7c2d12, #451a03)';
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[114px] h-[18px] rounded-lg border-y border-stone-950 relative -mt-1 flex items-center justify-center overflow-hidden"
                          style={{ ...transformStyle, background: pBg, boxShadow: '0 3px 4px rgba(0,0,0,0.4)' }}
                        >
                          <span className="text-[7px] font-black text-orange-200/90 tracking-widest uppercase">
                            {isBurnt ? 'BURNT BEEF' : '🥩 COOKED PATTY'}
                          </span>
                        </motion.div>
                      );
                    }

                    if (layerId === 'grilled_chicken') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[114px] h-[18px] rounded-lg border-y border-amber-950 relative -mt-1 flex items-center justify-center overflow-hidden"
                          style={{
                            ...transformStyle,
                            background: 'linear-gradient(to bottom, #d97706, #b45309)',
                            boxShadow: '0 3px 4px rgba(0,0,0,0.4)',
                          }}
                        >
                          <div className="absolute inset-0 flex justify-around opacity-20 pointer-events-none">
                            <div className="w-1 h-full bg-amber-950 transform -skew-x-12"></div>
                            <div className="w-1 h-full bg-amber-950 transform -skew-x-12"></div>
                            <div className="w-1 h-full bg-amber-950 transform -skew-x-12"></div>
                            <div className="w-1 h-full bg-amber-950 transform -skew-x-12"></div>
                          </div>
                          <span className="text-[7px] font-black text-amber-100 tracking-widest uppercase">
                            🍗 GRILLED CHICKEN
                          </span>
                        </motion.div>
                      );
                    }

                    if (layerId === 'cheese') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[116px] h-[6px] bg-yellow-400 border-t border-yellow-300 relative -mt-0.5"
                          style={{ ...transformStyle, borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        />
                      );
                    }

                    if (layerId === 'lettuce') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[118px] h-[8px] bg-emerald-500 border border-emerald-600 rounded-full relative -mt-1"
                          style={{ ...transformStyle, boxShadow: '0 1.5px 3px rgba(0,0,0,0.2)' }}
                        />
                      );
                    }

                    if (layerId === 'tomato') {
                      return (
                        <motion.div
                          key={layer.uid}
                          className="w-[110px] h-[9px] relative -mt-0.5 flex justify-center gap-2"
                          style={transformStyle}
                        >
                          <div className="w-10 h-2.5 bg-red-600 rounded-full border border-red-700 shadow" />
                          <div className="w-10 h-2.5 bg-red-600 rounded-full border border-red-700 shadow" />
                        </motion.div>
                      );
                    }

                    if (layerId === 'bacon') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[110px] h-[7px] relative -mt-1.5 flex justify-center gap-2"
                          style={transformStyle}
                        >
                          <div className="w-12 h-2.5 bg-gradient-to-r from-red-800 via-rose-950 to-red-800 rounded border-y border-red-950 shadow flex items-center justify-center">
                            <div className="w-full h-0.5 bg-rose-200/40"></div>
                          </div>
                          <div className="w-12 h-2.5 bg-gradient-to-r from-red-800 via-rose-950 to-red-800 rounded border-y border-red-950 shadow flex items-center justify-center">
                            <div className="w-full h-0.5 bg-rose-200/40"></div>
                          </div>
                        </motion.div>
                      );
                    }

                    if (layerId === 'onion') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[108px] h-[8px] relative -mt-1 flex justify-center gap-1.5"
                          style={transformStyle}
                        >
                          <div className="w-7 h-3 rounded-full border-2 border-purple-400 bg-purple-100/10 flex items-center justify-center">
                            <div className="w-4 h-1 border border-purple-300 rounded-full"></div>
                          </div>
                          <div className="w-7 h-3 rounded-full border-2 border-purple-400 bg-purple-100/10 flex items-center justify-center">
                            <div className="w-4 h-1 border border-purple-300 rounded-full"></div>
                          </div>
                        </motion.div>
                      );
                    }

                    if (layerId === 'pickle') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[108px] h-[6px] relative -mt-1 flex justify-center gap-2.5"
                          style={transformStyle}
                        >
                          <div className="w-6 h-3 bg-emerald-700 rounded-full border border-emerald-900 shadow relative flex items-center justify-center">
                            <div className="w-3 h-1 bg-emerald-600/65 rounded-full border border-dashed border-emerald-800/40"></div>
                          </div>
                          <div className="w-6 h-3 bg-emerald-700 rounded-full border border-emerald-900 shadow relative flex items-center justify-center">
                            <div className="w-3 h-1 bg-emerald-600/65 rounded-full border border-dashed border-emerald-800/40"></div>
                          </div>
                        </motion.div>
                      );
                    }

                    if (layerId === 'jalapenos') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[106px] h-[6px] relative -mt-1 flex justify-center gap-2"
                          style={transformStyle}
                        >
                          <div className="w-5 h-2.5 bg-green-700 rounded-full border border-green-900 shadow flex items-center justify-center">
                            <div className="w-2 h-1 bg-[#130d22] rounded-full"></div>
                          </div>
                          <div className="w-5 h-2.5 bg-green-700 rounded-full border border-green-900 shadow flex items-center justify-center">
                            <div className="w-2 h-1 bg-[#130d22] rounded-full"></div>
                          </div>
                        </motion.div>
                      );
                    }

                    if (layerId === 'mushrooms') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[104px] h-[6px] relative -mt-1 flex justify-center gap-2"
                          style={transformStyle}
                        >
                          <div className="w-6 h-2.5 bg-stone-500 rounded-t-full border border-stone-700 shadow relative">
                            <div className="absolute bottom-0 left-2 w-1.5 h-1.5 bg-stone-600"></div>
                          </div>
                          <div className="w-6 h-2.5 bg-stone-500 rounded-t-full border border-stone-700 shadow relative">
                            <div className="absolute bottom-0 left-2 w-1.5 h-1.5 bg-stone-600"></div>
                          </div>
                        </motion.div>
                      );
                    }

                    if (layerId === 'sauce_ketchup') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[104px] h-[4px] relative -mt-0.5"
                          style={transformStyle}
                        >
                          <svg className="w-full h-full" viewBox="0 0 100 8" fill="none">
                            <path d="M5 4 Q 15 0, 25 4 T 45 4 T 65 4 T 85 4 T 95 4" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      );
                    }

                    if (layerId === 'sauce_mustard') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[104px] h-[4px] relative -mt-0.5"
                          style={transformStyle}
                        >
                          <svg className="w-full h-full" viewBox="0 0 100 8" fill="none">
                            <path d="M5 4 Q 15 0, 25 4 T 45 4 T 65 4 T 85 4 T 95 4" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      );
                    }

                    if (layerId === 'sauce_mayo') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[104px] h-[4px] relative -mt-0.5"
                          style={transformStyle}
                        >
                          <svg className="w-full h-full" viewBox="0 0 100 8" fill="none">
                            <path d="M5 4 Q 15 0, 25 4 T 45 4 T 65 4 T 85 4 T 95 4" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      );
                    }

                    if (layerId === 'sauce_bbq') {
                      return (
                        <motion.div
                          key={layer.uid}
                          initial={{ opacity: 0, y: -80 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-[104px] h-[4px] relative -mt-0.5"
                          style={transformStyle}
                        >
                          <svg className="w-full h-full" viewBox="0 0 100 8" fill="none">
                            <path d="M5 4 Q 15 0, 25 4 T 45 4 T 65 4 T 85 4 T 95 4" stroke="#451a03" strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                        </motion.div>
                      );
                    }

                    // Default render for any other layer
                    const ing = BURGER_INGREDIENTS[layerId];
                    return (
                      <motion.div
                        key={layer.uid}
                        className="w-24 h-4 bg-slate-800 border border-slate-700 rounded-full text-[8px] flex items-center justify-center text-slate-300 -mt-0.5"
                        style={transformStyle}
                      >
                        {ing?.icon || '🥗'} {ing?.name || layerId}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom wrap action trigger */}
          {hasBottomBun && hasTopBun && hasProtein ? (
            <div className="pt-1 border-t border-slate-900 shrink-0">
              <button
                onClick={handleWrapClick}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-95 text-white font-sans font-black text-xs tracking-widest rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                WRAP BURGER &amp; MOVE TO TRAY 🛎
              </button>
            </div>
          ) : (
            activeStack.length > 0 && (
              <div className="pt-1 border-t border-slate-900 flex items-center justify-center gap-1.5 text-slate-500 text-[8px] font-bold uppercase shrink-0">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Need Bottom Bun, Top Bun, and a Patty (Beef or Chicken) to wrap!</span>
              </div>
            )
          )}
        </div>

        {/* BOTTOM: Cabinet Ingredient Boxes */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
            
            {/* 1. Buns & Proteins row */}
            <div>
              <p className="font-sans font-black text-[7.5px] text-slate-400 uppercase tracking-widest mb-1 leading-none">Buns &amp; Proteins</p>
              <div className="grid grid-cols-3 gap-1.5">
                {['bun_bottom', 'bun_top', 'grilled_chicken'].map((id) => {
                  const ing = BURGER_INGREDIENTS[id];
                  if (!ing) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handleAddIngredient(id)}
                      className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg flex items-center gap-1 text-left transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      <span className="text-xs shrink-0">{ing.icon}</span>
                      <span className="font-sans font-bold text-[8px] text-slate-300 truncate leading-tight">{ing.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sauces row */}
            <div>
              <p className="font-sans font-black text-[7.5px] text-slate-400 uppercase tracking-widest mb-1 leading-none">Glossy Sauces</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['sauce_ketchup', 'sauce_mustard', 'sauce_mayo', 'sauce_bbq'].map((id) => {
                  const ing = BURGER_INGREDIENTS[id];
                  if (!ing) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handleAddIngredient(id)}
                      className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg flex items-center gap-1 text-left transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      <span className="text-xs shrink-0">{ing.icon}</span>
                      <span className="font-sans font-bold text-[8px] text-slate-300 truncate leading-tight">{ing.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Toppings row */}
            <div>
              <p className="font-sans font-black text-[7.5px] text-slate-400 uppercase tracking-widest mb-1 leading-none">Deli Toppings</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['cheese', 'lettuce', 'tomato', 'pickle', 'onion', 'bacon', 'jalapenos', 'mushrooms'].map((id) => {
                  const ing = BURGER_INGREDIENTS[id];
                  if (!ing) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handleAddIngredient(id)}
                      className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg flex items-center gap-1 text-left transition-all hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      <span className="text-xs shrink-0">{ing.icon}</span>
                      <span className="font-sans font-bold text-[8px] text-slate-300 truncate leading-tight">{ing.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Cooked Patty Tray */}
            <div>
              <p className="font-sans font-black text-[7.5px] text-slate-400 uppercase tracking-widest mb-1 leading-none">Cooked Beef Patties Tray</p>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {finishedPatties.length === 0 ? (
                  <div className="w-full border border-dashed border-slate-900 rounded-xl py-1.5 px-3 text-center opacity-40">
                    <p className="font-sans text-[7.5px] text-slate-500">No cooked patties available. Go to Grills to sear meat!</p>
                  </div>
                ) : (
                  finishedPatties.map((p) => {
                    const isSelected = selectedPattyId === p.id;
                    const hasPattyOnPlate = activeStack.some(l => l.id === 'patty');
                    return (
                      <button
                        key={p.id}
                        disabled={hasPattyOnPlate && !isSelected}
                        onClick={() => handleAddCookedPatty(p)}
                        className={`flex-shrink-0 px-2 py-0.5 border rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 scale-102 font-black'
                            : hasPattyOnPlate
                              ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px]">{p.isBurnt ? '🪨' : '🥩'}</span>
                        <div className="text-left">
                          <p className="font-sans font-black text-[7.5px] leading-none">🥩 Patty ({p.targetDoneness})</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
