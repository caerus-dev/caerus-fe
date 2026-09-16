"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  Bell,
  Check,
  ArrowRight,
} from "lucide-react";
import { NotificationItem } from "@/types/notification";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItemRowProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onClosePopover?: () => void;
}

export function NotificationItemRow({
  notification,
  onMarkAsRead,
  onClosePopover,
}: NotificationItemRowProps) {
  const router = useRouter();
  const { id, title, message, type, severity, read, metadata, createdAt } =
    notification;

  // Determinar ícono y paleta según tipo y severidad
  const isBilling = type === "BILLING_THRESHOLD_WARNING";
  const isInvitation = type === "COLLABORATOR_INVITATION";

  const getIcon = () => {
    if (isBilling) {
      if (severity === "CRITICAL" || (metadata?.percentage && metadata.percentage >= 100)) {
        return (
          <div className="p-2 rounded-lg bg-destructive/15 text-destructive shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
        );
      }
      return (
        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500 shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
      );
    }

    if (isInvitation) {
      return (
        <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
          <UserPlus className="h-4 w-4" />
        </div>
      );
    }

    return (
      <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
        <Bell className="h-4 w-4" />
      </div>
    );
  };

  // Determinar URL de acción
  const getActionUrl = (): string | null => {
    if (metadata?.actionUrl) return metadata.actionUrl;
    if (isBilling) return "/settings/billing";
    if (isInvitation && metadata?.token) {
      return `/accept-invite?token=${metadata.token}`;
    }
    return null;
  };

  const actionUrl = getActionUrl();

  const handleClick = (e: React.MouseEvent) => {
    // Si no está leída, marcarla
    if (!read) {
      onMarkAsRead(id);
    }

    // Si tiene URL de navegación, navegar y cerrar popover
    if (actionUrl) {
      e.preventDefault();
      onClosePopover?.();
      router.push(actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3.5 transition-colors text-xs flex gap-3 items-start group/item relative cursor-pointer border-b border-border/40 last:border-0",
        read
          ? "bg-transparent hover:bg-muted/40"
          : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {/* Indicador visual de no leída */}
      {!read && (
        <span className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Ícono de la notificación */}
      <div className="pl-1">{getIcon()}</div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0 pr-1 text-left space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={cn(
              "font-medium text-xs leading-snug",
              !read ? "text-foreground font-semibold" : "text-foreground/90"
            )}
          >
            {title}
          </p>

          {/* Badges contextuales */}
          {isBilling && metadata?.percentage !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-semibold",
                metadata.percentage >= 100
                  ? "border-destructive/40 text-destructive bg-destructive/10"
                  : "border-amber-500/40 text-amber-500 bg-amber-500/10"
              )}
            >
              {metadata.percentage}%
            </Badge>
          )}

          {isInvitation && metadata?.applicationName && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/10"
            >
              {metadata.applicationName}
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
          {message}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </span>

          {actionUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline group-hover/item:translate-x-0.5 transition-transform">
              {isBilling
                ? "Ver facturación"
                : isInvitation
                ? "Aceptar invitación"
                : "Ver detalle"}
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Botón para marcar individualmente como leída */}
      {!read && (
        <div className="shrink-0 pt-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(id);
            }}
            title="Marcar como leída"
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Marcar como leída</span>
          </Button>
        </div>
      )}
    </div>
  );
}
