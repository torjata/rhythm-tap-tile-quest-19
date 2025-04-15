
import React, { useState, useRef, useEffect } from 'react';
import { Tile, FlickDirection } from '@/types/game';
import { Button } from '@/components/ui/button';
import { v4 } from '@/utils/uuid';
import { Mic, StopCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Create refs for the player
  const playerRef = useRef<HTMLDivElement>(null);
  const playerAPIRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Load YouTube API
  useEffect(() => {
    if (!videoId) return;
    
    // Clean up any existing player
    if (playerAPIRef.current) {
      playerAPIRef.current.destroy();
      playerAPIRef.current = null;
    }
    
    // Only load the script once
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    // Create YouTube player when API is ready
    const createPlayer = () => {
      if (!playerRef.current) return;
      
      try {
        playerAPIRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            fs: 0,
          },
          events: {
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startTimeUpdate();
              } else if (event.data === window.YT.PlayerState.PAUSED || 
                         event.data === window.YT.PlayerState.ENDED) {
                stopTimeUpdate();
              }
            },
            onReady: () => {
              console.log("YouTube player is ready");
            },
            onError: (e: any) => {
              console.error("YouTube player error:", e);
              toast.error("Error loading YouTube video");
            }
          }
        });
      } catch (error) {
        console.error("Error creating YouTube player:", error);
        toast.error("Failed to initialize YouTube player");
      }
    };
    
    // Set up the callback that the YouTube API will call when ready
    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
    
    // If YT is already available, create the player immediately
    if (window.YT && window.YT.Player) {
      createPlayer();
    }
    
    // Cleanup function
    return () => {
      stopTimeUpdate();
      if (playerAPIRef.current && playerAPIRef.current.destroy) {
        playerAPIRef.current.destroy();
      }
      playerAPIRef.current = null;
    };
  }, [videoId]);
  
  // Functions to update the current time
  const startTimeUpdate = () => {
    const updateTime = () => {
      if (playerAPIRef.current && typeof playerAPIRef.current.getCurrentTime === 'function') {
        try {
          const time = playerAPIRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          console.error("Error getting current time:", error);
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };
  
  const stopTimeUpdate = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  // Start recording function
  const startRecording = () => {
    setRecordedTiles([]);
    onStartRecording();
    
    if (playerAPIRef.current && playerAPIRef.current.playVideo) {
      try {
        playerAPIRef.current.playVideo();
        toast.success("Recording started. Press keys or tap columns to create tiles.");
      } catch (error) {
        console.error("Error playing video:", error);
        toast.error("Failed to start playback");
      }
    } else {
      toast.error("YouTube player not ready");
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    // Complete any active hold note
    if (holdStartTime !== null && activeColumn !== null) {
      const duration = currentTime - holdStartTime;
      if (duration > 0.2) {
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
    
    if (playerAPIRef.current && playerAPIRef.current.pauseVideo) {
      try {
        playerAPIRef.current.pauseVideo();
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
    
    onStopRecording();
    onTilesRecorded(recordedTiles);
    toast.success(`Recording completed. ${recordedTiles.length} tiles created.`);
  };
  
  // Key handlers for keyboard recording
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    let column: number | null = null;
    
    switch (e.key) {
      case 'd': column = 0; break;
      case 'f': column = 1; break;
      case 'j': column = 2; break;
      case 'k': column = 3; break;
      default: return;
    }
    
    if (column !== null) {
      if (holdStartTime === null) {
        setHoldStartTime(currentTime);
        setActiveColumn(column);
        e.preventDefault();
      }
    }
  };
  
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    
    let column: number | null = null;
    
    switch (e.key) {
      case 'd': column = 0; break;
      case 'f': column = 1; break;
      case 'j': column = 2; break;
      case 'k': column = 3; break;
      default: return;
    }
    
    if (column !== null && column === activeColumn && holdStartTime !== null) {
      const duration = currentTime - holdStartTime;
      
      if (duration < 0.2) {
        const tapTile: Tile = {
          id: v4(),
          type: 'tap',
          column: column,
          time: holdStartTime
        };
        
        setRecordedTiles(prev => [...prev, tapTile]);
        toast.success(`Tap recorded at ${holdStartTime.toFixed(2)}s`);
      } else {
        const holdTile: Tile = {
          id: v4(),
          type: 'hold',
          column: column,
          time: holdStartTime,
          duration: duration
        };
        
        setRecordedTiles(prev => [...prev, holdTile]);
        toast.success(`Hold recorded (${duration.toFixed(2)}s)`);
      }
      
      setHoldStartTime(null);
      setActiveColumn(null);
      e.preventDefault();
    }
  };
  
  // Handle flick creation
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
    <ScrollArea className="h-full w-full">
      <div 
        className="flex flex-col items-center relative pb-12" 
        onKeyDown={handleKeyDown} 
        onKeyUp={handleKeyUp}
        tabIndex={0}
      >
        <div className="mb-4 w-full">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <div ref={playerRef} id="youtube-player" className="absolute inset-0"></div>
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
              <Mic size={16} /> Start Recording
            </Button>
          )}
        </div>
        
        {isRecording && (
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} w-full max-w-md mb-6`}>
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
                        const tapTile: Tile = {
                          id: v4(),
                          type: 'tap',
                          column: column,
                          time: holdStartTime
                        };
                        
                        setRecordedTiles(prev => [...prev, tapTile]);
                        toast.success(`Tap recorded at ${holdStartTime.toFixed(2)}s`);
                      } else {
                        const holdTile: Tile = {
                          id: v4(),
                          type: 'hold',
                          column: column,
                          time: holdStartTime,
                          duration: duration
                        };
                        
                        setRecordedTiles(prev => [...prev, holdTile]);
                        toast.success(`Hold recorded (${duration.toFixed(2)}s)`);
                      }
                      
                      setHoldStartTime(null);
                      setActiveColumn(null);
                    }
                  }}
                  onTouchStart={() => {
                    setHoldStartTime(currentTime);
                    setActiveColumn(column);
                  }}
                  onTouchEnd={() => {
                    if (holdStartTime !== null && column === activeColumn) {
                      const duration = currentTime - holdStartTime;
                      
                      if (duration < 0.2) {
                        const tapTile: Tile = {
                          id: v4(),
                          type: 'tap',
                          column: column,
                          time: holdStartTime
                        };
                        
                        setRecordedTiles(prev => [...prev, tapTile]);
                        toast.success(`Tap recorded at ${holdStartTime.toFixed(2)}s`);
                      } else {
                        const holdTile: Tile = {
                          id: v4(),
                          type: 'hold',
                          column: column,
                          time: holdStartTime,
                          duration: duration
                        };
                        
                        setRecordedTiles(prev => [...prev, holdTile]);
                        toast.success(`Hold recorded (${duration.toFixed(2)}s)`);
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
                    className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    onClick={() => handleFlick(column, 'left')}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button 
                    className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    onClick={() => handleFlick(column, 'up')}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                    onClick={() => handleFlick(column, 'right')}
                  >
                    <ArrowRight size={14} />
                  </button>
                  <div className="col-span-3 flex justify-center">
                    <button 
                      className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
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
            <li>Click or tap on a column to record using mouse/touch</li>
          </ul>
        </div>
        
        {recordedTiles.length > 0 && (
          <div className="text-sm text-gray-500">
            {recordedTiles.length} tiles recorded
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default RecordMode;
