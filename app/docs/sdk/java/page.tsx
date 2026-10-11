import Link from "next/link"
import { ArrowRight, Terminal, Shield, CheckCircle2, AlertTriangle, ExternalLink, Box, Server, Lock } from "lucide-react"
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
  { id: "sre-java", title: "Shared Resource Engine" },
  { id: "dls-java", title: "Distributed Locking Service" },
  { id: "errores-java", title: "Manejo de Errores" },
  { id: "testing-java", title: "Mocks y Testing" },
  { id: "siguiente-paso", title: "Siguientes Pasos" },
]

export default function DocsSdkJavaPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[{ label: "SDKs", href: "/docs/sdk" }, { label: "Java" }]}
      title="caerus-sdk (Java)"
      badge="Java 17+ / Maven & Gradle"
      description="El cliente oficial de Caerus para aplicaciones Java. Administra reservas de inventario y locks distribuidos con tipado estricto, comunicación gRPC de alto rendimiento y cero dependencias expuestas en la API pública."
      tocItems={tocItems}
    >
      <SignatureBlock signature="CaerusClient caerus = new CaerusClient(CaerusClientOptions.builder().apiKey(key).build());" />

      {/* Instalación */}
      <section id="instalacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Instalación
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El artefacto oficial está disponible para <strong>Java 17 o superior</strong>. Empaqueta gRPC (con transporte Netty), Protobuf y Gson de forma interna y aislada:
        </p>

        <CodeBlock
          snippets={{
            maven: {
              language: "xml",
              title: "pom.xml",
              label: "Maven",
              code: `<dependency>
    <groupId>io.github.caerus-dev</groupId>
    <artifactId>caerus-sdk</artifactId>
    <version>0.1.0</version>
</dependency>`,
            },
            gradle: {
              language: "groovy",
              title: "build.gradle",
              label: "Gradle",
              code: `dependencies {
    implementation 'io.github.caerus-dev:caerus-sdk:0.1.0'
}`,
            },
          }}
        />

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="font-semibold text-foreground">Repositorio oficial: </span>
            Código fuente, issues y lanzamientos disponibles en GitHub.
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href="https://github.com/caerus-dev/caerus-sdk-java" target="_blank" rel="noopener noreferrer">
              <span>github.com/caerus-dev/caerus-sdk-java</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Inicialización */}
      <section id="inicializacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Inicialización del Cliente
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La API Key identifica a tu organización y entorno. El cliente gestiona un canal multiplexado gRPC y es thread-safe. Se recomienda crear una sola instancia por proceso (implementa <code>AutoCloseable</code>):
        </p>

        <CodeBlock
          language="java"
          title="CaerusService.java"
          showLineNumbers
          code={`import dev.caerus.CaerusClient;
import dev.caerus.CaerusClientOptions;

CaerusClient caerus = new CaerusClient(CaerusClientOptions.builder()
        .apiKey(System.getenv("CAERUS_API_KEY"))
        .build());`}
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
          Actualmente Caerus opera como servicio administrado en la nube. En el roadmap se planifica una imagen oficial de Docker para desarrollo y pruebas offline en tu máquina (puerto <code>9090</code>):
        </p>

        <CodeBlock
          language="java"
          title="CaerusLocal.java"
          code={`CaerusClient caerus = new CaerusClient(CaerusClientOptions.builder()
        .endpoint("localhost:9090")
        .apiKey(apiKey)
        .tls(false) // Texto plano para entornos locales
        .build());`}
        />

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Formato de endpoint y TLS</span>
          </div>
          <p className="leading-relaxed">
            El <code>endpoint</code> debe ser únicamente <code>host:puerto</code> (sin esquema <code>http://</code> ni <code>https://</code>). El SDK en Java incluye soporte preparado para <code>tls(false)</code> para cuando la distribución local esté liberada.
          </p>
        </div>
      </section>

      {/* Tabla de opciones */}
      <section id="opciones" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Tabla de Opciones (<code>CaerusClientOptions</code>)
        </h2>

        <div className="border border-border/70 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow>
                <TableHead className="w-[140px]">Opción</TableHead>
                <TableHead className="w-[160px]">Por Defecto</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">apiKey</TableCell>
                <TableCell className="font-mono text-muted-foreground">—</TableCell>
                <TableCell>Requerido. Clave de autenticación generada en la consola web de Caerus.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">endpoint</TableCell>
                <TableCell className="font-mono text-muted-foreground">caerus.dev.ar.sdk...:443</TableCell>
                <TableCell>Host y puerto gRPC. Lee automáticamente <code>CAERUS_ENDPOINT</code> si está definida.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">tls</TableCell>
                <TableCell className="font-mono text-muted-foreground">true</TableCell>
                <TableCell>Seguridad de transporte TLS. Solo desactivar con <code>false</code> en entornos locales futuros.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">timeoutMs</TableCell>
                <TableCell className="font-mono text-muted-foreground">10000</TableCell>
                <TableCell>Deadline gRPC máximo por solicitud en milisegundos.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium text-primary">logger</TableCell>
                <TableCell className="font-mono text-muted-foreground">System.err [caerus]</TableCell>
                <TableCell>Consumer de logs para advertencias y diagnósticos de red.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Shared Resource Engine */}
      <section id="sre-java" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Shared Resource Engine (SRE) en Java
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El cliente Java implementa el modelo de recursos unitarios (exactamente 1 unidad) y pooled (cupos o inventario agrupado):
        </p>

        <CodeBlock
          language="java"
          title="BookingService.java"
          showLineNumbers
          code={`import dev.caerus.model.*;
import java.util.Map;

// 1. Tomar 2 unidades de un recurso pooled con clave de idempotencia
ResourceHolder holder = caerus.pooled("entradas_campo").takeMany(2, TakeOptions.builder()
        .idempotencyKey("order_9841")
        .ttlSeconds(600)
        .metadata(Map.of("clienteId", "usr_42"))
        .build());

try {
    procesarPago(holder.id());
    // 2. Confirmar la compra permanentemente
    caerus.confirm(holder.id(), ConfirmOptions.builder()
            .metadata(Map.of("pagoId", "pay_771"))
            .build());
} catch (Exception e) {
    // 3. Liberar de inmediato para otros compradores
    caerus.release(holder.id());
}`}
        />
      </section>

      {/* Distributed Locking Service */}
      <section id="dls-java" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Distributed Locking Service (DLS) en Java
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          <code>DlsClient</code> administra transacciones distribuidas con renovación automática en segundo plano y Fencing Tokens monótonos para proteger contra split-brain:
        </p>

        <CodeBlock
          language="java"
          title="BillingJob.java"
          showLineNumbers
          code={`import dev.caerus.dls.DlsClient;
import dev.caerus.dls.DlsClientOptions;
import dev.caerus.dls.model.*;

DlsClient dls = new DlsClient(DlsClientOptions.builder().apiKey(apiKey).build());

String resultado = dls.withTransaction(tx -> {
    LockHolder lock = tx.acquireLock("facturacion", "mes-octubre", LockMode.EXCLUSIVE,
            AcquireLockOptions.builder()
                    .idempotencyKey("job_run_1")
                    .timeoutMs(30_000L)
                    .build());

    long token = lock.fencingToken().getAsLong();
    return ejecutarCobrosConToken(token);
}, TransactionOptions.builder().timeoutMs(20_000L).build());`}
        />
      </section>

      {/* Errores */}
      <section id="errores-java" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Manejo de Errores
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Todas las excepciones extienden <code>CaerusError</code> (unchecked, extiende <code>RuntimeException</code>). Incluyen <code>code()</code> para switches limpios, <code>reason()</code> con el código formal del motor y <code>requestId()</code> para trazabilidad:
        </p>

        <CodeBlock
          language="java"
          title="ErrorHandling.java"
          code={`import dev.caerus.error.*;

try {
    caerus.unitary("asiento_vip_12").take();
} catch (ConflictError e) {
    System.err.println("Sin stock o asiento ocupado: " + e.getMessage());
} catch (CaerusError e) {
    System.err.printf("Error Caerus [%s]: %s (request: %s)%n", 
            e.code(), e.getMessage(), e.requestId().orElse("N/A"));
}`}
        />
      </section>

      {/* Testing */}
      <section id="testing-java" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Testing sin Servidor (Mocks en Memoria)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El SDK incluye <code>InMemoryCaerusClient</code> e <code>InMemoryDlsClient</code> para ejecutar tests unitarios deterministas y thread-safe sin necesidad de levantar un motor gRPC real:
        </p>

        <CodeBlock
          language="java"
          title="BookingServiceTest.java"
          code={`import dev.caerus.mock.*;
import java.util.List;

InMemoryCaerusClient mockClient = new InMemoryCaerusClient(MockOptions.builder()
        .resources(List.of(MockResourceSeed.of("butaca_A12", 1)))
        .build());

// Simular rechazo de confirmación y avanzar el tiempo simulado
mockClient.failNext(MockMethod.CONFIRM, new ConflictError("pago rechazado"));
mockClient.advanceTime(600);`}
        />
      </section>

      {/* Siguiente paso */}
      <section id="siguiente-paso" className="pt-4 flex items-center justify-between border-t border-border/50">
        <Button asChild variant="ghost" size="sm">
          <Link href="/docs/sdk">
            ← SDK TypeScript / Node.js
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/docs/sre">
            <span>Conceptos de SRE</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </section>
    </DocsPageLayout>
  )
}
