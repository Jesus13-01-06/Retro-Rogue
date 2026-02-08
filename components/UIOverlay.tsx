import React from 'react';
import { GameState, EntityType } from '../types';
import { Heart, Trophy, Map, Skull, Sword, Shield, ArrowUp, MousePointer2 } from 'lucide-react';
import { INITIAL_PLAYER_HP, ENEMY_TYPES } from '../constants';

interface UIProps {
  gameState: GameState;
  onRestart: () => void;
  onStart: () => void;
}

export const StatusPanel: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const hpPercent = Math.max(0, (gameState.player.hp / INITIAL_PLAYER_HP) * 100);

  return (
    <div className="flex flex-col gap-4 w-full md:w-64 p-4 bg-gray-900 border-r-4 border-b-4 border-gray-800 rounded">
      <h1 className="text-3xl font-bold text-yellow-500 tracking-widest text-center mb-2">
        RETRO ROGUE
      </h1>
      
      {/* Stats */}
      <div className="space-y-4 font-mono text-xl">
        
        {/* Level */}
        <div className="flex items-center justify-between text-blue-400">
          <div className="flex items-center gap-2">
            <Map size={20} />
            <span>NIVEL</span>
          </div>
          <span className="text-2xl">{gameState.level}/10</span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between text-yellow-400">
           <div className="flex items-center gap-2">
            <Trophy size={20} />
            <span>PUNTOS</span>
          </div>
          <span>{gameState.score}</span>
        </div>

        {/* HP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-red-500">
             <div className="flex items-center gap-2">
                <Heart size={20} fill="currentColor" />
                <span>PV</span>
             </div>
             <span>{gameState.player.hp}</span>
          </div>
          <div className="w-full bg-gray-800 h-4 rounded overflow-hidden border border-gray-700">
            <div 
              className="bg-red-600 h-full transition-all duration-200" 
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-gray-800 my-2"></div>

        {/* Combat Stats */}
        <div className="flex items-center justify-between text-orange-400">
           <div className="flex items-center gap-2">
            <Sword size={20} />
            <span>ATQ</span>
          </div>
          <span>{gameState.player.attack}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
           <div className="flex items-center gap-2">
            <Shield size={20} />
            <span>DEF</span>
          </div>
          <span>{gameState.player.defense}</span>
        </div>

      </div>

      {/* Instructions */}
      <div className="mt-4 bg-gray-800 p-3 rounded border border-gray-700">
        <h3 className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider border-b border-gray-600 pb-1">CONTROLES</h3>
        <div className="text-sm text-gray-300 space-y-2 font-mono">
          <div className="flex items-start gap-2">
             <div className="bg-gray-700 px-1 rounded text-xs border border-gray-600">WASD</div>
             <span>Mover / Atacar</span>
          </div>
           <div className="flex items-start gap-2">
             <div className="bg-gray-700 px-1 rounded text-xs border border-gray-600">ESPACIO</div>
             <span>Esperar Turno</span>
          </div>
           <div className="flex items-start gap-2">
             <div className="text-yellow-400 font-bold">$</div>
             <span>Cofres</span>
          </div>
           <div className="flex items-start gap-2">
             <div className="text-yellow-500 font-bold animate-pulse">&gt;</div>
             <span>Salida</span>
          </div>
        </div>
      </div>

      {/* Enemy Legend */}
      <div className="mt-2 bg-gray-800 p-3 rounded border border-gray-700">
        <h3 className="text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider border-b border-gray-600 pb-1">ENEMIGOS</h3>
        <div className="text-sm text-gray-300 space-y-1 font-mono">
          {ENEMY_TYPES.map((e) => (
             <div key={e.name} className="flex items-center gap-2">
               <span className={`${e.color} font-bold w-4 text-center`}>{e.symbol}</span>
               <span>{e.name}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
    <div className="text-center space-y-6 max-w-lg p-8 border-4 border-gray-700 bg-gray-900 shadow-[0_0_50px_rgba(0,0,0,1)]">
      <h1 className="text-6xl font-bold text-yellow-500 mb-2 font-mono">RETRO ROGUE</h1>
      <p className="text-xl text-gray-300">
        Desciende a través de 10 niveles generados proceduralmente.
        <br/>
        Derrota enemigos para ganar puntos. Sobrevive.
      </p>
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white text-2xl font-bold rounded border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all"
      >
        ENTRAR
      </button>
    </div>
  </div>
);

export const GameOverScreen: React.FC<{ score: number, onRestart: () => void }> = ({ score, onRestart }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-md">
    <div className="text-center space-y-6 p-8 bg-black border-4 border-red-600 shadow-2xl animate-bounce-in">
      <Skull size={64} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-5xl font-bold text-red-500">HAS MUERTO</h2>
      <div className="text-2xl text-white">
        Puntuación Final: <span className="text-yellow-400">{score}</span>
      </div>
      <button 
        onClick={onRestart}
        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xl rounded border-b-4 border-gray-900 active:border-b-0 active:translate-y-1"
      >
        REINTENTAR
      </button>
    </div>
  </div>
);

export const VictoryScreen: React.FC<{ score: number, onRestart: () => void }> = ({ score, onRestart }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-yellow-900/40 backdrop-blur-md">
    <div className="text-center space-y-6 p-8 bg-black border-4 border-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.3)]">
      <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
      <h2 className="text-5xl font-bold text-yellow-400">¡VICTORIA!</h2>
      <p className="text-gray-300 text-lg">La mazmorra ha sido purgada.</p>
      <div className="text-3xl text-white">
        Puntuación Total: <span className="text-yellow-400 font-bold">{score}</span>
      </div>
      <button 
        onClick={onRestart}
        className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xl rounded border-b-4 border-blue-900 active:border-b-0 active:translate-y-1"
      >
        JUGAR DE NUEVO
      </button>
    </div>
  </div>
);