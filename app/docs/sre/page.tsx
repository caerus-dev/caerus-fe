import Link from "next/link"
import { ArrowRight, Sparkles, Layers, Clock, ShieldAlert, CheckCircle2, RotateCcw } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock, SignatureBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tocItems = [
  { id: "conceptos", title: "Recursos Unitarios vs Pooled" },
  { id: "ciclo-vida", title: "Ciclo de Vida de una Reserva" },
  { id: "verbos", title: "Verbos: take, confirm y release" },
  { id: "estrategias", title: "Políticas de Conflicto (FAIL vs QUEUE)" },
  { id: "demo-link", title: "Probar Demo Interactiva" },
]

export default function DocsSrePage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "SRE", href: "/docs/sre" },
        { label: "Conceptos y Verbos" },
      ]}
      title="Shared Resource Engine (SRE)"
      badge="Business Engine"
      description="El motor transaccional para reservas temporales de recursos limitados. Diseñado para cines, venta de tickets, reservas de turnos y stock de e-commerce."
      tocItems={tocItems}
    >
      <SignatureBlock signature="const holder = await caerus.unitary(resourceKey).take(options);" />

      {/* Conceptos: Unitary vs Pooled */}
      <section id="conceptos" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Recursos Unitarios vs Pooled (Con Cupo)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En Caerus, la distinción entre un recurso del que hay <em>exactamente uno</em> y un recurso del que hay <em>múltiples unidades intercambiables</em> es una diferencia en el sistema de tipos de TypeScript:
        </p>

        <div className="grid grid-cols-1 gap-6 my-4">
          <div className="rounded-xl border border-border/70 p-4 bg-muted/20">
            <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Recurso Unitario (<code>unitary</code>)</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Existe exactamente una unidad en todo momento. Ejemplo: la butaca <code>neon_D9</code> o el turno con un doctor a las 15:30.
            </p>
            <CodeBlock
              language="typescript"
              code={`// Toma exactamente 1 unidad
await caerus.unitary('butaca-D9').take({ ttlSeconds: 180 });

// caerus.unitary('...').takeMany(3); // ✗ No compila`}
            />
          </div>

          <div className="rounded-xl border border-border/70 p-4 bg-muted/20">
            <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Recurso Pooled (<code>pooled</code>)</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Mantiene un saldo o inventario de unidades intercambiables. Ejemplo: 50 combos de pochoclos o 30 vacantes de un curso.
            </p>
            <CodeBlock
              language="typescript"
              code={`// Toma 3 unidades de las disponibles
await caerus.pooled('combo-grande').takeMany(3, { ttlSeconds: 300 });`}
            />
          </div>
        </div>
      </section>

      {/* Ciclo de vida */}
      <section id="ciclo-vida" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Ciclo de Vida de una Reserva
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Toda reserva devuelve un <strong>Holder</strong> que representa la retención temporal en estado <code>PENDING</code>:
        </p>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-5 font-mono text-xs text-muted-foreground leading-relaxed overflow-x-auto">
          <pre>{`                      ┌──────────────┐
       take()  ──────▶│   PENDING    │  (Unidades apartadas por TTL)
                      └──────┬───────┘
                             │
            confirm() ───────┼────────▶  CONFIRMED   (Venta concretada)
                             │
            release() ───────┼────────▶  RELEASED    (Liberado anticipadamente)
                             │
           TTL Expira ───────┴────────▶  EXPIRED     (Worker lo restaura solo)`}</pre>
        </div>
      </section>

      {/* Verbos principales */}
      <section id="verbos" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Verbos Principales del SDK
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground">1. <code>take()</code> / <code>takeMany()</code></h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Aparta las unidades solicitadas. Si la plantilla exige clave de idempotencia, debes incluir <code>idempotencyKey</code> para garantizar que peticiones duplicadas devuelvan el mismo holder sin restar inventario doble.
            </p>
            <CodeBlock
              language="typescript"
              code={`const holder = await caerus.unitary('butaca_A4').take({
  ttlSeconds: 120, // Expira a los 2 minutos si no se confirma
  idempotencyKey: 'req_order_9981',
  metadata: { cliente: 'ana@example.com' }
});`}
            />
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground">2. <code>confirm()</code></h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Fija la reserva de manera permanente una vez recibido el pago o confirmación del usuario.
            </p>
            <CodeBlock
              language="typescript"
              code={`await caerus.confirm(holder.id);`}
            />
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground">3. <code>release()</code></h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Cancela la retención de inmediato y devuelve el recurso a la venta sin esperar al vencimiento del TTL.
            </p>
            <CodeBlock
              language="typescript"
              code={`await caerus.release(holder.id);`}
            />
          </div>
        </div>
      </section>

      {/* Políticas de Conflicto */}
      <section id="estrategias" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Políticas de Conflicto: FAIL vs QUEUE
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La política de conflicto se configura en la plantilla del recurso (desde el dashboard) y el motor la ejecuta automáticamente:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Estrategia FAIL</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Rechazo Directo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Si dos usuarios piden la misma butaca al mismo tiempo, el segundo recibe de inmediato un <code>ConflictError</code>. No hay espera.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Estrategia QUEUE</span>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">Fila Automática</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              El segundo solicitante queda encolado. Si el primer usuario libera la butaca o su tiempo expira, el motor <strong>se la asigna solo al siguiente</strong> en cuestión de segundos.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enlace a la Demo */}
      <section id="demo-link" className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-semibold text-foreground">¿Querés ver el SRE en acción?</h3>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Diseñamos la demo interactiva <strong>Caerus Cine</strong>, donde podés pelear en vivo contra vos mismo por la misma butaca en dos pestañas y comparar la política <code>FAIL</code> frente a <code>QUEUE</code> con panel de llamadas en tiempo real.
        </p>
        <div className="pt-2">
          <Link href="/docs/sre/demo">
            <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs">
              <span>Abrir Simulación Caerus Cine</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </DocsPageLayout>
  )
}
