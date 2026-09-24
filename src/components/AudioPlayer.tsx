'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { playSoundscapePreset, stopSoundscape } from '@/lib/soundscapes';

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [preset, setPreset] = useState<'lofi' | 'chimes'>('lofi');

  const togglePlay = () => {
    if (isPlaying) {
      stopSoundscape();
      setIsPlaying(false);
    } else {
      playSoundscapePreset(preset);
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-pink-950/80 backdrop-blur-md border border-pink-500/30 rounded-full p-2 px-4 shadow-xl flex items-center gap-3 text-white text-sm">
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-pink-400 animate-pulse" />
        <span className="font-medium hidden sm:inline">Ambient Audio</span>
      </div>
      <select
        value={preset}
        onChange={(e) => {
          const newPreset = e.target.value as 'lofi' | 'chimes';
          setPreset(newPreset);
          if (isPlaying) playSoundscapePreset(newPreset);
        }}
        className="bg-pink-900/60 text-pink-100 rounded text-xs px-2 py-1 border border-pink-500/20 focus:outline-none"
      >
        <option value="lofi">Lo-Fi Beats</option>
        <option value="chimes">Wind Chimes</option>
      </select>
      <button
        onClick={togglePlay}
        className="p-1.5 hover:bg-pink-800/50 rounded-full transition-colors"
        title={isPlaying ? 'Mute' : 'Play Soundscape'}
      >
        {isPlaying ? <Volume2 className="w-4 h-4 text-pink-300" /> : <VolumeX className="w-4 h-4 text-pink-400/60" />}
      </button>
    </div>
  );
}

export default AudioPlayer;