"use client"

import { useState } from "react"
import { Plus, Key, Copy, Check, Eye, EyeOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for API keys
const initialApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "crs_prod_sk_1234567890abcdef",
    environment: "production",
    createdAt: "2024-01-15",
    lastUsed: "hace 2 horas",
  },
  {
    id: "2",
    name: "Staging API Key",
    key: "crs_stag_sk_abcdef1234567890",
    environment: "staging",
    createdAt: "2024-01-10",
    lastUsed: "hace 1 día",
  },
  {
    id: "3",
    name: "Development Key",
    key: "crs_dev_sk_test1234567890ab",
    environment: "development",
    createdAt: "2024-01-05",
    lastUsed: "hace 5 min",
  },
]

export default function ApiKeysPage() {
  const [apiKeys] = useState(initialApiKeys)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyEnv, setNewKeyEnv] = useState("development")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const copyToClipboard = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "••••••••••••••••"
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Gestiona las credenciales de acceso a la API de Caerus
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Nueva API Key
        </Button>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <Card className="bg-card border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">Crear Nueva API Key</CardTitle>
            <CardDescription>
              Las API keys permiten autenticar requests a la API de Caerus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Nombre de la Key</Label>
              <Input
                id="keyName"
                placeholder="ej: Backend Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <div className="flex gap-2">
                {["development", "staging", "production"].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setNewKeyEnv(env)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      newKeyEnv === env
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/50 border-border hover:border-primary/50"
                    }`}
                  >
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Crear Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys list */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-card/50 border-border">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          apiKey.environment === "production"
                            ? "bg-primary/10 text-primary"
                            : apiKey.environment === "staging"
                            ? "bg-chart-3/10 text-chart-3"
                            : "bg-chart-2/10 text-chart-2"
                        }`}
                      >
                        {apiKey.environment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.key
                          : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      >
                        {copiedId === apiKey.id ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Creada: {apiKey.createdAt} • Último uso: {apiKey.lastUsed}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick start code */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Quick Start</CardTitle>
          <CardDescription>
            Usa tu API key para autenticar requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
              <span className="text-xs font-mono text-muted-foreground">
                TypeScript
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  copyToClipboard(
                    `import { Caerus } from '@caerus/sdk'\n\nconst client = new Caerus({\n  apiKey: process.env.CAERUS_API_KEY\n})`,
                    "snippet"
                  )
                }
              >
                {copiedId === "snippet" ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copiar
              </Button>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code>
                <span className="text-chart-2">import</span>
                {" { "}
                <span className="text-chart-3">Caerus</span>
                {" } "}
                <span className="text-chart-2">from</span>{" "}
                <span className="text-primary">{`'@caerus/sdk'`}</span>
                {"\n\n"}
                <span className="text-chart-2">const</span> client ={" "}
                <span className="text-chart-2">new</span>{" "}
                <span className="text-chart-3">Caerus</span>
                {"({\n"}
                {"  "}apiKey: process.env.
                <span className="text-primary">CAERUS_API_KEY</span>
                {"\n})"}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
