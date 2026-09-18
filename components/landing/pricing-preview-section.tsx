import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PricingPreviewSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-secondary/15 border-y border-border/40 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs py-1 px-3">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Modelo de Suscripción
                </Badge>
                <span className="text-xs text-muted-foreground">Comenzá 100% gratis</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Empezá sin costo, escalá a medida que crezca tu concurrencia
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Caerus funciona bajo un esquema de facturación pensado para desarrolladores. Contás con un{" "}
                <strong className="text-foreground font-semibold">plan gratuito Developer ($0/mes)</strong> con
                50.000 requests mensuales incluidas para prototipar y validar tu producto con costo inicial cero. A medida que tu
                tráfico y tus necesidades de alta disponibilidad aumentan, podés escalar de plan en cualquier momento.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Sin costo inicial</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-chart-2 shrink-0" />
                  <span>Subí de nivel cuando quieras</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>SLA y soporte para empresas</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 items-start md:items-end justify-center">
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-6 font-semibold gap-2 shadow-lg shadow-primary/20">
                  Ver detalle de cada plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground text-center md:text-right w-full">
                Comparativa de límites y precios
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
