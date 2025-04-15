
import { useEffect, useState, useRef } from 'react';
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
  const prevTimeRef = useRef(currentTime);

  useEffect(() => {
    // Only update tiles if time has actually changed to prevent unnecessary rerenders
    if (prevTimeRef.current !== currentTime) {
      prevTimeRef.current = currentTime;
      
      // Filter tiles that should be visible based on time
      const visibleTiles = tiles.filter(tile => {
        const timeToHit = tile.time - currentTime;
        return timeToHit > -0.5 && timeToHit < fallDuration;
      });
      
      setActiveTiles(visibleTiles);
    }
  }, [tiles, currentTime, fallDuration]);

  const handleHit = (tileId: string, accuracy: HitAccuracy) => {
    // Add hit effect
    const newHitEffect = { id: tileId, accuracy };
    setHitEffects(prev => [...prev, newHitEffect]);
    
    // Remove hit effect after animation completes
    setTimeout(() => {
      setHitEffects(prev => prev.filter(effect => effect.id !== tileId));
    }, 1000);
    
    // Pass hit to parent
    onHit(tileId, accuracy);
  };

  return (
    <div className="lane relative h-full" style={{ width: `${width}px` }}>
      {/* Display active tiles */}
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
      
      {/* Hit effects */}
      <AnimatePresence>
        {hitEffects.map(effect => (
          <motion.div
            key={effect.id}
            className={`absolute bottom-12 left-0 right-0 text-center font-bold text-xl z-10 ${effect.accuracy}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {effect.accuracy === 'perfect' ? 'PERFECT' : effect.accuracy === 'good' ? 'GOOD' : 'MISS'}
            
            {/* Visual hit effect */}
            {effect.accuracy !== 'miss' && (
              <motion.div
                className="hit-effect"
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
