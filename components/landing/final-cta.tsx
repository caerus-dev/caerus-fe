import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCta({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const primaryHref = isLoggedIn ? "/dashboard" : "/auth/login?screen_hint=signup&returnTo=/dashboard"

  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-xl border border-primary/25 bg-card px-6 py-20 text-center sm:px-12 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-full h-[36rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_40%,transparent),transparent)] blur-2xl" />
          <div className="absolute inset-0 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_9%,transparent)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        </div>

        <div className="relative">
          <Image
            src="/logo.svg"
            alt=""
            width={56}
            height={56}
            className="mx-auto size-14 drop-shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
          />
          <h2 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
            Deja de pelearte con locks. Enfócate en tu producto.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Empieza gratis con el plan Developer y escala cuando crezca tu tráfico.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={primaryHref}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-base font-medium text-primary-foreground shadow-[0_10px_40px_-6px_color-mix(in_oklab,var(--primary)_75%,transparent)] transition-[box-shadow,transform] hover:shadow-[0_10px_60px_-4px_color-mix(in_oklab,var(--primary)_95%,transparent)] active:translate-y-px sm:w-auto"
            >
              {isLoggedIn ? "Ir al Dashboard" : "Crear cuenta gratis"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <Link
              href="/pricing"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background/60 px-7 text-base font-medium backdrop-blur transition-colors hover:border-primary/40 sm:w-auto"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
