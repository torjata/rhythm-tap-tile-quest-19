
export type TileType = 'tap' | 'hold' | 'flick';
export type FlickDirection = 'up' | 'down' | 'left' | 'right';
export type HitAccuracy = 'perfect' | 'good' | 'miss';

export interface GameAction {
  type: 'perfect' | 'good' | 'miss' | 'streak';
  timestamp: number;
  value?: number;
}

export interface Tile {
  id: string;
  type: TileType;
  column: number;
  time: number;
  duration?: number;
  direction?: FlickDirection;
}

export interface BeatMap {
  videoId: string;
  title: string;
  artist: string;
  bpm: number;
  offset: number;
  tiles: Tile[];
}

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  miss: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  currentTime: number;
  lastAction?: GameAction;
  setScore: (score: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  incrementPerfect: () => void;
  incrementGood: () => void;
  incrementMiss: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setIsGameOver: (isGameOver: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  resetGame: () => void;
}
