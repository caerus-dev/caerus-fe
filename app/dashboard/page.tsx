import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Layers,
  Activity,
  Lock,
  Gauge,
  ArrowUpRight,
  Zap,
  Rocket,
  Building2,
  AlertTriangle,
  CreditCard,
  Plus,
  Box,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/shared/stat-card";
import { EnvBadge } from "@/components/dashboard/shared/env-badge";
import { DashboardHeaderAlerts } from "@/components/dashboard/DashboardHeaderAlerts";
import { CreateAppButton } from "@/components/applications/CreateAppButton";
import { fetchBackend } from "@/lib/api";
import { auth0 } from "@/lib/auth0";
import { UserResponse } from "@/types/billing";
import { formatPercentage } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const user = session?.user;
  const orgName = user?.org_name || user?.name || "usuario";

  // Fetch backend user profile
  let userProfile: UserResponse | null = null;
  try {
    const userRes = await fetchBackend("/v1/users/me");
    if (userRes.ok) {
      userProfile = await userRes.json();
    }
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      redirect("/auth/login");
    }
    console.error("Error fetching user profile from backend:", error);
  }

  // Fetch applications
  let appsCount = 0;
  let applicationsList: any[] = [];
  try {
    const appsRes = await fetchBackend("/v1/applications?page=0&size=10");
    if (appsRes.ok) {
      const data = await appsRes.json();
      appsCount = data.totalElements ?? data.content?.length ?? 0;
      applicationsList = data.content ?? [];
    }
  } catch (error: any) {
    console.error("Error fetching applications:", error);
  }

  const hasValidPaymentMethod = Boolean(userProfile?.hasValidPaymentMethod);
  const usagePercentage = userProfile?.billingUsage?.percentage ?? 0;
  const consumedUnits = userProfile?.billingUsage?.consumedUnits ?? 0;
  const includedUnits = userProfile?.billingUsage?.includedUnits ?? 50000;

  const isEnterprise = userProfile?.billingPlan?.code === "ENTERPRISE";
  const activeCollaborators = userProfile?.activeCollaboratorsCount ?? 0;
  const totalTeamMembers = 1 + activeCollaborators;
  const maxMembers = userProfile?.billingPlan?.maxCollaborators;

  const dashboardStats = [
    {
      name: "Aplicaciones",
      value: appsCount.toString(),
      icon: Layers,
      valueColor: "text-primary",
    },
    {
      name: "Plan Actual",
      value: userProfile?.billingPlan?.name || "Developer",
      icon: Zap,
      valueColor: "text-primary",
    },
    {
      name: "Miembros del Equipo",
      value: maxMembers === null
        ? (activeCollaborators > 0 ? `${totalTeamMembers} (Ilimitados)` : "Ilimitados")
        : maxMembers === 1
        ? "1 / 1 (Solo tú)"
        : `${totalTeamMembers} / ${maxMembers}`,
      icon: Users,
      valueColor: "text-primary",
    },
    {
      name: "Estado de Cuenta",
      value: isEnterprise ? "Empresarial" : hasValidPaymentMethod ? "Activa" : "Pendiente",
      icon: ShieldCheck,
      valueColor: isEnterprise ? "text-purple-400" : hasValidPaymentMethod ? "text-emerald-500" : "text-amber-500",
    },
  ];

  const recentActivity: any[] = [];

  const getEventColor = (event: string) => {
    if (event.includes("acquired") || event.includes("confirmed") || event.includes("created")) {
      return "text-primary";
    }
    if (event.includes("released")) {
      return "text-muted-foreground";
    }
    if (event.includes("expired") || event.includes("failed")) {
      return "text-chart-4";
    }
    return "text-foreground";
  };

  const getRoleBadge = (role: string) => {
    const normalized = role?.toUpperCase();
    switch (normalized) {
      case "OWNER":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-semibold">
            Propietario
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-semibold">
            Administrador
          </Badge>
        );
      case "VIEWER":
      default:
        return (
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs font-semibold">
            Lector
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header con Botón Inteligente de Crear App */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vista General</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            $ caerus status --org {orgName}
          </p>
        </div>
        <CreateAppButton
          hasValidPaymentMethod={hasValidPaymentMethod}
          className="shrink-0"
        />
      </div>

      {/* 2. Banners Dinámicos según estado de pago y consumo */}
      <DashboardHeaderAlerts
        user={userProfile}
        appsCount={appsCount}
      />

      {/* 3. Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            valueColor={stat.valueColor}
          />
        ))}
      </div>

      {/* 4. Widget de Consumo para Dueño con Tarjeta */}
      {hasValidPaymentMethod && (
        <Card className="border-border bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Consumo del Período Actual ({userProfile?.billingUsage?.period || "Mensual"})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEnterprise
                    ? "Límite incluido en tu plan Enterprise: Capacidad a medida según contrato"
                    : `Límite incluido en tu plan ${userProfile?.billingPlan?.name || "Developer"}: ${includedUnits.toLocaleString()} requests`}
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-8">
                <Link href="/dashboard/billing">
                  Gestionar Plan y Facturación
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEnterprise ? (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">
                  <strong className="text-foreground font-mono">{consumedUnits.toLocaleString()}</strong> requests consumidas este período
                </span>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-semibold">
                  Sin límite estricto
                </Badge>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-mono">{consumedUnits.toLocaleString()}</strong> de{" "}
                    <span className="font-mono">{includedUnits.toLocaleString()}</span> requests consumidas
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {formatPercentage(usagePercentage)}%
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all duration-500 ease-in-out ${
                      usagePercentage >= 100
                        ? "bg-destructive"
                        : usagePercentage >= 80
                        ? "bg-amber-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Aplicaciones Recientes */}
      {appsCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tus Aplicaciones Recientes
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {appsCount} {appsCount === 1 ? "aplicación" : "aplicaciones"}
              </span>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground gap-1 text-xs h-7">
                <Link href="/dashboard/applications">
                  Ver todas
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applicationsList.map((app: any) => (
              <Card key={app.id} className="border-border bg-card/60 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Box className="h-4 w-4 text-primary" />
                        {app.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {app.description || "Sin descripción"}
                      </CardDescription>
                    </div>
                    {getRoleBadge(app.myRole)}
                  </div>
                </CardHeader>
                <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(app.environments || []).length} {app.environments?.length === 1 ? "entorno" : "entornos"}</span>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Link href={`/dashboard/applications/${app.id}`}>
                      Abrir
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. Actividad Reciente */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Actividad Reciente
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground gap-1">
            <Link href="/dashboard/usage">
              Ver todo
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
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
                    Entorno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tiempo
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No hay actividad reciente.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
