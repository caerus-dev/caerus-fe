"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, Loader2, Inbox } from "lucide-react";
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
    fetchMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      // Revalidar notificaciones al abrir el popover
      fetchNotifications(0, filter, false);
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
          <Bell className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 bg-card border-border p-0 shadow-xl"
        align="end"
        sideOffset={8}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary/15 text-primary font-medium px-2 py-0.5 rounded-full">
                {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1 cursor-pointer"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Marcar todas</span>
            </Button>
          )}
        </div>

        {/* Pestañas de filtro: Todas vs No leídas */}
        <div className="flex border-b border-border bg-background/50 px-3 pt-2 gap-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer -mb-[1px]",
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
              "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer -mb-[1px] flex items-center gap-1.5",
              filter === "unread"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            No leídas
            {unreadCount > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </button>
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
