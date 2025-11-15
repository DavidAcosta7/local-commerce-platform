import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Shield, User, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function VerificarAdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificación de Administrador</h1>
          <p className="text-gray-600">Verifica el estado de tu cuenta y permisos</p>
        </div>

        {/* Estado del Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Email:</span>
              </div>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Nombre:</span>
              </div>
              <span className="font-medium">{profile?.full_name || "No especificado"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Creado:</span>
              </div>
              <span className="font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Administrador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado de Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Rol actual:</span>
              <Badge variant={isAdmin ? "default" : "secondary"} className="text-sm">
                {profile?.role || "cliente"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado:</span>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Administrador activo</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">No es administrador</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              {isAdmin ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">✓ Tu cuenta tiene permisos de administrador</p>
                  <Button asChild className="w-full">
                    <Link href="/admin">Ir al Panel de Administración</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-2">Tu cuenta no tiene permisos de administrador.</p>
                    <p className="text-xs text-yellow-700">
                      Si ejecutaste el script SQL para convertir tu cuenta a admin, intenta:
                    </p>
                    <ul className="text-xs text-yellow-700 list-disc list-inside mt-2 space-y-1">
                      <li>Cerrar sesión y volver a iniciar sesión</li>
                      <li>Verificar que el script se ejecutó correctamente</li>
                      <li>Ejecutar el script scripts/010_verify_and_fix_admin.sql</li>
                    </ul>
                  </div>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/">Volver al Inicio</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>
                Ejecuta el script <code className="bg-gray-100 px-1 rounded">scripts/010_verify_and_fix_admin.sql</code>
              </li>
              <li>Cierra sesión desde el menú de usuario</li>
              <li>Vuelve a iniciar sesión con tu cuenta</li>
              <li>Recarga esta página para verificar los cambios</li>
              <li>Si eres admin, verás el enlace "Admin" en el menú superior</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
