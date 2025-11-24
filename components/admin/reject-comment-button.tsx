"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RejectCommentButtonProps {
  commentId: string
}

export function RejectCommentButton({ commentId }: RejectCommentButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleReject = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("No se pudo obtener el usuario")
      }

      const { error: logError } = await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "reject_comment",
        target_id: commentId,
        target_type: "comment",
      })

      if (logError) {
        console.error("Error logging admin action:", logError)
      }

      const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId)

      if (deleteError) throw deleteError

      toast({
        title: "Comentario rechazado",
        description: "El comentario ha sido eliminado exitosamente",
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error rejecting comment:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar el comentario. Intenta nuevamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleReject}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700 bg-transparent"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Rechazando...
        </>
      ) : (
        <>
          <X className="mr-2 h-4 w-4" />
          Rechazar
        </>
      )}
    </Button>
  )
}
