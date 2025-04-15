
import React, { useState, useRef, useEffect } from 'react';
import { Tile, TileType, FlickDirection } from '@/types/game';
import { Button } from '@/components/ui/button';
import { v4 } from '@/utils/uuid';
import { Record, StopCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface RecordModeProps {
  videoId: string;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTilesRecorded: (tiles: Tile[]) => void;
}

const RecordMode: React.FC<RecordModeProps> = ({
  videoId,
  isRecording,
  onStartRecording,
  onStopRecording,
  onTilesRecorded,
}) => {
  const [recordedTiles, setRecordedTiles] = useState<Tile[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  const [flickDirection, setFlickDirection] = useState<FlickDirection | null>(null);
  
  const playerRef = useRef<HTMLIFrameElement>(null);
  const playerAPIRef = useRef<any>(null);
  
  // Setup YouTube API
  useEffect(() => {
    if (!videoId) return;
    
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerAPIRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              updateTimeLoop();
            }
          }
        }
      });
    };
    
    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (playerAPIRef.current) {
        playerAPIRef.current.destroy();
      }
    };
  }, [videoId]);
  
  // Update time continuously when playing
  const updateTimeLoop = () => {
    if (playerAPIRef.current && playerAPIRef.current.getCurrentTime) {
      setCurrentTime(playerAPIRef.current.getCurrentTime());
      requestAnimationFrame(updateTimeLoop);
    }
  };
  
  const startRecording = () => {
    setRecordedTiles([]);
    onStartRecording();
    toast.success("Recording started. Press keys to create tiles.");
    
    if (playerAPIRef.current && playerAPIRef.current.playVideo) {
      playerAPIRef.current.playVideo();
    }
  };
  
  const stopRecording = () => {
    onStopRecording();
    
    if (playerAPIRef.current && playerAPIRef.current.pauseVideo) {
      playerAPIRef.current.pauseVideo();
    }
    
    // Finalize any ongoing hold
    if (holdStartTime !== null && activeColumn !== null) {
      const duration = currentTime - holdStartTime;
      if (duration > 0.2) { // Only register holds that are held for at least 0.2 seconds
        const holdTile: Tile = {
          id: v4(),
          type: 'hold',
          column: activeColumn,
          time: holdStartTime,
          duration: duration
        };
        
        setRecordedTiles(prev => [...prev, holdTile]);
      }
      
      setHoldStartTime(null);
      setActiveColumn(null);
    }
    
    // Notify parent of the recorded tiles
    onTilesRecorded(recordedTiles);
    toast.success(`Recording completed. ${recordedTiles.length} tiles created.`);
  };
  
  // Handle keydown for recording
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    let column: number | null = null;
    
    // Map keys to columns
    switch (e.key) {
      case 'd': column = 0; break;
      case 'f': column = 1; break;
      case 'j': column = 2; break;
      case 'k': column = 3; break;
      default: return; // Ignore other keys
    }
    
    if (column !== null) {
      // Start a potential hold
      if (holdStartTime === null) {
        setHoldStartTime(currentTime);
        setActiveColumn(column);
      }
    }
  };
  
  // Handle keyup for recording
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    let column: number | null = null;
    
    // Map keys to columns
    switch (e.key) {
      case 'd': column = 0; break;
      case 'f': column = 1; break;
      case 'j': column = 2; break;
      case 'k': column = 3; break;
      default: return; // Ignore other keys
    }
    
    if (column !== null && column === activeColumn && holdStartTime !== null) {
      const duration = currentTime - holdStartTime;
      
      if (duration < 0.2) {
        // Short press = tap
        const tapTile: Tile = {
          id: v4(),
          type: 'tap',
          column: column,
          time: holdStartTime
        };
        
        setRecordedTiles(prev => [...prev, tapTile]);
      } else {
        // Long press = hold
        const holdTile: Tile = {
          id: v4(),
          type: 'hold',
          column: column,
          time: holdStartTime,
          duration: duration
        };
        
        setRecordedTiles(prev => [...prev, holdTile]);
      }
      
      setHoldStartTime(null);
      setActiveColumn(null);
    }
  };
  
  // Handle flick gestures
  const handleFlick = (column: number, direction: FlickDirection) => {
    if (!isRecording) return;
    
    const flickTile: Tile = {
      id: v4(),
      type: 'flick',
      column: column,
      time: currentTime,
      direction: direction
    };
    
    setRecordedTiles(prev => [...prev, flickTile]);
    toast.success(`Flick ${direction} recorded`);
  };
  
  return (
    <div 
      className="flex flex-col items-center relative" 
      onKeyDown={handleKeyDown} 
      onKeyUp={handleKeyUp}
      tabIndex={0} // Make the div focusable to capture key events
    >
      <div className="mb-4 w-full">
        <div className="relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
          <div id="youtube-player" className="absolute inset-0"></div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-center mb-2">Current Time: {currentTime.toFixed(2)}s</p>
        {isRecording ? (
          <Button 
            variant="destructive" 
            onClick={stopRecording}
            className="flex items-center gap-2"
          >
            <StopCircle size={16} /> Stop Recording
          </Button>
        ) : (
          <Button 
            className="flex items-center gap-2" 
            onClick={startRecording}
          >
            <Record size={16} /> Start Recording
          </Button>
        )}
      </div>
      
      {isRecording && (
        <div className="grid grid-cols-4 gap-4 w-full max-w-md mb-6">
          {[0, 1, 2, 3].map(column => (
            <div key={column} className="flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-full border-2 mb-2 flex items-center justify-center cursor-pointer ${activeColumn === column ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onMouseDown={() => {
                  setHoldStartTime(currentTime);
                  setActiveColumn(column);
                }}
                onMouseUp={() => {
                  if (holdStartTime !== null && column === activeColumn) {
                    const duration = currentTime - holdStartTime;
                    
                    if (duration < 0.2) {
                      // Tap
                      const tapTile: Tile = {
                        id: v4(),
                        type: 'tap',
                        column: column,
                        time: holdStartTime
                      };
                      
                      setRecordedTiles(prev => [...prev, tapTile]);
                    } else {
                      // Hold
                      const holdTile: Tile = {
                        id: v4(),
                        type: 'hold',
                        column: column,
                        time: holdStartTime,
                        duration: duration
                      };
                      
                      setRecordedTiles(prev => [...prev, holdTile]);
                    }
                    
                    setHoldStartTime(null);
                    setActiveColumn(null);
                  }
                }}
              >
                {column + 1}
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <button 
                  className="p-1 bg-blue-100 rounded"
                  onClick={() => handleFlick(column, 'left')}
                >
                  <ArrowLeft size={14} />
                </button>
                <button 
                  className="p-1 bg-blue-100 rounded"
                  onClick={() => handleFlick(column, 'up')}
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  className="p-1 bg-blue-100 rounded"
                  onClick={() => handleFlick(column, 'right')}
                >
                  <ArrowRight size={14} />
                </button>
                <div className="col-span-3 flex justify-center">
                  <button 
                    className="p-1 bg-blue-100 rounded"
                    onClick={() => handleFlick(column, 'down')}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4 w-full">
        <h3 className="text-lg font-medium mb-2">Instructions</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Press <kbd>D</kbd>, <kbd>F</kbd>, <kbd>J</kbd>, <kbd>K</kbd> keys to record taps (column 1-4)</li>
          <li>Hold keys for hold notes</li>
          <li>Use buttons under each column for flick gestures</li>
          <li>Click on a column to record using mouse</li>
        </ul>
      </div>
      
      {recordedTiles.length > 0 && (
        <div className="text-sm text-gray-500">
          {recordedTiles.length} tiles recorded
        </div>
      )}
    </div>
  );
};

export default RecordMode;
