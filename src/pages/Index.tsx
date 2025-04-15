
import { useState } from 'react';
import GameBoard from '@/components/game/GameBoard';
import { busBeatmap } from '@/data/beatmap';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { resetGame } = useGameStore();

  const handleStartGame = () => {
    resetGame();
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-game">
      {!gameStarted ? (
        <motion.div 
          className="h-screen w-full flex flex-col items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white text-center mb-6"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Rhythm Tap Tile Quest
          </motion.h1>
          
          {/* Song info */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white">BUS</h2>
            <p className="text-xl text-white opacity-80">Because of You, I Shine</p>
            <p className="text-white opacity-60">Japanese Version</p>
          </motion.div>
          
          {/* Image */}
          <motion.div 
            className="w-full max-w-md rounded-lg overflow-hidden mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <img 
              src="/lovable-uploads/2791945b-2be5-43d4-ae3e-7f0987314bfd.png" 
              alt="BUS - Because of You, I Shine" 
              className="w-full h-auto"
            />
          </motion.div>
          
          {/* Start button */}
          <motion.button
            className="bg-game-green text-black font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
          >
            TAP TO PLAY
          </motion.button>
          
          {/* Instructions */}
          <motion.div 
            className="mt-8 text-center text-white opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p>Tap, hold, and flick the falling tiles in rhythm with the music</p>
            <p className="text-sm mt-2">Optimized for mobile and tablet devices</p>
          </motion.div>
        </motion.div>
      ) : (
        <div className="w-full h-screen max-w-lg mx-auto pt-4">
          <GameBoard beatmap={busBeatmap} />
        </div>
      )}
    </div>
  );
};

export default Index;
