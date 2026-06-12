import { Box, Lock, RefreshCw, Webhook, Clock, Shield } from "lucide-react"

const features = [
  {
    icon: Box,
    title: "Shared Resource Engine",
    description:
      "Gestiona recursos compartidos con reserva temporal y confirmación. Ideal para asientos, stock, turnos y más.",
    badge: "Core",
  },
  {
    icon: Lock,
    title: "Distributed Lock Service",
    description:
      "Locks distribuidos con fencing tokens para garantizar exclusión mutua en entornos de microservicios.",
    badge: "Core",
  },
  {
    icon: RefreshCw,
    title: "Retry & Queue Strategies",
    description:
      "Configura estrategias de reintento automático o encolado cuando los recursos no están disponibles.",
    badge: "Config",
  },
  {
    icon: Clock,
    title: "TTL Automático",
    description:
      "Define tiempos de expiración para reservas y locks. Liberación automática sin intervención.",
    badge: "Config",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Recibe notificaciones cuando recursos expiran, se liberan o cambian de estado.",
    badge: "Events",
  },
  {
    icon: Shield,
    title: "Idempotencia Integrada",
    description:
      "Evita efectos duplicados ante reintentos con claves de idempotencia configurables.",
    badge: "Safety",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Todo lo que necesitas para{" "}
            <span className="text-primary">concurrencia</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dos módulos principales que cubren los casos de uso más comunes en
            sistemas distribuidos
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-border group-hover:border-primary/50 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
