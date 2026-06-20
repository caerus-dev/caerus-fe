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
import { ArrowLeft, Loader2, Plus, Trash2, AlertTriangle, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
interface Environment {
  id: string
  name: string
  label: string
  description?: string
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
  const [environments, setEnvironments] = useState<Environment[]>([])

  // States for environments CRUD
  const [envDialogOpen, setEnvDialogOpen] = useState(false)
  const [envDialogMode, setEnvDialogMode] = useState<"create" | "edit">("create")
  const [selectedEnvForEdit, setSelectedEnvForEdit] = useState<Environment | null>(null)
  const [envForm, setEnvForm] = useState({ name: "", description: "" })
  const [envFormError, setEnvFormError] = useState("")
  const [isSavingEnv, setIsSavingEnv] = useState(false)
  const [confirmDeleteEnvOpen, setConfirmDeleteEnvOpen] = useState(false)
  const [selectedEnvForDelete, setSelectedEnvForDelete] = useState<Environment | null>(null)

  useEffect(() => {
    const fetchAppAndEnvs = async () => {
      try {
        const [appRes, envsRes] = await Promise.all([
          fetch(`/api/applications/${id}`),
          fetch(`/api/environments?applicationId=${id}`),
        ])

        if (appRes.ok) {
          const appData = await appRes.json()
          setFormData({
            name: appData.name,
            description: appData.description || "",
          })
        } else {
          console.error("Failed to load application details")
        }

        if (envsRes.ok) {
          const envsData = await envsRes.json()
          if (envsData && envsData.content) {
            setEnvironments(
              envsData.content.map((env: any) => ({
                id: env.id,
                name: env.name,
                label: env.name.charAt(0).toUpperCase() + env.name.slice(1),
                description: env.description || "",
                enabled: true,
              }))
            )
          }
        } else {
          console.error("Failed to load environments")
        }
      } catch (error) {
        console.error("Error loading application settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppAndEnvs()
  }, [id])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenCreateEnv = () => {
    setEnvDialogMode("create")
    setSelectedEnvForEdit(null)
    setEnvForm({ name: "", description: "" })
    setEnvFormError("")
    setEnvDialogOpen(true)
  }

  const handleOpenEditEnv = (env: Environment) => {
    setEnvDialogMode("edit")
    setSelectedEnvForEdit(env)
    setEnvForm({ name: env.name, description: env.description || "" })
    setEnvFormError("")
    setEnvDialogOpen(true)
  }

  const handleSaveEnv = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnvFormError("")

    if (!envForm.name.trim()) {
      setEnvFormError("El nombre del ambiente es requerido")
      return
    }

    setIsSavingEnv(true)
    try {
      if (envDialogMode === "create") {
        const res = await fetch("/api/environments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: id,
            name: envForm.name,
            description: envForm.description,
          }),
        })
        if (res.ok) {
          const newEnv = await res.json()
          setEnvironments((prev) => [
            ...prev,
            {
              id: newEnv.id,
              name: newEnv.name,
              label: newEnv.name.charAt(0).toUpperCase() + newEnv.name.slice(1),
              description: newEnv.description || "",
              enabled: true,
            },
          ])
          setEnvDialogOpen(false)
        } else {
          const errData = await res.json().catch(() => ({}))
          setEnvFormError(errData.error || "Error al crear el ambiente")
        }
      } else if (envDialogMode === "edit" && selectedEnvForEdit) {
        const res = await fetch(`/api/environments/${selectedEnvForEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: envForm.name,
            description: envForm.description,
          }),
        })
        if (res.ok) {
          const updatedEnv = await res.json()
          setEnvironments((prev) =>
            prev.map((e) =>
              e.id === selectedEnvForEdit.id
                ? {
                    ...e,
                    name: updatedEnv.name,
                    label: updatedEnv.name.charAt(0).toUpperCase() + updatedEnv.name.slice(1),
                    description: updatedEnv.description || "",
                  }
                : e
            )
          )
          setEnvDialogOpen(false)
        } else {
          const errData = await res.json().catch(() => ({}))
          setEnvFormError(errData.error || "Error al actualizar el ambiente")
        }
      }
    } catch (error) {
      console.error("Error saving environment:", error)
      setEnvFormError("Ocurrió un error inesperado al guardar el ambiente")
    } finally {
      setIsSavingEnv(false)
    }
  }

  const handleOpenDeleteEnv = (env: Environment) => {
    setSelectedEnvForDelete(env)
    setConfirmDeleteEnvOpen(true)
  }

  const handleDeleteEnvConfirm = async () => {
    if (!selectedEnvForDelete) return
    setIsSavingEnv(true)
    try {
      const res = await fetch(`/api/environments/${selectedEnvForDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setEnvironments((prev) => prev.filter((e) => e.id !== selectedEnvForDelete.id))
        setConfirmDeleteEnvOpen(false)
        setSelectedEnvForDelete(null)
      } else {
        console.error("Failed to delete environment")
      }
    } catch (error) {
      console.error("Error deleting environment:", error)
    } finally {
      setIsSavingEnv(false)
    }
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
              <Button type="button" variant="outline" size="sm" onClick={handleOpenCreateEnv}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Ambiente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {environments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No hay ambientes configurados. Agrega uno para empezar.
              </div>
            ) : (
              <div className="space-y-3">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-4 hover:bg-accent/5 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`${
                            env.name === "prod" || env.name === "production"
                              ? "border-green-500/50 text-green-700 bg-green-50/50 dark:border-green-500/50 dark:text-green-400 dark:bg-transparent"
                              : env.name === "stage" || env.name === "staging"
                              ? "border-yellow-500/50 text-yellow-700 bg-yellow-50/50 dark:border-yellow-500/50 dark:text-yellow-400 dark:bg-transparent"
                              : "border-blue-500/50 text-blue-700 bg-blue-50/50 dark:border-blue-500/50 dark:text-blue-400 dark:bg-transparent"
                          }`}
                        >
                          {env.name}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground font-mono">{env.label}</span>
                      </div>
                      {env.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pr-4 italic">
                          {env.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 shrink-0 border-t border-border/50 sm:border-0 pt-2 sm:pt-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-foreground text-muted-foreground"
                        onClick={() => handleOpenEditEnv(env)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive text-muted-foreground"
                        onClick={() => handleOpenDeleteEnv(env)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

        {/* Create/Edit Environment Dialog */}
        <Dialog open={envDialogOpen} onOpenChange={setEnvDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {envDialogMode === "create" ? "Crear Ambiente" : "Editar Ambiente"}
              </DialogTitle>
              <DialogDescription>
                Define el nombre y la descripción para el ambiente de tu aplicación.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEnv} className="space-y-4">
              {envFormError && (
                <div className="p-3 rounded bg-destructive/10 text-destructive text-xs border border-destructive/20">
                  {envFormError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="envName">Nombre del Ambiente *</Label>
                <Input
                  id="envName"
                  value={envForm.name}
                  onChange={(e) => setEnvForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ej: dev, staging, prod, testing"
                  maxLength={100}
                  disabled={isSavingEnv}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="envDesc">Descripción</Label>
                <Textarea
                  id="envDesc"
                  value={envForm.description}
                  onChange={(e) => setEnvForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente el propósito de este ambiente..."
                  maxLength={500}
                  rows={3}
                  disabled={isSavingEnv}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEnvDialogOpen(false)}
                  disabled={isSavingEnv}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingEnv}>
                  {isSavingEnv ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Environment Confirmation Dialog */}
        <Dialog open={confirmDeleteEnvOpen} onOpenChange={setConfirmDeleteEnvOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Ambiente</DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas eliminar el ambiente{" "}
                <span className="font-semibold text-foreground">{selectedEnvForDelete?.name}</span>?
                Esta acción es irreversible y eliminará todos los recursos, locks y API keys asociados a este ambiente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteEnvOpen(false)}
                disabled={isSavingEnv}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEnvConfirm}
                disabled={isSavingEnv}
              >
                {isSavingEnv ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
