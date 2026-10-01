export type SdkCallStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RELEASED'
  | 'EXPIRED'
  | 'CONFLICT'
  | 'SUCCESS'
  | 'ERROR'

export interface SdkCallLog {
  id: string
  timestamp: number
  method: string
  argsString: string
  action: string
  status: SdkCallStatus
  resultSummary?: string
  errorSummary?: string
  durationMs: number
  generatedWebhookEvent?: {
    type: string
    payload: Record<string, unknown>
  }
}

export type SeatStatus = 'AVAILABLE' | 'HELD_BY_ME' | 'HELD_BY_OTHER' | 'QUEUED' | 'SOLD'

export interface SeatState {
  id: string
  code: string // e.g. "A1"
  status: SeatStatus
  holderId?: string
  holderUser?: string
  expiresAtSeconds?: number
  price: number
}
