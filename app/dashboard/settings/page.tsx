"use client"

import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { User, Shield, Palette, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  
  // We'll fetch the user data in this client component to replace the mock.
  // In the future this could be supplied by a global context.
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user")
        if (res.ok) {
          const data = await res.json()
          if (data && data.user) {
            setUser(data.user)
          }
        }
      } catch (err) {
        console.error("Failed to fetch user", err)
      }
    }
    fetchUser()
  }, [])

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    setDeleteAccountError(null)
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
      })
      if (res.status === 204 || res.ok) {
        toast.success("Cuenta eliminada exitosamente")
        window.location.href = "/auth/logout"
      } else {
        const errData = await res.json().catch(() => ({}))
        const msg = errData.message || errData.error || "Error al eliminar la cuenta"
        setDeleteAccountError(msg)
        toast.error(msg)
      }
    } catch (err: any) {
      console.error("Error deleting account:", err)
      const msg = err?.message || "Ocurrió un error inesperado al eliminar la cuenta"
      setDeleteAccountError(msg)
      toast.error(msg)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administrá las preferencias de tu cuenta personal
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>
            Información de tu cuenta personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" defaultValue={user?.name || ""} readOnly className="bg-secondary text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} readOnly className="bg-secondary text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personalizá el aspecto visual de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select
              value={theme}
              onValueChange={(value) => {
                if (value === "light" || value === "dark" || value === "system") {
                  setTheme(value)
                }
              }}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Administrá la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-muted-foreground">
                Actualizá la contraseña de tu cuenta
              </p>
            </div>
            <Button variant="outline">Cambiar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Peligro */}
      <Card className="bg-card/50 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones irreversibles y destructivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Eliminar Cuenta</p>
              <p className="text-sm text-muted-foreground">
                Eliminar permanentemente tu cuenta de usuario y todos tus datos asociados
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingAccount}>
                  {isDeletingAccount ? "Eliminando..." : "Eliminar Cuenta"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 pt-1 text-sm text-muted-foreground">
                      <p>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente tu
                        cuenta, todas tus aplicaciones, entornos, API keys y removerá todo acceso como colaborador.
                      </p>
                      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-xs">Liquidación final de facturación</p>
                          <p>
                            Si contás con un método de pago registrado o un plan pago activo con consumo del ciclo actual, se generará y cobrará automáticamente una factura de liquidación final en tu tarjeta antes de cerrar tu cuenta.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteAccountError && (
                  <div className="p-3 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {deleteAccountError}
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingAccount}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingAccount ? "Eliminando cuenta..." : "Sí, eliminar mi cuenta"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
