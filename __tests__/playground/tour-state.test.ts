import { describe, it, expect } from 'vitest'
import {
  TOUR_STORAGE_KEY,
  filterStepsByTab,
  sequenceFor,
  clampIndex,
  nextIndex,
  prevIndex,
  skipIndex,
  stepCounter,
  hasCompletedTour,
  markTourCompleted,
  shouldAutoStart,
  computePopoverPlacement,
  resolveViewportSize,
  type TourStep,
} from '@/components/playground/tour/tour-state'
import { planStepRun, createStepper } from '@/components/playground/stepper-state'

const step = (id: string, tab: 'sre' | 'dls', target?: string): TourStep => ({
  id,
  tab,
  kind: 'observe',
  target,
  title: id,
  body: id,
})

const steps = [step('a', 'sre'), step('b', 'sre', 'x'), step('c', 'dls'), step('d', 'dls', 'y')]

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v
    },
  }
}

const throwingStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('quota')
  },
}

describe('tour step navigation', () => {
  it('filters steps by tab and builds the sequence for a start tab', () => {
    expect(filterStepsByTab(steps, 'dls').map((s) => s.id)).toEqual(['c', 'd'])
    expect(sequenceFor(steps, 'sre').map((s) => s.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(sequenceFor(steps, 'dls').map((s) => s.id)).toEqual(['c', 'd'])
  })

  it('clamps and bounds the index', () => {
    expect(clampIndex(-3, 4)).toBe(0)
    expect(clampIndex(9, 4)).toBe(3)
    expect(clampIndex(1, 0)).toBe(0)
    expect(nextIndex(0, 4)).toBe(1)
    expect(nextIndex(3, 4)).toBeNull()
    expect(prevIndex(2)).toBe(1)
    expect(prevIndex(0)).toBe(0)
  })

  it('skips a missing target in the travel direction without leaving bounds', () => {
    expect(skipIndex(1, 4, 'forward')).toBe(2)
    expect(skipIndex(3, 4, 'forward')).toBeNull()
    expect(skipIndex(2, 4, 'backward')).toBe(1)
    expect(skipIndex(0, 4, 'backward')).toBe(1)
  })

  it('counts progress within the tab of the current step', () => {
    expect(stepCounter(steps, 1)).toEqual({ current: 2, total: 2, label: '2 de 2' })
    expect(stepCounter(steps, 3)).toEqual({ current: 2, total: 2, label: '2 de 2' })
    expect(stepCounter(steps, 2).label).toBe('1 de 2')
  })
})

describe('tour persistence', () => {
  it('reads completion from a versioned key', () => {
    expect(TOUR_STORAGE_KEY).toMatch(/_v\d+$/)
    expect(hasCompletedTour(memoryStorage())).toBe(false)
    expect(hasCompletedTour(memoryStorage({ [TOUR_STORAGE_KEY]: '1' }))).toBe(true)
  })

  it('writes completion and reports success', () => {
    const s = memoryStorage()
    expect(markTourCompleted(s)).toBe(true)
    expect(s.data[TOUR_STORAGE_KEY]).toBe('1')
  })

  it('tolerates unavailable or throwing storage', () => {
    expect(hasCompletedTour(throwingStorage)).toBe(false)
    expect(hasCompletedTour(null)).toBe(false)
    expect(markTourCompleted(throwingStorage)).toBe(false)
    expect(markTourCompleted(null)).toBe(false)
  })

  it('auto-starts at most once per mount and never after completion', () => {
    expect(shouldAutoStart(memoryStorage(), false)).toBe(true)
    expect(shouldAutoStart(memoryStorage(), true)).toBe(false)
    expect(shouldAutoStart(memoryStorage({ [TOUR_STORAGE_KEY]: '1' }), false)).toBe(false)
    expect(shouldAutoStart(throwingStorage, false)).toBe(true)
    expect(shouldAutoStart(null, false)).toBe(true)
  })
})

describe('popover placement', () => {
  const viewport = { width: 1200, height: 800 }
  const size = { width: 320, height: 180 }

  it('centers when there is no target', () => {
    const p = computePopoverPlacement(null, size, viewport)
    expect(p.mode).toBe('centered')
    expect(p.left).toBe((1200 - 320) / 2)
    expect(p.top).toBe((800 - 180) / 2)
  })

  it('prefers below the target and keeps the popover inside the viewport', () => {
    const p = computePopoverPlacement({ top: 100, left: 1100, width: 80, height: 40 }, size, viewport)
    expect(p.mode).toBe('anchored')
    expect(p.side).toBe('bottom')
    expect(p.left + size.width).toBeLessThanOrEqual(viewport.width)
    expect(p.left).toBeGreaterThanOrEqual(0)
  })

  it('flips above when there is no room below', () => {
    const p = computePopoverPlacement({ top: 700, left: 400, width: 100, height: 40 }, size, viewport)
    expect(p.side).toBe('top')
    expect(p.top + size.height).toBeLessThanOrEqual(700)
  })

  it('docks at the bottom on small screens', () => {
    const p = computePopoverPlacement(
      { top: 100, left: 20, width: 80, height: 40 },
      { width: 320, height: 200 },
      { width: 390, height: 800 },
    )
    expect(p.mode).toBe('docked')
    expect(p.top + 200).toBeLessThanOrEqual(800)
    expect(p.left + (p.right ?? 0)).toBeLessThan(390)
  })

  it('docks with left/right insets instead of a fixed width', () => {
    const p = computePopoverPlacement(null, { width: 320, height: 200 }, { width: 375, height: 700 })
    expect(p.mode).toBe('docked')
    expect(p.left).toBe(8)
    expect(p.right).toBe(8)
    expect('width' in p).toBe(false)
    expect(p.top).toBe(700 - 200 - 8)
  })
})

describe('resolveViewportSize', () => {
  it('prefers the visible area over a widened layout viewport', () => {
    expect(
      resolveViewportSize({ clientWidth: 375, clientHeight: 700, innerWidth: 465, innerHeight: 812 }),
    ).toEqual({ width: 375, height: 700 })
  })

  it('uses visualViewport when it is smaller', () => {
    expect(
      resolveViewportSize({
        clientWidth: 465,
        clientHeight: 812,
        innerWidth: 465,
        innerHeight: 812,
        visualViewport: { width: 375, height: 600 },
      }),
    ).toEqual({ width: 375, height: 600 })
  })

  it('falls back to inner size when client size is unavailable', () => {
    expect(resolveViewportSize({ clientWidth: 0, clientHeight: 0, innerWidth: 390, innerHeight: 800 })).toEqual({
      width: 390,
      height: 800,
    })
  })
})

describe('stepper run planning (tour actions)', () => {
  it('is a no-op for an already executed step', () => {
    expect(planStepRun({ index: 2, executed: [0, 1] }, 1)).toEqual({ kind: 'noop' })
  })

  it('runs only the target step when its predecessor was executed', () => {
    expect(planStepRun(createStepper(), 0)).toEqual({ kind: 'run' })
    expect(planStepRun({ index: 0, executed: [0] }, 1)).toEqual({ kind: 'run' })
  })

  it('replays from a clean engine when a prerequisite is missing', () => {
    expect(planStepRun(createStepper(), 2)).toEqual({ kind: 'replay', upTo: 2 })
  })
})
