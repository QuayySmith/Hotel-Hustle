/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { CustomerOrder, Upgrade } from '../types';
import { playSound } from '../lib/audio';

interface PackagingStationProps {
  orders: CustomerOrder[];
  completedTray: string[];
  packedItems: string[];
  isBagSealed: boolean;
  onPackItem: (itemType: string) => void;
  onUnpackItem: (itemType: string) => void;
  onSealBag: (stickerName: string) => void;
  onResetBag: () => void;
  upgrades: Upgrade[];
  activeStation: string;
}

export default function PackagingStation({
  orders,
  completedTray,
  packedItems,
  isBagSealed,
  onPackItem,
  onUnpackItem,
  onSealBag,
  onResetBag,
  upgrades,
  activeStation,
}: PackagingStationProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState('Quazzy Classic 🐷');

  const activeTicket = orders.find((o) => o.id === selectedTicketId);

  useEffect(() => {
    if (orders.length > 0 && !selectedTicketId) {
      setSelectedTicketId(orders[0].id);
    }
  }, [orders]);

  const handleStickerClick = (sticker: string) => {
    playSound('click');
    setSelectedSticker(sticker);
  };

  const handlePack = (item: string) => {
    playSound('sweep');
    onPackItem(item);
  };

  const handleUnpack = (item: string) => {
    playSound('click');
    onUnpackItem(item);
  };

  const handleSeal = () => {
    if (packedItems.length === 0) {
      playSound('fail');
      return;
    }
    playSound('chime');
    onSealBag(selectedSticker);
  };

  // Helper to translate item code to descriptive label & emoji
  const getItemDetails = (item: string) => {
    if (item === 'burger') return { emoji: '🍔', label: 'Wrapped Burger' };
    if (item === 'fries') return { emoji: '🍟', label: 'Golden Fries' };
    if (item === 'pizza') return { emoji: '🍕', label: 'Boxed Pizza' };
    if (item === 'milkshake') return { emoji: '🥤', label: 'Creamy Milkshake' };
    if (item === 'drink') return { emoji: '🥤', label: 'Fountain Soda' };
    return { emoji: '📦', label: 'Foodaria Dish' };
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-emerald-600/10 via-slate-900 to-emerald-950/20 font-sans p-3">
      <div className="flex-1 flex flex-col gap-2.5 justify-between">
        
        {/* TOP: Checklist Ticket display */}
        <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-2.5 shadow-md shrink-0">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1 mb-1.5">
            <span className="font-sans font-black text-[10px] text-slate-300 uppercase tracking-widest">Takeout Order Checklist</span>
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
                  <p className="font-mono text-[7px] text-slate-500 uppercase mt-0.5">TICKET #{activeTicket.id.slice(-4)}</p>
                </div>
              </div>

              {/* Requirement checkboxes */}
              <div className="flex gap-2">
                {activeTicket.burger && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border ${
                    packedItems.includes('burger') ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    🍔 Burger {packedItems.includes('burger') && '✓'}
                  </span>
                )}
                {activeTicket.fries && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border ${
                    packedItems.includes('fries') ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    🍟 Fries {packedItems.includes('fries') && '✓'}
                  </span>
                )}
                {activeTicket.pizza && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border ${
                    packedItems.includes('pizza') ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    🍕 Pizza {packedItems.includes('pizza') && '✓'}
                  </span>
                )}
                {activeTicket.milkshake && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border ${
                    packedItems.includes('milkshake') ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    🥤 Shake {packedItems.includes('milkshake') && '✓'}
                  </span>
                )}
                {activeTicket.drink && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border ${
                    packedItems.includes('drink') ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}>
                    🥤 Soda {packedItems.includes('drink') && '✓'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 italic py-1 pl-1">No active customer orders currently.</p>
          )}
        </div>

        {/* MIDDLE: Dual Shelf (Tray vs Paper Bag) */}
        <div className="flex-1 bg-slate-950/50 border border-slate-850 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              📦 Sealing Counter
            </span>
            <button
              onClick={() => { playSound('sweep'); onResetBag(); }}
              className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg font-sans text-[8px] font-bold transition-all uppercase cursor-pointer"
            >
              Empty Bag
            </button>
          </div>

          {/* Table layout split */}
          <div className="flex-1 flex gap-3.5 items-stretch min-h-0">
            
            {/* LEFT BOARD: Finished Tray Shelf (Click to slide into bag) */}
            <div className="w-1/2 bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="font-mono text-[6.5px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-950 pb-1 text-center">
                Completed Items Tray
              </span>

              <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1 scrollbar-thin">
                {completedTray.map((item, idx) => {
                  const details = getItemDetails(item);
                  return (
                    <button
                      key={idx}
                      disabled={isBagSealed}
                      onClick={() => handlePack(item)}
                      className="w-full p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between transition-transform active:scale-98 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{details.emoji}</span>
                        <span className="font-sans font-bold text-[8.5px] text-slate-300">{details.label}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-emerald-400" />
                    </button>
                  );
                })}
                {completedTray.length === 0 && (
                  <p className="text-[7.5px] text-slate-500 italic text-center py-6 leading-normal">
                    Tray empty. Prepare burgers, fries, or pizzas at their respective cook stations!
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT BOARD: Takeout bag with Mascot Stamps */}
            <div className="w-1/2 bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between items-center relative">
              <span className="font-mono text-[6.5px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-950 pb-1 w-full text-center">
                Takeout Paper Sack
              </span>

              {/* Takeout Bag visualization */}
              <div className="flex-1 flex items-center justify-center py-2 relative">
                <AnimatePresence mode="wait">
                  {isBagSealed ? (
                    <motion.div 
                      key="sealed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-24 bg-gradient-to-b from-amber-750 to-amber-800 border-2 border-amber-900 rounded-xl relative flex flex-col justify-between items-center p-2 shadow-xl"
                    >
                      {/* Paper folded top seam */}
                      <div className="absolute top-0 inset-x-0 h-4 bg-amber-900 border-b border-amber-950 rounded-t-lg flex items-center justify-center">
                        <span className="text-[7px] text-amber-200/50 font-black">FOLDED SHUT</span>
                      </div>

                      {/* Mascot Stamp */}
                      <div className="my-auto w-10 h-10 bg-white border-2 border-rose-500 rounded-full flex items-center justify-center text-[11px] shadow rotate-6">
                        <span className="font-sans font-black text-rose-600 text-[6px] text-center leading-none uppercase">
                          {selectedSticker.split(' ')[0]}
                        </span>
                      </div>

                      <span className="font-sans font-black text-[6.5px] text-slate-200 uppercase bg-emerald-950/80 px-1 py-0.5 rounded">
                        SEALED READY ✓
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="open"
                      className="w-20 h-24 bg-gradient-to-b from-amber-600 to-amber-700 border border-amber-800 rounded-b-xl rounded-t-sm relative flex flex-col justify-between items-center p-1.5 shadow"
                    >
                      {/* Open top opening */}
                      <div className="absolute -top-1 inset-x-0 h-2 bg-amber-500 border-y border-amber-600 skew-y-3"></div>

                      <div className="flex-1 flex flex-wrap gap-1 items-center justify-center mt-2.5 max-h-12 overflow-hidden">
                        {packedItems.map((item, idx) => (
                          <span 
                            key={idx} 
                            onClick={() => handleUnpack(item)}
                            className="text-xs cursor-pointer hover:scale-110 transition-transform" 
                            title="Click to unpack"
                          >
                            {getItemDetails(item).emoji}
                          </span>
                        ))}
                        {packedItems.length === 0 && (
                          <span className="text-[8px] text-amber-900 font-bold uppercase tracking-widest text-center animate-pulse">Empty Bag</span>
                        )}
                      </div>

                      <span className="font-mono text-[6.5px] text-amber-200 font-bold uppercase">
                        {packedItems.length} items packed
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Seal Stamp triggers */}
              {!isBagSealed && (
                <div className="w-full shrink-0">
                  <button
                    disabled={packedItems.length === 0}
                    onClick={handleSeal}
                    className="w-full py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[8px] font-black rounded uppercase tracking-wider transition-all disabled:opacity-40 shadow animate-pulse"
                  >
                    🔐 Apply Mascot Seal
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* BOTTOM: Mascot Seal Stickers Drawer */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-2 shadow-md shrink-0">
          <p className="font-sans font-black text-[7.5px] text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Choose mascot seal sticker</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              'Quazzy Classic 🐷',
              'Quazzy Duck 🦆',
              'Quazzy Penguin 🐧'
            ].map((sticker) => {
              const isSelected = selectedSticker === sticker;
              return (
                <button
                  key={sticker}
                  disabled={isBagSealed}
                  onClick={() => handleStickerClick(sticker)}
                  className={`p-1 border rounded-lg text-[8px] font-black transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500 text-slate-950 border-rose-400'
                      : 'bg-slate-900 border-slate-850 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  {sticker}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
