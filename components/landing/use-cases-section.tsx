import { ShoppingCart, Calendar, Ticket, CreditCard } from "lucide-react"

const useCases = [
  {
    icon: Ticket,
    title: "Venta de Entradas",
    description:
      "Evita sobreventa de asientos en cines, conciertos o eventos. Reserva temporal mientras el usuario completa el pago.",
    example: "Cines, Ticketeras, Aerolíneas",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce & Stock",
    description:
      "Gestiona inventario de forma segura. Reserva productos durante checkout para evitar vender unidades inexistentes.",
    example: "Tiendas Online, Marketplaces",
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
      "Garantiza que operaciones criticas como pagos o transferencias se ejecuten una sola vez, sin duplicados.",
    example: "Fintech, Bancos, Pasarelas de Pago",
  },
]

export function UseCasesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Casos de <span className="text-primary">uso</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde startups hasta empresas, resolvemos problemas reales de
            concurrencia
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="flex gap-5 p-6 rounded-xl border border-border bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <useCase.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {useCase.description}
                </p>
                <span className="text-xs text-primary font-medium">
                  {useCase.example}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
