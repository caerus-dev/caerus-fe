import { SectionHeading } from "./section-heading"

const steps = [
  {
    method: "take()",
    title: "Reserva",
    description: "Toma cualquier recurso con un TTL. Solo una petición lo consigue; el resto recibe un rechazo limpio.",
  },
  {
    method: "confirm()",
    title: "Confirma",
    description: "Cuando tu operación termina bien, la reserva queda firme.",
  },
  {
    method: "release()",
    title: "Libera",
    description: "Si algo falla, el recurso queda libre al instante. Y si lo olvidas, expira solo con el TTL.",
  },
]

type Token = [string, string]

const C = {
  kw: "text-chart-2",
  fn: "text-primary",
  str: "text-chart-3",
  num: "text-chart-3",
  tx: "text-foreground/90",
}

const code: Token[][] = [
  [[C.kw, "const "], [C.tx, "hold = "], [C.kw, "await "], [C.tx, "caerus."], [C.fn, "unitary"], [C.tx, "("], [C.str, "resourceId"], [C.tx, ")."], [C.fn, "take"], [C.tx, "({ ttlSeconds: "], [C.num, "120"], [C.tx, " })"]],
  [],
  [[C.kw, "try "], [C.tx, "{"]],
  [[C.tx, "  "], [C.kw, "await "], [C.fn, "process"], [C.tx, "(resourceId)"]],
  [[C.tx, "  "], [C.kw, "await "], [C.tx, "caerus."], [C.fn, "confirm"], [C.tx, "(hold.id)"]],
  [[C.tx, "} "], [C.kw, "catch "], [C.tx, "{"]],
  [[C.tx, "  "], [C.kw, "await "], [C.tx, "caerus."], [C.fn, "release"], [C.tx, "(hold.id)"]],
  [[C.tx, "}"]],
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 overflow-x-clip px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Cómo funciona"
          title={
            <>
              Tres llamadas. <span className="text-primary">Cero carreras.</span>
            </>
          }
          description="Sin colas propias, sin Redis artesanal, sin locks que se quedan colgados."
        />

        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <ol className="flex min-w-0 flex-col gap-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="group flex gap-5 rounded-2xl border border-transparent p-5 transition-colors hover:border-border hover:bg-card"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-sm text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="flex flex-wrap items-baseline gap-x-3 text-lg font-semibold">
                    {step.title}
                    <code className="font-mono text-sm font-normal text-primary/90">{step.method}</code>
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="relative min-w-0">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)] blur-2xl"
            />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-primary/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">handler.ts</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 sm:p-6 sm:text-sm">
                <code>
                  {code.map((line, i) => (
                    <span key={i} className="block">
                      <span className="mr-5 inline-block w-4 select-none text-right text-muted-foreground/40">
                        {i + 1}
                      </span>
                      {line.map(([cls, text], j) => (
                        <span key={j} className={cls}>
                          {text}
                        </span>
                      ))}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
