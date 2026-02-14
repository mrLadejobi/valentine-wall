import { createClient } from '@supabase/supabase-js';

// These variables will be pulled from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseEnvMissing = !supabaseUrl || !supabaseAnonKey;

if (supabaseEnvMissing) {
  console.error("Supabase URL or Anon Key is missing. Check your .env or deployment env vars.");
} else if (process.env.NODE_ENV !== 'production') {
  // Safe debug log: boolean only
  console.log("Supabase env present:", true);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
