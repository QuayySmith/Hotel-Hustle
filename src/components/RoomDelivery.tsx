/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowUp, ArrowDown, HelpCircle, 
  Sparkles, CheckCircle, Smartphone, Flame, AlertOctagon, Wrench
} from 'lucide-react';
import { Guest, ScreenType, DishId } from '../types';
import { DISHES } from '../data';

interface RoomDeliveryProps {
  guests: Guest[];
  elevatorFloor: number;
  elevatorStatus: 'working' | 'broken';
  onCallElevator: (floor: number) => void;
  onRepairElevator: () => void;
  onDeliverFood: (guestId: string) => void;
  onBackToHotel: () => void;
}

export default function RoomDelivery({
  guests,
  elevatorFloor,
  elevatorStatus,
  onCallElevator,
  onRepairElevator,
  onDeliverFood,
  onBackToHotel,
}: RoomDeliveryProps) {
  const readyDeliveries = guests.filter((g) => g.status === 'waiting_delivery');
  const [selectedDelivery, setSelectedDelivery] = useState<Guest | null>(
    readyDeliveries.length > 0 ? readyDeliveries[0] : null
  );

  useEffect(() => {
    // Keep selection in sync if deliveries list changes
    if (readyDeliveries.length > 0 && (!selectedDelivery || !readyDeliveries.some(d => d.id === selectedDelivery.id))) {
      setSelectedDelivery(readyDeliveries[0]);
    } else if (readyDeliveries.length === 0) {
      setSelectedDelivery(null);
    }
  }, [guests, readyDeliveries, selectedDelivery]);

  const handleDeliver = (guest: Guest) => {
    if (elevatorStatus === 'broken') return;
    if (elevatorFloor !== 3) {
      // Must take elevator to Floor 3 to deliver!
      return;
    }
    onDeliverFood(guest.id);
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none animate-pulse"></div>
      
      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHotel}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-amber-500 hover:text-amber-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-amber-400 uppercase">
              🚀 MAGNETIC SUITE EXPRESS
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Elevator Dispatch &amp; Room-Service Delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
          <span className="font-mono text-xs font-black text-slate-300">ACTIVE COOLDOWNS: {readyDeliveries.length} DISPATCHES</span>
        </div>
      </header>

      {/* ==================== GAMEPLAY WINDOW ==================== */}
      <main className="flex-1 w-full grid grid-cols-12 overflow-hidden bg-slate-900/40 relative z-10">
        
        {/* LEFT COLUMN: ACTIVE READY TRays (4 cols) */}
        <section className="col-span-4 bg-slate-950 border-r border-slate-850 p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="border-b border-slate-900 pb-2 mb-1">
            <span className="font-sans text-[10px] font-black text-slate-500 tracking-widest uppercase">DELIVERY QUEUE</span>
          </div>

          {readyDeliveries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-600 gap-3 border border-dashed border-slate-800 rounded-2xl">
              <span className="text-4xl">🍕</span>
              <p className="text-xs font-bold leading-normal">
                No food orders cooked yet! Head to the Sizzle Kitchen to grill meals first.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {readyDeliveries.map((d) => {
                const dish = DISHES[d.orderDishId || 'burger'];
                const isSelected = selectedDelivery?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDelivery(d)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                        : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shadow">
                        {dish.icon}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-200">{dish.name}</p>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          ROOM {d.roomNumber} &bull; {d.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] text-slate-400">{Math.floor(d.patience)}%</span>
                      <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400"
                          style={{ width: `${d.patience}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: ELEVATOR SHAFT CONTROLLER & DELIVER BUTTONS (8 cols) */}
        <section className="col-span-8 p-6 flex flex-col justify-between overflow-hidden relative">
          
          {/* Elevator shaft schematic map */}
          <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-850 p-4 flex gap-6 relative shadow-inner">
            
            {/* Visual Elevator column */}
            <div className="w-24 bg-slate-900 border border-slate-850 rounded-2xl relative p-1 flex flex-col justify-between overflow-hidden">
              {/* Shaft floor markers */}
              <div className="absolute top-3 inset-x-0 text-center font-mono text-[9px] text-slate-600 font-bold uppercase">3F: PENTHOUSE</div>
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 text-center font-mono text-[9px] text-slate-600 font-bold uppercase">2F: KITCHEN</div>
              <div className="absolute bottom-3 inset-x-0 text-center font-mono text-[9px] text-slate-600 font-bold uppercase">1F: LOBBY</div>

              {/* Grid guide lines */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-800 border-dashed"></div>

              {/* Moving elevator carriage */}
              <div 
                className="absolute w-16 h-16 bg-gradient-to-tr from-amber-500/25 to-yellow-500/10 border-2 border-yellow-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.25)] transition-all duration-1000 ease-out z-10"
                style={{ 
                  bottom: elevatorFloor === 1 ? '8px' : elevatorFloor === 2 ? 'calc(50% - 32px)' : 'calc(100% - 72px)'
                }}
              >
                <span className="text-xl">🛎️</span>
                <span className="font-mono text-[9px] text-yellow-300 font-black tracking-wider uppercase">
                  {elevatorFloor}F CAR
                </span>
              </div>
            </div>

            {/* Shaft floor call controls & Delivery dispatcher */}
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Elevator floor controllers */}
              <div className="flex flex-col gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">CALL ELEVATOR TO FLOOR:</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onCallElevator(3)}
                    className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      elevatorFloor === 3 
                        ? 'bg-yellow-500 text-slate-900' 
                        : 'bg-slate-900 border border-slate-800 hover:border-yellow-400/50 text-slate-300 cursor-pointer'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    3F (Suites)
                  </button>

                  <button
                    onClick={() => onCallElevator(2)}
                    className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      elevatorFloor === 2 
                        ? 'bg-yellow-500 text-slate-900' 
                        : 'bg-slate-900 border border-slate-800 hover:border-yellow-400/50 text-slate-300 cursor-pointer'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    2F (Kitchen)
                  </button>

                  <button
                    onClick={() => onCallElevator(1)}
                    className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      elevatorFloor === 1 
                        ? 'bg-yellow-500 text-slate-900' 
                        : 'bg-slate-900 border border-slate-800 hover:border-yellow-400/50 text-slate-300 cursor-pointer'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    1F (Lobby)
                  </button>
                </div>
              </div>

              {/* Interactive Dispatch Area */}
              <div className="flex-1 flex flex-col justify-center items-center p-4">
                {selectedDelivery ? (
                  <div className="w-full max-w-sm bg-slate-900 border border-slate-850 rounded-2xl p-4 text-center flex flex-col items-center">
                    <span className="text-3xl mb-2">{DISHES[selectedDelivery.orderDishId || 'burger'].icon}</span>
                    <h4 className="font-sans text-xs font-black uppercase text-slate-200">
                      DISPATCH TRAY FOR ROOM {selectedDelivery.roomNumber}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                      The elevator must park at <span className="text-yellow-400 font-bold">Floor 3 (VIP Suites)</span> to allow bedroom drop-offs.
                    </p>

                    <div className="w-full h-[1px] bg-slate-850 my-3"></div>

                    {/* Dispatch validation buttons */}
                    {elevatorFloor !== 3 ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Elevator is parked at {elevatorFloor}F. Call to 3F first!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeliver(selectedDelivery)}
                        disabled={elevatorStatus === 'broken'}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] text-slate-950 rounded-xl font-sans font-black text-xs tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        DELIVER MEAL NOW
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    No active dispatches selected. Cook more meals!
                  </div>
                )}
              </div>
            </div>

            {/* Elevator breakdown trigger */}
            {elevatorStatus === 'broken' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-3xl animate-fade-in">
                <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-4 max-w-xs text-center flex flex-col items-center shadow-2xl">
                  <AlertOctagon className="w-10 h-10 text-red-500 mb-1.5 animate-pulse" />
                  <h4 className="font-sans text-xs font-black text-red-500 tracking-wider uppercase mb-0.5">
                    GRID OVERHEAT BREAKDOWN
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mb-3">
                    Magnetic grid overvoltage stalled the carriage. Rapidly tap repair!
                  </p>
                  <button
                    onClick={onRepairElevator}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5 animate-spin" />
                    TAP TO FIX
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
