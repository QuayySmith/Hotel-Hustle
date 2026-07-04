/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Star, MessageSquare, Award } from 'lucide-react';
import { GameReview } from '../types';
import { playSound } from '../lib/audio';

interface ReviewsViewProps {
  reviews: GameReview[];
  onBackToHotel: () => void;
}

export default function ReviewsView({
  reviews,
  onBackToHotel,
}: ReviewsViewProps) {
  
  // Render Star Ratings based on 100-scale score
  const renderStars = (score: number) => {
    const starCount = Math.round(score / 20); // 0 to 5 stars
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < starCount ? 'fill-yellow-400 text-yellow-400' : 'text-slate-850'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/3 w-[35rem] h-[35rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none"></div>

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-orange-500/20 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playSound('click'); onBackToHotel(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-orange-500 hover:text-orange-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-orange-400 uppercase flex items-center gap-1.5">
              💬 CRITIC & GUEST TIMELINE
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Feedback feed detailing served customer ratings, tips, and satisfaction
            </p>
          </div>
        </div>

        {/* Global Average Rating */}
        <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-2xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Average Satisfaction</span>
            <span className="font-mono text-sm font-black text-yellow-400">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.overallScore, 0) / reviews.length).toFixed(1)
                : '100'
              }%
            </span>
          </div>
        </div>
      </header>

      {/* ==================== REVIEWS FEED LIST ==================== */}
      <main className="flex-1 w-full p-6 overflow-y-auto relative z-10 bg-slate-900/40">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5 pb-6">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="font-sans text-[10px] font-black text-slate-500 tracking-widest uppercase">BURGER CUSTOMER TIMELINE</span>
            <span className="text-[10px] text-orange-400 font-bold">VERIFIED REVIEWS ONLY</span>
          </div>

          {reviews.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-600 gap-3">
              <MessageSquare className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-bold leading-relaxed max-w-sm">
                No custom ratings published yet! Build burgers and serve customers to fill up the timeline.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex gap-4 hover:border-slate-800 transition-all shadow-md relative overflow-hidden"
              >
                {/* Visual Glow indicators for Critic reviews */}
                {rev.customerName === "Jojo the Critic" && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-500 via-amber-500 to-rose-500 animate-pulse"></div>
                )}

                {/* Guest Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${rev.avatarColor} flex items-center justify-center text-2xl shadow border border-white/5 shrink-0`}>
                  {rev.avatarEmoji}
                </div>

                {/* Review Body */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-sans text-xs font-black text-slate-100">{rev.customerName}</h4>
                        {rev.customerName === "Jojo the Critic" && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-sans text-[7px] font-black rounded tracking-wide animate-pulse">CRITIC</span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{rev.burgerName}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {renderStars(rev.overallScore)}
                      <span className="text-[9px] font-mono font-bold text-yellow-400/90">{rev.overallScore}% score</span>
                    </div>
                  </div>

                  {/* Rating parameters breakdown bar */}
                  <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-900 rounded-lg text-center text-[8px] font-bold text-slate-400">
                    <div>
                      <span className="block text-slate-500">Wait Patience</span>
                      <span className="font-mono text-cyan-400">{rev.waitScore}%</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Grill Precision</span>
                      <span className="font-mono text-orange-400">{rev.grillScore}%</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Build Accuracy</span>
                      <span className="font-mono text-yellow-400">{rev.buildScore}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900 text-[9px]">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Tip Earned:</span>
                    <span className="font-mono text-emerald-400 font-black">+${rev.tip.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
