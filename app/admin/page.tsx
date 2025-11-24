import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserNav } from "@/components/user-nav"
import { PendingComments } from "@/components/admin/pending-comments"
import { MerchantVerification } from "@/components/admin/merchant-verification"
import { UserManagement } from "@/components/admin/user-management"
import { AdminReports } from "@/components/admin/admin-reports"
import { AdminActivity } from "@/components/admin/admin-activity"
import { AllMerchants } from "@/components/admin/all-merchants"
import { AllComments } from "@/components/admin/all-comments"
import { AdminPasswordManager } from "@/components/admin/admin-password-manager"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Store, ShieldCheck, MessageSquare, Users, Building2, FileText, Activity, Key } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Get stats
  const { count: pendingCommentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false)

  const { count: unverifiedMerchantsCount } = await supabase
    .from("merchants")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false)

  const { count: totalUsersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalMerchantsCount } = await supabase.from("merchants").select("*", { count: "exact", head: true })

  const { count: approvedCommentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", true)

  const { count: verifiedMerchantsCount } = await supabase
    .from("merchants")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

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
              <Link href="/admin">Panel Admin</Link>
            </Button>
            <UserNav user={user} profile={profile} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">Gestiona la plataforma y modera contenido</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-3">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCommentsCount || 0}</p>
                  <p className="text-sm text-gray-600">Comentarios pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-3">
                  <Building2 className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unverifiedMerchantsCount || 0}</p>
                  <p className="text-sm text-gray-600">Comercios sin verificar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsersCount || 0}</p>
                  <p className="text-sm text-gray-600">Total usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMerchantsCount || 0}</p>
                  <p className="text-sm text-gray-600">Total comercios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="comments" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Pendientes
              {pendingCommentsCount && pendingCommentsCount > 0 ? (
                <span className="ml-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                  {pendingCommentsCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Building2 className="mr-2 h-4 w-4" />
              Verificar
              {unverifiedMerchantsCount && unverifiedMerchantsCount > 0 ? (
                <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {unverifiedMerchantsCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="all-merchants">
              <Building2 className="mr-2 h-4 w-4" />
              Comercios
            </TabsTrigger>
            <TabsTrigger value="all-comments">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comentarios
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Auditoría
            </TabsTrigger>
            <TabsTrigger value="passwords">
              <Key className="mr-2 h-4 w-4" />
              Contraseñas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            <PendingComments />
          </TabsContent>

          <TabsContent value="merchants">
            <MerchantVerification />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="all-merchants">
            <AllMerchants />
          </TabsContent>

          <TabsContent value="all-comments">
            <AllComments />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports
              totalUsers={totalUsersCount || 0}
              totalMerchants={totalMerchantsCount || 0}
              totalComments={approvedCommentsCount || 0}
              verifiedMerchants={verifiedMerchantsCount || 0}
              pendingComments={pendingCommentsCount || 0}
              unverifiedMerchants={unverifiedMerchantsCount || 0}
            />
          </TabsContent>

          <TabsContent value="activity">
            <AdminActivity />
          </TabsContent>

          <TabsContent value="passwords">
            <AdminPasswordManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
