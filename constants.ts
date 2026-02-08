export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 20;
export const MAX_LEVELS = 10;
export const POINTS_PER_KILL = 50;
export const POINTS_PER_LEVEL = 100;

export const INITIAL_PLAYER_HP = 100;
export const INITIAL_PLAYER_ATK = 5;
export const INITIAL_PLAYER_DEF = 0;

export const ENEMY_TYPES = [
  { name: 'Rata', symbol: 'r', hp: 10, color: 'text-gray-400', dmg: 2 },
  { name: 'Goblin', symbol: 'g', hp: 20, color: 'text-green-500', dmg: 4 },
  { name: 'Orco', symbol: 'O', hp: 40, color: 'text-green-700', dmg: 8 },
  { name: 'Demonio', symbol: 'D', hp: 80, color: 'text-red-600', dmg: 12 },
];

export const ITEM_DEFINITIONS = [
  { type: 'HEAL', name: 'Poción de Salud', value: 25, weight: 5 }, // Heals HP
  { type: 'ATK', name: 'Piedra de Afilar', value: 1, weight: 3 },      // +1 Attack
  { type: 'ATK', name: 'Espada Pesada', value: 2, weight: 1 },    // +2 Attack (Rare)
  { type: 'DEF', name: 'Parche de Cuero', value: 1, weight: 3 },  // +1 Defense
  { type: 'DEF', name: 'Placa de Hierro', value: 2, weight: 1 },     // +2 Defense (Rare)
];