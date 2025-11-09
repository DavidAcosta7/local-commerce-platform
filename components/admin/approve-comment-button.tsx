"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

interface ApproveCommentButtonProps {
  commentId: string
}

export function ApproveCommentButton({ commentId }: ApproveCommentButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").update({ is_approved: true }).eq("id", commentId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error approving comment:", error)
    } finally {
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
