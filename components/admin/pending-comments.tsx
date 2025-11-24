import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ApproveCommentButton } from "./approve-comment-button"
import { RejectCommentButton } from "./reject-comment-button"
import { Star, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function PendingComments() {
  const supabase = await createClient()

  const { data: pendingComments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (full_name, email),
      merchants (business_name)
    `)
    .eq("is_approved", false)
    .order("created_at", { ascending: true })

  if (!pendingComments || pendingComments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay comentarios pendientes</h3>
          <p className="text-gray-600">Todos los comentarios han sido moderados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingComments.map((comment) => {
        const initials = comment.profiles?.full_name
          ? comment.profiles.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U"

        return (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.profiles?.full_name || "Usuario"}</span>
                      <span className="text-xs text-gray-500">({comment.profiles?.email})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        Comercio: <span className="font-medium">{comment.merchants?.business_name}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-4">{comment.content}</p>

                  <div className="flex gap-2">
                    <ApproveCommentButton commentId={comment.id} />
                    <RejectCommentButton commentId={comment.id} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
