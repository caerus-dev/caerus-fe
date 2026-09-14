"use client";

import React from "react";
import {
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeadlockPayload } from "@/types/events";

interface DeadlockVisualizerProps {
  payload: DeadlockPayload | any;
  onNavigateToManualControl?: (preselect: {
    product: "SRE" | "DLS";
    method: string;
    params: Record<string, any>;
    autoExecute?: boolean;
  }) => void;
  onCloseSheet?: () => void;
}

export function DeadlockVisualizer({
  payload,
  onNavigateToManualControl,
  onCloseSheet,
}: DeadlockVisualizerProps) {
  if (!payload) return null;

  const victimId = payload.victimTransactionId;
  const cycle: string[] = Array.isArray(payload.cycleTransactionIds)
    ? payload.cycleTransactionIds
    : [];

  const rawStrategy = String(
    payload.resolutionStrategy || payload.deadlockStrategy || ""
  ).trim();

  const isAlertOnly =
    rawStrategy.toLowerCase() === "alert" ||
    rawStrategy.toLowerCase() === "alert_only" ||
    rawStrategy.toLowerCase() === "only_alert" ||
    rawStrategy.toLowerCase().includes("alert") ||
    rawStrategy.toLowerCase().includes("manual");

  const strategy = rawStrategy || (isAlertOnly ? "ALERT_ONLY" : "VICTIM_ABORT");
  const reason = payload.reason;

  return (
    <Card className="border-destructive/40 bg-destructive/5 dark:bg-destructive/10 overflow-hidden max-w-full min-w-0 shadow-xs">
      <CardHeader className="px-3.5 py-2.5 pb-2.5! border-b border-destructive/20 bg-destructive/10 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertOctagon className="h-4 w-4 text-destructive shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-semibold text-destructive truncate">
            Interbloqueo Detectado (Deadlock)
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-mono font-medium px-2 py-0.5 shrink-0",
            isAlertOnly
              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
              : "border-destructive/40 text-destructive"
          )}
        >
          Estrategia: {strategy}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 space-y-2.5 text-xs">
        {reason && (
          <div className="px-2.5 py-1.5 rounded-md bg-background/70 border border-destructive/20 text-muted-foreground text-xs leading-snug">
            <span className="font-semibold text-foreground">Diagnóstico: </span>
            {reason}
          </div>
        )}

        {/* Mensaje informativo para resolución manual (Solo alertar) */}
        {isAlertOnly && (
          <div className="flex items-start gap-2 p-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold text-amber-400 text-xs leading-none">
                Intervención Manual Requerida
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                La estrategia configurada es de solo alertar. El sistema no abortó ninguna transacción automáticamente.
                Se sugiere terminar manualmente la transacción candidata a continuación para disolver el ciclo de bloqueo.
              </p>
            </div>
          </div>
        )}

        {/* Transacción Víctima / Candidata */}
        {victimId && (
          <div
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-lg border",
              isAlertOnly
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-destructive/30 bg-destructive/15"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isAlertOnly ? (
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-wider",
                      isAlertOnly ? "text-amber-400" : "text-destructive"
                    )}
                  >
                    {isAlertOnly
                      ? "Transacción Víctima Sugerida"
                      : "Transacción Víctima Abortada"}
                  </span>
                  <Badge
                    variant={isAlertOnly ? "outline" : "default"}
                    className={cn(
                      "text-[9px] px-1.5 py-0",
                      isAlertOnly
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        : "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {isAlertOnly ? "Sugerida" : "Abortada"}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-foreground font-semibold break-all mt-0.5">
                  {victimId}
                </p>
              </div>
            </div>

            <Button
              variant={isAlertOnly ? "destructive" : "outline"}
              size="sm"
              className="h-7 px-2.5 gap-1.5 text-xs font-medium shrink-0 self-end sm:self-center"
              onClick={() => {
                if (onCloseSheet) onCloseSheet();
                onNavigateToManualControl?.({
                  product: "DLS",
                  method: "GET_TRANSACTION_STATUS",
                  params: { transactionId: victimId },
                  autoExecute: true,
                });
              }}
            >
              <Ban className="h-3 w-3" />
              <span>{isAlertOnly ? "Resolver en Control Manual" : "Inspeccionar Transacción"}</span>
            </Button>
          </div>
        )}

        {/* Ciclo de Dependencia de Transacciones */}
        {cycle.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-[11px]">
                <RotateCcw className="h-3 w-3 text-destructive" />
                Ciclo de Dependencia ({cycle.length} transacciones)
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {isAlertOnly
                  ? "Bloqueo activo"
                  : "Bloqueo resuelto"}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg border border-border/70 bg-background/60 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max py-0.5">
                {cycle.map((txId, index) => {
                  const isVictim = txId === victimId;

                  return (
                    <React.Fragment key={`${txId}-${index}`}>
                      <div
                        className={cn(
                          "px-2 py-1 rounded-md border flex items-center gap-1.5 transition-colors",
                          isVictim
                            ? isAlertOnly
                              ? "border-amber-500/60 bg-amber-500/15 text-amber-400 font-semibold shadow-xs"
                              : "border-destructive/60 bg-destructive/15 text-destructive font-semibold shadow-xs"
                            : "border-border bg-card text-foreground font-medium"
                        )}
                      >
                        <span className="text-[9px] opacity-60 font-mono">
                          #{index + 1}
                        </span>
                        <span
                          className="font-mono text-xs max-w-[130px] sm:max-w-[180px] truncate"
                          title={txId}
                        >
                          {txId}
                        </span>
                        {isVictim && (
                          <span
                            className={cn(
                              "text-[8px] px-1 py-0 rounded font-bold uppercase tracking-wider",
                              isAlertOnly
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-destructive text-destructive-foreground"
                            )}
                          >
                            {isAlertOnly ? "Sugerida" : "Víctima"}
                          </span>
                        )}
                      </div>

                      {/* Flecha conectora */}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    </React.Fragment>
                  );
                })}

                {/* Cierre del ciclo visual */}
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-md border border-dashed text-[10px] font-mono flex items-center gap-1",
                    isAlertOnly
                      ? "border-amber-500/40 text-amber-400"
                      : "border-destructive/40 text-destructive"
                  )}
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>{isAlertOnly ? "Ciclo Abierto" : "Ciclo Cerrado"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
