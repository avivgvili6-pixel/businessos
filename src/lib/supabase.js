import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

// Feature flag: only actually connect if credentials present. Lets the
// app fall back to localStorage for anyone building/running without env.
export const supabaseEnabled = !!(url && key)

export const supabase = supabaseEnabled
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Small helper: throws if backend not configured. Callers should first
// check `supabaseEnabled` to decide localStorage vs cloud path.
export function requireSupabase() {
  if (!supabase) throw new Error('Supabase not configured - set VITE_SUPABASE_URL and VITE_SUPABASE_KEY')
  return supabase
}
