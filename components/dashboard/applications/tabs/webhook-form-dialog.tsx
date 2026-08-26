import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WebhookFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { url: string; description: string; eventTypes: string[] }) => Promise<void>
  initialData?: { url: string; description?: string; eventTypes: string[] }
  isSubmitting?: boolean
}

export function WebhookFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: WebhookFormDialogProps) {
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    if (open) {
      setUrl(initialData?.url || '')
      setDescription(initialData?.description || '')
      setSelectedEventTypes(initialData?.eventTypes || [])
      setUrlError('')
      
      if (eventTypes.length === 0) {
        fetchEvents()
      }
    }
  }, [open, initialData])

  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const res = await fetch('/api/events/types')
      if (res.ok) {
        const data = await res.json()
        setEventTypes(Array.isArray(data) ? data : data.content || [])
      }
    } catch (err) {
      console.error('Error fetching event types', err)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUrlError('')
    await onSubmit({ url, description, eventTypes: selectedEventTypes })
  }

  const groupedEvents = eventTypes.reduce((acc, event) => {
    const eventName = typeof event === 'string' ? event : event.eventType || event.type || event.name || ''
    const namespace = eventName.split('.')[0] || 'other'
    if (!acc[namespace]) {
      acc[namespace] = []
    }
    acc[namespace].push({
      id: eventName,
      product: event.product || '',
      description: event.description || '',
    })
    return acc
  }, {} as Record<string, { id: string; product: string; description: string }[]>)

  const allEventIds = Object.values(groupedEvents).flat().map((e: any) => e.id)
  const isAllSelected = allEventIds.length > 0 && selectedEventTypes.length === allEventIds.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEventTypes(allEventIds)
    } else {
      setSelectedEventTypes([])
    }
  }

  const handleSelectGroup = (namespace: string, checked: boolean) => {
    const groupIds = groupedEvents[namespace].map((e: any) => e.id)
    if (checked) {
      const toAdd = groupIds.filter((id: string) => !selectedEventTypes.includes(id))
      setSelectedEventTypes([...selectedEventTypes, ...toAdd])
    } else {
      setSelectedEventTypes(selectedEventTypes.filter((id: string) => !groupIds.includes(id)))
    }
  }

  const handleSelectEvent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes([...selectedEventTypes, id])
    } else {
      setSelectedEventTypes(selectedEventTypes.filter((eId: string) => eId !== id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Webhook' : 'Nuevo Webhook'}</DialogTitle>
          <DialogDescription>
            Configura la URL a la que enviaremos los eventos seleccionados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-hidden">
          <div className="space-y-4 shrink-0">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL del Endpoint</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tu-dominio.com/webhooks"
                required
              />
              {urlError && <p className="text-sm text-destructive">{urlError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (Opcional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Webhook para notificar sobre recursos SRE"
              />
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <label className="text-sm font-medium">Eventos a suscribir</label>
              {allEventIds.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                  <label htmlFor="select-all" className="text-sm cursor-pointer">
                    Seleccionar todos
                  </label>
                </div>
              )}
            </div>

            <div className="overflow-y-auto pr-2 space-y-6 flex-1 min-h-[200px] border rounded-md p-4 bg-secondary/20">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(groupedEvents).length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No se encontraron eventos en el catálogo.
                </div>
              ) : (
                Object.entries(groupedEvents).map(([namespace, events]: [string, any]) => {
                  const groupIds = events.map((e: any) => e.id)
                  const isGroupSelected = groupIds.every((id: string) => selectedEventTypes.includes(id))
                  const isGroupPartiallySelected =
                    groupIds.some((id: string) => selectedEventTypes.includes(id)) && !isGroupSelected

                  return (
                    <div key={namespace} className="space-y-3">
                      <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-md">
                        <Checkbox
                          id={`group-${namespace}`}
                          checked={isGroupSelected}
                          data-state={
                            isGroupPartiallySelected ? 'indeterminate' : isGroupSelected ? 'checked' : 'unchecked'
                          }
                          onCheckedChange={(checked) => handleSelectGroup(namespace, checked as boolean)}
                        />
                        <label htmlFor={`group-${namespace}`} className="font-semibold capitalize cursor-pointer flex-1">
                          {namespace}
                        </label>
                      </div>
                      <div className="pl-6 space-y-2.5">
                        {events.map((event: any) => (
                          <div key={event.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`event-${event.id}`}
                              checked={selectedEventTypes.includes(event.id)}
                              onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`event-${event.id}`}
                                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {event.id}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                {event.product && <span className="font-semibold">{event.product} &bull; </span>}
                                {event.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedEventTypes.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Guardar Cambios' : 'Crear Webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
