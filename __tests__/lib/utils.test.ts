import { describe, it, expect } from 'vitest'
import { cn, getEnvColors } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'active', false && 'disabled')).toBe('base-class active')
    })

    it('should resolve tailwind conflicts using tailwind-merge', () => {
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('getEnvColors', () => {
    it('should return dev colors for dev/development or unknown environment', () => {
      const devColors = getEnvColors('dev')
      expect(devColors.dot).toBe('bg-blue-500')
      expect(devColors.text).toBe('text-blue-400')

      const developmentColors = getEnvColors('DEVELOPMENT')
      expect(developmentColors.dot).toBe('bg-blue-500')

      const nullColors = getEnvColors(null)
      expect(nullColors.dot).toBe('bg-blue-500')
    })

    it('should return staging colors for staging/stage environment', () => {
      const stagingColors = getEnvColors('staging')
      expect(stagingColors.dot).toBe('bg-yellow-500')
      expect(stagingColors.text).toBe('text-yellow-400')

      const stageColors = getEnvColors('STAGE')
      expect(stageColors.dot).toBe('bg-yellow-500')
    })

    it('should return prod colors for prod/production environment', () => {
      const prodColors = getEnvColors('prod')
      expect(prodColors.dot).toBe('bg-green-500')
      expect(prodColors.text).toBe('text-green-400')

      const productionColors = getEnvColors('PRODUCTION')
      expect(productionColors.dot).toBe('bg-green-500')
    })
  })
})
