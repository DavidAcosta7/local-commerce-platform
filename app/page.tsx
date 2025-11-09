import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { Store, MapPin, Search } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  let user = null
  let profile = null

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()
    if (!error && authUser) {
      user = authUser
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
      profile = data
    }
  } catch (error) {
    // No session exists, user is browsing publicly
    console.log("[v0] No active session, showing public view")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Comercio Local</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/comercios">Explorar</Link>
                </Button>
                {profile?.role === "merchant" && (
                  <Button variant="ghost" asChild>
                    <Link href="/panel">Mis Comercios</Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link href="/ranking">Ranking</Link>
                </Button>
                <UserNav user={user} profile={profile} />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/comercios">Explorar</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/registro">Registrarse</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-balance">
            Descubre y apoya el comercio local
          </h1>
          <p className="text-xl text-gray-600 text-pretty">
            Encuentra los mejores negocios de tu comunidad, deja opiniones y gana reconocimientos por tu participación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/comercios">
                <Search className="mr-2 h-5 w-5" />
                Explorar Comercios
              </Link>
            </Button>
            {profile?.role === "merchant" && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/panel/nuevo">
                  <Store className="mr-2 h-5 w-5" />
                  Registrar Mi Negocio
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Encuentra negocios locales</h3>
            <p className="text-gray-600">Descubre comercios cerca de ti y conoce lo que ofrecen</p>
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-4">
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Comparte tu opinión</h3>
            <p className="text-gray-600">Deja comentarios y calificaciones para ayudar a otros</p>
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <Store className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Gana reconocimientos</h3>
            <p className="text-gray-600">Obtén logros por tu participación activa en la comunidad</p>
          </div>
        </div>
      </section>
    </div>
  )
}
