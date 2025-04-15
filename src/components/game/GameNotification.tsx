
import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

const GameNotification: React.FC = () => {
  const { lastAction } = useGameStore();
  
  useEffect(() => {
    if (!lastAction) return;
    
    if (lastAction.type === 'perfect') {
      toast('Perfect!', {
        duration: 800,
        className: 'bg-green-500 text-white font-semibold'
      });
    } 
    else if (lastAction.type === 'good') {
      toast('Good', {
        duration: 800,
        className: 'bg-blue-500 text-white'
      });
    }
    else if (lastAction.type === 'miss') {
      toast('Miss', {
        duration: 800,
        className: 'bg-red-500 text-white'
      });
    }
    else if (lastAction.type === 'streak' && lastAction.value) {
      toast(`${lastAction.value} Combo!`, {
        duration: 1200,
        className: 'bg-purple-500 text-white font-bold'
      });
    }
  }, [lastAction]);
  
  return null;
};

export default GameNotification;
