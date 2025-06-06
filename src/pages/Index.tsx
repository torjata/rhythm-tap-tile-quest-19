import { useState } from 'react';
import GameBoard from '@/components/game/GameBoard';
import { busBeatmap } from '@/data/beatmap';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Home, Star, PlayCircle, Trophy, RotateCcw } from 'lucide-react';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { resetGame } = useGameStore();

  const handleStartGame = () => {
    resetGame();
    setGameStarted(true);
  };

  // Generate random decorative elements (dots and stars)
  const generateDecorations = () => {
    const decorations = [];
    
    // Add floating Japanese characters
    for (let i = 0; i < 12; i++) {
      const size = Math.random() * 30 + 20;
      const char = "ビコーズシャイン"[Math.floor(Math.random() * 7)];
      decorations.push(
        <motion.div
          key={`char-${i}`}
          className="absolute text-[#C5F82A] opacity-10 font-bold"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            fontSize: `${size}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {char}
        </motion.div>
      );
    }

    // Add stars and sparkles matching the poster
    for (let i = 0; i < 10; i++) {
      decorations.push(
        <motion.div
          key={`star-${i}`}
          className={`absolute ${i % 2 === 0 ? 'text-[#1EAEDB]' : 'text-[#ff6e3c]'}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 0]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          ✦
        </motion.div>
      );
    }
    
    return decorations;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {!gameStarted ? (
        <motion.div 
          className="h-screen w-full flex flex-col items-center justify-center p-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background decorations */}
          {generateDecorations()}
          
          {/* Japanese characters in green with floating animation */}
          <motion.h2
            className="text-[#C5F82A] font-bold text-4xl mb-2 tracking-wider"
            initial={{ y: -30, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              translateY: [0, -5, 0]
            }}
            transition={{ 
              delay: 0.1, 
              duration: 0.5,
              translateY: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            ビコーズ
          </motion.h2>
          
          {/* Title with wave animation */}
          <motion.h1 
            className="text-[#1EAEDB] text-5xl md:text-6xl font-bold text-center mb-2 tracking-tight leading-none"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>BECAUSE OF YOU,</span>
          </motion.h1>
          
          <motion.div
            className="text-6xl md:text-7xl font-bold text-[#1EAEDB] text-center mb-4 tracking-tight leading-none"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span 
              className="text-[#1EAEDB] font-bold" 
              style={{ fontFamily: 'cursive' }}
            >
              I SHINE
            </span>
          </motion.div>
          
          <motion.div 
            className="text-[#1EAEDB] text-xl text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.span 
              className="px-4 py-1 border-t border-b border-[#1EAEDB]"
              animate={{ 
                borderColor: ['rgba(30, 174, 219, 0.5)', 'rgba(30, 174, 219, 1)', 'rgba(30, 174, 219, 0.5)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              JAPANESE VERSION
            </motion.span>
          </motion.div>
          
          {/* Now we'll use an animated gradient background instead of image */}
          <motion.div 
            className="w-full max-w-md rounded-lg overflow-hidden mb-10 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div 
              className="aspect-video w-full rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(45deg, #1EAEDB, #C5F82A)',
                boxShadow: '0 10px 30px rgba(30, 174, 219, 0.3)'
              }}
              animate={{ 
                background: [
                  'linear-gradient(45deg, #1EAEDB, #C5F82A)',
                  'linear-gradient(45deg, #C5F82A, #ff6e3c)',
                  'linear-gradient(45deg, #ff6e3c, #1EAEDB)',
                  'linear-gradient(45deg, #1EAEDB, #C5F82A)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="text-4xl font-bold text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                B.U.S
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Start button with pulse animation */}
          <motion.button
            className="bg-[#C5F82A] text-black font-bold text-2xl px-12 py-5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              boxShadow: [
                '0 5px 15px rgba(197, 248, 42, 0.3)',
                '0 5px 25px rgba(197, 248, 42, 0.6)',
                '0 5px 15px rgba(197, 248, 42, 0.3)'
              ]
            }}
            transition={{ 
              delay: 0.7, 
              duration: 0.5,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <PlayCircle size={28} />
            </motion.div>
            TAP TO PLAY
          </motion.button>
          
          {/* Footer instruction */}
          <motion.div 
            className="mt-10 text-center text-black opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-lg">Tap, hold, and flick the falling tiles in rhythm with the music</p>
            <p className="text-sm mt-2">Optimized for mobile and tablet devices</p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-10 h-10 bg-[#1EAEDB] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-white font-bold">Tap</span>
                </div>
                <span className="text-xs">Tap once</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-10 h-10 bg-[#C5F82A] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-black font-bold">Hold</span>
                </div>
                <span className="text-xs">Press & hold</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-10 h-10 bg-[#ff6e3c] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-white font-bold">Flick</span>
                </div>
                <span className="text-xs">Swipe direction</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="fullscreen-game">
          <GameBoard beatmap={busBeatmap} />
        </div>
      )}
    </div>
  );
};

export default Index;
