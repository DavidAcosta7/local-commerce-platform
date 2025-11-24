"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface MerchantFormProps {
  userId: string
  merchant?: {
    id: string
    business_name: string
    description: string | null
    category: string
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    logo_url: string | null
    cover_image_url: string | null
  }
}

export function MerchantForm({ userId, merchant }: MerchantFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const data = {
        owner_id: userId,
        business_name: formData.get("business_name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string,
        logo_url: formData.get("logo_url") as string,
        cover_image_url: formData.get("cover_image_url") as string,
        qr_code: merchant ? merchant.id : `${window.location.origin}/comercios/`,
      }

      if (merchant) {
        // Update existing merchant
        const { error } = await supabase.from("merchants").update(data).eq("id", merchant.id)

        if (error) throw error
      } else {
        // Create new merchant
        const { data: newMerchant, error } = await supabase.from("merchants").insert(data).select().single()

        if (error) throw error

        // Update QR code with actual merchant ID
        if (newMerchant) {
          await supabase
            .from("merchants")
            .update({
              qr_code: `${window.location.origin}/comercios/${newMerchant.id}`,
            })
            .eq("id", newMerchant.id)
        }
      }

      router.push("/panel")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al guardar el comercio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="business_name">
                Nombre del negocio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="business_name"
                name="business_name"
                required
                defaultValue={merchant?.business_name}
                placeholder="Ej: Panadería El Sol"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select name="category" defaultValue={merchant?.category || "Tienda"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Tienda">Tienda</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Salud">Salud</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={merchant?.description || ""}
                placeholder="Describe tu negocio..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                defaultValue={merchant?.address || ""}
                placeholder="Ej: Calle Principal #123"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={merchant?.phone || ""}
                  placeholder="Ej: +1234567890"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={merchant?.email || ""}
                  placeholder="contacto@negocio.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={merchant?.website || ""}
                placeholder="https://www.minegocio.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input
                id="logo_url"
                name="logo_url"
                type="url"
                defaultValue={merchant?.logo_url || ""}
                placeholder="https://ejemplo.com/logo.png"
              />
              <p className="text-xs text-gray-500">Puedes usar un servicio como Imgur o tu propio hosting</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cover_image_url">URL de imagen de portada</Label>
              <Input
                id="cover_image_url"
                name="cover_image_url"
                type="url"
                defaultValue={merchant?.cover_image_url || ""}
                placeholder="https://ejemplo.com/portada.png"
              />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : merchant ? (
                "Actualizar Comercio"
              ) : (
                "Crear Comercio"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
