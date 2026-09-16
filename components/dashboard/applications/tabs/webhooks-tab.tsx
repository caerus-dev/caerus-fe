import React, { useState } from 'react'
import { Plus, Trash2, Edit, RefreshCw, Webhook, MoreVertical, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn, getEnvColors } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WebhookDeliveriesView } from './webhook-deliveries-view'

interface WebhooksTabProps {
  webhooks: any[]
  isWebhooksLoading: boolean
  selectedEnv: string
  currentEnvDetails?: any
  myRole?: string
  onDeleteWebhook: (id: string) => Promise<void>
  onToggleWebhook: (id: string, isActive: boolean) => Promise<void>
  onRotateSecret: (id: string) => Promise<void>
  openFormDialog: (webhook?: any) => void
}

export function WebhooksTab({
  webhooks,
  isWebhooksLoading,
  selectedEnv,
  currentEnvDetails,
  myRole,
  onDeleteWebhook,
  onToggleWebhook,
  onRotateSecret,
  openFormDialog,
}: WebhooksTabProps) {
  const isViewer = myRole === 'VIEWER'
  const envColors = getEnvColors(selectedEnv, currentEnvDetails?.color, currentEnvDetails?.id)
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null)

  const activeWebhook = selectedWebhookId
    ? webhooks.find((w: any) => w.id === selectedWebhookId)
    : null

  // Si hay un webhook seleccionado, mostramos la vista detallada (Stripe Deliveries Split-View)
  if (activeWebhook) {
    return (
      <WebhookDeliveriesView
        webhook={activeWebhook}
        selectedEnv={selectedEnv}
        currentEnvDetails={currentEnvDetails}
        myRole={myRole}
        onBack={() => setSelectedWebhookId(null)}
        onEditWebhook={openFormDialog}
        onRotateSecret={onRotateSecret}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span>{webhooks.length === 1 ? '1 Webhook configurado' : `${webhooks.length} Webhooks configurados`} en</span>
          <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
            {selectedEnv}
          </span>
        </p>
        {!isViewer && (
          <Button className="gap-2" onClick={() => openFormDialog()} disabled={!currentEnvDetails?.id}>
            <Plus className="h-4 w-4" />
            Añadir Endpoint
          </Button>
        )}
      </div>

      {isWebhooksLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border/70 bg-card/70 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-64 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 flex items-center gap-1.5 flex-wrap justify-center">
              <span>No hay Webhooks configurados en</span>
              <span className={cn("font-mono font-semibold px-2 py-0.5 rounded-md text-xs gap-1.5 inline-flex items-center border", envColors.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", envColors.dot)} />
                {selectedEnv}
              </span>
            </p>
            {!isViewer && (
              <Button className="gap-2" onClick={() => openFormDialog()} disabled={!currentEnvDetails?.id}>
                <Plus className="h-4 w-4" />
                Añadir Endpoint
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook: any) => (
            <Card
              key={webhook.id}
              className={cn(
                'bg-card/50 border-border py-0 border-l-2',
                webhook.isActive ? envColors.borderStrong : 'border-muted-foreground/30'
              )}
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    onClick={() => setSelectedWebhookId(webhook.id)}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border cursor-pointer hover:opacity-80 transition-opacity',
                      webhook.isActive
                        ? cn(envColors.bg, envColors.border, envColors.text)
                        : 'bg-secondary text-muted-foreground border-border'
                    )}
                  >
                    <Webhook className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        onClick={() => setSelectedWebhookId(webhook.id)}
                        className="font-mono text-sm sm:text-base truncate max-w-[200px] sm:max-w-[400px] cursor-pointer hover:text-primary transition-colors font-medium"
                      >
                        {webhook.url}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          webhook.isActive
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {webhook.isActive ? 'Activo' : 'Pausado'}
                      </span>
                    </div>
                    {webhook.description && (
                      <p
                        onClick={() => setSelectedWebhookId(webhook.id)}
                        className="text-sm font-medium cursor-pointer hover:text-primary transition-colors truncate"
                      >
                        {webhook.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate max-w-[250px] sm:max-w-[500px]">
                      Suscrito a: {webhook.eventTypes?.length || 0} evento(s) {webhook.eventTypes?.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWebhookId(webhook.id)}
                    className="gap-1.5 h-8 text-xs cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Entregas</span>
                  </Button>

                  {!isViewer && (
                    <>
                      <div className="flex items-center space-x-2 mr-1">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={(checked) => onToggleWebhook(webhook.id, checked)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedWebhookId(webhook.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Ver entregas
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFormDialog(webhook)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRotateSecret(webhook.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Rotar Secreto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
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
