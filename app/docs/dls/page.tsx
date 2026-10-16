import Link from "next/link"
import { ArrowRight, Lock, Key, ShieldCheck, AlertCircle, RefreshCw, Cpu, Sparkles } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock, SignatureBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tocItems = [
  { id: "conceptos", title: "¿Qué es DLS y para qué sirve?" },
  { id: "modos", title: "Modos: Exclusive vs Shared Read" },
  { id: "fencing", title: "Fencing Tokens contra Split-Brain" },
  { id: "deadlocks", title: "Detección y Resolución de Deadlocks" },
  { id: "codigo", title: "Ejemplo de Uso con el SDK" },
  { id: "recursos-practica", title: "Quickstart & Playground" },
]

export default function DocsDlsPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "DLS", href: "/docs/dls" },
        { label: "Conceptos Fundamentales" },
      ]}
      title="Distributed Locking Service (DLS)"
      badge="System Engine"
      description="Sincronización a bajo nivel y exclusión mutua distribuida para microservicios. Evita condiciones de carrera, doble facturación y escritura concurrente en almacenamiento compartido."
      tocItems={tocItems}
    >
      <SignatureBlock
        signatures={{
          typescript: "const lock = await tx.acquireLock(namespace, key, 'EXCLUSIVE', options);",
          java: "LockHolder lock = tx.acquireLock(namespace, key, LockMode.EXCLUSIVE, options);",
          go: "lock, err := tx.AcquireLock(ctx, namespace, key, dls.Exclusive, options)",
        }}
      />

      {/* Conceptos */}
      <section id="conceptos" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          ¿Qué es DLS y para qué sirve?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Mientras que el SRE está enfocado en inventario de negocio (butacas, cupos), el <strong>Distributed Locking Service (DLS)</strong> está diseñado para la sincronización entre procesos. Por ejemplo, garantizar que un worker programado que genera reportes financieros o cobra suscripciones mensuales corra en una sola instancia a la vez.
        </p>
      </section>

      {/* Modos: Exclusive vs Shared Read */}
      <section id="modos" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Modos de Bloqueo: Exclusive vs Shared Read
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          DLS soporta el patrón de concurrencia Read/Write Locks:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <span>EXCLUSIVE (Escritura)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Garantiza exclusión total. Solo un worker puede poseer el lock a la vez. Cualquier otro intento de adquisición exclusiva o compartida queda bloqueado o rechazado.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span>SHARED_READ (Lectura)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Múltiples workers pueden poseer el lock en simultáneo para tareas de solo lectura, impidiendo que entre un escritor exclusivo hasta que todos los lectores terminen.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Fencing Tokens */}
      <section id="fencing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Fencing Tokens contra Split-Brain y Pausas de GC
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En sistemas distribuidos, un distributed lock básico <strong>no es suficiente</strong>. Si un proceso sufre una pausa prolongada de Garbage Collection (GC) o latencia de red, su lock puede vencer en el servidor mientras el proceso cree que todavía lo tiene. Al despertar, podría escribir datos corruptos pisando al nuevo dueño legítimo del lock.
        </p>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Key className="h-4 w-4 text-primary" />
            <span>Garantía de Secuencia Monótona (Consenso Distribuido)</span>
          </div>
          <p>
            Caerus genera un <strong>Fencing Token</strong>: un número entero estrictamente incremental (otorgado mediante consenso distribuido garantizado) junto a cada adquisición exitosa. Al escribir en tu base de datos o almacenamiento, verificas que el token sea mayor al último aceptado; si el proceso se quedó dormido, su token viejo será rechazado inmediatamente.
          </p>
        </div>
      </section>

      {/* Detección de Deadlocks */}
      <section id="deadlocks" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Detección y Resolución Automática de Deadlocks
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Cuando múltiples microservicios adquieren recursos en distinto orden (e.g. Worker A tiene el Recurso 1 y espera el Recurso 2, mientras Worker B tiene el Recurso 2 y espera el Recurso 1), se produce un <strong>bloqueo mutuo o Deadlock</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          El motor de Caerus mantiene un grafo dirigido de dependencias (<em>Wait-For Graph</em>). En cuanto detecta un ciclo cerrado, aplica automáticamente la resolución configurada: aborta a la <strong>víctima</strong> (el proceso con menor prioridad o menor antigüedad en la transacción) y emite un evento/webhook para que los demás puedan continuar.
        </p>
      </section>

      {/* Ejemplo de Código */}
      <section id="codigo" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Ejemplo de Uso con el SDK
        </h2>

        <CodeBlock
          showLineNumbers
          snippets={{
            typescript: {
              language: "typescript",
              title: "dls-worker.ts",
              label: "TypeScript",
              code: `import { Dls } from '@caerus-dev/sdk';

const dls = new Dls.DlsClient({
  apiKey: process.env.CAERUS_API_KEY!,
});

// withTransaction orquesta la transacción, heartbeat automático y liberación en finally
await dls.withTransaction(async (tx) => {
  // Adquirir lock exclusivo con Fencing Token
  const lock = await tx.acquireLock(
    'billing-jobs',
    'monthly-billing-job',
    'EXCLUSIVE',
    { timeoutMs: 10000 }
  );

  console.log('Lock adquirido. Fencing Token:', lock.fencingToken);

  // Ejecutar tarea crítica pasando el fencing token
  await procesarFacturacion({
    fencingToken: lock.fencingToken,
  });
}, { timeoutMs: 15000 });`,
            },
            java: {
              language: "java",
              title: "BillingJob.java",
              label: "Java",
              code: `import dev.caerus.dls.DlsClient;
import dev.caerus.dls.DlsClientOptions;
import dev.caerus.dls.model.*;

DlsClient client = new DlsClient(DlsClientOptions.builder()
    .apiKey(System.getenv("CAERUS_API_KEY"))
    .build());

// withTransaction gestiona transacción, heartbeat y liberación
String resultado = client.withTransaction(tx -> {
    // Adquirir lock exclusivo con Fencing Token
    LockHolder lock = tx.acquireLock(
        "billing-jobs",
        "monthly-billing-job",
        LockMode.EXCLUSIVE,
        AcquireLockOptions.builder()
            .timeoutMs(10_000L)
            .build()
    );

    long fencingToken = lock.fencingToken().getAsLong();
    System.out.println("Lock adquirido. Fencing Token: " + fencingToken);

    // Ejecutar tarea crítica pasando el fencing token
    return procesarFacturacion(fencingToken);
}, TransactionOptions.builder()
    .timeoutMs(15_000L)
    .build());`,
            },
            go: {
              language: "go",
              title: "billing_job.go",
              label: "Go",
              code: `package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/caerus-dev/caerus-sdk-go/dls"
)

func main() {
	ctx := context.Background()
	locks, err := dls.NewClient(dls.ClientOptions{
		APIKey: os.Getenv("CAERUS_API_KEY"),
	})
	if err != nil {
		panic(err)
	}
	defer locks.Close()

	// WithTransaction orquesta la transacción, heartbeat automático y libera todos los locks al salir
	err = locks.WithTransaction(ctx, func(ctx context.Context, tx dls.Tx) error {
		// Adquirir lock exclusivo con Fencing Token
		lock, err := tx.AcquireLock(ctx, "billing-jobs", "monthly-billing-job", dls.Exclusive, &dls.AcquireLockOptions{
			Timeout: 10 * time.Second,
		})
		if err != nil {
			return err
		}

		fmt.Println("Lock adquirido. Fencing Token:", lock.FencingToken)

		// Ejecutar tarea crítica pasando el fencing token
		return procesarFacturacion(ctx, lock.FencingToken)
	}, &dls.TransactionOptions{Timeout: 15 * time.Second})
	if err != nil {
		panic(err)
	}
}`,
            },
          }}
        />
      </section>

      {/* Enlace a la Especificación gRPC / Proto */}
      <div className="rounded-xl border border-purple-500/30 bg-muted/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-sm text-foreground">Especificación gRPC de bajo nivel</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Consulta los contratos <code>proto3</code> completos de <code>BeginTransaction</code>, <code>AcquireLock</code> (server streaming), <code>ReleaseLock</code> y <code>GetTransactionStatus</code> en Python, Rust, C#, Ruby o cualquier otro lenguaje.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 border-purple-500/30 text-purple-500 hover:bg-purple-500/10 text-xs shrink-0">
          <Link href="/docs/proto#dls-service">
            <span>Ver Contratos Protobuf</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Enlace a Recursos de Práctica */}
      <section id="recursos-practica" className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-transparent p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-500" />
          <h3 className="text-base font-semibold text-foreground">¿Listo para probar el motor DLS?</h3>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Simula locks distribuidos, transacciones cruzadas y resolución de deadlocks directamente en el <strong>Playground interactivo</strong> o clona el proyecto de microservicios de referencia en GitHub.
        </p>
        <div className="pt-2 flex flex-wrap gap-2">
          <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs">
            <Link href="/docs/playground">
              <Sparkles className="h-4 w-4" />
              <span>Abrir Playground en Vivo</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="gap-2 text-xs bg-background/50">
            <Link href="/docs/dls/demo">
              <span>Ver Quickstart & Sample (Locks)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </DocsPageLayout>
  )
}
