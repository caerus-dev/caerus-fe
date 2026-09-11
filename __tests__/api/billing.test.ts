import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

import { GET as getUserMe } from '@/app/api/users/me/route';
import { POST as changePlan } from '@/app/api/users/me/plan/route';
import { GET as getPlans } from '@/app/api/billing/plans/route';
import { POST as createSetupIntent } from '@/app/api/billing/setup-intent/route';
import { DELETE as detachPaymentMethod } from '@/app/api/billing/payment-method/route';
import { GET as getInvoices } from '@/app/api/billing/invoices/route';
import { fetchBackend } from '@/lib/api';

describe('Billing API Routes (BFF)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/users/me', () => {
    it('returns user profile including payment method and billing usage', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@caerus.dev',
        hasValidPaymentMethod: true,
        billingPlan: { code: 'STARTUP', name: 'Startup' },
        billingUsage: { period: '2026-09', consumedUnits: 15000, includedUnits: 5000000, percentage: 0.3 },
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUser), { status: 200 })
      );

      const res = await getUserMe();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.hasValidPaymentMethod).toBe(true);
      expect(data.billingPlan.code).toBe('STARTUP');
      expect(fetchBackend).toHaveBeenCalledWith('/v1/users/me');
    });

    it('returns error when backend responds with 401/500', async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const res = await getUserMe();
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/users/me/plan', () => {
    it('sends exact planCode to backend', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        billingPlan: { code: 'STARTUP' },
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockUpdatedUser), { status: 200 })
      );

      const req = new NextRequest('http://localhost:3000/api/users/me/plan', {
        method: 'POST',
        body: JSON.stringify({ planCode: 'STARTUP' }),
      });

      const res = await changePlan(req);
      expect(res.status).toBe(200);
      expect(fetchBackend).toHaveBeenCalledWith('/v1/users/me/plan', {
        method: 'POST',
        body: JSON.stringify({ planCode: 'STARTUP' }),
      });
    });

    it('handles 409 conflict when downgrade is not allowed', async () => {
      const errorResponse = {
        status: 409,
        error: 'Conflict',
        message: 'Cannot downgrade to plan Developer. Active collaborators exceed limit.',
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(errorResponse), { status: 409 })
      );

      const req = new NextRequest('http://localhost:3000/api/users/me/plan', {
        method: 'POST',
        body: JSON.stringify({ planCode: 'DEVELOPER' }),
      });

      const res = await changePlan(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('Cannot downgrade');
    });
  });

  describe('GET /api/billing/plans', () => {
    it('fetches list of available plans', async () => {
      const mockPlans = [
        { code: 'DEVELOPER', name: 'Developer' },
        { code: 'STARTUP', name: 'Startup' },
        { code: 'ENTERPRISE', name: 'Enterprise' },
      ];

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockPlans), { status: 200 })
      );

      const res = await getPlans();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveLength(3);
      expect(fetchBackend).toHaveBeenCalledWith('/v1/billing/plans');
    });
  });

  describe('POST /api/billing/setup-intent', () => {
    it('generates SetupIntent client secret', async () => {
      const mockSetup = {
        clientSecret: 'seti_secret_123',
        setupIntentId: 'seti_123',
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockSetup), { status: 200 })
      );

      const res = await createSetupIntent();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.clientSecret).toBe('seti_secret_123');
      expect(fetchBackend).toHaveBeenCalledWith('/v1/billing/setup-intent', { method: 'POST' });
    });
  });

  describe('DELETE /api/billing/payment-method', () => {
    it('returns 204 when card is unlinked with 0 active apps', async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const res = await detachPaymentMethod();
      expect(res.status).toBe(204);
      expect(fetchBackend).toHaveBeenCalledWith('/v1/billing/payment-method', { method: 'DELETE' });
    });

    it('returns 409 with details when user has active apps', async () => {
      const conflictData = {
        status: 409,
        error: 'Conflict',
        message: 'No se puede desvincular el método de pago.',
        details: ['Tienes 2 aplicación(es) activa(s). Debes eliminar tus aplicaciones antes de desvincular tu método de pago.'],
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(conflictData), { status: 409 })
      );

      const res = await detachPaymentMethod();
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.details).toHaveLength(1);
    });
  });

  describe('GET /api/billing/invoices', () => {
    it('passes pagination params to backend', async () => {
      const mockInvoices = {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockInvoices), { status: 200 })
      );

      const req = new NextRequest('http://localhost:3000/api/billing/invoices?page=1&size=5');
      const res = await getInvoices(req);
      expect(res.status).toBe(200);
      expect(fetchBackend).toHaveBeenCalledWith('/v1/billing/invoices?page=1&size=5&sort=createdAt%2Cdesc');
    });
  });
});
