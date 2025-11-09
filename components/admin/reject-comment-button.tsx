"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"

interface RejectCommentButtonProps {
  commentId: string
}

export function RejectCommentButton({ commentId }: RejectCommentButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleReject = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error rejecting comment:", error)
    } finally {
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
