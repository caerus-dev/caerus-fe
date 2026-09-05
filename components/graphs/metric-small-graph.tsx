import * as React from "react"
import { Expand } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { Area, AreaChart } from "recharts"
import { cn } from "@/lib/utils"
import { MetricDefinition } from "./metric-main-graph"

interface MetricSmallGraphProps {
  metric: MetricDefinition
  data: any[]
  isSelected: boolean
  onClick: () => void
}

export function MetricSmallGraph({ metric, data, isSelected, onClick }: MetricSmallGraphProps) {
  const chartConfig = {
    [metric.key]: { label: metric.label, color: metric.color }
  } satisfies ChartConfig

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50",
        isSelected ? "border-primary ring-1 ring-primary" : ""
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Expand className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-2 h-[100px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin datos</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                fillOpacity={1}
                fill={`url(#fill${metric.key})`}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
