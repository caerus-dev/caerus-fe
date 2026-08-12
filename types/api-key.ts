export interface ApiKey {
  id: string
  name: string
  prefix: string
  environment: 'dev' | 'staging' | 'prod'
  applicationName: string
  createdAt: string
  lastUsed: string
}
