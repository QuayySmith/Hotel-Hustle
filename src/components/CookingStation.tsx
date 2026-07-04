/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, ShoppingBag, Sparkles, Check, 
  RotateCcw, Award, Play, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { Dish, Guest, DishId } from '../types';
import { DISHES } from '../data';

interface CookingStationProps {
  money: number;
  activeOrderGuest: Guest | null;
  guests: Guest[];
  onBackToHotel: () => void;
  onCompleteCooking: (guestId: string, rating: number, earnings: number) => void;
}

type StationType = 'prep' | 'grill' | 'build' | 'drink' | 'serve';

interface CookingState {
  dishId: DishId;
  station: StationType;
  
  // Grill states
  grillProgress: number; // 0 to 100
  grillSide: 1 | 2;
  grillStatus: 'raw' | 'medium' | 'perfect' | 'overdone' | 'burnt';
  cookAccuracy: number;

  // Build states
  ingredientsAdded: string[];

  // Drink states
  drinkFill: number; // 0 to 100
  drinkIce: boolean;
  drinkStraw: boolean;

  // Serve states
  evaluationComplete: boolean;
  finalScore: number;
  finalTip: number;
  finalXp: number;
}

export default function CookingStation({
  money,
  activeOrderGuest,
  guests,
  onBackToHotel,
  onCompleteCooking,
}: CookingStationProps) {
  // Find a guest waiting for an order if none was directly clicked
  const defaultGuest = activeOrderGuest || guests.find((g) => g.status === 'ordering') || null;
  
  const [targetGuest, setTargetGuest] = useState<Guest | null>(defaultGuest);
  const targetDish: Dish | null = targetGuest ? DISHES[targetGuest.orderDishId || 'burger'] : null;

  // Initialize cooking state
  const [cooking, setCooking] = useState<CookingState>({
    dishId: targetDish?.id || 'burger',
    station: 'prep',
    grillProgress: 0,
    grillSide: 1,
    grillStatus: 'raw',
    cookAccuracy: 100,
    ingredientsAdded: [],
    drinkFill: 0,
    drinkIce: false,
    drinkStraw: false,
    evaluationComplete: false,
    finalScore: 0,
    finalTip: 0,
    finalXp: 0,
  });

  const [dispensing, setDispensing] = useState(false);

  // Sync state if targeted guest changes
  useEffect(() => {
    if (targetGuest) {
      const dish = DISHES[targetGuest.orderDishId || 'burger'];
      setCooking({
        dishId: dish.id,
        station: 'prep',
        grillProgress: 0,
        grillSide: 1,
        grillStatus: 'raw',
        cookAccuracy: 100,
        ingredientsAdded: [],
        drinkFill: 0,
        drinkIce: false,
        drinkStraw: false,
        evaluationComplete: false,
        finalScore: 0,
        finalTip: 0,
        finalXp: 0,
      });
    }
  }, [targetGuest]);

  // Grill automatic sizzling loop
  useEffect(() => {
    if (cooking.station !== 'grill' || cooking.evaluationComplete || !targetDish) return;
    if (cooking.dishId === 'drink') return; // Drinks don't grill!

    const interval = setInterval(() => {
      setCooking((prev) => {
        const nextProgress = prev.grillProgress + 4; // rising heat
        if (nextProgress >= 110) {
          clearInterval(interval);
          return { ...prev, grillProgress: 110, grillStatus: 'burnt' };
        }

        let status: 'raw' | 'medium' | 'perfect' | 'overdone' | 'burnt' = 'raw';
        if (nextProgress > 85) status = 'burnt';
        else if (nextProgress > 70) status = 'overdone';
        else if (nextProgress > 45) status = 'perfect';
        else if (nextProgress > 30) status = 'medium';

        return {
          ...prev,
          grillProgress: nextProgress,
          grillStatus: status,
        };
      });
    }, 450);

    return () => clearInterval(interval);
  }, [cooking.station, cooking.dishId, cooking.evaluationComplete, targetDish]);

  // Drink dispenser hold trigger loop
  useEffect(() => {
    if (!dispensing || cooking.station !== 'drink') return;

    const interval = setInterval(() => {
      setCooking((prev) => {
        const nextFill = Math.min(120, prev.drinkFill + 3); // can overflow!
        return {
          ...prev,
          drinkFill: nextFill,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [dispensing, cooking.station]);

  if (!targetGuest || !targetDish) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white">
        <AlertCircle className="w-16 h-16 text-pink-400 mb-4 animate-bounce-subtle" />
        <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">NO ACTIVE IN-SUITE ORDERS</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
          Arriving guests must be checked in and assigned a suite before placing food requests.
        </p>
        <button 
          onClick={onBackToHotel}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-500 font-sans font-black tracking-widest rounded-2xl text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all cursor-pointer"
        >
          RETURN TO HOTEL LOBBY
        </button>
      </div>
    );
  }

  // Grill Flipping action
  const handleFlip = () => {
    // Check accuracy based on optimal flip window
    let accuracyLoss = 0;
    if (cooking.grillStatus === 'raw') accuracyLoss = 40;
    else if (cooking.grillStatus === 'medium') accuracyLoss = 15;
    else if (cooking.grillStatus === 'perfect') accuracyLoss = 0;
    else if (cooking.grillStatus === 'overdone') accuracyLoss = 25;
    else if (cooking.grillStatus === 'burnt') accuracyLoss = 50;

    setCooking((prev) => ({
      ...prev,
      grillSide: prev.grillSide === 1 ? 2 : 1,
      grillProgress: 0, // reset heat for other side
      grillStatus: 'raw',
      cookAccuracy: Math.max(10, prev.cookAccuracy - accuracyLoss),
    }));
  };

  // Build Ingredient Adder
  const handleAddIngredient = (ing: string) => {
    if (cooking.ingredientsAdded.includes(ing)) return; // No duplicates
    setCooking((prev) => ({
      ...prev,
      ingredientsAdded: [...prev.ingredientsAdded, ing],
    }));
  };

  // Serve & Evaluate Cooking Quality Score card!
  const handleServeEvaluation = () => {
    // 1. Grill/Cook accuracy (omit for drink)
    let grillScore = 100;
    if (cooking.dishId !== 'drink') {
      grillScore = cooking.cookAccuracy;
      // If serve without flipping at least once, penalize
      if (cooking.grillSide === 1) grillScore = Math.max(10, grillScore - 30);
    }

    // 2. Ingredients/Toppings Accuracy
    const requiredToppings = targetDish.ingredients;
    const includedCount = cooking.ingredientsAdded.filter(x => requiredToppings.includes(x)).length;
    const toppingsScore = (includedCount / requiredToppings.length) * 100;

    // 3. Drink Precision Score (if drink)
    let drinkScore = 100;
    if (cooking.dishId === 'drink') {
      const fill = cooking.drinkFill;
      if (fill >= 90 && fill <= 100) drinkScore = 100; // Perfect pour
      else if (fill > 100) drinkScore = Math.max(10, 100 - (fill - 100) * 3); // overflow
      else drinkScore = Math.max(10, fill); // underfill
      
      // Straw and ice check
      if (!cooking.drinkIce) drinkScore = Math.max(10, drinkScore - 15);
      if (!cooking.drinkStraw) drinkScore = Math.max(10, drinkScore - 15);
    }

    // Overall Average Quality Percentage
    const finalScore = Math.floor(
      cooking.dishId === 'drink' 
        ? (toppingsScore + drinkScore) / 2 
        : (grillScore + toppingsScore) / 2
    );

    // Calculate payouts
    const basePrice = targetDish.price;
    const ratingStars = Math.max(1, Math.min(5, (finalScore / 100) * 5));
    const finalTip = Math.floor((finalScore / 100) * basePrice * 0.45 * targetGuest.tipMultiplier);
    const finalXp = Math.floor((finalScore / 100) * 35);

    setCooking((prev) => ({
      ...prev,
      evaluationComplete: true,
      finalScore,
      finalTip,
      finalXp,
    }));
  };

  const handleClaimPayout = () => {
    const totalEarnings = targetDish.price + cooking.finalTip;
    const computedRating = Math.max(1.0, Math.min(5.0, (cooking.finalScore / 100) * 5));
    
    // Call parent to credit values
    onCompleteCooking(targetGuest.id, computedRating, totalEarnings);
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans relative">
      
      {/* Background glow flares */}
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      {/* ==================== KITCHEN HEADER ==================== */}
      <header className="relative z-10 w-full bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHotel}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 hover:border-pink-500 hover:text-pink-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans text-base font-black tracking-wider text-pink-400 uppercase">
              🏨 SUITE SIZZLE KITCHEN
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Papa&apos;s style precision cooking engine
            </p>
          </div>
        </div>

        {/* Current Order Ticket Header banner */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-2xl shadow-inner max-w-sm">
          <div className="text-2xl">{targetDish.icon}</div>
          <div className="text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">PREPARING FOR:</span>
            <p className="text-xs font-extrabold text-slate-200">
              {targetGuest.name} (Room {targetGuest.roomNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl">
          <Clock className="w-4 h-4 text-pink-400 animate-spin" />
          <span className="font-mono text-xs font-black text-slate-300">TIME REMAINING: {Math.floor(targetGuest.patience)}%</span>
        </div>
      </header>

      {/* ==================== COOKING WORKSPACE STAGE ==================== */}
      <main className="flex-1 w-full grid grid-cols-12 overflow-hidden bg-slate-900/40 relative z-10">
        
        {/* LEFT COLUMN SIDEBAR: STATION SWITCHER (2 cols) */}
        <section className="col-span-2 bg-slate-950 border-r border-slate-850 p-3 flex flex-col gap-2 shadow-xl">
          <div className="text-center pb-2 border-b border-slate-900 mb-2">
            <span className="font-sans text-[10px] font-black text-slate-500 tracking-widest uppercase">STATIONS</span>
          </div>

          <button
            onClick={() => setCooking((p) => ({ ...p, station: 'prep' }))}
            className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
              cooking.station === 'prep' 
                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">🥣</span>
            <span>1. Prep</span>
          </button>

          <button
            disabled={cooking.dishId === 'drink'}
            onClick={() => setCooking((p) => ({ ...p, station: 'grill' }))}
            className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex flex-col items-center gap-1 ${
              cooking.dishId === 'drink' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${
              cooking.station === 'grill' 
                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">🔥</span>
            <span>2. Grill</span>
          </button>

          <button
            onClick={() => setCooking((p) => ({ ...p, station: 'build' }))}
            className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
              cooking.station === 'build' 
                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">🧱</span>
            <span>3. Build</span>
          </button>

          <button
            onClick={() => setCooking((p) => ({ ...p, station: 'drink' }))}
            className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
              cooking.station === 'drink' 
                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">🥤</span>
            <span>4. Soda</span>
          </button>

          <button
            onClick={() => setCooking((p) => ({ ...p, station: 'serve' }))}
            className={`mt-auto w-full py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all flex flex-col items-center gap-1 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer ${
              cooking.station === 'serve' ? 'bg-emerald-500 text-white border-transparent' : ''
            }`}
          >
            <span className="text-lg">🛎️</span>
            <span>5. Serve</span>
          </button>
        </section>

        {/* CENTER STAGE VIEWPORT (7 cols) */}
        <section className="col-span-7 bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden border-r border-slate-850">
          
          {/* 1. PREP STATION SCREEN */}
          {cooking.station === 'prep' && (
            <div className="flex flex-col items-center text-center max-w-sm animate-scale-up">
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-5xl mb-4 shadow-lg">
                🥣
              </div>
              <h3 className="font-sans text-lg font-black tracking-wide text-slate-100 uppercase mb-2">
                PREPARATION &amp; WEIGHING
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-6">
                Pour clean ingredients onto the prep tray. This raw plate will be ready to transfer to the grill and ovens.
              </p>

              <button 
                onClick={() => setCooking((p) => ({ ...p, station: 'grill' }))}
                disabled={cooking.dishId === 'drink'}
                className={`flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-sans font-black tracking-wider rounded-2xl text-xs shadow-lg transition-all cursor-pointer`}
              >
                <span>PROCEED TO GRILL STATION</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. GRILL/COOK STATION SCREEN */}
          {cooking.station === 'grill' && (
            <div className="flex flex-col items-center w-full max-w-md animate-scale-up">
              {/* Sizzling Grill Frame */}
              <div className="relative w-full h-44 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-inner overflow-hidden mb-6">
                {/* Sizzling visual circles */}
                <div className="absolute inset-0 bg-radial from-slate-900 via-slate-900 to-red-950/15"></div>
                
                {/* Grill iron grids */}
                <div className="absolute inset-x-0 inset-y-2 flex flex-col justify-between opacity-15">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-full h-[1px] bg-white"></div>
                  ))}
                </div>

                {/* Sizzling food items */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    
                    {/* Cooking Alert Indicators */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase text-slate-900 ${
                        cooking.grillStatus === 'raw' ? 'bg-slate-400' :
                        cooking.grillStatus === 'medium' ? 'bg-amber-400' :
                        cooking.grillStatus === 'perfect' ? 'bg-emerald-400 animate-ping' :
                        cooking.grillStatus === 'overdone' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {cooking.grillStatus === 'perfect' ? '⭐ PERFECT' : cooking.grillStatus}
                      </span>
                    </div>

                    {/* Sizzling food piece model with rotating animation */}
                    <div className="w-24 h-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl shadow-2xl relative group cursor-pointer">
                      {cooking.dishId === 'burger' && '🥩'}
                      {cooking.dishId === 'pizza' && '🍕'}
                      {cooking.dishId === 'steak' && '🥩'}
                      {cooking.dishId === 'pancakes' && '🥞'}
                      
                      {/* Flip index marker */}
                      <span className="absolute bottom-1 right-2 bg-slate-900/80 text-[8px] font-mono border border-slate-800 px-1 rounded-full">
                        SIDE {cooking.grillSide}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accuracy progress bar */}
                <div className="relative z-10 w-full flex flex-col">
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        cooking.grillProgress > 85 ? 'bg-red-500' :
                        cooking.grillProgress > 70 ? 'bg-orange-400' :
                        cooking.grillProgress > 45 ? 'bg-emerald-500' :
                        cooking.grillProgress > 30 ? 'bg-amber-400' : 'bg-slate-400'
                      }`}
                      style={{ width: `${cooking.grillProgress}%` }}
                    ></div>
                    {/* Perfect target marker */}
                    <div className="absolute top-0 bottom-0 left-[45%] right-[70%] bg-white/20 border-r border-l border-white/50"></div>
                  </div>
                </div>
              </div>

              {/* Grill interactions */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={handleFlip}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-sans font-black text-xs tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  FLIP OVER PATTY
                </button>

                <button
                  onClick={() => setCooking((p) => ({ ...p, station: 'build' }))}
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-sans font-black text-xs tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>TO TOPPINGS BUILD</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. BUILD/PLATE STATION SCREEN */}
          {cooking.station === 'build' && (
            <div className="flex flex-col items-center w-full max-w-md animate-scale-up">
              <h3 className="font-sans text-xs font-black tracking-wider text-slate-500 uppercase mb-4 text-center">
                3. TOPPING ASSEMBLY BAR
              </h3>

              {/* Large central plate assembly preview */}
              <div className="w-full h-44 bg-slate-900 border border-slate-850 rounded-3xl relative flex flex-col items-center justify-center p-4 shadow-inner mb-6">
                
                {/* Plate model */}
                <div className="w-36 h-36 rounded-full bg-slate-950 border-4 border-slate-850 flex flex-col items-center justify-center relative p-1">
                  
                  {/* Overlay stack of currently added food elements */}
                  {cooking.ingredientsAdded.length === 0 ? (
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Empty Plate</span>
                  ) : (
                    <div className="flex flex-col-reverse items-center justify-center absolute inset-0 text-3xl">
                      {cooking.ingredientsAdded.map((ing, i) => (
                        <div 
                          key={ing}
                          className="font-bold -my-2.5 drop-shadow-md animate-scale-up"
                        >
                          {ing === 'Bun' && '🍔'}
                          {ing === 'Beef Patty' && '🥩'}
                          {ing === 'Cheddar Cheese' && '🧀'}
                          {ing === 'Lettuce' && '🥬'}
                          {ing === 'Tomato Sauce' && '🥫'}
                          {ing === 'Dough' && '🫓'}
                          {ing === 'Marinara Sauce' && '🥫'}
                          {ing === 'Mozzarella Cheese' && '🧀'}
                          {ing === 'Pepperoni Slice' && '🍕'}
                          {ing === 'Ribeye Cut' && '🥩'}
                          {ing === 'Garlic Butter' && '🧈'}
                          {ing === 'Rosemary Sprig' && '🌿'}
                          {ing === 'Asparagus Sides' && '🥦'}
                          {ing === 'Batter Pour' && '🥞'}
                          {ing === 'Maple Syrup' && '🍯'}
                          {ing === 'Butter Cube' && '🧈'}
                          {ing === 'Blueberries' && '🫐'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recipe specific ingredients toggles */}
              <div className="w-full">
                <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider text-left">
                  TAP INGREDIENTS TO ADD:
                </p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {targetDish.ingredients.map((ing) => {
                    const added = cooking.ingredientsAdded.includes(ing);
                    return (
                      <button
                        key={ing}
                        onClick={() => handleAddIngredient(ing)}
                        disabled={added}
                        className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all tracking-wider ${
                          added 
                            ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed' 
                            : 'bg-slate-800 border border-slate-700 hover:border-pink-500 hover:text-pink-400 cursor-pointer'
                        }`}
                      >
                        {ing}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCooking((p) => ({ ...p, ingredientsAdded: [] }))}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    CLEAR PLATE
                  </button>

                  <button
                    onClick={() => setCooking((p) => ({ ...p, station: 'drink' }))}
                    className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    <span>GO TO DRINKS</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. DRINK/SODA STATION SCREEN */}
          {cooking.station === 'drink' && (
            <div className="flex flex-col items-center w-full max-w-sm animate-scale-up">
              <h3 className="font-sans text-xs font-black tracking-wider text-slate-500 uppercase mb-4 text-center">
                4. BEVERAGE DISPENSER BAR
              </h3>

              {/* Beverage Dispenser nozzle and cup fill preview */}
              <div className="w-full h-44 bg-slate-900 border border-slate-850 rounded-3xl relative flex flex-col items-center justify-end p-4 shadow-inner mb-6">
                
                {/* Dispenser nozzle head */}
                <div className="absolute top-0 w-16 h-8 bg-slate-950 border-b-2 border-slate-800 rounded-b-xl flex flex-col justify-end">
                  <div className="w-3 h-2 bg-slate-800 mx-auto rounded-full"></div>
                </div>

                {/* Liquid pour stream animation */}
                {dispensing && (
                  <div className="absolute top-8 bottom-12 w-1.5 bg-gradient-to-b from-cyan-400 to-sky-500 animate-pulse"></div>
                )}

                {/* Soda Cup model */}
                <div className="w-24 h-24 bg-slate-950 border-r-2 border-l-2 border-slate-800 rounded-b-xl relative overflow-hidden p-0.5 flex flex-col justify-end">
                  {/* Soda mixture liquid block */}
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-500/80 to-sky-400/90 rounded-b-lg transition-all duration-75"
                    style={{ height: `${Math.min(100, cooking.drinkFill)}%` }}
                  >
                    {/* Bubbles particle animation */}
                    {dispensing && (
                      <div className="w-full h-full relative">
                        <span className="absolute bottom-2 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"></span>
                        <span className="absolute bottom-4 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping [animation-delay:0.3s]"></span>
                      </div>
                    )}
                  </div>

                  {/* Glass rim lines */}
                  <div className="absolute top-1 border-t border-slate-700/60 inset-x-2"></div>
                  
                  {/* Interactive Ice Cube and Straw indicators inside cup */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 text-xl pointer-events-none">
                    {cooking.drinkIce && <span>🧊</span>}
                    {cooking.drinkStraw && <span>🥤</span>}
                  </div>
                </div>
              </div>

              {/* Pour button controls and accessories */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex gap-2.5">
                  <button
                    onMouseDown={() => setDispensing(true)}
                    onMouseUp={() => setDispensing(false)}
                    onMouseLeave={() => setDispensing(false)}
                    onTouchStart={() => setDispensing(true)}
                    onTouchEnd={() => setDispensing(false)}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:scale-[1.02] text-white font-sans font-black text-xs tracking-widest rounded-2xl shadow-lg transition-all select-none cursor-pointer"
                  >
                    HOLD TO POUR SODA ({cooking.drinkFill}%)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCooking((p) => ({ ...p, drinkIce: !p.drinkIce }))}
                    className={`py-2 rounded-xl font-bold text-[10px] tracking-wide transition-all ${
                      cooking.drinkIce 
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300' 
                        : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    {cooking.drinkIce ? '🧊 ICE ADDED' : 'ADD ICE'}
                  </button>

                  <button
                    onClick={() => setCooking((p) => ({ ...p, drinkStraw: !p.drinkStraw }))}
                    className={`py-2 rounded-xl font-bold text-[10px] tracking-wide transition-all ${
                      cooking.drinkStraw 
                        ? 'bg-pink-500/15 border-pink-400 text-pink-300' 
                        : 'bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    {cooking.drinkStraw ? '🥤 STRAW ADDED' : 'ADD STRAW'}
                  </button>
                </div>

                <button
                  onClick={() => setCooking((p) => ({ ...p, station: 'serve' }))}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-sans font-black text-xs tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>TO SERVING BOARD</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 5. SERVE / RESULT SCORECARD SCREEN */}
          {cooking.station === 'serve' && (
            <div className="flex flex-col items-center text-center max-w-sm animate-scale-up">
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-5xl mb-4 shadow-lg">
                🛎️
              </div>
              <h3 className="font-sans text-lg font-black tracking-wide text-slate-100 uppercase mb-2">
                READY FOR SERVICE EVALUATION
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-6">
                Ring the reception bell to dispatch your seared {targetDish.name} straight up the suites via room-service elevator!
              </p>

              <button 
                onClick={handleServeEvaluation}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.03] text-white font-sans font-black tracking-widest rounded-2xl text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer animate-pulse-glow"
              >
                <CheckCircle2 className="w-4 h-4" />
                RING BELL &amp; SERVE GUEST
              </button>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN SIDEBAR: CURRENT ORDER TICKET (3 cols) */}
        <section className="col-span-3 bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Visual Order ticket */}
          <div className="relative w-full bg-white text-slate-900 rounded-2xl p-4 shadow-xl border-t-[8px] border-pink-500 font-sans flex flex-col justify-between min-h-[340px]">
            {/* Ticket Header */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-slate-300">
                <span className="text-[10px] font-black tracking-wider text-slate-400 font-mono">TICKET #SH-102</span>
                <span className="text-[10px] font-black bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-md font-mono">VIP</span>
              </div>

              {/* Guest / Suite details */}
              <div className="py-3 text-left">
                <p className="text-xs font-extrabold text-slate-800">ROOM: {targetGuest.roomNumber}</p>
                <p className="text-[10px] font-bold text-slate-400">CUSTOMER: {targetGuest.name}</p>
              </div>

              {/* Requested Dish */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{targetDish.icon}</span>
                  <span className="text-xs font-black text-slate-900 tracking-tight">{targetDish.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">{targetDish.description}</p>
              </div>

              {/* Recipe list details */}
              <div className="text-left">
                <p className="text-[9px] font-black tracking-wide text-slate-400 uppercase mb-1 font-mono">RECIPE INGREDIENTS:</p>
                <ul className="flex flex-col gap-1">
                  {targetDish.ingredients.map((ing) => (
                    <li key={ing} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Price Badge */}
            <div className="border-t-2 border-dashed border-slate-300 pt-3 mt-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 font-mono">TOTAL RENT:</span>
              <span className="text-xs font-black text-slate-900 font-mono">${targetDish.price}</span>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== TYCOON COOKING EVALUATION SCORECARD MODAL ==================== */}
      {cooking.evaluationComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-up text-center flex flex-col items-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-bounce-subtle">
              👑
            </div>

            <h2 className="font-sans text-xl font-black text-emerald-400 uppercase tracking-widest mb-1">
              COOKING COMPLETED
            </h2>
            <p className="text-xs text-slate-400 mb-6 max-w-xs leading-normal">
              Excellent hustle! Here is your hospitality evaluation sheet based on precision and culinary timings.
            </p>

            {/* Score lists */}
            <div className="w-full bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex flex-col gap-3 mb-6 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-sans font-bold">COOK QUALITY:</span>
                <span className="font-black text-white">{cooking.finalScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${cooking.finalScore}%` }}></div>
              </div>

              <div className="h-[1px] bg-slate-900 my-1"></div>

              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-slate-400">BASE PRICE:</span>
                <span className="font-mono font-black text-slate-300">${targetDish.price}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  SUITE TIPS:
                </span>
                <span className="font-mono font-black text-emerald-400">+${cooking.finalTip}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-pink-400">EXP EARNED:</span>
                <span className="font-mono font-black text-pink-400">+{cooking.finalXp} XP</span>
              </div>
            </div>

            <button
              onClick={handleClaimPayout}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-fuchsia-600 rounded-2xl font-sans text-xs font-black tracking-widest text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-yellow-300/20 active:scale-95 transition-all cursor-pointer flex justify-center items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              CLAIM PAYOUT &amp; DISPATCH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
