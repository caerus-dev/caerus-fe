"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Box, Save, Trash2 } from "lucide-react"

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
  name: z.string().min(2, {
    message: "El nombre del recurso debe tener al menos 2 caracteres.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "El nombre solo puede contener letras minúsculas, números y guiones bajos.",
  }),
  description: z.string().optional(),
  mode: z.enum(["unit", "multiple"]),
  ttl: z.coerce.number().min(1, { message: "El TTL debe ser de al menos 1 minuto." }),
  saveMetadata: z.boolean().default(false),
  conflictStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(100).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  idempotency: z.boolean().default(false),
})

export type ResourceFormValues = z.infer<typeof formSchema>

interface ResourceFormProps {
  applicationId: string
  initialData?: ResourceFormValues
  isEditing?: boolean
}

export function ResourceForm({ applicationId, initialData, isEditing = false }: ResourceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      mode: "unit",
      ttl: 15,
      saveMetadata: false,
      conflictStrategy: "fail",
      retryInterval: 500,
      maxRetries: 3,
      idempotency: false,
    },
  })

  const conflictStrategy = form.watch("conflictStrategy")

  function onSubmit(values: ResourceFormValues) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Submitted:", values)
      setIsSubmitting(false)
      router.push(`/dashboard/applications/${applicationId}`)
    }, 1000)
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
            {isEditing ? "Editar Plantilla de Recurso" : "Nueva Plantilla de Recurso"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Modifica la configuración de un recurso compartido existente."
              : "Define un nuevo recurso compartido para ser gestionado por el motor SRE."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Configuración Básica
              </CardTitle>
              <CardDescription>
                Define la identidad y el ciclo de vida de este recurso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Base (Namespace)</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. seat, trip_capacity" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormDescription>
                        Identificador único para este tipo de recurso.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modo del Recurso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar modo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Unitario (Instancia única)</SelectItem>
                          <SelectItem value="multiple">Múltiple (Stock / Capacidad)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determina si es un objeto único o un conjunto de elementos.
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
                      <Textarea placeholder="¿Para qué se utiliza este recurso?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ttl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TTL por Defecto (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tiempo máximo que una reserva permanece activa antes de liberarse automáticamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="saveMetadata"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Guardar Metadatos</FormLabel>
                        <FormDescription>
                          Permitir almacenar datos JSON contextuales con las reservas.
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
              <CardTitle className="text-lg">Concurrencia y Fiabilidad</CardTitle>
              <CardDescription>
                Configura cómo maneja el motor las solicitudes concurrentes y problemas de red.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="conflictStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrategia de Conflicto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estrategia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fail">Fallo (Error inmediato)</SelectItem>
                          <SelectItem value="retry">Reintento (Auto-reintentar)</SelectItem>
                          <SelectItem value="queue">Cola (Lista de espera)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Comportamiento cuando el recurso no está disponible actualmente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idempotency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Idempotencia</FormLabel>
                        <FormDescription>
                          Prevenir efectos secundarios duplicados en los reintentos de red.
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

              {conflictStrategy === "retry" && (
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
              <Button type="button" variant="destructive" className="gap-2">
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
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? "Guardar Cambios" : "Crear Recurso"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
