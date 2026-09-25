"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Key, Copy, Check, Trash2, Loader2, AlertCircle, RefreshCw, Box, Layers } from "lucide-react"
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

const EMPTY_ENVIRONMENTS: any[] = []

export default function ApiKeysPage() {
  const [apps, setApps] = useState<any[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>("")
  const [selectedEnvId, setSelectedEnvId] = useState<string>("")
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isAppsLoading, setIsAppsLoading] = useState(true)
  const [isKeysLoading, setIsKeysLoading] = useState(false)
  const [appsError, setAppsError] = useState<string | null>(null)
  const [keysError, setKeysError] = useState<string | null>(null)

  const [confirmRevokeKeyOpen, setConfirmRevokeKeyOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<any>(null)
  const [showCreatedKeyDialog, setShowCreatedKeyDialog] = useState(false)
  const [createdRawKey, setCreatedRawKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch all applications
  const fetchApps = useCallback(async () => {
    setIsAppsLoading(true)
    setAppsError(null)
    try {
      const res = await fetch("/api/applications")
      if (res.ok) {
        const data = await res.json()
        const content = data.content || []
        setApps(content)
        if (content.length > 0) {
          setSelectedAppId(content[0].id)
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        setAppsError(errData.error || errData.message || "Error al cargar las aplicaciones")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      setAppsError("Error de conexión al cargar las aplicaciones")
    } finally {
      setIsAppsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  // Auto-select first environment of selected application
  const selectedAppObj = apps.find((app) => app.id === selectedAppId)
  const environments = useMemo(
    () => selectedAppObj?.environments ?? EMPTY_ENVIRONMENTS,
    [selectedAppObj?.id, selectedAppObj?.environments]
  )

  useEffect(() => {
    if (environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    } else {
      setSelectedEnvId("")
      setApiKeys([])
    }
  }, [selectedAppId, environments])

  // Fetch API keys for selected environment
  const fetchKeys = useCallback(async () => {
    if (!selectedEnvId) return
    setIsKeysLoading(true)
    setKeysError(null)
    try {
      const res = await fetch(`/api/environments/${selectedEnvId}/api-keys`)
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data.content || [])
      } else {
        const errData = await res.json().catch(() => ({}))
        setKeysError(errData.error || errData.message || "Error al obtener las API Keys")
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
      setKeysError("Error de conexión al obtener las API Keys")
    } finally {
      setIsKeysLoading(false)
    }
  }, [selectedEnvId])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

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

      {/* Context Selection Toolbar */}
      <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
            {/* Selector de Aplicación */}
            <div className="flex flex-col gap-1.5 sm:min-w-[260px] max-w-sm flex-1">
              <Label htmlFor="appSelect" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-primary" />
                Aplicación
              </Label>
              {isAppsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-10 px-3 bg-secondary/30 rounded-lg border border-border/60">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Cargando aplicaciones...</span>
                </div>
              ) : appsError ? (
                <div className="flex items-center justify-between gap-2 h-10 px-3 bg-destructive/10 rounded-lg border border-destructive/30 text-xs text-destructive">
                  <span className="truncate">{appsError}</span>
                  <Button variant="ghost" size="sm" onClick={fetchApps} className="h-6 px-1.5 text-[11px] gap-1">
                    <RefreshCw className="h-3 w-3" /> Reintentar
                  </Button>
                </div>
              ) : apps.length === 0 ? (
                <div className="flex items-center h-10 px-3 text-xs text-muted-foreground italic bg-secondary/20 rounded-lg border border-border/50">
                  No tienes aplicaciones creadas
                </div>
              ) : (
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger id="appSelect" className="h-10 bg-secondary/40 border-border/80 hover:bg-secondary/60 transition-colors font-medium cursor-pointer">
                    <SelectValue placeholder="Seleccionar Aplicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id} className="cursor-pointer">
                        <span className="font-medium">{app.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Separador visual en desktop */}
            <div className="hidden sm:block h-10 w-[1px] bg-border/60 self-end mb-0.5" />

            {/* Selector de Entorno */}
            <div className="flex flex-col gap-1.5 sm:min-w-[240px] max-w-sm flex-1">
              <Label htmlFor="envSelect" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-chart-2" />
                Entorno
              </Label>
              {environments.length === 0 ? (
                <div className="flex items-center h-10 px-3 text-xs text-muted-foreground italic bg-secondary/20 rounded-lg border border-border/50">
                  Sin entornos disponibles
                </div>
              ) : (
                <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
                  <SelectTrigger id="envSelect" className="h-10 bg-secondary/40 border-border/80 hover:bg-secondary/60 transition-colors font-medium cursor-pointer">
                    <SelectValue placeholder="Seleccionar Entorno" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env: any) => (
                      <SelectItem key={env.id} value={env.id} className="cursor-pointer">
                        <span className="flex items-center gap-2 font-mono">
                          <span className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            env.name === "prod" || env.name === "production"
                              ? "bg-primary animate-pulse"
                              : env.name === "stage" || env.name === "staging"
                              ? "bg-chart-4"
                              : "bg-chart-2"
                          )} />
                          <span>{env.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Botón de acción principal alinear a la derecha */}
          {selectedEnvId && selectedAppObj?.myRole !== "VIEWER" && !appsError && !keysError && (
            <div className="lg:self-end pb-0.5">
              <Button className="glow-primary gap-2 h-10 w-full sm:w-auto font-semibold px-4 cursor-pointer" onClick={handleCreateApiKey}>
                <Plus className="h-4 w-4" />
                Generar API Key
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* API Keys list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Claves en el entorno</h2>
            {selectedEnvId && apiKeys.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                {apiKeys.length}
              </span>
            )}
          </div>
        </div>

        {isKeysLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : appsError ? (
          <Card className="bg-card/50 border-destructive/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
              <p className="font-medium text-foreground mb-1">No se pudieron cargar las aplicaciones</p>
              <p className="text-sm text-muted-foreground mb-4">{appsError}</p>
              <Button variant="outline" size="sm" onClick={fetchApps} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : keysError ? (
          <Card className="bg-card/50 border-destructive/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
              <p className="font-medium text-foreground mb-1">Error al obtener las API Keys</p>
              <p className="text-sm text-muted-foreground mb-4">{keysError}</p>
              <Button variant="outline" size="sm" onClick={fetchKeys} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : !selectedEnvId ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Key className="h-10 w-10 mb-3" />
              <p>Selecciona una aplicación y entorno para ver las API Keys.</p>
            </CardContent>
          </Card>
        ) : apiKeys.length === 0 ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
              <Key className="h-10 w-10 mb-3 text-muted-foreground" />
              <p className="mb-4">No hay API Keys configuradas para este entorno.</p>
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
                    `import { CaerusClient } from '@caerus-dev/sdk'\n\nconst caerus = new CaerusClient({\n  apiKey: process.env.CAERUS_API_KEY\n})`,
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
                <span className="text-chart-3">CaerusClient</span>
                {" } "}
                <span className="text-chart-2">from</span>{" "}
                <span className="text-primary">{`'@caerus-dev/sdk'`}</span>
                {"\n\n"}
                <span className="text-chart-2">const</span> caerus ={" "}
                <span className="text-chart-2">new</span>{" "}
                <span className="text-chart-3">CaerusClient</span>
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
              ¿Estás seguro de que deseas revocar la API Key con prefijo{" "}
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
