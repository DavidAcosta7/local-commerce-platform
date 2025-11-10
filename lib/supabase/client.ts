import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

if (typeof window !== "undefined") {
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  console.log = (...args: any[]) => {
    const message = args.join(" ")
    if (message.includes("GoTrueClient") || message.includes("Multiple GoTrueClient instances")) {
      return
    }
    originalConsoleLog(...args)
  }

  console.warn = (...args: any[]) => {
    const message = args.join(" ")
    if (message.includes("GoTrueClient") || message.includes("Multiple GoTrueClient instances")) {
      return
    }
    originalConsoleWarn(...args)
  }
}

let client: SupabaseClient | undefined

export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      debug: false,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`,
    },
  })

  return client
}
