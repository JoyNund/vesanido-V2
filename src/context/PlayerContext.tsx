import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrackMetadata } from '../types';

interface PlayerContextType {
  isPlaying: boolean;
  volume: number;
  currentTrack: TrackMetadata | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTrack: (track: TrackMetadata | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTrack, setCurrentTrack] = useState<TrackMetadata | null>(null);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(prev => !prev);

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        volume,
        currentTrack,
        play,
        pause,
        togglePlay,
        setVolume,
        setCurrentTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
