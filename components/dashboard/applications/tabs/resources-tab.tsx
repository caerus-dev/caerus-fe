import React from 'react'
import Link from 'next/link'
import { Box, Plus, MoreVertical, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, getEnvColors } from '@/lib/utils'
import { formatTtl } from '@/lib/mocks/applications'

interface ResourcesTabProps {
  appId: string
  templates: any[]
  selectedEnv: string
  currentEnvDetails?: any
  myRole?: string
  onOpenDeleteTemplate: (template: any) => void
}

export function ResourcesTab({
  appId,
  templates,
  selectedEnv,
  currentEnvDetails,
  myRole,
  onOpenDeleteTemplate,
}: ResourcesTabProps) {
  const isViewer = myRole === 'VIEWER'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {templates.length === 1 ? '1 recurso configurado' : `${templates.length} recursos configurados`}
        </p>
        {!isViewer && (
          <Link href={`/dashboard/applications/${appId}/resources/new?envId=${currentEnvDetails?.id}`}>
            <Button className="gap-2" disabled={!currentEnvDetails?.id}>
              <Plus className="h-4 w-4" />
              Nuevo Recurso
            </Button>
          </Link>
        )}
      </div>

      {templates.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Box className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Aún no hay recursos configurados</p>
            {!isViewer && (
              <Link href={`/dashboard/applications/${appId}/resources/new?envId=${currentEnvDetails?.id}`}>
                <Button className="gap-2" disabled={!currentEnvDetails?.id}>
                  <Plus className="h-4 w-4" />
                  Crear Primer Recurso
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((template: any) => (
            <Card
              key={template.id}
              className={cn(
                'bg-card/50 border-border py-0 border-l-2',
                getEnvColors(selectedEnv).borderStrong
              )}
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      getEnvColors(selectedEnv).bg
                    )}
                  >
                    <Box className={cn('h-5 w-5', getEnvColors(selectedEnv).text)} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono font-medium text-sm sm:text-base break-all sm:break-normal">
                      {template.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="capitalize">
                        Tipo {template.type === 'UNITARY' ? 'Unitario' : 'Múltiple'}
                      </span>
                      {template.defaultTtlSec && (
                        <>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span>TTL: {formatTtl(template.defaultTtlSec * 1000)}</span>
                        </>
                      )}
                      <span className="hidden sm:inline text-muted-foreground/50">•</span>
                      <span>Res: {template.conflictResolution}</span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground italic mt-1 pr-6 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border/50 sm:border-0 pt-2.5 sm:pt-0">
                  {!isViewer && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${appId}/resources/${template.id}/edit`}>
                            <span className="flex items-center w-full cursor-pointer">
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => onOpenDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
