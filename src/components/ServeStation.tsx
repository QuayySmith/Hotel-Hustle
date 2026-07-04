/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, DollarSign, Clock, Users } from 'lucide-react';
import { CustomerOrder, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface ServeStationProps {
  money: number;
  orders: CustomerOrder[];
  isBagSealed: boolean;
  packedItems: string[];
  onServeBag: (
    orderId: string, 
    stars: number, 
    tip: number,
    reviewText: string
  ) => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function ServeStation({
  money,
  orders,
  isBagSealed,
  packedItems,
  onServeBag,
  upgrades,
  activeStation,
}: ServeStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeReview, setActiveReview] = useState<{
    stars: number;
    tip: number;
    text: string;
    customerName: string;
    customerEmoji: string;
  } | null>(null);

  const [collectedTip, setCollectedTip] = useState(false);

  const activeTicket = orders.find((o) => o.id === selectedTicketId);

  useEffect(() => {
    if (orders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(orders[0].id);
    }
  }, [orders]);

  const calculateReviewRating = (ticket: CustomerOrder): { stars: number; tip: number; text: string } => {
    let score = 100;
    let comments: string[] = [];

    // 1. Check packed items matches checklist
    const needsBurger = !!ticket.burger;
    const needsFries = !!ticket.fries;
    const needsPizza = !!ticket.pizza;
    const needsShake = !!ticket.milkshake;
    const needsDrink = !!ticket.drink;

    const hasBurger = packedItems.includes('burger');
    const hasFries = packedItems.includes('fries');
    const hasPizza = packedItems.includes('pizza');
    const hasShake = packedItems.includes('milkshake');
    const hasDrink = packedItems.includes('drink');

    if (needsBurger !== hasBurger) { score -= 25; comments.push(hasBurger ? 'Unrequested burger' : 'Missing burger!'); }
    if (needsFries !== hasFries) { score -= 20; comments.push(hasFries ? 'Unrequested fries' : 'Missing fries!'); }
    if (needsPizza !== hasPizza) { score -= 20; comments.push(hasPizza ? 'Unrequested pizza' : 'Missing pizza!'); }
    if (needsShake !== hasShake) { score -= 15; comments.push(hasShake ? 'Unrequested shake' : 'Missing milkshake!'); }
    if (needsDrink !== hasDrink) { score -= 15; comments.push(hasDrink ? 'Unrequested drink' : 'Missing fountain drink!'); }

    // 2. Patience penalty
    if (ticket.patience < 20) {
      score -= 15;
      comments.push('Service was painfully slow!');
    } else if (ticket.patience > 70) {
      score += 10;
      comments.push('Blazing fast delivery! ⚡');
    }

    // Bound score
    score = Math.max(10, Math.min(120, score));
    const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
    
    // Tips base
    let tipBase = 2.0 + (stars * 1.5);
    if (ticket.isReviewer) tipBase *= 2.5; // Critics pay massive bonuses!
    
    // Tip multiplier upgrade
    const hasJukebox = upgrades.find((u) => u.id === 'jukebox')?.purchased;
    if (hasJukebox) tipBase *= 1.25;

    let text = 'The service was acceptable.';
    if (stars === 5) text = 'Mouth-watering perfection! Absolute best in town! ⭐';
    else if (stars === 4) text = 'Very yummy and delivered with solid timing.';
    else if (stars === 3) text = 'Okay, but could have used better pacing.';
    else if (stars <= 2) text = 'Disappointing. Several details were completely off or cold.';

    if (comments.length > 0) {
      text += ' (' + comments.join(', ') + ')';
    }

    return { stars, tip: parseFloat(tipBase.toFixed(2)), text };
  };

  const handleServe = () => {
    if (!activeTicket || !isBagSealed) return;

    playSound('coin');
    const rating = calculateReviewRating(activeTicket);
    
    setActiveReview({
      stars: rating.stars,
      tip: rating.tip,
      text: rating.text,
      customerName: activeTicket.customerName,
      customerEmoji: activeTicket.avatarEmoji,
    });
    setCollectedTip(false);
  };

  const handleCollectCoins = () => {
    if (!activeReview || !selectedTicketId) return;

    playSound('coin');
    setCollectedTip(true);

    onServeBag(selectedTicketId, activeReview.stars, activeReview.tip, activeReview.text);

    // Reset review card
    setTimeout(() => {
      setActiveReview(null);
      if (orders.length > 1) {
        const next = orders.find((o) => o.id !== selectedTicketId);
        if (next) setSelectedTicketId(next.id);
      } else {
        setSelectedTicketId(null);
      }
    }, 400);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-emerald-600/10 via-slate-900 to-emerald-950/20 font-sans p-3">
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* TOP: Serving Ticket line */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Active customer window</span>
            <div className="flex gap-1 overflow-x-auto max-w-[180px] scrollbar-none">
              {orders.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { playSound('click'); setSelectedTicketId(t.id); }}
                  className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg border text-[8.5px] font-black transition-all cursor-pointer ${
                    selectedTicketId === t.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                      : 'bg-slate-900 border-slate-850 text-slate-400'
                  }`}
                >
                  {t.avatarEmoji} {t.customerName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {activeTicket ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-sm shrink-0">{activeTicket.avatarEmoji}</span>
                <div>
                  <h4 className="font-sans font-black text-[9.5px] leading-none text-slate-200">{activeTicket.customerName}</h4>
                  <p className="font-mono text-[7px] text-slate-500 uppercase mt-0.5">PATIENCE: {Math.round(activeTicket.patience)}%</p>
                </div>
              </div>

              {/* Items status preview */}
              <div className="text-right text-[8px] font-mono text-slate-400">
                <span>Bag Sealed: {isBagSealed ? '✅ YES' : '❌ NO'}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No customers waiting to be served.</p>
          )}
        </div>

        {/* MIDDLE: Delivery plate counter */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              🛎️ Active Service Ledge
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[7.5px] font-mono text-slate-400 font-bold uppercase">Cash Register Connected</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-auto relative">
            
            <AnimatePresence mode="wait">
              
              {/* REVIEW CARD IF SERVED */}
              {activeReview ? (
                <motion.div 
                  key="review-card"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  className="w-full max-w-xs bg-white border border-slate-300 rounded-2xl p-4 text-slate-900 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
                >
                  {/* Decorative confetti or sparkles */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"></div>

                  <span className="text-3xl mb-1">{activeReview.customerEmoji}</span>
                  <h3 className="font-sans font-black text-xs tracking-wide text-slate-850 leading-none">{activeReview.customerName}</h3>
                  <p className="font-mono text-[7px] text-slate-400 uppercase tracking-widest mt-1">GUEST REVIEW</p>

                  {/* Stars list */}
                  <div className="flex gap-1.5 my-2.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`text-base ${idx < activeReview.stars ? 'text-amber-400' : 'text-slate-200'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="font-sans text-[10px] italic text-slate-600 leading-normal max-w-[200px]">
                    "{activeReview.text}"
                  </p>

                  {/* Coin collect button */}
                  {!collectedTip && (
                    <motion.button
                      onClick={handleCollectCoins}
                      className="mt-3.5 w-full py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:scale-102 active:scale-95 text-slate-950 font-sans text-[10px] font-black tracking-wider rounded-xl uppercase transition-all shadow-md flex items-center justify-center gap-1.5 animate-bounce"
                    >
                      <span>💸 COLLECT TIPS: +${activeReview.tip.toFixed(2)}</span>
                    </motion.button>
                  )}
                </motion.div>
              ) : activeTicket ? (
                
                // MAIN GUEST STANDING WINDOW
                <div key="service-window" className="flex flex-col items-center">
                  
                  {/* Customer visual */}
                  <div className="relative mb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${activeTicket.avatarColor} border-4 border-slate-950 flex items-center justify-center text-4xl shadow-xl relative`}>
                      {activeTicket.avatarEmoji}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-0.5 text-[8.5px] font-black text-white shadow uppercase">
                      {activeTicket.customerName}
                    </div>
                  </div>

                  {/* Delivery ledge plate and bag */}
                  <div className="relative w-56 h-12 bg-slate-200 border-b-4 border-slate-400 rounded-full shadow-lg flex items-center justify-center">
                    {isBagSealed ? (
                      <div 
                        onClick={handleServe}
                        className="w-14 h-16 bg-gradient-to-b from-amber-700 to-amber-800 rounded-lg relative -mt-10 shadow-lg border border-amber-950 cursor-pointer hover:scale-105 transition-transform flex flex-col justify-between items-center p-1"
                      >
                        <span className="text-[6.5px] text-amber-200 font-bold block bg-amber-900 px-1 rounded">SEALED BAG</span>
                        <span className="text-xl">🛍️</span>
                        <span className="text-[6px] font-bold text-emerald-400 animate-pulse">TAP TO SERVE</span>
                      </div>
                    ) : (
                      <div className="text-[8.5px] text-slate-400 uppercase font-black text-center -mt-2">
                        Deliver sealed takeout bag here
                      </div>
                    )}
                  </div>

                  {/* Serve CTA */}
                  {isBagSealed && (
                    <button
                      onClick={handleServe}
                      className="mt-4 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-95 text-white font-sans font-black text-[10px] tracking-widest rounded-xl transition-all uppercase shadow animate-pulse cursor-pointer"
                    >
                      Serve Sealed Bag 🛎️
                    </button>
                  )}

                </div>
              ) : (
                <div key="all-served" className="text-center py-6">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <p className="font-sans font-black text-[11px] text-amber-500 uppercase tracking-widest">All customers served!</p>
                  <p className="font-sans text-[8.5px] text-slate-500 max-w-[180px] leading-normal mx-auto mt-1">
                    Wait for new guests to walk in at the order station, or visit the Upgrades store to spend cash!
                  </p>
                </div>
              )}

            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}
