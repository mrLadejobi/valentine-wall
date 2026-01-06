export type WallType = 'valentine' | 'birthday';
export type WallTheme = 'soft-pink' | 'lavender' | 'warm-peach' | 'classic-red' | 'midnight-romance' | 'birthday-blue' | 'birthday-gold';
export type StampType = 'heart' | 'rose' | 'lips' | 'bear' | 'star' | 'cake' | 'balloon' | 'gift' | 'party';

export interface ThemeConfig {
  bg: string;
  gradient: string;
  text: string;
  accent: string;
  card: string;
  envelope: string;
  stampColor: string;
}

export interface Wall {
  id: string;
  slug: string;
  name: string;
  theme: WallTheme;
  type: WallType;
  unlock_date: string;
  owner_id: string;
  music_url?: string;
  created_at?: string; 
}

export interface Message {
  id: string;
  body: string;
  author: string;
  hint: string;
  stamp: StampType;
  rotation: number;
  created_at: string;
}

export interface Vibe{
  label: string;
  url: string;
}