"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Loader2, Plus, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
interface Environment {
  id: string
  name: string
  label: string
  enabled: boolean
}

export default function ApplicationSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [environments, setEnvironments] = useState<Environment[]>([
    { id: "dev", name: "development", label: "Development", enabled: true },
    { id: "stg", name: "staging", label: "Staging", enabled: true },
    { id: "prod", name: "production", label: "Production", enabled: true },
  ])

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications/${id}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            name: data.name,
            description: data.description || "",
          })
        } else {
          console.error("Failed to load application settings")
        }
      } catch (error) {
        console.error("Error loading application settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchApp()
  }, [id])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleEnvironment = (id: string) => {
    setEnvironments((prev) =>
      prev.map((env) =>
        env.id === id ? { ...env, enabled: !env.enabled } : env
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        router.push(`/dashboard/applications/${id}`)
      } else {
        console.error("Failed to save application settings")
      }
    } catch (error) {
      console.error("Error saving application settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        router.push("/dashboard/applications")
      } else {
        console.error("Failed to delete application")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Configuración de Aplicación
            </h1>
            <p className="text-muted-foreground">
              Modifica la configuración de tu aplicación
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Actualiza el nombre y descripción de tu aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="name">Nombre de la Aplicación</Label>
                <span className={cn(
                  "text-[10px] transition-colors",
                  formData.name.length >= 100 ? "text-destructive font-semibold" : formData.name.length >= 90 ? "text-yellow-500 font-medium" : "text-muted-foreground"
                )}>
                  {formData.name.length} / 100
                </span>
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSaving}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Descripción</Label>
                <span className={cn(
                  "text-[10px] transition-colors",
                  formData.description.length >= 500 ? "text-destructive font-semibold" : formData.description.length >= 450 ? "text-yellow-500 font-medium" : "text-muted-foreground"
                )}>
                  {formData.description.length} / 500
                </span>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isSaving}
                maxLength={500}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Environments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ambientes</CardTitle>
                <CardDescription>
                  Gestiona los ambientes de tu aplicación
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ambiente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${
                        env.name === "production"
                          ? "border-green-500/50 text-green-400"
                          : env.name === "staging"
                          ? "border-yellow-500/50 text-yellow-400"
                          : "border-blue-500/50 text-blue-400"
                      }`}
                    >
                      {env.name}
                    </Badge>
                    <span className="text-sm text-foreground">{env.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {env.enabled ? "Activo" : "Inactivo"}
                      </span>
                      <Switch
                        checked={env.enabled}
                        onCheckedChange={() => toggleEnvironment(env.id)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Peligro
            </CardTitle>
            <CardDescription>
              Acciones irreversibles para tu aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <p className="font-medium text-foreground">
                  Eliminar Aplicación
                </p>
                <p className="text-sm text-muted-foreground">
                  Elimina permanentemente esta aplicación y todos sus datos
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSaving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/applications">
            <Button variant="outline" disabled={isSaving}>
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim() || formData.name.length > 100 || formData.description.length > 500}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Aplicación</DialogTitle>
              <DialogDescription>
                Esta acción eliminará permanentemente la aplicación{" "}
                <span className="font-medium text-foreground">
                  {formData.name}
                </span>{" "}
                junto con todas sus configuraciones, API keys, y datos de uso.
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar Permanentemente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
