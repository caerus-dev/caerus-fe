"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Mail,
  Shield,
  AlertCircle,
  UserPlus,
  Users
} from "lucide-react"
interface Collaborator {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "developer" | "viewer"
  joinedAt: string
  status: "active" | "pending"
}

const mockCollaborators: Collaborator[] = [
  {
    id: "1",
    name: "Juan Martinez",
    email: "juan@empresa.com",
    role: "owner",
    joinedAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria@empresa.com",
    role: "admin",
    joinedAt: "2024-02-10",
    status: "active",
  },
  {
    id: "3",
    name: "Carlos Lopez",
    email: "carlos@empresa.com",
    role: "developer",
    joinedAt: "2024-03-05",
    status: "active",
  },
  {
    id: "4",
    name: "",
    email: "nuevo@empresa.com",
    role: "developer",
    joinedAt: "2024-03-20",
    status: "pending",
  },
]

const roleLabels: Record<string, { label: string; color: string }> = {
  owner: { label: "Propietario", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  admin: { label: "Administrador", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  developer: { label: "Desarrollador", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  viewer: { label: "Visor", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
}

export default function TeamPage() {
  const [collaborators, setCollaborators] = useState(mockCollaborators)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<Collaborator | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("developer")
  const [inviteError, setInviteError] = useState("")

  const handleInvite = async () => {
    setInviteError("")

    if (!inviteEmail.trim()) {
      setInviteError("El correo electronico es requerido")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Por favor ingresa un correo electronico valido")
      return
    }

    if (collaborators.some((c) => c.email === inviteEmail)) {
      setInviteError("Este correo ya tiene acceso a la aplicación")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setCollaborators((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}`,
        name: "",
        email: inviteEmail,
        role: inviteRole as Collaborator["role"],
        joinedAt: new Date().toISOString().split("T")[0],
        status: "pending",
      },
    ])

    setInviteEmail("")
    setInviteRole("developer")
    setInviteDialogOpen(false)
    setIsLoading(false)
  }

  const handleRemoveClick = (collaborator: Collaborator) => {
    setCollaboratorToRemove(collaborator)
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!collaboratorToRemove) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorToRemove.id)
    )
    setRemoveDialogOpen(false)
    setCollaboratorToRemove(null)
    setIsLoading(false)
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Colaboradores
            </h1>
            <p className="text-muted-foreground">
              Gestiona el equipo que tiene acceso a esta aplicación
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Colaborador</DialogTitle>
                <DialogDescription>
                  Ingresa el correo electronico del desarrollador que deseas
                  invitar a colaborar en esta aplicación
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {inviteError && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Correo Electronico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colaborador@empresa.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rol</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={setInviteRole}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="developer">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Desarrollador
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Visor (Solo lectura)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {inviteRole === "admin" &&
                      "Puede gestionar configuraciones, API keys y colaboradores"}
                    {inviteRole === "developer" &&
                      "Puede ver configuraciones y usar las API keys"}
                    {inviteRole === "viewer" &&
                      "Solo puede ver la configuracion y estadisticas"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleInvite} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Invitacion"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Collaborators List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipo ({collaborators.length})
            </CardTitle>
            <CardDescription>
              Lista de todos los colaboradores con acceso a la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(collaborator.name, collaborator.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {collaborator.name || collaborator.email}
                        </p>
                        {collaborator.status === "pending" && (
                          <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {collaborator.name ? collaborator.email : "Invitacion enviada"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={`${roleLabels[collaborator.role].color}`}
                    >
                      {roleLabels[collaborator.role].label}
                    </Badge>
                    {collaborator.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRemoveClick(collaborator)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover Acceso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Remove Confirmation Dialog */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover Colaborador</DialogTitle>
              <DialogDescription>
                Estas seguro que deseas remover a{" "}
                <span className="font-medium text-foreground">
                  {collaboratorToRemove?.name || collaboratorToRemove?.email}
                </span>{" "}
                de esta aplicación? Perderá acceso al panel y a las configuraciones
                de forma inmediata.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoveDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removiendo...
                  </>
                ) : (
                  "Remover Acceso"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  )
}
