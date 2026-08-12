export interface Lock {
  id: string
  namespace: string
  description?: string
  type: 'exclusive' | 'read-write'
  ttl: number
  deadlockStrategy: 'alert' | 'kill'
  webhookUrl?: string
  acquisitionStrategy: 'fail' | 'retry' | 'blocking'
  retryInterval?: number
  maxRetries?: number
  requireFencingToken: boolean
  status: 'active' | 'paused'
  activeLocks: number
  createdAt: string
  updatedAt: string
}
