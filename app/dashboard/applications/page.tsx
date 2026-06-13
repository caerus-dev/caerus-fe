"use client"

import { useState, useEffect } from "react"
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
  Key,
  Layers,
  Calendar,
  ExternalLink,
  Loader2
} from "lucide-react"

interface Application {
  id: string
  name: string
  description: string
  environments: string[]
  collaborators: number
  apiCalls: number
  createdAt: string
  status: "active" | "inactive"
}

const mockApplications: Application[] = [
  {
    id: "app_1",
    name: "E-Commerce Platform",
    description: "Sistema de reservas para inventario de productos",
    environments: ["production", "staging", "development"],
    collaborators: 4,
    apiCalls: 125430,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "app_2",
    name: "Cinema Booking",
    description: "Reserva de asientos para cadena de cines",
    environments: ["production", "development"],
    collaborators: 2,
    apiCalls: 89210,
    createdAt: "2024-02-20",
    status: "active",
  },
  {
    id: "app_3",
    name: "Medical Appointments",
    description: "Sistema de turnos para clinica medica",
    environments: ["staging", "development"],
    collaborators: 3,
    apiCalls: 45600,
    createdAt: "2024-03-10",
    status: "active",
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appToDelete, setAppToDelete] = useState<Application | null>(null)

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            const mapped = data.content.map((app: any) => ({
              id: app.id.toString(),
              name: app.name,
              description: app.description || "",
              environments: ["development"],
              collaborators: 1,
              apiCalls: 0,
              createdAt: app.createdAt || new Date().toISOString(),
              status: "active",
            }));
            setApplications(mapped);
          }
        } else {
          console.error("Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
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
      try {
        const response = await fetch(`/api/applications/${appToDelete.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setApplications((prev) => prev.filter((app) => app.id !== appToDelete.id))
        } else {
          console.error("Failed to delete application");
        }
      } catch (error) {
        console.error("Error deleting application:", error);
      } finally {
        setDeleteDialogOpen(false)
        setAppToDelete(null)
      }
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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
          <Link href="/dashboard/applications/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Aplicacion
            </Button>
          </Link>
        </div>

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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
                  : "Crea tu primera aplicacion para comenzar"}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/applications/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Aplicacion
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                className="group hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {app.name}
                        <Badge
                          variant={app.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {app.status === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {app.description}
                      </CardDescription>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${app.id}/settings`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configuracion
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${app.id}/team`}>
                            <Users className="w-4 h-4 mr-2" />
                            Colaboradores
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${app.id}/api-keys`}>
                            <Key className="w-4 h-4 mr-2" />
                            API Keys
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(app)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Environments */}
                  <div className="flex flex-wrap gap-1.5">
                    {app.environments.map((env) => (
                      <Badge
                        key={env}
                        variant="outline"
                        className={`text-xs ${
                          env === "production"
                            ? "border-green-500/50 text-green-400"
                            : env === "staging"
                            ? "border-yellow-500/50 text-yellow-400"
                            : "border-blue-500/50 text-blue-400"
                        }`}
                      >
                        {env}
                      </Badge>
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
                      <p className="text-xs text-muted-foreground">API Calls</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString("es-AR", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Aplicacion</DialogTitle>
              <DialogDescription>
                Estas seguro que deseas eliminar la aplicacion{" "}
                <span className="font-medium text-foreground">
                  {appToDelete?.name}
                </span>
                ? Esta accion no se puede deshacer y eliminara todas las
                configuraciones, API keys y datos asociados.
              </DialogDescription>
            </DialogHeader>
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
      </div>
  )
}
