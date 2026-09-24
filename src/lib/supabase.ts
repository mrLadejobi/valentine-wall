import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder values during build/prerender time if env variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabaseEnvMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseEnvMissing) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env or deployment env vars.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
