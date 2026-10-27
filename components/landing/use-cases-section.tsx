import { ShoppingCart, Calendar, Ticket, CreditCard } from "lucide-react"
import { SectionHeading } from "./section-heading"

const useCases = [
  {
    icon: Ticket,
    title: "Eventos y reservas",
    description:
      "Evita la sobreventa en eventos, vuelos y reservas. Retén el recurso de forma temporal mientras el usuario completa el pago.",
    example: "Ticketeras, Aerolíneas, Eventos",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce & Stock",
    description:
      "Gestiona inventario de forma segura. Reserva productos durante el checkout para evitar vender unidades inexistentes.",
    example: "Tiendas online, marketplaces",
  },
  {
    icon: Calendar,
    title: "Sistemas de Turnos",
    description:
      "Coordina agendamiento de citas médicas, servicios o reuniones. Un slot, un usuario, sin conflictos.",
    example: "Clínicas, Peluquerías, Consultorios",
  },
  {
    icon: CreditCard,
    title: "Operaciones Financieras",
    description:
      "Garantiza que operaciones críticas como pagos o transferencias se ejecuten una sola vez, sin duplicados.",
    example: "Fintech, Bancos, Pasarelas de Pago",
  },
]

export function UseCasesSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="casos"
          title={
            <>
              Casos de <span className="text-primary">uso</span>
            </>
          }
          description="Desde startups hasta empresas, resolvemos problemas reales de concurrencia."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group relative flex gap-5 overflow-hidden rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/20"
              />
              <div className="relative shrink-0">
                <div className="flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <useCase.icon className="size-6" aria-hidden="true" />
                </div>
              </div>
              <div className="relative">
                <h3 className="mb-2 text-xl font-semibold">{useCase.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{useCase.description}</p>
                <span className="font-mono text-xs text-primary/80">{useCase.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
