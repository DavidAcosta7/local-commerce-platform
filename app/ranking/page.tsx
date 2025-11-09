import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { Store, Trophy, Medal, Award, Crown } from "lucide-react"

export default async function RankingPage() {
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

  // Fetch top users by points
  const { data: topUsers } = await supabase
    .from("user_stats")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order("total_points", { ascending: false })
    .limit(20)

  // Get current user's rank if logged in
  let currentUserRank = null
  if (user) {
    const { data: allUsers } = await supabase
      .from("user_stats")
      .select("user_id, total_points")
      .order("total_points", { ascending: false })

    if (allUsers) {
      const userIndex = allUsers.findIndex((u) => u.user_id === user.id)
      if (userIndex !== -1) {
        currentUserRank = {
          position: userIndex + 1,
          ...allUsers[userIndex],
        }
      }
    }
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (position === 3) return <Medal className="h-6 w-6 text-orange-600" />
    return null
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-4">
              <Trophy className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking de la Comunidad</h1>
          <p className="text-gray-600">Los usuarios más activos y valiosos de nuestra comunidad</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Ranking */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 20 Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                {topUsers && topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {topUsers.map((userStat, index) => {
                      const position = index + 1
                      const initials = userStat.profiles?.full_name
                        ? userStat.profiles.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : userStat.profiles?.email?.charAt(0).toUpperCase() || "U"

                      const isCurrentUser = user && userStat.user_id === user.id

                      return (
                        <div
                          key={userStat.user_id}
                          className={`flex items-center gap-4 p-3 rounded-lg ${
                            position <= 3
                              ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                              : isCurrentUser
                                ? "bg-blue-50"
                                : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 text-center font-bold text-lg">{getRankIcon(position) || position}</div>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback
                                className={
                                  position <= 3 ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                }
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">
                                {userStat.profiles?.full_name || "Usuario"}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Tú</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {userStat.total_comments} comentarios • {userStat.total_likes_received} likes
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">{userStat.total_points}</p>
                            <p className="text-xs text-gray-500">puntos</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p>Aún no hay usuarios en el ranking</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current User Rank */}
            {currentUserRank && (
              <Card>
                <CardHeader>
                  <CardTitle>Tu Posición</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-blue-600">#{currentUserRank.position}</div>
                    <p className="text-sm text-gray-600">en el ranking</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Puntos</span>
                      <span className="font-semibold">{currentUserRank.total_points}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href="/perfil">Ver mi perfil</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Points Info */}
            <Card>
              <CardHeader>
                <CardTitle>Cómo ganar puntos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Deja un comentario</p>
                    <p className="text-gray-600">+10 puntos</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Recibe un like</p>
                    <p className="text-gray-600">+5 puntos</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Desbloquea logros</p>
                    <p className="text-gray-600">Puntos variables</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card className="bg-gradient-to-br from-blue-50 to-orange-50">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Únete al ranking</h3>
                  <p className="text-sm text-gray-600 mb-4">Crea una cuenta y comienza a ganar puntos</p>
                  <Button asChild className="w-full">
                    <Link href="/auth/registro">Registrarse</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
