/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Star, DollarSign, Award, ArrowRight, TrendingUp } from 'lucide-react';
import { GameReview } from '../types';
import { playSound } from '../lib/audio';

interface ResultScreenProps {
  lastReview: GameReview | null;
  onContinue: () => void;
}

export default function ResultScreen({
  lastReview,
  onContinue,
}: ResultScreenProps) {
  if (!lastReview) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <button onClick={onContinue} className="px-4 py-2 bg-amber-500 rounded text-slate-950 font-sans font-black uppercase">
          Return to Diner
        </button>
      </div>
    );
  }

  // Determine feedback message
  const getFeedbackMessage = (score: number) => {
    if (score >= 95) return { text: "Flawless Masterpiece! Absolute perfection!", color: "text-amber-400" };
    if (score >= 85) return { text: "Stellar! The client is grinning ear to ear!", color: "text-emerald-400" };
    if (score >= 70) return { text: "Pretty good, but they noticed some minor flaws.", color: "text-yellow-400" };
    if (score >= 50) return { text: "Passable burger, but they wanted higher craft.", color: "text-orange-400" };
    return { text: "Yikes... The patty was messy and they are not pleased.", color: "text-red-500" };
  };

  const feedback = getFeedbackMessage(lastReview.overallScore);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950/20 overflow-y-auto">
      
      {/* Main Scoreboard Wrapper Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-md bg-slate-950 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Retro Diagonal Stripe backdrop decoration */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-rose-500"></div>

        {/* Guest Avatar Header */}
        <div className="flex flex-col items-center text-center mt-3">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${lastReview.avatarColor} border-4 border-slate-900 flex items-center justify-center text-4xl shadow-lg relative`}>
            {lastReview.avatarEmoji}
          </div>
          <h2 className="font-sans font-black text-white text-lg tracking-tight mt-3">{lastReview.customerName}</h2>
          <p className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Ordered: {lastReview.burgerName}</p>
        </div>

        {/* Dynamic overall rating badge */}
        <div className="my-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shadow-inner relative overflow-hidden">
          <p className="font-sans font-bold text-[9px] text-slate-500 uppercase tracking-widest">Overall Satisfaction</p>
          <div className="flex items-baseline justify-center gap-1.5 mt-1">
            <span className="font-sans font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              {lastReview.overallScore}%
            </span>
          </div>
          <p className={`font-sans text-[10px] font-bold mt-2 ${feedback.color} uppercase tracking-wider`}>
            {feedback.text}
          </p>
        </div>

        {/* Standard Breakdowns List */}
        <div className="space-y-3">
          
          {/* Waiting Time */}
          <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
            <div className="flex justify-between text-[10px]">
              <span className="font-sans text-slate-400 font-bold uppercase tracking-wider">🛎️ Wait Patience Score</span>
              <span className="font-mono font-black text-cyan-400">{lastReview.waitScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${lastReview.waitScore}%` }}></div>
            </div>
          </div>

          {/* Grill Perfect Score */}
          <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
            <div className="flex justify-between text-[10px]">
              <span className="font-sans text-slate-400 font-bold uppercase tracking-wider">🥩 Grill Precision Score</span>
              <span className="font-mono font-black text-orange-400">{lastReview.grillScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${lastReview.grillScore}%` }}></div>
            </div>
          </div>

          {/* Assembly Build Score */}
          <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
            <div className="flex justify-between text-[10px]">
              <span className="font-sans text-slate-400 font-bold uppercase tracking-wider">🍔 Build Stack Accuracy</span>
              <span className="font-mono font-black text-yellow-400">{lastReview.buildScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${lastReview.buildScore}%` }}></div>
            </div>
          </div>

        </div>

        {/* Tip & Income Payout footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-mono text-xs text-slate-400 block leading-none">TIP EARNED</span>
              <span className="font-mono text-sm font-black text-emerald-400">+${lastReview.tip.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => { playSound('click'); onContinue(); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 active:scale-95 text-slate-950 font-sans text-xs font-black tracking-widest rounded-xl shadow-md transition-all cursor-pointer uppercase"
          >
            CONTINUE DINER
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
