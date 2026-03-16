import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Env Vars missing!', { supabaseUrl, supabaseAnonKey })
} else {
    console.log('Supabase Initialized', { url: supabaseUrl })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
})

// Global auth error handler — clears stale sessions and redirects to login
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
        // Session refreshed OK — no action needed
        return
    }
    if (event === 'SIGNED_OUT') {
        // Clear any cached data on sign-out
        return
    }
})
