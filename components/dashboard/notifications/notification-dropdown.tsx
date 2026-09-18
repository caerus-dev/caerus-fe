"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, Loader2, Inbox, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, NotificationFilter } from "@/hooks/use-notifications";
import { NotificationItemRow } from "./notification-item";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    filter,
    isLoading,
    isLoadingMore,
    hasNext,
    setFilter,
    fetchNotifications,
    fetchUnreadCount,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      // Revalidar notificaciones y conteo al abrir el popover
      fetchNotifications(0, filter, false);
      fetchUnreadCount();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer hover:bg-muted/80"
          aria-label="Abrir notificaciones"
        >
          <div className="relative flex items-center justify-center">
            <Bell className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm leading-none tabular-nums select-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 bg-card border-2 border-border shadow-2xl rounded-xl overflow-hidden p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header con Pestañas de filtro y acciones (Marcar todas y Limpiar) */}
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 pt-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer -mb-[1px] whitespace-nowrap",
                filter === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer -mb-[1px] flex items-center gap-1.5 whitespace-nowrap",
                filter === "unread"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              No leídas
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/15 text-primary font-semibold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 mb-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markAllAsRead()}
                className="h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer"
                title="Marcar todas como leídas"
                aria-label="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="sr-only">Marcar todas como leídas</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAllNotifications()}
                className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Eliminar todas las notificaciones"
                aria-label="Eliminar todas las notificaciones"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar todas las notificaciones</span>
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2 select-none">
              <div className="mx-auto w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-foreground">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : "No tienes notificaciones"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {filter === "unread"
                  ? "¡Estás al día con todas tus alertas e invitaciones!"
                  : "Aquí aparecerán las alertas de consumo e invitaciones a colaborar."}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItemRow
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onClosePopover={() => setOpen(false)}
              />
            ))
          )}
        </div>

        {/* Footer con paginación si hay más elementos */}
        {hasNext && (
          <div className="border-t border-border p-2 bg-muted/10 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMore}
              disabled={isLoadingMore}
              className="w-full text-xs text-primary hover:text-primary/80 h-8 cursor-pointer gap-1.5"
            >
              {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isLoadingMore ? "Cargando más..." : "Cargar notificaciones anteriores"}</span>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
