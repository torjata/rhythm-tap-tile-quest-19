
import { motion } from 'framer-motion';
import { Tile, HitAccuracy } from '@/types/game';
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameTileProps {
  tile: Tile;
  hitTime: number;
  onHit: (tileId: string, accuracy: HitAccuracy) => void;
  fallDuration: number;
  laneWidth: number;
}

const GameTile = ({ tile, hitTime, onHit, fallDuration, laneWidth }: GameTileProps) => {
  const [status, setStatus] = useState<'falling' | 'hit' | 'missed'>('falling');
  const tileRef = useRef<HTMLDivElement>(null);
  const startPosition = -100; // Starting position off-screen
  const endPosition = 100; // Ending position (make sure it's at the bottom of the lane)
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const hasBeenMissedRef = useRef(false);

  useEffect(() => {
    // This prevents an infinite loop by only triggering the "miss" once
    if (status === 'falling' && hitTime <= -0.3 && !hasBeenMissedRef.current) {
      hasBeenMissedRef.current = true;
      setStatus('missed');
      onHit(tile.id, 'miss');
    }
  }, [hitTime, status, tile.id, onHit]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (status !== 'falling') return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    if (tile.type === 'tap') {
      handleTap();
    }
    
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (status !== 'falling' || !touchStartRef.current || tile.type !== 'flick') return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 20; // Reduced minimum distance for a swipe to make it easier
    
    // Determine swipe direction
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        const isRight = deltaX > 0;
        if ((isRight && tile.direction === 'right') || (!isRight && tile.direction === 'left')) {
          handleFlick();
        }
      } else {
        const isDown = deltaY > 0;
        if ((isDown && tile.direction === 'down') || (!isDown && tile.direction === 'up')) {
          handleFlick();
        }
      }
      
      touchStartRef.current = null;
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (status !== 'falling' || tile.type !== 'hold') return;
    handleHold();
    touchStartRef.current = null;
    e.preventDefault();
  };

  const handleTap = () => {
    if (status !== 'falling' || tile.type !== 'tap') return;
    
    const accuracy = calculateAccuracy(hitTime);
    setStatus('hit');
    onHit(tile.id, accuracy);
  };

  const handleHold = () => {
    if (status !== 'falling' || tile.type !== 'hold') return;
    
    const accuracy = calculateAccuracy(hitTime);
    setStatus('hit');
    onHit(tile.id, accuracy);
  };

  const handleFlick = () => {
    if (status !== 'falling' || tile.type !== 'flick') return;
    
    const accuracy = calculateAccuracy(hitTime);
    setStatus('hit');
    onHit(tile.id, accuracy);
  };

  const calculateAccuracy = (time: number): HitAccuracy => {
    const perfectThreshold = 0.15;
    const goodThreshold = 0.3;
    
    const absTime = Math.abs(time);
    
    if (absTime <= perfectThreshold) {
      return 'perfect';
    } else if (absTime <= goodThreshold) {
      return 'good';
    } else {
      return 'miss';
    }
  };

  const getTileContent = () => {
    if (tile.type === 'flick') {
      switch (tile.direction) {
        case 'up':
          return <ArrowUp className="w-6 h-6 text-white" />;
        case 'down':
          return <ArrowDown className="w-6 h-6 text-white" />;
        case 'left':
          return <ArrowLeft className="w-6 h-6 text-white" />;
        case 'right':
          return <ArrowRight className="w-6 h-6 text-white" />;
        default:
          return null;
      }
    }
    
    if (tile.type === 'tap') {
      return <div className="w-4 h-4 bg-white rounded-full"></div>;
    }
    
    return null;
  };

  const getTileClassNames = () => {
    const baseClasses = 'tile flex items-center justify-center';
    
    switch (tile.type) {
      case 'tap':
        return `${baseClasses} tile-tap`;
      case 'hold':
        return `${baseClasses} tile-hold`;
      case 'flick':
        return `${baseClasses} tile-flick`;
      default:
        return baseClasses;
    }
  };

  const getTileHeight = () => {
    if (tile.type === 'hold' && tile.duration) {
      // Hold notes have height based on duration
      return Math.max(60, tile.duration * 120);
    }
    return 60;
  };

  const getAnimationProgress = () => {
    if (hitTime > fallDuration) return 0;
    if (hitTime <= -0.3) return 1;
    
    // This ensures the tile reaches all the way to the bottom
    // The denominator is slightly larger to ensure the tile goes past the hit line
    return 1 - (hitTime / (fallDuration - 0.2));
  };

  return (
    <motion.div
      ref={tileRef}
      className={getTileClassNames()}
      style={{
        width: laneWidth - 8,
        height: getTileHeight(),
        x: 4,
        y: `calc(${startPosition}% + ${getAnimationProgress() * (endPosition - startPosition + 20)}%)`,
        opacity: status === 'hit' ? 0 : 1,
      }}
      animate={
        status === 'hit'
          ? { opacity: 0, scale: 1.3, transition: { duration: 0.2 } }
          : {}
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {getTileContent()}
    </motion.div>
  );
};

export default GameTile;
