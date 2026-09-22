"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, subDays } from "date-fns"
import {
  BarChart3,
  Activity,
  Calendar,
  Download,
  Filter,
  Zap,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useUser } from "@/hooks/use-user"
import { useApps } from "@/components/dashboard/apps-context"
import { toast } from "sonner"

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState("30d")
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUser()
  const { applications, isAppsLoading } = useApps()

  const consumedUnits = user?.billingUsage?.consumedUnits ?? 0
  const includedUnits =
    user?.billingUsage?.includedUnits ?? user?.billingPlan?.includedBillingUnits ?? 0
  const usagePercentage =
    user?.billingUsage?.percentage ??
    (includedUnits > 0 ? Math.round((consumedUnits / includedUnits) * 100) : 0)
  const isNearLimit = usagePercentage >= 80
  const isOverLimit = usagePercentage >= 100
  const currentPlan = user?.billingPlan
  const period = user?.billingUsage?.period || new Date().toISOString().slice(0, 7)

  const [dailyUsageData, setDailyUsageData] = useState<{ date: string; calls: number }[]>([])
  const [appUsageData, setAppUsageData] = useState<Record<string, number>>({})
  const [isChartLoading, setIsChartLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadDailyUsage() {
      setIsChartLoading(true)
      try {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const now = new Date()
        const startDate = format(subDays(now, days), "yyyy-MM-dd")
        const endDate = format(now, "yyyy-MM-dd")

        // Obtener aplicaciones y sus entornos para consultar telemetría
        const appsRes = await fetch("/api/applications?size=50", { cache: "no-store" })
        if (!appsRes.ok) {
          if (isMounted) setIsChartLoading(false)
          return
        }

        const appsData = await appsRes.json()
        const appsList: any[] = appsData.content || []
        const envIds: string[] = []
        const envToAppMap: Record<string, string> = {}
        const initialAppUsage: Record<string, number> = {}

        for (const app of appsList) {
          if (app.name) {
            initialAppUsage[app.name] = 0
          }
          if (Array.isArray(app.environments)) {
            for (const env of app.environments) {
              if (env.id) {
                envIds.push(env.id)
                if (app.name) {
                  envToAppMap[env.id] = app.name
                }
              }
            }
          }
        }

        const statsByDate: Record<string, number> = {}
        const appUsageCount: Record<string, number> = { ...initialAppUsage }

        if (envIds.length > 0) {
          const statsPromises = envIds.map(async (envId) => {
            try {
              const res = await fetch(
                `/api/environments/${envId}/statistics?startDate=${startDate}&endDate=${endDate}`,
                { cache: "no-store" }
              )
              if (res.ok) {
                const data = await res.json()
                return { envId, data }
              }
            } catch {
              return { envId, data: [] }
            }
            return { envId, data: [] }
          })

          const results = await Promise.allSettled(statsPromises)
          for (const res of results) {
            if (res.status === "fulfilled" && Array.isArray(res.value.data)) {
              const appName = envToAppMap[res.value.envId]
              for (const stat of res.value.data) {
                if (stat.date) {
                  const callsCount =
                    Number(stat.totalBillingUnits || 0) ||
                    (Number(stat.dlsAcquireAttempts || 0) + Number(stat.sreTakeAttempts || 0))
                  statsByDate[stat.date] = (statsByDate[stat.date] || 0) + callsCount
                  if (appName) {
                    appUsageCount[appName] = (appUsageCount[appName] || 0) + callsCount
                  }
                }
              }
            }
          }
        }

        // Construir puntos continuos para cada día del rango
        const points = []
        for (let i = days; i >= 0; i--) {
          const d = subDays(now, i)
          const dateKey = format(d, "yyyy-MM-dd")
          const label = d.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
          points.push({
            date: label,
            calls: statsByDate[dateKey] || 0,
          })
        }

        if (isMounted) {
          setDailyUsageData(points)
          setAppUsageData(appUsageCount)
        }
      } catch (err) {
        console.error("Error loading usage chart data:", err)
      } finally {
        if (isMounted) {
          setIsChartLoading(false)
        }
      }
    }

    loadDailyUsage()

    return () => {
      isMounted = false
    }
  }, [timeRange])

  const totalDailyCalls = dailyUsageData.reduce((acc, curr) => acc + curr.calls, 0)

  const handleExport = () => {
    if (!user) {
      toast.error("No hay datos de facturación disponibles para exportar")
      return
    }
    try {
      const rows = [
        ["Concepto", "Valor"],
        ["Período", period],
        ["Plan", currentPlan?.name || "Sin plan"],
        ["Código de Plan", currentPlan?.code || "-"],
        ["Requests Consumidas", consumedUnits.toString()],
        ["Requests Incluidas", includedUnits.toString()],
        ["Porcentaje de Uso", `${usagePercentage}%`],
        ["Aplicaciones Activas", applications.map((a) => a.name).join("; ") || "Ninguna"],
        ["Fecha de Generación", new Date().toLocaleString("es-ES")],
      ]
      const escapeCsvCell = (cell: string) => {
        const neutralized = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell
        return `"${neutralized.replace(/"/g, '""')}"`
      }
      const blob = new Blob(
        [`\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}`],
        { type: "text/csv;charset=utf-8" }
      )
      const encodedUri = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `consumo-caerus-${period}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(encodedUri)
      toast.success("Reporte de consumo descargado exitosamente")
    } catch {
      toast.error("Error al exportar los datos de consumo")
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consumo</h1>
          <p className="text-muted-foreground">
            Monitorea el consumo de tu API y los límites de tu plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[190px] sm:w-[200px] shrink-0">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={handleExport}
            disabled={!user || isUserLoading || Boolean(userError)}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Error state */}
      {!isUserLoading && userError && !user ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="font-semibold text-lg text-foreground">
                Error al cargar datos de consumo
              </h3>
              <p className="text-sm text-muted-foreground">
                No pudimos obtener la información de tu plan y uso de la API desde el servidor.
              </p>
              {userError && (
                <p className="text-xs font-mono text-destructive/90 bg-destructive/10 px-2.5 py-1 rounded inline-block">
                  {userError}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => refreshUser()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Usage overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center justify-between">
              <span>Requests Consumidas</span>
              <Activity className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              <div>
                <div className="text-3xl font-bold text-primary">
                  {consumedUnits.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período {period}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center justify-between">
              <span>Plan Activo</span>
              <Zap className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {currentPlan?.name || "Sin plan"}
                  </span>
                  {currentPlan?.code && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {currentPlan.code}
                    </Badge>
                  )}
                </div>
                <div className="mt-1">
                  <Link
                    href="/settings/billing"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Gestionar facturación y límites
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`border-border ${isNearLimit ? "bg-chart-4/5 border-chart-4/30" : "bg-card/50"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground flex items-center justify-between">
              <span>Uso del Plan</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-3xl font-bold ${
                      isOverLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-foreground"
                    }`}
                  >
                    {usagePercentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {consumedUnits.toLocaleString()} / {includedUnits.toLocaleString()} requests
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {isOverLimit ? (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Has superado las requests incluidas.
                  </p>
                ) : isNearLimit ? (
                  <p className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Cerca del límite del plan. Considera mejorar.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Límite de {includedUnits.toLocaleString()} requests mensuales.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Calls Chart */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Llamadas a la API en el Tiempo
          </CardTitle>
          <CardDescription>
            Volumen diario de llamadas a la API durante el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChartLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : totalDailyCalls > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsageData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(val: any) => [`${val} requests`, "Consumo"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : consumedUnits > 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/20">
              <Activity className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Desglose diario no disponible para este período
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Se registraron {consumedUnits.toLocaleString()} requests en el período de facturación actual, pero no se encontraron métricas diarias detalladas para el rango seleccionado.
              </p>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/20">
              <Activity className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Sin actividad registrada
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                No se registraron llamadas a la API durante los últimos{" "}
                {timeRange === "7d" ? "7 días" : timeRange === "30d" ? "30 días" : "90 días"}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application breakdown */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Consumo por Aplicación
            </CardTitle>
            <CardDescription>
              Distribución de llamadas a la API entre tus aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAppsLoading || isChartLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">No tienes aplicaciones registradas todavía.</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Crea tu primera aplicación para comenzar a monitorear su consumo.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 text-xs">
                  <Link href="/dashboard">Ir al Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const appCalls = appUsageData[app.name] ?? 0
                  const hasUsage = totalDailyCalls > 0
                  const isUnavailable = totalDailyCalls === 0 && consumedUnits > 0

                  return (
                    <div
                      key={app.name}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <Link
                          href={app.href}
                          className="text-sm font-medium hover:underline text-foreground truncate block"
                        >
                          {app.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {app.environments.map((env) => (
                            <span
                              key={env}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                env.toLowerCase() === "production" || env.toLowerCase() === "prod"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {env}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-xs font-mono">
                        {isUnavailable ? (
                          <span className="text-muted-foreground italic text-xs font-sans">
                            No disponible
                          </span>
                        ) : hasUsage ? (
                          <div>
                            <span className="font-semibold text-foreground">
                              {appCalls.toLocaleString()}
                            </span>{" "}
                            <span className="text-muted-foreground">requests</span>
                            {appCalls > 0 && (
                              <div className="text-[10px] text-muted-foreground font-sans">
                                {((appCalls / totalDailyCalls) * 100).toFixed(1)}% del total
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">0 requests</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                <p className="text-xs text-muted-foreground pt-2 text-center">
                  {totalDailyCalls === 0 && consumedUnits > 0
                    ? "El desglose por aplicación no está disponible para este período de telemetría."
                    : "El desglose por aplicación se calcula a partir de los registros de telemetría de tus entornos."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event log */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Registro de Eventos
                </CardTitle>
                <CardDescription>Flujo de actividad reciente en tiempo real</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => toast.info("No hay filtros disponibles en este momento.")}
              >
                <Filter className="h-3.5 w-3.5" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-40 text-muted-foreground" />
              <p className="text-sm font-medium">No hay actividad reciente registrada.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Las adquisiciones, confirmaciones y liberaciones de locks ejecutadas mediante el SDK se registrarán aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  )
}
