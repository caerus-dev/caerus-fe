import Link from "next/link"
import { Layers, Lock, Server, FileCode, CheckCircle2, ArrowRight, ShieldCheck, Zap, AlertTriangle } from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tocItems = [
  { id: "introduccion", title: "Protocolo gRPC & Protobuf" },
  { id: "sre-service", title: "SharedResourceEngine (SRE)" },
  { id: "sre-inventory", title: "SRE: Gestión de Inventario" },
  { id: "sre-transactions", title: "SRE: Operaciones de Reserva" },
  { id: "sre-queries", title: "SRE: Consultas de Estado" },
  { id: "dls-service", title: "DistributedLockingEngine (DLS)" },
  { id: "dls-transactions", title: "DLS: Sesiones Transaccionales" },
  { id: "dls-locking", title: "DLS: Adquisición y Streaming" },
  { id: "dls-observability", title: "DLS: Inspección y Estado" },
  { id: "codigos-error", title: "Mapeo de Errores gRPC" },
]

export default function DocsProtoPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "Referencia", href: "/docs/proto" },
        { label: "Contratos gRPC & Protobuf" },
      ]}
      title="Especificación de Servicios gRPC (Protobuf)"
      badge="Core Protocol"
      description="Referencia exhaustiva y agnóstica al lenguaje de programación de los contratos Protocol Buffers (proto3) que definen la API de transporte de alto rendimiento de Caerus."
      tocItems={tocItems}
    >
      {/* Introducción */}
      <section id="introduccion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Protocolo gRPC &amp; Protobuf
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Toda la comunicación de alto rendimiento de Caerus opera bajo el protocolo <strong>gRPC sobre HTTP/2</strong> con serialización binaria <strong>Protocol Buffers v3 (proto3)</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Esta especificación describe los métodos RPC, sus parámetros de entrada, mensajes de respuesta y comportamientos semánticos de forma completamente independiente de si utilizas nuestro SDK en TypeScript/Node.js o clientes generados en <strong>Go, Python, Java, C#, Rust o C++</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                <Layers className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-xs sm:text-sm break-all">caerus.sre.v1.SharedResourceEngine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Motor de inventario transaccional para recursos limitados, reservas temporales bajo TTL, extensiones y confirmación permanente de adquisiciones.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                <Lock className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="font-mono text-xs sm:text-sm break-all">caerus.dls.v1.DistributedLockingEngine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Coordinación distribuida con exclusión mutua estricta, bloqueos de lectura/escritura (Read-Write), transacciones con timeout y Fencing Tokens monotónicos respaldados por consenso.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SRE Service */}
      <section id="sre-service" className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
            SRE Service
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">package caerus.sre.v1</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Servicio SharedResourceEngine
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El servicio SRE gestiona el inventario de recursos compartidos (butacas, cupos de inscripción, stock limitado) asegurando atomicidad estricta y evitando cualquier condición de sobreventa (<em>zero overbooking</em>).
        </p>

        {/* SRE: Inventario */}
        <div id="sre-inventory" className="space-y-6 pt-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>1. Gestión de Inventario de Recursos</span>
          </h3>

          {/* CreateResource */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc CreateResource (CreateResourceRequest) returns (ResourceResponse)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Alta de Inventario</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Registra un nuevo recurso dentro de un entorno de aplicación asociado a una plantilla existente (<code>template_name</code>). Define la cantidad inicial de unidades disponibles y opcionalmente un grupo y metadata JSON arbitraria.
            </p>

            <CodeBlock
              language="protobuf"
              title="sre_service.proto"
              wrap={true}
              code={`message CreateResourceRequest {
  // Plantilla (define TTL, idempotencia y estrategia de conflicto)
  string template_name = 1;
  // Identificador único del recurso (ej: "seat_J4", "curso_react_2026")
  string key = 2;
  // Cantidad inicial (1 para Unitarios, N para Pooled)
  int32 available_amount = 3;
  // Clave de agrupación opcional (ej: "fila_J", "sala_1")
  optional string group_key = 4;
  // Metadata arbitraria en formato JSON string
  optional string metadata = 5;
}`}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Comportamiento semántico:</strong> Si el recurso ya existe con esa misma <code>key</code> en el entorno, responde con error <code>ALREADY_EXISTS (409)</code>.</p>
            </div>
          </div>

          {/* UpdateResource */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc UpdateResource (UpdateResourceRequest) returns (ResourceResponse)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Ajuste de Stock</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modifica la disponibilidad de un recurso existente sumando o restando unidades mediante un delta atómico (<code>delta_amount</code>). Permite reponer stock (+10) o dar de baja mercadería (-2) sin pisar reservas en curso.
            </p>

            <CodeBlock
              language="protobuf"
              title="sre_service.proto"
              wrap={true}
              code={`message UpdateResourceRequest {
  // Clave del recurso a modificar
  string resource_key = 1;
  // Incremento (+) o decremento (-) de inventario
  int32 delta_amount = 2;
  // Actualiza el grupo si se proporciona
  optional string group_key = 3;
  // Actualiza o fusiona la metadata JSON
  optional string metadata = 4;
  // Clave para evitar ajustes duplicados en reintentos
  optional string idempotency_key = 5;
}`}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Precondición:</strong> Si el decremento provocaría que <code>available_amount &lt; 0</code>, la operación es rechazada de forma atómica con <code>FAILED_PRECONDITION</code> sin alterar el inventario.</p>
            </div>
          </div>

          {/* DeleteResource */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc DeleteResource (DeleteResourceRequest) returns (google.protobuf.Empty)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Baja de Recurso</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Elimina el recurso del inventario activo. Si tiene reservas pendientes (<code>PENDING</code>), estas se invalidan o expiran según la configuración del template.
            </p>
          </div>
        </div>

        {/* SRE: Transaccionales */}
        <div id="sre-transactions" className="space-y-6 pt-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>2. Operaciones de Reserva y Ciclo de Vida</span>
          </h3>

          {/* Take */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc Take (TakeRequest) returns (ResourceHolderResponse)
              </h4>
              <Badge className="bg-emerald-500/15 text-emerald-500 text-[11px] font-mono shrink-0">Operación Crítica</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aparta temporalmente la cantidad de unidades solicitadas (<code>amount</code>) y crea un <strong>ResourceHolder</strong> en estado <code>PENDING</code> (o <code>QUEUED</code> si la plantilla implementa cola de espera).
            </p>

            <CodeBlock
              language="protobuf"
              title="sre_service.proto"
              wrap={true}
              code={`message TakeRequest {
  // Clave del recurso
  string resource_key = 1;
  // Unidades a reservar (1 para Unitarios)
  int32 amount = 2;
  TakeOptionalSettings settings = 3;
}

message TakeOptionalSettings {
  // Garantiza que peticiones repetidas devuelvan el mismo holder
  optional string idempotency_key = 1;
  // Sobrescribe el TTL de la plantilla (ej: 180 segundos)
  optional int32 custom_ttl_seconds = 2;
  // JSON string con datos de la sesión o comprador
  optional string metadata = 3;
}`}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Retorno:</strong> Devuelve un <code>ResourceHolderResponse</code> con el <code>holder_id</code> único, la marca de tiempo de expiración absoluta <code>expires_at</code> (en milisegundos de época) y el estado <code>PENDING</code>.</p>
              <p><strong>Errores:</strong> Si el recurso no tiene saldo o ya está tomado bajo estrategia <code>FAIL</code>, devuelve <code>FAILED_PRECONDITION (409)</code>.</p>
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc Confirm (ConfirmRequest) returns (ResourceHolderResponse)
              </h4>
              <Badge className="bg-blue-500/15 text-blue-500 text-[11px] font-mono shrink-0">Consolidación</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Consolida la adquisición de forma definitiva una vez que el flujo de negocio externo (por ejemplo, el cobro en una pasarela de pago) concluyó con éxito. Pasa el estado del holder a <code>CONFIRMED</code> y cancela el temporizador de expiración por TTL.
            </p>

            <CodeBlock
              language="protobuf"
              title="sre_service.proto"
              wrap={true}
              code={`message ConfirmRequest {
  // ID del holder emitido por Take
  string resource_holder_id = 1;
  // Opcional: datos finales a adjuntar (ej: {"paymentId": "ch_3M..."})
  optional string metadata_patch = 2;
}`}
            />
          </div>

          {/* Release */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc Release (ReleaseRequest) returns (google.protobuf.Empty)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Cancelación Temprana</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Libera anticipadamente el recurso cuando el usuario desiste de la compra o el pago falla, reintegrando las unidades al inventario inmediatamente sin necesidad de esperar a que expire el TTL.
            </p>
          </div>

          {/* Extend */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc Extend (ExtendRequest) returns (ResourceHolderResponse)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Prórroga de TTL</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Otorga tiempo adicional (<code>extra_ms</code>) a una reserva en curso en caso de que el cliente requiera más tiempo para completar un formulario o verificación biométrica.
            </p>
          </div>
        </div>

        {/* SRE: Queries */}
        <div id="sre-queries" className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileCode className="h-4 w-4 text-primary shrink-0" />
            <span>3. Métodos de Consulta e Inspección</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-primary">GetResource</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetResourceRequest</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consulta disponibilidad en tiempo real (<code>available_amount</code>), cantidad de reservas en progreso (<code>pending_count</code>) y metadata.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-primary">GetResourcesByGroupKey</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetResourcesByGroupKeyRequest</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Devuelve listado paginado (<code>resources</code> y bandera <code>next_page</code>) de todos los recursos agrupados bajo un mismo <code>group_key</code>.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-primary">GetResourceHolder</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetResourceHolderRequest</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consulta el estado de una reserva por su ID: <code>PENDING</code>, <code>CONFIRMED</code>, <code>RELEASED</code>, <code>QUEUED</code> o <code>EXPIRED</code>.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-primary">GetResourceHoldersList</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetResourceHoldersListRequest</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Listado paginado de holders históricos y activos, filtrables por clave de recurso, estado y orden cronológico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DLS Service */}
      <section id="dls-service" className="space-y-4 pt-10 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
            DLS Service
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">package caerus.dls.v1</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Servicio DistributedLockingEngine
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El servicio DLS proporciona coordinación de procesos distribuidos para asegurar que secciones críticas de código no sufran condiciones de carrera ni inconsistencias por particiones de red o <em>split-brain</em>.
        </p>

        {/* DLS: Transacciones */}
        <div id="dls-transactions" className="space-y-6 pt-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-500 shrink-0" />
            <span>1. Sesiones Transaccionales</span>
          </h3>

          {/* BeginTransaction */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc BeginTransaction (BeginTransactionRequest) returns (BeginTransactionResponse)
              </h4>
              <Badge className="bg-purple-500/15 text-purple-500 text-[11px] font-mono shrink-0">Inicio de Sesión</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inicia una transacción de bloqueo y devuelve un identificador único (<code>transaction_id</code>). Todos los locks que un proceso adquiera durante una operación atómica se asocian a este identificador.
            </p>

            <CodeBlock
              language="protobuf"
              title="dls_service.proto"
              wrap={true}
              code={`message BeginTransactionRequest {
  // Tiempo de expiración de seguridad de la transacción (ms)
  optional int64 timeout_ms = 1;
}

message BeginTransactionResponse {
  // ID de correlación generado para asociar los locks
  string transaction_id = 1;
}`}
            />
          </div>

          {/* RenewTransaction */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc RenewTransaction (RenewTransactionRequest) returns (RenewTransactionResponse)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Heartbeat TTL</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Extiende el tiempo límite de vida (<code>extra_ms</code>) de una transacción en ejecución si el proceso que la opera detecta que la sección crítica requiere más tiempo de procesamiento.
            </p>
          </div>

          {/* ReleaseTransactionLocks */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc ReleaseTransactionLocks (ReleaseTransactionLocksRequest) returns (google.protobuf.Empty)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Limpieza Atómica</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Libera atómicamente todos los locks asociados a una transacción. Permite en una sola llamada de red desbloquear múltiples recursos tomados durante el flujo de trabajo.
            </p>
          </div>
        </div>

        {/* DLS: Adquisición */}
        <div id="dls-locking" className="space-y-6 pt-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500 shrink-0" />
            <span>2. Adquisición y Streaming de Bloqueos</span>
          </h3>

          {/* AcquireLock */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc AcquireLock (AcquireLockRequest) returns (stream AcquireLockResponse)
              </h4>
              <Badge className="bg-purple-500/15 text-purple-500 text-[11px] font-mono shrink-0">Server Streaming</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Solicita el bloqueo sobre una clave dinámica (<code>lock_key</code>) dentro de un <code>namespace</code>. Utiliza <strong>Server Streaming</strong> para manejar esperas sin bloquear hilos de ejecución:
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Si el lock está ocupado y la plantilla admite espera, el servidor emite eventos <code>QUEUED</code> periódicos como keep-alive para evitar desconexiones por timeout en proxies o firewalls.</li>
              <li>Al liberarse el recurso, emite un evento terminal <code>ACQUIRED</code> y cierra el stream.</li>
              <li>Si se agota el tiempo o la política es rechazo inmediato, emite un evento <code>DENIED</code> y finaliza.</li>
            </ul>

            <CodeBlock
              language="protobuf"
              title="dls_service.proto"
              wrap={true}
              code={`enum LockMode {
  MODE_UNSPECIFIED = 0;
  // Exclusión mutua estricta (solo 1 proceso a la vez)
  EXCLUSIVE = 1;
  // Bloqueo compartido de lectura (múltiples lectores)
  SHARED_READ = 2;
}

message AcquireLockRequest {
  // Plantilla de lock configurada en el dashboard
  string namespace = 1;
  // Identificador del recurso bloqueado (ej: "wallet_user_8821")
  string lock_key = 2;
  optional string idempotency_key = 3;
  // EXCLUSIVE o SHARED_READ
  optional LockMode requested_mode = 5;
  // ID devuelto por BeginTransaction
  string transaction_id = 6;
}

message AcquireLockResponse {
  // ID asignado a la reserva de lock
  string lock_id = 1;
  // Fencing Token monotónicamente creciente
  int64 fencing_token = 2;
  // Estado: ACQUIRED, DENIED o QUEUED
  LockStatus status = 3;
}`}
            />

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <strong>Fencing Token:</strong> El valor <code>fencing_token</code> se incrementa estrictamente con cada adquisición. Los procesos deben enviar este token a las bases de datos o servicios de almacenamiento secundarios para descartar escrituras tardías de workers demorados por recolección de basura o pausas de red (prevención contra split-brain).
            </div>
          </div>

          {/* ReleaseLock */}
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-words">
                rpc ReleaseLock (ReleaseLockRequest) returns (google.protobuf.Empty)
              </h4>
              <Badge variant="secondary" className="text-[11px] font-mono shrink-0">Liberación Puntual</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Libera un lock individual identificado por su <code>lock_id</code> y vinculado a su <code>transaction_id</code>, permitiendo a los procesos en espera encolados adquirir el recurso de inmediato.
            </p>
          </div>
        </div>

        {/* DLS: Observabilidad */}
        <div id="dls-observability" className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-500 shrink-0" />
            <span>3. Inspección y Diagnóstico en Tiempo Real</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-purple-500">GetLockStatus</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetLockStatusResponse</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Indica si el lock está retenido (<code>is_held</code>), el modo actual (<code>EXCLUSIVE</code> o <code>SHARED_READ</code>), la lista de <code>active_holders</code> y la cantidad de procesos en cola (<code>pending_queue_size</code>).
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-purple-500">GetTransactionStatus</span>
                <Badge variant="outline" className="font-mono text-[10px]">GetTransactionStatusResponse</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Informa el estado de la transacción (<code>ACTIVE</code>, <code>ABORTED</code>, etc.), causa de aborto si ocurrió y todos los locks retenidos o en espera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Códigos de Error gRPC */}
      <section id="codigos-error" className="space-y-4 pt-10 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Mapeo Canónico de Códigos de Error gRPC
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Cualquier cliente gRPC (independientemente del lenguaje de desarrollo) recibirá los códigos estándar definidos por la especificación oficial de gRPC:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-amber-500">FAILED_PRECONDITION</span>
              <Badge variant="secondary" className="font-mono text-[11px]">HTTP 409 Conflict</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Recurso unitario ya retenido por otro cliente, o saldo insuficiente para satisfacer la cantidad solicitada en <code>Take</code>.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-blue-500">NOT_FOUND</span>
              <Badge variant="secondary" className="font-mono text-[11px]">HTTP 404 Not Found</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La clave de recurso, el holderId o la plantilla especificada en el namespace no existen o fueron eliminados.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-purple-500">UNAUTHENTICATED</span>
              <Badge variant="secondary" className="font-mono text-[11px]">HTTP 401 Unauthorized</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Falta el metadata header <code>x-api-key</code> o la API key provista es inválida o fue revocada.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-red-500">INVALID_ARGUMENT</span>
              <Badge variant="secondary" className="font-mono text-[11px]">HTTP 400 Bad Request</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Se omitió una clave de idempotencia exigida por la plantilla o los valores de cantidad/TTL son negativos o ilegales.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-foreground">DEADLINE_EXCEEDED</span>
              <Badge variant="secondary" className="font-mono text-[11px]">HTTP 504 Gateway Timeout</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La operación excedió el tiempo límite configurado o el timeout de la transacción expiró antes de su confirmación.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/20 mt-6 flex-wrap gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">¿Utilizas TypeScript o Node.js?</h4>
            <p className="text-xs text-muted-foreground">Consulta la guía del SDK oficial con tipado estricto y manejo de excepciones.</p>
          </div>
          <Link href="/docs/sdk" className="shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <span>Guía del SDK</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>
    </DocsPageLayout>
  )
}
