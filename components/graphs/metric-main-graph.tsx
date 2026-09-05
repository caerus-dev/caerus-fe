import * as React from "react"
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

export interface MetricDefinition {
  key: string
  label: string
  color: string
  description?: string
}

interface MetricMainGraphProps {
  metric: MetricDefinition
  data: any[]
}

export function MetricMainGraph({ metric, data }: MetricMainGraphProps) {
  const chartConfig = {
    [metric.key]: { label: metric.label, color: metric.color }
  } satisfies ChartConfig

  const values = data.map(d => Number(d[metric.key]) || 0)
  const total = values.reduce((sum, val) => sum + val, 0)
  const max = values.length > 0 ? Math.max(...values) : 0
  const min = values.length > 0 ? Math.min(...values) : 0
  const avg = values.length > 0 ? total / values.length : 0

  const formatStat = (num: number) => {
    if (num === 0) return "0"
    if (Math.abs(num) < 1) {
      return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 2 }).format(num)
    }
    return new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(num)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <CardTitle>{metric.label}</CardTitle>
          <CardDescription>{metric.description || "Visualización detallada de la estadística seleccionada"}</CardDescription>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-6 shrink-0 flex-wrap">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Avg</span>
              <span className="font-semibold text-sm">{formatStat(avg)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Min</span>
              <span className="font-semibold text-sm">{formatStat(min)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Max</span>
              <span className="font-semibold text-sm">{formatStat(max)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Total</span>
              <span className="font-semibold text-sm text-primary">{formatStat(total)}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos para este rango</div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`mainFill${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                  width={50} 
                  tickFormatter={(tick) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(tick)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#mainFill${metric.key})`}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
