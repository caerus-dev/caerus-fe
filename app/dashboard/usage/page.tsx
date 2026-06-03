"use client"

import { useState } from "react"
import { BarChart3, Activity, Calendar, Download, Filter, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  BarChart,
  Bar,
} from "recharts"

const usageData = [
  { date: "May 1", calls: 2400, locks: 120 },
  { date: "May 5", calls: 3200, locks: 180 },
  { date: "May 10", calls: 2800, locks: 150 },
  { date: "May 15", calls: 4100, locks: 220 },
  { date: "May 20", calls: 3600, locks: 190 },
  { date: "May 25", calls: 4800, locks: 280 },
  { date: "May 30", calls: 5200, locks: 310 },
]

const applicationBreakdown = [
  { name: "reserva-engine", calls: 45200, percentage: 54 },
  { name: "payment-sync", calls: 28400, percentage: 34 },
  { name: "lock-service", calls: 10600, percentage: 12 },
]

const eventLog = [
  { id: 1, event: "lock.acquired", app: "payment-sync", env: "prod", time: "2s ago" },
  { id: 2, event: "reserve.confirmed", app: "reserva-engine", env: "prod", time: "15s ago" },
  { id: 3, event: "lock.released", app: "lock-service", env: "dev", time: "32s ago" },
  { id: 4, event: "reserve.expired", app: "reserva-engine", env: "prod", time: "1m ago" },
  { id: 5, event: "api_key.created", app: "payment-sync", env: "prod", time: "5m ago" },
  { id: 6, event: "lock.timeout", app: "lock-service", env: "dev", time: "8m ago" },
  { id: 7, event: "reserve.confirmed", app: "reserva-engine", env: "prod", time: "12m ago" },
  { id: 8, event: "lock.acquired", app: "payment-sync", env: "prod", time: "15m ago" },
]

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState("30d")

  const totalCalls = 84200
  const planLimit = 125000
  const usagePercentage = Math.round((totalCalls / planLimit) * 100)
  const isNearLimit = usagePercentage >= 80

  const getEnvironmentBadgeClass = (env: string) => {
    switch (env) {
      case "prod":
        return "bg-primary/20 text-primary"
      case "dev":
        return "bg-chart-2/20 text-chart-2"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getEventColor = (event: string) => {
    if (event.includes("acquired") || event.includes("confirmed") || event.includes("created")) {
      return "text-primary"
    }
    if (event.includes("expired") || event.includes("timeout")) {
      return "text-chart-4"
    }
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usage</h1>
          <p className="text-muted-foreground">
            Monitor your API consumption and plan limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Usage overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              API Calls (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">84.2k</span>
              <span className="flex items-center text-xs text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.3%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Active Locks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-chart-2">12</span>
              <span className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-border ${isNearLimit ? "bg-chart-4/5 border-chart-4/30" : "bg-card/50"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Plan Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-bold ${isNearLimit ? "text-chart-4" : "text-foreground"}`}>
                  {usagePercentage}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalCalls.toLocaleString()} / {planLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isNearLimit ? "bg-chart-4" : "bg-primary"}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              {isNearLimit && (
                <p className="text-xs text-chart-4">
                  Approaching plan limit. Consider upgrading.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Calls Chart */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Calls Over Time
          </CardTitle>
          <CardDescription>
            Daily API call volume for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application breakdown */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage by Application
            </CardTitle>
            <CardDescription>
              API calls distribution across applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {applicationBreakdown.map((app) => (
                <div key={app.name} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{app.name}</span>
                  <span className="text-muted-foreground">{app.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event log */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Log</CardTitle>
                <CardDescription>Real-time activity stream</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {eventLog.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${getEventColor(event.event) === "text-primary" ? "bg-primary" : getEventColor(event.event) === "text-chart-4" ? "bg-chart-4" : "bg-muted-foreground"}`} />
                    <div>
                      <p className={`font-mono text-sm ${getEventColor(event.event)}`}>{event.event}</p>
                      <p className="text-xs text-muted-foreground">{event.app}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${getEnvironmentBadgeClass(event.env)}`}>
                      {event.env}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
