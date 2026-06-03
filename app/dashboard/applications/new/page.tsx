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
      setError("El nombre de la aplicacion es requerido")
      return
    }

    const selectedEnvs = Object.values(formData.environments).filter(Boolean)
    if (selectedEnvs.length === 0) {
      setError("Debes seleccionar al menos un ambiente")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/dashboard/applications")
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
            <h1 className="text-2xl font-bold text-foreground">Nueva Aplicacion</h1>
            <p className="text-muted-foreground">
              Crea una nueva aplicacion para comenzar tu integracion
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informacion Basica</CardTitle>
              <CardDescription>
                Define el nombre y descripcion de tu aplicacion
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
                <Label htmlFor="name">Nombre de la Aplicacion *</Label>
                <Input
                  id="name"
                  placeholder="Mi Aplicacion"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente tu aplicacion..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ambientes</CardTitle>
              <CardDescription>
                Selecciona los ambientes que deseas configurar. Podras agregar mas
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
                      Development
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
                      Ambiente de pre-produccion para pruebas finales
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
                      Production
                      <span className="px-1.5 py-0.5 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        prod
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ambiente productivo con trafico real de usuarios
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Aplicacion"
              )}
            </Button>
          </div>
        </form>
      </div>
    
  )
}
