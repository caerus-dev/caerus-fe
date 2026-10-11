import Link from "next/link"
import { ArrowRight, Terminal, Shield, CheckCircle2, AlertTriangle, ExternalLink, Code2, Cpu, Lock } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock, SignatureBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const tocItems = [
  { id: "instalacion", title: "Instalación" },
  { id: "inicializacion", title: "Inicialización del Cliente" },
  { id: "conexion-local", title: "Conexión Local (Roadmap)" },
  { id: "opciones", title: "Tabla de Opciones" },
  { id: "sre", title: "Uso con SRE (Inventario)" },
  { id: "dls", title: "Uso con DLS (Locks Distribuidos)" },
  { id: "testing", title: "Mocks y Testing" },
  { id: "repositorios", title: "Repositorios Oficiales" },
  { id: "siguiente-paso", title: "Siguientes Pasos" },
]

export default function DocsSdkPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[{ label: "Comenzando", href: "/docs" }, { label: "SDKs Oficiales" }]}
      title="SDKs Oficiales de Caerus"
      badge="TypeScript & Java"
      description="Clientes oficiales para integrar Caerus en tus microservicios backend. Soporte para Node.js / TypeScript y Java 17+, con tipado estricto, comunicación gRPC de alto rendimiento y selección unificada de lenguaje."
      tocItems={tocItems}
    >
      <SignatureBlock
        signatures={{
          typescript: "const caerus = new CaerusClient(options: CaerusClientOptions);",
          java: "CaerusClient caerus = new CaerusClient(CaerusClientOptions.builder().apiKey(key).build());",
        }}
      />

      {/* Instalación */}
      <section id="instalacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Instalación
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Selecciona tu lenguaje preferido. Los SDKs oficiales se distribuyen a través de sus registros estándar (npm para Node.js/TypeScript y Maven Central para Java):
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "bash",
              title: "npm / pnpm / yarn / bun",
              label: "TypeScript",
              code: `npm install @caerus-dev/sdk
# O con tu gestor preferido:
# pnpm add @caerus-dev/sdk
# yarn add @caerus-dev/sdk
# bun add @caerus-dev/sdk`,
            },
            java: {
              language: "xml",
              title: "pom.xml / build.gradle",
              label: "Java",
              code: `<!-- Maven (pom.xml) -->
<dependency>
    <groupId>io.github.caerus-dev</groupId>
    <artifactId>caerus-sdk</artifactId>
    <version>0.1.0</version>
</dependency>

// Gradle (build.gradle)
// implementation 'io.github.caerus-dev:caerus-sdk:0.1.0'`,
            },
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground pt-1">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              TypeScript / Node.js
            </span>
            <p>Requiere Node.js 20 o superior. Incluye tipos completos de TypeScript y empaquetado dual ESM y CommonJS.</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Java 17+
            </span>
            <p>Compatible con Java 17 o superior. Empaqueta gRPC (Netty) y Protobuf sin exponer dependencias conflictivas.</p>
          </div>
        </div>
      </section>

      {/* Inicialización */}
      <section id="inicializacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Inicialización del Cliente
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La API Key identifica a tu organización y entorno (e.g. Producción, Staging). El cliente gestiona un canal multiplexado gRPC thread-safe y reutilizable:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "caerus.ts",
              label: "TypeScript",
              code: `import { CaerusClient } from '@caerus-dev/sdk';

export const caerus = new CaerusClient({
  apiKey: process.env.CAERUS_API_KEY!,
});`,
            },
            java: {
              language: "java",
              title: "CaerusService.java",
              label: "Java",
              code: `import dev.caerus.CaerusClient;
import dev.caerus.CaerusClientOptions;

public class CaerusService {
    public static final CaerusClient client = new CaerusClient(
        CaerusClientOptions.builder()
            .apiKey(System.getenv("CAERUS_API_KEY"))
            .build()
    );
}`,
            },
          }}
        />
      </section>

      {/* Conexión Local */}
      <section id="conexion-local" className="space-y-4">
        <div className="flex items-center gap-3 border-b border-border/40 pb-2 flex-wrap">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Conexión a un Caerus Local (Docker)
          </h2>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs font-medium">
            A futuro / En Roadmap
          </Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Actualmente Caerus opera como servicio centralizado en la nube. A futuro, estará disponible una distribución e imagen oficial de Docker para levantar un servidor local en tu propia máquina (puerto <code>9090</code>) para pruebas unitarias, integración continua o desarrollo offline:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "caerus.local.ts",
              label: "TypeScript",
              code: `const caerus = new CaerusClient({
  endpoint: 'localhost:9090',
  apiKey: process.env.CAERUS_API_KEY!,
  tls: false, // Un motor local corre sin certificado TLS
});`,
            },
            java: {
              language: "java",
              title: "CaerusLocal.java",
              label: "Java",
              code: `CaerusClient caerus = new CaerusClient(
    CaerusClientOptions.builder()
        .endpoint("localhost:9090")
        .apiKey(System.getenv("CAERUS_API_KEY"))
        .tls(false) // Un motor local corre sin certificado TLS
        .build()
);`,
            },
          }}
        />

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Formato de endpoint y TLS (Soporte preparado en los SDKs)</span>
          </div>
          <p className="leading-relaxed">
            El <code>endpoint</code> debe ser únicamente <code>host:puerto</code> (sin prefijo <code>http://</code> ni <code>https://</code>). Ambos clientes ya soportan endpoints personalizados y <code>tls: false</code>, listos para cuando la imagen Docker esté disponible.
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
                <TableCell>Requerido. Clave de API obtenida de la consola web de Caerus.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">endpoint</TableCell>
                <TableCell className="font-mono text-muted-foreground">Cloud Caerus</TableCell>
                <TableCell>Dirección <code>host:port</code> del cluster gRPC de Caerus.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">tls</TableCell>
                <TableCell className="font-mono text-muted-foreground">true</TableCell>
                <TableCell>Habilita encriptación TLS. Desactivar solo con <code>false</code> explícito en conexiones locales (roadmap).</TableCell>
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

      {/* SRE */}
      <section id="sre" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Uso con SRE (Inventario & Recursos Compartidos)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Flujo de reserva transaccional en dos fases: adquirir una reserva temporal (<code>take</code>) sujeta a TTL y luego confirmarla (<code>confirm</code>) o liberarla (<code>release</code>):
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "reserva.ts",
              label: "TypeScript",
              code: `// 1. Adquirir reserva temporal con TTL e idempotencia
const holder = await caerus.unitary('seat-A12').take({
  ttlSeconds: 60,
  idempotencyKey: 'checkout-session-123',
});

// 2. Procesar cobro en tu pasarela...
// 3. Confirmar la reserva de inventario
await holder.confirm();`,
            },
            java: {
              language: "java",
              title: "ReservaService.java",
              label: "Java",
              code: `// 1. Adquirir reserva temporal con TTL e idempotencia
ResourceHolder holder = caerus.unitary("seat-A12").take(
    TakeOptions.builder()
        .ttlSeconds(60)
        .idempotencyKey("checkout-session-123")
        .build()
);

// 2. Procesar cobro en tu pasarela...
// 3. Confirmar la reserva de inventario
holder.confirm(ConfirmOptions.builder().build());`,
            },
          }}
        />
      </section>

      {/* DLS */}
      <section id="dls" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Uso con DLS (Locks Distribuidos)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Sincronización y exclusión mutua distribuida entre workers concurrentes mediante transacciones y Fencing Tokens:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "dls-worker.ts",
              label: "TypeScript",
              code: `import { Dls } from '@caerus-dev/sdk';

const dls = new Dls.DlsClient({ apiKey: process.env.CAERUS_API_KEY! });
const tx = await dls.beginTransaction({ timeoutMs: 10000 });

const lock = await dls.acquireLock(
  'billing-jobs',
  'monthly-billing',
  tx.transactionId,
  'EXCLUSIVE'
);

try {
  console.log('Fencing Token:', lock.fencingToken);
  // Ejecutar tarea crítica...
} finally {
  await dls.releaseTransactionLocks(tx.transactionId);
}`,
            },
            java: {
              language: "java",
              title: "BillingWorker.java",
              label: "Java",
              code: `import dev.caerus.dls.DlsClient;
import dev.caerus.dls.DlsClientOptions;
import dev.caerus.dls.model.*;

DlsClient dls = new DlsClient(DlsClientOptions.builder()
    .apiKey(System.getenv("CAERUS_API_KEY"))
    .build());

dls.withTransaction(tx -> {
    LockHolder lock = tx.acquireLock(
        "billing-jobs",
        "monthly-billing",
        LockMode.EXCLUSIVE,
        AcquireLockOptions.builder().timeoutMs(10_000L).build()
    );

    long token = lock.fencingToken().getAsLong();
    System.out.println("Fencing Token: " + token);
    return token;
});`,
            },
          }}
        />
      </section>

      {/* Testing */}
      <section id="testing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Mocks y Testing
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Para pruebas unitarias rápidas sin depender de conexión a internet o red:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "order-service.spec.ts",
              label: "TypeScript",
              code: `import { CaerusClient } from '@caerus-dev/sdk';

// Puedes inyectar un cliente de prueba o mockear con Jest / Vitest:
const testClient = new CaerusClient({
  apiKey: 'test-key',
});`,
            },
            java: {
              language: "java",
              title: "OrderServiceTest.java",
              label: "Java",
              code: `import dev.caerus.testing.InMemoryCaerusClient;
import dev.caerus.testing.InMemoryDlsClient;

// Clientes mock incluidos nativamente en el artefacto caerus-sdk:
InMemoryCaerusClient mockCaerus = new InMemoryCaerusClient();
InMemoryDlsClient mockDls = new InMemoryDlsClient();`,
            },
          }}
        />
      </section>

      {/* Repositorios Oficiales */}
      <section id="repositorios" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Repositorios Oficiales en GitHub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Code2 className="h-4 w-4 text-primary" />
              <span>caerus-sdk-ts (TypeScript)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Repositorio de Node.js / TypeScript. Código fuente, tipados y ejemplos para Next.js y Express.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link href="https://github.com/caerus-dev/caerus-sdk-ts" target="_blank" rel="noopener noreferrer">
                <span>Ver en GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span>caerus-sdk-java (Java)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Repositorio oficial de Java 17+. Artefactos Maven, tests de integración y mocks en memoria.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link href="https://github.com/caerus-dev/caerus-sdk-java" target="_blank" rel="noopener noreferrer">
                <span>Ver en GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Siguiente paso */}
      <section id="siguiente-paso" className="pt-4 flex items-center justify-between border-t border-border/50">
        <Button asChild variant="ghost" size="sm">
          <Link href="/docs">
            ← Visión General
          </Link>
        </Button>
        <Button asChild size="sm" className="gap-2">
          <Link href="/docs/sre">
            <span>Aprender SRE (Shared Resources)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </DocsPageLayout>
  )
}
