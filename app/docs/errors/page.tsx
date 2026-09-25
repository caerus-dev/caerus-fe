import Link from "next/link"
import { AlertCircle, ShieldAlert, CheckCircle2, Terminal, HelpCircle } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock } from "@/components/docs/code-block"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const tocItems = [
  { id: "catalogo", title: "Catálogo de Excepciones del SDK" },
  { id: "conflict-error", title: "ConflictError (409)" },
  { id: "validation-error", title: "ValidationError (Idempotencia)" },
  { id: "resource-not-found-error", title: "ResourceNotFoundError (404)" },
  { id: "troubleshooting", title: "Troubleshooting de Conexión" },
]

export default function DocsErrorsPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "Referencia", href: "/docs/errors" },
        { label: "Catálogo de Errores" },
      ]}
      title="Errores y Troubleshooting"
      badge="Reference Guide"
      description="Guía exhaustiva de clases de error tipadas en @caerus-dev/sdk, códigos de estado gRPC/HTTP asociados y estrategias recomendadas de mitigación."
      tocItems={tocItems}
    >
      {/* Catálogo */}
      <section id="catalogo" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Catálogo de Excepciones del SDK
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El SDK mapea las respuestas binarias de error de gRPC a clases de excepción estándar de JavaScript / TypeScript:
        </p>

        <div className="border border-border/70 rounded-xl overflow-hidden my-4">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow>
                <TableHead className="w-[180px]">Clase de Error</TableHead>
                <TableHead className="w-[110px]">Código gRPC</TableHead>
                <TableHead>Causa Principal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              <TableRow>
                <TableCell className="font-mono font-semibold text-red-500">ConflictError</TableCell>
                <TableCell className="font-mono">FAILED_PRECONDITION / 409</TableCell>
                <TableCell>El recurso ya está retenido por otro usuario o sin stock disponible.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold text-amber-500">ValidationError</TableCell>
                <TableCell className="font-mono">INVALID_ARGUMENT</TableCell>
                <TableCell>La plantilla exige clave de idempotencia (<code>reason === &apos;IDEMPOTENCY_KEY_REQUIRED&apos;</code>) o los parámetros son inválidos.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold text-blue-500">ResourceNotFoundError</TableCell>
                <TableCell className="font-mono">NOT_FOUND / 404</TableCell>
                <TableCell>El recurso, plantilla o holder especificado no existe o fue borrado lógicamente.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold text-purple-500">AuthenticationError</TableCell>
                <TableCell className="font-mono">UNAUTHENTICATED</TableCell>
                <TableCell>API Key inválida, revocada o no correspondiente al entorno.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-semibold text-foreground">TimeoutError</TableCell>
                <TableCell className="font-mono">DEADLINE_EXCEEDED</TableCell>
                <TableCell>La operación excedió el tiempo límite configurado en <code>timeoutMs</code>.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ConflictError */}
      <section id="conflict-error" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Manejo de <code>ConflictError</code>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Ocurre cuando intentas un <code>take()</code> sobre un recurso unitario ya tomado o cuando un recurso con cupo no tiene saldo suficiente:
        </p>

        <CodeBlock
          language="typescript"
          title="manejo-conflicto.ts"
          code={`import { ConflictError } from '@caerus-dev/sdk';

try {
  const holder = await caerus.unitary('butaca_A1').take();
  // Continuar flujo de compra
} catch (error) {
  if (error instanceof ConflictError) {
    console.warn('Asiento ocupado:', error.message);
    // Informar amistosamente al frontend para que el usuario elija otra butaca
  } else {
    throw error;
  }
}`}
        />
      </section>

      {/* ValidationError / Idempotencia */}
      <section id="validation-error" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Manejo de <code>ValidationError</code> (Idempotencia)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Ocurre cuando una plantilla tiene activada la opción <strong>Idempotencia</strong> y se envía una solicitud sin <code>idempotencyKey</code> (donde <code>error.reason === &apos;IDEMPOTENCY_KEY_REQUIRED&apos;</code>), o cuando se envían argumentos que no superan las validaciones:
        </p>

        <CodeBlock
          language="typescript"
          title="manejo-idempotencia.ts"
          code={`import { ValidationError } from '@caerus-dev/sdk';

try {
  // Envía siempre una clave idempotente única asociada a la operación del usuario
  const holder = await caerus.unitary('butaca_A1').take({
    idempotencyKey: \`req_\${orderId}\`,
  });
} catch (error) {
  if (error instanceof ValidationError && error.reason === 'IDEMPOTENCY_KEY_REQUIRED') {
    console.error('Clave de idempotencia requerida:', error.message);
  } else {
    throw error;
  }
}`}
        />
      </section>

      {/* ResourceNotFoundError */}
      <section id="resource-not-found-error" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Manejo de <code>ResourceNotFoundError</code> (404)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Se produce cuando el recurso, la plantilla asociada o el <code>holderId</code> no existen en el entorno consultado o fueron eliminados:
        </p>

        <CodeBlock
          language="typescript"
          title="manejo-not-found.ts"
          code={`import { ResourceNotFoundError } from '@caerus-dev/sdk';

try {
  await caerus.confirm(holderId);
} catch (error) {
  if (error instanceof ResourceNotFoundError) {
    console.error('Holder o recurso no encontrado:', error.message);
    // Notificar al cliente que la reserva no existe o ya caducó
  } else {
    throw error;
  }
}`}
        />
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Troubleshooting Frecuente
        </h2>

        <div className="space-y-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              1. "OpenSSL: wrong version number" al conectar localmente
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Causa: El SDK encripta por defecto mediante TLS. Si tu motor local corre en <code>localhost:9090</code> sin certificado SSL, debes especificar <code>tls: false</code> en las opciones del cliente.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              2. "Invalid format in endpoint"
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Causa: Se colocó <code>https://</code> o una ruta (ej: <code>localhost:9090/sre</code>). Caerus utiliza gRPC; el endpoint solo debe tener la forma <code>host:puerto</code> (ej: <code>localhost:9090</code>).
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              3. ¿Por qué mi holder cambió de PENDING a EXPIRED?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Causa: El tiempo de vida otorgado en <code>ttlSeconds</code> transcurrió sin que tu backend llamara a <code>caerus.confirm(holder.id)</code>. El sweeper de Caerus restauró el stock de forma automática.
            </p>
          </div>
        </div>
      </section>
    </DocsPageLayout>
  )
}
