
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'perfect' | 'streak';
}

export default function GameNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastAction = useGameStore((state) => state.lastAction);

  useEffect(() => {
    if (lastAction?.timestamp) {
      const newNotification: Notification = {
        id: Date.now(),
        message: lastAction.type === 'streak' 
          ? `${lastAction.value} COMBO!` 
          : 'PERFECT!',
        type: lastAction.type
      };

      setNotifications(prev => [...prev, newNotification]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 1000);
    }
  }, [lastAction]);

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`text-center font-bold text-2xl mb-2 ${
              notification.type === 'perfect' 
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
