"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserCog } from "lucide-react"

export function UpdateUserRoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdateRole = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Update user role
    const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (!updateError) {
      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "update_user_role",
        target_id: userId,
        target_type: "user",
        details: { old_role: currentRole, new_role: role },
      })

      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog className="h-4 w-4 mr-1" />
          Cambiar Rol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>Selecciona el nuevo rol para este usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="merchant">Comerciante</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateRole} disabled={loading || role === currentRole}>
            {loading ? "Actualizando..." : "Actualizar Rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
