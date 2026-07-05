"use client"

import { use, useState, useEffect } from "react"
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
  Users,
  Calendar,
  X
} from "lucide-react"

interface Collaborator {
  id: string
  userId: string
  email: string
  role: "OWNER" | "ADMIN" | "VIEWER"
}

interface Invitation {
  id: string
  email: string
  role: "ADMIN" | "VIEWER"
  createdAt: string
  expiresAt: string
}

const roleLabels: Record<string, { label: string; color: string }> = {
  OWNER: { label: "Propietario", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  ADMIN: { label: "Administrador", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  VIEWER: { label: "Visor", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
}

export default function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [app, setApp] = useState<any>(null)
  const [myRole, setMyRole] = useState<string>("VIEWER")
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false)
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<Collaborator | null>(null)
  const [collaboratorToChange, setCollaboratorToChange] = useState<Collaborator | null>(null)
  const [newRoleValue, setNewRoleValue] = useState<"ADMIN" | "VIEWER">("VIEWER")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "VIEWER">("VIEWER")
  const [inviteError, setInviteError] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Fetch application details to check user's role
      const appRes = await fetch(`/api/applications/${id}`)
      let role = "VIEWER"
      let ownerEmail = "Propietario de la Aplicación"
      let appData: any = null
      if (appRes.ok) {
        appData = await appRes.json()
        setApp(appData)
        role = appData.myRole || "VIEWER"
        setMyRole(role)
        if (appData.owner && appData.owner.email) {
          ownerEmail = appData.owner.email
        }
      }

      // Fetch collaborators
      const collabsRes = await fetch(`/api/applications/${id}/collaborators`)
      let collaboratorsList: Collaborator[] = []
      if (collabsRes.ok) {
        const collabsData = await collabsRes.json()
        collaboratorsList = collabsData.content || []
      }

      // Add a virtual owner entry if not present using appData instead of app state
      if (appData && !collaboratorsList.some(c => c.role === "OWNER")) {
        collaboratorsList.unshift({
          id: "owner_entry",
          userId: appData.owner?.id || appData.ownerId,
          email: ownerEmail,
          role: "OWNER"
        })
      }

      // Fetch pending invitations (only OWNER can see invitations)
      let invitationsList: Invitation[] = []
      if (role === "OWNER") {
        const invitesRes = await fetch(`/api/applications/${id}/invitations?status=PENDING`)
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json()
          invitationsList = invitesData.content || []
        }
      }

      setCollaborators(collaboratorsList)
      setInvitations(invitationsList)
    } catch (error) {
      console.error("Error loading team data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleInvite = async () => {
    setInviteError("")

    if (!inviteEmail.trim()) {
      setInviteError("El correo electrónico es requerido")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Por favor ingresa un correo electrónico válido")
      return
    }

    if (collaborators.some((c) => c.email.toLowerCase() === inviteEmail.toLowerCase()) || 
        invitations.some((i) => i.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError("Este correo ya tiene acceso o tiene una invitación pendiente")
      return
    }

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      if (response.ok) {
        setInviteEmail("")
        setInviteRole("VIEWER")
        setInviteDialogOpen(false)
        await loadData()
      } else {
        setInviteError("Error al enviar la invitación")
      }
    } catch (error) {
      setInviteError("Hubo un error de conexión")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRemoveClick = (collaborator: Collaborator) => {
    setCollaboratorToRemove(collaborator)
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!collaboratorToRemove) return

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/collaborators/${collaboratorToRemove.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRemoveDialogOpen(false)
        setCollaboratorToRemove(null)
        await loadData()
      } else {
        console.error("Failed to remove collaborator")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleChangeRoleClick = (collaborator: Collaborator) => {
    setCollaboratorToChange(collaborator)
    setNewRoleValue(collaborator.role === "ADMIN" ? "ADMIN" : "VIEWER")
    setChangeRoleDialogOpen(true)
  }

  const handleChangeRoleConfirm = async () => {
    if (!collaboratorToChange) return

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/collaborators/${collaboratorToChange.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newRole: newRoleValue,
        }),
      })

      if (response.ok) {
        setChangeRoleDialogOpen(false)
        setCollaboratorToChange(null)
        await loadData()
      } else {
        console.error("Failed to change role")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${id}/invitations/${invitationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      } else {
        console.error("Failed to cancel invitation")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const getInitials = (email: string) => {
    if (!email) return "U"
    return email[0].toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return dateString
      return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/applications/${id}`}>
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
        {myRole === "OWNER" && (
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
                  Ingresa el correo electrónico del desarrollador que deseas invitar a colaborar en esta aplicación
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {inviteError && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colaborador@empresa.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      disabled={isActionLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rol asignado</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(val: any) => setInviteRole(val)}
                    disabled={isActionLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="VIEWER">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-zinc-400" />
                          Visor (Solo lectura)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {inviteRole === "ADMIN" && "Puede ver todo y crear/editar/eliminar ambientes y recursos compartidos."}
                    {inviteRole === "VIEWER" && "Tiene acceso de solo lectura. No puede realizar modificaciones."}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={isActionLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleInvite} disabled={isActionLoading}>
                  {isActionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Invitación"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Collaborators List */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipo ({collaborators.length})
          </CardTitle>
          <CardDescription>
            Lista de todos los colaboradores con acceso activo a la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border/80 transition-colors bg-background/20"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(collaborator.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {collaborator.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`${roleLabels[collaborator.role]?.color}`}
                  >
                    {roleLabels[collaborator.role]?.label}
                  </Badge>
                  {myRole === "OWNER" && collaborator.role !== "OWNER" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleChangeRoleClick(collaborator)}
                          className="cursor-pointer"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Cambiar Rol
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
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

      {/* Pending Invitations List (Only shown for OWNER) */}
      {myRole === "OWNER" && (
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invitaciones Pendientes ({invitations.length})
            </CardTitle>
            <CardDescription>
              Desarrolladores que han sido invitados pero aún no aceptan el correo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Mail className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No hay invitaciones pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-border/80 transition-colors bg-background/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {invite.email}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Enviada el: {formatDate(invite.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={`${roleLabels[invite.role]?.color}`}
                      >
                        {roleLabels[invite.role]?.label}
                      </Badge>
                      {myRole === "OWNER" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Cancelar Invitación"
                          onClick={() => handleCancelInvitation(invite.id)}
                          disabled={isActionLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Colaborador</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas remover a{" "}
              <span className="font-semibold text-foreground">
                {collaboratorToRemove?.email}
              </span>{" "}
              de esta aplicación? Perderá acceso al panel y a las configuraciones de forma inmediata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
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

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Colaborador</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo rol para{" "}
              <span className="font-semibold text-foreground">
                {collaboratorToChange?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="change-role">Rol de acceso</Label>
              <Select
                value={newRoleValue}
                onValueChange={(val: any) => setNewRoleValue(val)}
                disabled={isActionLoading}
              >
                <SelectTrigger id="change-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="VIEWER">Visor (Solo lectura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeRoleDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangeRoleConfirm}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Actualizar Rol"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
