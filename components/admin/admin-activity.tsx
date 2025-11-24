import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, XCircle, UserCog, Trash2, ShieldCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function AdminActivity() {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from("admin_actions")
    .select(`
      *,
      profiles:admin_id (full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay actividad registrada</h3>
          <p className="text-gray-600">Las acciones de los administradores aparecerán aquí</p>
        </CardContent>
      </Card>
    )
  }

  const actionIcons = {
    approve_comment: CheckCircle,
    reject_comment: XCircle,
    verify_merchant: ShieldCheck,
    delete_user: Trash2,
    update_user_role: UserCog,
    delete_merchant: Trash2,
    delete_comment: Trash2,
  }

  const actionLabels = {
    approve_comment: "Aprobó un comentario",
    reject_comment: "Rechazó un comentario",
    verify_merchant: "Verificó un comercio",
    delete_user: "Eliminó un usuario",
    update_user_role: "Cambió el rol de un usuario",
    delete_merchant: "Eliminó un comercio",
    delete_comment: "Eliminó un comentario",
  }

  const actionColors = {
    approve_comment: "bg-green-100 text-green-700 border-green-300",
    reject_comment: "bg-red-100 text-red-700 border-red-300",
    verify_merchant: "bg-blue-100 text-blue-700 border-blue-300",
    delete_user: "bg-red-100 text-red-700 border-red-300",
    update_user_role: "bg-yellow-100 text-yellow-700 border-yellow-300",
    delete_merchant: "bg-red-100 text-red-700 border-red-300",
    delete_comment: "bg-red-100 text-red-700 border-red-300",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Registro de Auditoría ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const ActionIcon = actionIcons[activity.action_type as keyof typeof actionIcons]
            const initials = activity.profiles?.full_name
              ? activity.profiles.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "A"

            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-red-100 text-red-700 text-xs">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {activity.profiles?.full_name || "Admin"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${actionColors[activity.action_type as keyof typeof actionColors]} text-xs`}
                    >
                      <ActionIcon className="h-3 w-3 mr-1" />
                      {actionLabels[activity.action_type as keyof typeof actionLabels]}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>

                  {activity.details && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {JSON.stringify(activity.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
