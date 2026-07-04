/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GameState, Guest, Room, Staff, Upgrade, Review, ScreenType, DishId 
} from './types';
import { 
  INITIAL_STAFF, INITIAL_UPGRADES, INITIAL_REVIEWS, 
  GUEST_NAMES, GUEST_EMOJIS, DISHES 
} from './data';

import LandscapeOnly from './components/LandscapeOnly';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import HotelView from './components/HotelView';
import CookingStation from './components/CookingStation';
import RoomDelivery from './components/RoomDelivery';
import UpgradesView from './components/UpgradesView';
import StaffHiringView from './components/StaffHiringView';
import ReviewsView from './components/ReviewsView';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('loading');
  const [money, setMoney] = useState<number>(200);
  const [xp, setXp] = useState<number>(0);
  const [xpNeeded, setXpNeeded] = useState<number>(100);
  const [level, setLevel] = useState<number>(1);
  const [rating, setRating] = useState<number>(4.8);
  
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);

  const [elevatorFloor, setElevatorFloor] = useState<number>(1);
  const [elevatorStatus, setElevatorStatus] = useState<'working' | 'broken'>('working');
  const [elevatorTaps, setElevatorTaps] = useState<number>(0);

  const [activeOrderGuest, setActiveOrderGuest] = useState<Guest | null>(null);

  // Core Arrays
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    { number: 301, floor: 3, status: 'vacant', guestId: null, cleanProgress: 0, bedLevel: 1, tvLevel: 1, lampLevel: 1 },
    { number: 302, floor: 3, status: 'vacant', guestId: null, cleanProgress: 0, bedLevel: 1, tvLevel: 1, lampLevel: 1 }
  ]);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // ==================== LOCALSTORAGE PERSISTENCE ====================
  useEffect(() => {
    try {
      const savedMoney = localStorage.getItem('sh_money');
      const savedLvl = localStorage.getItem('sh_level');
      const savedXp = localStorage.getItem('sh_xp');
      const savedRating = localStorage.getItem('sh_rating');
      const savedStaff = localStorage.getItem('sh_staff');
      const savedUpgrades = localStorage.getItem('sh_upgrades');
      const savedReviews = localStorage.getItem('sh_reviews');

      if (savedMoney) setMoney(Number(savedMoney));
      if (savedLvl) setLevel(Number(savedLvl));
      if (savedXp) setXp(Number(savedXp));
      if (savedRating) setRating(Number(savedRating));
      
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        if (parsed && parsed.length > 0) setStaff(parsed);
      }
      if (savedUpgrades) {
        const parsed = JSON.parse(savedUpgrades);
        if (parsed && parsed.length > 0) setUpgrades(parsed);
      }
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (parsed && parsed.length > 0) setReviews(parsed);
      }
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }
  }, []);

  const saveProgressToLocal = (
    currentMoney: number, currentLvl: number, currentXp: number, 
    currentRating: number, currentStaff: Staff[], currentUpgrades: Upgrade[], currentReviews: Review[]
  ) => {
    try {
      localStorage.setItem('sh_money', currentMoney.toString());
      localStorage.setItem('sh_level', currentLvl.toString());
      localStorage.setItem('sh_xp', currentXp.toString());
      localStorage.setItem('sh_rating', currentRating.toString());
      localStorage.setItem('sh_staff', JSON.stringify(currentStaff));
      localStorage.setItem('sh_upgrades', JSON.stringify(currentUpgrades));
      localStorage.setItem('sh_reviews', JSON.stringify(currentReviews));
    } catch (e) {
      console.error("Local storage write failed:", e);
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setMoney(200);
    setLevel(1);
    setXp(0);
    setRating(4.8);
    setStaff(INITIAL_STAFF);
    setUpgrades(INITIAL_UPGRADES);
    setReviews(INITIAL_REVIEWS);
    setGuests([]);
    setRooms([
      { number: 301, floor: 3, status: 'vacant', guestId: null, cleanProgress: 0, bedLevel: 1, tvLevel: 1, lampLevel: 1 },
      { number: 302, floor: 3, status: 'vacant', guestId: null, cleanProgress: 0, bedLevel: 1, tvLevel: 1, lampLevel: 1 }
    ]);
  };

  // ==================== GAME TIMER LOOP ====================
  useEffect(() => {
    if (screen === 'loading' || screen === 'menu') return;

    const interval = setInterval(() => {
      // 1. Patience Tick for each waiting/ordering guest
      setGuests((prevGuests) => {
        return prevGuests.map((g) => {
          let loss = 1.2;
          
          // TV Upgrade buffer reducing patience loss in assigned rooms
          if (g.roomNumber) {
            const tvLvl = upgrades.find(u => u.id === 'tvs')?.level || 1;
            loss = Math.max(0.4, loss - (tvLvl * 0.12));
          }

          const nextPatience = Math.max(0, g.patience - loss);
          
          // Trigger a 1-star check if patience runs out in room
          if (nextPatience === 0 && g.status !== 'eating' && g.status !== 'dirty_room') {
            // Generate a sour review
            setTimeout(() => {
              const reviewText = `${g.name} checked out early. Absolute gridlock delay on room-service! 1 Star.`;
              const badReview: Review = {
                id: Math.random().toString(),
                guestName: g.name,
                avatarEmoji: g.avatarEmoji,
                avatarColor: g.avatarColor,
                rating: 1.0,
                comment: reviewText,
                dishServed: null,
                timestamp: 'Just now',
              };
              setReviews(prev => {
                const next = [badReview, ...prev].slice(0, 8);
                saveProgressToLocal(money, level, xp, 3.2, staff, upgrades, next);
                return next;
              });
              setRating(3.2);
            }, 500);
          }

          return {
            ...g,
            patience: nextPatience
          };
        }).filter((g) => g.patience > 0); // Filter out angry left guests
      });

      // 2. Automations & Staff Perk Helpers
      const isClaraHired = staff.find(s => s.id === 'receptionist')?.hired;
      const isCleanersHired = staff.find(s => s.id === 'housekeeper')?.hired;
      const isManagerHired = staff.find(s => s.id === 'manager')?.hired;

      // Receptionist: checks in waiting guest if clean vacant room exists
      if (isClaraHired) {
        setGuests((prev) => {
          const lobbyG = prev.find(g => g.status === 'lobby_waiting');
          if (lobbyG) {
            setRooms((prevRooms) => {
              const vacant = prevRooms.find(r => r.status === 'vacant');
              if (vacant) {
                // Assign room
                setTimeout(() => {
                  onAssignRoom(lobbyG.id, vacant.number);
                }, 100);
              }
              return prevRooms;
            });
          }
          return prev;
        });
      }

      // Housekeeper: Sweeps and scrubs dirty rooms automatically
      if (isCleanersHired) {
        setRooms((prevRooms) => {
          return prevRooms.map((r) => {
            if (r.status === 'dirty') {
              return { ...r, status: 'cleaning', cleanProgress: 10 };
            }
            if (r.status === 'cleaning' && r.cleanProgress < 100) {
              const nextProgress = Math.min(100, r.cleanProgress + 25);
              return {
                ...r,
                cleanProgress: nextProgress,
                status: nextProgress === 100 ? 'vacant' : 'cleaning'
              };
            }
            return r;
          });
        });
      }

      // Manager: Yields passive cash salary bonus
      if (isManagerHired) {
        setMoney((prev) => {
          const bonusCash = prev + 2;
          saveProgressToLocal(bonusCash, level, xp, rating, staff, upgrades, reviews);
          return bonusCash;
        });
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [screen, staff, upgrades, money, level, xp, rating, reviews]);

  // Arriving guest spawner ticker (every 18s)
  useEffect(() => {
    if (screen === 'loading' || screen === 'menu') return;

    const spawner = setInterval(() => {
      setGuests((prev) => {
        if (prev.filter(g => g.status === 'lobby_waiting').length >= 3) return prev; // Limit desk size

        const rName = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
        const rProfile = GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)];
        
        const newGuest: Guest = {
          id: Math.random().toString(),
          name: rName,
          avatarEmoji: rProfile.emoji,
          avatarColor: rProfile.color,
          status: 'lobby_waiting',
          roomNumber: null,
          patience: 100,
          patienceMax: 100,
          orderDishId: null,
          tipMultiplier: 1.0,
        };

        return [...prev, newGuest];
      });
    }, 16000);

    return () => clearInterval(spawner);
  }, [screen]);

  // Random elevator breakdown ticker (every 95s)
  useEffect(() => {
    if (screen === 'loading' || screen === 'menu') return;

    const maintHired = staff.find(s => s.id === 'maintenance')?.hired;
    const intervalTime = maintHired ? 220000 : 95000; // Maintenance reduces breakdowns drastically!

    const breakdownTimer = setInterval(() => {
      setElevatorStatus('broken');
    }, intervalTime);

    return () => clearInterval(breakdownTimer);
  }, [screen, staff]);

  // Initial guest generation on play
  const generateInitialGuests = () => {
    const firstGuests: Guest[] = [
      {
        id: 'g1',
        name: 'Lord Reginald',
        avatarEmoji: '🎩',
        avatarColor: 'from-slate-700 to-slate-900',
        status: 'lobby_waiting',
        roomNumber: null,
        patience: 95,
        patienceMax: 100,
        orderDishId: null,
        tipMultiplier: 1.4,
      },
      {
        id: 'g2',
        name: 'Sasha Glam',
        avatarEmoji: '💅',
        avatarColor: 'from-fuchsia-300 to-pink-500',
        status: 'lobby_waiting',
        roomNumber: null,
        patience: 100,
        patienceMax: 100,
        orderDishId: null,
        tipMultiplier: 1.2,
      }
    ];
    setGuests(firstGuests);
  };

  const handleStartGame = () => {
    generateInitialGuests();
    setScreen('menu');
  };

  // ==================== INTERACTION ACTIONS ====================

  // Check in guest
  const onAssignRoom = (guestId: string, roomNumber: number) => {
    setGuests((prev) => 
      prev.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            roomNumber,
            status: 'assigned_room',
            patience: 100
          };
        }
        return g;
      })
    );

    setRooms((prev) => 
      prev.map((r) => {
        if (r.number === roomNumber) {
          return { ...r, status: 'occupied', guestId };
        }
        return r;
      })
    );

    // After 4.5 seconds, guest triggers food order craves!
    setTimeout(() => {
      setGuests((prev) => 
        prev.map((g) => {
          if (g.id === guestId && g.status === 'assigned_room') {
            const recipeOptions: DishId[] = ['burger', 'pizza', 'steak', 'pancakes', 'drink'];
            const chosenDish = recipeOptions[Math.floor(Math.random() * recipeOptions.length)];
            return {
              ...g,
              status: 'ordering',
              orderDishId: chosenDish,
              patience: 100
            };
          }
          return g;
        })
      );
    }, 4500);
  };

  // Clean filthy room sheets
  const onCleanRoom = (roomNumber: number) => {
    setRooms((prev) => 
      prev.map((r) => {
        if (r.number === roomNumber) {
          // Increment clean progress
          const nextProgress = Math.min(100, r.cleanProgress + 25);
          return {
            ...r,
            cleanProgress: nextProgress,
            status: nextProgress === 100 ? 'vacant' : 'cleaning'
          };
        }
        return r;
      })
    );
  };

  // Complete eating & checkout
  const onCollectRent = (guestId: string, roomNumber: number) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const baseRent = 120;
    const bedTier = rooms.find(r => r.number === roomNumber)?.bedLevel || 1;
    const checkoutYield = baseRent + (bedTier * 15);

    // credit currency
    const finalMoney = money + checkoutYield;
    const earnedXp = 25;
    let finalXp = xp + earnedXp;
    let finalLvl = level;
    const needed = xpNeeded;

    if (finalXp >= needed) {
      finalLvl += 1;
      finalXp = finalXp - needed;
    }

    setMoney(finalMoney);
    setXp(finalXp);
    setLevel(finalLvl);

    // Generate verified HustleAdvisor review!
    const feedbackList = [
      "Extremely comfortable pillows! Check-in desk was so prompt.",
      "The aesthetic is stunning. Neon lights fit perfectly on my feed!",
      "Loved my stay, service was professional and swift. Will return!",
      "Bed felt absolutely cloud-like. Exceptional luxury management."
    ];
    const commentText = feedbackList[Math.floor(Math.random() * feedbackList.length)];
    
    const checkoutReview: Review = {
      id: Math.random().toString(),
      guestName: guest.name,
      avatarEmoji: guest.avatarEmoji,
      avatarColor: guest.avatarColor,
      rating: 5.0,
      comment: commentText,
      dishServed: guest.orderDishId ? DISHES[guest.orderDishId].name : null,
      timestamp: 'Just now',
    };

    setReviews((prev) => {
      const updated = [checkoutReview, ...prev].slice(0, 8);
      saveProgressToLocal(finalMoney, finalLvl, finalXp, rating, staff, upgrades, updated);
      return updated;
    });

    // Remove guest and make room dirty
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    setRooms((prev) => 
      prev.map((r) => {
        if (r.number === roomNumber) {
          return {
            ...r,
            status: 'dirty',
            cleanProgress: 0,
            guestId: null
          };
        }
        return r;
      })
    );
  };

  // Select food request from bubble
  const onSelectGuestOrder = (guest: Guest) => {
    setActiveOrderGuest(guest);
    setScreen('cooking');
  };

  // Complete cooking scorecard callback
  const onCompleteCooking = (guestId: string, foodRating: number, earnings: number) => {
    // 1. Credit XP
    const earnedXp = Math.floor((foodRating / 5) * 35);
    let finalXp = xp + earnedXp;
    let finalLvl = level;
    if (finalXp >= xpNeeded) {
      finalLvl += 1;
      finalXp = finalXp - xpNeeded;
    }

    const finalMoney = money + earnings;

    setMoney(finalMoney);
    setXp(finalXp);
    setLevel(finalLvl);

    // Move guest to 'waiting_delivery' stage for room service Elevator Express!
    setGuests((prev) => 
      prev.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            status: 'waiting_delivery',
            patience: 100
          };
        }
        return g;
      })
    );

    // Auto-delivery check if Speed Bellhop is hired!
    const isBellhopHired = staff.find(s => s.id === 'bellhop')?.hired;
    if (isBellhopHired) {
      setTimeout(() => {
        onDeliverFood(guestId);
      }, 1500);
    }

    setScreen('hotel');
    setActiveOrderGuest(null);
    saveProgressToLocal(finalMoney, finalLvl, finalXp, rating, staff, upgrades, reviews);
  };

  // Dispatch meal delivery
  const onDeliverFood = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    // Move guest to sleeping/eating state
    setGuests((prev) => 
      prev.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            status: 'eating',
            patience: 100
          };
        }
        return g;
      })
    );

    // After 8 seconds of eating, guest sleeps, and checked-out rent becomes redeemable
    setTimeout(() => {
      // Checked out triggers
    }, 8000);
  };

  // Call magnetic elevator floor
  const onCallElevator = (floor: number) => {
    if (elevatorStatus === 'broken') return;

    // Golden elevator speed multiplier check
    const elevatorUpgradeLvl = upgrades.find(u => u.id === 'elevator')?.level || 1;
    const delay = Math.max(200, 1000 - (elevatorUpgradeLvl * 100));

    setTimeout(() => {
      setElevatorFloor(floor);
    }, delay);
  };

  // Tapping rapid repairs
  const onRepairElevator = () => {
    setElevatorTaps((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setElevatorStatus('working');
        setElevatorTaps(0);
        return 0;
      }
      return next;
    });
  };

  // Buy suite upgrades
  const onBuyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || money < upgrade.cost) return;

    const nextMoney = money - upgrade.cost;
    const nextCost = Math.floor(upgrade.cost * upgrade.multiplier);
    const nextLvl = upgrade.level + 1;

    const nextUpgrades = upgrades.map((u) => {
      if (u.id === upgradeId) {
        return {
          ...u,
          level: nextLvl,
          cost: nextCost
        };
      }
      return u;
    });

    // Update Room metrics if bed or tv levels increased
    if (upgradeId === 'beds') {
      setRooms((prev) => prev.map((r) => ({ ...r, bedLevel: nextLvl })));
    } else if (upgradeId === 'tvs') {
      setRooms((prev) => prev.map((r) => ({ ...r, tvLevel: nextLvl })));
    }

    setMoney(nextMoney);
    setUpgrades(nextUpgrades);
    saveProgressToLocal(nextMoney, level, xp, rating, staff, nextUpgrades, reviews);
  };

  // Sign employee contract
  const onHireStaff = (staffId: string) => {
    const employee = staff.find((s) => s.id === staffId);
    if (!employee || money < employee.cost) return;

    const nextMoney = money - employee.cost;
    const nextStaff = staff.map((s) => {
      if (s.id === staffId) {
        return { ...s, hired: true };
      }
      return s;
    });

    setMoney(nextMoney);
    setStaff(nextStaff);
    saveProgressToLocal(nextMoney, level, xp, rating, nextStaff, upgrades, reviews);
  };

  // Train hired employee
  const onLevelUpStaff = (staffId: string) => {
    const employee = staff.find((s) => s.id === staffId);
    if (!employee) return;

    const levelUpCost = Math.floor(employee.cost * 0.7);
    if (money < levelUpCost) return;

    const nextMoney = money - levelUpCost;
    const nextStaff = staff.map((s) => {
      if (s.id === staffId) {
        return { 
          ...s, 
          level: s.level + 1,
          salary: Math.floor(s.salary * 1.3)
        };
      }
      return s;
    });

    setMoney(nextMoney);
    setStaff(nextStaff);
    saveProgressToLocal(nextMoney, level, xp, rating, nextStaff, upgrades, reviews);
  };

  return (
    <LandscapeOnly>
      <div className="w-full h-screen overflow-hidden bg-black select-none">
        
        {screen === 'loading' && (
          <LoadingScreen onComplete={handleStartGame} />
        )}

        {screen === 'menu' && (
          <MainMenu
            onPlay={() => setScreen('hotel')}
            soundOn={soundOn}
            musicOn={musicOn}
            onToggleSound={() => setSoundOn(!soundOn)}
            onToggleMusic={() => setMusicOn(!musicOn)}
            onResetData={handleResetData}
          />
        )}

        {screen === 'hotel' && (
          <HotelView
            money={money}
            xp={xp}
            xpNeeded={xpNeeded}
            level={level}
            rating={rating}
            guests={guests}
            rooms={rooms}
            staff={staff}
            elevatorFloor={elevatorFloor}
            elevatorStatus={elevatorStatus}
            onScreenChange={(scr) => setScreen(scr)}
            onAssignRoom={onAssignRoom}
            onCleanRoom={onCleanRoom}
            onCollectRent={onCollectRent}
            onRepairElevator={onRepairElevator}
            onSelectGuestOrder={onSelectGuestOrder}
            onCallElevator={onCallElevator}
          />
        )}

        {screen === 'cooking' && (
          <CookingStation
            money={money}
            activeOrderGuest={activeOrderGuest}
            guests={guests}
            onBackToHotel={() => setScreen('hotel')}
            onCompleteCooking={onCompleteCooking}
          />
        )}

        {screen === 'delivery' && (
          <RoomDelivery
            guests={guests}
            elevatorFloor={elevatorFloor}
            elevatorStatus={elevatorStatus}
            onCallElevator={onCallElevator}
            onRepairElevator={onRepairElevator}
            onDeliverFood={onDeliverFood}
            onBackToHotel={() => setScreen('hotel')}
          />
        )}

        {screen === 'upgrades' && (
          <UpgradesView
            money={money}
            upgrades={upgrades}
            onBuyUpgrade={onBuyUpgrade}
            onBackToHotel={() => setScreen('hotel')}
          />
        )}

        {screen === 'staff' && (
          <StaffHiringView
            money={money}
            staff={staff}
            onHireStaff={onHireStaff}
            onLevelUpStaff={onLevelUpStaff}
            onBackToHotel={() => setScreen('hotel')}
          />
        )}

        {screen === 'reviews' && (
          <ReviewsView
            rating={rating}
            reviews={reviews}
            onBackToHotel={() => setScreen('hotel')}
          />
        )}

      </div>
    </LandscapeOnly>
  );
}
