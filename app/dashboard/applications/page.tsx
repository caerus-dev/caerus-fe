"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Settings, 
  Trash2, 
  Users,
  Layers,
  ExternalLink,
  Loader2,
  Info,
  Box,
  FileText,
  ArrowUpRight,
} from "lucide-react"
import { EnvBadge } from "@/components/dashboard/shared/env-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useApps } from "@/components/dashboard/apps-context"
import { CreateAppButton } from "@/components/applications/CreateAppButton"
import { useUser } from "@/hooks/use-user"

interface Application {
  id: string
  name: string
  description: string
  environments: string[]
  collaborators: number
  apiCalls: number
  createdAt: string
  status: "active" | "inactive"
  myRole?: string
}

const getRoleBadge = (role: string) => {
  const normalized = role?.toUpperCase();
  switch (normalized) {
    case "OWNER":
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-semibold">
          Propietario
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-semibold">
          Administrador
        </Badge>
      );
    case "VIEWER":
    default:
      return (
        <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs font-semibold">
          Lector
        </Badge>
      );
  }
};

export default function ApplicationsPage() {
  const router = useRouter()
  const { refreshApps } = useApps()
  const { user, hasValidPaymentMethod, isLoading: isUserLoading } = useUser()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appToDelete, setAppToDelete] = useState<Application | null>(null)
  const [deleteAppError, setDeleteAppError] = useState<{ message: string, details?: string[] } | null>(null)
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<Application | null>(null)

  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/applications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.content)) {
            const mapped = data.content.map((app: any) => {
              const envs = app.environments ? app.environments.map((env: any) => env.name) : [];
              return {
                id: app.id.toString(),
                name: app.name,
                description: app.description || "",
                environments: envs,
                collaborators: app.collaboratorsCount || 1,
                apiCalls: app.apiCallsCount || 0,
                createdAt: app.createdAt || new Date().toISOString(),
                status: "active",
                myRole: app.myRole || "VIEWER",
              };
            });
            setApplications(mapped);
          }
        } else {
          console.error("Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchApps();
    return () => { isMounted = false; };
  }, []);

  const filteredApps = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (app: Application) => {
    setAppToDelete(app)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (appToDelete) {
      setDeleteAppError(null)
      try {
        const response = await fetch(`/api/applications/${appToDelete.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setApplications((prev) => prev.filter((app) => app.id !== appToDelete.id))
          setDeleteDialogOpen(false)
          setAppToDelete(null)
          refreshApps()
        } else {
          const errData = await response.json().catch(() => ({ message: "Error al eliminar la aplicación" }))
          setDeleteAppError({
            message: errData.message || errData.error || "Error al eliminar la aplicación",
            details: errData.details
          })
        }
      } catch (error) {
        console.error("Error deleting application:", error);
        setDeleteAppError({ message: "Ocurrió un error inesperado al eliminar la aplicación" })
      }
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return dateString
      const day = d.getDate()
      const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aplicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus aplicaciones y sus configuraciones
          </p>
        </div>
        <CreateAppButton hasValidPaymentMethod={hasValidPaymentMethod} />
      </div>

      {/* Banner discreto para colaboradores sin tarjeta */}
      {user && !hasValidPaymentMethod && !isUserLoading && applications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>
              Tienes acceso como colaborador a aplicaciones compartidas. Para crear tus propias aplicaciones e infraestructura independiente, asocia un método de pago.
            </span>
          </div>
          <CreateAppButton size="sm" variant="outline" className="h-7 text-xs shrink-0 font-medium">
            Activar Cuenta ($0)
          </CreateAppButton>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar aplicaciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Applications Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[230px] w-full rounded-xl bg-secondary/80 dark:bg-muted/50 border border-border/60" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              No hay aplicaciones
            </h3>
            <p className="text-muted-foreground text-sm text-center mb-4">
              {searchQuery
                ? "No se encontraron aplicaciones con ese criterio"
                : "Crea tu primera aplicación para comenzar"}
            </p>
            {!searchQuery && (
              <CreateAppButton />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="group hover:border-primary/50 hover:bg-accent/5 transition-all duration-200 cursor-pointer flex flex-col min-h-[230px] py-4 gap-4"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('[role="menuitem"]') || target.closest('button') || target.closest('[role="button"]')) {
                  return;
                }
                router.push(`/dashboard/applications/${app.id}`);
              }}
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                      {app.name}
                      <Badge
                        variant={app.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {app.status === "active" ? "Activa" : "Inactiva"}
                      </Badge>
                      {getRoleBadge(app.myRole || "VIEWER")}
                    </CardTitle>
                    <div>
                      <CardDescription className={`line-clamp-2 leading-relaxed ${!app.description ? "italic text-muted-foreground/50" : ""}`}>
                        {app.description || "Sin descripción configurada"}
                      </CardDescription>
                      {app.description && app.description.length > 85 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppForDetails(app);
                          }}
                          className="text-primary hover:text-primary/80 font-medium text-xs hover:underline cursor-pointer inline-flex items-center gap-0.5 mt-1 transition-colors"
                        >
                          Leer más
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      {app.myRole !== "VIEWER" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${app.id}/settings`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuración
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/applications/${app.id}/team`}>
                          <Users className="w-4 h-4 mr-2" />
                          Colaboradores
                        </Link>
                      </DropdownMenuItem>
                      {app.myRole === "OWNER" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(app)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                {/* Environments */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {app.environments.map((env) => (
                    <EnvBadge key={env} environment={env} />
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {app.collaborators}
                    </p>
                    <p className="text-xs text-muted-foreground">Colaboradores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {formatNumber(app.apiCalls)}
                    </p>
                    <p className="text-xs text-muted-foreground">Llamadas API</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground h-7 flex items-center justify-center whitespace-nowrap">
                      {formatDate(app.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">Creado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setAppToDelete(null)
            setDeleteAppError(null)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Aplicación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la aplicación{" "}
                <span className="font-medium text-foreground">
                  {appToDelete?.name}
                </span>
                ? Esta acción no se puede deshacer y eliminará todas las
                configuraciones, API keys y datos asociados.
              </DialogDescription>
            </DialogHeader>
            {deleteAppError && (
              <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-md p-3 space-y-2 mt-2">
                <div className="font-semibold">{deleteAppError.message}</div>
                {deleteAppError.details && deleteAppError.details.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    {deleteAppError.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalle de Aplicación (Pop-up con descripción completa y embellecimiento) */}
        <Dialog
          open={!!selectedAppForDetails}
          onOpenChange={(open) => !open && setSelectedAppForDetails(null)}
        >
          <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-border/80 shadow-2xl p-6">
            <DialogHeader className="space-y-3 pb-3 border-b border-border/50 text-left">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <Box className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground truncate">
                      {selectedAppForDetails?.name}
                    </DialogTitle>
                    <Badge
                      variant={selectedAppForDetails?.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {selectedAppForDetails?.status === "active" ? "Activa" : "Inactiva"}
                    </Badge>
                    {selectedAppForDetails && getRoleBadge(selectedAppForDetails.myRole || "VIEWER")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Creada el {selectedAppForDetails && formatDate(selectedAppForDetails.createdAt)}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Contenido: Descripción Completa */}
            <div className="space-y-2 py-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Descripción Completa</span>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border/60 p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar">
                {selectedAppForDetails?.description || (
                  <span className="italic text-muted-foreground/60">Sin descripción configurada</span>
                )}
              </div>
            </div>

            {/* Embellecimiento: Entornos y Estadísticas */}
            {selectedAppForDetails && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg bg-secondary/35 border border-border/50 p-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Entornos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAppForDetails.environments && selectedAppForDetails.environments.length > 0 ? (
                      selectedAppForDetails.environments.map((env) => (
                        <EnvBadge key={env} environment={env} />
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin entornos</span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/35 border border-border/50 p-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Resumen
                  </span>
                  <div className="text-xs text-foreground/90 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Colaboradores:</span>
                      <span className="font-semibold">{selectedAppForDetails.collaborators}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Llamadas API:</span>
                      <span className="font-semibold">{formatNumber(selectedAppForDetails.apiCalls)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-border/50 sm:justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAppForDetails(null)}
              >
                Cerrar
              </Button>
              <Button
                size="sm"
                className="glow-primary gap-1.5"
                asChild
              >
                <Link href={`/dashboard/applications/${selectedAppForDetails?.id}`}>
                  Abrir Aplicación
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
