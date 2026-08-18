import { describe, it, expect } from 'vitest'
import * as z from 'zod'

// Resource form schema rules
const resourceSchema = z.object({
  name: z.string().min(2).regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
  mode: z.enum(["unit", "multiple"]),
  ttl: z.coerce.number().min(1),
  saveMetadata: z.boolean().default(false),
  conflictStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(1).max(10).optional(),
  maxRetries: z.coerce.number().min(1).max(5).optional(),
  idempotency: z.boolean().default(false),
  notificationWebhookUrl: z.string().max(255).optional().or(z.literal("")),
})

// Lock form schema rules
const lockSchema = z.object({
  namespace: z.string().min(2).regex(/^[a-z0-9_]+$/),
  description: z.string().optional(),
  type: z.enum(["exclusive", "read-write"]),
  ttl: z.coerce.number().min(1),
  deadlockStrategy: z.enum(["alert", "kill"]),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  acquisitionStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(10).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  requireFencingToken: z.boolean().default(false),
})

describe('Validation Schemas (Reglas de Negocio Zod)', () => {
  describe('Resource Form Schema', () => {
    it('should pass with valid resource payload', () => {
      const validPayload = {
        name: 'seat_reservation_v1',
        mode: 'multiple',
        ttl: 300,
        conflictStrategy: 'retry',
        retryInterval: 2,
        maxRetries: 3,
      }
      const result = resourceSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('should reject names with uppercase or special characters', () => {
      const invalidPayload = {
        name: 'Seat-Reservation!',
        mode: 'unit',
        ttl: 10,
        conflictStrategy: 'fail',
      }
      const result = resourceSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })

    it('should reject TTL less than 1 second', () => {
      const invalidPayload = {
        name: 'valid_name',
        mode: 'unit',
        ttl: 0,
        conflictStrategy: 'fail',
      }
      const result = resourceSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })
  })

  describe('Lock Form Schema', () => {
    it('should pass with valid lock payload', () => {
      const validPayload = {
        namespace: 'payment_sync_lock',
        type: 'exclusive',
        ttl: 60,
        deadlockStrategy: 'alert',
        acquisitionStrategy: 'retry',
        retryInterval: 15,
        maxRetries: 3,
        requireFencingToken: true,
      }
      const result = lockSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    it('should reject invalid lock namespace formats', () => {
      const invalidPayload = {
        namespace: 'Payment Sync',
        type: 'exclusive',
        ttl: 60,
        deadlockStrategy: 'alert',
        acquisitionStrategy: 'fail',
      }
      const result = lockSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })

    it('should reject invalid webhook URL', () => {
      const invalidPayload = {
        namespace: 'valid_lock',
        type: 'exclusive',
        ttl: 60,
        deadlockStrategy: 'alert',
        acquisitionStrategy: 'fail',
        webhookUrl: 'not-a-valid-url',
      }
      const result = lockSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
    })
  })
})
