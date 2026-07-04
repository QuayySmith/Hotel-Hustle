/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Star, Users, ArrowUpRight, ShieldAlert,
  Wrench, Sparkles, ChefHat, ShoppingBag, MessageSquare, 
  Trash2, HelpCircle, User, LogOut, ArrowUp, ArrowDown, Lock
} from 'lucide-react';
import { Guest, Room, Staff, ScreenType, DishId } from '../types';
import { DISHES, GUEST_NAMES, GUEST_EMOJIS } from '../data';

interface HotelViewProps {
  money: number;
  xp: number;
  xpNeeded: number;
  level: number;
  rating: number;
  guests: Guest[];
  rooms: Room[];
  staff: Staff[];
  elevatorFloor: number;
  elevatorStatus: 'working' | 'broken';
  onScreenChange: (screen: ScreenType) => void;
  onAssignRoom: (guestId: string, roomNumber: number) => void;
  onCleanRoom: (roomNumber: number) => void;
  onCollectRent: (guestId: string, roomNumber: number) => void;
  onRepairElevator: () => void;
  onSelectGuestOrder: (guest: Guest) => void;
  onCallElevator: (floor: number) => void;
  onUnlockRoom: (roomNumber: number) => void;
}

export default function HotelView({
  money,
  xp,
  xpNeeded,
  level,
  rating,
  guests,
  rooms,
  staff,
  elevatorFloor,
  elevatorStatus,
  onScreenChange,
  onAssignRoom,
  onCleanRoom,
  onCollectRent,
  onRepairElevator,
  onSelectGuestOrder,
  onCallElevator,
  onUnlockRoom,
}: HotelViewProps) {
  const [selectedLobbyGuest, setSelectedLobbyGuest] = useState<Guest | null>(null);
  const [carOffset, setCarOffset] = useState<number[]>( [0, -150, -300] );

  // Animating cars outside lobby glass window
  useEffect(() => {
    const carTimer = setInterval(() => {
      setCarOffset((prev) => prev.map((x) => (x > 120 ? -100 : x + 1.2)));
    }, 40);
    return () => clearInterval(carTimer);
  }, []);

  const lobbyGuests = guests.filter((g) => g.status === 'lobby_waiting');
  const activeOrdersCount = guests.filter((g) => g.status === 'ordering' || g.status === 'waiting_delivery').length;

  // Render Star Ratings
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* ==================== HUD TOP BAR ==================== */}
      <header className="relative z-20 w-full bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shadow-lg backdrop-blur-md">
        {/* Level & XP */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-600 font-black text-sm text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-400/40">
            {level}
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 text-[8px] font-black px-1 rounded-full border border-slate-900">
              LVL
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5">
              <span>EXP PROGRESS</span>
              <span>{Math.floor(xp)} / {xpNeeded}</span>
            </div>
            <div className="w-40 h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${(xp / xpNeeded) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Financial Counter & Stars */}
        <div className="flex items-center gap-4">
          {/* Money count */}
          <div className="bg-slate-950/95 border border-emerald-500/30 rounded-2xl px-4 py-1.5 flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.08)]">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-mono text-lg font-black text-emerald-400 tracking-tight">
              {money.toLocaleString()}
            </span>
          </div>

          {/* Average Rating stars */}
          <div className="bg-slate-950/95 border border-slate-800 rounded-2xl px-3.5 py-1.5 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-0.5">HUSTLE RATING</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black text-yellow-400">{rating.toFixed(1)}</span>
              {renderStars(rating)}
            </div>
          </div>
        </div>

        {/* Quick Menu shortcuts */}
        <div className="flex gap-2">
          <button 
            onClick={() => onScreenChange('menu')}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-bold transition-all hover:scale-105"
          >
            MAIN MENU
          </button>
        </div>
      </header>

      {/* ==================== MAIN CONTENT & VIEWPORTS ==================== */}
      <main className="relative flex-1 w-full grid grid-cols-12 overflow-hidden bg-slate-900">
        
        {/* LEFT COLUMN: ACTIVE CHECKS, SPAWNED ORDERS & LOBBY PANEL (3 cols) */}
        <section className="col-span-3 bg-slate-950 border-r border-slate-800/95 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Section: Active Order Queue */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-sans text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-pink-400 animate-pulse" />
                ACTIVE KITCHEN ORDERS ({activeOrdersCount})
              </h3>
            </div>

            {guests.filter((g) => g.status === 'ordering' || g.status === 'waiting_delivery').length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-600 font-medium">
                No orders active. Guests are sleeping or waiting check-in.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {guests.filter((g) => g.status === 'ordering' || g.status === 'waiting_delivery').map((g) => {
                  const dish = DISHES[g.orderDishId || 'burger'];
                  return (
                    <div 
                      key={g.id}
                      onClick={() => {
                        if (g.status === 'ordering') {
                          onSelectGuestOrder(g);
                        } else {
                          onScreenChange('delivery');
                        }
                      }}
                      className="group cursor-pointer p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900/60 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-xl border border-slate-700 shadow-md relative group-hover:scale-110 transition-transform">
                          {dish.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{dish.name}</p>
                          <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                            {g.status === 'ordering' ? '⚡ NEEDS COOKING' : '🛎️ READY TO SERVE'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">Room {g.roomNumber}</p>
                        </div>
                      </div>

                      {/* Patience ring */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-mono text-[10px] text-slate-400">{Math.floor(g.patience)}%</span>
                        <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${g.patience > 50 ? 'bg-emerald-500' : g.patience > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                            style={{ width: `${g.patience}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Lobby Check-In Station */}
          <div className="flex-1 flex flex-col gap-2.5">
            <h3 className="font-sans text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              FRONT DESK QUEUE ({lobbyGuests.length})
            </h3>

            {lobbyGuests.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-600 gap-2">
                <span className="text-3xl">🛎️</span>
                <p className="text-xs font-medium leading-normal max-w-[180px]">
                  Lobby empty. Guests check in every few seconds automatically!
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[340px] pr-1">
                {lobbyGuests.map((g) => (
                  <div 
                    key={g.id}
                    onClick={() => setSelectedLobbyGuest(selectedLobbyGuest?.id === g.id ? null : g)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedLobbyGuest?.id === g.id 
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Guest avatar sphere */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${g.avatarColor} flex items-center justify-center text-2xl shadow-lg border border-white/10 shrink-0`}>
                        {g.avatarEmoji}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-100">{g.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">🛎️ PATIENCE: {Math.floor(g.patience)}%</p>
                      </div>
                    </div>
                    
                    <button className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-400 text-slate-400 hover:text-white text-[10px] font-bold">
                      ASSIGN
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: 2D HOTEL INTERIOR ARTWORK STAGE (9 cols) */}
        <section className="col-span-9 relative flex flex-col justify-between overflow-hidden">
          
          {/* Interactive Hotel Cross Section Panel */}
          <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-end p-2 md:p-6 overflow-hidden">
            
            {/* Background Hotel frame with glowing borders */}
            <div className="relative w-full max-w-[850px] aspect-[16/9] bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              
              {/* === FLOOR 3: THE SUITES === */}
              <div className="relative flex-1 border-b-4 border-slate-950 grid grid-cols-12">
                <div className="absolute top-2 left-3 bg-slate-950/80 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide text-indigo-400 z-10">
                  3F: VIP PENTHOUSE SUITES
                </div>

                {/* 3F: VIP Suites Container (Dynamic 2-4 Rooms) */}
                <div className="col-span-10 flex flex-row divide-x-2 divide-slate-950 h-full relative">
                  {rooms.map((room) => {
                    const guest = guests.find((g) => g.roomNumber === room.number);
                    
                    if (room.locked) {
                      return (
                        <div key={room.number} className="flex-1 h-full relative p-2 md:p-4 flex flex-col items-center justify-center bg-slate-950/95 overflow-hidden">
                          {/* Locked Overlay Backdrop */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/10 opacity-75"></div>
                          
                          <div className="relative z-10 flex flex-col items-center text-center p-1">
                            <span className="font-mono text-[8px] md:text-[10px] font-black text-slate-500 tracking-wider mb-0.5">SUITE {room.number}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner mb-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 mb-1.5">LOCKED</span>
                            
                            <button
                              onClick={() => onUnlockRoom(room.number)}
                              disabled={money < (room.unlockCost || 9999)}
                              className={`px-2 py-1 rounded-lg text-[8px] font-black tracking-wider shadow-md transition-all flex items-center gap-0.5 cursor-pointer ${
                                money >= (room.unlockCost || 9999)
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-105 text-slate-950 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-extrabold'
                                  : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                              }`}
                            >
                              <DollarSign className="w-2.5 h-2.5" />
                              BUY FOR ${room.unlockCost}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={room.number} className="flex-1 h-full min-w-0 relative p-2 flex flex-col justify-between overflow-hidden">
                        {/* Backdrop Wall pattern */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-slate-900 to-indigo-950/20 opacity-90"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          {/* Header */}
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] md:text-[10px] font-black text-slate-400 tracking-wider">ROOM {room.number}</span>
                            {/* Room state badge */}
                            {room.status === 'vacant' && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-bold text-[8px]">VACANT</span>
                            )}
                            {room.status === 'occupied' && (
                              <span className="px-1.5 py-0.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-md font-bold text-[8px]">OCCUPIED</span>
                            )}
                            {room.status === 'dirty' && (
                              <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md font-bold text-[8px] animate-pulse">DIRTY</span>
                            )}
                            {room.status === 'cleaning' && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-cyan-400 animate-pulse">CLEAN...</span>
                                <div className="w-8 h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${room.cleanProgress}%` }}></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Room Visual Elements: bed, TV, light lamps */}
                          <div className="flex items-end justify-between mt-auto mb-1 gap-1">
                            {/* Bed / Guest Sleep */}
                            <div className="relative flex flex-col items-center group">
                              {guest && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                                  {/* Guest bubble order */}
                                  {guest.status === 'ordering' && (
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectGuestOrder(guest);
                                      }}
                                      className="animate-bounce-subtle bg-white border-2 border-pink-500 text-slate-900 font-bold px-2 py-1 rounded-2xl flex items-center gap-1 text-[9px] shadow-lg cursor-pointer whitespace-nowrap"
                                    >
                                      <span className="text-sm shrink-0">{DISHES[guest.orderDishId || 'burger'].icon}</span>
                                      <span>ORDER</span>
                                    </div>
                                  )}

                                  {guest.status === 'waiting_delivery' && (
                                    <div className="animate-pulse bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-extrabold px-2 py-1 rounded-2xl flex items-center gap-1 text-[8px] shadow-lg whitespace-nowrap">
                                      <span>🛎️ SERVE</span>
                                    </div>
                                  )}

                                  {guest.status === 'eating' && (
                                    <div className="bg-slate-900 border border-slate-700 font-bold px-1.5 py-0.5 rounded-full text-[8px] text-slate-300 whitespace-nowrap">
                                      😋 Eating...
                                    </div>
                                  )}

                                  {/* Floating Guest Character Emoji */}
                                  <div className="text-xl md:text-2xl mt-1 animate-bounce-subtle">
                                    {guest.avatarEmoji}
                                  </div>
                                </div>
                              )}

                              {/* Bed graphic */}
                              <div className="w-16 md:w-20 h-8 md:h-10 bg-indigo-950 border border-indigo-900 rounded-lg relative overflow-hidden flex items-end p-0.5">
                                <div className="absolute top-0 right-0 w-5 md:w-6 h-full bg-indigo-900/50"></div> {/* Pillow */}
                                <div className="absolute top-2 left-2 w-8 md:w-10 h-3 bg-purple-900/40 rounded-full"></div>
                                <span className="text-[7px] md:text-[8px] font-mono text-indigo-300/40 absolute top-0.5 left-1 font-bold">LVL {room.bedLevel}</span>
                              </div>
                            </div>

                            {/* Interactive Actions (Clean/Rent) */}
                            <div className="flex flex-col gap-1 items-center">
                              {room.status === 'dirty' && (
                                <button
                                  onClick={() => onCleanRoom(room.number)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500 hover:bg-rose-400 text-white rounded-md text-[8px] font-black shadow-[0_0_8px_rgba(239,68,68,0.4)] cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  CLEAN
                                </button>
                              )}

                              {guest && guest.status === 'eating' && (
                                <button
                                  onClick={() => onCollectRent(guest.id, room.number)}
                                  className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white rounded-md text-[8px] font-black shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse-glow cursor-pointer whitespace-nowrap"
                                >
                                  <DollarSign className="w-2.5 h-2.5" />
                                  OUT
                                </button>
                              )}
                            </div>

                            {/* TV Graphic */}
                            <div className="flex flex-col items-center">
                              <div className="w-10 md:w-12 h-6 md:h-8 bg-slate-950 border border-slate-800 rounded-md relative flex flex-col items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>
                                <span className="text-[6px] md:text-[7px] font-bold text-cyan-400 tracking-wider">HD TV</span>
                                <span className="text-[5px] md:text-[6px] font-mono text-slate-600">LVL {room.tvLevel}</span>
                              </div>
                              <div className="w-3.5 h-1 bg-slate-850 border-r border-l border-slate-700"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Elevator Shaft F3 */}
                <div className="col-span-2 relative bg-slate-950/80 flex items-center justify-center border-l-2 border-slate-950">
                  {elevatorFloor === 3 ? (
                    <div className="w-10 h-14 bg-gradient-to-tr from-amber-500/20 to-yellow-600/30 border-2 border-yellow-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse">
                      <span className="text-xs font-black text-yellow-400">🛎️</span>
                      <span className="text-[8px] font-mono text-yellow-300 font-black">ELEV 3F</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onCallElevator(3)}
                      className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-yellow-400 flex items-center justify-center text-xs hover:text-yellow-400 font-black"
                    >
                      3
                    </button>
                  )}
                </div>
              </div>

              {/* === FLOOR 2: THE KITCHEN & HALLWAY === */}
              <div className="relative flex-1 border-b-4 border-slate-950 grid grid-cols-12">
                <div className="absolute top-2 left-3 bg-slate-950/80 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide text-pink-400 z-10">
                  2F: CULINARY KITCHEN
                </div>

                {/* Kitchen Area doorway */}
                <div 
                  onClick={() => onScreenChange('cooking')}
                  className="col-span-10 relative bg-slate-900/60 hover:bg-slate-900/40 cursor-pointer flex items-center justify-between px-8 border-r-2 border-slate-950 transition-all group"
                >
                  <div className="absolute inset-0 bg-radial from-slate-900 via-slate-900 to-indigo-950/20"></div>

                  {/* Cooking equipment models */}
                  <div className="relative z-10 flex gap-6 items-end mt-auto pb-2">
                    {/* Stove/Grill model */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-10 bg-slate-950 border border-slate-800 rounded-t-lg relative flex flex-col justify-end p-1">
                        <div className="flex gap-1 justify-center mb-1">
                          <span className="w-2.5 h-1 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="w-2.5 h-1 bg-red-500 rounded-full animate-pulse [animation-delay:0.5s]"></span>
                        </div>
                        <span className="text-[7px] text-center text-slate-500 font-mono">STOVE</span>
                      </div>
                      <div className="w-14 h-1 bg-slate-800"></div>
                    </div>

                    {/* Drink fountain dispenser */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-11 bg-slate-950 border border-slate-800 rounded-lg p-1 flex flex-col justify-between">
                        <span className="text-[6px] text-center text-cyan-400 font-black">DISPENSE</span>
                        <div className="w-1.5 h-3 bg-cyan-500/20 mx-auto rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Entry Door */}
                  <div className="relative z-10 flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                    <div className="w-12 h-20 bg-slate-950 border-2 border-pink-500/60 rounded-t-2xl relative flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.15)] group-hover:border-pink-500">
                      <span className="text-xl">🚪</span>
                      {/* Golden door knob */}
                      <span className="absolute top-1/2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                    </div>
                    <span className="px-2 py-0.5 bg-pink-500 text-[8px] font-black tracking-widest text-white rounded-full">
                      ENTER KITCHEN
                    </span>
                  </div>

                  {/* Character visual - Chef Gasto standing or chopping */}
                  <div className="relative z-10 flex flex-col items-center pb-2">
                    <div className="text-3xl animate-bounce-subtle [animation-duration:3s]">
                      👨‍🍳
                    </div>
                    <span className="text-[8px] bg-slate-950/80 border border-slate-800 text-slate-400 px-1 rounded">STAFF</span>
                  </div>
                </div>

                {/* Elevator Shaft F2 */}
                <div className="col-span-2 relative bg-slate-950/80 flex items-center justify-center border-l-2 border-slate-950">
                  {elevatorFloor === 2 ? (
                    <div className="w-10 h-14 bg-gradient-to-tr from-amber-500/20 to-yellow-600/30 border-2 border-yellow-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse">
                      <span className="text-xs font-black text-yellow-400">🛎️</span>
                      <span className="text-[8px] font-mono text-yellow-300 font-black">ELEV 2F</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onCallElevator(2)}
                      className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-yellow-400 flex items-center justify-center text-xs hover:text-yellow-400 font-black"
                    >
                      2
                    </button>
                  )}
                </div>
              </div>

              {/* === FLOOR 1: GRAND LOBBY, RECEPTION & WINDOW ROAD === */}
              <div className="relative flex-1 grid grid-cols-12 bg-slate-950">
                
                {/* Large lobby glass panels showing road outside */}
                <div className="col-span-10 relative overflow-hidden flex items-end justify-between px-6 border-r-2 border-slate-950">
                  
                  {/* Outside glass background road */}
                  <div className="absolute top-0 inset-x-0 h-14 border-b border-slate-850 bg-slate-950">
                    <div className="absolute inset-x-0 bottom-1 h-3 bg-slate-900">
                      {/* Sidewalk lines */}
                      <div className="w-full h-[1px] bg-slate-800"></div>
                      
                      {/* Scrolling visual cars */}
                      {carOffset.map((offset, index) => {
                        const carIcons = ['🚗', '🚕', '🚙'];
                        return (
                          <div 
                            key={index}
                            className="absolute -bottom-1 text-base transition-all duration-100 ease-linear pointer-events-none"
                            style={{ left: `${offset}%` }}
                          >
                            {carIcons[index % carIcons.length]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="absolute top-1 right-3 bg-slate-950/90 border border-slate-850 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide text-cyan-400 z-10">
                    1F: RECEPTION LOBBY &amp; ENTRY
                  </div>

                  {/* Front Receptionist Desk */}
                  <div className="relative z-10 flex items-end gap-3 pb-2">
                    {/* Receptionist character */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl animate-bounce-subtle">
                        👩‍💼
                      </div>
                      <div className="w-14 h-8 bg-amber-950 border border-amber-900 rounded-t-lg flex items-center justify-center shadow-lg relative">
                        <span className="text-[7px] font-black text-amber-300">🛎️ RECEPTION</span>
                        {/* Desk bell */}
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-yellow-400 rounded-full border border-slate-900"></span>
                      </div>
                    </div>

                    {/* Waiting Lobby Guests Line */}
                    <div className="flex items-end gap-1.5">
                      {lobbyGuests.map((g, i) => (
                        <div 
                          key={g.id}
                          className="flex flex-col items-center animate-bounce-subtle"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${g.avatarColor} flex items-center justify-center text-lg border border-white/10 shadow-md`}>
                            {g.avatarEmoji}
                          </div>
                          <span className="text-[8px] bg-slate-900 border border-slate-800 px-1 rounded text-slate-300">
                            VIP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative plant, couch, sign board */}
                  <div className="relative z-10 flex gap-4 items-end pb-2">
                    {/* Lobby Couch */}
                    <div className="w-16 h-7 bg-indigo-950 border-t border-indigo-900 rounded-lg flex items-center justify-center p-1">
                      <span className="text-[8px] text-indigo-400/50 font-bold uppercase">Lounge</span>
                    </div>

                    {/* Lush Neon Plant */}
                    <div className="flex flex-col items-center">
                      <span className="text-xl animate-pulse">🌿</span>
                      <div className="w-5 h-5 bg-amber-950 border border-amber-900 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Elevator Shaft F1 */}
                <div className="col-span-2 relative bg-slate-950/80 flex items-center justify-center border-l-2 border-slate-950">
                  {elevatorFloor === 1 ? (
                    <div className="w-10 h-14 bg-gradient-to-tr from-amber-500/20 to-yellow-600/30 border-2 border-yellow-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse">
                      <span className="text-xs font-black text-yellow-400">🛎️</span>
                      <span className="text-[8px] font-mono text-yellow-300 font-black">ELEV 1F</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onCallElevator(1)}
                      className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-yellow-400 flex items-center justify-center text-xs hover:text-yellow-400 font-black"
                    >
                      1
                    </button>
                  )}
                </div>
              </div>

              {/* === ELEVATOR BREAKDOWN STRIKE MODAL === */}
              {elevatorStatus === 'broken' && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-30 animate-fade-in p-4">
                  <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-5 max-w-xs text-center shadow-2xl flex flex-col items-center animate-bounce-subtle">
                    <ShieldAlert className="w-11 h-11 text-red-500 mb-2 animate-pulse" />
                    <h4 className="font-sans text-sm font-black text-red-500 tracking-wider uppercase mb-1">
                      ELEVATOR BREAKDOWN
                    </h4>
                    <p className="text-xs text-slate-400 leading-normal mb-4">
                      The magnetic elevator stalled! Rapidly tap maintenance to clear the grids.
                    </p>
                    <button
                      onClick={onRepairElevator}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl font-bold text-xs transition-all tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.4)] cursor-pointer animate-pulse-glow"
                    >
                      <Wrench className="w-4 h-4 animate-spin" />
                      TAP TO REPAIR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== SCREEN SWITCHER NAVIGATION HUD ==================== */}
          <footer className="w-full bg-slate-900/95 border-t border-slate-800/80 p-4 grid grid-cols-5 gap-3 relative z-10 backdrop-blur-md">
            
            <button 
              onClick={() => onScreenChange('cooking')}
              className="group flex flex-col items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/20 text-pink-400 hover:text-white transition-all shadow-[0_0_12px_rgba(236,72,153,0.05)] cursor-pointer"
            >
              <ChefHat className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[10px] font-black uppercase tracking-wider">Kitchen</span>
            </button>

            <button 
              onClick={() => onScreenChange('delivery')}
              className="group flex flex-col items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 text-amber-400 hover:text-white transition-all shadow-[0_0_12px_rgba(245,158,11,0.05)] cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[10px] font-black uppercase tracking-wider">Room Delivery</span>
            </button>

            <button 
              onClick={() => onScreenChange('upgrades')}
              className="group flex flex-col items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/20 text-purple-400 hover:text-white transition-all shadow-[0_0_12px_rgba(168,85,247,0.05)] cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[10px] font-black uppercase tracking-wider">Upgrade Shop</span>
            </button>

            <button 
              onClick={() => onScreenChange('staff')}
              className="group flex flex-col items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.05)] cursor-pointer"
            >
              <Users className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[10px] font-black uppercase tracking-wider">Hiring Staff</span>
            </button>

            <button 
              onClick={() => onScreenChange('reviews')}
              className="group flex flex-col items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/20 text-emerald-400 hover:text-white transition-all shadow-[0_0_12px_rgba(16,185,129,0.05)] cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[10px] font-black uppercase tracking-wider">Hustle Advisor</span>
            </button>
          </footer>
        </section>
      </main>

      {/* ==================== MODAL: GUEST ROOM ASSIGNMENT SELECTOR ==================== */}
      {selectedLobbyGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <h3 className="font-sans text-lg font-black tracking-wide text-slate-100 uppercase mb-2 flex items-center gap-1.5">
              <span>🛎️ ROOM CHECK-IN DESK</span>
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-normal">
              Select an available clean guest suite to assign <span className="text-cyan-400 font-bold">{selectedLobbyGuest.name}</span>.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {rooms.map((room) => {
                const isCleanVacant = room.status === 'vacant';
                return (
                  <div 
                    key={room.number}
                    className={`p-3 rounded-2xl border transition-all flex justify-between items-center ${
                      isCleanVacant 
                        ? 'bg-slate-950 border-slate-800 hover:border-cyan-500/60 cursor-pointer' 
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                    onClick={() => {
                      if (isCleanVacant) {
                        onAssignRoom(selectedLobbyGuest.id, room.number);
                        setSelectedLobbyGuest(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-mono text-xs text-slate-400 border border-slate-850">
                        🚪 {room.number}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Suite {room.number} (Floor {room.floor})</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          STATUS: {room.status}
                        </p>
                      </div>
                    </div>

                    <button 
                      disabled={!isCleanVacant}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
                        isCleanVacant 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg cursor-pointer' 
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isCleanVacant ? 'ASSIGN ROOM' : 'BLOCKED'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedLobbyGuest(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-100 rounded-xl font-bold text-xs transition-all tracking-wider border border-slate-750 cursor-pointer"
            >
              CANCEL CHECK-IN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
