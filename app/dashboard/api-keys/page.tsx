"use client"

import { useState, useEffect } from "react"
import { Plus, Key, Copy, Check, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function ApiKeysPage() {
  const [apps, setApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>("")
  const [selectedEnvId, setSelectedEnvId] = useState<string>("")
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isAppsLoading, setIsAppsLoading] = useState(true)
  const [isKeysLoading, setIsKeysLoading] = useState(false)

  const [confirmRevokeKeyOpen, setConfirmRevokeKeyOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<any>(null)
  const [showCreatedKeyDialog, setShowCreatedKeyDialog] = useState(false)
  const [createdRawKey, setCreatedRawKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch all applications
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/applications")
        if (res.ok) {
          const data = await res.json()
          const content = data.content || []
          setApps(content)
          if (content.length > 0) {
            setSelectedAppId(content[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsAppsLoading(false)
      }
    }
    fetchApps()
  }, [])

  // Auto-select first environment of selected application
  const selectedAppObj = apps.find((app) => app.id === selectedAppId)
  const environments = selectedAppObj?.environments || []

  useEffect(() => {
    if (environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    } else {
      setSelectedEnvId("")
      setApiKeys([])
    }
  }, [selectedAppId, environments])

  // Fetch API keys for selected environment
  useEffect(() => {
    if (!selectedEnvId) return

    const fetchKeys = async () => {
      setIsKeysLoading(true)
      try {
        const res = await fetch(`/api/environments/${selectedEnvId}/api-keys`)
        if (res.ok) {
          const data = await res.json()
          setApiKeys(data.content || [])
        }
      } catch (error) {
        console.error("Error fetching API keys:", error)
      } finally {
        setIsKeysLoading(false)
      }
    }
    fetchKeys()
  }, [selectedEnvId])

  const handleCreateApiKey = async () => {
    if (!selectedEnvId) return
    try {
      const res = await fetch(`/api/environments/${selectedEnvId}/api-keys`, {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setCreatedRawKey(data.rawKey)
        setShowCreatedKeyDialog(true)
        setApiKeys((prev) => [data, ...prev])
      } else {
        console.error("Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
    }
  }

  const handleOpenRevokeKey = (key: any) => {
    setKeyToRevoke(key)
    setConfirmRevokeKeyOpen(true)
  }

  const handleRevokeKeyConfirm = async () => {
    if (!keyToRevoke) return
    try {
      const res = await fetch(`/api/environments/${selectedEnvId}/api-keys/${keyToRevoke.id}/revoke`, {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setApiKeys((prev) =>
          prev.map((k) => (k.id === keyToRevoke.id ? data : k))
        )
        setConfirmRevokeKeyOpen(false)
        setKeyToRevoke(null)
      } else {
        console.error("Failed to revoke API key")
      }
    } catch (error) {
      console.error("Error revoking API key:", error)
    }
  }

  const copyRawKeyToClipboard = async () => {
    if (!createdRawKey) return
    await navigator.clipboard.writeText(createdRawKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
      </div>

      {/* Selectors card */}
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appSelect">Aplicación</Label>
              {isAppsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Cargando aplicaciones...
                </div>
              ) : apps.length === 0 ? (
                <p className="text-sm text-muted-foreground pt-2">No tienes aplicaciones creadas.</p>
              ) : (
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger id="appSelect" className="bg-secondary/40 border-border cursor-pointer">
                    <SelectValue placeholder="Seleccionar Aplicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="envSelect">Ambiente</Label>
              {environments.length === 0 ? (
                <p className="text-sm text-muted-foreground pt-2">Selecciona una aplicación con ambientes.</p>
              ) : (
                <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
                  <SelectTrigger id="envSelect" className="bg-secondary/40 border-border cursor-pointer">
                    <SelectValue placeholder="Seleccionar Ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env: any) => (
                      <SelectItem key={env.id} value={env.id}>
                        <span className="flex items-center gap-1.5 font-mono">
                          <span className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            env.name === "prod" || env.name === "production"
                              ? "bg-primary animate-pulse"
                              : env.name === "stage" || env.name === "staging"
                              ? "bg-chart-4"
                              : "bg-chart-2"
                          )} />
                          {env.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Claves en el ambiente</h2>
          {selectedEnvId && selectedAppObj?.myRole !== "VIEWER" && (
            <Button className="gap-2" onClick={handleCreateApiKey}>
              <Plus className="h-4 w-4" />
              Generar API Key
            </Button>
          )}
        </div>

        {isKeysLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !selectedEnvId ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Key className="h-10 w-10 mb-3" />
              <p>Selecciona una aplicación y ambiente para ver las API Keys.</p>
            </CardContent>
          </Card>
        ) : apiKeys.length === 0 ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
              <Key className="h-10 w-10 mb-3 text-muted-foreground" />
              <p className="mb-4">No hay API Keys configuradas para este ambiente.</p>
              {selectedAppObj?.myRole !== "VIEWER" && (
                <Button className="gap-2" onClick={handleCreateApiKey}>
                  <Plus className="h-4 w-4" />
                  Crear API Key
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key: any) => (
              <Card key={key.id} className="bg-card/50 border-border py-0">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                      key.state === "ACTIVE" 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-secondary text-muted-foreground"
                    )}>
                      <Key className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm sm:text-base">{key.keyPrefix}••••••••••••</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          key.state === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}>
                          {key.state === "ACTIVE" ? "Activa" : "Revocada"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Creada el: {new Date(key.createdAt).toLocaleString()} 
                        {key.revokedAt && ` • Revocada el: ${new Date(key.revokedAt).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  {key.state === "ACTIVE" && selectedAppObj?.myRole !== "VIEWER" && (
                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1 px-3"
                        onClick={() => handleOpenRevokeKey(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Revocar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

      {/* Revoke API Key Dialog */}
      <Dialog open={confirmRevokeKeyOpen} onOpenChange={setConfirmRevokeKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revocar API Key</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas revocar la API Key con prefijo{" "}
              <span className="font-mono font-semibold text-foreground">{keyToRevoke?.keyPrefix}••••</span>?
              Esta acción es irreversible y los clientes que usen esta clave ya no podrán autenticarse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRevokeKeyOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeKeyConfirm}
            >
              Revocar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Created API Key Details Dialog */}
      <Dialog open={showCreatedKeyDialog} onOpenChange={setShowCreatedKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Generada</DialogTitle>
            <DialogDescription>
              Copia esta API key ahora. Por motivos de seguridad, no se volverá a mostrar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 pt-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={createdRawKey}
                className="font-mono bg-secondary/50 border-primary/20"
              />
            </div>
            <Button size="sm" className="px-3" onClick={copyRawKeyToClipboard}>
              <span className="sr-only">Copiar</span>
              {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreatedKeyDialog(false)}
            >
              Cerrar y Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
