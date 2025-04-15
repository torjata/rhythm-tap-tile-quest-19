
import { create } from 'zustand';
import { GameState } from '@/types/game';

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  combo: 0,
  maxCombo: 0,
  perfect: 0,
  good: 0,
  miss: 0,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  currentTime: 0,
  
  setScore: (score) => set({ score }),
  
  incrementCombo: () => set((state) => {
    const newCombo = state.combo + 1;
    return { 
      combo: newCombo, 
      maxCombo: newCombo > state.maxCombo ? newCombo : state.maxCombo 
    };
  }),
  
  resetCombo: () => set({ combo: 0 }),
  
  incrementPerfect: () => set((state) => ({ 
    perfect: state.perfect + 1,
    score: state.score + 100 * (1 + state.combo * 0.1)
  })),
  
  incrementGood: () => set((state) => ({ 
    good: state.good + 1,
    score: state.score + 50 * (1 + state.combo * 0.1)
  })),
  
  incrementMiss: () => set((state) => ({ 
    miss: state.miss + 1 
  })),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setIsPaused: (isPaused) => set({ isPaused }),
  
  setIsGameOver: (isGameOver) => set({ isGameOver }),
  
  setCurrentTime: (currentTime) => set({ currentTime }),
  
  resetGame: () => set({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    currentTime: 0,
  })
}));
