"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

const codeExamples = [
  {
    id: "reserve",
    label: "Reservar Recurso",
    language: "typescript",
    code: `import { CaerusClient } from '@caerus-dev/sdk'

const caerus = new CaerusClient({ apiKey: process.env.CAERUS_API_KEY! })

// 1. Retiene temporalmente un recurso (asiento, stock, cupo)
const holder = await caerus.unitary('seat_A12').take({
  ttlSeconds: 120,
  metadata: { orderId: 'ord_1234' }
})

try {
  // 2. Procesa el pago de forma segura
  const { paymentId } = await chargeCard(4500)
  
  // 3. Confirma la reserva de manera definitiva
  await caerus.confirm(holder.id, { metadata: { paymentId } })
} catch (error) {
  // 4. Si el pago falla, libera el recurso inmediatamente
  await caerus.release(holder.id)
  throw error
}`,
  },
  {
    id: "lock",
    label: "Distributed Lock",
    language: "typescript",
    code: `import { Dls } from '@caerus-dev/sdk'

const client = new Dls.DlsClient({ apiKey: process.env.CAERUS_API_KEY! })

// 1. Inicia una transacción con timeout
const tx = await client.beginTransaction({ timeoutMs: 5000 })

// 2. Adquiere lock exclusivo con Fencing Token (ZooKeeper)
const lock = await client.acquireLock(
  'order-processing', // Namespace del template configurado
  'payment_user_123',  // Key dinámica
  tx.transactionId,
  'EXCLUSIVE'
)

if (lock.status === 'ACQUIRED') {
  try {
    // 3. Sección crítica protegida contra split-brain
    await processPayment(userId, lock.fencingToken)
  } finally {
    // 4. Libera los locks asociados a la transacción
    await client.releaseTransactionLocks(tx.transactionId)
  }
}`,
  },
  {
    id: "availability",
    label: "Consultar Stock",
    language: "typescript",
    code: `import { CaerusClient } from '@caerus-dev/sdk'

const caerus = new CaerusClient({ apiKey: process.env.CAERUS_API_KEY! })

// 1. Consulta stock disponible y reservas pendientes en tiempo real
const seat = await caerus.getResource('seat_A12')
console.log(\`Disponibles: \${seat.availableAmount}\`)
console.log(\`En proceso de compra: \${seat.pendingCount}\`)

// 2. O consulta todos los recursos de un grupo (ej. fila o categoría)
const row = await caerus.getResourcesByGroup('row_A')
const freeSeats = row.resources.filter((s) => s.availableAmount > 0)
console.log(\`Asientos libres en Fila A: \${freeSeats.length}\`)`,
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
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 text-xs sm:text-sm text-muted-foreground">
          <span>SDKs disponibles:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {["TypeScript", "Python", "Go", "REST API"].map((sdk) => (
              <span
                key={sdk}
                className="px-3 py-1 rounded-full bg-secondary border border-border text-foreground text-xs sm:text-sm"
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
