import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default async function AdminSetupPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar si el usuario ya es admin
  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single()

  const isTargetEmail = user.email === "kanekikirito010@gmail.com"

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Administrador</CardTitle>
          <CardDescription>Información sobre la configuración de permisos de administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Usuario actual:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Rol actual:</strong> {profile?.role || "cliente"}
            </p>
          </div>

          {profile?.role === "admin" ? (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ¡Felicitaciones! Ya tienes permisos de administrador. Puedes acceder al{" "}
                <a href="/admin" className="font-medium underline">
                  Panel de Administración
                </a>
              </AlertDescription>
            </Alert>
          ) : isTargetEmail ? (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Tu cuenta ha sido registrada correctamente. Para obtener permisos de administrador, ejecuta el script{" "}
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">scripts/008_create_specific_admin.sql</code>{" "}
                desde el panel de v0.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta cuenta no está configurada como administrador. Contacta con el administrador del sistema para
                obtener permisos.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 space-y-3 border-t">
            <h3 className="font-semibold text-sm">Pasos para configurar el administrador:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Regístrate en la aplicación con el correo: <strong>kanekikirito010@gmail.com</strong>
              </li>
              <li>Verifica tu correo electrónico haciendo clic en el enlace de confirmación</li>
              <li>
                Ejecuta el script <code className="bg-muted px-1 rounded">scripts/008_create_specific_admin.sql</code>
              </li>
              <li>Recarga esta página y verifica que tienes rol de admin</li>
              <li>
                Accede al{" "}
                <a href="/admin" className="text-primary underline">
                  Panel de Administración
                </a>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
