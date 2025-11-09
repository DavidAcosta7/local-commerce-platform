import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Store, Plus, Eye, Edit } from "lucide-react"
import { DeleteMerchantButton } from "@/components/delete-merchant-button"

export default async function PanelPage() {
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

  // Fetch user's merchants
  const { data: merchants } = await supabase
    .from("merchants")
    .select(`
      *,
      comments (rating)
    `)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate stats for each merchant
  const merchantsWithStats = merchants?.map((merchant) => {
    const comments = merchant.comments || []
    const avgRating =
      comments.length > 0
        ? comments.reduce((sum: number, c: { rating: number }) => sum + c.rating, 0) / comments.length
        : 0
    return {
      ...merchant,
      averageRating: avgRating,
      totalComments: comments.length,
    }
  })

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Comercios</h1>
            <p className="text-gray-600">Administra tus negocios registrados</p>
          </div>
          <Button asChild>
            <Link href="/panel/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Comercio
            </Link>
          </Button>
        </div>

        {merchantsWithStats && merchantsWithStats.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantsWithStats.map((merchant) => (
              <Card key={merchant.id}>
                <CardHeader className="p-0">
                  {merchant.logo_url ? (
                    <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-200">
                      <img
                        src={merchant.logo_url || "/placeholder.svg"}
                        alt={merchant.business_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-t-lg bg-gradient-to-br from-blue-100 to-orange-100" />
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{merchant.business_name}</h3>
                    <p className="text-sm text-gray-600">{merchant.category}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{merchant.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500"> / 5.0</span>
                    </div>
                    <div className="text-gray-500">{merchant.totalComments} opiniones</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        merchant.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {merchant.is_active ? "Activo" : "Inactivo"}
                    </span>
                    {merchant.is_verified && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Verificado</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/comercios/${merchant.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/panel/editar/${merchant.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <DeleteMerchantButton merchantId={merchant.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes comercios registrados</h3>
              <p className="text-gray-600 mb-6">Comienza registrando tu primer negocio</p>
              <Button asChild>
                <Link href="/panel/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Comercio
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
