
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
  const [isPressed, setIsPressed] = useState(false);
  const [swipeTrails, setSwipeTrails] = useState<{ id: string; x: number; y: number; rotation: number; width: number }[]>([]);
  const laneRef = useRef<HTMLDivElement>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (laneRef.current) {
      const touch = e.touches[0];
      const rect = laneRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Calculate trail angle based on touch movement
      const movementX = e.touches[0].clientX - e.touches[0].pageX + window.scrollX;
      const movementY = e.touches[0].clientY - e.touches[0].pageY + window.scrollY;
      const rotation = Math.atan2(movementY, movementX) * (180 / Math.PI);
      const trailLength = Math.sqrt(movementX * movementX + movementY * movementY) + 20;
      
      const trail = {
        id: `trail-${Date.now()}`,
        x,
        y,
        rotation,
        width: trailLength
      };
      
      setSwipeTrails(prev => [...prev, trail]);
      
      setTimeout(() => {
        setSwipeTrails(prev => prev.filter(t => t.id !== trail.id));
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <div 
      ref={laneRef}
      className="lane relative h-full" 
      style={{ width: `${width}px` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
      
      {/* Swipe trails */}
      {swipeTrails.map(trail => (
        <motion.div
          key={trail.id}
          className="swipe-trail"
          style={{
            position: 'absolute',
            left: trail.x,
            top: trail.y,
            width: `${trail.width}px`,
            transform: `translate(-50%, -50%) rotate(${trail.rotation}deg) translateX(${trail.width / 2}px)`,
            transformOrigin: 'left center',
          }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
      
      {/* Interactive tap area with gradient effect when pressed */}
      <div 
        className={`absolute bottom-0 w-full h-20 tap-area ${isPressed ? 'active' : ''}`}
        style={{
          background: isPressed 
            ? 'linear-gradient(to bottom, rgba(197, 248, 42, 0.1), rgba(197, 248, 42, 0.4))'
            : 'rgba(255, 255, 255, 0.1)',
          borderTop: '2px solid rgba(197, 248, 42, 0.3)',
          transition: 'background-color 0.15s ease-out',
        }}
      >
        <motion.div 
          className="w-16 h-6 mx-auto rounded-full"
          animate={{
            backgroundColor: isPressed 
              ? 'rgba(197, 248, 42, 0.4)'
              : 'rgba(197, 248, 42, 0.1)'
          }}
          transition={{ duration: 0.2 }}
        />
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
