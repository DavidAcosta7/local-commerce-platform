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
      const { error } = await supabase.from("merchants").update({ is_verified: true }).eq("id", merchantId)

      if (error) throw error

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
