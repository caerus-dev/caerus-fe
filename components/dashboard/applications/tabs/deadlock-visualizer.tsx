"use client";

import React from "react";
import { AlertOctagon, ArrowRight, ShieldAlert, XCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeadlockPayload } from "@/types/events";

interface DeadlockVisualizerProps {
  payload: DeadlockPayload | any;
}

export function DeadlockVisualizer({ payload }: DeadlockVisualizerProps) {
  if (!payload) return null;

  const victimId = payload.victimTransactionId;
  const cycle: string[] = Array.isArray(payload.cycleTransactionIds) ? payload.cycleTransactionIds : [];
  const strategy = payload.resolutionStrategy || "VICTIM_ABORT";
  const reason = payload.reason;

  return (
    <Card className="border-destructive/40 bg-destructive/5 dark:bg-destructive/10 overflow-hidden max-w-full min-w-0">
      <CardHeader className="p-4 pb-3 border-b border-destructive/20 bg-destructive/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
            <CardTitle className="text-sm font-semibold text-destructive">
              Interbloqueo Detectado (Deadlock)
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs border-destructive/40 text-destructive font-mono">
              Estrategia: {strategy}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs sm:text-sm">
        {reason && (
          <div className="p-2.5 rounded-md bg-background/80 border border-destructive/20 text-muted-foreground">
            <span className="font-semibold text-foreground">Diagnóstico: </span>
            {reason}
          </div>
        )}

        {/* Transacción Víctima */}
        {victimId && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/15">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                Transacción Víctima Abortada
              </p>
              <p className="font-mono text-xs sm:text-sm text-foreground font-semibold break-all">
                {victimId}
              </p>
            </div>
            <Badge className="bg-destructive text-destructive-foreground text-[10px] shrink-0">
              Abortada
            </Badge>
          </div>
        )}

        {/* Ciclo de Dependencia de Transacciones */}
        {cycle.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-destructive" />
                Ciclo de Dependencia Cíclica ({cycle.length} transacciones)
              </span>
              <span className="text-[11px] text-muted-foreground/70">
                Bloqueo circular resuelto
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/80 bg-background/60 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max py-1">
                {cycle.map((txId, index) => {
                  const isVictim = txId === victimId;
                  const isLast = index === cycle.length - 1;

                  return (
                    <React.Fragment key={`${txId}-${index}`}>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-md border flex items-center gap-2 transition-colors",
                          isVictim
                            ? "border-destructive/60 bg-destructive/15 text-destructive font-semibold shadow-xs"
                            : "border-border bg-card text-foreground font-medium"
                        )}
                      >
                        <span className="text-[10px] opacity-60 font-mono">
                          #{index + 1}
                        </span>
                        <span className="font-mono text-xs max-w-[150px] sm:max-w-[200px] truncate" title={txId}>
                          {txId}
                        </span>
                        {isVictim && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground font-bold uppercase tracking-wider">
                            Víctima
                          </span>
                        )}
                      </div>

                      {/* Flecha conectora */}
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                    </React.Fragment>
                  );
                })}

                {/* Cierre del ciclo visual */}
                <div className="px-2.5 py-1.5 rounded-md border border-dashed border-destructive/40 text-destructive text-[11px] font-mono flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" />
                  <span>Ciclo Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
