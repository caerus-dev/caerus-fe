"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApps } from "@/components/dashboard/apps-context"

export default function NewApplicationPage() {
  const { refreshApps } = useApps()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environments: {
      dev: true,
      stage: false,
      prod: false,
    },
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEnvironmentChange = (env: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      environments: { ...prev.environments, [env]: checked },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("El nombre de la aplicación es requerido")
      return
    }

    const selectedEnvs = Object.values(formData.environments).filter(Boolean)
    if (selectedEnvs.length === 0) {
      setError("Debes seleccionar al menos un ambiente")
      return
    }

    setIsLoading(true)
    try {
      const selectedEnvNames = Object.entries(formData.environments)
        .filter(([_, checked]) => checked)
        .map(([env]) => env)

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          environments: selectedEnvNames,
        }),
      });

      if (response.ok) {
        refreshApps();
        router.push("/dashboard/applications");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Error al crear la aplicación");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      setError("Ocurrió un error inesperado al intentar crear la aplicación");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/applications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Aplicación</h1>
          <p className="text-muted-foreground">
            Configura una nueva aplicación para empezar a gestionar sus recursos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Define el nombre y descripción de tu aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="name">Nombre de la Aplicación *</Label>
                <span className={cn(
                  "text-[10px] transition-colors",
                  formData.name.length >= 100 ? "text-destructive font-semibold" : formData.name.length >= 90 ? "text-yellow-500 font-medium" : "text-muted-foreground"
                )}>
                  {formData.name.length} / 100
                </span>
              </div>
              <Input
                id="name"
                placeholder="Mi Aplicación"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isLoading}
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
                placeholder="Breve descripción de la aplicación..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isLoading}
                maxLength={500}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ambientes Iniciales</CardTitle>
            <CardDescription>
              Selecciona los ambientes que deseas crear inicialmente. Podrás añadir o remover ambientes posteriormente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={cn(
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                formData.environments.dev ? "bg-primary/5 border-primary" : "hover:bg-accent/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}>
                <Checkbox
                  checked={formData.environments.dev}
                  onCheckedChange={(checked) => handleEnvironmentChange("dev", checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">Development</p>
                  <p className="text-xs text-muted-foreground">Ambiente de desarrollo y pruebas locales.</p>
                </div>
              </label>

              <label className={cn(
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                formData.environments.stage ? "bg-primary/5 border-primary" : "hover:bg-accent/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}>
                <Checkbox
                  checked={formData.environments.stage}
                  onCheckedChange={(checked) => handleEnvironmentChange("stage", checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">Staging</p>
                  <p className="text-xs text-muted-foreground">Ambiente de pruebas pre-producción.</p>
                </div>
              </label>

              <label className={cn(
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                formData.environments.prod ? "bg-primary/5 border-primary" : "hover:bg-accent/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}>
                <Checkbox
                  checked={formData.environments.prod}
                  onCheckedChange={(checked) => handleEnvironmentChange("prod", checked as boolean)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">Production</p>
                  <p className="text-xs text-muted-foreground">Ambiente productivo para usuarios finales.</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/applications">
            <Button variant="outline" type="button" disabled={isLoading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Aplicación"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}