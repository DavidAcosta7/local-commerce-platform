import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | undefined

export function createClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

  // Extract project ID for storage key, fallback to 'project' if parsing fails
  const projectId = supabaseUrl.split("//")[1]?.split(".")[0] || "project"

  client = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      debug: false,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `sb-${projectId}-auth-token`,
    },
  })

  return client
}
