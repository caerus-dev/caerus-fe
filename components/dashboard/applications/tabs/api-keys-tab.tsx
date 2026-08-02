import React from 'react'
import { Key, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, getEnvColors } from '@/lib/utils'

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {apiKeys.length === 1 ? '1 API Key' : `${apiKeys.length} API Keys`}
        </p>
        {!isViewer && (
          <Button className="gap-2" onClick={onCreateApiKey} disabled={!currentEnvDetails?.id}>
            <Plus className="h-4 w-4" />
            Generar API Key
          </Button>
        )}
      </div>

      {isApiKeysLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay API Keys configuradas para este ambiente</p>
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
