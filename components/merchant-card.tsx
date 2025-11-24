import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, BadgeCheck } from "lucide-react"

interface MerchantCardProps {
  merchant: {
    id: string
    business_name: string
    description: string | null
    category: string
    address: string | null
    logo_url: string | null
    is_verified: boolean
    averageRating: number
    totalComments: number
  }
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  return (
    <Link href={`/comercios/${merchant.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="p-0">
          {merchant.logo_url ? (
            <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-200">
              <img
                src={merchant.logo_url || "/placeholder.svg"}
                alt={merchant.business_name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-t-lg bg-gradient-to-br from-blue-100 to-orange-100" />
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight flex-1">{merchant.business_name}</h3>
            {merchant.is_verified && <BadgeCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />}
          </div>

          <Badge variant="secondary" className="text-xs">
            {merchant.category}
          </Badge>

          {merchant.description && <p className="text-sm text-gray-600 line-clamp-2">{merchant.description}</p>}

          <div className="flex items-center justify-between pt-2">
            {merchant.address && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{merchant.address}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {merchant.averageRating > 0 ? merchant.averageRating.toFixed(1) : "N/A"}
              </span>
              <span className="text-gray-500">({merchant.totalComments})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
