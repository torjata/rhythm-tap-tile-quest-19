import { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import GameLane from './GameLane';
import { BeatMap, HitAccuracy } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameBoardProps {
  beatmap: BeatMap;
}

const COLUMNS = 4;
const FALL_DURATION = 2; // seconds for tile to fall from top to bottom

const GameBoard = ({ beatmap }: GameBoardProps) => {
  const playerRef = useRef<ReactPlayer>(null);
  const gameBoardRef = useRef<HTMLDivElement>(null);
  const [laneWidth, setLaneWidth] = useState(0);
  const [boardHeight, setBoardHeight] = useState(0);
  const isMobile = useIsMobile();
  
  const {
    score,
    combo,
    isPlaying,
    isPaused,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    incrementCombo,
    resetCombo,
    incrementPerfect,
    incrementGood,
    incrementMiss,
  } = useGameStore();

  useEffect(() => {
    const calculateDimensions = () => {
      if (gameBoardRef.current) {
        const boardWidth = gameBoardRef.current.clientWidth;
        setLaneWidth(boardWidth / COLUMNS);
        setBoardHeight(window.innerHeight * 0.7);
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    const updateCurrentTime = () => {
      if (playerRef.current && isPlaying && !isPaused) {
        const currentTime = playerRef.current.getCurrentTime();
        setCurrentTime(currentTime);
      }
      
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    };
    
    if (isPlaying && !isPaused) {
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, isPaused, setCurrentTime]);

  const handleStart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      setIsPlaying(true);
    }
  };

  const handleTileHit = (tileId: string, accuracy: HitAccuracy) => {
    switch (accuracy) {
      case 'perfect':
        incrementPerfect();
        incrementCombo();
        break;
      case 'good':
        incrementGood();
        incrementCombo();
        break;
      case 'miss':
        incrementMiss();
        resetCombo();
        break;
    }
  };

  const getTilesForColumn = (column: number) => {
    return beatmap.tiles.filter(tile => tile.column === column);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="invisible absolute" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${beatmap.videoId}`}
          playing={isPlaying && !isPaused}
          controls={false}
          width="1px"
          height="1px"
          config={{
            playerVars: {
              start: 0,
              disablekb: 1,
            },
          }}
        />
      </div>
      
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-white">{beatmap.title}</h1>
        <p className="text-lg text-gray-300">{beatmap.artist}</p>
      </div>
      
      <div className="w-full flex justify-between items-center mb-2 px-4">
        <div className="text-white font-bold">
          Score: {Math.floor(score)}
        </div>
        <div className="text-white font-bold flex items-center">
          <motion.div
            key={combo}
            initial={{ scale: 1 }}
            animate={{ scale: combo > 0 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-game-green"
          >
            {combo}x Combo
          </motion.div>
        </div>
      </div>
      
      <div 
        ref={gameBoardRef} 
        className="w-full relative bg-game-darkpurple bg-opacity-80 rounded-lg overflow-hidden"
        style={{ height: `${boardHeight}px` }}
      >
        <div className="hit-line absolute bottom-12 w-full"></div>
        
        <div className="flex h-full">
          {Array.from({ length: COLUMNS }).map((_, index) => (
            <GameLane
              key={index}
              column={index}
              tiles={getTilesForColumn(index)}
              currentTime={currentTime}
              onHit={handleTileHit}
              fallDuration={FALL_DURATION}
              width={laneWidth}
            />
          ))}
        </div>
        
        <div className="absolute bottom-0 w-full flex">
          {Array.from({ length: COLUMNS }).map((_, index) => (
            <div 
              key={index} 
              className="h-12 border-t border-white border-opacity-20 flex items-center justify-center"
              style={{ width: `${laneWidth}px` }}
            >
              <div className="w-16 h-6 rounded-full bg-white bg-opacity-10"></div>
            </div>
          ))}
        </div>
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 bg-game-blue text-white rounded-full text-xl font-bold"
            >
              START
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
