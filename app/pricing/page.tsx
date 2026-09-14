import Link from "next/link"
import { Check, Sparkles, ArrowRight, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { auth0 } from "@/lib/auth0"

const pricingPlans = [
  {
    name: "Starter",
    badge: "Para siempre gratis",
    price: "$0",
    period: "al mes",
    description: "Ideal para desarrolladores individuales, prototipos y proyectos en etapa inicial.",
    highlight: false,
    ctaText: "Comenzar Gratis",
    ctaHref: "/auth/login?screen_hint=signup&returnTo=/dashboard",
    features: [
      "1.000 llamadas a la API mensuales",
      "1 Aplicación activa",
      "1 Entorno de ejecución (dev)",
      "Hasta 2 colaboradores",
      "SRE: Retenciones temporales y confirmación",
      "DLS: Bloqueos distribuidos con fencing tokens",
      "Soporte comunitario y documentación",
    ],
  },
  {
    name: "Pro",
    badge: "Más Popular",
    price: "$49",
    period: "al mes",
    description: "Diseñado para startups y aplicaciones en producción con tráfico concurrente real.",
    highlight: true,
    ctaText: "Elegir Plan Pro",
    ctaHref: "/auth/login?screen_hint=signup&returnTo=/dashboard",
    features: [
      "50.000 llamadas a la API mensuales",
      "5 Aplicaciones activas",
      "3 Entornos (dev, stg, prod)",
      "Hasta 10 colaboradores de equipo",
      "Métricas avanzadas y logs de eventos en vivo",
      "Webhooks para alertas de expiración y deadlocks",
      "Soporte prioritario por email con respuesta en < 24hs",
      "Todo lo incluido en el plan Starter",
    ],
  },
  {
    name: "Enterprise",
    badge: "Alta Disponibilidad",
    price: "$199",
    period: "al mes",
    description: "Para empresas y plataformas de misión crítica con grandes volúmenes de transacciones.",
    highlight: false,
    ctaText: "Comenzar con Enterprise",
    ctaHref: "/auth/login?screen_hint=signup&returnTo=/dashboard",
    features: [
      "500.000 llamadas a la API mensuales (ampliables)",
      "Aplicaciones ilimitadas",
      "Entornos ilimitados por aplicación",
      "Colaboradores y miembros de equipo ilimitados",
      "Detección y resolución automática de deadlocks (DFS)",
      "SLA de disponibilidad garantizado del 99.9%",
      "Soporte técnico 24/7 y canal directo dedicado",
      "Todo lo incluido en el plan Pro",
    ],
  },
]

const faqs = [
  {
    question: "¿Necesito tarjeta de crédito para empezar?",
    answer: "No. Podés registrarte y usar el plan Starter gratis sin ingresar ningún método de pago.",
  },
  {
    question: "¿Qué ocurre si supero el límite mensual de llamadas?",
    answer: "En los planes pagos, las llamadas adicionales se tarifan por bloques sin interrupciones de servicio. En el plan gratuito se pausarán las operaciones adicionales hasta el siguiente ciclo mensual.",
  },
  {
    question: "¿Puedo cambiar de plan o cancelar en cualquier momento?",
    answer: "Sí, podés subir, bajar o cancelar tu suscripción en cualquier momento desde la sección de Configuración y Facturación de tu dashboard.",
  },
]

export default async function PricingPage() {
  const session = await auth0.getSession()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={session?.user} />

      <main className="flex-1 pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
              Precios y Suscripciones
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Planes claros pensados para escalar
            </h1>
            <p className="text-lg text-muted-foreground">
              Comenzá gratis para construir tu solución de concurrencia y elegí el plan que mejor se adapte al volumen de tu producto.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 ${
                  plan.highlight
                    ? "border-primary bg-card/80 shadow-2xl shadow-primary/15 scale-105 z-10"
                    : "border-border bg-card/50 hover:border-border/80 hover:bg-card/70"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 flex items-center gap-1.5 shadow-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    {!plan.highlight && (
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <div className="space-y-3.5 mb-8 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Incluye:
                  </p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground/90 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={plan.ctaHref} className="w-full mt-auto">
                  <Button
                    className="w-full h-12 text-sm font-semibold"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto pt-10 border-t border-border/60">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl font-bold">Preguntas frecuentes sobre facturación</h2>
              <p className="text-sm text-muted-foreground">
                ¿Tenés dudas sobre cómo funciona el modelo de cobro de Caerus?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
                  <h3 className="font-semibold text-sm flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
