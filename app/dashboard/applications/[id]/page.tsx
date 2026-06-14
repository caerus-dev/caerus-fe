"use client"

import Link from "next/link"
import { use, useState, useEffect } from "react"
import {
  Box,
  Lock,
  Key,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const applicationData: Record<string, {
  name: string
  description: string
  environment: string
  status: string
  createdAt: string
  resources: Array<{
    id: string
    name: string
    mode: string
    status: string
    activeReservations: number
  }>
  locks: Array<{
    id: string
    name: string
    type: string
    status: string
    activeLocks: number
  }>
  apiKeys: Array<{
    id: string
    name: string
    prefix: string
    createdAt: string
    lastUsed: string
  }>
}> = {
  "reserva-engine": {
    name: "reserva-engine",
    description: "Sistema de reservas para cine multiplex",
    environment: "prod",
    status: "active",
    createdAt: "2024-01-15",
    resources: [
      { id: "1", name: "seat_reservation", mode: "multiple", status: "active", activeReservations: 45 },
      { id: "2", name: "vip_lounge", mode: "unit", status: "active", activeReservations: 2 },
    ],
    locks: [
      { id: "1", name: "payment_processor", type: "exclusive", status: "active", activeLocks: 3 },
    ],
    apiKeys: [
      { id: "1", name: "Production Key", prefix: "ck_live_", createdAt: "2024-01-15", lastUsed: "2m ago" },
    ],
  },
  "lock-service": {
    name: "lock-service",
    description: "Servicio de locks distribuidos para microservicios",
    environment: "dev",
    status: "active",
    createdAt: "2024-02-20",
    resources: [],
    locks: [
      { id: "1", name: "order_processing", type: "exclusive", status: "active", activeLocks: 1 },
      { id: "2", name: "inventory_sync", type: "read-write", status: "active", activeLocks: 5 },
    ],
    apiKeys: [
      { id: "1", name: "Development Key", prefix: "ck_test_", createdAt: "2024-02-20", lastUsed: "5m ago" },
    ],
  },
  "payment-sync": {
    name: "payment-sync",
    description: "Sincronizacion de pagos entre plataformas",
    environment: "prod",
    status: "active",
    createdAt: "2024-03-10",
    resources: [
      { id: "1", name: "transaction_slot", mode: "unit", status: "active", activeReservations: 12 },
    ],
    locks: [
      { id: "1", name: "payment_gateway", type: "exclusive", status: "active", activeLocks: 8 },
    ],
    apiKeys: [
      { id: "1", name: "Production Key", prefix: "ck_live_", createdAt: "2024-03-10", lastUsed: "30s ago" },
    ],
  },
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications/${id}`)
        if (res.ok) {
          const data = await res.json()
          setApp({
            id: data.id.toString(),
            name: data.name,
            description: data.description || "",
            environment: "dev",
            status: "active",
            createdAt: data.createdAt || new Date().toISOString(),
            resources: [],
            locks: [],
            apiKeys: [],
          })
        } else {
          console.error("Failed to fetch application details")
        }
      } catch (error) {
        console.error("Error fetching application details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchApp()
  }, [id])

  const getEnvironmentBadgeClass = (env: string) => {
    switch (env) {
      case "prod":
        return "bg-primary/20 text-primary"
      case "dev":
        return "bg-chart-2/20 text-chart-2"
      case "staging":
        return "bg-chart-4/20 text-chart-4"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary"
      case "paused":
        return "bg-chart-4/20 text-chart-4"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró la aplicación o no tienes acceso.</p>
        <Link href="/dashboard/applications" className="text-primary hover:underline mt-4 inline-block">
          Volver a aplicaciones
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb and header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Aplicaciones
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-mono">{app.name}</h1>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${getEnvironmentBadgeClass(app.environment)}`}>
                  {app.environment}
                </span>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <p className="text-muted-foreground">{app.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/applications/${id}/team`}>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Equipo
              </Button>
            </Link>
            <Link href={`/dashboard/applications/${id}/settings`}>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Box className="h-4 w-4" />
              Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-primary">{app.resources.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Configuraciones de Locks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-chart-2">{app.locks.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{app.apiKeys.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Operaciones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-chart-4">
              {app.resources.reduce((sum: number, r: any) => sum + r.activeReservations, 0) +
                app.locks.reduce((sum: number, l: any) => sum + l.activeLocks, 0)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Resources, Locks, API Keys */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="resources" className="gap-2">
            <Box className="h-4 w-4" />
            Recursos Compartidos
          </TabsTrigger>
          <TabsTrigger value="locks" className="gap-2">
            <Lock className="h-4 w-4" />
            Locks Distribuidos
          </TabsTrigger>
          <TabsTrigger value="keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {app.resources.length === 1 ? "1 recurso configurado" : `${app.resources.length} recursos configurados`}
            </p>
            <Link href={`/dashboard/applications/${id}/resources/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Recurso
              </Button>
            </Link>
          </div>

          {app.resources.length === 0 ? (
            <Card className="bg-card/50 border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Box className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aún no hay recursos configurados</p>
                <Link href={`/dashboard/applications/${id}/resources/new`}>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primer Recurso
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {app.resources.map((resource: any) => (
                <Card key={resource.id} className="bg-card/50 border-border">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Box className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{resource.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">Modo {resource.mode === "unit" ? "unitario" : "múltiple"}</span>
                          <span>•</span>
                          <span>{resource.activeReservations} reservas activas</span>
                        </div>
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(resource.status)}`}>
                        {resource.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/applications/${id}/resources/${resource.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locks" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {app.locks.length === 1 ? "1 lock configurado" : `${app.locks.length} locks configurados`}
            </p>
            <Link href={`/dashboard/applications/${id}/locks/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Lock
              </Button>
            </Link>
          </div>

          {app.locks.length === 0 ? (
            <Card className="bg-card/50 border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aún no hay configuraciones de locks</p>
                <Link href={`/dashboard/applications/${id}/locks/new`}>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primer Lock
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {app.locks.map((lock: any) => (
                <Card key={lock.id} className="bg-card/50 border-border">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                        <Lock className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{lock.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">Tipo {lock.type === "exclusive" ? "exclusivo" : "lectura-escritura"}</span>
                          <span>•</span>
                          <span>{lock.activeLocks} activos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(lock.status)}`}>
                        {lock.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/applications/${id}/locks/${lock.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Liberar Todos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {app.apiKeys.length === 1 ? "1 API Key" : `${app.apiKeys.length} API Keys`}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generar API Key
            </Button>
          </div>

          <div className="space-y-3">
            {app.apiKeys.map((key: any) => (
              <Card key={key.id} className="bg-card/50 border-border">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {key.prefix}••••••••••••
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Último uso</p>
                      <p>{key.lastUsed === "30s ago" ? "Hace 30s" : key.lastUsed === "2m ago" ? "Hace 2m" : key.lastUsed === "5m ago" ? "Hace 5m" : key.lastUsed}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Revelar API Key</DropdownMenuItem>
                        <DropdownMenuItem>Copiar API Key</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Revocar API Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
