import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserNav } from "@/components/user-nav"
import { CommentsList } from "@/components/comments-list"
import { CommentForm } from "@/components/comment-form"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Store, MapPin, Phone, Mail, Globe, Star, ArrowLeft, BadgeCheck } from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MerchantDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
    profile = data
  }

  // Fetch merchant details
  const { data: merchant } = await supabase
    .from("merchants")
    .select(`
      *,
      profiles:owner_id (full_name)
    `)
    .eq("id", id)
    .single()

  if (!merchant) {
    notFound()
  }

  // Fetch approved comments with likes count
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (full_name),
      comment_likes (count)
    `)
    .eq("merchant_id", id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  // Calculate average rating
  const avgRating =
    comments && comments.length > 0 ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length : 0

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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/comercios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al directorio
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image */}
            {merchant.cover_image_url && (
              <div className="rounded-lg overflow-hidden aspect-video bg-gray-200">
                <img
                  src={merchant.cover_image_url || "/placeholder.svg"}
                  alt={merchant.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Business info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  {merchant.logo_url && (
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={merchant.logo_url || "/placeholder.svg"}
                        alt={merchant.business_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{merchant.business_name}</h1>
                      {merchant.is_verified && <BadgeCheck className="h-5 w-5 text-blue-600" />}
                    </div>
                    <Badge variant="secondary">{merchant.category}</Badge>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{merchant.description}</p>

                <div className="flex items-center gap-2 text-yellow-500 mb-4">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-500">({comments?.length || 0} opiniones)</span>
                </div>

                <div className="space-y-2 text-sm">
                  {merchant.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {merchant.address}
                    </div>
                  )}
                  {merchant.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {merchant.phone}
                    </div>
                  )}
                  {merchant.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {merchant.email}
                    </div>
                  )}
                  {merchant.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Opiniones</h2>

                {user ? (
                  <CommentForm merchantId={id} userId={user.id} />
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
                    <p className="text-sm text-gray-700">
                      <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                        Inicia sesión
                      </Link>{" "}
                      para dejar tu opinión
                    </p>
                  </div>
                )}

                <CommentsList comments={comments || []} userId={user?.id || null} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {merchant.qr_code && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 text-center">Código QR</h3>
                  <div className="bg-white p-4 rounded-lg border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        merchant.qr_code,
                      )}`}
                      alt="QR Code"
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Escanea para visitar</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Contacto rápido</h3>
                {merchant.phone && (
                  <Button className="w-full mb-2" asChild>
                    <a href={`tel:${merchant.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Llamar
                    </a>
                  </Button>
                )}
                {merchant.email && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={`mailto:${merchant.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar correo
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
