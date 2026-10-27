import * as z from "zod"

export const resourceFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del recurso debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no puede superar los 100 caracteres.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "El nombre solo puede contener letras minúsculas, números y guiones bajos.",
  }),
  description: z.string().max(500, {
    message: "La descripción no puede superar los 500 caracteres.",
  }).optional(),
  mode: z.enum(["unit", "multiple"]),
  ttl: z.coerce.number()
    .min(1, { message: "El TTL debe ser de al menos 1 segundo." })
    .max(86400, { message: "El TTL no puede superar las 24 horas (86.400 segundos)." }),
  saveMetadata: z.boolean().default(false),
  conflictStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(1, {
    message: "El intervalo de reintento debe ser de al menos 1 segundo."
  }).max(5, {
    message: "El intervalo de reintento no puede superar los 5 segundos."
  }).optional(),
  maxRetries: z.coerce.number().min(1, {
    message: "El número máximo de reintentos debe ser de al menos 1."
  }).max(5, {
    message: "El número máximo de reintentos no puede superar los 5."
  }).optional(),
  idempotency: z.boolean().default(false),
})

export type ResourceFormValues = z.infer<typeof resourceFormSchema>
