import Link from "next/link"
import { ExternalLink, Github, Film, CheckCircle2, ShieldAlert } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { docsConfig } from "@/components/docs/docs-config"

const tocItems = [
  { id: "concepto-sample", title: "Idea Central del Sample" },
  { id: "comparativa", title: "FAIL vs QUEUE en Cartelera" },
  { id: "repositorio-github", title: "Repositorio Oficial en GitHub" },
]

export default function DocsSreDemoPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "SRE", href: "/docs/sre" },
        { label: "Quickstart & Sample (Cine)" },
      ]}
      title="Quickstart & Sample: Caerus Cine"
      badge="Sample Project"
      description="Aplicación de referencia completa construida con @caerus-dev/sdk. Demuestra reserva concurrente de butacas de cine, expiración automática por TTL y cómo las políticas FAIL vs QUEUE transforman la experiencia sin cambiar código."
      tocItems={tocItems}
    >
      {/* Concepto Sample */}
      <section id="concepto-sample" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Idea Central del Sample
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En un cine, cuando dos personas intentan reservar la misma butaca exactamente en el mismo instante, deben colisionar de verdad. Las butacas se retienen temporalmente por unos minutos; si nadie las paga, se liberan solas al expirar el TTL; y si el usuario cancela su selección, vuelven de inmediato a estar disponibles.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Este proyecto de referencia corre contra el motor de Caerus a través del paquete oficial <code>@caerus-dev/sdk</code> y ejercita <strong>los trece verbos</strong> de su API pública (recursos unitarios, saldo con cupo para el candy bar, confirmaciones definitivas y cancelaciones).
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
              <p>• Si dos usuarios piden la misma butaca, el segundo recibe de inmediato un <code>ConflictError</code> y la pierde.</p>
              <p>• Cuando el primero libera la butaca, no hay traspaso automático; queda libre para quien llegue primero.</p>
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
              <p>• Cuando el primero libera la butaca o vence su TTL, el motor <strong>se la asigna solo al segundo en segundos</strong>.</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Mismo código en la aplicación: </strong>
          La diferencia de comportamiento entre ambas películas reside 100% en la configuración de la plantilla en el dashboard de Caerus, sin necesidad de modificar una sola línea de código en el backend.
        </div>
      </section>

      {/* Repositorio en GitHub */}
      <section id="repositorio-github" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Repositorio Oficial en GitHub
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Todo el código fuente del proyecto, el esquema de variables de entorno (<code>.env.example</code>), la arquitectura del proxy de observabilidad del SDK y las instrucciones detalladas para ejecutarlo localmente se encuentran disponibles en GitHub:
        </p>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span>caerus-dev/demo-sdk</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Next.js · TypeScript · @caerus-dev/sdk · Proxy de observabilidad · Docker Local
              </p>
            </div>
            <Button asChild size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90 shrink-0">
              <a
                href={docsConfig.demoSreRepoUrl}
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
              <li>Guía de inicio rápido para correr en local con <code>npm install</code> y <code>npm run dev</code>.</li>
              <li>Instrucciones para probar con dos pestañas de navegador simultáneas simulando concurrencia real vía <code>sessionStorage</code>.</li>
              <li>Variables de entorno para conectar contra Caerus Cloud o el motor local con Docker Compose.</li>
              <li>Detalles técnicos del Proxy del SDK para registrar tiempos y llamadas en vivo.</li>
            </ul>
          </div>
        </div>
      </section>
    </DocsPageLayout>
  )
}
