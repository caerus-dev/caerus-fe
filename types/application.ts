export interface Application {
  id: string
  name: string
  description?: string
  environmentsCount: number
  resourcesCount: number
  locksCount: number
  status: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface ResourceItem {
  id: string
  name: string
  mode: 'unit' | 'multiple' | string
  status: 'active' | 'paused' | 'archived' | string
  activeReservations: number
}

export interface LockItem {
  id: string
  name: string
  type: 'exclusive' | 'read-write' | string
  status: 'active' | 'paused' | string
  activeLocks: number
}

export interface ApiKeyItem {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsed: string
}

export interface EnvData {
  resources: ResourceItem[]
  locks: LockItem[]
  apiKeys: ApiKeyItem[]
}

export type AppEnvironmentsData = Record<'dev' | 'staging' | 'prod', EnvData>
