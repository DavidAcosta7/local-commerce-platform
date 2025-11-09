"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Loader2 } from "lucide-react"

interface VerifyMerchantButtonProps {
  merchantId: string
}

export function VerifyMerchantButton({ merchantId }: VerifyMerchantButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from("merchants").update({ is_verified: true }).eq("id", merchantId)

      if (error) throw error

      if (user) {
        await supabase.from("admin_actions").insert({
          admin_id: user.id,
          action_type: "verify_merchant",
          target_id: merchantId,
          target_type: "merchant",
        })
      }

      router.refresh()
    } catch (error) {
      console.error("Error verifying merchant:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleVerify} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          <BadgeCheck className="mr-2 h-4 w-4" />
          Verificar Comercio
        </>
      )}
    </Button>
  )
}
