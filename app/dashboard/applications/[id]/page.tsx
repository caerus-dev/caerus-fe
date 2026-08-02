"use client"

import Link from "next/link"
import { use, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Box,
  Lock,
  Key,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, getEnvColors } from "@/lib/utils"
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

import { Skeleton } from "@/components/ui/skeleton"
import { ApplicationDetailSkeleton } from "@/components/dashboard/applications/application-detail-skeleton"
import { ResourcesTab } from "@/components/dashboard/applications/tabs/resources-tab"
import { LocksTab } from "@/components/dashboard/applications/tabs/locks-tab"
import { ApiKeysTab } from "@/components/dashboard/applications/tabs/api-keys-tab"
import { DuplicateTemplateDialog } from "@/components/dashboard/applications/duplicate-template-dialog"

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEnv, setSelectedEnv] = useState<string>("")
  const [currentEnvDetails, setCurrentEnvDetails] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [locks, setLocks] = useState<any[]>([])
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false)
  const [confirmDeleteTemplateOpen, setConfirmDeleteTemplateOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<any>(null)

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [templateToDuplicate, setTemplateToDuplicate] = useState<any>(null)

  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isApiKeysLoading, setIsApiKeysLoading] = useState(false)
  const [confirmRevokeKeyOpen, setConfirmRevokeKeyOpen] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<any>(null)
  const [showCreatedKeyDialog, setShowCreatedKeyDialog] = useState(false)
  const [createdRawKey, setCreatedRawKey] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications/${id}`)
        if (res.ok) {
          const data = await res.json()
          const envs = data.environments || []

          const queryEnv = searchParams.get("env") || searchParams.get("envName")
          const savedEnv = typeof window !== "undefined" ? localStorage.getItem(`caerus_env_${id}`) : null
          
          let initialEnv = queryEnv || savedEnv || ""

          if (!initialEnv || !envs.some((e: any) => e.name === initialEnv)) {
            const pref = envs.find((e: any) => e.name === "dev" || e.name === "development") ||
                         envs.find((e: any) => e.name === "stage" || e.name === "staging") ||
                         envs.find((e: any) => e.name === "prod" || e.name === "production") ||
                         envs[0]
            initialEnv = pref ? pref.name : ""
          }

          setSelectedEnv(initialEnv || "dev")

          setApp({
            id: data.id.toString(),
            name: data.name,
            description: data.description || "",
            environments: envs,
            status: "active",
            createdAt: data.createdAt || new Date().toISOString(),
            resources: [],
            locks: [],
            apiKeys: [],
            myRole: data.myRole || "VIEWER",
          })
        } else {
          console.error("Failed to fetch application details from backend")
        }
      } catch (error) {
        console.error("Error fetching application details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchApp()
  }, [id, searchParams])

  useEffect(() => {
    if (!app || !app.environments || !selectedEnv) return
    const activeEnvObj = app.environments.find((env: any) => env.name === selectedEnv)
    if (!activeEnvObj) return

    const fetchEnvDetailsAndTemplates = async () => {
      setIsTemplatesLoading(true)
      setIsApiKeysLoading(true)
      try {
        const [envRes, templatesRes, keysRes] = await Promise.all([
          fetch(`/api/applications/${id}/environments/${activeEnvObj.id}`),
          fetch(`/api/shared-resource-templates?environmentId=${activeEnvObj.id}`),
          fetch(`/api/environments/${activeEnvObj.id}/api-keys`),
        ])

        if (envRes.ok) {
          const envData = await envRes.json()
          setCurrentEnvDetails(envData)
          setLocks(envData.locks || [])
        }

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.content || [])
        }

        if (keysRes.ok) {
          const keysData = await keysRes.json()
          setApiKeys(keysData.content || [])
        }
      } catch (error) {
        console.error("Error fetching environment details from backend:", error)
      } finally {
        setIsTemplatesLoading(false)
        setIsApiKeysLoading(false)
      }
    }
    fetchEnvDetailsAndTemplates()
  }, [selectedEnv, app])

  const handleEnvChange = (val: string) => {
    setSelectedEnv(val)
    if (typeof window !== "undefined") {
      localStorage.setItem(`caerus_env_${id}`, val)
    }
    router.replace(`/dashboard/applications/${id}?env=${encodeURIComponent(val)}`, { scroll: false })
  }

  const handleCreateApiKey = async () => {
    if (!currentEnvDetails) return
    try {
      const res = await fetch(`/api/environments/${currentEnvDetails.id}/api-keys`, {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setCreatedRawKey(data.rawKey)
        setShowCreatedKeyDialog(true)
        setApiKeys((prev) => [data, ...prev])
      } else {
        console.error("Failed to create API Key")
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
    if (!keyToRevoke || !currentEnvDetails) return
    try {
      const res = await fetch(
        `/api/environments/${currentEnvDetails.id}/api-keys/${keyToRevoke.id}/revoke`,
        { method: "POST" }
      )
      if (res.ok) {
        setApiKeys((prev) =>
          prev.map((k) => (k.id === keyToRevoke.id ? { ...k, state: "REVOKED" } : k))
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

  const copyRawKeyToClipboard = () => {
    if (createdRawKey) {
      navigator.clipboard.writeText(createdRawKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const handleOpenDeleteTemplate = (template: any) => {
    setTemplateToDelete(template)
    setConfirmDeleteTemplateOpen(true)
  }

  const handleDeleteTemplateConfirm = async () => {
    if (!templateToDelete) return
    try {
      const res = await fetch(`/api/shared-resource-templates/${templateToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id))
        setConfirmDeleteTemplateOpen(false)
        setTemplateToDelete(null)
      } else {
        console.error("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleOpenDuplicateTemplate = (template: any) => {
    setTemplateToDuplicate(template)
    setDuplicateDialogOpen(true)
  }

  const handleDuplicateSuccess = () => {
    if (app && selectedEnv) {
      const activeEnvObj = app.environments.find((env: any) => env.name === selectedEnv)
      if (activeEnvObj) {
        fetch(`/api/shared-resource-templates?environmentId=${activeEnvObj.id}`)
          .then((res) => res.json())
          .then((data) => setTemplates(data.content || []))
      }
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/20 text-primary"
      case "paused":
        return "bg-chart-4/20 text-chart-4"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  if (isLoading) {
    return <ApplicationDetailSkeleton />
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró la aplicación o no tienes acceso.</p>
        <Link href="/dashboard/applications" className="text-primary hover:underline mt-4 inline-block">
          Volver a aplicaciones
        </Link>
      </div>
    )
  }

  const descriptionText = currentEnvDetails?.description || (currentEnvDetails?.name && app?.name ? `Entorno de ${currentEnvDetails.name} para ${app.name}` : null)

  return (
    <div className="space-y-8">
      {/* Breadcrumb and header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Aplicaciones
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{app.name}</h1>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                {app.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedEnv}
              onValueChange={handleEnvChange}
            >
              <SelectTrigger
                size="sm"
                className={cn(
                  "w-full sm:w-[190px] h-8 justify-between border shadow-xs text-xs font-semibold cursor-pointer",
                  getEnvColors(selectedEnv).bgSoft,
                  getEnvColors(selectedEnv).border
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-normal">Ambiente:</span>
                  <SelectValue placeholder="Ambiente" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {app?.environments && app.environments.length > 0 ? (
                  app.environments.map((env: any) => (
                    <SelectItem key={env.id} value={env.name}>
                      <span className="flex items-center gap-1.5 font-mono">
                        <span className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          getEnvColors(env.name).dot,
                          (env.name === "prod" || env.name === "production") && "animate-pulse"
                        )} />
                        {env.name}
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="dev">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      Desarrollo
                    </span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href={`/dashboard/applications/${id}/team?env=${encodeURIComponent(selectedEnv)}`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2 h-8 w-full sm:w-auto">
                  <Users className="h-4 w-4" />
                  Equipo
                </Button>
              </Link>
              {app.myRole !== "VIEWER" && (
                <Link href={`/dashboard/applications/${id}/settings?env=${encodeURIComponent(selectedEnv)}`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 h-8 w-full sm:w-auto">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {app.description && (
          <div className="md:pl-0">
            <p className="text-muted-foreground max-w-2xl text-sm line-clamp-3 md:line-clamp-none">
              {app.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-muted-foreground" />
              Recursos
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Configuraciones de Locks
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-2">{locks.length}</div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              API Keys
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {apiKeys.filter((key: any) => key.state === "ACTIVE").length}
            </div>
          </div>
        </Card>
        <Card className="bg-card/50 border-border p-4 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-1.5">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              Operaciones Activas
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-4">
              0
            </div>
          </div>
        </Card>
      </div>

      {isTemplatesLoading && !currentEnvDetails ? (
        <Skeleton className="h-[38px] w-full rounded-lg" />
      ) : descriptionText ? (
        <div className={cn(
          "flex items-center gap-2.5 text-sm rounded-lg border-l-4 px-3 py-2 transition-all duration-200",
          getEnvColors(currentEnvDetails?.name || selectedEnv).borderStrong,
          getEnvColors(currentEnvDetails?.name || selectedEnv).bgSoft,
          isTemplatesLoading && "opacity-50 pointer-events-none"
        )}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              getEnvColors(currentEnvDetails?.name || selectedEnv).dot
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              getEnvColors(currentEnvDetails?.name || selectedEnv).dot
            )} />
          </span>
          <p className="text-foreground">{descriptionText}</p>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <div className="w-full pb-1">
          <TabsList className="bg-secondary flex w-full sm:w-fit">
            <TabsTrigger value="resources" className="gap-1.5 px-3">
              <Box className="h-4 w-4" />
              <span>
                Recursos<span className="hidden sm:inline"> Compartidos</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="locks" className="gap-1.5 px-3">
              <Lock className="h-4 w-4" />
              <span>
                Locks<span className="hidden sm:inline"> Distribuidos</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5 px-3">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resources" className="space-y-4">
          <ResourcesTab
            appId={id}
            templates={templates}
            selectedEnv={selectedEnv}
            currentEnvDetails={currentEnvDetails}
            myRole={app.myRole}
            onOpenDeleteTemplate={handleOpenDeleteTemplate}
            onOpenDuplicateTemplate={handleOpenDuplicateTemplate}
          />
        </TabsContent>

        <TabsContent value="locks" className="space-y-4">
          <LocksTab
            appId={id}
            locks={locks}
            selectedEnv={selectedEnv}
            myRole={app.myRole}
          />
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <ApiKeysTab
            apiKeys={apiKeys}
            isApiKeysLoading={isApiKeysLoading}
            selectedEnv={selectedEnv}
            currentEnvDetails={currentEnvDetails}
            myRole={app.myRole}
            onCreateApiKey={handleCreateApiKey}
            onOpenRevokeKey={handleOpenRevokeKey}
          />
        </TabsContent>
      </Tabs>

      {/* Duplicate Shared Resource Template Dialog */}
      <DuplicateTemplateDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        template={templateToDuplicate}
        environments={app?.environments || []}
        currentEnvId={currentEnvDetails?.id}
        onSuccess={handleDuplicateSuccess}
      />

      {/* Delete Shared Resource Template Confirmation Dialog */}
      <Dialog open={confirmDeleteTemplateOpen} onOpenChange={setConfirmDeleteTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plantilla de Recurso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar la plantilla de recurso{" "}
              <span className="font-semibold text-foreground">{templateToDelete?.name}</span>?
              Esta acción es irreversible y revocaría el acceso a este recurso en el motor SRE.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteTemplateOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplateConfirm}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
