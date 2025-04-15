
import { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import GameLane from './GameLane';
import { BeatMap, HitAccuracy } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Star, PlayCircle, Trophy, RotateCcw } from 'lucide-react';
import GameNotification from './GameNotification';

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
  const [gameEnded, setGameEnded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMobile = useIsMobile();
  
  const {
    score,
    combo,
    maxCombo,
    perfect,
    good,
    miss,
    isPlaying,
    isPaused,
    currentTime,
    isGameOver,
    setCurrentTime,
    setIsPlaying,
    setIsGameOver,
    incrementCombo,
    resetCombo,
    incrementPerfect,
    incrementGood,
    incrementMiss,
    resetGame,
  } = useGameStore();

  // Simulate loading progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      setLoadingProgress(0);
      
      timer = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return newProgress;
        });
      }, 50);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

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

  // Check if all tiles have been processed to trigger game over
  useEffect(() => {
    if (!isPlaying || gameEnded) return;
    
    const lastTileTime = Math.max(...beatmap.tiles.map(tile => tile.time));
    
    // If current time is past the last tile time + 2 seconds, end the game
    if (currentTime > lastTileTime + 2) {
      setTimeout(() => {
        setIsGameOver(true);
        setGameEnded(true);
      }, 500); // 0.5 second delay before showing game over screen
    }
  }, [currentTime, isPlaying, beatmap.tiles, setIsGameOver, gameEnded]);

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

  const handlePlayAgain = () => {
    resetGame();
    setGameEnded(false);
    setShowTutorial(true);
  };

  const renderDecorations = () => {
    const decorations = [];
    
    // Add stars
    for (let i = 0; i < 8; i++) {
      decorations.push(
        <motion.div 
          key={`star-${i}`}
          className="star"
          animate={{ 
            scale: [0.8, 1.2, 0.8], 
            opacity: [0.3, 0.8, 0.3] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 3
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
          }}
        />
      );
    }
    
    // Add dots
    for (let i = 0; i < 8; i++) {
      decorations.push(
        <motion.div 
          key={`blue-dot-${i}`}
          className="dot dot-blue"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ 
            repeat: Infinity,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 5}px`,
            height: `${Math.random() * 8 + 5}px`,
          }}
        />
      );
      
      decorations.push(
        <motion.div 
          key={`orange-dot-${i}`}
          className="dot dot-orange"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ 
            repeat: Infinity,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2 + 1
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 5}px`,
            height: `${Math.random() * 8 + 5}px`,
          }}
        />
      );

      decorations.push(
        <motion.div 
          key={`green-dot-${i}`}
          className="dot dot-green"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ 
            repeat: Infinity,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2 + 0.5
          }}
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

  // Calculate the total number of notes in the beatmap
  const totalNotes = beatmap.tiles.length;
  
  // Calculate accuracy percentage
  const calculateAccuracy = () => {
    if (totalNotes === 0) return 0;
    
    const weightedSum = perfect * 1 + good * 0.6;
    return (weightedSum / totalNotes) * 100;
  };
  
  // Get letter grade based on accuracy
  const getGrade = () => {
    const accuracy = calculateAccuracy();
    
    if (accuracy >= 95) return 'S';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 70) return 'C';
    if (accuracy >= 60) return 'D';
    return 'F';
  };

  const getGradeClass = () => {
    const grade = getGrade();
    return `grade-${grade.toLowerCase()}`;
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
            playerVars: {
              start: 0,
              disablekb: 1,
            }
          }}
        />
      </div>
      
      {/* Game notification component */}
      <GameNotification />
      
      {/* Game information top bar */}
      <div className="game-top-bar w-full py-3 px-4 flex justify-between items-center z-10">
        <button 
          onClick={handleBackToMenu}
          className="rounded-full p-2 bg-white shadow-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Home size={20} className="text-gray-700" />
        </button>
        
        <div className="flex gap-2 items-center">
          <motion.div 
            className="bg-white px-3 py-1 rounded-full shadow-md"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-sm font-bold text-gray-700">
              Score: {Math.floor(score)}
            </span>
          </motion.div>
          
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
        className="w-full flex-grow relative bg-gradient-to-b from-white to-blue-50"
        style={{ height: `${boardHeight}px` }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          {renderDecorations()}
        </div>
        
        {/* Game title */}
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-lg font-bold text-[#1EAEDB] opacity-40">
            {beatmap.title}
          </h2>
        </div>
        
        <motion.div 
          className="hit-line absolute bottom-20 w-full"
          animate={{ 
            boxShadow: ['0 0 8px rgba(197, 248, 42, 0.6)', '0 0 15px rgba(197, 248, 42, 0.8)', '0 0 8px rgba(197, 248, 42, 0.6)']
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
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
        
        {/* Game over screen */}
        {isGameOver && gameEnded && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="flex justify-center mb-6"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-20 h-20 bg-[#1EAEDB] rounded-full flex items-center justify-center">
                  <Trophy size={40} className="text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-center text-[#1EAEDB] mb-2">GAME CLEAR!</h2>
              <h3 className="text-xl text-center mb-6">{beatmap.title}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">SCORE</p>
                  <p className="text-2xl font-bold">{Math.floor(score)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-500 text-sm">GRADE</p>
                  <p className={`text-2xl font-bold ${getGradeClass()}`}>{getGrade()}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-500 text-sm">MAX COMBO</p>
                  <p className="text-xl font-bold">{maxCombo}x</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-500 text-sm">ACCURACY</p>
                  <p className="text-xl font-bold">{calculateAccuracy().toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-6">
                <motion.div 
                  className="text-center bg-[#C5F82A] bg-opacity-20 rounded-lg py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xs text-gray-600">PERFECT</p>
                  <p className="font-bold">{perfect}</p>
                </motion.div>
                
                <motion.div 
                  className="text-center bg-[#1EAEDB] bg-opacity-20 rounded-lg py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xs text-gray-600">GOOD</p>
                  <p className="font-bold">{good}</p>
                </motion.div>
                
                <motion.div 
                  className="text-center bg-[#ff6e3c] bg-opacity-20 rounded-lg py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-xs text-gray-600">MISS</p>
                  <p className="font-bold">{miss}</p>
                </motion.div>
              </div>
              
              <div className="flex space-x-3">
                <motion.button 
                  onClick={handleBackToMenu}
                  className="flex-1 py-3 px-4 rounded-full border-2 border-[#1EAEDB] text-[#1EAEDB] font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home size={18} />
                  HOME
                </motion.button>
                
                <motion.button 
                  onClick={handlePlayAgain}
                  className="flex-1 py-3 px-4 rounded-full bg-[#C5F82A] text-black font-bold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} />
                  PLAY AGAIN
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Tutorial overlay */}
        {!isPlaying && showTutorial && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 bg-opacity-95 z-50">
            <motion.h3 
              className="text-2xl font-bold text-[#1EAEDB] mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              How to Play
            </motion.h3>
            
            <div className="flex space-x-8 mb-10">
              <motion.div 
                className="flex flex-col items-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-[#1EAEDB] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">Tap</span>
                </div>
                <span className="text-sm text-gray-700">Tap once when<br/>tile reaches line</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-[#C5F82A] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-black font-bold">Hold</span>
                </div>
                <span className="text-sm text-gray-700">Press & hold<br/>until end of tile</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-[#ff6e3c] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-white font-bold">Flick</span>
                </div>
                <span className="text-sm text-gray-700">Swipe in the<br/>arrow direction</span>
              </motion.div>
            </div>
            
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
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
          <div className="loading-overlay bg-gradient-to-b from-white to-blue-50">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-5xl font-bold mb-8 text-[#1EAEDB]"
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: ['#1EAEDB', '#C5F82A', '#1EAEDB'],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                READY
              </motion.div>
              
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#C5F82A]"
                  style={{ width: `${loadingProgress}%` }}
                  initial={{ width: '0%' }}
                />
              </div>
              
              <p className="text-[#1EAEDB] font-bold mt-4">Loading music...</p>
            </motion.div>
          </div>
        )}
        
        {/* Start button if not in tutorial or loading */}
        {!isPlaying && !showTutorial && !isLoading && !gameEnded && (
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
