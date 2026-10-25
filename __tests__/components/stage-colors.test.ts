import { describe, expect, it } from 'vitest'
import { isDarkColor, mixRgb, relativeLuminance, rgba } from '@/components/landing/stage-colors'

describe('stage-colors', () => {
  it('formats rgba strings', () => {
    expect(rgba([196, 98, 202], 0.5)).toBe('rgba(196, 98, 202, 0.5)')
  })

  it('mixes colours and clamps t', () => {
    expect(mixRgb([0, 0, 0], [255, 255, 255], 0.5)).toEqual([128, 128, 128])
    expect(mixRgb([10, 20, 30], [200, 200, 200], -1)).toEqual([10, 20, 30])
    expect(mixRgb([10, 20, 30], [200, 200, 200], 2)).toEqual([200, 200, 200])
  })

  it('computes luminance extremes', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0)
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5)
  })

  it('classifies dark and light backgrounds', () => {
    expect(isDarkColor([8, 4, 8])).toBe(true)
    expect(isDarkColor([240, 238, 240])).toBe(false)
  })
})
