import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const originalConsoleLog = console.log
const originalConsoleWarn = console.warn

if (typeof window === "undefined") {
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

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      debug: false,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export { createClient as createServerClient }
