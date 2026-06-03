"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Check, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Building2,
  Rocket
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
interface Plan {
  id: string
  name: string
  price: number
  priceLabel: string
  description: string
  features: string[]
  apiLimit: number
  recommended?: boolean
  icon: React.ReactNode
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Gratis",
    description: "Ideal para proyectos personales y pruebas",
    features: [
      "1,000 API calls/mes",
      "1 Aplicacion",
      "1 Ambiente (dev)",
      "2 Colaboradores",
      "Soporte por email",
    ],
    apiLimit: 1000,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "$49/mes",
    description: "Para equipos en crecimiento",
    features: [
      "50,000 API calls/mes",
      "5 Aplicaciones",
      "3 Ambientes",
      "10 Colaboradores",
      "Soporte prioritario",
      "Webhooks",
      "Analytics avanzados",
    ],
    apiLimit: 50000,
    recommended: true,
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    priceLabel: "$199/mes",
    description: "Para grandes organizaciones",
    features: [
      "500,000 API calls/mes",
      "Aplicaciones ilimitadas",
      "Ambientes ilimitados",
      "Colaboradores ilimitados",
      "Soporte 24/7",
      "SLA 99.99%",
      "Integraciones personalizadas",
      "Onboarding dedicado",
    ],
    apiLimit: 500000,
    icon: <Building2 className="w-5 h-5" />,
  },
]

const usageData = [
  { date: "1 Ene", calls: 2400 },
  { date: "5 Ene", calls: 4500 },
  { date: "10 Ene", calls: 8200 },
  { date: "15 Ene", calls: 12800 },
  { date: "20 Ene", calls: 18500 },
  { date: "25 Ene", calls: 28300 },
  { date: "30 Ene", calls: 41200 },
]

export default function BillingPage() {
  const [currentPlan] = useState("pro")
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  
  // Simulated usage data
  const currentUsage = 41200
  const planLimit = 50000
  const usagePercentage = (currentUsage / planLimit) * 100
  const isNearLimit = usagePercentage >= 80

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id !== currentPlan) {
      setSelectedPlan(plan)
      setUpgradeDialogOpen(true)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Suscripcion y Consumo
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu plan y monitorea el uso de la plataforma
          </p>
        </div>

        {/* Usage Alert */}
        {isNearLimit && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">
                Te estas acercando al limite de tu plan
              </p>
              <p className="text-sm text-muted-foreground">
                Has consumido el {usagePercentage.toFixed(0)}% de tus API calls
                mensuales. Considera actualizar tu plan para evitar
                interrupciones en el servicio.
              </p>
            </div>
          </div>
        )}

        {/* Current Usage */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Consumo del Mes
              </CardTitle>
              <CardDescription>
                Uso acumulado de API calls en el periodo actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {formatNumber(currentUsage)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    de {formatNumber(planLimit)} API calls
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    isNearLimit
                      ? "border-yellow-500/50 text-yellow-400"
                      : "border-green-500/50 text-green-400"
                  }`}
                >
                  {usagePercentage.toFixed(0)}% usado
                </Badge>
              </div>
              <Progress
                value={usagePercentage}
                className={`h-2 ${isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                El periodo se reinicia el 1 de cada mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grafico de Uso</CardTitle>
              <CardDescription>
                Evolucion del consumo de API calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
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
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [formatNumber(value), 'API Calls']}
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorCalls)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Planes Disponibles
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended
                    ? "border-primary shadow-lg shadow-primary/10"
                    : ""
                } ${
                  plan.id === currentPlan
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Recomendado
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {plan.id === currentPlan && (
                          <Badge variant="secondary" className="text-xs">
                            Plan Actual
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {plan.priceLabel}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Facturado mensualmente
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.id === currentPlan ? "outline" : "default"}
                    disabled={plan.id === currentPlan}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {plan.id === currentPlan
                      ? "Plan Actual"
                      : plan.price > plans.find((p) => p.id === currentPlan)!.price
                      ? "Actualizar"
                      : "Cambiar Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade Dialog */}
        <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar a Plan {selectedPlan?.name}</DialogTitle>
              <DialogDescription>
                {selectedPlan && selectedPlan.price > plans.find((p) => p.id === currentPlan)!.price
                  ? `Tu nuevo plan incluira ${formatNumber(selectedPlan.apiLimit)} API calls mensuales y todas las caracteristicas del plan ${selectedPlan.name}.`
                  : `Cambiaras a un plan con menos capacidad. Tu nuevo limite sera de ${selectedPlan ? formatNumber(selectedPlan.apiLimit) : 0} API calls mensuales.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUpgradeDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setUpgradeDialogOpen(false)}>
                Confirmar Cambio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
