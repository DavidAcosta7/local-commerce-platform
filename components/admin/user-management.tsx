import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UpdateUserRoleButton } from "./update-user-role-button"
import { DeleteUserButton } from "./delete-user-button"
import { ChangePasswordButton } from "./change-password-button"
import { Users, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function UserManagement() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      merchants (count)
    `)
    .order("created_at", { ascending: false })

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
          <p className="text-gray-600">Los usuarios aparecerán aquí cuando se registren</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestión de Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => {
            const initials = user.full_name
              ? user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"

            const roleColors = {
              admin: "bg-red-100 text-red-700 border-red-300",
              merchant: "bg-blue-100 text-blue-700 border-blue-300",
              customer: "bg-green-100 text-green-700 border-green-300",
            }

            const roleLabels = {
              admin: "Administrador",
              merchant: "Comerciante",
              customer: "Cliente",
            }

            return (
              <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{user.full_name || "Sin nombre"}</span>
                    <Badge variant="outline" className={roleColors[user.role as keyof typeof roleColors]}>
                      {roleLabels[user.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    <span>•</span>
                    <span>
                      Registrado{" "}
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ChangePasswordButton userId={user.id} userEmail={user.email} />
                  <UpdateUserRoleButton userId={user.id} currentRole={user.role} />
                  <DeleteUserButton userId={user.id} userName={user.full_name || user.email} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
