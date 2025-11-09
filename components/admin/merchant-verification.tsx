import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VerifyMerchantButton } from "./verify-merchant-button"
import { Building2, MapPin, Phone, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function MerchantVerification() {
  const supabase = await createClient()

  const { data: unverifiedMerchants } = await supabase
    .from("merchants")
    .select(`
      *,
      profiles:owner_id (full_name, email)
    `)
    .eq("is_verified", false)
    .order("created_at", { ascending: true })

  if (!unverifiedMerchants || unverifiedMerchants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay comercios sin verificar</h3>
          <p className="text-gray-600">Todos los comercios han sido verificados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {unverifiedMerchants.map((merchant) => (
        <Card key={merchant.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {merchant.logo_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={merchant.logo_url || "/placeholder.svg"}
                    alt={merchant.business_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-1">{merchant.business_name}</h3>
                <Badge variant="secondary">{merchant.category}</Badge>
              </div>

              {merchant.description && <p className="text-sm text-gray-700">{merchant.description}</p>}

              <div className="space-y-2 text-sm">
                {merchant.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {merchant.address}
                  </div>
                )}
                {merchant.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {merchant.phone}
                  </div>
                )}
                {merchant.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {merchant.email}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Propietario</p>
                <p className="text-sm font-medium">{merchant.profiles?.full_name}</p>
                <p className="text-xs text-gray-600">{merchant.profiles?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Registrado{" "}
                  {formatDistanceToNow(new Date(merchant.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>

              <VerifyMerchantButton merchantId={merchant.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
