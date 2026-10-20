import { describe, it, expect } from 'vitest'
import {
  createStepper,
  createDlsStepper,
  markExecuted,
  advanceStep,
  selectStep,
  resetStepper,
  selectDlsScenario,
} from '@/components/playground/stepper-state'

describe('stepper-state', () => {
  it('starts at step 0 with nothing executed', () => {
    expect(createStepper()).toEqual({ index: 0, executed: [] })
  })

  it('marks the current step as executed without duplicates', () => {
    let s = markExecuted(createStepper())
    s = markExecuted(s)
    expect(s.executed).toEqual([0])
  })

  it('advances but never beyond the last step', () => {
    let s = createStepper()
    s = advanceStep(s, 2)
    s = advanceStep(s, 2)
    s = advanceStep(s, 2)
    expect(s.index).toBe(1)
  })

  it('global reset clears index and executed steps but keeps extra fields', () => {
    const s = { ...createDlsStepper('exclusive'), index: 2, executed: [0, 1, 2] }
    expect(resetStepper(s)).toEqual({ scenario: 'exclusive', index: 0, executed: [] })
  })

  it('preserves state across a tab switch (state is plain data, untouched by unmount)', () => {
    const before = markExecuted({ index: 1, executed: [0] })
    const after = { ...before }
    expect(after).toEqual({ index: 1, executed: [0, 1] })
  })

  it('selecting an executed step or step 0 just moves the cursor', () => {
    const s = { index: 2, executed: [0, 1, 2] }
    expect(selectStep(s, 1)).toEqual({ state: { index: 1, executed: [0, 1, 2] }, replayUpTo: null })
    expect(selectStep({ index: 0, executed: [] }, 0).replayUpTo).toBeNull()
  })

  it('jumping to a later unexecuted step replays everything up to it', () => {
    const res = selectStep({ index: 0, executed: [0] }, 3)
    expect(res.replayUpTo).toBe(3)
    expect(res.state).toEqual({ index: 3, executed: [0, 1, 2, 3] })
  })

  it('switching DLS scenario resets progress and changes scenario', () => {
    const s = { ...createDlsStepper('deadlock'), index: 1, executed: [0, 1] }
    expect(selectDlsScenario(s, 'shared_read')).toEqual({
      scenario: 'shared_read',
      index: 0,
      executed: [],
    })
  })

  it('switching SRE policy is a reset', () => {
    expect(resetStepper({ index: 3, executed: [0, 1, 2, 3] })).toEqual(createStepper())
  })
})
