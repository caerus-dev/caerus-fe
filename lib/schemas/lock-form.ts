import * as z from "zod"

export const lockFormSchema = z.object({
  namespace: z.string().min(2, {
    message: "El Namespace debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El Namespace no puede superar los 100 caracteres.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "El Namespace solo puede contener letras minúsculas, números y guiones bajos.",
  }),
  description: z.string().max(500, {
    message: "La descripción no puede superar los 500 caracteres.",
  }).optional(),
  type: z.enum(["exclusive", "read-write"]),
  deadlockStrategy: z.enum(["alert", "kill"]),
  acquisitionStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number()
    .min(10, { message: "El intervalo debe ser de al menos 10 ms." })
    .max(30000, { message: "El intervalo no puede superar los 30.000 ms (30 segundos)." })
    .optional(),
  maxRetries: z.coerce.number()
    .min(1, { message: "El número de reintentos debe ser de al menos 1." })
    .max(10, { message: "El número máximo de reintentos no puede superar los 10." })
    .optional(),
  requireFencingToken: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.acquisitionStrategy === "retry") {
    const interval = data.retryInterval ?? 100;
    const retries = data.maxRetries ?? 5;
    if (interval * retries > 30000) {
      ctx.addIssue({
        code: "custom",
        message: "El tiempo total de espera acumulado (intervalo x reintentos) no debe superar los 30.000 ms. Usa la estrategia Cola (queue).",
        path: ["retryInterval"],
      });
    }
  }
})

export type LockFormValues = z.infer<typeof lockFormSchema>
