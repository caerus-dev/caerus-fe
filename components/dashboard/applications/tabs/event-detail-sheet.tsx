"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Copy,
  Check,
  Calendar,
  Clock,
  Key,
  User,
  Server,
  Layers,
  FileJson,
  Info,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventResponse, EventTypeCatalogItem } from "@/types/events";
import { DeadlockVisualizer } from "./deadlock-visualizer";

interface EventDetailSheetProps {
  event: EventResponse | null;
  catalogItem?: EventTypeCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailSheet({
  event,
  catalogItem,
  open,
  onOpenChange,
}: EventDetailSheetProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!event) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copiado al portapapeles`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Manejo seguro del payload
  let parsedPayload: any = event.payload;
  if (typeof parsedPayload === "string") {
    try {
      parsedPayload = JSON.parse(parsedPayload);
    } catch {
      // mantener como string si falla el parse
    }
  }

  const payloadString =
    typeof parsedPayload === "object"
      ? JSON.stringify(parsedPayload, null, 2)
      : String(event.payload || "{}");

  const isDeadlock = event.eventType === "lock.deadlock_detected";
  const isFailure =
    event.eventType.includes("fail") ||
    event.eventType.includes("abort") ||
    event.eventType.includes("expired") ||
    isDeadlock;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-full md:w-1/2 md:max-w-[50vw] lg:w-1/3 lg:max-w-[33.333vw] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl overflow-hidden min-w-0"
      >
        {/* Encabezado con padding adecuado y espacio para el botón de cierre */}
        <SheetHeader className="p-5 sm:p-6 pb-4 border-b border-border bg-muted/20 pr-12">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-2 py-0.5",
                event.product === "DLS"
                  ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                  : "border-purple-500/40 text-purple-400 bg-purple-500/10"
              )}
            >
              {event.product}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-xs font-mono font-medium px-2 py-0.5",
                isFailure
                  ? "border-destructive/40 text-destructive bg-destructive/10"
                  : "border-green-500/40 text-green-400 bg-green-500/10"
              )}
            >
              {event.eventType}
            </Badge>

            {event.isBillable ? (
              <Badge variant="secondary" className="text-[11px] text-muted-foreground px-2 py-0.5">
                Facturable ({event.billingUnits}u)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground/60 px-2 py-0.5">
                No facturable
              </Badge>
            )}
          </div>

          <SheetTitle className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground break-all text-left">
            {event.eventType}
          </SheetTitle>

          <SheetDescription className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed mt-1">
            {catalogItem?.description || "Registro histórico de auditoría generado por el sistema Caerus."}
          </SheetDescription>
        </SheetHeader>

        {/* Contenido desplazable verticalmente sin desbordamiento horizontal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-6 min-w-0 max-w-full">
          {/* Visualizador específico para Deadlocks */}
          {isDeadlock && <DeadlockVisualizer payload={parsedPayload} />}

          {/* Sección 1: Información del Evento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              Información del Evento
            </h4>

            <div className="rounded-xl border border-border/70 bg-background/50 divide-y divide-border/50 text-xs overflow-hidden">
              {/* Event ID */}
              <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-semibold text-xs text-foreground/80">Event ID</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => copyToClipboard(event.eventId || event.id, "Event ID")}
                  >
                    {copiedField === "Event ID" ? (
                      <>
                        <Check className="h-3 w-3 text-green-400" />
                        <span className="text-green-400 font-medium">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="font-mono text-xs text-foreground break-all select-all bg-muted/40 p-2.5 rounded-md border border-border/40">
                  {event.eventId || event.id}
                </p>
              </div>

              {/* Objeto Afectado */}
              <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-semibold text-xs text-foreground/80">
                    Objeto Afectado {event.objectType ? `(${event.objectType})` : ""}
                  </span>
                  {event.objectId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => copyToClipboard(event.objectId!, "Object ID")}
                    >
                      {copiedField === "Object ID" ? (
                        <>
                          <Check className="h-3 w-3 text-green-400" />
                          <span className="text-green-400 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="font-mono text-xs text-foreground font-semibold break-all select-all bg-muted/40 p-2.5 rounded-md border border-border/40">
                  {event.objectId || "No especificado"}
                </p>
              </div>

              {/* Fechas de Ocurrencia y Recepción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider">Ocurrió</span>
                  </div>
                  <p className="font-mono text-xs text-foreground font-medium">
                    {event.occurredAt
                      ? format(new Date(event.occurredAt), "dd/MM/yyyy HH:mm:ss")
                      : "-"}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider">Registrado</span>
                  </div>
                  <p className="font-mono text-xs text-foreground font-medium">
                    {event.receivedAt
                      ? format(new Date(event.receivedAt), "dd/MM/yyyy HH:mm:ss")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección 2: Origen y Autenticación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Origen y Autenticación
            </h4>

            <div className="rounded-xl border border-border/70 bg-background/50 divide-y divide-border/50 text-xs overflow-hidden">
              {/* Fuente / Source */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  {event.source === "SDK" ? (
                    <Key className="h-4 w-4 text-primary" />
                  ) : event.source === "DASHBOARD" ? (
                    <User className="h-4 w-4 text-chart-2" />
                  ) : (
                    <Server className="h-4 w-4 text-muted-foreground" />
                  )}
                  Fuente (Source)
                </span>
                <Badge variant="secondary" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                  {event.source}
                </Badge>
              </div>

              {/* API Key Prefix si existe */}
              {event.apiKeyPrefix && (
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground font-medium">API Key Prefix:</span>
                  <span className="font-mono text-foreground font-semibold px-2.5 py-1 rounded-md bg-muted text-xs border border-border/50">
                    {event.apiKeyPrefix}
                  </span>
                </div>
              )}

              {/* Actor Email si existe */}
              {event.actorEmail && (
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground font-medium">Usuario / Actor:</span>
                  <span className="font-medium text-foreground text-xs">
                    {event.actorEmail}
                  </span>
                </div>
              )}

              {/* Actor ID si existe y no hay email */}
              {event.actorId && !event.actorEmail && (
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground font-medium">Actor ID:</span>
                  <span className="font-mono text-xs text-foreground">
                    {event.actorId}
                  </span>
                </div>
              )}

              {/* Unidades de facturación */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-muted-foreground font-medium">Cómputo / Facturación:</span>
                <span className="text-xs font-medium">
                  {event.isBillable ? (
                    <span className="text-emerald-400 font-semibold">
                      {event.billingUnits} {event.billingUnits === 1 ? "unidad" : "unidades"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Exento (0 unidades)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección 3: Payload del Evento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileJson className="h-3.5 w-3.5 text-primary" />
                Payload del Evento
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 px-2.5"
                onClick={() => copyToClipboard(payloadString, "Payload JSON")}
              >
                {copiedField === "Payload JSON" ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-border/80 bg-zinc-950 dark:bg-black p-4 font-mono text-xs overflow-x-auto max-h-80 max-w-full">
              <pre className="text-emerald-400 leading-relaxed whitespace-pre-wrap break-all">
                {payloadString}
              </pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
