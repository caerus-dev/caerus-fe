"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon, Loader2, BarChart2, Expand } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface MetricsTabProps {
  appId: string
  selectedEnv: string
  currentEnvDetails: any
}

type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

const DLS_METRICS = [
  { key: "dlsAcquireAttempts", label: "Intentos de Acquire", color: "var(--chart-1)", description: "Número total de veces que se intentó adquirir un lock distribuido." },
  { key: "dlsContentionFailures", label: "Fallos por Contención", color: "var(--chart-2)", description: "Cantidad de intentos de adquisición que fallaron porque el lock ya estaba en uso." },
  { key: "dlsContentionRate", label: "Tasa de Contención", color: "var(--chart-4)", description: "Proporción de intentos de adquisición que resultaron en fallos por contención." },
  { key: "dlsDeadlocks", label: "Deadlocks", color: "var(--destructive)", description: "Número de interbloqueos (deadlocks) detectados y resueltos por el sistema." },
  { key: "dlsAbandonedLocks", label: "Locks Abandonados", color: "var(--chart-5)", description: "Cantidad de locks que expiraron por no ser liberados correctamente por el cliente." },
  { key: "dlsAverageCriticalSectionMs", label: "Sección Crítica Promedio (ms)", color: "var(--chart-3)", description: "Tiempo promedio (en milisegundos) que un lock se mantuvo retenido antes de ser liberado." },
]

const SRE_METRICS = [
  { key: "sreTakeAttempts", label: "Intentos de Take", color: "var(--chart-4)", description: "Número total de solicitudes para consumir o reservar recursos compartidos." },
  { key: "sreCapacityRejections", label: "Rechazos por Capacidad", color: "var(--chart-5)", description: "Cantidad de solicitudes rechazadas debido a la falta de capacidad disponible." },
  { key: "sreCapacityRejectionRate", label: "Tasa de Rechazo", color: "var(--chart-2)", description: "Proporción de solicitudes que fueron rechazadas por exceder la capacidad del recurso." },
  { key: "sreAverageRetentionMs", label: "Retención Promedio (ms)", color: "var(--chart-1)", description: "Tiempo promedio (en milisegundos) que los recursos compartidos fueron retenidos." },
]

import { MetricMainGraph } from "@/components/graphs/metric-main-graph"
import { MetricSmallGraph } from "@/components/graphs/metric-small-graph"

export function MetricsTab({ appId, selectedEnv, currentEnvDetails }: MetricsTabProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  
  const [statsData, setStatsData] = useState<any[]>([])
  const [topResources, setTopResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedDlsMetric, setSelectedDlsMetric] = useState(DLS_METRICS[0])
  const [selectedSreMetric, setSelectedSreMetric] = useState(SRE_METRICS[0])
  
  const [topLimit, setTopLimit] = useState("5")

  useEffect(() => {
    if (!currentEnvDetails?.id || !date?.from) return

    const fetchMetrics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const startDateStr = format(date.from!, "yyyy-MM-dd")
        const endDateStr = date.to ? format(date.to, "yyyy-MM-dd") : startDateStr

        const [statsRes, topRes] = await Promise.all([
          fetch(`/api/environments/${currentEnvDetails.id}/statistics?startDate=${startDateStr}&endDate=${endDateStr}`),
          fetch(`/api/environments/${currentEnvDetails.id}/statistics/top-resources?startDate=${startDateStr}&endDate=${endDateStr}&limit=${topLimit}`)
        ])

        if (!statsRes.ok) throw new Error("Error fetching statistics")
        if (!topRes.ok) throw new Error("Error fetching top resources")

        const stats = await statsRes.json()
        const top = await topRes.json()

        // Format dates for charts
        const formattedStats = stats.map((stat: any) => ({
          ...stat,
          displayDate: format(new Date(stat.date), "MMM dd")
        }))

        setStatsData(formattedStats)
        setTopResources(top)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [currentEnvDetails?.id, date, topLimit])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Métricas</h2>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Seleccionar rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date as any}
                onSelect={(range: any) => setDate(range)}
                numberOfMonths={2}
                showOutsideDays={false}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 text-destructive text-sm flex items-center gap-2">
            Error al cargar métricas: {error}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* SRE Section */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Shared Resources (SRE)
            </h3>
            <div className="flex flex-col md:grid gap-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <div className="space-y-4 min-w-0">
                <MetricMainGraph metric={selectedSreMetric} data={statsData} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SRE_METRICS.map(m => (
                    <MetricSmallGraph 
                      key={m.key}
                      metric={m} 
                      data={statsData} 
                      isSelected={selectedSreMetric.key === m.key} 
                      onClick={() => setSelectedSreMetric(m)} 
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle>Top Recursos</CardTitle>
                      <CardDescription>Los recursos SRE más utilizados</CardDescription>
                    </div>
                    <Select value={topLimit} onValueChange={setTopLimit}>
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue placeholder="Lim." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Top 5</SelectItem>
                        <SelectItem value="10">Top 10</SelectItem>
                        <SelectItem value="20">Top 20</SelectItem>
                        <SelectItem value="30">Top 30</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="flex-1 max-h-[500px] overflow-y-auto pr-2">
                    {topResources.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground min-h-[250px]">
                        {isLoading ? "Cargando..." : "Sin datos de recursos"}
                      </div>
                    ) : (
                      <div style={{ height: topResources.length * 28 + 20 }}>
                        <ChartContainer
                          config={{
                            usageCount: { label: "Uso", color: "var(--chart-1)" }
                          }}
                          className="h-full w-full"
                        >
                          <BarChart data={topResources} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="resourceKey" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 13, fontWeight: 600, fill: "var(--foreground)" }} 
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="usageCount" fill="var(--color-usageCount)" radius={[0, 4, 4, 0]} barSize={14} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* DLS Section */}
          <div className="space-y-4 border-t pt-8">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Distributed Locks (DLS)
            </h3>
            <MetricMainGraph metric={selectedDlsMetric} data={statsData} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {DLS_METRICS.map(m => (
                <MetricSmallGraph 
                  key={m.key}
                  metric={m} 
                  data={statsData} 
                  isSelected={selectedDlsMetric.key === m.key} 
                  onClick={() => setSelectedDlsMetric(m)} 
                />
              ))}
            </div>
          </div>

          {/* Billing Section */}
          <div className="space-y-4 border-t pt-8">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Consumo
            </h3>
            <MetricMainGraph 
              metric={{ 
                key: "totalBillingUnits", 
                label: "Unidades de Facturación", 
                color: "var(--chart-5)",
                description: "Cantidad total de unidades de facturación generadas por el uso de la plataforma en este período."
              }} 
              data={statsData} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
