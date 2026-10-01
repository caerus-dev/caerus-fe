import type { SharedResourceApi, UnitaryResource, ResourceHolder } from '@caerus-dev/sdk'
import { SeatState, SdkCallLog } from './types'

export type ConflictPolicy = 'FAIL' | 'QUEUE'

const ROWS = ['A', 'B', 'C']
const COLS = [1, 2, 3, 4, 5, 6, 7, 8]

export function createInitialSeats(): SeatState[] {
  const seats: SeatState[] = []
  for (const row of ROWS) {
    for (const col of COLS) {
      const code = `${row}${col}`
      seats.push({
        id: `seat_${code.toLowerCase()}`,
        code,
        status: 'AVAILABLE',
        price: 4500,
      })
    }
  }
  return seats
}

export class SreSimulation {
  private seats: Map<string, SeatState>
  private queue: Map<string, { queueId: string; user: string }[]>
  private policy: ConflictPolicy = 'FAIL'
  private nowSeconds: number

  constructor(initialSeats?: SeatState[]) {
    this.seats = new Map()
    this.queue = new Map()
    this.nowSeconds = Math.floor(Date.now() / 1000)

    const baseSeats = initialSeats || createInitialSeats()
    for (const s of baseSeats) {
      this.seats.set(s.code, { ...s })
    }
  }

  setPolicy(policy: ConflictPolicy) {
    this.policy = policy
  }

  getPolicy(): ConflictPolicy {
    return this.policy
  }

  getSeats(): SeatState[] {
    return Array.from(this.seats.values())
  }

  getQueueForSeat(code: string): { queueId: string; user: string }[] {
    return this.queue.get(code) || []
  }

  takeSeat(code: string, byUser = 'Ana'): { success: boolean; log: SdkCallLog } {
    const seat = this.seats.get(code)
    const startTime = Date.now()
    const logId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    if (!seat) {
      return {
        success: false,
        log: {
          id: logId,
          timestamp: startTime,
          method: `await caerus.unitary('${code}').take()`,
          argsString: `{ ttlSeconds: 120 }`,
          action: 'take',
          status: 'ERROR',
          errorSummary: `ResourceNotFoundError: Resource '${code}' does not exist`,
          durationMs: 1,
        },
      }
    }

    // Si la butaca está retenida por el usuario que llama, es una liberación (release)
    const isHeldByCaller = seat.holderUser === byUser

    if (isHeldByCaller) {
      const oldHolderId = seat.holderId!
      seat.status = 'AVAILABLE'
      seat.holderId = undefined
      seat.holderUser = undefined
      seat.expiresAtSeconds = undefined

      // Si había alguien esperando en cola FIFO, promoverlo automáticamente
      const queuedList = this.queue.get(code)
      let promotedInfo = ''
      if (queuedList && queuedList.length > 0) {
        const next = queuedList.shift()!
        seat.status = next.user === 'Ana' ? 'HELD_BY_ME' : 'HELD_BY_OTHER'
        seat.holderId = `hld_${Math.random().toString(36).substring(2, 9)}`
        seat.holderUser = next.user
        seat.expiresAtSeconds = this.nowSeconds + 120
        promotedInfo = ` · Promovido ${next.user} de la cola FIFO con nuevo TTL de 120s`
      }

      return {
        success: true,
        log: {
          id: logId,
          timestamp: startTime,
          method: `await caerus.release('${oldHolderId}')`,
          argsString: `'${oldHolderId}'`,
          action: 'release',
          status: 'RELEASED',
          resultSummary: `RELEASED · Asiento ${code} liberado.${promotedInfo}`,
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'resource.released',
            payload: {
              resourceKey: seat.id,
              holderId: oldHolderId,
              status: 'RELEASED',
              occurredAt: new Date().toISOString(),
            },
          },
        },
      }
    }

    // Si está disponible: tomar
    if (seat.status === 'AVAILABLE') {
      const holderId = `hld_${Math.random().toString(36).substring(2, 9)}`
      seat.status = byUser === 'Ana' ? 'HELD_BY_ME' : 'HELD_BY_OTHER'
      seat.holderId = holderId
      seat.holderUser = byUser
      seat.expiresAtSeconds = this.nowSeconds + 120

      return {
        success: true,
        log: {
          id: logId,
          timestamp: startTime,
          method: `const holder = await caerus.unitary('${seat.id}').take({ ttlSeconds: 120 })`,
          argsString: `{ ttlSeconds: 120 }`,
          action: 'take',
          status: 'PENDING',
          resultSummary: `PENDING · Reserva válida por 120s · holderId: ${holderId} (${byUser})`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'resource.taken',
            payload: {
              resourceKey: seat.id,
              holderId,
              status: 'PENDING',
              expiresAt: new Date((this.nowSeconds + 120) * 1000).toISOString(),
            },
          },
        },
      }
    }

    // Si ya está ocupada por otro usuario o vendida: conflicto o cola
    if (this.policy === 'QUEUE' && seat.status !== 'SOLD') {
      const list = this.queue.get(code) || []
      // Evitar duplicar al mismo usuario consecutivamente en la cola
      const alreadyInQueue = list.some((item) => item.user === byUser)
      let qId = ''
      if (!alreadyInQueue) {
        qId = `q_${Math.random().toString(36).substring(2, 8)}`
        list.push({ queueId: qId, user: byUser })
        this.queue.set(code, list)
      }

      return {
        success: true,
        log: {
          id: logId,
          timestamp: startTime,
          method: `// Petición de ${byUser} en cola FIFO:\nconst holder = await caerus.unitary('${seat.id}').take({ ttlSeconds: 120 })`,
          argsString: `{ ttlSeconds: 120 }`,
          action: 'queue',
          status: 'PENDING',
          resultSummary: `QUEUED · ${byUser} ingresó a la cola de espera FIFO en posición #${list.length}`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'resource.queued',
            payload: {
              resourceKey: seat.id,
              position: list.length,
              queueId: qId || 'q_existing',
              user: byUser,
            },
          },
        },
      }
    }

    // Política FAIL
    return {
      success: false,
      log: {
        id: logId,
        timestamp: startTime,
        method: `// Petición de ${byUser} rechazada por contención:\nawait caerus.unitary('${seat.id}').take({ ttlSeconds: 120 })`,
        argsString: `{ ttlSeconds: 120 }`,
        action: 'take',
        status: 'CONFLICT',
        errorSummary: `ConflictError: Out of stock for resource: ${seat.id}`,
        durationMs: 1,
        generatedWebhookEvent: {
          type: 'resource.take_failed',
          payload: {
            resourceKey: seat.id,
            reason: 'OUT_OF_STOCK',
            attemptedBy: byUser,
          },
        },
      },
    }
  }

  simulateConcurrentConflict(): {
    targetSeat: SeatState
    policy: ConflictPolicy
    queuePosition?: number
    log: SdkCallLog
  } {
    // Buscar una butaca tomada por Ana o tomar A1 como Ana primero
    let target = Array.from(this.seats.values()).find((s) => s.status === 'HELD_BY_ME')
    if (!target) {
      this.takeSeat('A1', 'Ana')
      target = this.seats.get('A1')!
    }

    // Ahora Beto intenta tomar exactamente esa misma butaca
    const res = this.takeSeat(target.code, 'Beto')
    const queueList = this.queue.get(target.code) || []

    return {
      targetSeat: target,
      policy: this.policy,
      queuePosition: this.policy === 'QUEUE' ? queueList.length : undefined,
      log: res.log,
    }
  }

  advanceTime(seconds: number): SdkCallLog[] {
    this.nowSeconds += seconds
    const logs: SdkCallLog[] = []

    for (const seat of this.seats.values()) {
      if (
        (seat.status === 'HELD_BY_ME' || seat.status === 'HELD_BY_OTHER') &&
        seat.expiresAtSeconds
      ) {
        if (seat.expiresAtSeconds <= this.nowSeconds) {
          const expiredHolderId = seat.holderId
          seat.status = 'AVAILABLE'
          seat.holderId = undefined
          seat.holderUser = undefined
          seat.expiresAtSeconds = undefined

          // Verificar si hay alguien en cola para asignárselo
          const queuedList = this.queue.get(seat.code)
          let promotedNote = ''
          if (queuedList && queuedList.length > 0) {
            const next = queuedList.shift()!
            seat.status = next.user === 'Ana' ? 'HELD_BY_ME' : 'HELD_BY_OTHER'
            seat.holderId = `hld_${Math.random().toString(36).substring(2, 9)}`
            seat.holderUser = next.user
            seat.expiresAtSeconds = this.nowSeconds + 120
            promotedNote = ` -> Auto-asignado a ${next.user} desde la cola FIFO`
          }

          logs.push({
            id: `sweep_${Date.now()}_${seat.code}`,
            timestamp: Date.now(),
            method: `// [Sweeper Worker Backend]\n// TTL expirado para holder ${expiredHolderId} (${seat.code})`,
            argsString: `elapsed: +${seconds}s`,
            action: 'expiración',
            status: 'EXPIRED',
            resultSummary: `EXPIRED · Holder ${expiredHolderId} venció. Asiento ${seat.code} liberado${promotedNote}.`,
            durationMs: 1,
            generatedWebhookEvent: {
              type: 'resource.expired',
              payload: {
                resourceKey: seat.id,
                holderId: expiredHolderId,
                status: 'EXPIRED',
              },
            },
          })
        }
      }
    }

    return logs
  }

  confirmHeldSeats(seatCode?: string): SdkCallLog[] {
    const logs: SdkCallLog[] = []
    const targets = seatCode
      ? [this.seats.get(seatCode)].filter(Boolean) as SeatState[]
      : Array.from(this.seats.values())

    for (const seat of targets) {
      if ((seat.status === 'HELD_BY_ME' || seat.status === 'HELD_BY_OTHER') && seat.holderId) {
        const hId = seat.holderId
        const owner = seat.holderUser || (seat.status === 'HELD_BY_ME' ? 'Ana' : 'Beto')
        seat.status = 'SOLD'
        seat.expiresAtSeconds = undefined
        this.queue.delete(seat.code) // Al venderse definitivamente, la cola del recurso queda cerrada

        logs.push({
          id: `conf_${Date.now()}_${seat.code}`,
          timestamp: Date.now(),
          method: `await caerus.confirm('${hId}')`,
          argsString: `'${hId}'`,
          action: 'confirm',
          status: 'CONFIRMED',
          resultSummary: `CONFIRMED · Asiento ${seat.code} confirmado definitivamente por ${owner}. TTL cancelado.`,
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'resource.confirmed',
            payload: {
              resourceKey: seat.id,
              holderId: hId,
              confirmedBy: owner,
              status: 'CONFIRMED',
            },
          },
        })
      }
    }
    return logs
  }

  reset(): void {
    this.seats = new Map()
    this.queue = new Map()
    this.nowSeconds = Math.floor(Date.now() / 1000)

    for (const s of createInitialSeats()) {
      this.seats.set(s.code, { ...s })
    }
  }
}
