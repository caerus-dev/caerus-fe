import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Settings, Trash2, Users, Layers, ExternalLink } from 'lucide-react'
import { EnvBadge } from '@/components/dashboard/shared/env-badge'

interface ApplicationCardProps {
  app: {
    id: string
    name: string
    description: string
    environments: string[]
    collaborators: number
    apiCalls: number
    createdAt: string
    status: 'active' | 'inactive'
    myRole?: string
  }
  onOpenDelete: (app: any) => void
}

export function ApplicationCard({ app, onOpenDelete }: ApplicationCardProps) {
  const getRoleBadge = (role?: string) => {
    const normalized = role?.toUpperCase()
    switch (normalized) {
      case 'OWNER':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-semibold">
            Propietario
          </Badge>
        )
      case 'ADMIN':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-semibold">
            Administrador
          </Badge>
        )
      case 'VIEWER':
      default:
        return (
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs font-semibold">
            Visor
          </Badge>
        )
    }
  }

  return (
    <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-mono font-bold">{app.name}</CardTitle>
              {getRoleBadge(app.myRole)}
            </div>
            <CardDescription className="line-clamp-2">{app.description}</CardDescription>
          </div>
          {app.myRole === 'OWNER' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/applications/${app.id}/settings`}>
                    <span className="flex items-center w-full cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onOpenDelete(app)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {app.environments.map((env) => (
            <EnvBadge key={env} environment={env} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{app.collaborators} colaboradores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{(app.apiCalls / 1000).toFixed(1)}k llamadas/mes</span>
          </div>
        </div>

        <div className="pt-2">
          <Link href={`/dashboard/applications/${app.id}`}>
            <Button variant="secondary" size="sm" className="w-full gap-2">
              Ver detalles
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
