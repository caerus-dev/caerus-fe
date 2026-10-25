import { Box, Lock, RefreshCw, Webhook, Clock, Shield } from "lucide-react"
import { SectionHeading } from "./section-heading"

const features = [
  {
    icon: Box,
    title: "Shared Resource Engine",
    description:
      "Gestiona recursos compartidos con reserva temporal y confirmación. Ideal para stock, turnos, cupos y más.",
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
    title: "Estrategias de reintento y cola",
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
    <section id="features" className="scroll-mt-24 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title={
            <>
              Todo lo que necesitas para <span className="text-primary">concurrencia</span>
            </>
          }
          description="Dos módulos principales que cubren los casos de uso más comunes en sistemas distribuidos."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/20"
              />
              <div className="relative mb-6 flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {feature.badge}
                </span>
              </div>
              <h3 className="relative mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
