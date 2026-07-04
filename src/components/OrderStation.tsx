/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, DollarSign, Clock, Volume2, VolumeX, Music } from 'lucide-react';
import { CustomerOrder } from '../types';
import { playSound } from '../lib/audio';

interface OrderStationProps {
  money: number;
  level: number;
  xp: number;
  orders: CustomerOrder[];
  onTakeOrder: (customerIndex: number) => void;
  waitingCustomers: {
    name: string;
    emoji: string;
    color: string;
    patience: number;
    favoriteBurgerName: string;
  }[];
  soundOn: boolean;
  musicOn: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function OrderStation({
  money,
  level,
  xp,
  orders,
  onTakeOrder,
  waitingCustomers,
  soundOn,
  musicOn,
  onToggleSound,
  onToggleMusic,
}: OrderStationProps) {
  const [selectedCustomerIdx, setSelectedCustomerIdx] = useState<number | null>(null);
  const [bellRings, setBellRings] = useState(0);

  // Auto-select front customer if none selected and customers are waiting
  useEffect(() => {
    if (waitingCustomers.length > 0 && selectedCustomerIdx === null) {
      setSelectedCustomerIdx(0);
    }
  }, [waitingCustomers, selectedCustomerIdx]);

  const handleCustomerClick = (index: number) => {
    playSound('click');
    setSelectedCustomerIdx(index);
  };

  const handleTakeOrderClick = (index: number) => {
    playSound('chime');
    onTakeOrder(index);
    setSelectedCustomerIdx(null);
  };

  const ringBell = () => {
    playSound('ding');
    setBellRings((prev) => prev + 1);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#120a22] font-sans p-3 select-none">
      
      {/* 1. Header Row */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-red-600 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
            🍔
          </div>
          <div>
            <h1 className="font-sans font-black text-xs md:text-sm tracking-tight text-white leading-none">
              QUAZZYS LOBBY &amp; DINING
            </h1>
            <p className="font-mono text-[7.5px] text-amber-400 tracking-wider uppercase mt-0.5">Counter 1 • Cash Register &amp; Dine-In Area</p>
          </div>
        </div>

        {/* Progression Stats */}
        <div className="flex items-center gap-3">
          {/* XP Bar */}
          <div className="hidden sm:flex flex-col text-right w-24">
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
              <span>LVL {level}</span>
              <span>{xp % 100}/100 XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full mt-0.5 overflow-hidden border border-slate-850">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${xp % 100}%` }}></div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] font-black text-white">${money.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => { playSound('click'); onToggleSound(); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${soundOn ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
              title="Toggle Sounds"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => { playSound('click'); onToggleMusic(); }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${musicOn ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
              title="Toggle Music"
            >
              <Music className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace split */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 overflow-hidden my-2.5 min-h-0">
        
        {/* LEFT PANEL: Active Tickets scrollable list */}
        <div className="w-full md:w-64 bg-slate-950/85 border border-slate-850 rounded-2xl p-2.5 flex flex-col shrink-0 overflow-hidden shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <Clipboard className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-sans font-black text-[10px] text-slate-200 uppercase tracking-wider">Kitchen Queue ({orders.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            <AnimatePresence>
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-8">
                  <span className="text-3xl mb-1.5">📋</span>
                  <p className="font-sans text-[10px] text-slate-500 font-bold">No active orders.</p>
                  <p className="font-sans text-[9px] text-slate-600 mt-0.5">Greet a waiting customer to take their ticket!</p>
                </div>
              ) : (
                orders.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2 bg-white border-l-4 border-l-yellow-500 border border-slate-200 rounded-r-xl flex flex-col gap-1 shadow-md relative"
                  >
                    {/* Retro ticket design holes */}
                    <div className="absolute -left-1 top-2 w-1.5 h-2 bg-slate-950 rounded-full"></div>
                    <div className="absolute -right-1 top-2 w-1.5 h-2 bg-slate-950 rounded-full"></div>

                    {/* Customer Info row */}
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{ticket.avatarEmoji}</span>
                        <span className="font-sans font-black text-slate-800 text-[9.5px] truncate max-w-[90px]">{ticket.customerName}</span>
                      </div>
                      <span className="font-mono text-[7.5px] font-bold text-slate-500">
                        Patience: {Math.round(ticket.patience)}%
                      </span>
                    </div>

                    {/* Order summary badges */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {ticket.burger && (
                        <span className="px-1 py-0.5 bg-amber-100 border border-amber-200 rounded text-[7.5px] font-black text-amber-800 flex items-center gap-0.5">
                          🍔 Burger ({ticket.burger.doneness})
                        </span>
                      )}
                      {ticket.fries && (
                        <span className="px-1 py-0.5 bg-red-100 border border-red-200 rounded text-[7.5px] font-black text-red-800 flex items-center gap-0.5">
                          🍟 Fries
                        </span>
                      )}
                      {ticket.pizza && (
                        <span className="px-1 py-0.5 bg-orange-100 border border-orange-200 rounded text-[7.5px] font-black text-orange-800 flex items-center gap-0.5">
                          🍕 Pizza
                        </span>
                      )}
                      {ticket.milkshake && (
                        <span className="px-1 py-0.5 bg-pink-100 border border-pink-200 rounded text-[7.5px] font-black text-pink-800 flex items-center gap-0.5">
                          🥤 Shake ({ticket.milkshake.flavor})
                        </span>
                      )}
                      {ticket.drink && (
                        <span className="px-1 py-0.5 bg-cyan-100 border border-cyan-200 rounded text-[7.5px] font-black text-cyan-800 flex items-center gap-0.5">
                          🥤 Soda ({ticket.drink.flavor})
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: IMMERSIVE 2D FAST FOOD LOBBY */}
        <div className="flex-1 bg-[#160f2e] border border-slate-850 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-2xl">
          
          {/* A. RETRO CHECKERBOARD TILE FLOOR BACKGROUND (DENSE MATRIX FOR DEPTH) */}
          <div className="absolute inset-0 opacity-15 pointer-events-none select-none"
               style={{
                 backgroundImage: `radial-gradient(circle, #eab308 1px, transparent 1px), linear-gradient(45deg, #f43f5e 12%, transparent 12%), linear-gradient(-45deg, #f43f5e 12%, transparent 12%)`,
                 backgroundSize: '16px 16px, 32px 32px, 32px 32px',
                 backgroundColor: '#120a22'
               }}
          />

          {/* B. HANGING RETRO MEAL MENU BOARDS (TOP WALL) */}
          <div className="w-full bg-[#0a0517] border-b-2 border-amber-500/30 p-2 flex justify-around gap-1 md:gap-3 shrink-0 relative z-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {/* Board 1: Burgers */}
            <div className="flex-1 bg-slate-950/80 border border-amber-500/20 rounded-lg p-1.5 text-center flex flex-col justify-between max-w-[100px]">
              <div className="text-[14px]">🍔</div>
              <p className="font-sans font-black text-[7.5px] text-yellow-300 uppercase leading-none mt-1">BURGERS</p>
              <span className="font-mono text-[7px] text-rose-400 font-extrabold mt-0.5">$4.99</span>
            </div>
            {/* Board 2: Fries */}
            <div className="flex-1 bg-slate-950/80 border border-amber-500/20 rounded-lg p-1.5 text-center flex flex-col justify-between max-w-[100px]">
              <div className="text-[14px]">🍟</div>
              <p className="font-sans font-black text-[7.5px] text-yellow-300 uppercase leading-none mt-1">FRIES</p>
              <span className="font-mono text-[7px] text-rose-400 font-extrabold mt-0.5">$2.49</span>
            </div>
            {/* Board 3: Pizza */}
            <div className="flex-1 bg-slate-950/80 border border-amber-500/20 rounded-lg p-1.5 text-center flex flex-col justify-between max-w-[100px]">
              <div className="text-[14px]">🍕</div>
              <p className="font-sans font-black text-[7.5px] text-yellow-300 uppercase leading-none mt-1">PIZZAS</p>
              <span className="font-mono text-[7px] text-rose-400 font-extrabold mt-0.5">$8.99</span>
            </div>
            {/* Board 4: Milkshakes */}
            <div className="flex-1 bg-slate-950/80 border border-amber-500/20 rounded-lg p-1.5 text-center flex flex-col justify-between max-w-[100px]">
              <div className="text-[14px]">🥤</div>
              <p className="font-sans font-black text-[7.5px] text-yellow-300 uppercase leading-none mt-1">SHAKES</p>
              <span className="font-mono text-[7px] text-rose-400 font-extrabold mt-0.5">$3.49</span>
            </div>
            {/* Neon Diner Signboard on center wall */}
            <div className="absolute -bottom-4 right-4 bg-red-600 border border-yellow-300 px-2 py-0.5 rounded-full shadow-lg z-20 hidden md:block">
              <span className="font-sans font-black text-[7px] text-yellow-200 tracking-wider animate-pulse uppercase">HOT &amp; FRESH NOW! 🔥</span>
            </div>
          </div>

          {/* C. DINING SEATING AREA WITH HAPPY DINERS (BACKGROUND VIEW) */}
          <div className="flex-1 p-2 md:p-3 flex flex-col justify-start gap-3.5 relative z-10 overflow-y-auto scrollbar-none pb-20">
            
            {/* Seating header */}
            <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-purple-950/40">
              <span className="text-xs">🪑</span>
              <h4 className="font-sans font-black text-[8.5px] text-slate-400 uppercase tracking-widest">Lobby Dining Booths Seating</h4>
            </div>

            {/* Booths Grid */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {/* Booth A: Leo the Lion */}
              <div className="bg-[#1f163f]/90 border border-purple-900/50 rounded-xl p-2 relative flex flex-col items-center justify-between text-center min-h-[85px] shadow-md">
                <div className="absolute top-1 right-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[6px] font-mono font-bold px-1 rounded uppercase">EATING</div>
                {/* Visual table wood pattern */}
                <div className="absolute bottom-2 inset-x-2 h-4 bg-amber-900/60 rounded border-t border-amber-850 flex items-center justify-around px-2">
                  <span className="text-[9px]">🍔</span>
                  <span className="text-[9px]">🍟</span>
                </div>
                {/* Diner Character */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl animate-bounce" style={{ animationDuration: '3s' }}>🦁</span>
                  <span className="font-sans font-black text-[7.5px] text-slate-300 mt-1">Leo R.</span>
                </div>
                {/* Happy dialogue tag */}
                <div className="absolute -top-1.5 -left-1 bg-yellow-500 text-slate-950 font-sans text-[6.5px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase">
                  "Sizzly!"
                </div>
              </div>

              {/* Booth B: Panda */}
              <div className="bg-[#1f163f]/90 border border-purple-900/50 rounded-xl p-2 relative flex flex-col items-center justify-between text-center min-h-[85px] shadow-md">
                <div className="absolute top-1 right-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[6px] font-mono font-bold px-1 rounded uppercase">EATING</div>
                {/* Table */}
                <div className="absolute bottom-2 inset-x-2 h-4 bg-amber-900/60 rounded border-t border-amber-850 flex items-center justify-center">
                  <span className="text-[10px]">🍕</span>
                </div>
                {/* Diner */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl animate-bounce" style={{ animationDuration: '4s' }}>🐼</span>
                  <span className="font-sans font-black text-[7.5px] text-slate-300 mt-1">Bamboo</span>
                </div>
                {/* Dialogue */}
                <div className="absolute -top-1.5 -left-1 bg-yellow-500 text-slate-950 font-sans text-[6.5px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase">
                  "Mamma Mia!"
                </div>
              </div>

              {/* Booth C: Fox */}
              <div className="bg-[#1f163f]/90 border border-purple-900/50 rounded-xl p-2 relative flex flex-col items-center justify-between text-center min-h-[85px] shadow-md">
                <div className="absolute top-1 right-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[6px] font-mono font-bold px-1 rounded uppercase">CHILLING</div>
                {/* Table */}
                <div className="absolute bottom-2 inset-x-2 h-4 bg-amber-900/60 rounded border-t border-amber-850 flex items-center justify-center">
                  <span className="text-[9px]">🥤</span>
                </div>
                {/* Diner */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl animate-bounce" style={{ animationDuration: '3.5s' }}>🦊</span>
                  <span className="font-sans font-black text-[7.5px] text-slate-300 mt-1">Foxy</span>
                </div>
                {/* Dialogue */}
                <div className="absolute -top-1.5 -left-1 bg-yellow-500 text-slate-950 font-sans text-[6.5px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase">
                  "Strawberries!"
                </div>
              </div>
            </div>

            {/* D. VELVET ROPE QUEUING AREA FOR WAITING LINE */}
            <div className="flex flex-col gap-1 mt-1.5 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-xs">🎗️</span>
                <span className="font-sans font-black text-[8.5px] text-slate-400 uppercase tracking-widest">Register Waiting Queue Lane</span>
              </div>
              
              {/* Illustrated Queue Stanchions Ropes */}
              <div className="relative border-t-2 border-dashed border-red-500/40 py-2.5 flex justify-start items-center min-h-[90px] px-2 bg-slate-950/20 rounded-xl">
                {/* Golden Pole 1 */}
                <div className="absolute left-1 bottom-1 w-2.5 h-7 bg-amber-500 rounded-t-md border-b-4 border-amber-700 flex items-center justify-center shadow">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                </div>
                {/* Golden Pole 2 */}
                <div className="absolute right-12 bottom-1 w-2.5 h-7 bg-amber-500 rounded-t-md border-b-4 border-amber-700 flex items-center justify-center shadow">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                </div>

                <AnimatePresence>
                  {waitingCustomers.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-center py-2 select-none">
                      <span className="text-xl mb-1">🛎️</span>
                      <p className="font-sans font-black text-[9px] text-amber-500 tracking-wider uppercase">Line is empty</p>
                      <p className="font-sans text-[7.5px] text-slate-500">New fast-food lovers are coming in short seconds!</p>
                    </div>
                  ) : (
                    <div className="flex gap-11 items-center justify-start flex-wrap pl-5 pr-14 w-full">
                      {waitingCustomers.map((customer, index) => {
                        const isFront = index === 0;
                        const isSelected = selectedCustomerIdx === index;

                        return (
                          <motion.div
                            key={customer.name}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: isSelected ? 1.05 : 0.95,
                              y: isSelected ? -2 : 0,
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => handleCustomerClick(index)}
                            className={`flex flex-col items-center cursor-pointer select-none group relative transition-transform ${isSelected ? 'scale-105' : ''}`}
                          >
                            {/* Interactive Speech Bubble overlays above character */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-950 border border-amber-500 rounded-xl p-2 w-44 text-center shadow-2xl z-40"
                              >
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 border-r border-b border-amber-500 rotate-45"></div>

                                <span className="font-sans font-black text-white text-[9.5px] block leading-none truncate">{customer.name}</span>
                                <span className="font-mono text-[7px] text-amber-400 font-extrabold block mt-0.5 uppercase tracking-wide">Ready to Order!</span>
                                
                                {/* Patience slider */}
                                <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${
                                      customer.patience > 50 ? 'bg-emerald-500' : customer.patience > 25 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                                    }`}
                                    style={{ width: `${customer.patience}%` }}
                                  ></div>
                                </div>

                                {isFront ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTakeOrderClick(index);
                                    }}
                                    className="mt-1.5 w-full py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[8.5px] font-black tracking-wider rounded transition-transform active:scale-95 cursor-pointer uppercase shadow"
                                  >
                                    📋 Take Order
                                  </button>
                                ) : (
                                  <p className="font-sans text-[7px] text-slate-400 mt-1 leading-none">Standing in lobby line...</p>
                                )}
                              </motion.div>
                            )}

                            {/* Take order visual indicators */}
                            {isFront && !isSelected && (
                              <div className="absolute -top-7 bg-red-600 border border-yellow-300 rounded px-1.5 py-0.5 flex items-center gap-0.5 shadow animate-bounce z-20">
                                <span className="w-1 h-1 rounded-full bg-yellow-300 animate-ping"></span>
                                <span className="font-sans text-[6.5px] text-white font-black uppercase">🛎️ WELCOME!</span>
                              </div>
                            )}

                            {/* Character Avatar Representation */}
                            <div className="relative">
                              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${customer.color} border-2 border-slate-950 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform`}>
                                {customer.emoji}
                              </div>
                              <div className="w-8 h-1 bg-black/40 rounded-full blur-[1px] mx-auto mt-0.5"></div>
                            </div>

                            <span className="font-sans text-[7.5px] font-black text-slate-300 mt-1 bg-slate-900 px-1 py-0.5 border border-purple-950 rounded">
                              {customer.name}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* E. SOLID PHYSICAL SERVICE COUNTER (FOREGROUND AREA) */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-[#7c2d12] to-[#451a03] border-t-4 border-slate-950 z-30 flex items-center justify-between px-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] shrink-0">
            {/* Visual mustard/ketchup bottles & straws decor (Left counter edge) */}
            <div className="flex gap-2 items-center">
              {/* Mustard bottle */}
              <div className="w-3 h-7 bg-yellow-500 border border-yellow-700 rounded-t-full rounded-b-md relative flex items-center justify-center" title="Mustard Squeeze">
                <div className="absolute -top-1 w-1 h-1.5 bg-yellow-300 rounded"></div>
                <span className="text-[5px] font-black text-slate-900 leading-none">M</span>
              </div>
              {/* Ketchup bottle */}
              <div className="w-3 h-7 bg-red-600 border border-red-800 rounded-t-full rounded-b-md relative flex items-center justify-center" title="Ketchup Squeeze">
                <div className="absolute -top-1 w-1 h-1.5 bg-red-300 rounded"></div>
                <span className="text-[5px] font-black text-white leading-none">K</span>
              </div>
              {/* Cup of Straws */}
              <div className="w-4.5 h-6 bg-slate-100/10 border border-slate-700 rounded-b-md p-0.5 flex justify-around">
                <div className="w-0.5 h-5 bg-red-500 rounded-full -translate-y-1"></div>
                <div className="w-0.5 h-5 bg-yellow-500 rounded-full -translate-y-1"></div>
                <div className="w-0.5 h-5 bg-blue-500 rounded-full -translate-y-1"></div>
              </div>
            </div>

            {/* Interactive service bell & cashier layout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[7.5px] font-mono text-amber-400 font-extrabold uppercase">ORDER BELL</p>
                <p className="text-[6.5px] text-slate-400 italic">Click to welcome guests</p>
              </div>

              {/* Service Copper Bell */}
              <motion.button
                key={bellRings}
                onClick={ringBell}
                whileTap={{ scale: 0.85, rotate: -8 }}
                className="w-10 h-10 bg-gradient-to-tr from-yellow-600 to-amber-400 border-2 border-amber-950 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-xl hover:brightness-110 cursor-pointer active:scale-95 transition-all relative"
                title="Ring Counter Bell"
              >
                🛎️
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 font-sans text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                  !
                </div>
              </motion.button>
            </div>

            {/* Cash register decor (Right counter edge) */}
            <div className="flex items-center gap-1.5">
              {/* Wooden plate with napkins stack */}
              <div className="w-6 h-1 bg-amber-800/80 rounded-full border-t border-amber-950/40 relative flex justify-center">
                <div className="absolute bottom-1 w-4 h-2 bg-white rounded-t border-b border-slate-300 shadow"></div>
              </div>

              {/* Cash Register Machine */}
              <div className="w-11 h-9 bg-slate-800 border border-slate-950 rounded-lg p-1 relative flex flex-col justify-between shadow-md">
                {/* Green pixelated register screen */}
                <div className="w-full h-3.5 bg-[#14532d] border border-slate-950 rounded px-1 flex items-center justify-center font-mono text-[5.5px] text-green-400 font-black tracking-tighter leading-none uppercase">
                  {waitingCustomers.length > 0 ? `TICKET #1` : 'READY'}
                </div>
                {/* Numeric buttons keypad representation */}
                <div className="grid grid-cols-3 gap-0.5 mt-1 opacity-80">
                  <div className="h-0.5 bg-slate-900 rounded-[1px]"></div>
                  <div className="h-0.5 bg-slate-900 rounded-[1px]"></div>
                  <div className="h-0.5 bg-red-600 rounded-[1px]"></div>
                  <div className="h-0.5 bg-slate-900 rounded-[1px]"></div>
                  <div className="h-0.5 bg-slate-900 rounded-[1px]"></div>
                  <div className="h-0.5 bg-emerald-500 rounded-[1px]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
