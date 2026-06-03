import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase env vars: URL=${supabaseUrl ? "set" : "MISSING"}, KEY=${supabaseAnonKey ? "set" : "MISSING"}`,
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

let sessionPromise: Promise<void> | null = null

// Entries are RLS-scoped per user, so every device needs an (anonymous) session.
export function ensureSession(): Promise<void> {
  sessionPromise ??= (async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) return
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      sessionPromise = null // allow retry on next call
      throw error
    }
  })()
  return sessionPromise
}
