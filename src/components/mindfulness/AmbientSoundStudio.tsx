import React from "react";
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
import { useAudio, sounds } from "@/contexts/AudioContext";

const soundIcons = {
  rain: Cloud,
  waves: Waves,
  forest: Trees,
  wind: Wind,
};

export function AmbientSoundStudio() {
  const { 
    isPlaying, 
    volume, 
    activeSound, 
    togglePlay, 
    handleSoundSelect, 
    handleVolumeChange 
  } = useAudio();

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
        {sounds.map(({ id, name }) => {
          const Icon = soundIcons[id as keyof typeof soundIcons];
          return (
            <Button
              key={id}
              variant={activeSound === id ? "default" : "outline"}
              className="flex flex-col gap-2 h-auto py-4"
              onClick={() => handleSoundSelect(id)}
            >
              <Icon className="h-6 w-6" />
              <span>{name}</span>
            </Button>
          );
        })}
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
    </div>
  );
}