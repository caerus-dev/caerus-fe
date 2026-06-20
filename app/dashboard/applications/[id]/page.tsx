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
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EnvData {
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
}

type AppEnvironmentsData = Record<"dev" | "staging" | "prod", EnvData>

const appEnvironmentsMock: Record<string, AppEnvironmentsData> = {
  "reserva-engine": {
    dev: {
      resources: [
        { id: "1-dev", name: "seat_reservation_dev", mode: "multiple", status: "active", activeReservations: 12 },
        { id: "2-dev", name: "test_lounge_dev", mode: "unit", status: "active", activeReservations: 0 },
      ],
      locks: [
        { id: "1-dev", name: "payment_mock_lock", type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Clave Desarrollo", prefix: "ck_test_", createdAt: "2024-01-15", lastUsed: "Hace 5m" },
      ],
    },
    staging: {
      resources: [
        { id: "1-stage", name: "seat_reservation_staging", mode: "multiple", status: "active", activeReservations: 5 },
      ],
      locks: [
        { id: "1-stage", name: "payment_stage_lock", type: "exclusive", status: "paused", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Clave Staging", prefix: "ck_stage_", createdAt: "2024-01-15", lastUsed: "Hace 2h" },
      ],
    },
    prod: {
      resources: [
        { id: "1-prod", name: "seat_reservation", mode: "multiple", status: "active", activeReservations: 45 },
        { id: "2-prod", name: "vip_lounge", mode: "unit", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "1-prod", name: "payment_processor", type: "exclusive", status: "active", activeLocks: 3 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-01-15", lastUsed: "Hace 2m" },
      ],
    },
  },
  "lock-service": {
    dev: {
      resources: [],
      locks: [
        { id: "1-dev", name: "order_processing_dev", type: "exclusive", status: "active", activeLocks: 1 },
        { id: "2-dev", name: "inventory_sync_dev", type: "read-write", status: "active", activeLocks: 2 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Development Key", prefix: "ck_test_", createdAt: "2024-02-20", lastUsed: "Hace 5m" },
      ],
    },
    staging: {
      resources: [],
      locks: [
        { id: "1-stage", name: "inventory_sync_staging", type: "read-write", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: "2024-02-20", lastUsed: "Hace 1d" },
      ],
    },
    prod: {
      resources: [],
      locks: [
        { id: "1-prod", name: "order_processing", type: "exclusive", status: "active", activeLocks: 1 },
        { id: "2-prod", name: "inventory_sync", type: "read-write", status: "active", activeLocks: 5 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-02-20", lastUsed: "Hace 10m" },
      ],
    },
  },
  "payment-sync": {
    dev: {
      resources: [
        { id: "1-dev", name: "transaction_slot_dev", mode: "unit", status: "active", activeReservations: 1 },
      ],
      locks: [
        { id: "1-dev", name: "payment_gateway_dev", type: "exclusive", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Dev Key", prefix: "ck_test_", createdAt: "2024-03-10", lastUsed: "Hace 1h" },
      ],
    },
    staging: {
      resources: [
        { id: "1-stage", name: "transaction_slot_staging", mode: "unit", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "1-stage", name: "payment_gateway_staging", type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: "2024-03-10", lastUsed: "Hace 30m" },
      ],
    },
    prod: {
      resources: [
        { id: "1-prod", name: "transaction_slot", mode: "unit", status: "active", activeReservations: 12 },
      ],
      locks: [
        { id: "1-prod", name: "payment_gateway", type: "exclusive", status: "active", activeLocks: 8 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-03-10", lastUsed: "Hace 30s" },
      ],
    },
  },
}

const generateMockDataForApp = (name: string): AppEnvironmentsData => {
  return {
    dev: {
      resources: [
        { id: "custom-1-dev", name: `${name}_resource_dev`, mode: "multiple", status: "active", activeReservations: 1 },
      ],
      locks: [
        { id: "custom-lock-1-dev", name: `${name}_lock_dev`, type: "exclusive", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "custom-key-1-dev", name: "Development Key", prefix: "ck_test_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 10m" },
      ],
    },
    staging: {
      resources: [
        { id: "custom-1-stage", name: `${name}_resource_staging`, mode: "multiple", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "custom-lock-1-stage", name: `${name}_lock_staging`, type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "custom-key-1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 1d" },
      ],
    },
    prod: {
      resources: [
        { id: "custom-1-prod", name: `${name}_resource`, mode: "multiple", status: "active", activeReservations: 5 },
      ],
      locks: [
        { id: "custom-lock-1-prod", name: `${name}_lock`, type: "exclusive", status: "active", activeLocks: 2 },
      ],
      apiKeys: [
        { id: "custom-key-1-prod", name: "Production Key", prefix: "ck_live_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 30s" },
      ],
    },
  }
}

const getMockDataForEnv = (appName: string, envName: string): EnvData => {
  const predefined = appEnvironmentsMock[appName];
  if (predefined) {
    if (envName === "dev" || envName === "development") return predefined.dev;
    if (envName === "stage" || envName === "staging") return predefined.staging;
    if (envName === "prod" || envName === "production") return predefined.prod;
  }
  
  return {
    resources: [
      { id: `${envName}-res-1`, name: `${appName}_res_${envName}`, mode: "multiple", status: "active", activeReservations: 3 },
    ],
    locks: [
      { id: `${envName}-lock-1`, name: `${appName}_lock_${envName}`, type: "exclusive", status: "active", activeLocks: 1 },
    ],
    apiKeys: [
      { id: `${envName}-key-1`, name: `Key ${envName}`, prefix: "ck_live_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 5m" },
    ],
  };
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEnv, setSelectedEnv] = useState<string>("")
  const [currentEnvDetails, setCurrentEnvDetails] = useState<any>(null)

  const currentEnvData = app && selectedEnv
    ? getMockDataForEnv(app.name, selectedEnv)
    : { resources: [], locks: [], apiKeys: [] }

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications/${id}`)
        if (res.ok) {
          const data = await res.json()
          const envs = data.environments || []
          
          let initialEnv = ""
          if (envs.length > 0) {
            const pref = envs.find((e: any) => e.name === "dev" || e.name === "development") ||
                         envs.find((e: any) => e.name === "stage" || e.name === "staging") ||
                         envs.find((e: any) => e.name === "prod" || e.name === "production") ||
                         envs[0];
            initialEnv = pref.name;
          }
          setSelectedEnv(initialEnv)

          setApp({
            id: data.id.toString(),
            name: data.name,
            description: data.description || "",
            environments: envs,
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

  useEffect(() => {
    if (!app || !app.environments || !selectedEnv) return;
    const activeEnvObj = app.environments.find((env: any) => env.name === selectedEnv);
    if (!activeEnvObj) return;

    const fetchEnvDetails = async () => {
      try {
        const res = await fetch(`/api/environments/${activeEnvObj.id}`);
        if (res.ok) {
          const envData = await res.json();
          setCurrentEnvDetails(envData);
        }
      } catch (error) {
        console.error("Error fetching environment details:", error);
      }
    };
    fetchEnvDetails();
  }, [selectedEnv, app])

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
        {/* Row 1: Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{app.name}</h1>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                {app.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedEnv}
              onValueChange={(val: any) => setSelectedEnv(val)}
            >
              <SelectTrigger
                size="sm"
                className="w-full sm:w-[190px] h-8 justify-between border border-border bg-secondary/40 shadow-xs hover:bg-secondary/80 hover:border-primary/40 text-xs font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-normal">Ambiente:</span>
                  <SelectValue placeholder="Ambiente" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {app?.environments && app.environments.length > 0 ? (
                  app.environments.map((env: any) => (
                    <SelectItem key={env.id} value={env.name}>
                      <span className="flex items-center gap-1.5 font-mono">
                        <span className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          env.name === "prod" || env.name === "production"
                            ? "bg-primary shrink-0 animate-pulse"
                            : env.name === "stage" || env.name === "staging"
                            ? "bg-chart-4 shrink-0"
                            : "bg-chart-2 shrink-0"
                        )} />
                        {env.name}
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="dev">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-chart-2 shrink-0" />
                      Desarrollo
                    </span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href={`/dashboard/applications/${id}/team`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2 h-8 w-full sm:w-auto">
                  <Users className="h-4 w-4" />
                  Equipo
                </Button>
              </Link>
              <Link href={`/dashboard/applications/${id}/settings`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2 h-8 w-full sm:w-auto">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Description */}
        {app.description && (
          <div className="md:pl-16">
            <p className="text-muted-foreground max-w-2xl text-sm line-clamp-3 md:line-clamp-none">
              {app.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-muted-foreground" />
              Recursos
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{currentEnvData.resources.length}</div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Configuraciones de Locks
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-2">{currentEnvData.locks.length}</div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              API Keys
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">{currentEnvData.apiKeys.length}</div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              Operaciones Activas
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-4">
              {((((selectedEnv === "prod" || selectedEnv === "production")
                ? 145230900
                : (selectedEnv === "stage" || selectedEnv === "staging")
                ? 28920400
                : 4520300) +
                currentEnvData.resources.reduce((sum: number, r: any) => sum + r.activeReservations, 0) +
                currentEnvData.locks.reduce((sum: number, l: any) => sum + l.activeLocks, 0)
              ).toLocaleString("es-AR"))}
            </div>
          </div>
        </Card>
      </div>

      {/* Contextual Indicator Banner */}
      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground bg-secondary/20 border border-border/40 rounded-lg p-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              selectedEnv === "prod" || selectedEnv === "production"
                ? "bg-primary"
                : selectedEnv === "stage" || selectedEnv === "staging"
                ? "bg-chart-4"
                : "bg-chart-2"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              selectedEnv === "prod" || selectedEnv === "production"
                ? "bg-primary"
                : selectedEnv === "stage" || selectedEnv === "staging"
                ? "bg-chart-4"
                : "bg-chart-2"
            )} />
          </span>
          <span>
            Mostrando configuraciones y estadísticas para el ambiente:{" "}
            <strong className="text-foreground font-mono">{selectedEnv}</strong>
          </span>
        </div>
        {currentEnvDetails?.description && (
          <p className="pl-[18px] text-muted-foreground/80 leading-relaxed">
            <span className="font-semibold text-foreground/75 not-italic mr-1.5">Descripción:</span>
            {currentEnvDetails.description}
          </p>
        )}
      </div>

      {/* Tabs for Resources, Locks, API Keys */}
      <Tabs defaultValue="resources" className="space-y-4">
        <div className="w-full pb-1">
          <TabsList className="bg-secondary flex w-full sm:w-fit">
            <TabsTrigger value="resources" className="gap-1.5 px-3">
              <Box className="h-4 w-4" />
              <span>
                Recursos<span className="hidden sm:inline"> Compartidos</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="locks" className="gap-1.5 px-3">
              <Lock className="h-4 w-4" />
              <span>
                Locks<span className="hidden sm:inline"> Distribuidos</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5 px-3">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {currentEnvData.resources.length === 1 ? "1 recurso configurado" : `${currentEnvData.resources.length} recursos configurados`}
            </p>
            <Link href={`/dashboard/applications/${id}/resources/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Recurso
              </Button>
            </Link>
          </div>

          {currentEnvData.resources.length === 0 ? (
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
              {currentEnvData.resources.map((resource: any) => (
                <Card key={resource.id} className="bg-card/50 border-border">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Box className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-mono font-medium text-sm sm:text-base break-all sm:break-normal">{resource.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="capitalize bg-secondary/50 px-2 py-0.5 rounded">Modo {resource.mode === "unit" ? "unitario" : "múltiple"}</span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span className="bg-secondary/50 px-2 py-0.5 rounded">{resource.activeReservations} reservas activas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border/50 sm:border-0 pt-2.5 sm:pt-0">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(resource.status)}`}>
                        {resource.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
              {currentEnvData.locks.length === 1 ? "1 lock configurado" : `${currentEnvData.locks.length} locks configurados`}
            </p>
            <Link href={`/dashboard/applications/${id}/locks/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Lock
              </Button>
            </Link>
          </div>

          {currentEnvData.locks.length === 0 ? (
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
              {currentEnvData.locks.map((lock: any) => (
                <Card key={lock.id} className="bg-card/50 border-border">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                        <Lock className="h-5 w-5 text-chart-2" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-mono font-medium text-sm sm:text-base break-all sm:break-normal">{lock.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="capitalize bg-secondary/50 px-2 py-0.5 rounded">Tipo {lock.type === "exclusive" ? "exclusivo" : "lectura-escritura"}</span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span className="bg-secondary/50 px-2 py-0.5 rounded">{lock.activeLocks} activos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border/50 sm:border-0 pt-2.5 sm:pt-0">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(lock.status)}`}>
                        {lock.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
              {currentEnvData.apiKeys.length === 1 ? "1 API Key" : `${currentEnvData.apiKeys.length} API Keys`}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generar API Key
            </Button>
          </div>

          <div className="space-y-3">
            {currentEnvData.apiKeys.map((key: any) => (
              <Card key={key.id} className="bg-card/50 border-border">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium text-sm sm:text-base">{key.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                        {key.prefix}••••••••••••
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-border/50 sm:border-0 pt-2.5 sm:pt-0">
                    <div className="text-left sm:text-right text-xs sm:text-sm">
                      <span className="text-muted-foreground mr-1 sm:mr-0 sm:block">Último uso:</span>
                      <span>{key.lastUsed === "30s ago" ? "Hace 30s" : key.lastUsed === "2m ago" ? "Hace 2m" : key.lastUsed === "5m ago" ? "Hace 5m" : key.lastUsed}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
