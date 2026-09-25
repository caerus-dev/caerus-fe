import Link from "next/link"
import { ArrowRight, Layers, Lock, Zap, Server, ShieldCheck, Database } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock, SignatureBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tocItems = [
  { id: "problema", title: "¿Qué problema resuelve Caerus?" },
  { id: "garantias", title: "Garantías de Consistencia y Rendimiento" },
  { id: "motores", title: "Los Motores: SRE y DLS" },
  { id: "quickstart", title: "Inicio Rápido (SDK)" },
]

export default function DocsOverviewPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[{ label: "Comenzando" }, { label: "Visión General" }]}
      title="Visión General de la Plataforma"
      badge="Core Platform"
      description="Caerus es una plataforma Backend-as-a-Service (BaaS) diseñada para resolver la concurrencia distribuida, reservas de recursos limitados y sincronización de procesos críticos sin complejidad operativa."
      tocItems={tocItems}
    >
      {/* Sección: El Problema */}
      <section id="problema" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          ¿Qué problema resuelve Caerus?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Vender o apartar algo de lo que <strong>solo hay una unidad</strong> (una butaca de cine, un turno médico, un cupo de inscripción o inventario limitado) es mucho más difícil de lo que aparenta. Dos usuarios presionan <em>Comprar</em> en la misma fracción de segundo; una pasarela de pago tarda 8 segundos en contestar; y un tercer usuario abandona el carrito con el recurso bloqueado.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Resolver esto de forma artesanal exige coordinar clústeres distribuidos complejos, diseñar mecanismos a medida contra condiciones de carrera, lidiar con bloqueos pesados en bases de datos y programar tareas en segundo plano para limpiar reservas abandonadas. <strong>Caerus abstrae toda esta complejidad detrás de APIs declarativas de baja latencia y un SDK unificado.</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <Card className="bg-muted/20 border-border/60">
            <CardHeader className="p-4 pb-2">
              <Zap className="h-5 w-5 text-amber-500 mb-1" />
              <CardTitle className="text-sm">Menor Time-to-Market</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              Elimina meses de desarrollo e ingeniería de infraestructura distribuida en cada microservicio.
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-border/60">
            <CardHeader className="p-4 pb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mb-1" />
              <CardTitle className="text-sm">Cero Overbooking</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              Garantiza exclusión mutua estricta y evita sobreventas o carreras de actualización en la base de datos.
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-border/60">
            <CardHeader className="p-4 pb-2">
              <Server className="h-5 w-5 text-blue-500 mb-1" />
              <CardTitle className="text-sm">Alta Velocidad en Memoria</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              El motor opera en memoria mediante transacciones atómicas de ultra baja latencia, sin contención en disco.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sección: Garantías de Consistencia y Rendimiento */}
      <section id="garantias" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Garantías de Consistencia y Rendimiento
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Caerus combina procesamiento atómico en memoria para respuestas en milisegundos con mecanismos automáticos de persistencia y durabilidad:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span>Ejecución Atómica en Memoria</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Las operaciones transaccionales de alta frecuencia (adquisición de bloqueos, reservas temporales <code>take</code>, conteo atómico y expiraciones por TTL) se procesan directamente en memoria con exclusión mutua estricta.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              <span>Persistencia y Tolerancia a Fallos</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El estado de cada reserva y bloqueo se sincroniza de forma duradera desacoplándose de los picos de tráfico, garantizando consistencia y trazabilidad histórica sin degradar los tiempos de respuesta.
            </p>
          </div>
        </div>
      </section>

      {/* Sección: Motores SRE y DLS */}
      <section id="motores" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Los Motores: SRE y DLS
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Caerus provee dos motores especializados según el nivel de abstracción requerido:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <Card className="border-border/70 hover:border-border transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base">Shared Resource Engine (SRE)</CardTitle>
              </div>
              <CardDescription className="text-xs pt-1">
                Motor orientado a la lógica de negocio y reservas temporales de inventario.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Recursos <strong>Unitarios</strong> (asientos numerados) vs <strong>Con cupo</strong> (entradas generales).</li>
                <li>Ciclo: <code>take()</code> con TTL ➔ <code>confirm()</code> o <code>release()</code>.</li>
                <li>Estrategias de conflicto: <code>FAIL</code> vs <code>QUEUE</code> (fila de espera).</li>
              </ul>
              <div className="pt-2 flex gap-2">
                <Link href="/docs/sre">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    Ver SRE <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/docs/sre/demo">
                  <Button variant="secondary" size="sm" className="text-xs gap-1 text-amber-500 font-medium">
                    Demo Cine 🍿
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 hover:border-border transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">Distributed Locking Service (DLS)</CardTitle>
              </div>
              <CardDescription className="text-xs pt-1">
                Motor de sincronización a bajo nivel y exclusión mutua para microservicios.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Locks <strong>Exclusive</strong> y <strong>Shared Read</strong> en transacciones.</li>
                <li><strong>Fencing Tokens</strong> monotónicos para evitar escrituras obsoletas (split-brain).</li>
                <li>Detección y resolución automática de ciclos de <strong>Deadlock</strong>.</li>
              </ul>
              <div className="pt-2 flex gap-2">
                <Link href="/docs/dls">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    Ver DLS <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/docs/dls/demo">
                  <Button variant="secondary" size="sm" className="text-xs gap-1 text-amber-500 font-medium">
                    Simulador DLS ⚡
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sección: Inicio Rápido */}
      <section id="quickstart" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Inicio Rápido (SDK)
        </h2>

        {/* Banner Consola Web */}
        <div className="rounded-xl border border-primary/25 bg-muted/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span className="font-semibold text-sm text-foreground">Paso previo: Configuración en la Consola Web</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Antes de inicializar el cliente en código, aprende a crear tu aplicación, configurar entornos y definir las plantillas de recursos y bloqueos en el Dashboard.
            </p>
          </div>
          <Link href="/docs/dashboard" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <span>Guía de la Consola Web</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Instala el SDK en tu aplicación Node.js o TypeScript y empieza a reservar recursos en minutos:
        </p>

        <CodeBlock code="npm install @caerus-dev/sdk" language="bash" title="Terminal" />

        <p className="text-xs text-muted-foreground pt-1">
          Ejemplo de retención de recurso unitario con pago y confirmación:
        </p>

        <CodeBlock
          title="server.ts"
          language="typescript"
          showLineNumbers
          code={`import { CaerusClient } from '@caerus-dev/sdk';

const caerus = new CaerusClient({
  apiKey: process.env.CAERUS_API_KEY!,
});

// 1. Apartar el asiento durante 5 minutos
const holder = await caerus.unitary('asiento-B14').take({
  ttlSeconds: 300,
  metadata: { clienteId: 'usr_948' }
});

try {
  // 2. Procesar el cobro en la pasarela de pagos
  await procesarPagoTarjeta(holder.id);

  // 3. Confirmar la venta de forma definitiva
  await caerus.confirm(holder.id);
  console.log('Compra confirmada con éxito:', holder.id);
} catch (error) {
  // 4. Si el pago falla, liberar inmediatamente para otros clientes
  await caerus.release(holder.id);
}`}
        />

        <div className="flex items-center gap-3 pt-4">
          <Link href="/docs/sdk">
            <Button className="gap-2">
              <span>Continuar a la Guía del SDK</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs/sre/demo">
            <Button variant="outline">
              Probar Demo Caerus Cine
            </Button>
          </Link>
        </div>
      </section>
    </DocsPageLayout>
  )
}
