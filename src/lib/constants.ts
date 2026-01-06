import { WallTheme, ThemeConfig, StampType } from '@/types';

export const THEMES: Record<WallTheme, ThemeConfig> = {
  'soft-pink': {
    bg: 'bg-pink-50',
    gradient: 'from-pink-50 to-rose-100',
    text: 'text-rose-900',
    accent: 'bg-rose-500 hover:bg-rose-600',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-rose-200 text-rose-700',
    stampColor: 'text-rose-500'
  },
  'lavender': {
    bg: 'bg-violet-50',
    gradient: 'from-violet-50 to-purple-100',
    text: 'text-violet-900',
    accent: 'bg-violet-500 hover:bg-violet-600',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-violet-200 text-violet-700',
    stampColor: 'text-violet-500'
  },
  'warm-peach': {
    bg: 'bg-orange-50',
    gradient: 'from-orange-50 to-amber-100',
    text: 'text-orange-900',
    accent: 'bg-orange-400 hover:bg-orange-500',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-orange-200 text-orange-700',
    stampColor: 'text-orange-500'
  },
  'classic-red': {
    bg: 'bg-red-50',
    gradient: 'from-red-50 to-red-100',
    text: 'text-red-900',
    accent: 'bg-red-600 hover:bg-red-700',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-red-200 text-red-700',
    stampColor: 'text-red-600'
  },
  'midnight-romance': {
    bg: 'bg-slate-900',
    gradient: 'from-slate-900 to-slate-800',
    text: 'text-pink-100',
    accent: 'bg-pink-600 hover:bg-pink-700',
    card: 'bg-slate-800/90 backdrop-blur-md border border-slate-700',
    envelope: 'bg-slate-700 text-pink-300',
    stampColor: 'text-pink-500'
  },
   'birthday-blue': {
    bg: 'bg-blue-50',
    gradient: 'from-blue-50 to-cyan-100',
    text: 'text-blue-900',
    accent: 'bg-blue-500 hover:bg-blue-600',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-blue-200 text-blue-700',
    stampColor: 'text-blue-500'
  },
  'birthday-gold': {
    bg: 'bg-amber-50',
    gradient: 'from-amber-50 to-yellow-100',
    text: 'text-amber-900',
    accent: 'bg-amber-500 hover:bg-amber-600',
    card: 'bg-white/90 backdrop-blur-md',
    envelope: 'bg-yellow-200 text-amber-700',
    stampColor: 'text-yellow-600'
  }
};

export const STAMPS: Record<StampType, { icon: string }> = {
  heart: { icon: '❤️' },
  rose: { icon: '🌹' },
  lips: { icon: '💋' },
  bear: { icon: '🧸' },
  star: { icon: '✨' },
  cake: { icon: '🎂' },
  balloon: { icon: '🎈' },
  gift: { icon: '🎁' },
  party: { icon: '🥳' }
};

export const DEFAULT_VIBES = [
  {label: 'Lofi Romance', url: 'https://youtu.be/THTVDGebjEE?si=CXw2dMSNJAi_B5rG'},
  {label: 'Birthday Party', url: 'https://youtu.be/rOXbPkYEIgk?si=P6qQq3B9BCo--LuI'},
  {label: 'Sweet Acoustic', url: 'https://youtu.be/hvnVX6W733o?si=QLWU1hGyNaQJVdhv'},
  {label: 'Midnight Jazz', url: 'https://youtu.be/5znVj9VUnGI?si=sTbkPKCzs_ehtFU0'},
];