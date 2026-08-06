import React from 'react'
import { Key, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, getEnvColors } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ApiKeysTabProps {
  apiKeys: any[]
  isApiKeysLoading: boolean
  selectedEnv: string
  currentEnvDetails?: any
  myRole?: string
  onCreateApiKey: () => void
  onOpenRevokeKey: (key: any) => void
}

export function ApiKeysTab({
  apiKeys,
  isApiKeysLoading,
  selectedEnv,
  currentEnvDetails,
  myRole,
  onCreateApiKey,
  onOpenRevokeKey,
}: ApiKeysTabProps) {
  const isViewer = myRole === 'VIEWER'
  const envColors = getEnvColors(selectedEnv, null, currentEnvDetails?.id)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span>{apiKeys.length === 1 ? '1 API Key configurada' : `${apiKeys.length} API Keys configuradas`} en</span>
          <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
            {selectedEnv}
          </span>
        </p>
        {!isViewer && (
          <Button className="gap-2" onClick={onCreateApiKey} disabled={!currentEnvDetails?.id}>
            <Plus className="h-4 w-4" />
            Generar API Key
          </Button>
        )}
      </div>

      {isApiKeysLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border/70 bg-card/70 dark:bg-card/50 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0 bg-primary/20 dark:bg-primary/15 border border-primary/20" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-36 sm:w-48 rounded bg-muted-foreground/30 dark:bg-muted-foreground/20" />
                  <Skeleton className="h-3 w-56 sm:w-64 rounded bg-muted-foreground/20 dark:bg-muted-foreground/15" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg shrink-0 bg-muted-foreground/20 dark:bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 flex items-center gap-1.5 flex-wrap justify-center">
              <span>No hay API Keys configuradas en</span>
              <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
                {selectedEnv}
              </span>
            </p>
            {!isViewer && (
              <Button className="gap-2" onClick={onCreateApiKey} disabled={!currentEnvDetails?.id}>
                <Plus className="h-4 w-4" />
                Crear API Key
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key: any) => (
            <Card
              key={key.id}
              className={cn(
                'bg-card/50 border-border py-0 border-l-2',
                getEnvColors(selectedEnv).borderStrong
              )}
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                      key.state === 'ACTIVE'
                        ? cn(
                            getEnvColors(selectedEnv).bg,
                            getEnvColors(selectedEnv).border,
                            getEnvColors(selectedEnv).text
                          )
                        : 'bg-secondary text-muted-foreground border-border'
                    )}
                  >
                    <Key className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm sm:text-base">{key.keyPrefix}••••••••••••</p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          key.state === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}
                      >
                        {key.state === 'ACTIVE' ? 'Activa' : 'Revocada'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creada el: {new Date(key.createdAt).toLocaleString()}
                      {key.revokedAt && ` • Revocada el: ${new Date(key.revokedAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                {key.state === 'ACTIVE' && !isViewer && (
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1 px-3"
                      onClick={() => onOpenRevokeKey(key)}
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
  )
}
