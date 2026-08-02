"use client"

import React, { useState } from "react"
import { Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn, getEnvColors } from "@/lib/utils"

interface DuplicateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: any | null
  environments: any[]
  currentEnvId?: string
  onSuccess?: () => void
}

export function DuplicateTemplateDialog({
  open,
  onOpenChange,
  template,
  environments,
  currentEnvId,
  onSuccess,
}: DuplicateTemplateDialogProps) {
  const [selectedEnvIds, setSelectedEnvIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const targetEnvironments = environments.filter(
    (env) => env.id !== currentEnvId && env.id?.toString() !== currentEnvId
  )

  const handleToggleEnv = (envId: string) => {
    setSelectedEnvIds((prev) =>
      prev.includes(envId) ? prev.filter((id) => id !== envId) : [...prev, envId]
    )
  }

  const handleDuplicate = async () => {
    if (!template || selectedEnvIds.length === 0) return
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const results = await Promise.all(
        selectedEnvIds.map((targetEnvId) =>
          fetch("/api/shared-resource-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: template.name,
              description: template.description || "",
              type: template.type || "UNITARY",
              conflictResolution: template.conflictResolution || "WAIT",
              environmentId: targetEnvId,
              defaultTtlSec: template.defaultTtlSec || 3600,
            }),
          })
        )
      )

      const hasError = results.some((res) => !res.ok)
      if (hasError) {
        setErrorMessage("Ocurrió un error al duplicar el recurso en uno o más ambientes.")
      } else {
        onOpenChange(false)
        setSelectedEnvIds([])
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
      setErrorMessage("Error de conexión al duplicar el recurso.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Duplicar Recurso Compartido
          </DialogTitle>
          <DialogDescription>
            Copia la configuración del recurso{" "}
            <span className="font-semibold text-foreground">{template?.name}</span> a otros ambientes de esta aplicación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Seleccionar Ambientes de Destino
          </p>

          {targetEnvironments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No hay otros ambientes disponibles para duplicar en esta aplicación.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {targetEnvironments.map((env) => {
                const colors = getEnvColors(env.name)
                const isChecked = selectedEnvIds.includes(env.id.toString())
                return (
                  <div
                    key={env.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                      isChecked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
                    )}
                    onClick={() => handleToggleEnv(env.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`env-${env.id}`}
                        checked={isChecked}
                        onCheckedChange={() => handleToggleEnv(env.id.toString())}
                      />
                      <Label htmlFor={`env-${env.id}`} className="cursor-pointer font-medium text-sm flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
                        {env.name}
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-destructive font-medium">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={selectedEnvIds.length === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Duplicar en {selectedEnvIds.length} ambiente{selectedEnvIds.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
