import Link from "next/link"
import { ExternalLink, Github, Cpu, GitBranch, ShieldAlert } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { docsConfig } from "@/components/docs/docs-config"

const tocItems = [
  { id: "concepto-sample", title: "Idea Central del Sample" },
  { id: "escenarios", title: "Los 4 Escenarios de Concurrencia" },
  { id: "grafo-deadlock", title: "Grafo de Espera y Selección de Víctima" },
  { id: "repositorio-github", title: "Repositorio Oficial en GitHub" },
]

export default function DocsDlsDemoPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "DLS", href: "/docs/dls" },
        { label: "Quickstart & Sample (Locks)" },
      ]}
      title="Quickstart & Sample: Microservicios DLS"
      badge="Sample Project"
      description="Proyecto de microservicios de referencia construido con @caerus-dev/sdk. Demuestra exclusión mutua distribuida, Fencing Tokens monotónicos, adquisición streaming y resolución de deadlocks en tiempo real."
      tocItems={tocItems}
    >
      {/* Concepto Sample */}
      <section id="concepto-sample" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Idea Central del Sample
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Comprender cómo interactúan múltiples microservicios concurrentes al solicitar locks puede ser complejo. Este proyecto de referencia provee una arquitectura modular con workers independientes (2 o 3 procesos) que compiten por recursos compartidos (como <code>file:reports_export</code> o <code>network:cloud_uploader</code>).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Cada evento refleja respuestas del motor de Caerus mediante Server-Sent Events (SSE) y grafica el estado de cada worker: <code>IDLE</code>, <code>STARTING_TX</code>, <code>HOLDING</code>, <code>QUEUED</code> o <code>DEADLOCK_ABORTED</code>.
        </p>
      </section>

      {/* Los 4 Escenarios */}
      <section id="escenarios" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Los 4 Escenarios de Concurrencia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-blue-500 mb-1">Lectura Concurrente</Badge>
              <CardTitle className="text-sm">1. Lectura Compartida (<code>SHARED_READ</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Muestra cómo múltiples workers adquieren locks <code>SHARED_READ</code> sobre el mismo archivo en paralelo sin bloquearse entre sí, hasta que un escritor exclusivo solicita el recurso.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-emerald-500 mb-1">Exclusión Mutua</Badge>
              <CardTitle className="text-sm">2. Tarea Simple (<code>EXCLUSIVE</code>)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Ejecuta una transacción exclusiva con generación de <strong>Fencing Token</strong> monotónico. El worker toma el lock, escribe en el archivo y libera la transacción de forma segura.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-red-500 mb-1">Ciclo Cruzado</Badge>
              <CardTitle className="text-sm">3. Detección de Deadlock (Cruzado)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Worker A retiene el Recurso 1 y solicita el 2; Worker B retiene el 2 y solicita el 1. El motor detecta el ciclo en el grafo y aborta a la víctima designada para desatorar el sistema.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] text-purple-500 mb-1">Alta Concurrencia</Badge>
              <CardTitle className="text-sm">4. Estampida (100 Workers)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Lanza una ráfaga masiva de solicitudes simultáneas contra un solo recurso para verificar la estabilidad de la cola distribuida, streaming gRPC y ausencia de condiciones de carrera.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grafo de Deadlock */}
      <section id="grafo-deadlock" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Grafo de Espera y Selección de Víctima
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En el escenario de Deadlock, el inspector destaca con color ámbar y rojo las aristas que forman el ciclo cerrado (<code>Worker A ➔ Recurso 2 ➔ Worker B ➔ Recurso 1 ➔ Worker A</code>).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          El motor de Caerus selecciona a la víctima con menor prioridad o menor progreso transaccional, emite una señal de aborto para liberar sus recursos retenidos y permite que los workers restantes completen su trabajo de forma transparente.
        </p>
      </section>

      {/* Repositorio en GitHub */}
      <section id="repositorio-github" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Repositorio Oficial en GitHub
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El código completo de los microservicios, el archivo de variables (<code>.env.example</code>) y la guía detallada de configuración y ejecución local se encuentran disponibles en GitHub:
        </p>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span>caerus-dev/demo-dls</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Next.js · TypeScript · @caerus-dev/sdk · Server-Sent Events · Fencing Tokens · Deadlocks
              </p>
            </div>
            <Button asChild size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90 shrink-0">
              <a
                href={docsConfig.demoDlsRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>Explorar Repositorio en GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </Button>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/50 p-3.5 text-xs text-muted-foreground leading-relaxed space-y-1">
            <strong className="text-foreground">💡 ¿Qué encontrarás en el README del repositorio?</strong>
            <ul className="list-disc list-inside space-y-0.5 pt-1">
              <li>Pasos de ejecución rápida con <code>pnpm install</code> y <code>pnpm dev</code>.</li>
              <li>Explicación técnica de la intercepción de llamadas al SDK con <code>AsyncLocalStorage</code>.</li>
              <li>Configuración de variables de entorno para clúster local gRPC (puerto 9090) o cloud.</li>
              <li>Parámetros de la plantilla <code>task_processing</code> requerida en el Dashboard.</li>
            </ul>
          </div>
        </div>
      </section>
    </DocsPageLayout>
  )
}
