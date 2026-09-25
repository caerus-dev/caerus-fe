import Link from "next/link"
import {
  LayoutDashboard,
  Layers,
  Lock,
  Key,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Copy,
  Plus,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shuffle,
  ShieldAlert,
  FolderTree,
} from "lucide-react"
import { DocsPageLayout } from "@/components/docs/docs-page-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tocItems = [
  { id: "jerarquia", title: "Flujo de Trabajo y Jerarquía" },
  { id: "crear-aplicacion", title: "Creación de una Aplicación" },
  { id: "entornos", title: "Gestión y Aislamiento de Entornos" },
  { id: "templates-sre", title: "Plantillas de Recursos (SRE)" },
  { id: "opciones-sre", title: "Opciones de Configuración SRE" },
  { id: "templates-dls", title: "Plantillas de Bloqueos (DLS)" },
  { id: "opciones-dls", title: "Opciones de Configuración DLS" },
  { id: "api-keys", title: "Credenciales y API Keys" },
  { id: "operacion", title: "Herramientas de Operación y Control" },
]

export default function DocsDashboardPage() {
  return (
    <DocsPageLayout
      breadcrumbs={[
        { label: "Comenzando", href: "/docs" },
        { label: "Consola Web & Dashboard" },
      ]}
      title="Guía de la Consola Web y Configuración"
      badge="Guía UI"
      description="Aprende a navegar el panel de control de Caerus: cómo crear aplicaciones, configurar entornos aislados, definir plantillas de concurrencia y qué impacto tiene cada opción en tus flujos de producción."
      tocItems={tocItems}
    >
      {/* Jerarquía */}
      <section id="jerarquia" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Flujo de Trabajo y Jerarquía
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Antes de escribir una sola línea de código en tu aplicación o microservicio, la Consola Web te permite modelar la arquitectura de concurrencia de forma visual y declarativa.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Caerus organiza tus recursos a través de una jerarquía de cuatro niveles:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              <h3 className="font-semibold text-sm text-foreground">Aplicación (Tenant)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Es el contenedor principal de un proyecto o sistema (por ejemplo, <em>"Ticketera Cine"</em> o <em>"Plataforma E-commerce"</em>). Agrupa todos sus entornos, colaboradores y facturación.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
              <h3 className="font-semibold text-sm text-foreground">Entornos (Environments)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instancias lógicas completamente aisladas (ej: <code>dev</code>, <code>staging</code>, <code>production</code>). Cada entorno cuenta con API Keys, recursos y locks aislados de forma independiente sin interferencia entre sí.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
              <h3 className="font-semibold text-sm text-foreground">Plantillas (Templates)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Contratos de configuración estáticos que definen las reglas del juego: tiempo de expiración (TTL), políticas de conflicto (rechazo vs cola), idempotencia y detección de deadlocks.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">4</span>
              <h3 className="font-semibold text-sm text-foreground">Instancias en Tiempo Real</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los recursos reales creados en tiempo de ejecución (la butaca <code>D4</code>, el turno médico de las 14:00 o el lock sobre <code>user_wallet_99</code>) que heredan las reglas de su plantilla asociada.
            </p>
          </div>
        </div>
      </section>

      {/* Crear Aplicación */}
      <section id="crear-aplicacion" className="space-y-4 pt-8 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Creación de una Aplicación
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Para crear una nueva aplicación, dirígete al menú principal del panel y haz clic en <strong>"Nueva Aplicación"</strong> (o accede a <code>/dashboard/applications/new</code>).
        </p>

        <div className="space-y-4 my-4">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>Campos requeridos en el alta</span>
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <strong>Nombre de la Aplicación:</strong> Nombre representativo de tu proyecto (ej: <code>MercadoTicket</code>, <code>Fintech Gateway</code>).
              </li>
              <li>
                <strong>Descripción (Opcional):</strong> Resumen del propósito o contexto de la aplicación para tu equipo.
              </li>
              <li>
                <strong>Selección de Entornos Iniciales:</strong> Puedes marcar los entornos que se crearán automáticamente (<code>dev</code> viene seleccionado por defecto; también puedes marcar <code>stage</code> y <code>prod</code>).
              </li>
              <li>
                <strong>Método de Pago:</strong> Si tu plan requiere una tarjeta registrada en Stripe, la consola te mostrará el modal seguro de suscripción antes de confirmar la creación.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Entornos */}
      <section id="entornos" className="space-y-4 pt-8 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Gestión y Aislamiento de Entornos
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Cada entorno representa un ciclo de despliegue con <strong>aislamiento criptográfico y de almacenamiento absoluto</strong>: una reserva efectuada en <code>dev</code> jamás colisionará ni consumirá stock de <code>production</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Configuración y Colores</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Desde <strong>Configuración de la Aplicación</strong> (<code>/dashboard/applications/[id]/settings</code>), puedes agregar nuevos entornos (por ejemplo, <code>qa</code>, <code>local</code> o <code>canary</code>) y asignarles una etiqueta de color (<em>Slate, Blue, Emerald, Amber, Rose, Purple</em>) para identificarlos de inmediato en la barra superior del Dashboard.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Pausa y Deshabilitación</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cada entorno cuenta con un interruptor de activación. Al deshabilitar un entorno temporalmente, todos los endpoints y llamadas gRPC hacia ese entorno son bloqueados de inmediato, lo que resulta útil durante ventanas de mantenimiento preventivo.
            </p>
          </div>
        </div>
      </section>

      {/* Templates SRE */}
      <section id="templates-sre" className="space-y-4 pt-8 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
            SRE Engine
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">Shared Resource Templates</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Plantillas de Recursos Compartidos (SRE)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Las plantillas SRE controlan el ciclo de vida del inventario en tiempo real (butacas, turnos, stock de flash sales). Para crear una plantilla, ingresa a tu aplicación, selecciona la pestaña <strong>"Recursos"</strong> y haz clic en <strong>"Nuevo Recurso"</strong>.
        </p>

        {/* Opciones SRE */}
        <div id="opciones-sre" className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <span>Explicación Detallada de Opciones del Formulario SRE</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Nombre (name)</span>
                <Badge variant="secondary" className="text-[10px] font-mono">Identificador</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Identificador alfanumérico único en minúsculas y guiones bajos (ej: <code>asientos_vip</code>, <code>entradas_campo</code>). Es el valor que luego pasarás al SDK o a los métodos gRPC en el campo <code>template_name</code>.
              </p>
            </div>

            {/* Modo */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Modo (Unitario vs Pooled)</span>
                <Badge variant="secondary" className="text-[10px] font-mono">Tipo de Stock</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Unitario:</strong> Existe exactamente 1 unidad atómica (ej: butaca <code>D9</code>, turno de las 10:00).<br />
                <strong>Pooled (Múltiple):</strong> Existe un cupo de N unidades fungibles e intercambiables (ej: 50 entradas generales, 200 items de inventario).
              </p>
            </div>

            {/* TTL */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">TTL por Defecto (Segundos)</span>
                <Badge variant="secondary" className="text-[10px] font-mono">Temporizador</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tiempo de vida de la reserva temporal (ej: <code>300</code> segundos = 5 minutos). Si el cliente toma un recurso con <code>take()</code> pero no lo confirma antes de este límite (o si la pestaña se cierra), el motor <strong>libera automáticamente el cupo</strong> devolviéndolo al inventario sin intervención manual.
              </p>
            </div>

            {/* Idempotencia */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Exigir Idempotencia</span>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">Switch</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Al activarlo, cualquier llamada a <code>take()</code> debe incluir obligatoriamente un <code>idempotency_key</code>. Si la conexión de red vacila y el cliente reintenta, Caerus detecta la clave y responde con la misma reserva en curso en lugar de cobrar dos veces o reservar dos asientos.
              </p>
            </div>

            {/* Guardar Metadata */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Guardar Metadata</span>
                <Badge variant="outline" className="text-[10px] font-mono">Switch</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si está activado, la metadata JSON enviada en las operaciones <code>take()</code> y <code>confirm()</code> se persiste permanentemente en la base de datos para trazabilidad, auditoría o recuperación de carritos abandonados.
              </p>
            </div>

            {/* Estrategias de Conflicto */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Estrategia de Resolución de Conflicto</span>
                <Badge variant="secondary" className="text-[10px] font-mono">FAIL | QUEUE | RETRY</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>FAIL</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Si el recurso no tiene disponibilidad, la petición es rechazada de inmediato con <code>ConflictError</code>. Ideal para selección de butacas en mapa de sala.
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-emerald-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>QUEUE</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Las peticiones en exceso ingresan en una fila FIFO de espera. Cuando un usuario desiste o su TTL expira, el motor le asigna el recurso al siguiente de la cola automáticamente.
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>RETRY</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    El motor reintenta la adquisición internamente. Habilita configurar el <strong>Intervalo de Reintento</strong> (1 a 10 seg) y el <strong>Máximo de Intentos</strong> (1 a 5).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates DLS */}
      <section id="templates-dls" className="space-y-4 pt-8 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
            DLS Engine
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">Distributed Lock Templates</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Plantillas de Bloqueos Distribuidos (DLS)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Las plantillas DLS definen el comportamiento de exclusión mutua para microservicios concurrentes (procesamiento de pagos, sincronización de inventario con ERPs, workers de facturación periódica). Para configurarlas, haz clic en la pestaña <strong>"Locks"</strong> y selecciona <strong>"Nuevo Lock"</strong>.
        </p>

        {/* Opciones DLS */}
        <div id="opciones-dls" className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-500" />
            <span>Explicación Detallada de Opciones del Formulario DLS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Namespace */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Namespace</span>
                <Badge variant="secondary" className="text-[10px] font-mono">Agrupador</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nombre de la categoría de bloqueos (ej: <code>facturacion_mensual</code>, <code>migracion_cuentas</code>). Permite segmentar el espacio de nombres para que distintas partes de tu sistema no colisionen.
              </p>
            </div>

            {/* Tipo de Lock */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Tipo de Bloqueo</span>
                <Badge variant="secondary" className="text-[10px] font-mono">EXCLUSIVE vs READ_WRITE</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>EXCLUSIVE:</strong> Exclusión mutua total. Solo 1 proceso puede retener el lock a la vez.<br />
                <strong>READ_WRITE:</strong> Permite múltiples procesos leyendo en simultáneo (<code>SHARED_READ</code>), pero exige exclusión absoluta cuando un worker solicita escribir (<code>EXCLUSIVE</code>).
              </p>
            </div>

            {/* Fencing Token */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Exigir Fencing Token</span>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-500/30 text-purple-500">Recomendado</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Genera un número de versión monotónico creciente con cada adquisición respaldado por consenso estricto. Protege a tu base de datos contra workers "zombies" demorados por recolección de basura o pausas de red (Split-Brain).
              </p>
            </div>

            {/* Estrategia de Deadlock */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Resolución de Deadlocks</span>
                <Badge variant="secondary" className="text-[10px] font-mono">ALERT vs KILL_PRIORITY</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>ALERT:</strong> Detecta ciclos en el grafo de dependencias y despacha un evento/alerta para inspección sin detener la ejecución.<br />
                <strong>KILL_PRIORITY:</strong> Aborta automáticamente la transacción más joven involucrada en el ciclo para destrabar el cuello de botella de forma inmediata.
              </p>
            </div>

            {/* Estrategia de Adquisición */}
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm text-foreground">Estrategia de Adquisición de Lock</span>
                <Badge variant="secondary" className="text-[10px] font-mono">FAIL | QUEUE | RETRY</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Define qué ocurre si un worker intenta bloquear una clave que ya está ocupada:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-foreground">FAIL</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Retorna rechazo inmediato sin esperas ni reintentos.
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-purple-500">QUEUE</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    El cliente espera de forma reactiva mediante <em>Server Streaming gRPC</em> hasta que el lock quede libre.
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1">
                  <span className="font-bold text-xs text-amber-500">RETRY</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Reintenta activamente cada N milisegundos hasta agotar el número de intentos configurado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Keys */}
      <section id="api-keys" className="space-y-4 pt-8 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Credenciales y API Keys
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Para que tu código se comunique con Caerus, necesitas una <strong>API Key</strong> vinculada al entorno en el que deseas operar.
        </p>

        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-5">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span>Buenas prácticas de manejo de credenciales</span>
          </h4>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>Generación por entorno:</strong> Cada API Key pertenece estrictamente a una aplicación y a un entorno específico (por ejemplo, <code>caerus_live_...</code> o <code>caerus_dev_...</code>).
            </li>
            <li>
              <strong>Visualización única:</strong> Por motivos de seguridad, la clave secreta completa se muestra <strong>una única vez</strong> al momento de su creación. Asegúrate de copiarla y guardarla en tu gestor de secretos o archivo <code>.env.local</code>.
            </li>
            <li>
              <strong>Revocación en caliente:</strong> Si una clave se ve comprometida, puedes revocarla desde la consola web con un solo clic sin afectar al resto de las claves ni a los demás entornos.
            </li>
          </ul>
        </div>
      </section>

      {/* Herramientas de Operación */}
      <section id="operacion" className="space-y-4 pt-8 border-t border-border/40">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
          Herramientas de Operación y Control
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          El panel de control incluye utilidades avanzadas para acelerar el desarrollo y auditar el comportamiento de tus recursos:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Copy className="h-4 w-4 text-blue-500" />
                <span>Duplicar Plantillas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              ¿Terminaste de configurar tus plantillas en <code>dev</code>? Con la opción <strong>"Duplicar a otro entorno"</strong> puedes clonar toda la configuración hacia <code>staging</code> o <code>production</code> con un clic, eliminando errores de transcripción manual.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Control Manual</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              La pestaña <strong>"Control Manual"</strong> te permite probar reservas en vivo (crear recursos, simular operaciones <code>take</code> y <code>release</code>) directamente desde el navegador para validar tus plantillas sin requerir código cliente.
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Webhooks &amp; Métricas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
              Suscribe endpoints HTTP para recibir notificaciones en tiempo real cuando un recurso expire o sea confirmado, y visualiza gráficos de throughput, latencia y uso en la pestaña <strong>"Métricas"</strong>.
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/20 mt-6 flex-wrap gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">¿Listo para conectar tu código?</h4>
            <p className="text-xs text-muted-foreground">Una vez creadas tus plantillas y API Keys, consulta la guía de inicio rápido con el SDK oficial.</p>
          </div>
          <Button asChild size="sm" className="gap-2 text-xs shrink-0">
            <Link href="/docs/sdk">
              <span>Ver Guía del SDK</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </DocsPageLayout>
  )
}
