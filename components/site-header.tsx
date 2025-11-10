import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Store, Shield } from "lucide-react"

export async function SiteHeader() {
  const supabase = await createClient()

  let user = null
  let profile = null

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profileData } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
      profile = profileData
    }
  } catch (error) {
    // Not logged in or session error
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">Comercios Locales</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/comercios" className="text-sm font-medium transition-colors hover:text-blue-600">
              Comercios
            </Link>
            <Link href="/ranking" className="text-sm font-medium transition-colors hover:text-blue-600">
              Ranking
            </Link>
            <Link href="/logros" className="text-sm font-medium transition-colors hover:text-blue-600">
              Logros
            </Link>
            {profile?.role === "merchant" && (
              <Link href="/panel" className="text-sm font-medium transition-colors hover:text-blue-600">
                Mis Comercios
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && profile ? (
            <UserNav user={user} profile={profile} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
