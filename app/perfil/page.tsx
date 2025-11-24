import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Store, MessageSquare, Trophy, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()

  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      merchants (business_name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: achievements } = await supabase
    .from("user_achievements")
    .select(`
      earned_at,
      achievements (name, description, icon, points)
    `)
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U"

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
            {profile?.role === "merchant" && (
              <Button variant="ghost" asChild>
                <Link href="/panel">Mis Comercios</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/ranking">Ranking</Link>
            </Button>
            <UserNav user={user} profile={profile} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{profile?.full_name || "Usuario"}</h2>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  {profile?.role === "merchant" ? "Comerciante" : "Cliente"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Puntos totales</span>
                  <span className="font-bold text-lg">{stats?.total_points || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comentarios</span>
                  <span className="font-semibold">{stats?.total_comments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes recibidos</span>
                  <span className="font-semibold">{stats?.total_likes_received || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Logros Desbloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((userAchievement) => {
                      const achievement = userAchievement.achievements
                      if (!achievement) return null

                      return (
                        <div
                          key={userAchievement.earned_at}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                        >
                          <div className="rounded-full bg-yellow-100 p-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{achievement.name}</h3>
                            <p className="text-xs text-gray-600">{achievement.description}</p>
                            <p className="text-xs text-gray-500 mt-1">+{achievement.points} puntos</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>Aún no has desbloqueado logros</p>
                    <p className="text-sm">Participa en la comunidad para ganar logros</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Opiniones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={`/comercios/${comment.merchant_id}`}
                            className="font-semibold hover:text-blue-600"
                          >
                            {comment.merchants?.business_name}
                          </Link>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              comment.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {comment.is_approved ? "Aprobado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>Aún no has dejado opiniones</p>
                    <Button asChild className="mt-4">
                      <Link href="/comercios">Explorar comercios</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
