import { describe, it, expect } from 'vitest'
import { lockFormSchema } from '@/lib/schemas/lock-form'
import { resourceFormSchema } from '@/lib/schemas/resource-form'

function issuePaths(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.error?.issues.map((i) => i.path.join('.')) ?? []
}

describe('lockFormSchema', () => {
  const valid = {
    namespace: 'payments_lock',
    type: 'exclusive',
    deadlockStrategy: 'alert',
    acquisitionStrategy: 'fail',
  }

  it('accepts a minimal valid payload and applies defaults', () => {
    const result = lockFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.requireFencingToken).toBe(true)
  })

  it('coerces numeric strings coming from number inputs', () => {
    const result = lockFormSchema.safeParse({ ...valid, retryInterval: '250', maxRetries: '3' })
    expect(result.success).toBe(true)
    expect(result.data?.retryInterval).toBe(250)
    expect(result.data?.maxRetries).toBe(3)
  })

  it('treats an empty numeric input as 0 and rejects it', () => {
    const result = lockFormSchema.safeParse({ ...valid, retryInterval: '' })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('retryInterval')
  })

  it.each(['a', 'Upper', 'with-dash', 'with space', ''])(
    'rejects invalid namespace %j',
    (namespace) => {
      const result = lockFormSchema.safeParse({ ...valid, namespace })
      expect(result.success).toBe(false)
      expect(issuePaths(result)).toContain('namespace')
    },
  )

  it('rejects a namespace over 100 characters', () => {
    const result = lockFormSchema.safeParse({ ...valid, namespace: 'a'.repeat(101) })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('namespace')
  })

  it('rejects a description over 500 characters', () => {
    const result = lockFormSchema.safeParse({ ...valid, description: 'x'.repeat(501) })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('description')
  })

  it('rejects unknown enum values', () => {
    const result = lockFormSchema.safeParse({ ...valid, type: 'shared' })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('type')
  })

  it.each([
    ['retryInterval', 9],
    ['retryInterval', 30001],
    ['maxRetries', 0],
    ['maxRetries', 11],
  ])('rejects %s out of range (%s)', (field, value) => {
    const result = lockFormSchema.safeParse({ ...valid, [field]: value })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain(field)
  })

  describe('retry total wait time', () => {
    const retry = { ...valid, acquisitionStrategy: 'retry' }

    it('accepts interval x retries up to 30000 ms', () => {
      expect(lockFormSchema.safeParse({ ...retry, retryInterval: 3000, maxRetries: 10 }).success).toBe(true)
    })

    it('rejects interval x retries above 30000 ms with a custom issue on retryInterval', () => {
      const result = lockFormSchema.safeParse({ ...retry, retryInterval: 5000, maxRetries: 10 })
      expect(result.success).toBe(false)
      const issue = result.error?.issues.find((i) => i.code === 'custom')
      expect(issue?.path).toEqual(['retryInterval'])
    })

    it('rejects the first value just above the 30000 ms limit', () => {
      expect(lockFormSchema.safeParse({ ...retry, retryInterval: 3001, maxRetries: 10 }).success).toBe(false)
    })

    it('falls back to 100 ms x 5 retries when values are omitted', () => {
      expect(lockFormSchema.safeParse(retry).success).toBe(true)
    })

    it('does not apply the limit to other acquisition strategies', () => {
      const result = lockFormSchema.safeParse({
        ...valid,
        acquisitionStrategy: 'queue',
        retryInterval: 5000,
        maxRetries: 10,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('resourceFormSchema', () => {
  const valid = {
    name: 'seat_hall',
    mode: 'unit',
    ttl: 60,
    conflictStrategy: 'fail',
  }

  it('accepts a minimal valid payload and applies defaults', () => {
    const result = resourceFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.saveMetadata).toBe(false)
    expect(result.data?.idempotency).toBe(false)
  })

  it('coerces numeric strings coming from number inputs', () => {
    const result = resourceFormSchema.safeParse({ ...valid, ttl: '120', retryInterval: '2', maxRetries: '3' })
    expect(result.success).toBe(true)
    expect(result.data?.ttl).toBe(120)
    expect(result.data?.retryInterval).toBe(2)
    expect(result.data?.maxRetries).toBe(3)
  })

  it('requires ttl and rejects an empty value', () => {
    expect(issuePaths(resourceFormSchema.safeParse({ ...valid, ttl: undefined }))).toContain('ttl')
    expect(issuePaths(resourceFormSchema.safeParse({ ...valid, ttl: '' }))).toContain('ttl')
  })

  it.each(['a', 'Upper', 'with-dash', 'with space', ''])(
    'rejects invalid name %j',
    (name) => {
      const result = resourceFormSchema.safeParse({ ...valid, name })
      expect(result.success).toBe(false)
      expect(issuePaths(result)).toContain('name')
    },
  )

  it.each([
    ['ttl', 0],
    ['ttl', 86401],
    ['retryInterval', 0],
    ['retryInterval', 6],
    ['maxRetries', 0],
    ['maxRetries', 6],
  ])('rejects %s out of range (%s)', (field, value) => {
    const result = resourceFormSchema.safeParse({ ...valid, [field]: value })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain(field)
  })

  it('accepts the boundary values', () => {
    const result = resourceFormSchema.safeParse({ ...valid, ttl: 86400, retryInterval: 5, maxRetries: 5 })
    expect(result.success).toBe(true)
  })

  it('rejects unknown enum values', () => {
    expect(issuePaths(resourceFormSchema.safeParse({ ...valid, mode: 'single' }))).toContain('mode')
    expect(issuePaths(resourceFormSchema.safeParse({ ...valid, conflictStrategy: 'drop' }))).toContain('conflictStrategy')
  })
})
