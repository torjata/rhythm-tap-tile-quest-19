
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'perfect' | 'good' | 'miss' | 'streak';
}

export default function GameNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastAction = useGameStore((state) => state.lastAction);

  useEffect(() => {
    if (lastAction?.timestamp) {
      let message = '';
      
      switch (lastAction.type) {
        case 'streak':
          message = `${lastAction.value} COMBO!`;
          break;
        case 'perfect':
          message = 'PERFECT!';
          break;
        case 'good':
          message = 'GOOD!';
          break;
        case 'miss':
          message = 'MISS';
          break;
      }
      
      const newNotification: Notification = {
        id: Date.now(),
        message,
        type: lastAction.type
      };

      setNotifications(prev => [...prev, newNotification]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 1000);
    }
  }, [lastAction]);

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`text-center font-bold text-2xl mb-2 ${
              notification.type === 'perfect' 
                ? 'text-[#C5F82A] text-shadow-glow'
                : notification.type === 'good'
                ? 'text-[#1EAEDB] text-shadow-glow'
                : notification.type === 'streak'
                ? 'text-yellow-400 text-shadow-glow'
                : 'text-[#ff6e3c] text-shadow-glow'
            }`}
            style={{
              textShadow: notification.type === 'perfect' 
                ? '0 0 10px rgba(197, 248, 42, 0.8)'
                : notification.type === 'good'
                ? '0 0 10px rgba(30, 174, 219, 0.8)'
                : notification.type === 'streak'
                ? '0 0 10px rgba(255, 215, 0, 0.8)'
                : '0 0 10px rgba(255, 110, 60, 0.8)'
            }}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
