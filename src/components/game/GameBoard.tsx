import { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import GameLane from './GameLane';
import { BeatMap, HitAccuracy } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader, Home, Star, PlayCircle } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
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
        setBoardHeight(window.innerHeight * 0.8);
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
    setIsLoading(true);
    setShowTutorial(false);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      
      // Use setTimeout to give a moment for the video to begin loading
      setTimeout(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }, 2000);
    }
  };

  const handlePlayerReady = () => {
    console.log("Player is ready");
  };

  const handlePlayerError = (error: any) => {
    console.error("Player error:", error);
    setIsLoading(false);
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

  const handleBackToMenu = () => {
    window.location.reload();
  };

  const renderDecorations = () => {
    const decorations = [];
    
    // Add stars
    for (let i = 0; i < 8; i++) {
      decorations.push(
        <div 
          key={`star-${i}`}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      );
    }
    
    // Add dots
    for (let i = 0; i < 8; i++) {
      decorations.push(
        <div 
          key={`blue-dot-${i}`}
          className="dot dot-blue"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 5}px`,
            height: `${Math.random() * 8 + 5}px`,
          }}
        />
      );
      
      decorations.push(
        <div 
          key={`orange-dot-${i}`}
          className="dot dot-orange"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 5}px`,
            height: `${Math.random() * 8 + 5}px`,
          }}
        />
      );
    }
    
    return decorations;
  };

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      <div className="invisible absolute" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${beatmap.videoId}`}
          playing={isPlaying && !isPaused}
          controls={false}
          width="1px"
          height="1px"
          onReady={handlePlayerReady}
          onError={handlePlayerError}
          config={{
            youtube: {
              playerVars: {
                start: 0,
                disablekb: 1,
              },
            },
          }}
        />
      </div>
      
      {/* Game information top bar */}
      <div className="game-top-bar w-full py-3 px-4 flex justify-between items-center z-10">
        <button 
          onClick={handleBackToMenu}
          className="rounded-full p-2 bg-white shadow-md"
        >
          <Home size={20} className="text-gray-700" />
        </button>
        
        <div className="flex gap-2 items-center">
          <div className="bg-white px-3 py-1 rounded-full shadow-md">
            <span className="text-sm font-bold text-gray-700">
              Score: {Math.floor(score)}
            </span>
          </div>
          
          <motion.div
            key={combo}
            initial={{ scale: combo > 0 ? 0.8 : 1 }}
            animate={{ scale: combo > 0 ? [0.8, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#C5F82A] px-3 py-1 rounded-full shadow-md flex items-center gap-1"
          >
            <Star size={16} className="text-black" />
            <span className="text-sm font-bold text-black">{combo}x</span>
          </motion.div>
        </div>
      </div>
      
      {/* Main game board */}
      <div 
        ref={gameBoardRef} 
        className="w-full flex-grow relative bg-white"
        style={{ height: `${boardHeight}px` }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          {renderDecorations()}
        </div>
        
        {/* Game title */}
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-lg font-bold text-[#1EAEDB] opacity-40">
            {beatmap.title}
          </h2>
        </div>
        
        <div className="hit-line absolute bottom-20 w-full"></div>
        
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
        
        <div className="absolute bottom-0 w-full flex tap-area">
          {Array.from({ length: COLUMNS }).map((_, index) => (
            <div 
              key={index} 
              className="h-20 flex items-center justify-center"
              style={{ width: `${laneWidth}px` }}
            >
              <div className="w-16 h-6 rounded-full bg-[#1EAEDB] bg-opacity-10"></div>
            </div>
          ))}
        </div>
        
        {/* Tutorial overlay */}
        {!isPlaying && showTutorial && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95">
            <h3 className="text-2xl font-bold text-[#1EAEDB] mb-8">How to Play</h3>
            
            <div className="flex space-x-8 mb-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#1EAEDB] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">Tap</span>
                </div>
                <span className="text-sm text-gray-700">Tap once when<br/>tile reaches line</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#C5F82A] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-black font-bold">Hold</span>
                </div>
                <span className="text-sm text-gray-700">Press & hold<br/>until end of tile</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#ff6e3c] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">Flick</span>
                </div>
                <span className="text-sm text-gray-700">Swipe in the<br/>arrow direction</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 bg-[#C5F82A] text-black rounded-full text-xl font-bold shadow-lg flex items-center gap-2"
            >
              <PlayCircle size={24} />
              START GAME
            </motion.button>
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p className="text-[#1EAEDB] font-bold">Loading music...</p>
          </div>
        )}
        
        {/* Start button if not in tutorial or loading */}
        {!isPlaying && !showTutorial && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 bg-[#C5F82A] text-black rounded-full text-xl font-bold shadow-lg flex items-center gap-2"
            >
              <PlayCircle size={24} />
              START
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
