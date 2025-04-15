
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameTile from './GameTile';
import { Tile, HitAccuracy } from '@/types/game';

interface GameLaneProps {
  column: number;
  tiles: Tile[];
  currentTime: number;
  onHit: (tileId: string, accuracy: HitAccuracy) => void;
  fallDuration: number;
  width: number;
}

const GameLane = ({ column, tiles, currentTime, onHit, fallDuration, width }: GameLaneProps) => {
  const [activeTiles, setActiveTiles] = useState<Tile[]>([]);
  const [hitEffects, setHitEffects] = useState<{ id: string; accuracy: HitAccuracy }[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const visibleTiles = tiles.filter(tile => {
      const timeToHit = tile.time - currentTime;
      return timeToHit > -0.5 && timeToHit < fallDuration;
    });
    setActiveTiles(visibleTiles);
  }, [tiles, currentTime, fallDuration]);

  const handleHit = (tileId: string, accuracy: HitAccuracy) => {
    const newHitEffect = { id: tileId, accuracy };
    setHitEffects(prev => [...prev, newHitEffect]);
    
    setTimeout(() => {
      setHitEffects(prev => prev.filter(effect => effect.id !== tileId));
    }, 1000);
    
    onHit(tileId, accuracy);
  };

  const getEffectColor = (accuracy: HitAccuracy) => {
    switch (accuracy) {
      case 'perfect': return 'rgba(197, 248, 42, 0.8)';
      case 'good': return 'rgba(30, 174, 219, 0.8)';
      case 'miss': return 'rgba(255, 110, 60, 0.5)';
    }
  };

  return (
    <div 
      className="lane relative h-full" 
      style={{ width: `${width}px` }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <AnimatePresence>
        {activeTiles.map(tile => (
          <GameTile
            key={tile.id}
            tile={tile}
            hitTime={tile.time - currentTime}
            onHit={handleHit}
            fallDuration={fallDuration}
            laneWidth={width}
          />
        ))}
      </AnimatePresence>
      
      {/* Interactive tap area */}
      <div 
        className={`absolute bottom-0 w-full h-20 tap-area ${isPressed ? 'active' : ''}`}
        style={{
          background: isPressed ? 'rgba(197, 248, 42, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          transition: 'background-color 0.1s ease-out',
          borderTop: '2px solid rgba(197, 248, 42, 0.3)'
        }}
      >
        <div className="w-16 h-6 mx-auto rounded-full bg-[#C5F82A] bg-opacity-10"></div>
      </div>
      
      {/* Hit effects */}
      <AnimatePresence>
        {hitEffects.map(effect => (
          <motion.div
            key={effect.id}
            className={`absolute bottom-20 left-0 right-0 text-center font-bold text-xl z-10 ${effect.accuracy}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {effect.accuracy.toUpperCase()}
            
            {effect.accuracy !== 'miss' && (
              <motion.div
                className="hit-effect"
                style={{ 
                  backgroundColor: getEffectColor(effect.accuracy),
                  boxShadow: `0 0 15px ${getEffectColor(effect.accuracy)}`
                }}
                initial={{ opacity: 0.8, scale: 0.5, width: width - 10, height: width - 10, x: 5, y: 30 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GameLane;
