import { useState } from 'react';
import GameBoard from '@/components/game/GameBoard';
import { busBeatmap } from '@/data/beatmap';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Fullscreen, PlayCircle } from 'lucide-react';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { resetGame } = useGameStore();

  const handleStartGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const generateDecorations = () => {
    const decorations = [];
    
    for (let i = 0; i < 12; i++) {
      const size = Math.random() * 10 + 5;
      decorations.push(
        <motion.div
          key={`star-${i}`}
          className="star"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: size,
            height: size
          }}
        />
      );
    }
    
    for (let i = 0; i < 10; i++) {
      const size = Math.random() * 8 + 5;
      decorations.push(
        <motion.div
          key={`blue-dot-${i}`}
          className="dot dot-blue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ 
            duration: 0.5,
            delay: Math.random() * 1
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: size,
            height: size
          }}
        />
      );
    }
    
    for (let i = 0; i < 8; i++) {
      const size = Math.random() * 8 + 5;
      decorations.push(
        <motion.div
          key={`orange-dot-${i}`}
          className="dot dot-orange"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ 
            duration: 0.5,
            delay: Math.random() * 1 + 0.5
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: size,
            height: size
          }}
        />
      );
    }
    
    return decorations;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {generateDecorations()}
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5"></div>
      </div>
      
      {!gameStarted ? (
        <motion.div 
          className="h-screen w-full flex flex-col items-center justify-center p-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-[#C5F82A] font-bold text-4xl mb-2 tracking-wider"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            ビコーズ
          </motion.h2>
          
          <motion.h1 
            className="text-[#1EAEDB] text-5xl md:text-6xl font-bold text-center mb-2 tracking-tight leading-none"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            BECAUSE OF YOU,
          </motion.h1>
          
          <motion.div
            className="text-6xl md:text-7xl font-bold text-[#1EAEDB] text-center mb-4 tracking-tight leading-none"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-[#1EAEDB] font-bold" style={{ fontFamily: 'cursive' }}>I SHINE</span>
          </motion.div>
          
          <motion.div 
            className="text-[#1EAEDB] text-xl text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className="px-4 py-1 border-t border-b border-[#1EAEDB]">JAPANESE VERSION</span>
          </motion.div>
          
          <motion.button
            className="bg-gradient-to-r from-[#C5F82A] to-[#9EF82A] text-black font-bold text-2xl px-12 py-5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
          >
            <PlayCircle size={28} />
            TAP TO PLAY
          </motion.button>
          
          <motion.div 
            className="mt-10 text-center text-black opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-lg">Tap, hold, and flick the falling tiles in rhythm with the music</p>
            <p className="text-sm mt-2">Optimized for mobile and tablet devices</p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#1EAEDB] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-white font-bold">Tap</span>
                </div>
                <span className="text-xs">Tap once</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#C5F82A] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-black font-bold">Hold</span>
                </div>
                <span className="text-xs">Press & hold</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#ff6e3c] rounded-md mb-1 flex items-center justify-center">
                  <span className="text-white font-bold">Flick</span>
                </div>
                <span className="text-xs">Swipe direction</span>
              </div>
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
