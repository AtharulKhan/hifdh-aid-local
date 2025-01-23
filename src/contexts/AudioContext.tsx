import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  activeSound: string | null;
  togglePlay: () => void;
  handleSoundSelect: (soundId: string) => void;
  handleVolumeChange: (value: number[]) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const sounds = [
  { 
    id: "rain", 
    name: "Rain", 
    src: "/sounds/rain.mp3"
  },
  { 
    id: "waves", 
    name: "Ocean", 
    src: "/sounds/waves.mp3"
  },
  { 
    id: "forest", 
    name: "Forest", 
    src: "/sounds/forest.mp3"
  },
  { 
    id: "wind", 
    name: "Wind", 
    src: "/sounds/wind.mp3"
  },
];

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(() => {
    return localStorage.getItem("ambientSound_isPlaying") === "true";
  });
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem("ambientSound_volume")) || 50;
  });
  const [activeSound, setActiveSound] = useState<string | null>(() => {
    return localStorage.getItem("ambientSound_activeSound") || null;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio on component mount
    if (activeSound && isPlaying && audioRef.current) {
      audioRef.current.src = sounds.find(s => s.id === activeSound)?.src || "";
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem("ambientSound_isPlaying", isPlaying.toString());
    localStorage.setItem("ambientSound_volume", volume.toString());
    if (activeSound) {
      localStorage.setItem("ambientSound_activeSound", activeSound);
    }
  }, [isPlaying, volume, activeSound]);

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
      audioRef.current.volume = volume / 100;
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
    <AudioContext.Provider 
      value={{
        isPlaying,
        volume,
        activeSound,
        togglePlay,
        handleSoundSelect,
        handleVolumeChange,
      }}
    >
      {children}
      <audio ref={audioRef} loop />
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};