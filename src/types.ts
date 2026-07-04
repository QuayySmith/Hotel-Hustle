/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 
  | 'loading' 
  | 'menu' 
  | 'gameplay';

export interface BurgerOrder {
  id: string;
  pattiesCount: number;
  doneness: 'rare' | 'medium' | 'well';
  layers: string[]; // e.g. ['bun_bottom', 'patty', 'cheese', 'lettuce', 'bun_top']
}

export interface PizzaOrder {
  toppings: string[]; // e.g. ['pepperoni', 'mushroom']
}

export interface MilkshakeOrder {
  size: 'Medium' | 'Large';
  flavor: 'Chocolate' | 'Strawberry' | 'Vanilla';
}

export interface DrinkOrder {
  size: 'Medium' | 'Large';
  flavor: 'Cola' | 'Lemon Lime' | 'Orange Soda';
}

export interface FryOrder {
  isSalted: boolean;
  isPackaged: boolean;
}

// Complete Order containing one or more items requested by a customer
export interface CustomerOrder {
  id: string;
  customerName: string;
  favoriteBurgerName: string;
  avatarEmoji: string;
  avatarColor: string;
  patience: number; // 0 to 100
  patienceMax: number;
  
  // Food items ordered
  burger?: BurgerOrder;
  fries?: FryOrder;
  pizza?: PizzaOrder;
  milkshake?: MilkshakeOrder;
  drink?: DrinkOrder;
  
  isReviewer?: boolean;
}

export interface Patty {
  id: string;
  side1Cooked: number; // 0 to 100
  side2Cooked: number;
  isFlipped: boolean;
  grillIndex: number | null; // null if on finished tray
  targetDoneness: 'rare' | 'medium' | 'well';
  isBurnt: boolean;
}

export interface FryerBasket {
  id: string;
  cookedProgress: number; // 0 to 100
  isFrying: boolean;
  isPulledUp: boolean;
  isSalted: boolean;
  isPackaged: boolean;
}

export interface PizzaState {
  step: 'stretch' | 'sauce' | 'cheese' | 'toppings' | 'slice' | 'box';
  hasSauce: boolean;
  hasCheese: boolean;
  toppings: string[];
  isBaking: boolean;
  bakeProgress: number; // 0 to 100
  isBakeCompleted: boolean;
  isSliced: boolean;
  isBurnt: boolean;
}

export interface MilkshakeState {
  step: 'cup' | 'flavor' | 'blend' | 'toppings';
  cupSelected: boolean;
  flavor: 'Chocolate' | 'Strawberry' | 'Vanilla' | null;
  isBlending: boolean;
  isBlended: boolean;
  hasWhippedCream: boolean;
  hasCherry: boolean;
}

export interface DrinkState {
  step: 'size' | 'ice' | 'flavor' | 'pour' | 'cap';
  size: 'Medium' | 'Large' | null;
  hasIce: boolean;
  flavor: 'Cola' | 'Lemon Lime' | 'Orange Soda' | null;
  fillProgress: number; // 0 to 100
  isOverflowed: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  icon: string;
}

export interface GameReview {
  id: string;
  customerName: string;
  avatarEmoji: string;
  avatarColor: string;
  burgerName: string;
  overallScore: number; // 0 to 100
  waitScore: number;
  grillScore: number;
  buildScore: number;
  feedback: string;
  tip: number;
}
