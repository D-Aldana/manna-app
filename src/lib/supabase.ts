import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase env vars: URL=${supabaseUrl ? "set" : "MISSING"}, KEY=${supabaseAnonKey ? "set" : "MISSING"}`,
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
