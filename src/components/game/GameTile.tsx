
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
  const hasBeenMissedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const startPosition = -20;
  const endPosition = window.innerHeight - 100;
  const hitLinePosition = window.innerHeight - 120;
  
  useEffect(() => {
    if (status === 'falling' && hitTime <= -0.3 && !hasBeenMissedRef.current) {
      hasBeenMissedRef.current = true;
      setStatus('missed');
      onHit(tile.id, 'miss');
    }
  }, [hitTime, status, tile.id, onHit]);

  const calculateAccuracy = (time: number): HitAccuracy => {
    const perfectThreshold = 0.08;
    const goodThreshold = 0.15;
    const absTime = Math.abs(time);
    
    if (absTime <= perfectThreshold) {
      return 'perfect';
    } else if (absTime <= goodThreshold) {
      return 'good';
    } else {
      return 'miss';
    }
  };

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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (status !== 'falling' || !touchStartRef.current || tile.type !== 'flick') return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 20;
    
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
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (status !== 'falling' || tile.type !== 'hold') return;
    handleHold();
    touchStartRef.current = null;
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

  const getTileContent = () => {
    if (tile.type === 'flick') {
      let Arrow = ArrowUp;
      switch (tile.direction) {
        case 'up': Arrow = ArrowUp; break;
        case 'down': Arrow = ArrowDown; break;
        case 'left': Arrow = ArrowLeft; break;
        case 'right': Arrow = ArrowRight; break;
      }
      return <Arrow className="w-6 h-6 text-white" />;
    }
    
    if (tile.type === 'tap') {
      return <div className="w-4 h-4 bg-white rounded-full" />;
    }
    
    if (tile.type === 'hold') {
      return <div className="w-4 h-full bg-white rounded-full opacity-80" />;
    }
    
    return null;
  };

  const getTileHeight = () => {
    if (tile.type === 'hold' && tile.duration) {
      return Math.max(60, tile.duration * 200);
    }
    return 60;
  };

  const getAnimationProgress = () => {
    if (hitTime > fallDuration) return 0;
    if (hitTime <= -0.3) return 1;
    return 1 - (hitTime / fallDuration);
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

  return (
    <motion.div
      ref={tileRef}
      className={getTileClassNames()}
      animate={
        status === 'hit'
          ? { 
              opacity: 0, 
              scale: 1.3,
              filter: 'brightness(1.5)',
              transition: { duration: 0.2 } 
            }
          : undefined
      }
      style={{
        width: laneWidth - 8,
        height: getTileHeight(),
        x: 4,
        y: startPosition + (getAnimationProgress() * (endPosition - startPosition)),
        background: `linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.3))`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (tile.type === 'tap') {
          handleTap();
        }
      }}
    >
      {getTileContent()}
    </motion.div>
  );
};

export default GameTile;
