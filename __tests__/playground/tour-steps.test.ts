import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOUR_STEPS } from '@/components/playground/tour/tour-steps'
import {
  filterStepsByTab,
  markTourCompleted,
  hasCompletedTour,
} from '@/components/playground/tour/tour-state'

const dir = join(process.cwd(), 'components', 'playground')
const sources = readdirSync(dir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => readFileSync(join(dir, f), 'utf8'))
  .join('\n')

// Matches data-tour="name" and data-tour={cond ? "name" : undefined}
const hasAnchor = (name: string) =>
  new RegExp(`data-tour=(?:"${name}"|\\{[^}]*"${name}"[^}]*\\})`).test(sources)

describe('tour steps config', () => {
  it('has unique step ids', () => {
    const ids = TOUR_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has short, non-empty copy', () => {
    for (const s of TOUR_STEPS) {
      expect(s.title.trim().length, s.id).toBeGreaterThan(0)
      expect(s.body.trim().length, s.id).toBeGreaterThan(0)
      expect(s.title.split(/\s+/).length, `${s.id} title`).toBeLessThanOrEqual(6)
      expect(s.body.length, `${s.id} body`).toBeLessThanOrEqual(320)
    }
  })

  it('only uses targets that exist as data-tour anchors', () => {
    const targets = [...new Set(TOUR_STEPS.flatMap((s) => (s.target ? [s.target] : [])))]
    expect(targets.length).toBeGreaterThan(10)
    for (const t of targets) expect(hasAnchor(t), `missing data-tour="${t}"`).toBe(true)
  })

  it('mixes control and observe steps in both tabs', () => {
    for (const tab of ['sre', 'dls'] as const) {
      const kinds = new Set(filterStepsByTab(TOUR_STEPS, tab).map((s) => s.kind))
      expect(kinds.has('control')).toBe(true)
      expect(kinds.has('observe')).toBe(true)
    }
  })

  it('starts each tab with an intro and ends with a closing step', () => {
    const sre = filterStepsByTab(TOUR_STEPS, 'sre')
    const dls = filterStepsByTab(TOUR_STEPS, 'dls')
    expect(sre[0].id).toBe('welcome')
    expect(sre[sre.length - 1].id).toBe('sre-handoff')
    expect(dls[0].id).toBe('dls-intro')
    expect(dls[dls.length - 1].id).toBe('done')
  })

  it('every step that runs a simulation step is followed by an observe step', () => {
    TOUR_STEPS.forEach((s, i) => {
      if (s.onNext?.type === 'run-step') {
        expect(TOUR_STEPS[i + 1]?.kind, s.id).toBe('observe')
      }
    })
  })
})

describe('persistence helper with broken storage', () => {
  it('never throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('x')
      },
      setItem: () => {
        throw new Error('x')
      },
    }
    expect(() => hasCompletedTour(broken, 'sre')).not.toThrow()
    expect(() => markTourCompleted(broken, 'sre')).not.toThrow()
  })
})
