import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WebhookSecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  secret: string
}

export function WebhookSecretDialog({ open, onOpenChange, secret }: WebhookSecretDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secreto de Webhook Generado</DialogTitle>
          <DialogDescription>
            Copia este secreto ahora. Se usa para verificar la firma de las notificaciones que Caerus enviará a tu endpoint. Por motivos de seguridad, no se volverá a mostrar (pero podrás rotarlo si lo necesitas).
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={secret}
              className="font-mono bg-secondary/50 border-primary/20"
            />
          </div>
          <Button size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copiar</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cerrar y Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
