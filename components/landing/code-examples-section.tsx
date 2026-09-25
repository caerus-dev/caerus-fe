"use client"

import React, { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CodeExample {
  id: string
  label: string
  language: string
  code: string
  render: () => React.ReactNode
}

const codeExamples: CodeExample[] = [
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
    render: () => (
      <code>
        <span className="text-chart-2">import</span>{" "}
        <span className="text-foreground">{"{ "}</span>
        <span className="text-chart-3">CaerusClient</span>
        <span className="text-foreground">{" }"}</span>{" "}
        <span className="text-chart-2">from</span>{" "}
        <span className="text-chart-3">{"'@caerus-dev/sdk'"}</span>
        <br />
        <br />
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">caerus</span>{" "}
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">new</span>{" "}
        <span className="text-chart-3">CaerusClient</span>
        <span className="text-foreground">{"({ apiKey: process.env."}</span>
        <span className="text-chart-3">CAERUS_API_KEY</span>
        <span className="text-foreground">{"! })"}</span>
        <br />
        <br />
        <span className="text-muted-foreground">{"// 1. Retiene temporalmente un recurso (asiento, stock, cupo)"}</span>
        <br />
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">holder</span>{" "}
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">caerus.</span>
        <span className="text-primary">unitary</span>
        <span className="text-foreground">(</span>
        <span className="text-chart-3">{"'seat_A12'"}</span>
        <span className="text-foreground">).</span>
        <span className="text-primary">take</span>
        <span className="text-foreground">{"({"}</span>
        <br />
        <span className="text-foreground">{"  ttlSeconds: "}</span>
        <span className="text-amber-500">120</span>
        <span className="text-foreground">,</span>
        <br />
        <span className="text-foreground">{"  metadata: { orderId: "}</span>
        <span className="text-chart-3">{"'ord_1234'"}</span>
        <span className="text-foreground">{" }"}</span>
        <br />
        <span className="text-foreground">{"})"}</span>
        <br />
        <br />
        <span className="text-chart-2">try</span>{" "}
        <span className="text-foreground">{"{"}</span>
        <br />
        <span className="text-muted-foreground">{"  // 2. Procesa el pago de forma segura"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">{"{ paymentId } "}</span>
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">await</span>{" "}
        <span className="text-primary">chargeCard</span>
        <span className="text-foreground">(</span>
        <span className="text-amber-500">4500</span>
        <span className="text-foreground">)</span>
        <br />
        <br />
        <span className="text-muted-foreground">{"  // 3. Confirma la reserva de manera definitiva"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">caerus.</span>
        <span className="text-primary">confirm</span>
        <span className="text-foreground">(holder.id, {"{ metadata: { paymentId } }"})</span>
        <br />
        <span className="text-foreground">{"}"}</span>{" "}
        <span className="text-chart-2">catch</span>{" "}
        <span className="text-foreground">(error) {"{"}</span>
        <br />
        <span className="text-muted-foreground">{"  // 4. Si el pago falla, libera el recurso inmediatamente"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">caerus.</span>
        <span className="text-primary">release</span>
        <span className="text-foreground">(holder.id)</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-2">throw</span>{" "}
        <span className="text-foreground">error</span>
        <br />
        <span className="text-foreground">{"}"}</span>
      </code>
    ),
  },
  {
    id: "lock",
    label: "Distributed Lock",
    language: "typescript",
    code: `import { Dls } from '@caerus-dev/sdk'

const client = new Dls.DlsClient({ apiKey: process.env.CAERUS_API_KEY! })

// 1. Inicia una transacción con timeout
const tx = await client.beginTransaction({ timeoutMs: 5000 })

// 2. Adquiere lock exclusivo con Fencing Token
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
    render: () => (
      <code>
        <span className="text-chart-2">import</span>{" "}
        <span className="text-foreground">{"{ "}</span>
        <span className="text-chart-3">Dls</span>
        <span className="text-foreground">{" }"}</span>{" "}
        <span className="text-chart-2">from</span>{" "}
        <span className="text-chart-3">{"'@caerus-dev/sdk'"}</span>
        <br />
        <br />
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">client</span>{" "}
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">new</span>{" "}
        <span className="text-chart-3">Dls.DlsClient</span>
        <span className="text-foreground">{"({ apiKey: process.env."}</span>
        <span className="text-chart-3">CAERUS_API_KEY</span>
        <span className="text-foreground">{"! })"}</span>
        <br />
        <br />
        <span className="text-muted-foreground">{"// 1. Inicia una transacción con timeout"}</span>
        <br />
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">tx</span>{" "}
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">client.</span>
        <span className="text-primary">beginTransaction</span>
        <span className="text-foreground">{"({ timeoutMs: "}</span>
        <span className="text-amber-500">5000</span>
        <span className="text-foreground">{" })"}</span>
        <br />
        <br />
        <span className="text-muted-foreground">{"// 2. Adquiere lock exclusivo con Fencing Token"}</span>
        <br />
        <span className="text-chart-2">const</span>{" "}
        <span className="text-foreground">lock</span>{" "}
        <span className="text-chart-2">=</span>{" "}
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">client.</span>
        <span className="text-primary">acquireLock</span>
        <span className="text-foreground">(</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-3">{"'order-processing'"}</span>
        <span className="text-foreground">, </span>
        <span className="text-muted-foreground">{"// Namespace del template configurado"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-3">{"'payment_user_123'"}</span>
        <span className="text-foreground">,  </span>
        <span className="text-muted-foreground">{"// Key dinámica"}</span>
        <br />
        <span className="text-foreground">{"  tx.transactionId,"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-3">{"'EXCLUSIVE'"}</span>
        <br />
        <span className="text-foreground">{")"}</span>
        <br />
        <br />
        <span className="text-chart-2">if</span>{" "}
        <span className="text-foreground">(lock.status === </span>
        <span className="text-chart-3">{"'ACQUIRED'"}</span>
        <span className="text-foreground">) {"{"}</span>
        <br />
        <span className="text-foreground">{"  "}</span>
        <span className="text-chart-2">try</span>{" "}
        <span className="text-foreground">{"{"}</span>
        <br />
        <span className="text-muted-foreground">{"    // 3. Sección crítica protegida contra split-brain"}</span>
        <br />
        <span className="text-foreground">{"    "}</span>
        <span className="text-chart-2">await</span>{" "}
        <span className="text-primary">processPayment</span>
        <span className="text-foreground">(userId, lock.fencingToken)</span>
        <br />
        <span className="text-foreground">{"  } "}</span>
        <span className="text-chart-2">finally</span>{" "}
        <span className="text-foreground">{"{"}</span>
        <br />
        <span className="text-muted-foreground">{"    // 4. Libera los locks asociados a la transacción"}</span>
        <br />
        <span className="text-foreground">{"    "}</span>
        <span className="text-chart-2">await</span>{" "}
        <span className="text-foreground">client.</span>
        <span className="text-primary">releaseTransactionLocks</span>
        <span className="text-foreground">(tx.transactionId)</span>
        <br />
        <span className="text-foreground">{"  }"}</span>
        <br />
        <span className="text-foreground">{"}"}</span>
      </code>
    ),
  },
]

export function CodeExamplesSection() {
  const [activeTab, setActiveTab] = useState("reserve")
  const [copied, setCopied] = useState(false)

  const activeExample = codeExamples.find((e) => e.id === activeTab) || codeExamples[0]

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
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          <div className="p-4 sm:p-6 overflow-x-auto text-left">
            <pre className="font-mono text-xs sm:text-sm leading-relaxed">
              {activeExample.render()}
            </pre>
          </div>
        </div>

        {/* SDK badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 text-xs sm:text-sm text-muted-foreground">
          <span>Integraciones y SDKs:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {["TypeScript / Node.js", "gRPC"].map((sdk) => (
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
