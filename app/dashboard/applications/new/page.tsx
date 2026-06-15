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
export default function NewApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environments: {
      development: true,
      staging: false,
      production: false,
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
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (response.ok) {
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
    
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nueva Aplicación</h1>
            <p className="text-muted-foreground">
              Crea una nueva aplicación para comenzar tu integración
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
                  placeholder="Describe brevemente tu aplicación..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={isLoading}
                  maxLength={500}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ambientes</CardTitle>
              <CardDescription>
                Selecciona los ambientes que deseas configurar. Podrás agregar más
                ambientes posteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="development"
                    checked={formData.environments.development}
                    onCheckedChange={(checked) =>
                      handleEnvironmentChange("development", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="development"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      Desarrollo
                      <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        dev
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ambiente para pruebas locales y desarrollo
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="staging"
                    checked={formData.environments.staging}
                    onCheckedChange={(checked) =>
                      handleEnvironmentChange("staging", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="staging"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      Staging
                      <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        stg
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ambiente de pre-producción para pruebas finales
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="production"
                    checked={formData.environments.production}
                    onCheckedChange={(checked) =>
                      handleEnvironmentChange("production", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="production"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      Producción
                      <span className="px-1.5 py-0.5 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        prod
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ambiente productivo con tráfico real de usuarios
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Link href="/dashboard/applications">
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || formData.name.length > 100 || formData.description.length > 500}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
