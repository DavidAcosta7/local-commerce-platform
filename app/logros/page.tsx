import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { Store, Trophy, Lock } from "lucide-react"

export default async function LogrosPage() {
  const supabase = await createClient()

  let user = null
  let profile = null
  let userAchievementIds: string[] = []

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()
    if (!error && authUser) {
      user = authUser

      const { data: profileData } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
      profile = profileData

      // Get user's achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id)

      if (userAchievements) {
        userAchievementIds = userAchievements.map((ua) => ua.achievement_id)
      }
    }
  } catch (error) {
    // No session exists, user is browsing publicly
    console.log("[v0] No active session, showing public view")
  }

  // Get all achievements
  const { data: achievements } = await supabase.from("achievements").select("*").order("points", { ascending: true })

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-4">
              <Trophy className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logros Disponibles</h1>
          <p className="text-gray-600">Completa desafíos y desbloquea logros especiales</p>
        </div>

        {achievements && achievements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const isUnlocked = userAchievementIds.includes(achievement.id)

              return (
                <Card
                  key={achievement.id}
                  className={
                    isUnlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50 opacity-75"
                  }
                >
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`rounded-full p-4 ${isUnlocked ? "bg-yellow-100" : "bg-gray-200"}`}>
                        {isUnlocked ? (
                          <Trophy className="h-8 w-8 text-yellow-600" />
                        ) : (
                          <Lock className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isUnlocked ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        +{achievement.points} puntos
                      </div>
                    </div>
                    {isUnlocked && <div className="mt-3 text-xs text-green-600 font-semibold">✓ Desbloqueado</div>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay logros disponibles</h3>
              <p className="text-gray-600">Pronto habrá logros para desbloquear</p>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="mt-8 bg-gradient-to-br from-blue-50 to-orange-50">
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Únete para desbloquear logros</h3>
              <p className="text-gray-600 mb-4">Crea una cuenta y comienza a ganar logros y reconocimientos</p>
              <Button asChild>
                <Link href="/auth/registro">Registrarse Ahora</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
