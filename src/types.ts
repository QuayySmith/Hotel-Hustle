/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 
  | 'loading' 
  | 'menu' 
  | 'hotel' 
  | 'cooking' 
  | 'delivery' 
  | 'upgrades' 
  | 'staff' 
  | 'reviews';

export type DishId = 'burger' | 'pizza' | 'steak' | 'pancakes' | 'drink';

export interface Dish {
  id: DishId;
  name: string;
  icon: string;
  price: number;
  ingredients: string[];
  cookTimeSeconds: number;
  description: string;
}

export interface Guest {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  status: 'lobby_waiting' | 'assigned_room' | 'ordering' | 'waiting_delivery' | 'eating' | 'dirty_room' | 'checkout_completed';
  roomNumber: number | null;
  patience: number; // 0 to 100
  patienceMax: number;
  orderDishId: DishId | null;
  tipMultiplier: number;
}

export interface Room {
  number: number;
  floor: number;
  status: 'vacant' | 'occupied' | 'dirty' | 'cleaning';
  guestId: string | null;
  cleanProgress: number; // 0 to 100
  bedLevel: number;
  tvLevel: number;
  lampLevel: number;
  locked?: boolean;
  unlockCost?: number;
}

export interface Staff {
  id: string;
  role: 'receptionist' | 'chef' | 'housekeeper' | 'bellhop' | 'maintenance' | 'manager';
  name: string;
  emoji: string;
  hired: boolean;
  cost: number;
  level: number;
  perk: string;
  salary: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  icon: string;
  multiplier: number;
}

export interface Review {
  id: string;
  guestName: string;
  avatarEmoji: string;
  avatarColor: string;
  rating: number; // 1 to 5
  comment: string;
  dishServed: string | null;
  timestamp: string;
}

export interface GameState {
  level: number;
  xp: number;
  xpNeeded: number;
  money: number;
  rating: number; // overall out of 5
  soundOn: boolean;
  musicOn: boolean;
  activeScreen: ScreenType;
  elevatorFloor: number;
  elevatorStatus: 'working' | 'broken';
  elevatorRepairProgress: number;
}
