import React from 'react';
import { GameState, TileType, EntityType } from '../types';

interface GridProps {
  gameState: GameState;
}

export const Grid: React.FC<GridProps> = ({ gameState }) => {
  const { map, player, enemies, items } = gameState;

  if (!map || map.length === 0) return null;

  return (
    <div className="relative inline-block border-4 border-gray-700 bg-black p-2 rounded shadow-2xl">
      {map.map((row, y) => (
        <div key={y} className="flex">
          {row.map((tile, x) => {
            // Determine what to render
            let content = tile;
            let colorClass = 'text-gray-600'; // Default wall/floor

            if (tile === TileType.FLOOR) colorClass = 'text-gray-800';
            if (tile === TileType.WALL) colorClass = 'text-gray-600';
            if (tile === TileType.EXIT) {
                content = TileType.EXIT;
                colorClass = 'text-yellow-500 animate-pulse';
            }

            // Entities overlay map (Items, then Enemies, then Player)
            const item = items.find(i => i.pos.x === x && i.pos.y === y);
            const enemy = enemies.find(e => e.pos.x === x && e.pos.y === y);
            const isPlayer = player.pos.x === x && player.pos.y === y;

            if (isPlayer) {
              content = player.symbol as any;
              colorClass = player.color;
            } else if (enemy) {
              content = enemy.symbol as any;
              colorClass = enemy.color;
            } else if (item) {
              content = item.symbol as any;
              colorClass = item.color;
            }

            return (
              <div
                key={`${x}-${y}`}
                className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center font-bold text-lg md:text-xl leading-none select-none ${colorClass}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};