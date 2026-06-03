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
  install: `npm install @caerus/sdk`,
  init: `import { Caerus } from '@caerus/sdk';

const caerus = new Caerus({
  apiKey: process.env.CAERUS_API_KEY,
  environment: 'production'
});`,
  reserve: `// Reservar un recurso
const reservation = await caerus.resources.reserve({
  resourceId: 'seat-A1',
  userId: 'user_123',
  ttl: 300 // 5 minutos
});

if (reservation.success) {
  console.log('Reserva confirmada:', reservation.id);
}`,
  lock: `// Adquirir un distributed lock
const lock = await caerus.locks.acquire({
  key: 'payment-process-order-456',
  ttl: 30000 // 30 segundos
});

try {
  // Operacion critica
  await processPayment(order);
} finally {
  await lock.release();
}`,
}

const docSections = [
  {
    id: "getting-started",
    title: "Primeros Pasos",
    description: "Guia rapida para comenzar a usar Caerus",
    icon: <Zap className="w-5 h-5" />,
    items: [
      { title: "Instalacion", href: "/docs/installation" },
      { title: "Configuracion Inicial", href: "/docs/configuration" },
      { title: "Tu Primera Reserva", href: "/docs/first-reservation" },
      { title: "Tu Primer Lock", href: "/docs/first-lock" },
    ],
  },
  {
    id: "shared-resources",
    title: "Shared Resource Engine",
    description: "Gestion de recursos compartidos",
    icon: <Layers className="w-5 h-5" />,
    items: [
      { title: "Conceptos Basicos", href: "/docs/resources/concepts" },
      { title: "Crear Recursos", href: "/docs/resources/create" },
      { title: "Reservar Recursos", href: "/docs/resources/reserve" },
      { title: "Estrategias de Conflicto", href: "/docs/resources/strategies" },
      { title: "Webhooks", href: "/docs/resources/webhooks" },
    ],
  },
  {
    id: "distributed-locks",
    title: "Distributed Lock Service",
    description: "Locks distribuidos para operaciones criticas",
    icon: <Lock className="w-5 h-5" />,
    items: [
      { title: "Conceptos Basicos", href: "/docs/locks/concepts" },
      { title: "Tipos de Locks", href: "/docs/locks/types" },
      { title: "Fencing Tokens", href: "/docs/locks/fencing" },
      { title: "Consistencia", href: "/docs/locks/consistency" },
      { title: "Patrones Avanzados", href: "/docs/locks/patterns" },
    ],
  },
  {
    id: "api-reference",
    title: "Referencia de API",
    description: "Documentacion completa de la API REST",
    icon: <Code2 className="w-5 h-5" />,
    items: [
      { title: "Autenticacion", href: "/docs/api/auth" },
      { title: "Recursos", href: "/docs/api/resources" },
      { title: "Locks", href: "/docs/api/locks" },
      { title: "Errores", href: "/docs/api/errors" },
      { title: "Rate Limits", href: "/docs/api/rate-limits" },
    ],
  },
]

export default function DocsPage() {
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
    
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Book className="w-6 h-6" />
            Documentacion
          </h1>
          <p className="text-muted-foreground">
            Guias, referencias y snippets para integrar Caerus en tu sistema
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en la documentacion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Snippets listos para copiar y comenzar rapidamente
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary">
                SDK v2.1.0
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="install" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="install">Instalacion</TabsTrigger>
                <TabsTrigger value="init">Inicializacion</TabsTrigger>
                <TabsTrigger value="reserve">Reservar</TabsTrigger>
                <TabsTrigger value="lock">Lock</TabsTrigger>
              </TabsList>

              {Object.entries(quickStartCode).map(([key, code]) => (
                <TabsContent key={key} value={key}>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted/50 border border-border overflow-x-auto">
                      <code className="text-sm font-mono text-foreground">
                        {code}
                      </code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(code, key)}
                    >
                      {copiedCode === key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Documentation Sections */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSections.map((section) => (
            <Card key={section.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {item.title}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* External Links */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Adicionales</CardTitle>
            <CardDescription>
              Enlaces utiles para profundizar tu conocimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="https://github.com/caerus/sdk"
                target="_blank"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <Code2 className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">GitHub SDK</p>
                  <p className="text-xs text-muted-foreground">
                    Codigo fuente y ejemplos
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/docs/api"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <Terminal className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">API Reference</p>
                  <p className="text-xs text-muted-foreground">
                    Documentacion REST completa
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/docs/examples"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <Book className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Ejemplos</p>
                  <p className="text-xs text-muted-foreground">
                    Casos de uso reales
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    
  )
}
