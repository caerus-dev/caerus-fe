import { describe, it, expect } from 'vitest'
import { cn, getEnvColors, formatPercentage, formatRelativeTime, translateBackendError, formatNumber, formatDateTime } from '@/lib/utils'

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

    it('should prioritize customPresetId color over environment name', () => {
      const customColors = getEnvColors('dev', 'purple')
      expect(customColors.dot).toBe('bg-purple-500')
      expect(customColors.text).toBe('text-purple-400')

      const greenColors = getEnvColors('fadsfdsf', 'green')
      expect(greenColors.dot).toBe('bg-green-500')
      expect(greenColors.text).toBe('text-green-400')

      const blueColors = getEnvColors('prod', 'blue')
      expect(blueColors.dot).toBe('bg-blue-500')
      expect(blueColors.text).toBe('text-blue-400')

      const yellowColors = getEnvColors('custom-env', 'yellow')
      expect(yellowColors.dot).toBe('bg-yellow-500')
      expect(yellowColors.text).toBe('text-yellow-400')
    })
  })

  describe('formatPercentage', () => {
    it('should format numbers >= 100 as integers', () => {
      expect(formatPercentage(100)).toBe('100')
      expect(formatPercentage(324.458)).toBe('324')
      expect(formatPercentage(100.2)).toBe('100')
      expect(formatPercentage(100.8)).toBe('101')
    })

    it('should format numbers < 100 with at most 1 decimal without trailing zeroes', () => {
      expect(formatPercentage(0)).toBe('0')
      expect(formatPercentage(3.24458)).toBe('3.2')
      expect(formatPercentage(80)).toBe('80')
      expect(formatPercentage(80.56)).toBe('80.6')
      expect(formatPercentage(99.94)).toBe('99.9')
    })

    it('should handle falsy and NaN values gracefully', () => {
      expect(formatPercentage(0)).toBe('0')
      expect(formatPercentage(NaN)).toBe('0')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return empty string for invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('')
    })

    it('should format seconds ago', () => {
      const date = new Date(Date.now() - 10 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('Justo ahora')
    })

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('Hace 5m')
    })

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 3 * 3600 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('Hace 3h')
    })

    it('should format yesterday', () => {
      const date = new Date(Date.now() - 25 * 3600 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('Ayer')
    })
  })

  describe('translateBackendError', () => {
    it('should translate already exists for lock template', () => {
      const backendError = {
        timestamp: "2026-10-04T16:44:47.332377Z",
        status: 400,
        error: "Bad Request",
        message: "A template with the namespace 'aaa' already exists.",
        fieldErrors: [],
        details: []
      }
      const result = translateBackendError(backendError, 'aaa', 'lock')
      expect(result).toBe('Ya existe una plantilla de lock con el namespace "aaa" en este entorno.')
    })

    it('should translate already exists for resource template', () => {
      const backendError = {
        status: 400,
        error: "Bad Request",
        message: "A template with the name 'seat_a1' already exists."
      }
      const result = translateBackendError(backendError, 'seat_a1', 'resource')
      expect(result).toBe('Ya existe una plantilla de recurso con el nombre "seat_a1" en este entorno.')
    })

    it('should translate already exists for webhook', () => {
      const backendError = {
        error: "Bad Request",
        message: "A webhook with the url 'https://example.com' already exists."
      }
      const result = translateBackendError(backendError, 'https://example.com', 'webhook')
      expect(result).toBe('Ya existe un webhook configurado con esta URL en este entorno.')
    })

    it('should translate not found error', () => {
      const result = translateBackendError('Resource not found', 'item', 'resource')
      expect(result).toBe('El elemento o entorno solicitado no fue encontrado.')
    })

    it('should return raw message when no specific pattern matches', () => {
      const result = translateBackendError({ message: 'Invalid payload configuration' }, 'item', 'lock')
      expect(result).toBe('Invalid payload configuration')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with dot as thousand separator in es-AR', () => {
      expect(formatNumber(1088)).toBe('1.088')
      expect(formatNumber(10000)).toBe('10.000')
      expect(formatNumber(100000)).toBe('100.000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle string numbers, null and undefined', () => {
      expect(formatNumber('1088')).toBe('1.088')
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(undefined)).toBe('0')
      expect(formatNumber('')).toBe('0')
      expect(formatNumber('invalid')).toBe('invalid')
    })
  })

  describe('formatDateTime', () => {
    it('should format date in es-AR', () => {
      const date = new Date('2026-10-04T12:00:00Z')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('2026')
    })

    it('should return empty string for invalid date or falsy input', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
      expect(formatDateTime('invalid-date')).toBe('')
    })
  })
})
