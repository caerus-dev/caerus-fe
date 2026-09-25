"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  Bell,
  ArrowRight,
  X,
} from "lucide-react";
import { NotificationItem } from "@/types/notification";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NotificationItemRowProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onClosePopover?: () => void;
}

export function NotificationItemRow({
  notification,
  onMarkAsRead,
  onDelete,
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
    if (isBilling) return "/dashboard/billing";
    if (isInvitation && metadata?.token) {
      return `/accept-invite?token=${metadata.token}`;
    }
    return null;
  };

  const actionUrl = getActionUrl();

  // Click en la tarjeta: solo marca como leída
  const handleCardClick = () => {
    if (!read) {
      onMarkAsRead(id);
    }
  };

  // Click en el CTA: marca como leída, cierra el popover y redirige
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!read) {
      onMarkAsRead(id);
    }
    if (actionUrl) {
      onClosePopover?.();
      router.push(actionUrl);
    }
  };

  // Click en la X: borra la notificación
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  // Limpiar redundancia en título cuando el badge ya muestra el porcentaje
  const cleanTitle =
    isBilling && metadata?.percentage !== undefined
      ? title.replace(/\s*\(\d+%\)/g, "")
      : title;

  // Formatear números con separador de miles y evitar repetición de porcentajes en mensaje
  const formattedMessage = React.useMemo(() => {
    if (isBilling && metadata?.consumed !== undefined && metadata?.included !== undefined) {
      const consumed = Number(metadata.consumed).toLocaleString("es-ES");
      const included = Number(metadata.included).toLocaleString("es-ES");
      const plan = metadata.planName || "Developer";
      return `Has consumido ${consumed} de las ${included} requests incluidas en tu plan ${plan}.`;
    }
    return message
      .replace(/\s*\(\d+%\)/g, "")
      .replace(/\b\d{4,}\b/g, (num) => Number(num).toLocaleString("es-ES"));
  }, [isBilling, metadata, message]);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "p-3.5 transition-colors text-xs flex gap-3 items-start group/item relative cursor-pointer border-b border-border/40 last:border-0",
        !read
          ? "bg-primary/5 hover:bg-primary/10"
          : "bg-transparent hover:bg-muted/40"
      )}
    >
      {/* Ícono de la notificación */}
      <div>{getIcon()}</div>

      {/* Contenido principal ocupando todo el ancho */}
      <div className="flex-1 min-w-0 text-left space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {/* Indicador sutil de no leída alineado con el título */}
            {!read && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                title="No leída"
              />
            )}

            <p
              className={cn(
                "font-medium text-xs leading-snug",
                !read ? "text-foreground font-semibold" : "text-foreground/90"
              )}
            >
              {cleanTitle}
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

          {/* Botón para eliminar notificación */}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
            title="Eliminar notificación"
            aria-label="Eliminar notificación"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
          {formattedMessage}
        </p>

        {/* Footer: timestamp y CTA perfectamente alineados en el mismo baseline/center */}
        <div className="flex items-center justify-between pt-1.5 text-[11px] leading-none">
          <span className="text-muted-foreground leading-none">
            {formatRelativeTime(createdAt)}
          </span>

          {actionUrl && (
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline group-hover/item:translate-x-0.5 transition-transform leading-none cursor-pointer"
            >
              {isBilling
                ? "Ver facturación"
                : isInvitation
                ? "Aceptar invitación"
                : "Ver detalle"}
              <ArrowRight className="h-3 w-3 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
