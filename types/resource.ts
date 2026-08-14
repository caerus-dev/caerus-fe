export interface Resource {
  id: string
  name: string
  description?: string
  mode: 'unit' | 'multiple'
  ttl: number
  saveMetadata: boolean
  conflictStrategy: 'fail' | 'retry' | 'queue'
  retryInterval?: number
  maxRetries?: number
  idempotency: boolean
  notificationWebhookUrl?: string
  status: 'active' | 'paused' | 'archived'
  activeReservations: number
  createdAt: string
  updatedAt: string
}
