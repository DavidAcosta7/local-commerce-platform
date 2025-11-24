import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            order: () => ({ limit: async () => ({ data: [], error: null }) }),
          }),
          order: () => ({ limit: async () => ({ data: [], error: null }) }),
          insert: async () => ({ error: null }),
          update: async () => ({ error: null }),
          delete: async () => ({ error: null }),
        }),
      }),
    } as any
  }

  // Use a stable storage key based on the project URL
  const projectId = supabaseUrl.split("//")[1]?.split(".")[0] || "project"
  const storageKey = `sb-${projectId}-auth-token`

  return createServerClient(supabaseUrl, supabaseKey, {
    auth: {
      debug: false,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: storageKey,
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
