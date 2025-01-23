import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2,
  Waves,
  Trees,
  Cloud,
  Wind
} from "lucide-react";

const sounds = [
  { id: "rain", name: "Rain", icon: Cloud, src: "/sounds/rain.mp3" },
  { id: "waves", name: "Ocean", icon: Waves, src: "/sounds/waves.mp3" },
  { id: "forest", name: "Forest", icon: Trees, src: "/sounds/forest.mp3" },
  { id: "wind", name: "Wind", icon: Wind, src: "/sounds/wind.mp3" },
];

export function AmbientSoundStudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSoundSelect = (soundId: string) => {
    setActiveSound(soundId);
    if (audioRef.current) {
      audioRef.current.src = sounds.find(s => s.id === soundId)?.src || "";
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-secondary">Ambient Sounds</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sounds.map(({ id, name, icon: Icon }) => (
          <Button
            key={id}
            variant={activeSound === id ? "default" : "outline"}
            className="flex flex-col gap-2 h-auto py-4"
            onClick={() => handleSoundSelect(id)}
          >
            <Icon className="h-6 w-6" />
            <span>{name}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
          />
        </div>
      </div>

      <audio ref={audioRef} loop />
    </div>
  );
}