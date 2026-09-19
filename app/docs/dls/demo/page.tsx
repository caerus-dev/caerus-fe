import Link from "next/link"
import { ExternalLink, Github, Sparkles, Cpu, Play, CheckCircle2, ShieldAlert, GitBranch } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { docsConfig } from "@/components/docs/docs-config"

const tocItems = [
  { id: "concepto-demo", title: "¿En qué consiste el Simulador DLS?" },
  { id: "escenarios", title: "Los 4 Escenarios Interactivos" },
  { id: "grafo-deadlock", title: "Visualización del Grafo y la Víctima" },
  { id: "correr-local", title: "Correr el Simulador Localmente" },
]

export default function DocsDlsDemoPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "DLS", href: "/docs/dls" },
        { label: "Demo Interactiva: Simulador DLS" },
      ]}
      title="Demo Interactiva: Simulador DLS"
      badge="DLS Simulation"
      description="Visualizador interactivo de exclusión mutua distribuida, transacciones concurrentes, detección de deadlocks mediante grafo dirigido y estampidas de procesos en tiempo real."
      tocItems={tocItems}
    >
      {/* Concepto Demo */}
      <section id="concepto-demo" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          ¿En qué consiste el Simulador DLS?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Comprender cómo interactúan múltiples microservicios concurrentes al solicitar locks puede ser abstracto. El <strong>Simulador DLS</strong> provee una representación visual con workers independientes (2 o 3 nodos) que compiten por recursos compartidos (como <code>file:reports_export</code> o <code>network:cloud_uploader</code>).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Cada evento del simulador refleja las respuestas del motor de Caerus mediante Server-Sent Events (SSE) y grafica el estado de cada worker: <code>IDLE</code>, <code>STARTING_TX</code>, <code>HOLDING</code>, <code>QUEUED</code> o <code>DEADLOCK_ABORTED</code>.
        </p>
      </section>

      {/* Los 4 Escenarios */}
      <section id="escenarios" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Los 4 Escenarios de Prueba
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-blue-500 mb-1">Lectura Concurrente</Badge>
              <CardTitle className="text-sm">1. Lectura Compartida (<code>shared_read</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Muestra cómo múltiples workers adquieren locks <code>SHARED_READ</code> sobre el mismo archivo simultáneamente sin bloquearse entre sí, hasta que un escritor exclusivo solicita el recurso.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-emerald-500 mb-1">Exclusión Mutua</Badge>
              <CardTitle className="text-sm">2. Tarea Simple (<code>tarea_simple</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Ejecuta una transacción exclusiva con generación de <strong>Fencing Token</strong>. El worker toma el lock, escribe en el archivo y libera la transacción de forma segura.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-red-500 mb-1">Ciclo Cruzado</Badge>
              <CardTitle className="text-sm">3. Detección de Deadlock (<code>deadlock</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Worker A retiene el Recurso 1 y solicita el 2; Worker B retiene el 2 y solicita el 1. El motor detecta el ciclo en el grafo y aborta a la víctima designada para desatorar el sistema.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-purple-500 mb-1">Alta Concurrencia</Badge>
              <CardTitle className="text-sm">4. Estampida (<code>estampida</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Lanza una ráfaga masiva de solicitudes simultáneas contra un solo recurso para verificar la estabilidad de la cola distribuida y la ausencia de condiciones de carrera.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grafo de Deadlock */}
      <section id="grafo-deadlock" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Visualización del Grafo y Selección de la Víctima
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En el escenario de Deadlock, el simulador destaca con color ámbar y rojo las aristas que forman el ciclo cerrado (<code>Worker A ➔ Recurso 2 ➔ Worker B ➔ Recurso 1 ➔ Worker A</code>).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          El motor de Caerus selecciona a la víctima con menor prioridad o menor progreso transaccional, envía una señal de aborto para liberar sus recursos retenidos y permite que los workers restantes completen su trabajo de forma transparente.
        </p>
      </section>

      {/* Correr Local */}
      <section id="correr-local" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Correr el Simulador Localmente
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Podés clonar el repositorio de la demo del DLS e iniciar el simulador interactivo en tu entorno local:
        </p>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`git clone https://github.com/caerus-dev/demo-dls.git
cd demo-dls
pnpm install
pnpm dev`}
        />

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={docsConfig.demoDlsRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
              <Github className="h-4 w-4" />
              <span>Ver Repositorio caerus-dev/demo-dls</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </a>

          <Link href="/docs/dls">
            <Button variant="outline" className="w-full sm:w-auto">
              ← Volver a Conceptos DLS
            </Button>
          </Link>
        </div>
      </section>
    </DocsPageLayout>
  )
}
