
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { v4 } from "@/utils/uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeatMap, Tile, TileType, FlickDirection } from "@/types/game";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, Play, Youtube, FileDown, Edit, Copy } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const emptyBeatmap: BeatMap = {
  videoId: "",
  title: "New Beatmap",
  artist: "Artist Name",
  bpm: 120,
  offset: 0,
  tiles: []
};

const formSchema = z.object({
  videoId: z.string().min(1, "YouTube Video ID is required"),
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  bpm: z.coerce.number().min(1, "BPM must be greater than 0"),
  offset: z.coerce.number(),
});

const AdminPage = () => {
  const [beatmap, setBeatmap] = useState<BeatMap>({ ...emptyBeatmap });
  const [showExportCode, setShowExportCode] = useState(false);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAdvancedTiming, setShowAdvancedTiming] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: beatmap.videoId,
      title: beatmap.title,
      artist: beatmap.artist,
      bpm: beatmap.bpm,
      offset: beatmap.offset,
    },
  });

  // Update form when beatmap changes
  useEffect(() => {
    form.reset({
      videoId: beatmap.videoId,
      title: beatmap.title,
      artist: beatmap.artist,
      bpm: beatmap.bpm,
      offset: beatmap.offset,
    });
  }, [beatmap, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setBeatmap(prev => ({
      ...prev,
      videoId: values.videoId,
      title: values.title,
      artist: values.artist,
      bpm: values.bpm,
      offset: values.offset,
    }));
    toast.success("Beatmap details updated");
  };

  const addTile = () => {
    const newTile: Tile = {
      id: v4(),
      type: 'tap',
      column: 0,
      time: currentTime
    };
    
    setBeatmap(prev => ({
      ...prev,
      tiles: [...prev.tiles, newTile]
    }));
    
    setSelectedTileIndex(beatmap.tiles.length);
    toast.success("Tile added");
  };

  const deleteTile = (index: number) => {
    setBeatmap(prev => ({
      ...prev,
      tiles: prev.tiles.filter((_, i) => i !== index)
    }));
    
    if (selectedTileIndex === index) {
      setSelectedTileIndex(null);
    } else if (selectedTileIndex !== null && selectedTileIndex > index) {
      setSelectedTileIndex(selectedTileIndex - 1);
    }
    
    toast.success("Tile deleted");
  };

  const updateTile = (index: number, updates: Partial<Tile>) => {
    setBeatmap(prev => ({
      ...prev,
      tiles: prev.tiles.map((tile, i) => 
        i === index ? { ...tile, ...updates } : tile
      )
    }));
  };

  const duplicateTile = (index: number) => {
    const tileToDuplicate = beatmap.tiles[index];
    const newTile: Tile = {
      ...tileToDuplicate,
      id: v4(),
      time: tileToDuplicate.time + 0.5, // Offset slightly to make it visible
    };
    
    setBeatmap(prev => ({
      ...prev,
      tiles: [...prev.tiles, newTile]
    }));
    
    setSelectedTileIndex(beatmap.tiles.length);
    toast.success("Tile duplicated");
  };

  const handlePlayerProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const generateExportCode = () => {
    // Sort tiles by time for export
    const sortedTiles = [...beatmap.tiles].sort((a, b) => a.time - b.time);
    
    return `import { BeatMap } from '@/types/game';
import { v4 } from '@/utils/uuid';

// ${beatmap.title} by ${beatmap.artist}
export const customBeatmap: BeatMap = {
  videoId: '${beatmap.videoId}',
  title: '${beatmap.title}',
  artist: '${beatmap.artist}',
  bpm: ${beatmap.bpm},
  offset: ${beatmap.offset},
  
  tiles: [
${sortedTiles.map(tile => {
  let tileStr = `    { id: v4(), type: '${tile.type}', column: ${tile.column}, time: ${tile.time.toFixed(2)}`;
  if (tile.duration) tileStr += `, duration: ${tile.duration.toFixed(2)}`;
  if (tile.direction) tileStr += `, direction: '${tile.direction}'`;
  tileStr += ' },';
  return tileStr;
}).join('\n')}
  ]
};`;
  };

  const handleExportCode = () => {
    setShowExportCode(!showExportCode);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Code copied to clipboard");
    });
  };

  const handleDownload = () => {
    const code = generateExportCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${beatmap.title.toLowerCase().replace(/\s+/g, '_')}_beatmap.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Beatmap file downloaded");
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Beatmap Creator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="videoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AFsHeF7SKDs" {...field} />
                      </FormControl>
                      <FormDescription>
                        The ID at the end of YouTube URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BPM</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="offset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Offset (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button type="submit">Save Details</Button>
                <Button type="button" variant="outline" onClick={goToHome}>Back to Game</Button>
              </div>
            </form>
          </Form>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              {beatmap.videoId ? (
                <ReactPlayer
                  ref={playerRef}
                  url={`https://www.youtube.com/watch?v=${beatmap.videoId}`}
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  playing={isPlaying}
                  onProgress={handlePlayerProgress}
                  controls
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Youtube size={48} className="text-gray-400" />
                  <p className="ml-2 text-gray-500">Enter a YouTube Video ID to preview</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  size="sm" 
                  variant={isPlaying ? "outline" : "default"}
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <span className="text-sm text-gray-500">
                  Current Time: {currentTime.toFixed(2)}s
                </span>
              </div>
              
              <Button onClick={addTile} size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add Tile at Current Time
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tiles ({beatmap.tiles.length})</h2>
              <div className="flex gap-2">
                <Button onClick={handleExportCode} variant="outline" size="sm">
                  <FileDown className="mr-1 h-4 w-4" /> {showExportCode ? "Hide Code" : "Show Code"}
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Save className="mr-1 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
            
            {showExportCode && (
              <div className="mb-6">
                <div className="relative">
                  <Textarea 
                    value={generateExportCode()} 
                    readOnly 
                    className="h-64 font-mono text-sm"
                  />
                  <Button 
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(generateExportCode())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Column</TableHead>
                    <TableHead>Time (s)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beatmap.tiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No tiles added yet. Play the video and add tiles at specific timestamps.
                      </TableCell>
                    </TableRow>
                  ) : (
                    beatmap.tiles.sort((a, b) => a.time - b.time).map((tile, index) => (
                      <TableRow 
                        key={tile.id}
                        className={selectedTileIndex === index ? "bg-blue-50" : ""}
                        onClick={() => setSelectedTileIndex(index)}
                      >
                        <TableCell>
                          <Select
                            value={tile.type}
                            onValueChange={(value: TileType) => updateTile(index, { type: value })}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tap">Tap</SelectItem>
                              <SelectItem value="hold">Hold</SelectItem>
                              <SelectItem value="flick">Flick</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell>
                          <Select
                            value={tile.column.toString()}
                            onValueChange={(value) => updateTile(index, { column: parseInt(value) })}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={tile.time}
                            onChange={(e) => updateTile(index, { time: parseFloat(e.target.value) })}
                            className="w-[100px]"
                          />
                        </TableCell>
                        
                        <TableCell>
                          {tile.type === 'hold' && (
                            <Input
                              type="number"
                              step="0.1"
                              value={tile.duration || 1.0}
                              onChange={(e) => updateTile(index, { duration: parseFloat(e.target.value) })}
                              className="w-[100px]"
                            />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {tile.type === 'flick' && (
                            <Select
                              value={tile.direction || 'up'}
                              onValueChange={(value: FlickDirection) => updateTile(index, { direction: value })}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Direction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">Up</SelectItem>
                                <SelectItem value="down">Down</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateTile(index)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTile(index)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tips</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Enter a YouTube Video ID to preview the song</li>
              <li>Play the video and add tiles at the exact timestamps</li>
              <li>Tap tiles are simple taps on a lane</li>
              <li>Hold tiles require setting a duration (in seconds)</li>
              <li>Flick tiles require a direction (up, down, left, right)</li>
              <li>You can download the beatmap as a TypeScript file</li>
              <li>Import the file into your project to use your custom beatmap</li>
            </ul>
            
            <Collapsible className="mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Advanced Tips
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="list-disc pl-5 space-y-2 text-sm mt-2">
                  <li>Tiles are automatically sorted by time in the preview</li>
                  <li>Click on a row to select and edit a tile</li>
                  <li>The offset adjusts the global timing of all tiles</li>
                  <li>Precise timing can make or break a beatmap's playability</li>
                  <li>Test your beatmap frequently to ensure it's fun to play</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
