/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RotateCw, Smartphone } from 'lucide-react';

export default function LandscapeOnly({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // If height is greater than width, and screen size is typically mobile/tablet, show warning
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-6 text-center select-none">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse"></div>

      {/* Warning Box */}
      <div className="relative z-10 max-w-sm bg-slate-900/80 border-2 border-fuchsia-500/50 rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-bounce-subtle">
        {/* Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-fuchsia-500 rounded-full shadow-[0_0_15px_#d946ef]"></div>

        <div className="relative flex justify-center mb-6">
          <Smartphone className="w-16 h-16 text-slate-300 stroke-[1.5]" />
          <RotateCw className="absolute -bottom-2 -right-2 w-8 h-8 text-fuchsia-400 animate-spin" />
        </div>

        <h1 className="font-sans text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 tracking-tight mb-3">
          ROTATION REQUIRED
        </h1>
        
        <p className="font-sans text-sm text-slate-400 leading-relaxed mb-6">
          Rotate your device to <span className="text-cyan-400 font-bold">Landscape mode</span> to play <span className="text-white font-bold">Suite Hustle</span> in all its premium 2D neon glory.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="font-mono text-xs text-slate-300 font-medium">OPTIMIZED FOR LANDSCAPE</span>
        </div>
      </div>
    </div>
  );
}
