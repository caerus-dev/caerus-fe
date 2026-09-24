"use client"

import { useTheme } from "@/components/theme-provider"
import { useUser } from "@/hooks/use-user"
import { useState, useEffect } from "react"
import { User, Palette, Trash2, AlertTriangle, Mail, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  const { sessionUser: user } = useUser()
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)

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
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil
            </CardTitle>
            <CardDescription>
              Información de tu cuenta personal e identidad
            </CardDescription>
          </div>
          {user?.sub && (
            <Badge variant="outline" className="w-fit text-xs gap-1.5 font-medium bg-secondary/50 border-border/80 text-muted-foreground py-1 px-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {user.sub.startsWith("google-oauth2|")
                ? "Cuenta de Google"
                : user.sub.startsWith("github|")
                ? "Cuenta de GitHub"
                : "Cuenta de Caerus"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/60">
            <Avatar className="h-16 w-16 border-2 border-border shadow-xs shrink-0">
              <AvatarImage
                src={user?.picture}
                alt={user?.name || "Usuario"}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {user?.name?.substring(0, 2)?.toUpperCase() || user?.email?.substring(0, 2)?.toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Nombre completo</p>
                <p className="text-base font-semibold text-foreground truncate">
                  {user?.name || (user ? "Sin nombre configurado" : "Cargando...")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Correo electrónico</p>
                <div className="flex items-center gap-1.5 text-sm text-foreground/90 font-medium">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{user?.email || (user ? "Sin correo disponible" : "Cargando...")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/40 leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground/80 mt-0.5" />
            <p>
              {user?.sub?.startsWith("google-oauth2|")
                ? "Tu nombre, correo y foto de perfil están vinculados a tu cuenta de Google. Para modificarlos, gestioná tus datos directamente en tu cuenta de Google."
                : user?.sub?.startsWith("github|")
                ? "Tu nombre, correo y foto de perfil están vinculados a tu cuenta de GitHub. Para modificarlos, gestioná tus datos directamente en tu perfil de GitHub."
                : "Tu información de perfil está asociada a tus credenciales de acceso a Caerus. Para solicitar una actualización de tus datos, comunicate con soporte."}
            </p>
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
