import React from 'react'
import Link from 'next/link'
import { Lock, Plus, MoreVertical, Settings, Play, Trash2, Copy, SlidersHorizontal } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'

interface LocksTabProps {
  appId: string
  locks: any[]
  selectedEnv: string
  currentEnvDetails?: any
  myRole?: string
  isLoading?: boolean
  onOpenDeleteLock: (template: any) => void
  onOpenDuplicateLock: (template: any) => void
  onNavigateToManualControl?: (preselect: {
    product: "SRE" | "DLS"
    method: string
    params: Record<string, any>
    autoExecute?: boolean
  }) => void
}

export function LocksTab({
  appId,
  locks,
  selectedEnv,
  currentEnvDetails,
  myRole,
  isLoading,
  onOpenDeleteLock,
  onOpenDuplicateLock,
  onNavigateToManualControl,
}: LocksTabProps) {
  const isViewer = myRole === 'VIEWER'
  const envColors = getEnvColors(selectedEnv, currentEnvDetails?.color, currentEnvDetails?.id)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span>{locks.length === 1 ? '1 lock configurado' : `${locks.length} locks configurados`} en</span>
          <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
            {selectedEnv}
          </span>
        </p>
        {!isViewer && (
          <Link href={`/dashboard/applications/${appId}/locks/new?envId=${currentEnvDetails?.id}&env=${selectedEnv}`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Lock
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-card/50 border-border py-0">
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locks.length === 0 ? (
        <Card className="bg-card/50 border-border py-0">
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <p className="font-medium text-foreground mb-1">No hay locks configurados</p>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Crea locks distribuidos para coordinar procesos concurrentes y evitar condiciones de carrera.
            </p>
            {!isViewer && (
              <Link href={`/dashboard/applications/${appId}/locks/new?envId=${currentEnvDetails?.id}&env=${selectedEnv}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Lock
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {locks.map((lock: any) => (
                <Card key={lock.id} className={cn("bg-card/50 border-border py-0 border-l-2", envColors.borderStrong)}>
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", envColors.bg)}>
                        <Lock className={cn("h-5 w-5", envColors.text)} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="font-mono font-medium text-sm sm:text-base break-all sm:break-normal">{lock.namespace}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                          <span className="capitalize">Tipo {lock.lockType === "EXCLUSIVE" ? "exclusivo" : "lectura-escritura"}</span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span>Tipo de Adquisicion: {{'FAIL': 'Fallo', 'RETRY': 'Reintento', 'QUEUE': 'Encolar'}[lock.conflictResolution as string] || lock.conflictResolution}</span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span>Deadlocks: {lock.deadlockResolutionStrategy}</span>
                          <span className="hidden sm:inline text-muted-foreground/50">•</span>
                          <span>Fencing Tokens: {lock.fencingTokenRequired ? "Activado" : "Desactivado"}</span>
                        </div>
                        {lock.description && (
                          <p className="text-xs text-muted-foreground italic mt-1 pr-6 line-clamp-1">
                            {lock.description}
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
                            <Link href={`/dashboard/applications/${appId}/locks/${lock.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Settings className="h-4 w-4 mr-2" />
                                Configurar
                              </DropdownMenuItem>
                            </Link>
                            {onNavigateToManualControl && (
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center"
                                onClick={() =>
                                  onNavigateToManualControl({
                                    product: "DLS",
                                    method: "GET_LOCK_STATUS",
                                    params: { namespace: lock.namespace, lockKey: "" },
                                  })
                                }
                              >
                                <SlidersHorizontal className="h-4 w-4 mr-2 text-primary shrink-0" />
                                <span>Ver en Control Manual...</span>
                              </DropdownMenuItem>
                            )}
                            {onOpenDuplicateLock && (
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center"
                                onClick={() => onOpenDuplicateLock(lock)}
                              >
                                <Copy className="h-4 w-4 mr-2 shrink-0" />
                                <span>Duplicar a otro ambiente...</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => onOpenDeleteLock(lock)}>
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
