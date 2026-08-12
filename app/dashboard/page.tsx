import Link from "next/link"
import { AlertTriangle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/shared/stat-card"
import { EnvBadge } from "@/components/dashboard/shared/env-badge"
import { dashboardStatsMock, recentActivityMock } from "@/lib/mocks/dashboard"

export default function DashboardPage() {
  const usagePercentage = 68

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
        <h1 className="text-2xl font-bold tracking-tight">Vista General</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          $ caerus status --org acme-corp
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStatsMock.map((stat) => (
          <StatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            valueColor={stat.name === "Uso del plan" ? "text-chart-4" : "text-primary"}
          />
        ))}
      </div>

      {/* Usage warning */}
      {usagePercentage >= 60 && (
        <div className="flex items-center gap-3 rounded-lg border border-chart-4/30 bg-chart-4/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-chart-4 flex-shrink-0" />
          <p className="text-sm text-foreground">
            El uso está al <span className="font-semibold text-chart-4">{usagePercentage}%</span> de tu límite del plan Gratuito — considera{" "}
            <Link href="/dashboard/billing" className="underline hover:text-primary transition-colors">
              mejorar tu plan
            </Link>{" "}
            para evitar interrupciones en el servicio.
          </p>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Actividad Reciente
          </h2>
          <Link href="/dashboard/usage">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
              Ver todo
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
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Aplicación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ambiente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tiempo
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivityMock.map((activity) => (
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
                      <EnvBadge environment={activity.environment} />
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
