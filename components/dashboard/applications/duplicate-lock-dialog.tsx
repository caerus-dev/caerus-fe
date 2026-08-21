"use client"

import React, { useState } from "react"
import { Copy, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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

interface DuplicateLockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: any | null
  environments: any[]
  currentEnvId?: string
  onSuccess?: () => void
}

function parseAndTranslateError(raw: any, templateName?: string, failedEnvNames: string[] = []): string {
  let msg = ""
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      msg = parsed.message || parsed.error || raw
    } catch {
      msg = raw
    }
  } else if (raw && typeof raw === "object") {
    msg = raw.message || raw.error || JSON.stringify(raw)
  }

  const envsLabel = failedEnvNames.length === 1
    ? `el ambiente "${failedEnvNames[0]}"`
    : failedEnvNames.length > 1
    ? `los ambientes: ${failedEnvNames.join(", ")}`
    : "los ambientes seleccionados"

  if (typeof msg === "string") {
    if (msg.includes("already exists")) {
      return `Ya existe una plantilla de lock con el nombre "${templateName || ''}" en ${envsLabel}.`
    }
    if (msg.includes("not found")) {
      return `El recurso o ${envsLabel} no fue encontrado.`
    }
  }

  return msg || `Ocurrió un error al duplicar el recurso en ${envsLabel}.`
}

export function DuplicateLockDialog({
  open,
  onOpenChange,
  template,
  environments,
  currentEnvId,
  onSuccess,
}: DuplicateLockDialogProps) {
  const [selectedEnvIds, setSelectedEnvIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

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
    setSuccessMessage("")

    try {
      const successfulEnvs: { id: string; name: string }[] = []
      const failedEnvsMap: { envId: string; envName: string; errorMsg: string }[] = []

      await Promise.all(
        selectedEnvIds.map(async (targetEnvId) => {
          const envObj = environments.find(
            (e) => e.id === targetEnvId || e.id?.toString() === targetEnvId
          )
          const envName = envObj?.name || targetEnvId
          const numericEnvId = isNaN(Number(targetEnvId)) ? targetEnvId : Number(targetEnvId)
          
          const payload = {
            namespace: template.namespace,
            description: template.description || "",
            lockType: template.lockType || "MUTEX",
            conflictResolution: (template.conflictResolution || "WAIT").toUpperCase(),
            retryIntervalMs: template.retryIntervalMs ? Number(template.retryIntervalMs) : null,
            maxRetryCount: template.maxRetryCount ? Number(template.maxRetryCount) : null,
            fencingTokenRequired: Boolean(template.fencingTokenRequired),
            deadlockResolutionStrategy: (template.deadlockResolutionStrategy || "TIMEOUT").toUpperCase(),
            environmentId: numericEnvId,
          }

          const res = await fetch("/api/distributed-lock-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

          if (res.ok) {
            successfulEnvs.push({ id: targetEnvId, name: envName })
          } else {
            const errData = await res.json().catch(() => ({}))
            const rawMsg = errData.error || errData.message || `Error (${res.status})`
            console.error(`Duplicate lock template error for env ${envName}:`, rawMsg)
            failedEnvsMap.push({ envId: targetEnvId, envName, errorMsg: rawMsg })
          }
        })
      )

      if (successfulEnvs.length > 0) {
        if (onSuccess) onSuccess()
        const successIds = new Set(successfulEnvs.map((s) => s.id))
        setSelectedEnvIds((prev) => prev.filter((id) => !successIds.has(id)))
      }

      if (failedEnvsMap.length > 0) {
        const failedNames = failedEnvsMap.map((f) => f.envName)
        const firstError = failedEnvsMap[0].errorMsg
        setErrorMessage(parseAndTranslateError(firstError, template?.namespace, failedNames))
        if (successfulEnvs.length > 0) {
          const successNames = successfulEnvs.map((s) => s.name).join(", ")
          setSuccessMessage(`Se duplicó exitosamente en: ${successNames}`)
          toast.success(`Plantilla de Lock "${template?.namespace}" duplicada exitosamente en: ${successNames}`)
        }
      } else {
        const successNames = successfulEnvs.map((s) => s.name).join(", ")
        toast.success(`Plantilla de Lock "${template?.namespace}" duplicada exitosamente en ${successfulEnvs.length === 1 ? "el ambiente" : "los ambientes"}: ${successNames}`)
        onOpenChange(false)
        setSelectedEnvIds([])
      }
    } catch (error) {
      console.error("Error duplicating lock template:", error)
      setErrorMessage("Error de conexión al duplicar la plantilla.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Copy className="h-5 w-5 text-primary" />
            Duplicar Plantilla de Lock Distribuido
          </DialogTitle>
          <DialogDescription className="text-sm">
            Copia la configuración de la plantilla{" "}
            <span className="font-semibold text-foreground">{template?.namespace}</span> a otros ambientes de esta aplicación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Seleccionar Ambientes de Destino
          </p>

          {targetEnvironments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No hay otros ambientes disponibles para duplicar en esta aplicación.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {targetEnvironments.map((env) => {
                const colors = getEnvColors(env.name, null, env.id)
                const isChecked = selectedEnvIds.includes(env.id.toString())
                return (
                  <div
                    key={env.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none",
                      isChecked
                        ? "border-primary/80 bg-primary/10 shadow-sm"
                        : "border-border/60 hover:bg-secondary/40 hover:border-border"
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
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", colors.dot)} />
                        <span>{env.name}</span>
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-3 border-t border-border/40 mt-1">
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
