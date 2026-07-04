/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LOADING_TIPS } from '../data';
import { Sparkles, Loader2 } from 'lucide-react';
import { playSound } from '../lib/audio';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [countdown, setCountdown] = useState(10);
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("Loading Save...");

  const loadingSequence = [
    { threshold: 10, label: "Loading Lobby..." },
    { threshold: 8, label: "Loading Customers..." },
    { threshold: 7, label: "Loading Kitchen..." },
    { threshold: 5, label: "Loading Staff..." },
    { threshold: 3, label: "Loading Save..." },
    { threshold: 1, label: "Loading AI..." },
  ];

  useEffect(() => {
    // 10 second countdown ticker
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playSound('chime');
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Dynamic progress bar linked to countdown
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + (100 / 200); // 100% over 10 seconds (ticks every 50ms)
      });
    }, 50);

    // Tip rotation every 2.5 seconds
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
      clearInterval(tipTimer);
    };
  }, []);

  // Update current loading item based on the countdown time remaining
  useEffect(() => {
    const matched = loadingSequence.find(step => countdown >= step.threshold);
    if (matched) {
      setCurrentStatus(matched.label);
    } else {
      setCurrentStatus("Finalizing Setup...");
    }
  }, [countdown]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950/25 text-white p-6 select-none">
      
      {/* Visual Ambient Grid and Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.015)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[50rem] h-[25rem] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none"></div>

      {/* Header section */}
      <div className="relative z-10 text-center pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono text-[9px] tracking-widest text-amber-300 font-bold uppercase">PREMIUM ARCADE COOKING SIMULATOR</span>
        </div>
        
        <h1 className="font-sans text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] animate-pulse">
          QUAZZYS FOODARIA
        </h1>
        <p className="font-sans text-[10px] tracking-widest text-slate-400 uppercase mt-1 font-semibold">
          THE ULTIMATE NINE-STATION STEAK & PIZZA EMBASSY
        </p>
      </div>

      {/* Central Interactive Loading Display */}
      <div className="relative z-10 flex flex-col items-center justify-center py-2">
        <div className="relative w-40 h-40 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 rounded-full border-2 border-amber-500/35 shadow-[0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-yellow-500/5 opacity-50"></div>
          
          {/* Animated Cooking Icons */}
          <span className="text-5xl mb-2 animate-bounce">🍕</span>
          
          {/* Tactile Countdown Circle */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl font-black text-amber-400 leading-none">
              {countdown}s
            </span>
            <span className="font-mono text-[8px] text-slate-500 tracking-wider uppercase mt-1">
              REMAINING
            </span>
          </div>
        </div>

        {/* Individual Items loaded status display */}
        <div className="mt-5 space-y-1.5 w-60">
          {[
            { id: "hotel", label: "Loading Lobby...", trigger: 10 },
            { id: "guests", label: "Loading Customers...", trigger: 8 },
            { id: "kitchen", label: "Loading Kitchen...", trigger: 7 },
            { id: "staff", label: "Loading Staff...", trigger: 5 },
            { id: "save", label: "Loading Save...", trigger: 3 },
            { id: "ai", label: "Loading AI...", trigger: 1 },
          ].map((item) => {
            const isFinished = countdown < item.trigger;
            const isActive = countdown === item.trigger;
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between px-3 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                  isFinished 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : isActive 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold scale-102' 
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-600'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className="shrink-0 font-bold">
                  {isFinished ? "✓ READY" : isActive ? "⚡ IN PROGRESS" : "⧖ PENDING"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer loading progress bar & Tips */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center pb-6">
        
        {/* Dynamic tips rotation box */}
        <div className="w-full min-h-[56px] bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 mb-5 backdrop-blur-sm shadow-lg flex items-center justify-center">
          <p className="font-sans text-[11px] text-center font-bold text-slate-300 italic max-w-md leading-relaxed">
            {LOADING_TIPS[tipIndex]}
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="font-sans text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              STATUS: {currentStatus}
            </span>
            <span className="font-mono text-[10px] font-black text-amber-400">
              {Math.min(100, Math.floor(progress))}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 border border-slate-900 rounded-full p-0.5 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full transition-all duration-75 duration-linear shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
