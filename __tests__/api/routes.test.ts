import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn(),
    getSession: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  fetchBackend: vi.fn(),
}))

import { GET as getDevToken } from '@/app/api/dev-token/route'
import { GET as getUser } from '@/app/api/user/route'
import { GET as getApplications, POST as createApplication } from '@/app/api/applications/route'
import { GET as getAppById, PUT as updateAppById, DELETE as deleteAppById } from '@/app/api/applications/[id]/route'
import { POST as acceptInvitation } from '@/app/api/invitations/[token]/accept/route'
import { auth0 } from '@/lib/auth0'
import { fetchBackend } from '@/lib/api'

describe('app/api Routes (Endpoints Internos)', () => {
  const originalEnv = process.env.VERCEL_ENV

  beforeEach(() => {
    vi.resetAllMocks()
    delete process.env.VERCEL_ENV
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.VERCEL_ENV = originalEnv
    } else {
      delete process.env.VERCEL_ENV
    }
  })

  describe('GET /api/dev-token', () => {
    it('should return 404 if running on Vercel environment', async () => {
      process.env.VERCEL_ENV = 'production'
      const res = await getDevToken()
      expect(res.status).toBe(404)
    })

    it('should return 401 if access token is not available', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce(null as any)
      const res = await getDevToken()
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('No access token available')
    })

    it('should return token if user is authenticated locally', async () => {
      vi.mocked(auth0.getAccessToken).mockResolvedValueOnce('secret-dev-token' as any)
      const res = await getDevToken()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toBe('secret-dev-token')
    })
  })

  describe('GET /api/user', () => {
    it('should return 401 if no active session', async () => {
      vi.mocked(auth0.getSession).mockResolvedValueOnce(null as any)
      const res = await getUser()
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Not authenticated')
    })

    it('should return user session data when authenticated', async () => {
      const mockUser = { sub: 'auth0|123', name: 'John Doe', email: 'john@example.com' }
      vi.mocked(auth0.getSession).mockResolvedValueOnce({ user: mockUser } as any)

      const res = await getUser()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.user).toEqual(mockUser)
    })
  })

  describe('/api/applications', () => {
    it('GET should call fetchBackend with pagination params and return backend json', async () => {
      const mockBackendResponse = new Response(
        JSON.stringify({ content: [{ id: 'app-1', name: 'payment-sync' }] }),
        { status: 200 }
      )
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/applications?page=0&size=10')
      const res = await getApplications(req)

      expect(res.status).toBe(200)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/applications?page=0&size=10&sort=name%2Casc')
      const body = await res.json()
      expect(body.content).toHaveLength(1)
    })

    it('POST should forward payload to backend and return created application', async () => {
      const payload = { name: 'new-app', description: 'Test app' }
      const mockBackendResponse = new Response(
        JSON.stringify({ id: 'app-99', ...payload }),
        { status: 201 }
      )
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const res = await createApplication(req)

      expect(res.status).toBe(200)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      expect(body.id).toBe('app-99')
    })
  })

  describe('/api/applications/[id]', () => {
    it('GET /api/applications/[id] should fetch specific application', async () => {
      const mockBackendResponse = new Response(
        JSON.stringify({ id: 'app-123', name: 'my-app' }),
        { status: 200 }
      )
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/applications/app-123')
      const res = await getAppById(req, { params: Promise.resolve({ id: 'app-123' }) })

      expect(res.status).toBe(200)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/applications/app-123')
      const body = await res.json()
      expect(body.id).toBe('app-123')
    })

    it('PUT /api/applications/[id] should update application', async () => {
      const updateData = { name: 'updated-name' }
      const mockBackendResponse = new Response(
        JSON.stringify({ id: 'app-123', ...updateData }),
        { status: 200 }
      )
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/applications/app-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const res = await updateAppById(req, { params: Promise.resolve({ id: 'app-123' }) })

      expect(res.status).toBe(200)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/applications/app-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
    })

    it('DELETE /api/applications/[id] should delete application and return 204', async () => {
      const mockBackendResponse = new Response(null, { status: 204 })
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/applications/app-123', { method: 'DELETE' })
      const res = await deleteAppById(req, { params: Promise.resolve({ id: 'app-123' }) })

      expect(res.status).toBe(204)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/applications/app-123', { method: 'DELETE' })
    })
  })

  describe('/api/invitations/[token]/accept', () => {
    it('POST /api/invitations/[token]/accept should call backend accept endpoint', async () => {
      const mockBackendResponse = new Response(null, { status: 200 })
      vi.mocked(fetchBackend).mockResolvedValueOnce(mockBackendResponse)

      const req = new NextRequest('http://localhost:3000/api/invitations/token-abc/accept', { method: 'POST' })
      const res = await acceptInvitation(req, { params: Promise.resolve({ token: 'token-abc' }) })

      expect(res.status).toBe(200)
      expect(fetchBackend).toHaveBeenCalledWith('/v1/invitations/token-abc/accept', { method: 'POST' })
    })
  })
})
