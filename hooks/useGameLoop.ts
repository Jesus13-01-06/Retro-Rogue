import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  EntityType,
  TileType,
  MOVEMENT_KEYS,
  Position,
  Entity,
  Item
} from '../types';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  MAX_LEVELS,
  INITIAL_PLAYER_HP,
  INITIAL_PLAYER_ATK,
  INITIAL_PLAYER_DEF,
  ENEMY_TYPES,
  POINTS_PER_KILL,
  POINTS_PER_LEVEL,
  ITEM_DEFINITIONS
} from '../constants';
import { generateDungeon } from '../utils/dungeonGenerator';

// --- Helpers for Procedural Generation & Scaling ---

const spawnEnemies = (level: number, positions: Position[]): Entity[] => {
  return positions.map((pos, idx) => {
    // 1. Select Enemy Type based on Depth
    let typeIndex = 0;
    if (level >= 3) typeIndex = Math.floor(Math.random() * 2); // Rat, Goblin
    if (level >= 5) typeIndex = Math.floor(Math.random() * 3); // Rat, Goblin, Orc
    if (level >= 8) typeIndex = Math.floor(Math.random() * 4); // All

    const template = ENEMY_TYPES[typeIndex];
    
    // 2. Scale Stats by Level
    const hpMultiplier = 1 + ((level - 1) * 0.1); 
    const atkBonus = Math.floor((level - 1) * 0.5); 

    return {
      id: `enemy-${level}-${idx}`,
      type: EntityType.ENEMY,
      pos,
      hp: Math.floor(template.hp * hpMultiplier),
      maxHp: Math.floor(template.hp * hpMultiplier),
      attack: template.dmg + atkBonus,
      defense: 0,
      name: template.name,
      symbol: template.symbol,
      color: template.color
    };
  });
};

const spawnItems = (level: number, positions: Position[]): Item[] => {
  return positions.map((pos, idx) => {
    // Weighted random selection
    const totalWeight = ITEM_DEFINITIONS.reduce((acc, item) => acc + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedItem = ITEM_DEFINITIONS[0];
    
    for (const item of ITEM_DEFINITIONS) {
      random -= item.weight;
      if (random <= 0) {
        selectedItem = item;
        break;
      }
    }

    // Scale Item Value based on Level
    let scaledValue = selectedItem.value;
    if (selectedItem.type === 'HEAL') {
        // Healing scales faster: +5 HP per level
        scaledValue += (level - 1) * 5;
    } else {
        // Stats scale slower: +1 every 3 levels
        scaledValue += Math.floor((level - 1) / 3);
    }

    return {
      id: `item-${level}-${idx}`,
      pos,
      type: selectedItem.type as any,
      value: scaledValue,
      name: selectedItem.name,
      symbol: '$', // Yellow chest
      color: 'text-yellow-400'
    };
  });
};

// --- Main Hook ---

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    map: [],
    player: {
      id: 'player',
      type: EntityType.PLAYER,
      pos: { x: 0, y: 0 },
      hp: INITIAL_PLAYER_HP,
      maxHp: INITIAL_PLAYER_HP,
      attack: INITIAL_PLAYER_ATK,
      defense: INITIAL_PLAYER_DEF,
      name: 'Héroe',
      symbol: '@',
      color: 'text-cyan-400'
    },
    enemies: [],
    items: [],
    log: ['Bienvenido a la mazmorra. Desciende al Nivel 10 para ganar.'],
    status: 'START',
    turn: 0
  });

  const [isDamaged, setIsDamaged] = useState(false);
  const [isHealed, setIsHealed] = useState(false);
  const prevHpRef = useRef(INITIAL_PLAYER_HP);

  // Effect to detect damage taken or healing
  useEffect(() => {
    if (gameState.player.hp < prevHpRef.current) {
      // Damage taken
      setIsDamaged(true);
      const timer = setTimeout(() => setIsDamaged(false), 300); 
      return () => clearTimeout(timer);
    } else if (gameState.player.hp > prevHpRef.current) {
      // Healed
      setIsHealed(true);
      const timer = setTimeout(() => setIsHealed(false), 300);
      return () => clearTimeout(timer);
    }
    prevHpRef.current = gameState.player.hp;
  }, [gameState.player.hp]);

  const getItemAt = (pos: Position, items: Item[]) => {
    return items.find(i => i.pos.x === pos.x && i.pos.y === pos.y);
  };

  const getEnemyAt = (pos: Position, enemies: Entity[]) => {
    return enemies.find(e => e.pos.x === pos.x && e.pos.y === pos.y);
  };

  const initLevel = useCallback((level: number, keepScore = 0, keepPlayer: Partial<Entity> = {}) => {
    const { map, startPos, enemyPositions, itemPositions } = generateDungeon(level);
    
    const enemies = spawnEnemies(level, enemyPositions);
    const items = spawnItems(level, itemPositions);

    setGameState(prev => ({
      ...prev,
      level,
      score: keepScore,
      map,
      player: { 
        ...prev.player, 
        pos: startPos, 
        ...keepPlayer
      },
      enemies,
      items,
      status: 'PLAYING',
      log: [`Entraste al Nivel ${level}.`, ...prev.log]
    }));
    
    // Reset ref on level init to prevent damage trigger on level load if stats change
    if (keepPlayer.hp) {
        prevHpRef.current = keepPlayer.hp;
    }
  }, []);

  // --- Core Action: Move Player ---
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState.status !== 'PLAYING') return;

    setGameState(prev => {
      const newX = prev.player.pos.x + dx;
      const newY = prev.player.pos.y + dy;

      // 1. Check Bounds & Walls
      if (
        newX < 0 || newX >= MAP_WIDTH ||
        newY < 0 || newY >= MAP_HEIGHT ||
        prev.map[newY][newX] === TileType.WALL
      ) {
        return prev;
      }

      // 2. Check Enemy Collision
      const targetEnemy = getEnemyAt({ x: newX, y: newY }, prev.enemies);
      let newEnemies = [...prev.enemies];
      let newScore = prev.score;
      let logMsg = '';

      if (targetEnemy) {
        const damage = Math.max(1, prev.player.attack); 
        const newEnemyHp = targetEnemy.hp - damage;
        
        logMsg = `Golpeas a ${targetEnemy.name} por ${damage} de daño.`;

        if (newEnemyHp <= 0) {
          logMsg += ` ¡${targetEnemy.name} muere! (+${POINTS_PER_KILL} pts)`;
          newScore += POINTS_PER_KILL;
          newEnemies = newEnemies.filter(e => e.id !== targetEnemy.id);
        } else {
          newEnemies = newEnemies.map(e => 
            e.id === targetEnemy.id ? { ...e, hp: newEnemyHp } : e
          );
        }

        return processEnemyTurn({
            ...prev,
            enemies: newEnemies,
            score: newScore,
            log: [logMsg, ...prev.log]
        });
      }

      // 3. Check Exit
      if (prev.map[newY][newX] === TileType.EXIT) {
        if (prev.level === MAX_LEVELS) {
           return {
             ...prev,
             status: 'VICTORY',
             score: prev.score + POINTS_PER_LEVEL * prev.level,
             log: ['¡Felicidades! ¡Has conquistado la mazmorra!', ...prev.log]
           };
        } else {
           // Generate Next Level Logic
           const nextLevel = prev.level + 1;
           const { map, startPos, enemyPositions, itemPositions } = generateDungeon(nextLevel);
           const enemies = spawnEnemies(nextLevel, enemyPositions);
           const items = spawnItems(nextLevel, itemPositions);

           return {
             ...prev,
             level: nextLevel,
             score: prev.score + POINTS_PER_LEVEL,
             map,
             player: { ...prev.player, pos: startPos }, 
             enemies,
             items,
             log: [`Descendiste al Nivel ${nextLevel}. (+${POINTS_PER_LEVEL} pts)`, ...prev.log]
           };
        }
      }

      // 4. Check Items (Chests)
      const targetItem = getItemAt({ x: newX, y: newY }, prev.items);
      let newItems = [...prev.items];
      let playerUpdates = { ...prev.player };
      
      if (targetItem) {
        if (targetItem.type === 'HEAL') {
          const healAmount = targetItem.value;
          playerUpdates.hp = Math.min(playerUpdates.maxHp, playerUpdates.hp + healAmount);
          logMsg = `Abres el cofre... ¡${targetItem.name}! Recuperas ${healAmount} PV.`;
        } else if (targetItem.type === 'ATK') {
          playerUpdates.attack += targetItem.value;
          logMsg = `Abres el cofre... ¡${targetItem.name}! Ataque aumentado en ${targetItem.value}.`;
        } else if (targetItem.type === 'DEF') {
          playerUpdates.defense += targetItem.value;
          logMsg = `Abres el cofre... ¡${targetItem.name}! Defensa aumentada en ${targetItem.value}.`;
        }
        newItems = newItems.filter(i => i.id !== targetItem.id);
      }

      // 5. Move to floor
      return processEnemyTurn({
        ...prev,
        player: { ...playerUpdates, pos: { x: newX, y: newY } },
        items: newItems,
        log: logMsg ? [logMsg, ...prev.log] : prev.log
      });
    });
  }, [gameState.status]);

  // --- Enemy AI ---
  const processEnemyTurn = (current: GameState): GameState => {
    let newPlayerHp = current.player.hp;
    let logUpdates: string[] = [];
    
    // Track occupied positions for this turn to prevent stacking
    // Initialize with player position
    const occupiedPositions = new Set<string>();
    occupiedPositions.add(`${current.player.pos.x},${current.player.pos.y}`);

    const movedEnemies: Entity[] = [];

    // Process each enemy
    for (const enemy of current.enemies) {
      const dist = Math.abs(enemy.pos.x - current.player.pos.x) + Math.abs(enemy.pos.y - current.player.pos.y);
      let newPos = { ...enemy.pos };
      let attacked = false;

      // 1. Attack if adjacent
      if (dist === 1) {
        const dmg = Math.max(1, enemy.attack - current.player.defense);
        newPlayerHp -= dmg;
        logUpdates.push(`¡${enemy.name} te golpea por ${dmg} de daño!`);
        attacked = true;
      }
      
      // 2. Move if close enough (Reduced range to 6)
      else if (dist <= 6) {
        let nextX = enemy.pos.x;
        let nextY = enemy.pos.y;
        
        // Simple greedy pathfinding
        if (enemy.pos.x < current.player.pos.x) nextX++;
        else if (enemy.pos.x > current.player.pos.x) nextX--;
        else if (enemy.pos.y < current.player.pos.y) nextY++;
        else if (enemy.pos.y > current.player.pos.y) nextY--;

        // Check if the intended tile is blocked by Wall OR another entity (Player or Enemy)
        // We use occupiedPositions to check against enemies that have *already moved* or *decided to stay* in this turn.
        const key = `${nextX},${nextY}`;
        const isWall = current.map[nextY][nextX] === TileType.WALL;
        const isTaken = occupiedPositions.has(key);

        if (!isWall && !isTaken) {
          newPos = { x: nextX, y: nextY };
        }
      }

      // Register final position for this enemy so others don't overlap
      occupiedPositions.add(`${newPos.x},${newPos.y}`);
      movedEnemies.push({ ...enemy, pos: newPos });
    }

    const isDead = newPlayerHp <= 0;
    
    return {
      ...current,
      player: { ...current.player, hp: newPlayerHp },
      enemies: movedEnemies,
      status: isDead ? 'GAME_OVER' : 'PLAYING',
      log: isDead ? ['¡Has muerto!', ...logUpdates, ...current.log] : [...logUpdates, ...current.log]
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'PLAYING') return;
      const key = e.key;
      // @ts-ignore
      const move = MOVEMENT_KEYS[key];
      if (move) {
        e.preventDefault();
        movePlayer(move.x, move.y);
      }
      if (key === ' ' || key === '.') {
         e.preventDefault();
         setGameState(prev => processEnemyTurn(prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, movePlayer]);

  const startGame = () => {
    initLevel(1);
  };

  const restartGame = () => {
    initLevel(1, 0, { hp: INITIAL_PLAYER_HP, maxHp: INITIAL_PLAYER_HP, attack: INITIAL_PLAYER_ATK, defense: INITIAL_PLAYER_DEF });
    prevHpRef.current = INITIAL_PLAYER_HP;
  };

  return { gameState, startGame, restartGame, isDamaged, isHealed };
};