// Web Audio API Ambient Soundscape Synthesizer Engine
let audioCtx: AudioContext | null = null;
let activeNodes: (OscillatorNode | AudioBufferSourceNode | BiquadFilterNode | GainNode)[] = [];

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'lofi' | 'nature' | 'cozy' | 'space';
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'lofi',
    name: 'Lo-Fi Chill Beats',
    description: 'Warm, mellow synthetic synth chords for relaxed reading.',
    icon: '🎧',
    category: 'lofi',
  },
  {
    id: 'chimes',
    name: 'Crystal Wind Chimes',
    description: 'Gentle, soothing high-frequency melodic bells.',
    icon: '🔔',
    category: 'cozy',
  },
];

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopSoundscape(): void {
  activeNodes.forEach(node => {
    try {
      if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
        (node as OscillatorNode).stop();
      }
      node.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  });
  activeNodes = [];
}

export function playSoundscapePreset(presetId: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  stopSoundscape();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
  masterGain.connect(ctx.destination);
  activeNodes.push(masterGain);

  if (presetId === 'lofi') {
    const frequencies = [220, 277.18, 329.63, 440];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.02 / (idx + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      activeNodes.push(osc);
    });
  } else {
    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50];
    chimeFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      activeNodes.push(osc);
    });
  }
}