import { describe, it, expect, beforeEach } from 'vitest'
import { SreSimulation, createInitialSeats } from '@/components/playground/sre-simulation'
import { DlsSimulation } from '@/components/playground/dls-simulation'

describe('SreSimulation Engine', () => {
  let sim: SreSimulation

  beforeEach(() => {
    sim = new SreSimulation()
  })

  it('initializes 24 seats with status AVAILABLE', () => {
    const seats = sim.getSeats()
    expect(seats).toHaveLength(24)
    expect(seats.every((s) => s.status === 'AVAILABLE')).toBe(true)
  })

  it('allows taking an available seat (take)', () => {
    const res = sim.takeSeat('A1', 'Ana')
    expect(res.success).toBe(true)
    expect(res.log.status).toBe('PENDING')
    expect(res.log.action).toBe('take')

    const seat = sim.getSeats().find((s) => s.code === 'A1')
    expect(seat?.status).toBe('HELD_BY_ME')
    expect(seat?.holderId).toBeDefined()
    expect(seat?.expiresAtSeconds).toBeDefined()
  })

  it('toggles to release when clicking a seat held by me (release)', () => {
    sim.takeSeat('A1', 'Ana')
    const releaseRes = sim.takeSeat('A1', 'Ana')

    expect(releaseRes.success).toBe(true)
    expect(releaseRes.log.status).toBe('RELEASED')
    expect(releaseRes.log.action).toBe('release')

    const seat = sim.getSeats().find((s) => s.code === 'A1')
    expect(seat?.status).toBe('AVAILABLE')
    expect(seat?.holderId).toBeUndefined()
  })

  it('returns CONFLICT when taking an occupied seat under FAIL policy', () => {
    sim.setPolicy('FAIL')
    sim.takeSeat('A1', 'Ana')
    const conflictRes = sim.takeSeat('A1', 'Beto')

    expect(conflictRes.success).toBe(false)
    expect(conflictRes.log.status).toBe('CONFLICT')
    expect(conflictRes.log.errorSummary).toContain('ConflictError')
  })

  it('places second user in queue when policy is QUEUE', () => {
    sim.setPolicy('QUEUE')
    sim.takeSeat('A1', 'Ana')
    const queueRes = sim.takeSeat('A1', 'Beto')

    expect(queueRes.success).toBe(true)
    expect(queueRes.log.status).toBe('PENDING')
    expect(queueRes.log.action).toBe('queue')

    const seat = sim.getSeats().find((s) => s.code === 'A1')
    expect(seat?.status).toBe('HELD_BY_ME')
    expect(seat?.holderUser).toBe('Ana')
    expect(sim.getQueueForSeat('A1')).toHaveLength(1)
    expect(sim.getQueueForSeat('A1')[0].user).toBe('Beto')
  })

  it('expires held seats and triggers sweeper when advancing time past TTL', () => {
    sim.takeSeat('A1', 'Ana')
    const logs = sim.advanceTime(130)

    const expireLog = logs.find((l) => l.status === 'EXPIRED')
    expect(expireLog).toBeDefined()
    expect(expireLog?.action).toBe('expiración')

    const seat = sim.getSeats().find((s) => s.code === 'A1')
    expect(seat?.status).toBe('AVAILABLE')
  })

  it('confirms held seats into SOLD state', () => {
    sim.takeSeat('A1', 'Ana')
    const logs = sim.confirmHeldSeats()

    expect(logs).toHaveLength(1)
    expect(logs[0].status).toBe('CONFIRMED')

    const seat = sim.getSeats().find((s) => s.code === 'A1')
    expect(seat?.status).toBe('SOLD')
  })

  it('confirms Beto after auto-promotion from queue (Step 4 of QUEUE stepper)', () => {
    sim.setPolicy('QUEUE')
    sim.takeSeat('A1', 'Ana')
    sim.takeSeat('A1', 'Beto')
    // Ana expires, Beto is promoted
    const sweepLogs = sim.advanceTime(130)
    expect(sweepLogs.some((l) => l.status === 'EXPIRED')).toBe(true)

    const seatPromoted = sim.getSeats().find((s) => s.code === 'A1')
    expect(seatPromoted?.holderUser).toBe('Beto')
    expect(seatPromoted?.status).toBe('HELD_BY_OTHER')

    // Step 4: Beto confirms
    const confirmLogs = sim.confirmHeldSeats('A1')
    expect(confirmLogs).toHaveLength(1)
    expect(confirmLogs[0].status).toBe('CONFIRMED')
    expect(confirmLogs[0].method).toContain('await caerus.confirm(')
    expect(confirmLogs[0].resultSummary).toContain('Beto')

    const seatFinal = sim.getSeats().find((s) => s.code === 'A1')
    expect(seatFinal?.status).toBe('SOLD')
    expect(sim.getQueueForSeat('A1')).toHaveLength(0)
  })

  it('simulates concurrent conflict correctly and populates queue or fails', () => {
    sim.setPolicy('FAIL')
    sim.takeSeat('A1', 'Ana')
    const conflict = sim.simulateConcurrentConflict()

    expect(conflict.policy).toBe('FAIL')
    expect(conflict.log.status).toBe('CONFLICT')
    expect(conflict.log.errorSummary).toContain('ConflictError')

    // Test with QUEUE policy
    sim.reset()
    sim.setPolicy('QUEUE')
    sim.takeSeat('A1', 'Ana')
    const queueResult = sim.simulateConcurrentConflict()

    expect(queueResult.policy).toBe('QUEUE')
    expect(queueResult.queuePosition).toBe(1)
    expect(queueResult.log.status).toBe('PENDING')
    expect(sim.getQueueForSeat('A1')).toHaveLength(1)
  })

  it('resets all seats to initial available state without generating fake sdk log', () => {
    sim.takeSeat('A1', 'Ana')
    sim.confirmHeldSeats()
    sim.reset()

    const seats = sim.getSeats()
    expect(seats.every((s) => s.status === 'AVAILABLE')).toBe(true)
  })
})

describe('DlsSimulation Engine', () => {
  let dls: DlsSimulation

  beforeEach(() => {
    dls = new DlsSimulation()
  })

  it('returns scenario steps for each DLS scenario', () => {
    expect(dls.getScenarioSteps('shared_read')).toHaveLength(3)
    expect(dls.getScenarioSteps('exclusive')).toHaveLength(4)
    expect(dls.getScenarioSteps('deadlock')).toHaveLength(5)
  })

  it('runs SHARED_READ step-by-step allowing concurrent access and releasing', () => {
    // Step 0: Alfa
    const log0 = dls.executeStep('shared_read', 0)
    expect(log0.status).toBe('SUCCESS')
    const alfa = dls.getWorkers().find((w) => w.id === 'alfa')
    expect(alfa?.status).toBe('HOLDING')

    // Step 1: Beta reads simultaneously
    const log1 = dls.executeStep('shared_read', 1)
    expect(log1.status).toBe('SUCCESS')
    const res = dls.getResources().find((r) => r.id === 'file:reports_export')
    expect(res?.mode).toBe('SHARED_READ')
    expect(res?.heldBy).toContain('Worker Alfa')
    expect(res?.heldBy).toContain('Worker Beta')

    // Step 2: Release
    const log2 = dls.executeStep('shared_read', 2)
    expect(log2.status).toBe('RELEASED')
    expect(res?.heldBy).toHaveLength(0)
  })

  it('runs EXCLUSIVE scenario queueing Beta, promoting on release, and completing', () => {
    // Step 0: Alfa acquires
    dls.executeStep('exclusive', 0)
    const res = dls.getResources().find((r) => r.id === 'file:reports_export')
    expect(res?.mode).toBe('EXCLUSIVE')
    expect(res?.heldBy).toEqual(['Worker Alfa'])

    // Step 1: Beta queues
    const log1 = dls.executeStep('exclusive', 1)
    expect(log1.status).toBe('PENDING')
    const beta = dls.getWorkers().find((w) => w.id === 'beta')
    expect(beta?.status).toBe('WAITING')

    // Step 2: Alfa completes, Beta promoted
    const log2 = dls.executeStep('exclusive', 2)
    expect(log2.status).toBe('SUCCESS')
    expect(res?.heldBy).toEqual(['Worker Beta'])
    expect(beta?.status).toBe('HOLDING')

    // Step 3: Beta releases
    const log3 = dls.executeStep('exclusive', 3)
    expect(log3.status).toBe('RELEASED')
    expect(res?.heldBy).toHaveLength(0)
  })

  it('runs DEADLOCK scenario: Alfa Archivo, Beta Red, interbloqueo, Caerus aborta Beta, Alfa completa', () => {
    // Step 0: Alfa Archivo
    dls.executeStep('deadlock', 0)
    // Step 1: Beta Red
    dls.executeStep('deadlock', 1)

    // Step 2: Contención mutua
    const log2 = dls.executeStep('deadlock', 2)
    expect(log2.status).toBe('CONFLICT')
    expect(log2.resultSummary).toContain('DEADLOCK DETECTADO')

    // Step 3: DFS aborta Beta
    const log3 = dls.executeStep('deadlock', 3)
    expect(log3.status).toBe('RELEASED')
    expect(log3.errorSummary).toContain('DeadlockAbortedError')

    const beta = dls.getWorkers().find((w) => w.id === 'beta')
    expect(beta?.status).toBe('ABORTED')

    // Step 4: Alfa completa
    const log4 = dls.executeStep('deadlock', 4)
    expect(log4.status).toBe('RELEASED')
    const alfa = dls.getWorkers().find((w) => w.id === 'alfa')
    expect(alfa?.status).toBe('COMPLETED')
  })
})
