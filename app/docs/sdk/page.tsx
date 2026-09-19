import Link from "next/link"
import { ArrowRight, Terminal, Shield, CheckCircle2, AlertTriangle } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock, SignatureBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const tocItems = [
  { id: "instalacion", title: "Instalación" },
  { id: "inicializacion", title: "Inicialización del Cliente" },
  { id: "conexion-local", title: "Conexión a un Caerus Local" },
  { id: "opciones", title: "Tabla de Opciones" },
  { id: "siguiente-paso", title: "Siguientes Pasos" },
]

export default function DocsSdkPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[{ label: "SDK", href: "/docs/sdk" }, { label: "Instalación y Conexión" }]}
      title="@caerus-dev/sdk"
      badge="TypeScript / Node.js"
      description="El cliente oficial de Caerus para aplicaciones backend. Administrá reservas de inventario y locks distribuidos con tipado estricto y comunicación gRPC de alto rendimiento."
      tocItems={tocItems}
    >
      <SignatureBlock signature="const caerus = new CaerusClient(options: CaerusClientOptions);" />

      {/* Instalación */}
      <section id="instalacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Instalación
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El paquete requiere <strong>Node.js 20 o superior</strong>. Incluye definiciones TypeScript completas y soporte nativo para ES Modules y CommonJS:
        </p>

        <CodeBlock code="npm install @caerus-dev/sdk" language="bash" title="npm" />
        <CodeBlock code="pnpm add @caerus-dev/sdk" language="bash" title="pnpm" />

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Nota de seguridad: </span>
          El SDK corre exclusivamente en el <strong>servidor</strong> de tu aplicación. La API Key nunca debe exponerse en el navegador o en código frontend.
        </div>
      </section>

      {/* Inicialización */}
      <section id="inicializacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Inicialización del Cliente
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La API Key identifica a tu organización y ambiente (e.g. Producción, Staging), por lo que el SDK sabe automáticamente a qué tenant pertenece cada operación:
        </p>

        <CodeBlock
          language="typescript"
          title="caerus.ts"
          code={`import { CaerusClient } from '@caerus-dev/sdk';

export const caerus = new CaerusClient({
  apiKey: process.env.CAERUS_API_KEY!,
});`}
        />
      </section>

      {/* Conexión Local */}
      <section id="conexion-local" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Conexión a un Caerus Local (Docker)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Para pruebas unitarias, integración o desarrollo offline con el Data Plane levantado en tu máquina (puerto <code>9090</code>):
        </p>

        <CodeBlock
          language="typescript"
          title="caerus.local.ts"
          code={`const caerus = new CaerusClient({
  endpoint: 'localhost:9090',
  apiKey: process.env.CAERUS_API_KEY!,
  tls: false, // Un motor local corre en texto plano sin certificado SSL
});`}
        />

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Formato de endpoint y TLS</span>
          </div>
          <p className="leading-relaxed">
            El <code>endpoint</code> debe ser únicamente <code>host:puerto</code> (sin prefijo <code>http://</code> ni <code>https://</code>). Además, recordá que <code>tls: false</code> es mandatorio en local; de lo contrario OpenSSL arrojará un error de versión de protocolo.
          </p>
        </div>
      </section>

      {/* Tabla de opciones */}
      <section id="opciones" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Tabla de Opciones
        </h2>

        <div className="border border-border/70 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow>
                <TableHead className="w-[140px]">Opción</TableHead>
                <TableHead className="w-[120px]">Por Defecto</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">apiKey</TableCell>
                <TableCell className="font-mono text-muted-foreground">—</TableCell>
                <TableCell>Requerido. Clave de API obtenida del dashboard de Caerus.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">endpoint</TableCell>
                <TableCell className="font-mono text-muted-foreground">Cloud Caerus</TableCell>
                <TableCell>Dirección <code>host:port</code> del motor gRPC del Data Plane.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">tls</TableCell>
                <TableCell className="font-mono text-muted-foreground">true</TableCell>
                <TableCell>Habilita encriptación TLS. Desactivar solo con <code>false</code> explícito en local.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">timeoutMs</TableCell>
                <TableCell className="font-mono text-muted-foreground">10000</TableCell>
                <TableCell>Tiempo máximo de espera (deadline gRPC) en milisegundos.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Siguiente paso */}
      <section id="siguiente-paso" className="pt-4 flex items-center justify-between border-t border-border/50">
        <Link href="/docs">
          <Button variant="ghost" size="sm">
            ← Visión General
          </Button>
        </Link>
        <Link href="/docs/sre">
          <Button size="sm" className="gap-2">
            <span>Aprender SRE (Shared Resources)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </DocsPageLayout>
  )
}
