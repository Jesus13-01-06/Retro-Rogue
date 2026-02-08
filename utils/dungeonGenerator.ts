import { TileType, Position } from '../types';
import { MAP_HEIGHT, MAP_WIDTH } from '../constants';

export const generateDungeon = (level: number) => {
  // 1. Initialize full wall map
  const map: TileType[][] = Array.from({ length: MAP_HEIGHT }, () =>
    Array(MAP_WIDTH).fill(TileType.WALL)
  );

  // 2. Random Walk Algorithm for organic caves/corridors
  const floorTiles: Position[] = [];
  let x = Math.floor(MAP_WIDTH / 2);
  let y = Math.floor(MAP_HEIGHT / 2);
  let maxFloors = Math.floor(MAP_WIDTH * MAP_HEIGHT * 0.45); // 45% fill

  // Starting point
  map[y][x] = TileType.FLOOR;
  floorTiles.push({ x, y });

  while (floorTiles.length < maxFloors) {
    const direction = Math.floor(Math.random() * 4);
    if (direction === 0) y--; // Up
    else if (direction === 1) y++; // Down
    else if (direction === 2) x--; // Left
    else if (direction === 3) x++; // Right

    // Clamp to bounds (leave 1 tile padding)
    if (x < 1) x = 1;
    if (x > MAP_WIDTH - 2) x = MAP_WIDTH - 2;
    if (y < 1) y = 1;
    if (y > MAP_HEIGHT - 2) y = MAP_HEIGHT - 2;

    if (map[y][x] === TileType.WALL) {
      map[y][x] = TileType.FLOOR;
      floorTiles.push({ x, y });
    }
  }

  // 3. Place Exit (furthest from start roughly)
  // Simple heuristic: just the last tile generated
  const lastTile = floorTiles[floorTiles.length - 1];
  map[lastTile.y][lastTile.x] = TileType.EXIT;

  // 4. Determine Spawn Points
  const startPos = floorTiles[0];

  // Helper to find random empty floor tile
  const getRandomFloor = (): Position => {
    let tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
    // Simple retry if it matches start or exit
    // In a real app we'd filter, but retrying is cheap here
    while (
      (tile.x === startPos.x && tile.y === startPos.y) ||
      (tile.x === lastTile.x && tile.y === lastTile.y)
    ) {
      tile = floorTiles[Math.floor(Math.random() * floorTiles.length)];
    }
    return tile;
  };

  // 5. Generate Enemy Positions
  // More enemies as level increases
  const enemyCount = 3 + Math.floor(level * 1.5);
  const enemyPositions: Position[] = [];

  for (let i = 0; i < enemyCount; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const tile = getRandomFloor();
      // Avoid stacking enemies
      if (!enemyPositions.some(p => p.x === tile.x && p.y === tile.y)) {
         enemyPositions.push(tile);
         break;
      }
      attempts++;
    }
  }

  // 6. Generate Item Positions
  // Random count: 1 to 4 chests
  const itemCount = Math.floor(Math.random() * 3) + 2; 
  const itemPositions: Position[] = [];

  for (let i = 0; i < itemCount; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const tile = getRandomFloor();
      // Avoid stacking items, enemies, or existing items
      const hasEnemy = enemyPositions.some(p => p.x === tile.x && p.y === tile.y);
      const hasItem = itemPositions.some(p => p.x === tile.x && p.y === tile.y);
      
      if (!hasEnemy && !hasItem) {
        itemPositions.push(tile);
        break;
      }
      attempts++;
    }
  }

  return { map, startPos, enemyPositions, itemPositions };
};