import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"
import { MerchantForm } from "@/components/merchant-form"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Store, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function NuevoComercioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()

  if (profile?.role !== "merchant") {
    redirect("/")
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
            <Button variant="ghost" asChild>
              <Link href="/comercios">Explorar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/panel">Mis Comercios</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ranking">Ranking</Link>
            </Button>
            <UserNav user={user} profile={profile} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/panel">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis comercios
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Nuevo Comercio</h1>
          <p className="text-gray-600">Completa la información de tu negocio</p>
        </div>

        <MerchantForm userId={user.id} />
      </div>
    </div>
  )
}
