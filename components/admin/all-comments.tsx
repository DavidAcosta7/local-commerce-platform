import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DeleteCommentButton } from "./delete-comment-button"
import { MessageSquare, Star, CheckCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function AllComments() {
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (full_name, email),
      merchants (business_name)
    `)
    .order("created_at", { ascending: false })

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay comentarios</h3>
          <p className="text-gray-600">Los comentarios aparecerán aquí cuando los usuarios comenten</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Todos los Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => {
            const initials = comment.profiles?.full_name
              ? comment.profiles.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"

            return (
              <div key={comment.id} className="flex items-start gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{comment.profiles?.full_name || "Usuario"}</span>
                    {comment.is_approved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprobado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    Comercio: <span className="font-medium">{comment.merchants?.business_name}</span>
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

                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>
                </div>

                <DeleteCommentButton commentId={comment.id} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
