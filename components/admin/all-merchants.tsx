import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteMerchantButton } from "./delete-merchant-button"
import { Building2, MapPin, BadgeCheck, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function AllMerchants() {
  const supabase = await createClient()

  const { data: merchants } = await supabase
    .from("merchants")
    .select(`
      *,
      profiles:owner_id (full_name, email)
    `)
    .order("created_at", { ascending: false })

  if (!merchants || merchants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay comercios registrados</h3>
          <p className="text-gray-600">Los comercios aparecerán aquí cuando se registren</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Todos los Comercios ({merchants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {merchants.map((merchant) => (
            <div key={merchant.id} className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
              {merchant.logo_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={merchant.logo_url || "/placeholder.svg"}
                    alt={merchant.business_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{merchant.business_name}</h3>
                  <Badge variant="outline">{merchant.category}</Badge>
                  {merchant.is_verified ? (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Sin verificar
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {merchant.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{merchant.address}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  <span>Propietario: {merchant.profiles?.full_name || merchant.profiles?.email}</span>
                  <span className="mx-2">•</span>
                  <span>
                    Registrado{" "}
                    {formatDistanceToNow(new Date(merchant.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              <DeleteMerchantButton merchantId={merchant.id} merchantName={merchant.business_name} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
