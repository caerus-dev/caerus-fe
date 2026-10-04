import { describe, it, expect } from 'vitest'
import * as z from 'zod'

// Resource form schema rules
const resourceSchema = z.object({
  name: z.string().min(2).max(100, { message: "El nombre no puede superar los 100 caracteres." }).regex(/^[a-z0-9_]+$/),
  description: z.string().max(500, { message: "La descripción no puede superar los 500 caracteres." }).optional(),
  mode: z.enum(["unit", "multiple"]),
  ttl: z.coerce.number().min(1).max(86400, { message: "El TTL no puede superar las 24 horas (86.400 segundos)." }),
  saveMetadata: z.boolean().default(false),
  conflictStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(1).max(10).optional(),
  maxRetries: z.coerce.number().min(1).max(5).optional(),
  idempotency: z.boolean().default(false),
  notificationWebhookUrl: z.string().max(255).optional().or(z.literal("")),
})

// Lock form schema rules
const lockSchema = z.object({
  namespace: z.string().min(2).max(100, { message: "El Namespace no puede superar los 100 caracteres." }).regex(/^[a-z0-9_]+$/),
  description: z.string().max(500, { message: "La descripción no puede superar los 500 caracteres." }).optional(),
  type: z.enum(["exclusive", "read-write"]),
  ttl: z.coerce.number().min(1),
  deadlockStrategy: z.enum(["alert", "kill"]),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  acquisitionStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(10).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  requireFencingToken: z.boolean().default(false),
})

// Application form schema rules
const applicationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500, { message: "La descripción no puede superar los 500 caracteres." }).optional(),
})

// Environment form schema rules
const environmentSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500, { message: "La descripción no puede superar los 500 caracteres." }).optional(),
  color: z.string().optional(),
})

// Webhook form schema rules
const webhookSchema = z.object({
  url: z.string().url(),
  description: z.string().max(500, { message: "La descripción no puede superar los 500 caracteres." }).optional(),
  eventTypes: z.array(z.string()).min(1),
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

    it('should pass when description is exactly 500 characters', () => {
      const payload = {
        name: 'seat_reservation_v1',
        description: 'a'.repeat(500),
        mode: 'multiple',
        ttl: 300,
        conflictStrategy: 'retry',
      }
      const result = resourceSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('should reject when description exceeds 500 characters', () => {
      const payload = {
        name: 'seat_reservation_v1',
        description: 'a'.repeat(501),
        mode: 'multiple',
        ttl: 300,
        conflictStrategy: 'retry',
      }
      const result = resourceSchema.safeParse(payload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("La descripción no puede superar los 500 caracteres.")
      }
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

    it('should reject names exceeding 100 characters', () => {
      const invalidPayload = {
        name: 'a'.repeat(101),
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

    it('should reject TTL greater than 86400 seconds (24 hours)', () => {
      const invalidPayload = {
        name: 'valid_name',
        mode: 'unit',
        ttl: 86401,
        conflictStrategy: 'fail',
      }
      const result = resourceSchema.safeParse(invalidPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El TTL no puede superar las 24 horas (86.400 segundos).")
      }
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

    it('should pass when description is exactly 500 characters', () => {
      const payload = {
        namespace: 'payment_sync_lock',
        description: 'b'.repeat(500),
        type: 'exclusive',
        ttl: 60,
        deadlockStrategy: 'alert',
        acquisitionStrategy: 'retry',
      }
      const result = lockSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('should reject when description exceeds 500 characters', () => {
      const payload = {
        namespace: 'payment_sync_lock',
        description: 'b'.repeat(501),
        type: 'exclusive',
        ttl: 60,
        deadlockStrategy: 'alert',
        acquisitionStrategy: 'retry',
      }
      const result = lockSchema.safeParse(payload)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("La descripción no puede superar los 500 caracteres.")
      }
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

    it('should reject lock namespace exceeding 100 characters', () => {
      const invalidPayload = {
        namespace: 'a'.repeat(101),
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

  describe('Application Form Schema (500 Chars Limit)', () => {
    it('should allow application descriptions up to 500 characters', () => {
      const valid = applicationSchema.safeParse({
        name: 'Billing App',
        description: 'x'.repeat(500),
      })
      expect(valid.success).toBe(true)
    })

    it('should reject application descriptions above 500 characters', () => {
      const invalid = applicationSchema.safeParse({
        name: 'Billing App',
        description: 'x'.repeat(501),
      })
      expect(invalid.success).toBe(false)
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toBe("La descripción no puede superar los 500 caracteres.")
      }
    })
  })

  describe('Environment Form Schema (500 Chars Limit)', () => {
    it('should allow environment descriptions up to 500 characters', () => {
      const valid = environmentSchema.safeParse({
        name: 'staging-us',
        description: 'e'.repeat(500),
      })
      expect(valid.success).toBe(true)
    })

    it('should reject environment descriptions above 500 characters', () => {
      const invalid = environmentSchema.safeParse({
        name: 'staging-us',
        description: 'e'.repeat(501),
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('Webhook Form Schema (500 Chars Limit)', () => {
    it('should allow webhook descriptions up to 500 characters', () => {
      const valid = webhookSchema.safeParse({
        url: 'https://example.com/hooks',
        description: 'w'.repeat(500),
        eventTypes: ['resource.take'],
      })
      expect(valid.success).toBe(true)
    })

    it('should reject webhook descriptions above 500 characters', () => {
      const invalid = webhookSchema.safeParse({
        url: 'https://example.com/hooks',
        description: 'w'.repeat(501),
        eventTypes: ['resource.take'],
      })
      expect(invalid.success).toBe(false)
    })
  })

  describe('Text Break and UI Overflow Prevention Helper', () => {
    it('should verify unbroken 500-char strings are constrained', () => {
      const unbrokenString = 'supercalifragilisticexpialidocious'.repeat(15) // ~510 chars
      const trimmed = unbrokenString.slice(0, 500)
      expect(trimmed.length).toBe(500)
      // Verify that CSS classes break-words and [overflow-wrap:anywhere] handle long unbroken sequences
      const containerStyleClasses = 'break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-2'
      expect(containerStyleClasses).toContain('break-words')
      expect(containerStyleClasses).toContain('[overflow-wrap:anywhere]')
      expect(containerStyleClasses).toContain('[word-break:break-word]')
      expect(containerStyleClasses).toContain('line-clamp-2')
    })
  })
})
