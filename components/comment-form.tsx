"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2 } from "lucide-react"

interface CommentFormProps {
  merchantId: string
  userId: string
}

export function CommentForm({ merchantId, userId }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").insert({
        merchant_id: merchantId,
        user_id: userId,
        content: content.trim(),
        rating: rating,
      })

      if (error) throw error

      setSuccess(true)
      setContent("")
      setRating(5)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al enviar tu opinión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="space-y-2">
        <Label>Calificación</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Tu opinión</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte tu experiencia con este negocio..."
          rows={4}
          required
          minLength={10}
        />
        <p className="text-xs text-gray-500">
          Mínimo 10 caracteres. Tu comentario será visible después de ser aprobado.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
          ¡Tu opinión ha sido enviada! Será visible una vez aprobada.
        </div>
      )}

      <Button type="submit" disabled={isLoading || content.trim().length < 10}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Opinión"
        )}
      </Button>
    </form>
  )
}
