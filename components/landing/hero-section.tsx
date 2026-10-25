import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { ConcurrencyStage } from "./concurrency-stage"
import { RotatingWord } from "./rotating-word"

const rotatingResources = ["recurso", "stock", "turno", "pago", "cupo", "lock"]

const primaryCtaClass =
  "group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-base font-medium text-primary-foreground shadow-[0_10px_40px_-6px_color-mix(in_oklab,var(--primary)_75%,transparent)] transition-[box-shadow,transform] hover:shadow-[0_10px_60px_-4px_color-mix(in_oklab,var(--primary)_95%,transparent)] active:translate-y-px sm:w-auto"

const secondaryCtaClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/60 px-7 text-base font-medium text-foreground backdrop-blur transition-colors hover:border-primary/40 hover:bg-secondary sm:w-auto"

export function HeroSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const primaryHref = isLoggedIn ? "/dashboard" : "/auth/login?screen_hint=signup&returnTo=/dashboard"

  return (
    <section className="relative isolate w-full overflow-hidden pb-20">
      <HeroBackdrop />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        {/* Intro block fills the viewport (minus a peek of the stage) so the message and CTAs are always above the fold. */}
        <div className="flex min-h-[calc(100svh-5rem)] w-full flex-col items-center justify-center pb-8 pt-28 sm:pt-32">
          <p className="relative mb-8 inline-flex max-w-full animate-rise items-center gap-2 overflow-hidden rounded-full border border-primary/30 bg-primary/10 py-1.5 pl-2 pr-4 text-xs text-foreground/90 motion-reduce:animate-none sm:text-sm">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Zap className="size-3" aria-hidden="true" />
            </span>
            <span className="truncate">Backend as a Service para Concurrencia</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-beam bg-gradient-to-r from-transparent via-primary/30 to-transparent motion-reduce:animate-none"
            />
          </p>

          <h1 className="max-w-5xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            <span className="block animate-rise [animation-delay:80ms] motion-reduce:animate-none">
              Gestiona la <span className="text-primary">concurrencia</span>
            </span>
            <span className="block animate-rise [animation-delay:200ms] motion-reduce:animate-none">
              sin escribir código complejo
            </span>
          </h1>

          <p className="mt-6 max-w-2xl animate-rise text-pretty text-base leading-relaxed text-muted-foreground [animation-delay:320ms] motion-reduce:animate-none sm:text-xl">
            Recursos compartidos, locks distribuidos y coordinación en tiempo real. Integra nuestra API y olvídate de
            implementar lógica distribuida desde cero.
          </p>

          <div className="mt-8 flex w-full max-w-xs animate-rise flex-col items-center justify-center gap-3 [animation-delay:440ms] motion-reduce:animate-none sm:w-auto sm:max-w-none sm:flex-row">
            <a href={primaryHref} className={primaryCtaClass}>
              {isLoggedIn ? "Ir al Dashboard" : "Comenzar gratis"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <Link href="/docs" className={secondaryCtaClass}>
              Ver documentación
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-5xl animate-rise [animation-delay:600ms] motion-reduce:animate-none">
          <div
            aria-hidden="true"
            className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_65%)] blur-2xl"
          />
          <ConcurrencyStage />
          <p className="mt-5 text-sm text-muted-foreground">
            <span className="sr-only">Mil peticiones, un mismo recurso, cero conflictos.</span>
            <span aria-hidden="true">
              Mil peticiones. Un mismo <RotatingWord words={rotatingResources} />. Cero conflictos.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 [background-image:linear-gradient(color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent)]" />
      <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_30%,transparent),transparent)] blur-3xl" />
      <div className="absolute left-[12%] top-[22rem] h-80 w-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--chart-2)_25%,transparent),transparent)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
