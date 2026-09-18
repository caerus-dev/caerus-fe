"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  NotificationItem,
  NotificationsPagedResponse,
  UnreadCountResponse,
} from "@/types/notification";

export type NotificationFilter = "all" | "unread";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [totalElements, setTotalElements] = useState<number>(0);

  const filterRef = useRef<NotificationFilter>(filter);
  filterRef.current = filter;

  const notificationsRef = useRef<NotificationItem[]>(notifications);
  notificationsRef.current = notifications;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Carga únicamente el conteo de no leídas (para el badge / polling liviano)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/unread-count?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: UnreadCountResponse = await res.json();
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  }, []);

  // Carga la lista paginada de notificaciones
  const fetchNotifications = useCallback(
    async (targetPage = 0, currentFilter = filterRef.current, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
      }

      const signal = !append ? abortControllerRef.current?.signal : undefined;

      try {
        const params = new URLSearchParams({
          page: targetPage.toString(),
          size: "10",
          _t: Date.now().toString(),
        });

        if (currentFilter === "unread") {
          params.set("read", "false");
        }

        const res = await fetch(`/api/notifications?${params.toString()}`, {
          cache: "no-store",
          signal,
        });

        if (res.ok) {
          const data: NotificationsPagedResponse = await res.json();
          setNotifications((prev) => {
            if (!append) return data.content || [];
            const existingIds = new Set(prev.map((n) => n.id));
            const newItems = (data.content || []).filter((n) => !existingIds.has(n.id));
            return [...prev, ...newItems];
          });
          setPage(data.page ?? targetPage);
          setHasNext(Boolean(data.hasNext));
          setTotalElements(data.totalElements ?? 0);
          if (typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("Error fetching notifications list:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Cambio de filtro
  const handleFilterChange = useCallback(
    (newFilter: NotificationFilter) => {
      setFilter(newFilter);
      fetchNotifications(0, newFilter, false);
    },
    [fetchNotifications]
  );

  // Cargar más (paginación infinita en el dropdown)
  const fetchMore = useCallback(() => {
    if (!hasNext || isLoadingMore || isLoading) return;
    fetchNotifications(page + 1, filter, true);
  }, [hasNext, isLoadingMore, isLoading, page, filter, fetchNotifications]);

  // Marcar una notificación individual como leída con Optimistic Update
  const markAsRead = useCallback(async (id: string) => {
    const target = notificationsRef.current.find((item) => item.id === id);
    if (target && !target.read) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, read: true, readAt: item.readAt || new Date().toISOString() }
          : item
      )
    );

    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) {
        console.error(`Failed to mark notification ${id} as read:`, res.status);
      }
    } catch (err) {
      console.error(`Error marking notification ${id} as read:`, err);
    }
  }, []);

  // Marcar todas las notificaciones como leídas con Optimistic Update
  const markAllAsRead = useCallback(async () => {
    const nowIso = new Date().toISOString();
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true, readAt: item.readAt || nowIso }))
    );

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (!res.ok) {
        console.error("Failed to mark all notifications as read:", res.status);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  // Eliminar una notificación individual con Optimistic Update
  const deleteNotification = useCallback(async (id: string) => {
    const deletedItem = notificationsRef.current.find((item) => item.id === id);
    const wasUnread = deletedItem ? !deletedItem.read : false;

    if (wasUnread) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    setNotifications((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) {
        console.error(`Failed to delete notification ${id}:`, res.status);
        // Rollback en caso de fallo
        if (deletedItem) {
          setNotifications((prev) => [deletedItem, ...prev]);
          if (wasUnread) {
            setUnreadCount((count) => count + 1);
          }
        }
      }
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
      // Rollback
      if (deletedItem) {
        setNotifications((prev) => [deletedItem, ...prev]);
        if (wasUnread) {
          setUnreadCount((count) => count + 1);
        }
      }
    }
  }, []);

  // Eliminar todas las notificaciones con Optimistic Update
  const deleteAllNotifications = useCallback(async () => {
    const previousNotifications = [...notificationsRef.current];
    const previousUnreadCount = notificationsRef.current.filter((n) => !n.read).length;

    setUnreadCount(0);
    setNotifications([]);

    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete all notifications:", res.status);
        // Rollback
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      // Rollback
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchNotifications(0, "all", false);
    fetchUnreadCount();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Polling inteligente de conteo no leído (cada 10s, si la pestaña/ventana está activa)
  // Revalida ante "focus" (clave al switchear de ventana/cuenta) o "visibilitychange"
  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    };

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    }, 10000);

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    filter,
    isLoading,
    isLoadingMore,
    page,
    hasNext,
    totalElements,
    setFilter: handleFilterChange,
    fetchNotifications,
    fetchUnreadCount,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}
