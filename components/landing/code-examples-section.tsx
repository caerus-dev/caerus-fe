"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

const codeExamples = [
  {
    id: "reserve",
    label: "Reservar Recurso",
    language: "typescript",
    code: `import { Caerus } from '@caerus/sdk'

const client = new Caerus({ apiKey: process.env.CAERUS_API_KEY })

// Reserva un asiento por 5 minutos
const reservation = await client.resources.reserve({
  resourceId: 'seat_J4_function_123',
  ttl: 300, // segundos
  metadata: { userId: 'user_abc', event: 'Avengers' }
})

if (reservation.success) {
  // Procesa el pago...
  await reservation.confirm()
} else {
  // Recurso no disponible
  console.log(reservation.reason)
}`,
  },
  {
    id: "lock",
    label: "Distributed Lock",
    language: "typescript",
    code: `import { Caerus } from '@caerus/sdk'

const client = new Caerus({ apiKey: process.env.CAERUS_API_KEY })

// Adquiere un lock exclusivo con fencing token
const lock = await client.locks.acquire({
  key: 'payment_user_123',
  ttl: 10000, // 10 segundos
  strategy: 'fail' // o 'retry' | 'blocking'
})

if (lock.acquired) {
  try {
    // Operación crítica con el fencing token
    await processPayment(userId, lock.fencingToken)
  } finally {
    await lock.release()
  }
}`,
  },
  {
    id: "availability",
    label: "Check Disponibilidad",
    language: "typescript",
    code: `import { Caerus } from '@caerus/sdk'

const client = new Caerus({ apiKey: process.env.CAERUS_API_KEY })

// Consulta disponibilidad de múltiples recursos
const availability = await client.resources.checkAvailability({
  resourceIds: ['seat_A1', 'seat_A2', 'seat_A3', 'seat_A4'],
  includeMetadata: true
})

// Respuesta:
// {
//   'seat_A1': { available: true },
//   'seat_A2': { available: false, reservedUntil: '2024-...' },
//   'seat_A3': { available: true },
//   'seat_A4': { available: false, confirmedAt: '2024-...' }
// }`,
  },
]

export function CodeExamplesSection() {
  const [activeTab, setActiveTab] = useState("reserve")
  const [copied, setCopied] = useState(false)

  const activeExample = codeExamples.find((e) => e.id === activeTab)

  const copyToClipboard = async () => {
    if (activeExample) {
      await navigator.clipboard.writeText(activeExample.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Integración en <span className="text-primary">minutos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SDK intuitivo con ejemplos claros. De configuración a producción sin
            fricción.
          </p>
        </div>

        {/* Code block */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              {codeExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveTab(example.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === example.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {example.label}
                </button>
              ))}
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Code content */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed">
              <code className="text-foreground/90">{activeExample?.code}</code>
            </pre>
          </div>
        </div>

        {/* SDK badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
          <span>SDKs disponibles:</span>
          <div className="flex gap-2">
            {["TypeScript", "Python", "Go", "REST API"].map((sdk) => (
              <span
                key={sdk}
                className="px-3 py-1 rounded-full bg-secondary border border-border text-foreground"
              >
                {sdk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
