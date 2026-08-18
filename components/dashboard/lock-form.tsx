"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Lock, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  namespace: z.string().min(2, {
    message: "El Namespace debe tener al menos 2 caracteres.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "El Namespace solo puede contener letras minúsculas, números y guiones bajos.",
  }),
  description: z.string().optional(),
  type: z.enum(["exclusive", "read-write"]),
  deadlockStrategy: z.enum(["alert", "kill"]),
  acquisitionStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(10).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  requireFencingToken: z.boolean().default(true),
})

export type LockFormValues = z.infer<typeof formSchema>

interface LockFormProps {
  applicationId: string
  environmentId?: string
  lockId?: string
  initialData?: LockFormValues
  isEditing?: boolean
}

export function LockForm({ applicationId, environmentId, lockId, initialData, isEditing = false }: LockFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<LockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      namespace: "",
      description: "",
      type: "exclusive",
      deadlockStrategy: "alert",
      acquisitionStrategy: "fail",
      retryInterval: 100,
      maxRetries: 5,
      requireFencingToken: true,
    },
  })

  const acquisitionStrategy = form.watch("acquisitionStrategy")
  const deadlockStrategy = form.watch("deadlockStrategy")

  async function onSubmit(values: LockFormValues) {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const payload = {
        environmentId: environmentId,
        namespace: values.namespace,
        description: values.description,
        lockType: values.type === "exclusive" ? "EXCLUSIVE" : "READ_WRITE",
        conflictResolution: values.acquisitionStrategy === "fail" ? "FAIL" : values.acquisitionStrategy === "retry" ? "RETRY" : "QUEUE",
        retryIntervalMs: values.acquisitionStrategy === "retry" ? values.retryInterval : 0,
        maxRetryCount: values.acquisitionStrategy === "retry" ? values.maxRetries : 0,
        fencingTokenRequired: values.requireFencingToken,
        deadlockResolutionStrategy: values.deadlockStrategy === "alert" ? "ALERT" : "KILL_PRIORITY"
      }

      const url = isEditing ? `/api/distributed-lock-templates/${lockId}` : "/api/distributed-lock-templates"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Hubo un error al guardar el lock")
      }

      router.push(`/dashboard/applications/${applicationId}`)
    } catch (error: any) {
      console.error(error)
      setApiError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que deseas eliminar este lock?")) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/distributed-lock-templates/${lockId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error eliminando el lock")
      router.push(`/dashboard/applications/${applicationId}`)
    } catch (e: any) {
      setApiError(e.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Plantilla de Lock" : "Nueva Plantilla de Lock"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Modifica la configuración de un lock distribuido existente."
              : "Define un nuevo namespace de lock para sincronización distribuida."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {apiError && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
              {apiError}
            </div>
          )}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-chart-2" />
                Configuración del Lock
              </CardTitle>
              <CardDescription>
                Define el comportamiento de este namespace de lock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="namespace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namespace (Prefijo de clave)</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. order_processing" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormDescription>
                        Identificador único para agrupar estos locks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Lock</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exclusive">Exclusivo (Mutex)</SelectItem>
                          <SelectItem value="read-write">Lectura / Escritura</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determina si se permiten múltiples lectores concurrentes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="¿Para qué se utiliza este lock?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requireFencingToken"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2 bg-chart-2/5 border-chart-2/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-chart-2 font-semibold">Fencing Tokens</FormLabel>
                        <FormDescription>
                          Genera tokens estrictamente incrementales para prevenir inconsistencias (RECOMENDADO)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Adquisición y Resolución de Deadlocks</CardTitle>
              <CardDescription>
                Configura cómo los workers adquieren locks y cómo se resuelven los bloqueos mutuos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="acquisitionStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrategia de Adquisición</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estrategia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fail">Fallo inmediato</SelectItem>
                          <SelectItem value="retry">Reintento automático</SelectItem>
                          <SelectItem value="queue">Encolar (Queue / FIFO)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deadlockStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrategia de Resolución de Deadlocks</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estrategia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alert">Solo alertar vía Webhook</SelectItem>
                          <SelectItem value="kill">Terminar proceso automáticamente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {acquisitionStrategy === "retry" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <FormField
                    control={form.control}
                    name="retryInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo de Reintento (ms)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxRetries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Reintentos</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            {isEditing ? (
              <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete} disabled={isSubmitting}>
                <Trash2 className="h-4 w-4" />
                Eliminar Plantilla
              </Button>
            ) : (
              <div /> // Spacer
            )}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90">
                <Save className="h-4 w-4" />
                {isEditing ? "Guardar Cambios" : "Crear Configuración de Lock"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
