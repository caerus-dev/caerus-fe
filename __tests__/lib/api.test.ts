import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn(),
  },
}))

import { getBackendHeaders, fetchBackend } from '@/lib/api'
import { auth0 } from '@/lib/auth0'

describe('lib/api', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('getBackendHeaders', () => {
    it('should return headers with Bearer token when token is available', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce({ token: 'mock-token-123' } as any)

      const headers = await getBackendHeaders()
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token-123',
      })
    })

    it('should throw Unauthorized error when token is missing', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce(null as any)

      await expect(getBackendHeaders()).rejects.toThrow('Unauthorized: Could not retrieve access token')
    })

    it('should throw error when getAccessToken rejects', async () => {
      vi.mocked(auth0.getAccessToken).mockRejectedValueOnce(new Error('Auth error'))

      await expect(getBackendHeaders()).rejects.toThrow('Unauthorized: Could not retrieve access token')
    })
  })

  describe('fetchBackend', () => {
    it('should call fetch with backend URL and authorization headers', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce({ token: 'mock-token-abc' } as any)
      const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 })
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

      const response = await fetchBackend('/v1/test', { method: 'POST' })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, init] = vi.mocked(global.fetch).mock.calls[0]
      expect(url).toContain('/v1/test')
      expect(init?.method).toBe('POST')

      const headers = init?.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer mock-token-abc')
      expect(headers.get('Content-Type')).toBe('application/json')
      expect(response).toBe(mockResponse)
    })

    it('should merge custom headers properly', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce({ token: 'mock-token-xyz' } as any)
      vi.mocked(global.fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }))

      await fetchBackend('/v1/custom', {
        headers: { 'X-Custom-Header': 'CustomValue' },
      })

      const [, init] = vi.mocked(global.fetch).mock.calls[0]
      const headers = init?.headers as Headers
      expect(headers.get('X-Custom-Header')).toBe('CustomValue')
      expect(headers.get('Authorization')).toBe('Bearer mock-token-xyz')
    })
  })
})
