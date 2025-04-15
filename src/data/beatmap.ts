
import { BeatMap } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

// This is a simple beatmap for BUS - "Because of You, I Shine" (Japanese Version)
export const busBeatmap: BeatMap = {
  videoId: 'AFsHeF7SKDs',
  title: 'Because of You, I Shine',
  artist: 'BUS',
  bpm: 128,
  offset: 0.2, // Might need adjustment based on video start
  
  // Sample tiles - in a real implementation, you would time these carefully with the song
  tiles: [
    // Intro section
    { id: uuidv4(), type: 'tap', column: 0, time: 3.5 },
    { id: uuidv4(), type: 'tap', column: 1, time: 4.0 },
    { id: uuidv4(), type: 'tap', column: 2, time: 4.5 },
    { id: uuidv4(), type: 'tap', column: 3, time: 5.0 },
    { id: uuidv4(), type: 'tap', column: 2, time: 5.5 },
    { id: uuidv4(), type: 'tap', column: 1, time: 6.0 },
    { id: uuidv4(), type: 'hold', column: 0, time: 6.5, duration: 1.0 },
    { id: uuidv4(), type: 'tap', column: 3, time: 7.0 },
    { id: uuidv4(), type: 'tap', column: 2, time: 7.5 },
    { id: uuidv4(), type: 'flick', column: 1, time: 8.0, direction: 'right' },
    { id: uuidv4(), type: 'tap', column: 0, time: 8.5 },

    // More complex patterns
    { id: uuidv4(), type: 'tap', column: 0, time: 9.0 },
    { id: uuidv4(), type: 'tap', column: 3, time: 9.25 },
    { id: uuidv4(), type: 'tap', column: 1, time: 9.5 },
    { id: uuidv4(), type: 'tap', column: 2, time: 9.75 },
    { id: uuidv4(), type: 'hold', column: 0, time: 10.0, duration: 1.0 },
    { id: uuidv4(), type: 'hold', column: 3, time: 10.5, duration: 0.8 },
    { id: uuidv4(), type: 'flick', column: 1, time: 11.2, direction: 'up' },
    { id: uuidv4(), type: 'flick', column: 2, time: 11.5, direction: 'down' },
    
    // Continue with more tiles...
    { id: uuidv4(), type: 'tap', column: 0, time: 12.0 },
    { id: uuidv4(), type: 'tap', column: 1, time: 12.25 },
    { id: uuidv4(), type: 'tap', column: 2, time: 12.5 },
    { id: uuidv4(), type: 'tap', column: 3, time: 12.75 },
    { id: uuidv4(), type: 'tap', column: 3, time: 13.0 },
    { id: uuidv4(), type: 'tap', column: 2, time: 13.25 },
    { id: uuidv4(), type: 'tap', column: 1, time: 13.5 },
    { id: uuidv4(), type: 'tap', column: 0, time: 13.75 },
    
    // Add more tiles as needed for a complete beatmap
  ]
};
