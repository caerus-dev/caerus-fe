"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Book, 
  Code2, 
  Zap, 
  Lock, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Terminal 
} from "lucide-react"

const quickStartCode = {
  install: `npm install @caerus-dev/sdk`,
  init: `import { CaerusClient } from '@caerus-dev/sdk';

const caerus = new CaerusClient({
  apiKey: process.env.CAERUS_API_KEY!,
});`,
  reserve: `// Retener temporalmente un recurso (SRE)
const holder = await caerus.unitary('seat-A1').take({
  ttlSeconds: 300,
  metadata: { userId: 'user_123' }
});

try {
  await processPayment();
  await caerus.confirm(holder.id);
  console.log('Reserva confirmada:', holder.id);
} catch (error) {
  await caerus.release(holder.id);
}`,
  lock: `import { Dls } from '@caerus-dev/sdk';

const client = new Dls.DlsClient({ apiKey: process.env.CAERUS_API_KEY! });
const tx = await client.beginTransaction({ timeoutMs: 5000 });

// Adquirir un distributed lock exclusivo (DLS)
const lock = await client.acquireLock(
  'payment-process',
  'order-456',
  tx.transactionId,
  'EXCLUSIVE'
);

try {
  // Operación crítica con fencing token
  await processPayment(lock.fencingToken);
} finally {
  await client.releaseTransactionLocks(tx.transactionId);
}`,
}

const docSections = [
  {
    id: "getting-started",
    title: "Primeros Pasos",
    description: "Guía rápida para comenzar a usar Caerus",
    icon: <Zap className="w-5 h-5" />,
    items: [
      { title: "Instalación", href: "#quickstart" },
      { title: "Inicialización de la SDK", href: "#quickstart" },
      { title: "Tu Primera Reserva (SRE)", href: "#quickstart" },
      { title: "Tu Primer Distributed Lock (DLS)", href: "#quickstart" },
    ],
  },
  {
    id: "shared-resources",
    title: "Shared Resource Engine (SRE)",
    description: "Gestión de recursos compartidos, cupos y reservas temporales",
    icon: <Layers className="w-5 h-5" />,
    items: [
      { title: "Conceptos Básicos: Unitary vs Pooled", href: "#quickstart" },
      { title: "Retención Temporal (take)", href: "#quickstart" },
      { title: "Confirmación y Liberación (confirm / release)", href: "#quickstart" },
      { title: "Estrategias de Conflicto (Fail, Retry, Queue)", href: "#quickstart" },
      { title: "TTL y Expiración Automática", href: "#quickstart" },
    ],
  },
  {
    id: "distributed-locks",
    title: "Distributed Locking Service (DLS)",
    description: "Locks distribuidos con exclusión mutua para operaciones críticas",
    icon: <Lock className="w-5 h-5" />,
    items: [
      { title: "Conceptos Básicos y Transacciones", href: "#quickstart" },
      { title: "Modos: Exclusive vs Shared Read", href: "#quickstart" },
      { title: "Fencing Tokens contra Split-Brain", href: "#quickstart" },
      { title: "Estrategias: Fail, Retry, Blocking", href: "#quickstart" },
      { title: "Detección Automática de Deadlocks", href: "#quickstart" },
    ],
  },
  {
    id: "api-reference",
    title: "Referencia de SDK & API",
    description: "Métodos disponibles y especificación",
    icon: <Code2 className="w-5 h-5" />,
    items: [
      { title: "Autenticación por API Key", href: "#quickstart" },
      { title: "SRE Client: Métodos y Opciones", href: "#quickstart" },
      { title: "DLS Client: Métodos y Opciones", href: "#quickstart" },
      { title: "Manejo de Errores y Excepciones", href: "#quickstart" },
      { title: "Testing con InMemoryCaerusClient", href: "#quickstart" },
    ],
  },
]

export function DocsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string, key: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(key)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredSections = docSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (section) =>
        section.items.length > 0 ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
          Centro de Documentación
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Book className="w-8 h-8 text-primary" />
          Documentación de Caerus
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed">
          Guías de integración, referencia de la SDK de TypeScript y snippets de código listos para implementar concurrencia distribuida en tus aplicaciones.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en la documentación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-card/60 border-border"
        />
      </div>

      {/* Quick Start Card */}
      <Card id="quickstart" className="border-border bg-card/60 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Terminal className="w-5 h-5 text-primary" />
                Quick Start (@caerus-dev/sdk)
              </CardTitle>
              <CardDescription className="text-sm">
                Snippets esenciales para instalar, configurar y ejecutar operaciones en minutos
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary w-fit">
              SDK v2.1 (Node.js & TS)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="install" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
              <TabsTrigger value="install">Instalación</TabsTrigger>
              <TabsTrigger value="init">Conexión</TabsTrigger>
              <TabsTrigger value="reserve">Recursos (SRE)</TabsTrigger>
              <TabsTrigger value="lock">Locks (DLS)</TabsTrigger>
            </TabsList>

            {Object.entries(quickStartCode).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <div className="relative">
                  <pre className="p-4 sm:p-5 rounded-xl bg-muted/60 border border-border overflow-x-auto">
                    <code className="text-sm font-mono text-foreground leading-relaxed">
                      {code}
                    </code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 hover:bg-background/80"
                    aria-label={copiedCode === key ? "Código copiado" : "Copiar código"}
                    onClick={() => copyToClipboard(code, key)}
                  >
                    {copiedCode === key ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Documentation Topics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredSections.map((section) => (
          <Card key={section.id} className="border-border bg-card/40 hover:border-primary/40 transition-colors shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
              <CardDescription className="text-sm">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {section.items.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/60 transition-colors group"
                    >
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        {item.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* External Resources */}
      <Card className="border-border bg-card/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recursos y Repositorios</CardTitle>
          <CardDescription className="text-sm">
            Enlaces útiles para explorar el ecosistema de Caerus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border/80 bg-card/60">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">SDK Oficial (@caerus-dev/sdk)</p>
                <p className="text-xs text-muted-foreground truncate">
                  Código abierto, tipados completos y suites de pruebas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border/80 bg-card/60">
              <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">gRPC API</p>
                <p className="text-xs text-muted-foreground truncate">
                  Protocol Buffers optimizados para baja latencia
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
