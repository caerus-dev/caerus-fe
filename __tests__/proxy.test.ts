import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth0', () => ({
  auth0: {
    middleware: vi.fn((req: any) => NextResponse.next()),
    getSession: vi.fn(),
  },
}))

import { proxy } from '@/proxy'
import { auth0 } from '@/lib/auth0'

describe('proxy.ts (Middleware de Red y Seguridad)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(auth0.middleware).mockImplementation(() => NextResponse.next())
  })

  it('should redirect unauthenticated users accessing /dashboard to /auth/login', async () => {
    vi.mocked(auth0.getSession).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3000/dashboard/applications')
    const res = await proxy(req)

    expect(res.status).toBe(307) // Next.js NextResponse.redirect default status
    expect(res.headers.get('location')).toBe('http://localhost:3000/auth/login')
  })

  it('should allow authenticated users accessing /dashboard', async () => {
    vi.mocked(auth0.getSession).mockResolvedValueOnce({ user: { sub: 'user-123' } } as any)

    const req = new NextRequest('http://localhost:3000/dashboard/applications')
    const res = await proxy(req)

    expect(res.headers.get('location')).toBeNull()
  })

  it('should redirect unauthenticated users accessing /accept-invite to /auth/login with returnTo', async () => {
    vi.mocked(auth0.getSession).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3000/accept-invite?token=invite-token-abc')
    const res = await proxy(req)

    expect(res.status).toBe(307)
    const expectedReturnTo = encodeURIComponent('/accept-invite?token=invite-token-abc')
    expect(res.headers.get('location')).toBe(`http://localhost:3000/auth/login?returnTo=${expectedReturnTo}`)
  })

  it('should pass through requests for public routes like landing page', async () => {
    const req = new NextRequest('http://localhost:3000/')
    const res = await proxy(req)

    expect(res.headers.get('location')).toBeNull()
  })
})
