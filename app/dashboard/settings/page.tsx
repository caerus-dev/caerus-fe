"use client"

import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { User, Shield, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  
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
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xl">
              {user?.name?.substring(0, 2)?.toUpperCase() || "US"}
            </div>
            <div>
              <Button variant="outline" size="sm">
                Cambiar Avatar
              </Button>
            </div>
          </div>
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
              <p className="font-medium">Autenticación en Dos Pasos (2FA)</p>
              <p className="text-sm text-muted-foreground">
                Agregá una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Button variant="outline">Activar 2FA</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-muted-foreground">
                Actualizá la contraseña de tu cuenta
              </p>
            </div>
            <Button variant="outline">Cambiar</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sesiones Activas</p>
              <p className="text-sm text-muted-foreground">
                Administrá los dispositivos donde iniciaste sesión
              </p>
            </div>
            <Button variant="outline">Ver Sesiones</Button>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
