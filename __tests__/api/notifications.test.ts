import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/api", () => ({
  fetchBackend: vi.fn(),
}));

import { GET as getNotifications } from "@/app/api/notifications/route";
import { GET as getUnreadCount } from "@/app/api/notifications/unread-count/route";
import { PATCH as markSingleAsRead } from "@/app/api/notifications/[id]/read/route";
import { PATCH as markAllAsRead } from "@/app/api/notifications/read-all/route";
import { fetchBackend } from "@/lib/api";

describe("Notifications BFF API Routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/notifications", () => {
    it("fetches paginated notifications and passes query parameters", async () => {
      const mockBackendResponse = {
        content: [
          {
            id: "uuid-1",
            title: "Alerta de consumo (80%)",
            message: "Has consumido 40.000 de 50.000 requests (80%)",
            type: "BILLING_THRESHOLD_WARNING",
            severity: "WARNING",
            read: false,
            readAt: null,
            metadata: {
              percentage: 80,
              consumed: 40000,
              included: 50000,
              planName: "Developer",
              actionUrl: "/settings/billing",
            },
            createdAt: "2026-09-15T23:00:00Z",
          },
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        unreadCount: 1,
      };

      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify(mockBackendResponse), { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications?page=0&size=10&read=false");
      const res = await getNotifications(request);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.unreadCount).toBe(1);
      expect(data.content).toHaveLength(1);
      expect(data.content[0].type).toBe("BILLING_THRESHOLD_WARNING");
      expect(fetchBackend).toHaveBeenCalledWith("/v1/notifications?page=0&size=10&read=false");
    });

    it("returns error status when backend responds with error", async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications");
      const res = await getNotifications(request);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("GET /api/notifications/unread-count", () => {
    it("returns unread count from backend", async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(JSON.stringify({ unreadCount: 5 }), { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications/unread-count");
      const res = await getUnreadCount(request);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.unreadCount).toBe(5);
      expect(fetchBackend).toHaveBeenCalledWith("/v1/notifications/unread-count");
    });

    it("handles failure from backend gracefully", async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications/unread-count");
      const res = await getUnreadCount(request);

      expect(res.status).toBe(500);
    });
  });

  describe("PATCH /api/notifications/[id]/read", () => {
    it("marks single notification as read and returns 204", async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications/uuid-1/read", {
        method: "PATCH",
      });
      const res = await markSingleAsRead(request, {
        params: Promise.resolve({ id: "uuid-1" }),
      });

      expect(res.status).toBe(204);
      expect(fetchBackend).toHaveBeenCalledWith("/v1/notifications/uuid-1/read", {
        method: "PATCH",
      });
    });
  });

  describe("PATCH /api/notifications/read-all", () => {
    it("marks all notifications as read and returns 204", async () => {
      vi.mocked(fetchBackend).mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const request = new NextRequest("http://localhost:3000/api/notifications/read-all", {
        method: "PATCH",
      });
      const res = await markAllAsRead(request);

      expect(res.status).toBe(204);
      expect(fetchBackend).toHaveBeenCalledWith("/v1/notifications/read-all", {
        method: "PATCH",
      });
    });
  });
});
