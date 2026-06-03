import Link from "next/link"
import { Layers, Activity, Lock, Gauge, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    name: "Applications",
    value: "3",
    icon: Layers,
  },
  {
    name: "API calls (30d)",
    value: "84.2k",
    icon: Activity,
  },
  {
    name: "Active locks",
    value: "12",
    icon: Lock,
  },
  {
    name: "Plan usage",
    value: "68%",
    icon: Gauge,
  },
]

const recentActivity = [
  {
    id: 1,
    event: "lock.acquired",
    application: "payment-sync",
    environment: "prod",
    time: "2s ago",
  },
  {
    id: 2,
    event: "reserve.confirmed",
    application: "reserva-engine",
    environment: "prod",
    time: "15s ago",
  },
  {
    id: 3,
    event: "lock.released",
    application: "lock-service",
    environment: "dev",
    time: "32s ago",
  },
  {
    id: 4,
    event: "reserve.expired",
    application: "reserva-engine",
    environment: "prod",
    time: "1m ago",
  },
  {
    id: 5,
    event: "api_key.created",
    application: "payment-sync",
    environment: "prod",
    time: "5m ago",
  },
]

export default function DashboardPage() {
  const usagePercentage = 68

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

  const getEventColor = (event: string) => {
    if (event.includes("acquired") || event.includes("confirmed") || event.includes("created")) {
      return "text-primary"
    }
    if (event.includes("released")) {
      return "text-muted-foreground"
    }
    if (event.includes("expired") || event.includes("failed")) {
      return "text-chart-4"
    }
    return "text-foreground"
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          $ caerus status --org acme-corp
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-bold ${stat.name === "Plan usage" ? "text-chart-4" : "text-primary"}`}>
                  {stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage warning */}
      {usagePercentage >= 60 && (
        <div className="flex items-center gap-3 rounded-lg border border-chart-4/30 bg-chart-4/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-chart-4 flex-shrink-0" />
          <p className="text-sm text-foreground">
            Usage is at <span className="font-semibold text-chart-4">{usagePercentage}%</span> of your Free plan limit — consider{" "}
            <Link href="/dashboard/billing" className="underline hover:text-primary transition-colors">
              upgrading
            </Link>{" "}
            to avoid service interruption.
          </p>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
          <Link href="/dashboard/usage">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <Card className="bg-card/50 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Application
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Environment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-border last:border-0 hover:bg-sidebar-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getEventColor(activity.event) === "text-primary" ? "bg-primary" : getEventColor(activity.event) === "text-chart-4" ? "bg-chart-4" : "bg-muted-foreground"}`} />
                        <span className={`font-mono text-sm font-medium ${getEventColor(activity.event)}`}>
                          {activity.event}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{activity.application}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getEnvironmentBadgeClass(activity.environment)}`}>
                        {activity.environment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
