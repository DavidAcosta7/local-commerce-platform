"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApproveCommentButtonProps {
  commentId: string
}

export function ApproveCommentButton({ commentId }: ApproveCommentButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
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

      const { error: updateError } = await supabase.from("comments").update({ is_approved: true }).eq("id", commentId)

      if (updateError) throw updateError

      const { error: logError } = await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "approve_comment",
        target_id: commentId,
        target_type: "comment",
      })

      if (logError) {
        console.error("Error logging admin action:", logError)
      }

      toast({
        title: "Comentario aprobado",
        description: "El comentario ha sido aprobado exitosamente",
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error approving comment:", error)
      toast({
        title: "Error",
        description: "No se pudo aprobar el comentario. Intenta nuevamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleApprove} disabled={isLoading} size="sm">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Aprobando...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Aprobar
        </>
      )}
    </Button>
  )
}
