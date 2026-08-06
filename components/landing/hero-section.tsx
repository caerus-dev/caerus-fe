import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 overflow-hidden w-full">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.25_0.005_325/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.25_0.005_325/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-border bg-secondary/50 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 max-w-full">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">Backend as a Service para Concurrencia</span>
        </div>

        {/* Main headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.15] mb-6">
          Gestiona la{" "}
          <span className="text-primary">concurrencia</span>
          <br className="hidden sm:inline" />{" "}
          sin escribir código complejo
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 text-pretty leading-relaxed">
          Recursos compartidos, locks distribuidos y coordinación en tiempo real. 
          Integra nuestra API y olvídate de implementar lógica distribuida desde cero.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="glow-primary gap-2 text-base px-8 w-full sm:w-auto">
              Comenzar Gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 w-full sm:w-auto">
              Ver Documentación
            </Button>
          </Link>
        </div>

        {/* Code preview */}
        <div className="mt-12 sm:mt-16 max-w-2xl mx-auto w-full">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden text-left shadow-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-chart-3/50" />
                <div className="w-3 h-3 rounded-full bg-primary/50" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">reservation.ts</span>
            </div>
            <div className="p-3.5 sm:p-6 text-left font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full">
              <code>
                <span className="text-muted-foreground">{"// Reserva un asiento en 3 líneas"}</span>
                <br />
                <span className="text-chart-2">const</span>{" "}
                <span className="text-foreground">reservation</span>{" "}
                <span className="text-chart-2">=</span>{" "}
                <span className="text-chart-2">await</span>{" "}
                <span className="text-chart-3">Caerus</span>
                <span className="text-foreground">.</span>
                <span className="text-primary">reserve</span>
                <span className="text-foreground">(</span>
                <span className="text-chart-3">{'"seat_J4"'}</span>
                <span className="text-foreground">)</span>
                <br />
                <br />
                <span className="text-muted-foreground">{"// Confirma cuando el pago sea exitoso"}</span>
                <br />
                <span className="text-chart-2">await</span>{" "}
                <span className="text-foreground">reservation.</span>
                <span className="text-primary">confirm</span>
                <span className="text-foreground">()</span>
                <span className="cursor-blink text-primary">|</span>
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
