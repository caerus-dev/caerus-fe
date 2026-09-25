import Link from "next/link"
import { ExternalLink, Github, Sparkles, Film, Terminal, Play, CheckCircle2, ShieldAlert } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { docsConfig } from "@/components/docs/docs-config"

const tocItems = [
  { id: "concepto-demo", title: "Idea Central de la Demo" },
  { id: "comparativa", title: "FAIL vs QUEUE en Cartelera" },
  { id: "panel-llamadas", title: "El Panel de Llamadas en Vivo" },
  { id: "probar-demo", title: "Probar la Demo Desplegada" },
  { id: "correr-local", title: "Correr la Demo en tu Máquina" },
]

export default function DocsSreDemoPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "SRE", href: "/docs/sre" },
        { label: "Demo Interactiva: Caerus Cine" },
      ]}
      title="Demo Interactiva: Caerus Cine"
      badge="SRE Simulation"
      description="Una aplicación completa de reserva de butacas para cine que demuestra cómo dos clientes compiten por el mismo recurso y cómo las políticas de conflicto cambian el comportamiento sin tocar una sola línea de código."
      tocItems={tocItems}
    >
      {/* Concepto Demo */}
      <section id="concepto-demo" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Idea Central de la Demo
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En un cine, cuando dos personas quieren la misma butaca exactamente a la vez, deben chocar de verdad. Las butacas se toman durante unos minutos; si nadie las paga, se liberan solas; y si el usuario cancela, vuelven inmediatamente a estar disponibles.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          La demo está conectada al motor de Caerus a través del paquete oficial <code>@caerus-dev/sdk</code> y ejercita <strong>los trece verbos</strong> de su API pública (recursos unitarios, con cupo de candy bar, confirmaciones y cancelaciones).
        </p>
      </section>

      {/* Comparativa */}
      <section id="comparativa" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Dos Películas, Dos Políticas de Conflicto
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Las dos funciones de la cartelera tienen configuraciones de plantilla radicalmente distintas en el dashboard:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card className="border-border/70 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="outline" className="w-fit text-[10px] mb-1">Plantilla butaca (FAIL)</Badge>
              <CardTitle className="text-base">🎬 El Último Horizonte</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>• Política de conflicto: <strong>FAIL</strong></p>
              <p>• Si dos usuarios piden la misma butaca, el segundo recibe un <code>ConflictError</code> y la pierde de inmediato.</p>
              <p>• Cuando el primero libera la butaca, no pasa nada automático; el asiento queda libre para quien llegue primero.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <Badge variant="secondary" className="w-fit text-[10px] text-amber-500 mb-1">Plantilla butaca_fila (QUEUE)</Badge>
              <CardTitle className="text-base">🎬 Lluvia de Neón</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>• Política de conflicto: <strong>QUEUE</strong> (Fila de espera)</p>
              <p>• Si el segundo pide la butaca ocupada, <strong>queda automáticamente en la fila</strong>.</p>
              <p>• Cuando el primer usuario libera la butaca o vence su tiempo, el motor <strong>se la asigna solo al segundo en cuestión de segundos</strong>.</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Mismo código en la aplicación: </strong>
          La diferencia en el comportamiento entre ambas películas radica 100% en la configuración de la plantilla en el dashboard de Caerus, sin cambiar una sola línea de código en la aplicación cliente.
        </div>
      </section>

      {/* Panel de llamadas */}
      <section id="panel-llamadas" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          El Panel de Llamadas en Tiempo Real
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Debajo del mapa de butacas, la aplicación incluye una consola interactiva que intercepta mediante un Proxy cada llamada real que el servidor realiza al SDK:
        </p>

        <CodeBlock
          language="text"
          title="Consola de Observabilidad del SDK"
          code={`22:53:33   reservar   53 ms
caerus.unitary('funcionneon_D9').take({ idempotencyKey: '...', ttlSeconds: 120 })
✕ ConflictError: Out of stock for resource: funcionneon_D9 (Already held by another user)`}
        />
      </section>

      {/* Probar la Demo */}
      <section id="probar-demo" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Probar la Demo Desplegada
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La demo está desplegada y disponible públicamente. Te recomendamos abrirla en <strong>dos pestañas distintas</strong> (cada pestaña simula un usuario con sesión independiente) para competir por la misma butaca:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
            <a
              href="https://caerus-demo.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play className="h-4 w-4" />
              <span>Abrir Demo Caerus Cine en Vercel</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </Button>

          <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
            <a
              href={docsConfig.demoSreRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span>Ver Repositorio caerus-dev/demo-sdk</span>
            </a>
          </Button>
        </div>
      </section>

      {/* Correr Local */}
      <section id="correr-local" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Correr la Demo en tu Máquina
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Si prefieres clonar el código y ejecutarla localmente:
        </p>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`git clone https://github.com/caerus-dev/demo-sdk.git
cd demo-sdk
npm install
npm run dev`}
        />

        <p className="text-xs text-muted-foreground">
          Nota: Si no configuras <code>CAERUS_API_KEY</code>, la demo arranca automáticamente contra un motor en memoria (in-memory mock) para que puedas probarla sin necesidad de desplegar el backend.
        </p>
      </section>
    </DocsPageLayout>
  )
}
