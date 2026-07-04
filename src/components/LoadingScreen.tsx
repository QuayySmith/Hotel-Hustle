/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LOADING_TIPS } from '../data';
import { Sparkles, Hotel } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Smooth 10s progress load
  useEffect(() => {
    const totalDuration = 10000; // 10 seconds
    const intervalTime = 50; // Update every 50ms
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoaded(true);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    // Tip rotation every 3 seconds
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, []);

  const secondsLeft = Math.max(0, 10 - (progress / 10)).toFixed(1);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between bg-radial from-slate-900 via-slate-950 to-black text-white p-6 select-none">
      {/* Visual Ambient Grid / Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Colored Glowing Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-pink-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-10 w-96 h-96 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none"></div>

      {/* Header section */}
      <div className="relative z-10 text-center pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/15 border border-rose-500/30 rounded-full mb-4 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-rose-300 font-semibold">PREMIUM 2D MOBILE TYCOON</span>
        </div>
        
        {/* Title Logo */}
        <h1 className="font-sans text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-fuchsia-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          SUITE HUSTLE
        </h1>
        <p className="font-sans text-xs tracking-widest text-slate-400 uppercase mt-1 font-medium">
          The Neon Hospitality &amp; Culinary Kitchen
        </p>
      </div>

      {/* Center visual: Hotel outline */}
      <div className="relative z-10 flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40 flex items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 rounded-full border border-slate-700/60 shadow-[0_0_30px_rgba(236,72,153,0.15)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 opacity-60"></div>
          {/* Neon outline hotel badge */}
          <Hotel className="w-20 h-20 text-pink-400 group-hover:scale-110 transition-transform duration-500" />
          {/* Ambient flashing window dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></span>
            <span className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping [animation-delay:1s]"></span>
          </div>
        </div>
      </div>

      {/* Footer Loading bar & Tips */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center pb-8">
        
        {/* strategy tip box */}
        <div className="w-full min-h-[64px] bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6 backdrop-blur-sm shadow-xl flex items-center justify-center transition-all duration-300">
          <p className="font-sans text-sm text-center font-medium text-slate-300 italic">
            {LOADING_TIPS[tipIndex]}
          </p>
        </div>

        {/* loading controls */}
        {loaded ? (
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-fuchsia-600 rounded-2xl font-sans text-base font-extrabold text-white tracking-widest shadow-[0_0_25px_rgba(236,72,153,0.5)] border border-yellow-300/30 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer animate-pulse-glow"
          >
            TAP TO ENTER HOTEL
          </button>
        ) : (
          <div className="w-full">
            {/* labels */}
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">
                Checking in guests &amp; heating ovens...
              </span>
              <span className="font-mono text-xs font-bold text-pink-400">
                {secondsLeft}s ({Math.min(100, Math.floor(progress))}% )
              </span>
            </div>

            {/* track */}
            <div className="w-full h-4 bg-slate-950 border border-slate-800/80 rounded-full p-0.5 overflow-hidden shadow-inner">
              {/* thumb */}
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-300 rounded-full transition-all duration-50 duration-linear shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
