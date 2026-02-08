import React from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useMusic } from './hooks/useMusic';
import { Grid } from './components/Grid';
import { StatusPanel, StartScreen, GameOverScreen, VictoryScreen } from './components/UIOverlay.tsx';
import { GameLog } from './components/GameLog';

const App = () => {
  const { gameState, startGame, restartGame, isDamaged, isHealed } = useGameLoop();

  // Play music only when the game status is 'PLAYING'
  useMusic(gameState.status === 'PLAYING');

  // "Mismo efecto": Aplicar la animación de temblor (shake) tanto para daño como para curación
  const triggerShake = isDamaged || isHealed;

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-200 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Damage/Heal Flash Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none z-40 transition-colors duration-100 
          ${isDamaged ? 'bg-red-600/30' : ''} 
          ${isHealed ? 'bg-green-500/30' : ''}
        `}
      />

      {/* Game Container */}
      <div className={`relative flex flex-col md:flex-row gap-6 max-w-6xl w-full ${triggerShake ? 'animate-shake' : ''}`}>
        
        {/* Left: Status Panel */}
        <StatusPanel gameState={gameState} />

        {/* Right: Main Game Area */}
        <div className="flex-1 flex flex-col items-center">
          <Grid gameState={gameState} />
          <div className="w-full max-w-[calc(25*2rem)]"> {/* Match grid max width roughly */}
            <GameLog logs={gameState.log} />
          </div>
        </div>

        {/* Overlays */}
        {gameState.status === 'START' && <StartScreen onStart={startGame} />}
        {gameState.status === 'GAME_OVER' && <GameOverScreen score={gameState.score} onRestart={restartGame} />}
        {gameState.status === 'VICTORY' && <VictoryScreen score={gameState.score} onRestart={restartGame} />}
      
      </div>
    </div>
  );
};

export default App;