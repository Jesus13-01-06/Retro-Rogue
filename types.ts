export type Position = {
  x: number;
  y: number;
};

export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  ITEM = 'ITEM'
}

export enum TileType {
  WALL = '#',
  FLOOR = '.',
  EXIT = '>'
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Position;
  hp: number;
  maxHp: number;
  name: string;
  symbol: string;
  color: string;
  attack: number;
  defense: number;
}

export interface Item {
  id: string;
  pos: Position;
  type: 'HEAL' | 'ATK' | 'DEF';
  value: number;
  name: string;
  symbol: string;
  color: string;
}

export interface GameState {
  level: number;
  score: number;
  map: TileType[][];
  player: Entity;
  enemies: Entity[];
  items: Item[];
  log: string[];
  status: 'START' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';
  turn: number;
}

export const MOVEMENT_KEYS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};