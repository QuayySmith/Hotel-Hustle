/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ScreenType, CustomerOrder, Patty, FryerBasket, PizzaState, MilkshakeState, DrinkState, Upgrade, GameReview 
} from './types';
import { 
  CUSTOMER_PROFILES, INITIAL_UPGRADES 
} from './data';

import { playSound, startMusic, stopMusic } from './lib/audio';

import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import OrderStation from './components/OrderStation';
import GrillStation from './components/GrillStation';
import BuildStation from './components/BuildStation';
import FryerStation from './components/FryerStation';
import PizzaStation from './components/PizzaStation';
import MilkshakeStation from './components/MilkshakeStation';
import DrinkStation from './components/DrinkStation';
import PackagingStation from './components/PackagingStation';
import ServeStation from './components/ServeStation';
import UpgradesView from './components/UpgradesView';
import ReviewsView from './components/ReviewsView';

import { 
  Clipboard, 
  Flame, 
  Layers, 
  DollarSign, 
  BookOpen, 
  Settings, 
  Award,
  LogOut,
  ChevronRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('loading');
  const [activeStation, setActiveStation] = useState<string>('order');
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'station'>('dashboard');
  const [activeModal, setActiveModal] = useState<'none' | 'breakfast' | 'dessert' | 'employees' | 'storage'>('none');
  const [seconds, setSeconds] = useState<number>(135);

  const [money, setMoney] = useState<number>(60.00);
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);

  // Central gameplay states
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [patties, setPatties] = useState<Patty[]>([]);
  const [baskets, setBaskets] = useState<FryerBasket[]>([]);
  const [pizza, setPizza] = useState<PizzaState>({
    step: 'stretch',
    hasSauce: false,
    hasCheese: false,
    toppings: [],
    isBaking: false,
    bakeProgress: 0,
    isBakeCompleted: false,
    isSliced: false,
    isBurnt: false,
  });
  const [shake, setShake] = useState<MilkshakeState>({
    step: 'cup',
    cupSelected: false,
    flavor: null,
    isBlending: false,
    isBlended: false,
    hasWhippedCream: false,
    hasCherry: false,
  });
  const [drink, setDrink] = useState<DrinkState>({
    step: 'size',
    size: null,
    hasIce: false,
    flavor: null,
    fillProgress: 0,
    isOverflowed: false,
  });

  // Takeout bag and Tray state
  const [completedTray, setCompletedTray] = useState<string[]>([]);
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [isBagSealed, setIsBagSealed] = useState<boolean>(false);

  const [waitingCustomers, setWaitingCustomers] = useState<{
    name: string;
    emoji: string;
    color: string;
    patience: number;
    favoriteBurgerName: string;
  }[]>([]);
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [reviews, setReviews] = useState<GameReview[]>([]);

  const hasJukebox = upgrades.find((u) => u.id === 'jukebox')?.purchased;
  const hasNeonSign = upgrades.find((u) => u.id === 'neon_sign')?.purchased;

  // ==================== MUSIC CONTROL ====================
  useEffect(() => {
    if (musicOn && screen === 'gameplay') {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [musicOn, screen]);

  // ==================== SESSION CLOCK TIMER ====================
  useEffect(() => {
    if (screen !== 'gameplay') return;
    const t = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 135));
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==================== RESTORE FROM LOCALSTORAGE ====================
  useEffect(() => {
    try {
      const savedMoney = localStorage.getItem('qf_money');
      const savedUpgrades = localStorage.getItem('qf_upgrades');
      const savedReviews = localStorage.getItem('qf_reviews');
      const savedLevel = localStorage.getItem('qf_level');
      const savedXp = localStorage.getItem('qf_xp');

      if (savedMoney) setMoney(Number(savedMoney));
      if (savedLevel) setLevel(Number(savedLevel));
      if (savedXp) setXp(Number(savedXp));
      if (savedUpgrades) {
        const parsed = JSON.parse(savedUpgrades);
        if (parsed && parsed.length > 0) setUpgrades(parsed);
      }
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (parsed && parsed.length > 0) setReviews(parsed);
      }
    } catch (e) {
      console.error("Failed to parse game saves:", e);
    }

    // Greet a starter customer
    setWaitingCustomers([
      {
        name: "Lord Reginald",
        emoji: "🎩",
        color: "from-slate-700 to-slate-900",
        patience: 100,
        favoriteBurgerName: "Aristocrat Feast"
      }
    ]);
  }, []);

  const saveProgressToLocal = (
    currentMoney: number, 
    currentUpgrades: Upgrade[], 
    currentReviews: GameReview[],
    currentLvl: number,
    currentXp: number
  ) => {
    try {
      localStorage.setItem('qf_money', currentMoney.toString());
      localStorage.setItem('qf_upgrades', JSON.stringify(currentUpgrades));
      localStorage.setItem('qf_reviews', JSON.stringify(currentReviews));
      localStorage.setItem('qf_level', currentLvl.toString());
      localStorage.setItem('qf_xp', currentXp.toString());
    } catch (e) {
      console.error("Local storage write failed:", e);
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setMoney(60.00);
    setLevel(1);
    setXp(0);
    setUpgrades(INITIAL_UPGRADES);
    setReviews([]);
    setOrders([]);
    setPatties([]);
    setBaskets([]);
    setCompletedTray([]);
    setPackedItems([]);
    setIsBagSealed(false);
    setWaitingCustomers([
      {
        name: "Lord Reginald",
        emoji: "🎩",
        color: "from-slate-700 to-slate-900",
        patience: 100,
        favoriteBurgerName: "Aristocrat Feast"
      }
    ]);
    playSound('fail');
  };

  // ==================== PATIENCE AND SPARK SPARK LOOP ====================
  useEffect(() => {
    if (screen !== 'gameplay') return;

    const interval = setInterval(() => {
      const decayFactor = hasJukebox ? 0.65 : 1.0;

      // 1. Decelerate patience for counter lines
      setWaitingCustomers((prev) => {
        return prev.map((c) => ({
          ...c,
          patience: Math.max(0, c.patience - 1.4 * decayFactor)
        })).filter((c) => {
          if (c.patience <= 0) {
            playSound('fail');
            return false;
          }
          return true;
        });
      });

      // 2. Decelerate patience for active tickets
      setOrders((prev) => {
        return prev.map((o) => ({
          ...o,
          patience: Math.max(0, o.patience - 0.85 * decayFactor)
        })).filter((o) => {
          if (o.patience <= 0) {
            playSound('fail');
            return false; // Customer left the queue!
          }
          return true;
        });
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [screen, hasJukebox]);

  // Customer Line spawner ticker (Generates a new guest every 16 seconds)
  useEffect(() => {
    if (screen !== 'gameplay') return;

    const spawner = setInterval(() => {
      setWaitingCustomers((prev) => {
        if (prev.length >= 3) return prev; // lobby counter max 3 people

        const profileIdx = Math.floor(Math.random() * CUSTOMER_PROFILES.length);
        const profile = CUSTOMER_PROFILES[profileIdx];
        
        // No duplicate guest avatars in lobby simultaneously
        if (prev.some((c) => c.name === profile.name)) return prev;

        const newGuest = {
          name: profile.name,
          emoji: profile.emoji,
          color: profile.color,
          patience: 100,
          favoriteBurgerName: profile.name === "Jojo the Critic" ? "Chef's Critique Burger" : "The Original Foodaria Bun"
        };

        playSound('chime');
        return [...prev, newGuest];
      });
    }, 16000);

    return () => clearInterval(spawner);
  }, [screen]);

  // ==================== IN-GAME STATE TRIGGERS ====================
  const handleTakeOrder = (customerIdx: number) => {
    const customer = waitingCustomers[customerIdx];
    if (!customer) return;

    // Remove from counter line
    setWaitingCustomers((prev) => prev.filter((_, idx) => idx !== customerIdx));

    // Look up what they order
    const profile = CUSTOMER_PROFILES.find(p => p.name === customer.name) || CUSTOMER_PROFILES[0];

    // Build randomized ticket items based on profile preferences
    const hasBurger = profile.ordersBurger;
    const hasFries = profile.ordersFries;
    const hasPizza = profile.ordersPizza;
    const hasShake = profile.ordersMilkshake;
    const hasDrink = profile.ordersDrink;

    const burger = hasBurger ? {
      id: Math.random().toString(),
      pattiesCount: 1,
      doneness: (profile.burgerDoneness || 'medium') as 'rare' | 'medium' | 'well',
      layers: profile.burgerRecipe || ['bun_bottom', 'patty', 'cheese', 'bun_top']
    } : undefined;

    const fries = hasFries ? {
      isSalted: false,
      isPackaged: false
    } : undefined;

    const pizzaOrder = hasPizza ? {
      toppings: profile.pizzaToppings || ['pepperoni']
    } : undefined;

    const milkshake = hasShake ? {
      size: 'Medium' as 'Medium' | 'Large',
      flavor: (profile.shakeFlavor === 'chocolate' ? 'Chocolate' : profile.shakeFlavor === 'strawberry' ? 'Strawberry' : 'Vanilla') as 'Chocolate' | 'Strawberry' | 'Vanilla'
    } : undefined;

    const drinkOrder = hasDrink ? {
      size: 'Medium' as 'Medium' | 'Large',
      flavor: (profile.drinkFlavor === 'cola' ? 'Cola' : profile.drinkFlavor === 'lime' ? 'Lemon Lime' : 'Orange Soda') as 'Cola' | 'Lemon Lime' | 'Orange Soda'
    } : undefined;

    const newTicket: CustomerOrder = {
      id: Math.random().toString(),
      customerName: customer.name,
      avatarEmoji: customer.emoji,
      avatarColor: customer.color,
      patience: 100,
      patienceMax: 100,
      favoriteBurgerName: customer.favoriteBurgerName,
      burger,
      fries,
      pizza: pizzaOrder,
      milkshake,
      drink: drinkOrder,
      isReviewer: profile.isReviewer
    };

    setOrders((prev) => [...prev, newTicket]);
  };

  // 1. Grill Station actions
  const handleAddPattyToGrill = (slotIndex: number, targetDoneness: 'rare' | 'medium' | 'well') => {
    const newPatty: Patty = {
      id: Math.random().toString(),
      side1Cooked: 0,
      side2Cooked: 0,
      isFlipped: false,
      grillIndex: slotIndex,
      targetDoneness,
      isBurnt: false,
    };
    setPatties((prev) => [...prev, newPatty]);
  };

  const handleFlipPatty = (pattyId: string) => {
    setPatties((prev) =>
      prev.map((p) => (p.id === pattyId ? { ...p, isFlipped: true } : p))
    );
  };

  const handleRemovePattyFromGrill = (pattyId: string) => {
    setPatties((prev) =>
      prev.map((p) => (p.id === pattyId ? { ...p, grillIndex: null } : p))
    );
  };

  // 2. Fryer Station actions
  const handleAddBasketToFryer = (slotIdx: number) => {
    const newBasket: FryerBasket = {
      id: Math.random().toString(),
      cookedProgress: 0,
      isFrying: true,
      isPulledUp: false,
      isSalted: false,
      isPackaged: false,
    };
    // Ensure array is sized correctly
    setBaskets((prev) => {
      const next = [...prev];
      next[slotIdx] = newBasket;
      return next;
    });
  };

  const handleCompleteFries = (basketId: string) => {
    setBaskets((prev) => prev.filter((b) => b.id !== basketId));
    setCompletedTray((prev) => [...prev, 'fries']);
  };

  // 3. Burger build completed action
  const handleCompleteBurger = (orderId: string, layers: string[], pattyId: string | null) => {
    // Remove the patty from inventory
    if (pattyId) {
      setPatties((prev) => prev.filter((p) => p.id !== pattyId));
    }
    setCompletedTray((prev) => [...prev, 'burger']);
  };

  // 4. Pizza completed action
  const handleCompletePizza = () => {
    setPizza({
      step: 'stretch',
      hasSauce: false,
      hasCheese: false,
      toppings: [],
      isBaking: false,
      bakeProgress: 0,
      isBakeCompleted: false,
      isSliced: false,
      isBurnt: false,
    });
    setCompletedTray((prev) => [...prev, 'pizza']);
  };

  // 5. Milkshake completed action
  const handleCompleteShake = () => {
    setShake({
      step: 'cup',
      cupSelected: false,
      flavor: null,
      isBlending: false,
      isBlended: false,
      hasWhippedCream: false,
      hasCherry: false,
    });
    setCompletedTray((prev) => [...prev, 'milkshake']);
  };

  // 6. Drink completed action
  const handleCompleteDrink = () => {
    setDrink({
      step: 'size',
      size: null,
      hasIce: false,
      flavor: null,
      fillProgress: 0,
      isOverflowed: false,
    });
    setCompletedTray((prev) => [...prev, 'drink']);
  };

  // 7. Packaging Station actions
  const handlePackItem = (itemType: string) => {
    setCompletedTray((prev) => {
      const idx = prev.indexOf(itemType);
      if (idx > -1) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      return prev;
    });
    setPackedItems((prev) => [...prev, itemType]);
  };

  const handleUnpackItem = (itemType: string) => {
    setPackedItems((prev) => {
      const idx = prev.indexOf(itemType);
      if (idx > -1) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      return prev;
    });
    setCompletedTray((prev) => [...prev, itemType]);
  };

  const handleSealBag = (stickerName: string) => {
    setIsBagSealed(true);
  };

  const handleResetBag = () => {
    // Return packed items to tray
    setCompletedTray((prev) => [...prev, ...packedItems]);
    setPackedItems([]);
    setIsBagSealed(false);
  };

  // 8. Serve Station completed action
  const handleServeBag = (orderId: string, stars: number, tipAmount: number, reviewText: string) => {
    const ticket = orders.find(o => o.id === orderId);
    if (!ticket) return;

    // Deduct ticket
    setOrders((prev) => prev.filter(o => o.id !== orderId));

    // Clear packing items
    setPackedItems([]);
    setIsBagSealed(false);

    // Calculate progression rewards
    const netTip = hasNeonSign ? tipAmount * 1.25 : tipAmount;
    const finalReward = 15.00 + netTip;
    
    const xpReward = stars * 15;
    const nextXp = xp + xpReward;
    const nextLevel = Math.floor(nextXp / 100) + 1;

    setMoney((prev) => prev + finalReward);
    setXp(nextXp);
    setLevel(nextLevel);

    // Add review
    const newReview: GameReview = {
      id: Math.random().toString(),
      customerName: ticket.customerName,
      avatarEmoji: ticket.avatarEmoji,
      avatarColor: ticket.avatarColor,
      burgerName: ticket.favoriteBurgerName,
      overallScore: stars * 20,
      waitScore: Math.round(ticket.patience),
      grillScore: 90,
      buildScore: 95,
      feedback: reviewText,
      tip: parseFloat(netTip.toFixed(2))
    };

    const nextReviews = [newReview, ...reviews].slice(0, 30);
    setReviews(nextReviews);

    saveProgressToLocal(money + finalReward, upgrades, nextReviews, nextLevel, nextXp);
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const item = upgrades.find(u => u.id === upgradeId);
    if (!item || money < item.cost) {
      playSound('fail');
      return;
    }

    const nextMoney = money - item.cost;
    const nextUpgrades = upgrades.map(u => u.id === upgradeId ? { ...u, purchased: true } : u);

    setMoney(nextMoney);
    setUpgrades(nextUpgrades);
    playSound('powerup');

    saveProgressToLocal(nextMoney, nextUpgrades, reviews, level, xp);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0e0a1b] text-white select-none">
      
      {screen === 'loading' && (
        <LoadingScreen onComplete={() => setScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MainMenu
          onPlay={() => { setScreen('gameplay'); setViewMode('dashboard'); }}
          onContinue={() => { setScreen('gameplay'); setViewMode('dashboard'); }}
          soundOn={soundOn}
          musicOn={musicOn}
          onToggleSound={() => setSoundOn(!soundOn)}
          onToggleMusic={() => setMusicOn(!musicOn)}
          onResetData={handleResetData}
          hasSavedData={money !== 60.00 || level > 1 || reviews.length > 0}
        />
      )}

      {screen === 'gameplay' && (
        viewMode === 'dashboard' ? (
          /* ==================== 1. GORGEOUS BENTO GRID DASHBOARD ==================== */
          <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#110b27] via-[#0a061b] to-[#140b20] p-4 flex flex-col justify-between font-sans selection:bg-purple-500/25">
            
            {/* Top Dashboard HUD / Navigation Bar */}
            <header className="relative z-10 w-full bg-[#18122c]/90 border border-indigo-950/80 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-spin-slow">
                  🍔
                </div>
                <div>
                  <h1 className="font-sans font-black text-xs tracking-tight text-white leading-none">
                    QUAZZY'S FOODARIA
                  </h1>
                  <p className="font-mono text-[7.5px] text-amber-500 tracking-wider uppercase mt-0.5">🍳 DINER COMMAND CENTER &amp; RESTAURANT COCKPIT</p>
                </div>
              </div>

              {/* Central status notification */}
              <div className="hidden sm:flex items-center gap-2 bg-[#0e0a1b] border border-indigo-950 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-[8px] text-purple-300 font-bold uppercase tracking-widest">
                  KITCHEN NETWORK ONLINE
                </span>
              </div>

              {/* Sound and Menu Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { playSound('click'); setSoundOn(!soundOn); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${soundOn ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
                  title="Toggle Sounds"
                >
                  {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => { playSound('click'); setMusicOn(!musicOn); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${musicOn ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
                  title="Toggle Music"
                >
                  <Music className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => { playSound('fail'); setScreen('menu'); }}
                  className="p-1.5 bg-[#20173b] border border-red-500/20 text-red-400 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  title="Quit to Menu"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Exit</span>
                </button>
              </div>
            </header>

            {/* BENTO GRID */}
            <div className="grid grid-cols-12 gap-3.5 flex-1 w-full max-w-7xl mx-auto items-stretch">
              
              {/* CELL 1: QUAZZY'S LOGO & FLOW BLOCK */}
              <div className="col-span-12 lg:col-span-3 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-orange-500/5 blur-2xl pointer-events-none"></div>
                <div className="my-auto flex flex-col items-center">
                  <div className="relative text-center mb-1">
                    <span className="absolute -top-6 -right-2 text-2xl animate-bounce">👩‍🍳</span>
                    <h1 className="font-display text-4xl text-yellow-300 tracking-tight uppercase leading-none comic-text-stroke-sm">
                      Quazzys
                    </h1>
                    <h1 className="font-display text-3xl text-red-500 tracking-wider uppercase leading-none comic-text-stroke-sm mt-0.5">
                      Foodaria
                    </h1>
                  </div>

                  <p className="font-sans text-[10px] text-purple-200/90 text-center font-bold px-1 tracking-wide mt-2.5 leading-snug">
                    A FUN, FAST-PACED RESTAURANT GAME WITH LOTS OF FOOD, CUSTOMERS, UPGRADES &amp; ACTION!
                  </p>

                  {/* GAME FLOW SUB-BLOCK */}
                  <div className="w-full bg-[#130d22] border-2 border-indigo-950 rounded-xl p-3 mt-4 text-center">
                    <h3 className="font-sans text-[8.5px] font-black text-amber-400 tracking-widest uppercase mb-2">
                      ⚡ GAME FLOW ⚡
                    </h3>
                    <div className="grid grid-cols-6 gap-0.5 text-[8px] font-black text-purple-200/80">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">📋</span>
                        <span>ORDER</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">➜</div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">🥩</span>
                        <span>COOK</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">➜</div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">🍔</span>
                        <span>BUILD</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">➜</div>
                    </div>
                    <div className="grid grid-cols-6 gap-0.5 text-[8px] font-black text-purple-200/80 mt-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">📦</span>
                        <span>PACK</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">➜</div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">🛎️</span>
                        <span>SERVE</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">➜</div>
                      <div className="flex flex-col items-center gap-0.5 text-yellow-400 font-extrabold">
                        <span className="text-sm">💰</span>
                        <span>EARN</span>
                      </div>
                      <div className="flex items-center justify-center text-amber-500">!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CELL 2: "1. LOBBY / DINING AREA" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('order'); }}
                className="col-span-12 lg:col-span-5 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    1. LOBBY &amp; DINING ROOM
                  </span>
                  {waitingCustomers.length > 0 && (
                    <span className="px-2 py-0.5 bg-orange-500 text-slate-950 font-sans text-[8px] font-black rounded-full leading-none animate-pulse">
                      {waitingCustomers.length} IN LOBBY
                    </span>
                  )}
                </div>

                {/* VISUAL DINING MAP FLOOR */}
                <div className="flex-1 p-3 grid grid-cols-12 gap-2 relative h-32 items-center bg-[#130d22]/50">
                  {/* Decorative checkerboard floor overlay */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle, #eab308 1px, transparent 1px)`,
                      backgroundSize: '12px 12px'
                    }}
                  />

                  {/* LEFT ZONE: Dine-In Booths (6 columns) */}
                  <div className="col-span-6 border-r border-indigo-950/40 pr-2 flex flex-col gap-1.5 justify-center h-full">
                    <span className="text-[7.5px] font-black text-purple-400 tracking-wider uppercase leading-none mb-1">🪑 Seating Area</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Booth 1 */}
                      <div className="bg-[#1b1236] border border-purple-950 rounded-lg p-1 text-center relative flex flex-col items-center">
                        <span className="text-sm animate-bounce" style={{ animationDuration: '3.2s' }}>🦁</span>
                        <span className="text-[6.5px] font-mono text-slate-400">Leo 🍔</span>
                      </div>
                      {/* Booth 2 */}
                      <div className="bg-[#1b1236] border border-purple-950 rounded-lg p-1 text-center relative flex flex-col items-center">
                        <span className="text-sm animate-bounce" style={{ animationDuration: '4.1s' }}>🦊</span>
                        <span className="text-[6.5px] font-mono text-slate-400">Foxy 🥤</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT ZONE: Active Register & Waiting Line (6 columns) */}
                  <div className="col-span-6 pl-1 flex flex-col justify-between h-full">
                    <span className="text-[7.5px] font-black text-amber-400 tracking-wider uppercase leading-none mb-1">🛎️ Register Counter</span>
                    
                    <div className="flex-1 flex items-center justify-center relative">
                      {/* The checkout counter itself with register and cashier */}
                      <div className="absolute bottom-1 right-1 w-8 h-5 bg-amber-800 rounded border-t border-amber-600 flex items-center justify-center shadow-md">
                        <span className="text-[8px]">📠</span>
                      </div>
                      {/* Cashier emoji standing behind counter */}
                      <div className="absolute bottom-5 right-2 text-xs">
                        🧑‍💼
                      </div>

                      {/* Line of customers waiting */}
                      {waitingCustomers.length === 0 ? (
                        <div className="text-center pr-8 flex flex-col items-center justify-center">
                          <span className="text-sm">🛎️</span>
                          <span className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Line Clear</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center justify-end pr-9 w-full">
                          {waitingCustomers.slice(0, 3).map((cust, idx) => (
                            <div key={cust.name} className="flex flex-col items-center relative scale-80 -space-y-1">
                              {/* Speech bubble on front customer */}
                              {idx === 0 && (
                                <div className="absolute -top-3.5 bg-yellow-400 text-slate-950 font-sans text-[5.5px] font-black px-1 rounded shadow animate-pulse">
                                  ORDER!
                                </div>
                              )}
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cust.color} border border-slate-950 flex items-center justify-center text-base shadow group-hover:scale-105 transition-transform`}>
                                {cust.emoji}
                              </div>
                              <div className="w-6 h-0.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${cust.patience > 50 ? 'bg-emerald-500' : cust.patience > 25 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                                  style={{ width: `${cust.patience}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Take live counter orders, seat guests &amp; manage patience!
                </div>
              </div>

              {/* CELL 3: "2. ORDER STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('order'); }}
                className="col-span-12 lg:col-span-4 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    2. ORDER STATION
                  </span>

                  <div className="flex gap-1 items-center bg-[#130d22]/90 px-2 py-0.5 border border-indigo-950 rounded-full text-[8px] font-bold font-mono">
                    <span className="text-yellow-400">🪙 {money.toFixed(0)}</span>
                    <span className="text-purple-400">|</span>
                    <span className="text-cyan-400">⭐ {level * 10 + Math.floor(xp / 10)}</span>
                    <span className="text-purple-400">|</span>
                    <span className="text-rose-400">⏱️ {formatTime(seconds)}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-3 relative h-28">
                  {waitingCustomers.length > 0 ? (
                    <div className="w-full max-w-[170px] bg-amber-50 border-2 border-slate-900 rounded-xl p-2 flex flex-col gap-1 relative shadow-lg">
                      <div className="absolute top-0 inset-x-0 h-1 bg-[#18122c] border-b border-dashed border-slate-400"></div>
                      
                      <p className="text-[7.5px] font-black font-mono text-slate-800 uppercase tracking-wider text-center border-b border-dashed border-slate-300 pb-1 pt-1">
                        ORDER TICKET
                      </p>

                      <div className="text-[7.5px] font-sans text-slate-800 space-y-0.5 py-1 font-bold">
                        <div className="flex items-center gap-1">
                          <span>🍔</span>
                          <span>1 Double Burger (Well)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🍟</span>
                          <span>1 Fries (Crispy)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🥤</span>
                          <span>1 Cola (With Ice)</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeOrder(0);
                        }}
                        className="w-full py-0.5 bg-green-500 border border-slate-900 hover:bg-green-400 text-slate-950 font-sans text-[8px] font-black tracking-wider rounded-lg transition-all animate-pulse uppercase cursor-pointer"
                      >
                        TAKE ORDER
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl block filter drop-shadow-md">📋</span>
                      <p className="text-[9.5px] text-purple-300 font-bold uppercase tracking-wider mt-1.5">
                        Register registers open
                      </p>
                      <p className="text-[7.5px] text-purple-400">Ready to take customer tickets</p>
                    </div>
                  )}
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Take customer orders and send them to the kitchen!
                </div>
              </div>

              {/* CELL 4: "3. GRILL STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('grill'); }}
                className="col-span-12 lg:col-span-4 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    3. GRILL STATION
                  </span>
                  {patties.filter(p => p.grillIndex !== null).length > 0 && (
                    <span className="px-1.5 py-0.5 bg-orange-500 text-slate-950 font-sans text-[7.5px] font-black rounded-full animate-pulse">
                      🔥 SIZZLING
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-3 relative h-28">
                  <div className="w-11/12 h-20 bg-slate-900 border-2 border-slate-950 rounded-xl p-2 relative flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-red-600/10 rounded-xl pointer-events-none"></div>
                    
                    <div className="absolute inset-y-1 inset-x-2 flex flex-col justify-between opacity-30 pointer-events-none">
                      <div className="h-[2px] bg-slate-950 w-full"></div>
                      <div className="h-[2px] bg-slate-950 w-full"></div>
                      <div className="h-[2px] bg-slate-950 w-full"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 z-10 my-auto">
                      {[0, 1, 2].map((idx) => {
                        const patty = patties.find(p => p.grillIndex === idx);
                        return (
                          <div key={idx} className="h-10 border border-slate-950 rounded-lg flex flex-col items-center justify-center bg-slate-950/40 relative">
                            {patty ? (
                              <div className="relative flex flex-col items-center">
                                <span className="text-sm filter drop-shadow animate-wiggle">🥩</span>
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500/80 border border-slate-950 flex items-center justify-center">
                                  <span className="text-[6px] font-mono font-bold text-white">🔥</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[7px] text-slate-600 font-mono">EMPTY</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 pl-2 text-[6.5px] font-mono text-purple-400 font-bold select-none border-l border-indigo-950/60 leading-none shrink-0">
                    <span className="text-yellow-400">WELL</span>
                    <span>MED</span>
                    <span>RARE</span>
                  </div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Cook patties to the right doneness!
                </div>
              </div>

              {/* CELL 5: "4. FRYER STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('fryer'); }}
                className="col-span-12 lg:col-span-4 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    4. FRYER STATION
                  </span>
                  {baskets.filter(b => b && b.isFrying).length > 0 && (
                    <span className="px-1.5 py-0.5 bg-yellow-500 text-slate-950 font-sans text-[7.5px] font-black rounded-full animate-pulse">
                      🫧 FRYING
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-3 relative h-28">
                  <div className="w-11/12 h-20 bg-slate-900 border-2 border-slate-950 rounded-xl p-2 grid grid-cols-2 gap-2">
                    {[0, 1].map((idx) => {
                      const basket = baskets[idx];
                      const isFrying = basket && basket.isFrying;
                      return (
                        <div key={idx} className="border border-slate-950 rounded-lg bg-slate-950/60 flex flex-col items-center justify-center relative overflow-hidden">
                          {isFrying ? (
                            <>
                              <div className="absolute inset-0 bg-yellow-600/10 animate-pulse pointer-events-none"></div>
                              <span className="text-base filter drop-shadow z-10 animate-bounce">🍟</span>
                              <span className="text-[7.5px] font-mono text-yellow-400 font-bold z-10">
                                {Math.round(basket.cookedProgress)}%
                              </span>
                            </>
                          ) : (
                            <div className="text-center">
                              <span className="text-xs text-slate-600 block">📥</span>
                              <span className="text-[7px] text-slate-600 font-mono">READY</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col justify-around h-16 pl-2 text-emerald-400 text-sm font-bold shrink-0">
                    <span>▲</span>
                    <span>▼</span>
                  </div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Fry fries and wings to perfection!
                </div>
              </div>

              {/* CELL 6: "5. BUILD / TOPPING STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('build'); }}
                className="col-span-12 lg:col-span-4 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    5. BUILD / TOPPING STATION
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-3 relative h-28">
                  <div className="flex gap-1 bg-[#130d22] border border-indigo-950 px-2 py-0.5 rounded-full mb-1 text-sm">
                    <span>🥬</span>
                    <span>🍅</span>
                    <span>🧀</span>
                    <span>🧅</span>
                  </div>

                  <div className="flex flex-col items-center -space-y-1.5 relative">
                    <span className="text-base filter drop-shadow">🥯</span>
                    <span className="text-sm filter drop-shadow">🍅</span>
                    <span className="text-sm filter drop-shadow">🥬</span>
                    <span className="text-sm filter drop-shadow">🧀</span>
                    <span className="text-base filter drop-shadow">🥩</span>
                    <span className="text-base filter drop-shadow">🍞</span>
                  </div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Add toppings, sauces and build the perfect meal!
                </div>
              </div>

              {/* CELL 7: "6. PIZZA STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('pizza'); }}
                className="col-span-12 lg:col-span-3 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    6. PIZZA STATION
                  </span>
                  {pizza.isBaking && (
                    <span className="px-1 py-0.5 bg-red-500 text-slate-950 font-sans text-[7px] font-black rounded-full animate-pulse">
                      🔥 BAKING
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-3 relative h-28">
                  {pizza.isBaking ? (
                    <div className="relative">
                      <div className="w-14 h-14 bg-[#2d1b54] border-2 border-orange-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden animate-pulse">
                        <div className="absolute inset-0 bg-red-500/10 pointer-events-none"></div>
                        <span className="text-xl filter drop-shadow">🍕</span>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-dashed border-red-500 rounded-full animate-ping pointer-events-none opacity-30"></div>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <div className="w-10 h-10 bg-[#130d22] border border-indigo-950 rounded-full flex items-center justify-center text-lg shadow-inner">
                        🥞
                      </div>
                      <span className="text-slate-500 font-extrabold text-xs">➔</span>
                      <div className="w-10 h-10 bg-red-900/40 border border-red-850 rounded-full flex items-center justify-center text-lg shadow-inner">
                        🍕
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Prepare, top, bake and slice delicious pizzas!
                </div>
              </div>

              {/* CELL 8: "7. MILKSHAKE STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('milkshake'); }}
                className="col-span-12 lg:col-span-3 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    7. MILKSHAKE STATION
                  </span>
                  {shake.isBlending && (
                    <span className="px-1 py-0.5 bg-cyan-500 text-slate-950 font-sans text-[7px] font-black rounded-full animate-pulse">
                      🌀 BLENDING
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-3 relative h-28 gap-3">
                  <div className="flex flex-col gap-0.5 text-xs select-none">
                    <span>🍓</span>
                    <span>🍫</span>
                  </div>

                  <div className="w-8 h-14 bg-[#130d22] border-2 border-indigo-950 rounded-t-xl rounded-b-md relative flex items-center justify-center shadow-inner">
                    <div className={`absolute bottom-0.5 inset-x-0.5 rounded bg-pink-500/80 ${shake.isBlending ? 'animate-pulse h-8' : 'h-6'}`}></div>
                    <span className="text-lg z-10 animate-wiggle">🌪️</span>
                  </div>

                  <div className="text-xl filter drop-shadow">🥤</div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Blend flavors, add toppings and serve!
                </div>
              </div>

              {/* CELL 9: "8. PACKAGING STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('packaging'); }}
                className="col-span-12 lg:col-span-3 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    8. PACKAGING STATION
                  </span>
                  {completedTray.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-500 text-slate-950 font-sans text-[7px] font-black rounded-full animate-bounce">
                      {completedTray.length} READY
                    </span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-3 relative h-28 gap-2">
                  <div className="text-lg">🍟</div>
                  
                  <div className="w-12 h-14 bg-amber-750/30 border-2 border-amber-800 rounded-xl relative flex flex-col justify-between items-center p-1 shadow-md">
                    <div className="w-8 h-2 bg-amber-800/80 rounded-t border-b border-amber-950/60"></div>
                    <span className="text-xs font-sans font-black text-white drop-shadow">Q</span>
                    <div className="w-full h-1 bg-amber-900 rounded-b"></div>
                  </div>

                  <div className="text-lg">🥤</div>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Pack the order neatly for your customer!
                </div>
              </div>

              {/* CELL 10: "9. SERVE STATION" */}
              <div 
                onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('serve'); }}
                className="col-span-12 lg:col-span-3 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:scale-[1.015] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
              >
                <div className="p-2 flex justify-between items-center relative z-10">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    9. SERVE STATION
                  </span>
                  {orders.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-orange-500 text-slate-950 font-sans text-[7.5px] font-black rounded-full leading-none animate-ping">
                      🛎️ {orders.length} ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-3 relative h-28">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-500/20 border-2 border-pink-400 rounded-full flex items-center justify-center text-xl shadow-md">
                      👩
                    </div>
                    <div className="bg-[#130d22] border border-indigo-950 rounded-2xl p-1.5 max-w-[120px] shadow">
                      <p className="text-[7.5px] font-black text-amber-400 block leading-none">HOW WAS IT?</p>
                      <span className="text-[9px] block mt-1">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>

                  <span className="mt-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded font-mono text-[9px] font-black text-emerald-400">
                    TIP: ${reviews[0]?.tip ? reviews[0].tip.toFixed(2) : '8.75'}
                  </span>
                </div>

                <div className="w-full bg-[#130d22]/95 border-t border-indigo-950/60 py-2 px-3 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wide">
                  Serve customers, get ratings and earn tips!
                </div>
              </div>

              {/* BOTTOM ROWS */}

              {/* CELL 11: "MORE AREAS" */}
              <div className="col-span-12 lg:col-span-5 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl p-3 shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-1.5 border-b border-indigo-950/60 pb-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-orange-600 border border-orange-500 text-[8px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    MORE AREAS
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setActiveStation('drink'); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-cyan-500/50 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">🥤</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase">Drink Station</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setActiveModal('breakfast'); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-yellow-500/50 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">🥞</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase">Breakfast</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setActiveModal('dessert'); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-pink-500/50 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">🍰</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase">Dessert</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setActiveModal('employees'); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-purple-500/50 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">🚪</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase">Staff Room</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setActiveModal('storage'); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-emerald-500/50 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">📦</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase">Storage Room</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setShowShop(true); }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 hover:scale-103 cursor-pointer transition-all"
                  >
                    <span className="text-lg block mb-1">🛒</span>
                    <span className="text-[7.5px] font-black tracking-wider text-amber-400 uppercase">Upgrade Shop</span>
                  </button>
                </div>
              </div>

              {/* CELL 12: "UPGRADES & CUSTOMIZATION" */}
              <div className="col-span-12 lg:col-span-4 bg-[#18122c] border-2 border-indigo-950/80 rounded-2xl p-3 shadow-lg flex flex-col justify-between">
                <div className="flex items-center gap-1.5 border-b border-indigo-950/60 pb-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-yellow-600 border border-yellow-500 text-[8px] font-black text-white rounded-full uppercase tracking-wider font-mono">
                    UPGRADES &amp; CUSTOMIZATION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 flex-1 items-center">
                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setShowShop(true); }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-orange-500/50 hover:scale-102 cursor-pointer transition-all text-left"
                  >
                    <span className="text-sm shrink-0">🍳</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase leading-snug">Kitchen Upgrades</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setShowShop(true); }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-yellow-500/50 hover:scale-102 cursor-pointer transition-all text-left"
                  >
                    <span className="text-sm shrink-0">🪑</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase leading-snug">Interior Upgrades</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setShowShop(true); }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-green-500/50 hover:scale-102 cursor-pointer transition-all text-left"
                  >
                    <span className="text-sm shrink-0">🌿</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase leading-snug">Decorations</span>
                  </button>

                  <button
                    onClick={() => { playSound('click'); setViewMode('station'); setShowShop(true); }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#130d22] border border-indigo-950 hover:border-blue-500/50 hover:scale-102 cursor-pointer transition-all text-left"
                  >
                    <span className="text-sm shrink-0">👥</span>
                    <span className="text-[7.5px] font-black tracking-wider text-slate-300 uppercase leading-snug">Staff Upgrades</span>
                  </button>
                </div>
              </div>

              {/* CELL 13: "100 LEVELS PROMO BOX" */}
              <div className="col-span-12 lg:col-span-3 bg-gradient-to-br from-indigo-950 to-[#221044] border-2 border-indigo-950/80 rounded-2xl p-4 shadow-lg flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400"></div>
                <h2 className="font-display text-4xl text-yellow-300 uppercase text-center leading-none tracking-tight comic-text-stroke-sm">
                  100 Levels
                </h2>
                <p className="font-sans text-[10px] text-purple-200 font-black uppercase text-center mt-1.5 tracking-widest leading-none">
                  TONS OF FOOD
                </p>
                <h3 className="font-display text-2xl text-orange-400 uppercase text-center mt-1.5 leading-none tracking-wide comic-text-stroke-sm animate-pulse">
                  Endless Fun!
                </h3>
              </div>

            </div>

            {/* Footer rights copy */}
            <footer className="w-full text-center py-2 text-purple-400/50 text-[8.5px] font-mono tracking-wide mt-4 shrink-0">
              QUAZZYS FOODARIA GAME CO. &copy; 2026. ALL RIGHTS RESERVED.
            </footer>

            {/* MODAL POPUPS */}
            {activeModal === 'breakfast' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#18122c] border-3 border-indigo-950 rounded-3xl p-6 max-w-md w-full text-center relative shadow-2xl">
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="absolute top-4 right-4 text-purple-300 hover:text-white text-xl cursor-pointer">✕</button>
                  <span className="text-5xl block animate-bounce mb-3">🥞</span>
                  <h3 className="font-display text-2xl text-yellow-300 uppercase">Breakfast Station</h3>
                  <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-[9px] font-black rounded-full uppercase tracking-wider block w-max mx-auto mt-1 mb-4">🔓 Unlocks at Level 5</span>
                  <p className="text-xs text-purple-200 leading-relaxed mb-4 font-sans">
                    Prepare golden fluffy waffles, fry crispy bacon, toast bagels, and flip sunny-side-up eggs! Our morning rush of hungry diners is coming soon. Focus on mastering your burger skills first!
                  </p>
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="px-5 py-2 bg-purple-900 border border-purple-750 text-white font-black text-xs uppercase rounded-xl tracking-wider hover:bg-purple-800 transition-all cursor-pointer">Got It!</button>
                </div>
              </div>
            )}

            {activeModal === 'dessert' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#18122c] border-3 border-indigo-950 rounded-3xl p-6 max-w-md w-full text-center relative shadow-2xl">
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="absolute top-4 right-4 text-purple-300 hover:text-white text-xl cursor-pointer">✕</button>
                  <span className="text-5xl block animate-bounce mb-3">🍰</span>
                  <h3 className="font-display text-2xl text-pink-400 uppercase">Dessert Station</h3>
                  <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[9px] font-black rounded-full uppercase tracking-wider block w-max mx-auto mt-1 mb-4">🔓 Unlocks at Level 10</span>
                  <p className="text-xs text-purple-200 leading-relaxed mb-4 font-sans">
                    Layer tall strawberry shortcakes, bake fresh double-chocolate fudge brownies, and scoop rainbow gelato cones! Keep leveling up to open the ultimate Dessert station.
                  </p>
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="px-5 py-2 bg-purple-900 border border-purple-750 text-white font-black text-xs uppercase rounded-xl tracking-wider hover:bg-purple-800 transition-all cursor-pointer">Got It!</button>
                </div>
              </div>
            )}

            {activeModal === 'employees' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#18122c] border-3 border-indigo-950 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl">
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="absolute top-4 right-4 text-purple-300 hover:text-white text-xl cursor-pointer">✕</button>
                  <div className="flex items-center gap-2 mb-4 border-b border-purple-900 pb-2.5">
                    <span className="text-3xl">🚪</span>
                    <div>
                      <h3 className="font-display text-xl text-yellow-300 uppercase leading-none">Diner Staff Locker</h3>
                      <p className="text-[9px] text-purple-300 font-bold uppercase tracking-wider mt-1">Employee roster, schedules &amp; perks</p>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    <div className="p-3 bg-[#130d22] border border-purple-950 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🧑‍🍳</span>
                        <div>
                          <p className="font-sans font-black text-xs text-white leading-none">Quazzy (Founder)</p>
                          <p className="text-[9px] text-amber-400 font-bold mt-1 uppercase tracking-wider">Executive Head Chef</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono text-purple-300 font-bold uppercase">Speed Boost +50%</span>
                    </div>
                    <div className="p-3 bg-[#130d22] border border-purple-950 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🥩</span>
                        <div>
                          <p className="font-sans font-black text-xs text-slate-300 leading-none">Slick (Diner Staff)</p>
                          <p className="text-[9px] text-purple-400 font-bold mt-1 uppercase tracking-wider">Flat-top Grill Specialist</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono text-purple-300 font-bold uppercase">Anti-Burn Shield active</span>
                    </div>
                    <div className="p-3 bg-[#130d22] border border-purple-950 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🍟</span>
                        <div>
                          <p className="font-sans font-black text-xs text-slate-300 leading-none">Fiona (Fryer Assistant)</p>
                          <p className="text-[9px] text-purple-400 font-bold mt-1 uppercase tracking-wider">Fry Station Master</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono text-purple-300 font-bold uppercase">Perfect Salt Ratio</span>
                    </div>
                    <div className="p-3 bg-[#130d22] border border-purple-950 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🥤</span>
                        <div>
                          <p className="font-sans font-black text-xs text-slate-300 leading-none">Barnaby (Shake Artist)</p>
                          <p className="text-[9px] text-purple-400 font-bold mt-1 uppercase tracking-wider">Cream Blend Specialist</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-mono text-purple-300 font-bold uppercase">Whipped Cream peak master</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-900 flex justify-end">
                    <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="px-4 py-1.5 bg-purple-900 border border-purple-750 text-white font-black text-[10px] uppercase rounded-lg tracking-wider hover:bg-purple-800 transition-all cursor-pointer">Close Staff Roster</button>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'storage' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#18122c] border-3 border-indigo-950 rounded-3xl p-6 max-w-md w-full relative shadow-2xl">
                  <button onClick={() => { playSound('click'); setActiveModal('none'); }} className="absolute top-4 right-4 text-purple-300 hover:text-white text-xl cursor-pointer">✕</button>
                  <div className="flex items-center gap-2 mb-4 border-b border-purple-900 pb-2.5">
                    <span className="text-3xl">📦</span>
                    <div>
                      <h3 className="font-display text-xl text-yellow-300 uppercase leading-none">Storage Room</h3>
                      <p className="text-[9px] text-purple-300 font-bold uppercase tracking-wider mt-1">Current Cold-Storage Stock</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 font-sans">
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🥩 Beef Patties</span>
                      <span className="font-mono text-xs font-black text-yellow-400">48 Units</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🥯 Brioche Buns</span>
                      <span className="font-mono text-xs font-black text-yellow-400">36 Units</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🧀 Cheddar Cheese</span>
                      <span className="font-mono text-xs font-black text-yellow-400">50 Units</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🥬 Fresh Lettuce</span>
                      <span className="font-mono text-xs font-black text-yellow-400">25 Heads</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🍅 Sliced Tomatoes</span>
                      <span className="font-mono text-xs font-black text-yellow-400">30 Units</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🍟 Potato Wedges</span>
                      <span className="font-mono text-xs font-black text-yellow-400">60 Lbs</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🍕 Pizza Dough</span>
                      <span className="font-mono text-xs font-black text-yellow-400">20 Crusts</span>
                    </div>
                    <div className="p-2.5 bg-[#130d22] border border-purple-950 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-200">🥛 Shake Base</span>
                      <span className="font-mono text-xs font-black text-yellow-400">15 Tubs</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-400 italic text-center mt-4 font-sans">
                    All food ingredients are fresh and standard grade. Upgrade storage room to increase stock limits.
                  </p>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ==================== 2. ACTIVE FOCUSED KITCHEN WORKSPACE ==================== */
          <div className="w-full h-full flex flex-col relative bg-[#0e0a1b] text-white">
            
            {/* Top Navigation Control bar */}
            <div className="w-full bg-[#18122c] border-b-2 border-indigo-950/80 px-4 py-2.5 flex justify-between items-center shrink-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playSound('click');
                    setViewMode('dashboard');
                    setShowShop(false);
                    setShowReviews(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-950 to-indigo-900 hover:from-indigo-900 border border-indigo-700/50 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider text-purple-200 shadow hover:scale-103 active:scale-95 cursor-pointer transition-all"
                >
                  🗺️ Diner Map
                </button>
                
                <div className="h-4 w-[1px] bg-indigo-950"></div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">
                    {showShop ? '🛒' : showReviews ? '💬' : activeStation === 'order' ? '📋' : activeStation === 'grill' ? '🥩' : activeStation === 'fryer' ? '🍟' : activeStation === 'build' ? '🍔' : activeStation === 'pizza' ? '🍕' : activeStation === 'milkshake' ? '🥤' : activeStation === 'drink' ? '🥤' : activeStation === 'packaging' ? '📦' : '🛎️'}
                  </span>
                  <h2 className="font-display text-sm text-yellow-300 uppercase leading-none tracking-wide">
                    {showShop ? 'Upgrade Shop' : showReviews ? 'Diner Reviews' : activeStation === 'order' ? 'Lobby Register' : activeStation === 'grill' ? 'Grill Flat' : activeStation === 'fryer' ? 'Fryer Well' : activeStation === 'build' ? 'Burger Build' : activeStation === 'pizza' ? 'Pizza Oven' : activeStation === 'milkshake' ? 'Milkshake Blenders' : activeStation === 'drink' ? 'Soda Dispenser' : activeStation === 'packaging' ? 'Packaging Counter' : 'Serve Counter'}
                  </h2>
                </div>
              </div>

              {/* Station Quick Switch icons strip */}
              <div className="hidden md:flex items-center gap-1 bg-[#130d22] border border-indigo-950/50 p-1 rounded-xl">
                {[
                  { id: 'order', emoji: '📋', label: 'Order' },
                  { id: 'grill', emoji: '🥩', label: 'Grill' },
                  { id: 'fryer', emoji: '🍟', label: 'Fryer' },
                  { id: 'build', emoji: '🍔', label: 'Build' },
                  { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                  { id: 'milkshake', emoji: '🥤', label: 'Shake' },
                  { id: 'drink', emoji: '🥤', label: 'Soda' },
                  { id: 'packaging', emoji: '📦', label: 'Pack' },
                  { id: 'serve', emoji: '🛎️', label: 'Serve' }
                ].map((st) => {
                  const isActive = activeStation === st.id && !showShop && !showReviews;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        playSound('click');
                        setActiveStation(st.id);
                        setShowShop(false);
                        setShowReviews(false);
                      }}
                      title={st.label}
                      className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-sm font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 scale-108 border border-amber-300 shadow'
                          : 'hover:bg-[#20173b] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.emoji}
                    </button>
                  );
                })}
              </div>

              {/* HUD info details */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-950 border border-emerald-500/30 rounded-xl px-2.5 py-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-black text-emerald-400">${money.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-900 rounded-xl px-2 py-1">
                  <span>LVL {level}</span>
                  <span className="text-slate-600">|</span>
                  <span>{xp % 100}/100 XP</span>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setViewMode('dashboard');
                    setShowShop(false);
                    setShowReviews(false);
                  }}
                  className="p-1 text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                  title="Return to Diner Map"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewport Core rendering component */}
            <div className="flex-1 min-w-0 h-full relative overflow-hidden">
              
              {/* 1. UPGRADES SHOP */}
              {showShop && (
                <UpgradesView
                  money={money}
                  upgrades={upgrades}
                  onBuyUpgrade={handleBuyUpgrade}
                  onBackToHotel={() => { setShowShop(false); setViewMode('dashboard'); }}
                />
              )}

              {/* 2. REVIEWS FEED */}
              {showReviews && (
                <ReviewsView
                  reviews={reviews}
                  onBackToHotel={() => { setShowReviews(false); setViewMode('dashboard'); }}
                />
              )}

              {/* 3. ACTIVE STATION COMPONENTS */}
              {!showShop && !showReviews && (
                <>
                  {activeStation === 'order' && (
                    <OrderStation
                      money={money}
                      level={level}
                      xp={xp}
                      orders={orders}
                      onTakeOrder={handleTakeOrder}
                      waitingCustomers={waitingCustomers}
                      soundOn={soundOn}
                      musicOn={musicOn}
                      onToggleSound={() => setSoundOn(!soundOn)}
                      onToggleMusic={() => setMusicOn(!musicOn)}
                    />
                  )}

                  {activeStation === 'grill' && (
                    <GrillStation
                      money={money}
                      orders={orders}
                      patties={patties}
                      onAddPattyToGrill={handleAddPattyToGrill}
                      onFlipPatty={handleFlipPatty}
                      onRemovePattyFromGrill={handleRemovePattyFromGrill}
                      onUpdatePatties={setPatties}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'build' && (
                    <BuildStation
                      orders={orders}
                      patties={patties}
                      onCompleteBurger={handleCompleteBurger}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'fryer' && (
                    <FryerStation
                      orders={orders}
                      baskets={baskets}
                      onAddBasket={handleAddBasketToFryer}
                      onUpdateBaskets={setBaskets}
                      onCompleteFries={handleCompleteFries}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'pizza' && (
                    <PizzaStation
                      orders={orders}
                      pizza={pizza}
                      onUpdatePizza={setPizza}
                      onCompletePizza={handleCompletePizza}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'milkshake' && (
                    <MilkshakeStation
                      orders={orders}
                      shake={shake}
                      onUpdateShake={setShake}
                      onCompleteShake={handleCompleteShake}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'drink' && (
                    <DrinkStation
                      orders={orders}
                      drink={drink}
                      onUpdateDrink={setDrink}
                      onCompleteDrink={handleCompleteDrink}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'packaging' && (
                    <PackagingStation
                      orders={orders}
                      completedTray={completedTray}
                      packedItems={packedItems}
                      isBagSealed={isBagSealed}
                      onPackItem={handlePackItem}
                      onUnpackItem={handleUnpackItem}
                      onSealBag={handleSealBag}
                      onResetBag={handleResetBag}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}

                  {activeStation === 'serve' && (
                    <ServeStation
                      money={money}
                      orders={orders}
                      isBagSealed={isBagSealed}
                      packedItems={packedItems}
                      onServeBag={handleServeBag}
                      upgrades={upgrades}
                      activeStation={activeStation}
                    />
                  )}
                </>
              )}

              {/* Completed Tray Peek bar */}
              {!showShop && !showReviews && completedTray.length > 0 && (
                <div className="absolute bottom-1 right-2 bg-slate-950/90 border border-indigo-950 rounded-lg px-2 py-0.5 flex items-center gap-1.5 shadow z-10 text-[8.5px] font-black uppercase text-purple-300">
                  <span>Completed Tray Peek:</span>
                  <div className="flex gap-1">
                    {completedTray.map((item, idx) => (
                      <span key={idx}>
                        {item === 'burger' ? '🍔' : item === 'fries' ? '🍟' : item === 'pizza' ? '🍕' : item === 'milkshake' ? '🥤' : '🥤'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )
      )}

    </div>
  );
}
