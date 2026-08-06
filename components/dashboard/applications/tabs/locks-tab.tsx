import React from 'react'
import Link from 'next/link'
import { Lock, Plus, MoreVertical, Settings, Play, Trash2 } from 'lucide-react'
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
}

export function LocksTab({ appId, locks, selectedEnv, currentEnvDetails, myRole, isLoading }: LocksTabProps) {
  const isViewer = myRole === 'VIEWER'
  const envColors = getEnvColors(selectedEnv, null, currentEnvDetails?.id)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/20 text-primary'
      case 'paused':
        return 'bg-chart-4/20 text-chart-4'
      default:
        return 'bg-secondary text-muted-foreground'
    }
  }

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
          <Link href={`/dashboard/applications/${appId}/locks/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Lock
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl bg-secondary/80 dark:bg-muted/50 border border-border/60" />
          <Skeleton className="h-16 w-full rounded-xl bg-secondary/80 dark:bg-muted/50 border border-border/60" />
          <Skeleton className="h-16 w-full rounded-xl bg-secondary/80 dark:bg-muted/50 border border-border/60" />
        </div>
      ) : locks.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 flex items-center gap-1.5 flex-wrap justify-center">
              <span>Aún no hay configuraciones de locks en</span>
              <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
                {selectedEnv}
              </span>
            </p>
            {!isViewer && (
              <Link href={`/dashboard/applications/${appId}/locks/new`}>
                <Button className="gap-2">
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
            <Card
              key={lock.id}
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
                    <Lock className={cn('h-5 w-5', getEnvColors(selectedEnv).text)} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono font-medium text-sm sm:text-base break-all sm:break-normal">
                      {lock.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="capitalize">
                        Tipo {lock.type === 'exclusive' ? 'exclusivo' : 'lectura-escritura'}
                      </span>
                      <span className="hidden sm:inline text-muted-foreground/50">•</span>
                      <span>{lock.activeLocks} activos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border/50 sm:border-0 pt-2.5 sm:pt-0">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                      lock.status
                    )}`}
                  >
                    {lock.status}
                  </span>
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
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Liberar Todos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
