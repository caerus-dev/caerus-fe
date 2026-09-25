import Link from "next/link"
import { Check, Sparkles, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { auth0 } from "@/lib/auth0"
import { getPublicBillingPlans, PLAN_MARKETING_METADATA } from "@/lib/billing-plans"

const faqs = [
  {
    question: "¿Necesito tarjeta de crédito para empezar?",
    answer:
      "Sí. Para activar la cuenta y desplegar aplicaciones, tenés que registrar una tarjeta de respaldo; el plan Developer sigue costando $0 y solo cobra excedentes.",
  },
  {
    question: "¿Qué ocurre si supero el límite mensual de llamadas?",
    answer:
      "Tu servicio nunca se interrumpe: tanto en el plan Developer como en Startup las llamadas adicionales se tarifan por bloques transparentes ($0.50 y $0.20 USD por cada 10.000 requests respectivamente).",
  },
  {
    question: "¿Puedo cambiar de plan o cancelar en cualquier momento?",
    answer:
      "Sí, podés subir, bajar o cancelar tu suscripción en cualquier momento desde la sección de Facturación dentro de tu dashboard.",
  },
]

export default async function PricingPage() {
  const session = await auth0.getSession()
  const plans = await getPublicBillingPlans()

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
            {plans.map((plan) => {
              const metaFn = PLAN_MARKETING_METADATA[plan.code] || PLAN_MARKETING_METADATA.DEVELOPER
              const meta = metaFn(plan)
              const isEnterprise = plan.code === "ENTERPRISE"
              const isFree = plan.monthlyBasePrice.amount === 0

              const priceDisplay = isEnterprise
                ? "A Medida"
                : isFree
                ? "$0"
                : `$${(plan.monthlyBasePrice.amount / 100).toFixed(0)}`

              const periodDisplay = isEnterprise ? "consultar" : "al mes"

              const ctaHref = session?.user
                ? isEnterprise
                  ? meta.ctaHref
                  : "/dashboard/billing"
                : meta.ctaHref

              const ctaText = session?.user
                ? isEnterprise
                  ? meta.ctaText
                  : isFree
                  ? "Gestionar Plan"
                  : "Actualizar a Startup"
                : meta.ctaText

              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 ${
                    meta.highlight
                      ? "border-primary bg-card/80 shadow-2xl shadow-primary/15 scale-105 z-10"
                      : "border-border bg-card/50 hover:border-border/80 hover:bg-card/70"
                  }`}
                >
                  {meta.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 flex items-center gap-1.5 shadow-md">
                        <Sparkles className="h-3.5 w-3.5" />
                        {meta.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{plan.name}</h2>
                      {!meta.highlight && (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {meta.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground min-h-[40px]">{meta.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-8">
                    <span className="text-5xl font-extrabold tracking-tight">{priceDisplay}</span>
                    <span className="text-sm text-muted-foreground">{periodDisplay}</span>
                  </div>

                  <div className="space-y-3.5 mb-8 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Incluye:
                    </p>
                    {meta.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-foreground/90 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {meta.isExternalLink ? (
                    <a href={ctaHref} className="w-full mt-auto">
                      <Button
                        className="w-full h-12 text-sm font-semibold"
                        variant={meta.highlight ? "default" : "outline"}
                      >
                        {ctaText}
                      </Button>
                    </a>
                  ) : (
                    <Link href={ctaHref} className="w-full mt-auto">
                      <Button
                        className="w-full h-12 text-sm font-semibold"
                        variant={meta.highlight ? "default" : "outline"}
                      >
                        {ctaText}
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })}
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
