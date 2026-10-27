import Link from "next/link"
import { ArrowRight, Terminal, Shield, CheckCircle2, AlertTriangle, ExternalLink, Code2, Cpu, Lock, Server } from "lucide-react"
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
  { id: "webhooks", title: "Verificación de Webhooks" },
  { id: "testing", title: "Mocks y Testing" },
  { id: "repositorios", title: "Repositorios Oficiales" },
  { id: "siguiente-paso", title: "Siguientes Pasos" },
]

export default function DocsSdkPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[{ label: "Comenzando", href: "/docs" }, { label: "SDKs Oficiales" }]}
      title="SDKs Oficiales de Caerus"
      badge="TypeScript, Java & Go"
      description="Clientes oficiales para integrar Caerus en tus microservicios backend. Soporte para Node.js / TypeScript, Java 17+ y Go 1.26+, con tipado estricto, comunicación gRPC de alto rendimiento y selección unificada de lenguaje."
      tocItems={tocItems}
    >
      <SignatureBlock
        signatures={{
          typescript: "const caerus = new CaerusClient(options: CaerusClientOptions);",
          java: "CaerusClient caerus = new CaerusClient(CaerusClientOptions.builder().apiKey(key).build());",
          go: "client, err := sre.NewClient(sre.ClientOptions{APIKey: key})",
        }}
      />

      {/* Instalación */}
      <section id="instalacion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Instalación
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Selecciona tu lenguaje preferido. Los SDKs oficiales se distribuyen a través de sus registros estándar (npm para Node.js/TypeScript, Maven Central para Java y módulos de Go):
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
            go: {
              language: "bash",
              title: "go get",
              label: "Go",
              code: `go get github.com/caerus-dev/caerus-sdk-go`,
            },
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground pt-1">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              TypeScript / Node.js
            </span>
            <p>Requiere Node.js 20 o superior. Incluye tipos completos de TypeScript y empaquetado dual ESM y CommonJS.</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Java 17+
            </span>
            <p>Compatible con Java 17 o superior. Empaqueta gRPC (Netty) y Protobuf sin exponer dependencias conflictivas.</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Go 1.26+
            </span>
            <p>Compatible con Go moderno. Diseñado con contextos bloqueantes, soporte nativo de cancelaciones y sin exponer gRPC en la API pública.</p>
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
            go: {
              language: "go",
              title: "caerus.go",
              label: "Go",
              code: `package main

import (
	"os"

	"github.com/caerus-dev/caerus-sdk-go/sre"
)

var client, _ = sre.NewClient(sre.ClientOptions{
	APIKey: os.Getenv("CAERUS_API_KEY"),
})`,
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
          Actualmente Caerus opera como servicio centralizado en la nube. A futuro, estará disponible una distribución e imagen oficial de Docker para levantar un servidor de Caerus en tu propia máquina (puerto <code>9090</code>) para pruebas unitarias, integración continua o desarrollo offline:
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
            go: {
              language: "go",
              title: "caerus.local.go",
              label: "Go",
              code: `client, err := sre.NewClient(sre.ClientOptions{
	Endpoint: "localhost:9090",
	APIKey:   os.Getenv("CAERUS_API_KEY"),
	TLS:      caerus.Bool(false), // Texto plano para entorno local
})`,
            },
          }}
        />

        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>Formato de endpoint y TLS</span>
          </div>
          <p className="leading-relaxed">
            Al apuntar a un host personalizado o motor local, el <code>endpoint</code> debe ser únicamente <code>host:puerto</code> (por ejemplo <code>localhost:9090</code>, sin prefijo <code>http://</code> ni <code>https://</code>) y acompañarse de <code>tls: false</code> para comunicación en texto plano.
          </p>
        </div>
      </section>

      {/* Tabla de opciones */}
      <section id="opciones" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Tabla de Opciones
        </h2>

        <div className="border border-border/70 rounded-lg overflow-hidden">
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
await caerus.confirm(holder.id);`,
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
caerus.confirm(holder.id());`,
            },
            go: {
              language: "go",
              title: "reserva.go",
              label: "Go",
              code: `// 1. Adquirir reserva temporal con TTL e idempotencia
holder, err := caerus.Unitary("seat-A12").Take(ctx, &sre.TakeOptions{
	TTL:            60 * time.Second,
	IdempotencyKey: "checkout-session-123",
})
if err != nil {
	return err
}

// 2. Procesar cobro en tu pasarela...
// 3. Confirmar la reserva de inventario
_, err = caerus.Confirm(ctx, holder.ID, nil)`,
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
          Sincronización y exclusión mutua distribuida entre procesos concurrentes mediante transacciones y Fencing Tokens:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "dls-worker.ts",
              label: "TypeScript",
              code: `import { Dls } from '@caerus-dev/sdk';

const dls = new Dls.DlsClient({ apiKey: process.env.CAERUS_API_KEY! });

// withTransaction orquesta la transacción, heartbeat automático y liberación en finally
await dls.withTransaction(async (tx) => {
  const lock = await tx.acquireLock(
    'billing-jobs',
    'monthly-billing',
    'EXCLUSIVE',
    { timeoutMs: 10000 }
  );

  console.log('Fencing Token:', lock.fencingToken);
  // Ejecutar tarea crítica...
}, { timeoutMs: 15000 });`,
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
            go: {
              language: "go",
              title: "billing_worker.go",
              label: "Go",
              code: `import (
	"context"
	"fmt"
	"time"

	"github.com/caerus-dev/caerus-sdk-go/dls"
)

// WithTransaction orquesta la transacción, heartbeat automático y libera todos los locks al salir
err := locks.WithTransaction(ctx, func(ctx context.Context, tx dls.Tx) error {
	lock, err := tx.AcquireLock(ctx, "billing-jobs", "monthly-billing", dls.Exclusive, &dls.AcquireLockOptions{
		Timeout: 10 * time.Second,
	})
	if err != nil {
		return err
	}

	fmt.Println("Fencing Token:", lock.FencingToken)
	// Ejecutar tarea crítica...
	return nil
}, &dls.TransactionOptions{Timeout: 15 * time.Second})`,
            },
          }}
        />
      </section>

      {/* Webhooks */}
      <section id="webhooks" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Verificación de Webhooks
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Validación criptográfica de eventos entrantes con la cabecera <code className="text-primary font-mono text-xs">Caerus-Signature</code>. Requiere el cuerpo de la petición en crudo para comprobar la firma:
        </p>

        <CodeBlock
          snippets={{
            typescript: {
              language: "typescript",
              title: "webhook-handler.ts",
              label: "TypeScript",
              code: `import express from 'express';
import { CaerusClient, CaerusSignatureError, CaerusWebhookExpiredError } from '@caerus-dev/sdk';

const caerus = new CaerusClient({ apiKey: process.env.CAERUS_API_KEY! });
const app = express();

// Requiere el cuerpo en crudo (Buffer) sin procesar por express.json()
app.post('/api/webhooks/caerus', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['caerus-signature'] as string;
  const webhookSecret = process.env.CAERUS_WEBHOOK_SECRET!;

  try {
    const event = caerus.webhooks.constructEvent(
      req.body, // Buffer en crudo
      signature,
      webhookSecret
    );

    console.log(\`Evento recibido: \${event.eventType} (ID: \${event.eventId})\`);
    res.status(200).json({ received: true });
  } catch (err) {
    if (err instanceof CaerusSignatureError) {
      return res.status(400).send(\`Firma inválida: \${err.message}\`);
    }
    if (err instanceof CaerusWebhookExpiredError) {
      return res.status(400).send('Firma fuera de la tolerancia de tiempo');
    }
    return res.status(500).send('Error interno');
  }
});`,
            },
            java: {
              language: "java",
              title: "CaerusWebhookController.java",
              label: "Java",
              code: `package com.example.webhooks;

import dev.caerus.sdk.sre.CaerusClient;
import dev.caerus.sdk.sre.CaerusClientOptions;
import dev.caerus.sdk.webhooks.CaerusEvent;
import dev.caerus.sdk.webhooks.CaerusSignatureError;
import dev.caerus.sdk.webhooks.CaerusWebhookExpiredError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class CaerusWebhookController {

    private final CaerusClient caerus = new CaerusClient(
        CaerusClientOptions.builder().apiKey(System.getenv("CAERUS_API_KEY")).build()
    );

    // Requiere los bytes del cuerpo en crudo antes de cualquier serialización
    @PostMapping("/caerus")
    public ResponseEntity<String> handleWebhook(
            @RequestBody byte[] rawPayload,
            @RequestHeader("Caerus-Signature") String signatureHeader) {

        String secret = System.getenv("CAERUS_WEBHOOK_SECRET");

        try {
            CaerusEvent event = caerus.webhooks().constructEvent(
                rawPayload,
                signatureHeader,
                secret
            );

            System.out.printf("Evento verificado: %s (ID: %s)%n", event.eventType(), event.eventId());
            return ResponseEntity.ok("{\\"received\\": true}");
        } catch (CaerusSignatureError e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Firma inválida: " + e.getMessage());
        } catch (CaerusWebhookExpiredError e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Firma fuera de la tolerancia de tiempo");
        }
    }
}`,
            },
            go: {
              language: "go",
              title: "webhook_handler.go",
              label: "Go",
              code: `package main

import (
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/caerus-dev/caerus-sdk-go/webhooks"
)

func caerusWebhookHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Leer el cuerpo de la petición en crudo
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error al leer payload", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	signature := r.Header.Get("Caerus-Signature")
	secret := os.Getenv("CAERUS_WEBHOOK_SECRET")

	// 2. Validar firma criptográfica y construir evento tipado
	event, err := webhooks.ConstructEvent(payload, signature, secret, nil)
	if err != nil {
		var sigErr *webhooks.SignatureError
		var expErr *webhooks.ExpiredError

		if errors.As(err, &sigErr) {
			http.Error(w, "Firma inválida", http.StatusUnauthorized)
			return
		}
		if errors.As(err, &expErr) {
			http.Error(w, "Firma fuera de la tolerancia de tiempo", http.StatusBadRequest)
			return
		}
		http.Error(w, "Payload corrupto", http.StatusBadRequest)
		return
	}

	log.Printf("Evento recibido: %s (ID: %s)", event.EventType, event.EventID)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(\`{"received": true}\`))
}`,
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
            go: {
              language: "go",
              title: "order_test.go",
              label: "Go",
              code: `import (
	"github.com/caerus-dev/caerus-sdk-go/dls"
	"github.com/caerus-dev/caerus-sdk-go/sre"
)

// Clientes en memoria para tests unitarios sin backend ni red:
mockCaerus := sre.NewInMemoryClient(&sre.MockOptions{
	Resources: []sre.MockResourceSeed{{Key: "seat-A12", AvailableAmount: 1}},
})
mockDls := dls.NewInMemoryClient()`,
            },
          }}
        />
      </section>

      {/* Repositorios Oficiales */}
      <section id="repositorios" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Repositorios Oficiales en GitHub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
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

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
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

          <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>caerus-sdk-go (Go)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Repositorio oficial de Go 1.26+. Concurrencia idiomática, soporte de contextos y testing en memoria.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link href="https://github.com/caerus-dev/caerus-sdk-go" target="_blank" rel="noopener noreferrer">
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
