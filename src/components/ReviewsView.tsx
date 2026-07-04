/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Star, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { Review } from '../types';

interface ReviewsViewProps {
  rating: number;
  reviews: Review[];
  onBackToHotel: () => void;
}

export default function ReviewsView({
  rating,
  reviews,
  onBackToHotel,
}: ReviewsViewProps) {
  
  // Render Star Ratings
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < Math.floor(score) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/3 w-[35rem] h-[35rem] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHotel}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              💬 HUSTLEADVISOR REVIEWS
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Social feedback board detailing customer experience and ratings
            </p>
          </div>
        </div>

        {/* Global Average Rating */}
        <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-2xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">OVERALL SCORE</span>
            <span className="font-mono text-sm font-black text-yellow-400">{rating.toFixed(1)} / 5.0</span>
          </div>
          {renderStars(rating)}
        </div>
      </header>

      {/* ==================== REVIEWS FEED LIST ==================== */}
      <main className="flex-1 w-full p-6 overflow-y-auto relative z-10 bg-slate-900/40">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5 pb-6">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="font-sans text-[10px] font-black text-slate-500 tracking-widest uppercase">FEEDBACK TIMELINE</span>
            <span className="text-[10px] text-emerald-400 font-bold">VERIFIED REVIEWS ONLY</span>
          </div>

          {reviews.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-600 gap-3">
              <MessageSquare className="w-12 h-12" />
              <p className="text-xs font-bold leading-relaxed max-w-sm">
                No checkout ratings published yet! Complete full checkouts in the hotel to trigger guest reviews.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-slate-950 border border-slate-850 rounded-2xl p-4.5 flex gap-4 hover:border-slate-800 transition-all shadow-md"
              >
                {/* Guest Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${rev.avatarColor} flex items-center justify-center text-2xl shadow border border-white/5 shrink-0`}>
                  {rev.avatarEmoji}
                </div>

                {/* Review Body */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans text-xs font-black text-slate-100">{rev.guestName}</h4>
                      <p className="text-[9px] text-slate-500 font-medium">{rev.timestamp}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {renderStars(rev.rating)}
                      <span className="text-[9px] font-mono font-bold text-yellow-400/90">{rev.rating.toFixed(1)} Stars</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Served meal indicator tags */}
                  {rev.dishServed && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-slate-900 border border-slate-850 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dish served:</span>
                      <span className="text-[10px] font-black text-slate-300 font-mono">{rev.dishServed}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
