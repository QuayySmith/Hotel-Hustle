/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dish, Staff, Upgrade, Review } from './types';

export const DISHES: Record<string, Dish> = {
  burger: {
    id: 'burger',
    name: 'Deluxe Suite Burger',
    icon: '🍔',
    price: 45,
    ingredients: ['Bun', 'Beef Patty', 'Cheddar Cheese', 'Lettuce', 'Tomato Sauce'],
    cookTimeSeconds: 6,
    description: 'Fresh flame-grilled beef with melting sharp cheddar, tucked inside a toasted brioche bun.',
  },
  pizza: {
    id: 'pizza',
    name: 'Neon Penthouse Pizza',
    icon: '🍕',
    price: 60,
    ingredients: ['Dough', 'Marinara Sauce', 'Mozzarella Cheese', 'Pepperoni Slice'],
    cookTimeSeconds: 8,
    description: 'Thin crispy crust layered with classic marinara sauce, loaded with mozzarella and pepperoni slices.',
  },
  steak: {
    id: 'steak',
    name: 'Gold Plate Prime Steak',
    icon: '🥩',
    price: 95,
    ingredients: ['Ribeye Cut', 'Garlic Butter', 'Rosemary Sprig', 'Asparagus Sides'],
    cookTimeSeconds: 10,
    description: 'Thick, marble-grade ribeye steak seared with foaming rosemary-garlic butter.',
  },
  pancakes: {
    id: 'pancakes',
    name: 'Skyline Pancake Stack',
    icon: '🥞',
    price: 35,
    ingredients: ['Batter Pour', 'Maple Syrup', 'Butter Cube', 'Blueberries'],
    cookTimeSeconds: 5,
    description: 'Three fluffy, golden buttermilk pancakes crowned with fresh butter and pure grade-A maple syrup.',
  },
  drink: {
    id: 'drink',
    name: 'Rooftop Lounge Soda',
    icon: '🥤',
    price: 20,
    ingredients: ['Ice Cubes', 'Soda Mix', 'Lemon Slice', 'Straw'],
    cookTimeSeconds: 3,
    description: 'Chilled premium sparkling beverage infused with refreshing natural syrup.',
  },
};

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'receptionist',
    role: 'receptionist',
    name: 'Clara Swift',
    emoji: '👩‍💼',
    hired: false,
    cost: 150,
    level: 1,
    perk: 'Automatically checks in arriving lobby guests.',
    salary: 5,
  },
  {
    id: 'chef',
    role: 'chef',
    name: 'Chef Gasto',
    emoji: '👨‍🍳',
    hired: false,
    cost: 300,
    level: 1,
    perk: 'Automatically cooks simple items 30% faster.',
    salary: 10,
  },
  {
    id: 'housekeeper',
    role: 'housekeeper',
    name: 'Dusty Clean',
    emoji: '🧹',
    hired: false,
    cost: 200,
    level: 1,
    perk: 'Automatically sweeps and disinfects vacant rooms.',
    salary: 8,
  },
  {
    id: 'bellhop',
    role: 'bellhop',
    name: 'Jax Porter',
    emoji: '🤵',
    hired: false,
    cost: 250,
    level: 1,
    perk: 'Deliveries bypass elevator delay, boosting speeds by 40%.',
    salary: 7,
  },
  {
    id: 'maintenance',
    role: 'maintenance',
    name: 'Wrenchy McFix',
    emoji: '🔧',
    hired: false,
    cost: 350,
    level: 1,
    perk: 'Reduces elevator breakdown frequency by 75%.',
    salary: 12,
  },
  {
    id: 'manager',
    role: 'manager',
    name: 'Slick Hustler',
    emoji: '😎',
    hired: false,
    cost: 800,
    level: 1,
    perk: 'Increases all basic rent & tip gains by 15% across floors.',
    salary: 25,
  },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'beds',
    name: 'Plush Velvet Beds',
    description: 'Increases basic checkout room rent payouts by $15 per upgrade tier.',
    level: 1,
    maxLevel: 10,
    cost: 100,
    icon: '🛏️',
    multiplier: 1.5,
  },
  {
    id: 'tvs',
    name: 'Ultra HDTV Displays',
    description: 'Extends guest patience threshold in assigned rooms by 20%.',
    level: 1,
    maxLevel: 10,
    cost: 120,
    icon: '📺',
    multiplier: 1.6,
  },
  {
    id: 'chandelier',
    name: 'Neon Lobby Chandelier',
    description: 'Increases customer satisfaction ratings and triggers 10% larger tips.',
    level: 0,
    maxLevel: 5,
    cost: 250,
    icon: '💡',
    multiplier: 2.0,
  },
  {
    id: 'stove',
    name: 'Infrared Speed Grills',
    description: 'Slashes preparation times on the cooking grill and oven by 25%.',
    level: 1,
    maxLevel: 8,
    cost: 180,
    icon: '🔥',
    multiplier: 1.7,
  },
  {
    id: 'elevator',
    name: 'Magnetic Golden Elevator',
    description: 'Expedites transition speeds between hotel levels and increases reliability.',
    level: 1,
    maxLevel: 10,
    cost: 200,
    icon: '🚀',
    multiplier: 1.8,
  },
];

export const LOADING_TIPS = [
  "💡 TIP: Keep your elevator well-oiled to prevent sudden gridlock breakdowns!",
  "💡 TIP: Upgrade the Plush Velvet Beds to secure high checkout rents per room.",
  "💡 TIP: Gold-star cooking scores depend on perfect timing! Flip patties when the timer hits GREEN.",
  "💡 TIP: Hiring a receptionist handles the lobby desk automatically so you can focus on the kitchen!",
  "💡 TIP: Satisfied guests leave glowingly stellar reviews on HustleAdvisor, raising your overall Rating!",
  "💡 TIP: The Rooftop Lounge Soda fills quickly, but overflowing the cup reduces dish perfection.",
  "💡 TIP: Don't let clean-up drag on! Keep sweeping dirty suites to check in new VIP spenders.",
];

export const GUEST_NAMES = [
  "Lord Reginald", "Sasha Glam", "Billy Bouncer", "Madame Fontaine", "DJ Spin",
  "Chloe Influencer", "Baron Von Rich", "Gamer Gertrude", "Officer Pete", "Chef Pierre",
  "Penny Pincher", "Calamity Jane", "Dr. Winston", "Mimi Maverick", "Brody Surfer",
  "Nona Knit", "Arthur Agent", "Clara Jetset", "Sir Reginald", "Countess Vera"
];

export const GUEST_EMOJIS = [
  { emoji: "🤠", color: "from-amber-400 to-yellow-600" },
  { emoji: "👸", color: "from-pink-400 to-rose-600" },
  { emoji: "🎩", color: "from-slate-700 to-slate-900" },
  { emoji: "🕶️", color: "from-teal-400 to-emerald-600" },
  { emoji: "👩", color: "from-purple-400 to-indigo-600" },
  { emoji: "🧔", color: "from-blue-400 to-blue-700" },
  { emoji: "👵", color: "from-violet-400 to-fuchsia-600" },
  { emoji: "👮", color: "from-cyan-400 to-sky-600" },
  { emoji: "🦊", color: "from-orange-400 to-red-600" },
  { emoji: "💅", color: "from-fuchsia-300 to-pink-500" },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev1',
    guestName: 'Lord Reginald',
    avatarEmoji: '🎩',
    avatarColor: 'from-slate-700 to-slate-900',
    rating: 5,
    comment: 'The suite is absolutely sublime! Serviced instantly, bed felt like clouds. A true five-star stay.',
    dishServed: 'Gold Plate Prime Steak',
    timestamp: 'Just now',
  },
  {
    id: 'rev2',
    guestName: 'Chloe Influencer',
    avatarEmoji: '💅',
    avatarColor: 'from-fuchsia-300 to-pink-500',
    rating: 4,
    comment: 'Gorgeous glowing neon aesthetic. Totally fits my grid! The pancakes were perfectly fluffy, though the lobby had a short line.',
    dishServed: 'Skyline Pancake Stack',
    timestamp: '15m ago',
  },
  {
    id: 'rev3',
    guestName: 'Dr. Winston',
    avatarEmoji: '🕶️',
    avatarColor: 'from-teal-400 to-emerald-600',
    rating: 2,
    comment: 'Elevator stalled mid-trip and my burger was slightly overcooked on the edges. The service has potential, but needs staff support.',
    dishServed: 'Deluxe Suite Burger',
    timestamp: '2h ago',
  }
];

export const CARS = [
  { id: 'c1', color: 'bg-red-500', speed: 8, icon: '🚗', top: 'top-1/4' },
  { id: 'c2', color: 'bg-yellow-400', speed: 12, icon: '🚕', top: 'top-1/3' },
  { id: 'c3', color: 'bg-blue-500', speed: 6, icon: '🚙', top: 'top-1/2' },
  { id: 'c4', color: 'bg-green-400', speed: 10, icon: '🏎️', top: 'top-2/3' },
];
