/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Upgrade } from './types';

export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  type: 'bun' | 'patty' | 'topping' | 'sauce';
}

export const BURGER_INGREDIENTS: Record<string, Ingredient> = {
  bun_bottom: { id: 'bun_bottom', name: 'Bottom Bun', icon: '🍞', type: 'bun' },
  bun_top: { id: 'bun_top', name: 'Top Bun', icon: '🥯', type: 'bun' },
  patty: { id: 'patty', name: 'Juicy Beef Patty', icon: '🥩', type: 'patty' },
  grilled_chicken: { id: 'grilled_chicken', name: 'Grilled Chicken', icon: '🍗', type: 'patty' },
  cheese: { id: 'cheese', name: 'Cheddar Cheese', icon: '🧀', type: 'topping' },
  lettuce: { id: 'lettuce', name: 'Crispy Lettuce', icon: '🥬', type: 'topping' },
  tomato: { id: 'tomato', name: 'Sliced Tomato', icon: '🍅', type: 'topping' },
  pickle: { id: 'pickle', name: 'Tangy Pickle', icon: '🥒', type: 'topping' },
  onion: { id: 'onion', name: 'Fresh Onion', icon: '🧅', type: 'topping' },
  bacon: { id: 'bacon', name: 'Crispy Bacon', icon: '🥓', type: 'topping' },
  jalapenos: { id: 'jalapenos', name: 'Jalapeños', icon: '🫑', type: 'topping' },
  mushrooms: { id: 'mushrooms', name: 'Mushrooms', icon: '🍄', type: 'topping' },
  sauce_ketchup: { id: 'sauce_ketchup', name: 'Classic Ketchup', icon: '🥫', type: 'sauce' },
  sauce_mustard: { id: 'sauce_mustard', name: 'Spicy Mustard', icon: '💛', type: 'sauce' },
  sauce_mayo: { id: 'sauce_mayo', name: 'Creamy Mayo', icon: '🤍', type: 'sauce' },
  sauce_bbq: { id: 'sauce_bbq', name: 'BBQ Sauce', icon: '🟤', type: 'sauce' },
};

export interface CustomerProfile {
  name: string;
  emoji: string;
  color: string;
  // What they like ordering:
  ordersBurger: boolean;
  ordersFries: boolean;
  ordersPizza: boolean;
  ordersMilkshake: boolean;
  ordersDrink: boolean;
  
  // Specific burger recipe:
  burgerRecipe?: string[];
  burgerDoneness?: 'rare' | 'medium' | 'well';
  
  // Pizza toppings:
  pizzaToppings?: string[];
  
  // Milkshake preferences:
  shakeFlavor?: 'chocolate' | 'strawberry' | 'vanilla';
  shakeSize?: 'S' | 'M' | 'L';
  
  // Drink:
  drinkFlavor?: 'cola' | 'lime' | 'orange' | 'rootbeer';
  drinkIce?: boolean;

  isReviewer?: boolean;
}

export const CUSTOMER_PROFILES: CustomerProfile[] = [
  {
    name: "Lord Reginald",
    emoji: "🎩",
    color: "from-slate-700 to-slate-900",
    ordersBurger: true,
    ordersFries: true,
    ordersPizza: false,
    ordersMilkshake: true,
    ordersDrink: false,
    burgerRecipe: ["bun_bottom", "patty", "cheese", "bacon", "sauce_mustard", "bun_top"],
    burgerDoneness: "well",
    shakeFlavor: "chocolate",
    shakeSize: "L"
  },
  {
    name: "Sasha Glam",
    emoji: "💅",
    color: "from-pink-400 to-rose-600",
    ordersBurger: true,
    ordersFries: false,
    ordersPizza: false,
    ordersMilkshake: true,
    ordersDrink: true,
    burgerRecipe: ["bun_bottom", "lettuce", "patty", "tomato", "pickle", "bun_top"],
    burgerDoneness: "rare",
    shakeFlavor: "strawberry",
    shakeSize: "S",
    drinkFlavor: "lime",
    drinkIce: true
  },
  {
    name: "Billy Bouncer",
    emoji: "🕶️",
    color: "from-teal-400 to-emerald-600",
    ordersBurger: true,
    ordersFries: true,
    ordersPizza: true,
    ordersMilkshake: false,
    ordersDrink: true,
    burgerRecipe: ["bun_bottom", "patty", "cheese", "patty", "bacon", "sauce_ketchup", "bun_top"],
    burgerDoneness: "medium",
    pizzaToppings: ["pepperoni", "mushroom"],
    drinkFlavor: "cola",
    drinkIce: false
  },
  {
    name: "Gamer Gertrude",
    emoji: "👩‍💻",
    color: "from-purple-400 to-indigo-600",
    ordersBurger: false,
    ordersFries: true,
    ordersPizza: true,
    ordersMilkshake: true,
    ordersDrink: false,
    pizzaToppings: ["onion", "pepperoni"],
    shakeFlavor: "vanilla",
    shakeSize: "M"
  },
  {
    name: "Officer Pete",
    emoji: "👮",
    color: "from-cyan-400 to-sky-600",
    ordersBurger: true,
    ordersFries: true,
    ordersPizza: false,
    ordersMilkshake: false,
    ordersDrink: true,
    burgerRecipe: ["bun_bottom", "patty", "cheese", "pickle", "onion", "sauce_ketchup", "bun_top"],
    burgerDoneness: "well",
    drinkFlavor: "rootbeer",
    drinkIce: true
  },
  {
    name: "Chef Pierre",
    emoji: "👨‍🍳",
    color: "from-orange-400 to-red-600",
    ordersBurger: true,
    ordersFries: false,
    ordersPizza: true,
    ordersMilkshake: false,
    ordersDrink: false,
    burgerRecipe: ["bun_bottom", "patty", "lettuce", "tomato", "onion", "sauce_mayo", "bun_top"],
    burgerDoneness: "rare",
    pizzaToppings: ["mushroom", "onion", "peppers"]
  },
  {
    name: "Jojo the Critic",
    emoji: "🦊",
    color: "from-amber-500 to-amber-700",
    ordersBurger: true,
    ordersFries: true,
    ordersPizza: true,
    ordersMilkshake: true,
    ordersDrink: true,
    burgerRecipe: ["bun_bottom", "patty", "cheese", "lettuce", "tomato", "pickle", "bacon", "sauce_ketchup", "bun_top"],
    burgerDoneness: "medium",
    pizzaToppings: ["pepperoni", "mushroom", "onion", "peppers"],
    shakeFlavor: "chocolate",
    shakeSize: "M",
    drinkFlavor: "cola",
    drinkIce: true,
    isReviewer: true
  },
  {
    name: "Mimi Maverick",
    emoji: "🤠",
    color: "from-yellow-400 to-amber-600",
    ordersBurger: true,
    ordersFries: true,
    ordersPizza: false,
    ordersMilkshake: true,
    ordersDrink: false,
    burgerRecipe: ["bun_bottom", "patty", "bacon", "cheese", "onion", "bun_top"],
    burgerDoneness: "well",
    shakeFlavor: "strawberry",
    shakeSize: "L"
  },
  {
    name: "Brody Surfer",
    emoji: "🏄",
    color: "from-blue-400 to-blue-700",
    ordersBurger: false,
    ordersFries: true,
    ordersPizza: true,
    ordersMilkshake: false,
    ordersDrink: true,
    pizzaToppings: ["pepperoni"],
    drinkFlavor: "orange",
    drinkIce: true
  }
];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'grill_booster',
    name: 'Infrared Griddle Coil',
    description: 'Speeds up burger patty cooking by 35%.',
    cost: 100,
    purchased: false,
    icon: '🔥'
  },
  {
    id: 'fryer_super',
    name: 'Auto-Basket Lifter',
    description: 'Increases fryer heating speed, preventing fries from getting cold.',
    cost: 120,
    purchased: false,
    icon: '🍟'
  },
  {
    id: 'pizza_turbo',
    name: 'Turbo Brick Jet Oven',
    description: 'Reduces pizza baking time by half so you never burn a crust!',
    cost: 150,
    purchased: false,
    icon: '🍕'
  },
  {
    id: 'blender_extreme',
    name: 'High-RPM Sonic Blender',
    description: 'Blends milkshakes instantly at the press of a button.',
    cost: 130,
    purchased: false,
    icon: '🌪️'
  },
  {
    id: 'jukebox',
    name: 'Foodaria Jukebox',
    description: 'Relaxes waiting customers, reducing patience loss rate by 40%.',
    cost: 180,
    purchased: false,
    icon: '📻'
  },
  {
    id: 'neon_sign',
    name: 'Quazzy’s Neon Mascot',
    description: 'Attracts high-tipping food lovers! Boosts all tip payments by 25%.',
    cost: 200,
    purchased: false,
    icon: '💡'
  }
];

export const LOADING_TIPS = [
  "💡 TIP: In the Fryer Station, drop raw potato wedges and lift them once the progress reaches golden green zone!",
  "💡 TIP: Keep your eyes on multiple stations! Active cooking timers will continue while you are building a pizza.",
  "💡 TIP: Pizza dough must be stretched to 100% before adding marinara sauce and toppings.",
  "💡 TIP: Doneness is everything! Jojo the Critic hates overcooked or undercooked beef patties.",
  "💡 TIP: When pouring fizzy sodas, release the pour button before the liquid level overflows the rim!",
  "💡 TIP: Once every ordered item is complete, pack them in the Bag at the Packaging Station to serve."
];
