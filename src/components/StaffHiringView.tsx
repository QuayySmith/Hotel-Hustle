/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, DollarSign, Users, Check, Sparkles, Star } from 'lucide-react';
import { Staff } from '../types';

interface StaffHiringViewProps {
  money: number;
  staff: Staff[];
  onHireStaff: (staffId: string) => void;
  onLevelUpStaff: (staffId: string) => void;
  onBackToHotel: () => void;
}

export default function StaffHiringView({
  money,
  staff,
  onHireStaff,
  onLevelUpStaff,
  onBackToHotel,
}: StaffHiringViewProps) {
  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* Background neon glows */}
      <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none"></div>

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHotel}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-cyan-500 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
              🤵 SUITE RECRUITMENT AGENCY
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Assemble a five-star team to automate kitchen cooking, sweeping, and reception
            </p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl px-4 py-1.5 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-base font-black text-emerald-400">
            {money.toLocaleString()}
          </span>
        </div>
      </header>

      {/* ==================== STAFF CARDS LIST ==================== */}
      <main className="flex-1 w-full p-6 overflow-y-auto relative z-10 bg-slate-900/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {staff.map((employee) => {
            const hired = employee.hired;
            const canAffordHiring = money >= employee.cost;
            const levelUpCost = Math.floor(employee.cost * 0.7);
            const canAffordLevelUp = money >= levelUpCost;
            
            return (
              <div 
                key={employee.id}
                className={`bg-slate-950 border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-lg group relative overflow-hidden ${
                  hired ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'border-slate-850 hover:border-slate-800'
                }`}
              >
                {/* Glow outline on hired */}
                {hired && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                )}

                <div className="flex items-start gap-3.5 mb-4">
                  {/* Employee Character sphere */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      {employee.emoji}
                    </div>
                    {/* Hired indicator dot */}
                    {hired && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Name and role */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-sans text-xs font-black text-slate-100 tracking-tight leading-tight">
                        {employee.name}
                      </h3>
                      {hired && (
                        <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-md font-mono text-[8px] font-extrabold shrink-0">
                          LVL {employee.level}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mt-0.5">
                      {employee.role}
                    </span>

                    <p className="text-[10px] text-slate-400 leading-normal mt-2 min-h-[48px]">
                      {employee.perk}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-3.5 border-t border-slate-900 mt-2">
                  <div className="text-left font-mono">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block font-sans">SALARY PULL</span>
                    <span className="text-[10px] font-bold text-cyan-400">
                      -${employee.salary}/cycle
                    </span>
                  </div>

                  {!hired ? (
                    <button
                      onClick={() => onHireStaff(employee.id)}
                      disabled={!canAffordHiring}
                      className={`px-4 py-2 rounded-xl font-sans font-black text-[10px] tracking-widest uppercase transition-all ${
                        canAffordHiring 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.03] text-white shadow-lg cursor-pointer' 
                          : 'bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      SIGN CONTRACT • ${employee.cost}
                    </button>
                  ) : (
                    <button
                      onClick={() => onLevelUpStaff(employee.id)}
                      disabled={!canAffordLevelUp}
                      className={`px-4 py-2 rounded-xl font-sans font-black text-[10px] tracking-widest uppercase transition-all ${
                        canAffordLevelUp 
                          ? 'bg-slate-900 border border-slate-800 hover:border-cyan-400 hover:text-cyan-400 text-slate-300 cursor-pointer' 
                          : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      TRAIN • ${levelUpCost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
