import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MerchantCard } from "@/components/merchant-card"
import { Store, Search } from "lucide-react"

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
  }>
}

export default async function ComerciosPage({ searchParams }: PageProps) {
  const params = await searchParams
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
  }

  // Build query
  let query = supabase
    .from("merchants")
    .select(`
      *,
      profiles:owner_id (full_name),
      comments (rating)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.ilike("business_name", `%${params.search}%`)
  }
  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category)
  }

  const { data: merchants } = await query

  // Calculate average ratings
  const merchantsWithRating = merchants?.map((merchant) => {
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
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Directorio de Comercios</h1>
          <p className="text-gray-600">Explora los negocios locales de tu comunidad</p>
        </div>

        {/* Filters */}
        <form method="get" className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input name="search" placeholder="Buscar por nombre..." defaultValue={params.search} className="pl-10" />
            </div>
            <Select name="category" defaultValue={params.category || "all"}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Restaurante">Restaurante</SelectItem>
                <SelectItem value="Tienda">Tienda</SelectItem>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Salud">Salud</SelectItem>
                <SelectItem value="Educación">Educación</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Buscar</Button>
          </div>
        </form>

        {/* Results */}
        {merchantsWithRating && merchantsWithRating.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantsWithRating.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron comercios</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
