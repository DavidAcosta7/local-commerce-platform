"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Comment {
  id: string
  content: string
  rating: number
  created_at: string
  profiles: {
    full_name: string | null
  } | null
  comment_likes: Array<{ count: number }>
}

interface CommentsListProps {
  comments: Comment[]
  userId: string | null
}

export function CommentsList({ comments, userId }: CommentsListProps) {
  const router = useRouter()
  const [likingComment, setLikingComment] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  const handleLike = async (commentId: string) => {
    if (!userId) return

    setLikingComment(commentId)
    const supabase = createClient()

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .single()

      if (existingLike) {
        // Unlike
        await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId)
        setLikedComments((prev) => {
          const next = new Set(prev)
          next.delete(commentId)
          return next
        })
      } else {
        // Like
        await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: userId,
        })
        setLikedComments((prev) => new Set(prev).add(commentId))
      }

      router.refresh()
    } catch (error) {
      console.error("Error liking comment:", error)
    } finally {
      setLikingComment(null)
    }
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aún no hay opiniones. ¡Sé el primero en compartir tu experiencia!</p>
      </div>
    )
  }

  return (
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

        const likesCount = comment.comment_likes?.[0]?.count || 0

        const isLiked = likedComments.has(comment.id)

        return (
          <div key={comment.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.profiles?.full_name || "Usuario"}</span>
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
                      className={`h-3 w-3 ${i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  disabled={!userId || likingComment === comment.id}
                  className={`h-8 px-2 ${isLiked ? "text-blue-600" : "text-gray-500"}`}
                >
                  <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                  <span className="text-xs">{likesCount}</span>
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
