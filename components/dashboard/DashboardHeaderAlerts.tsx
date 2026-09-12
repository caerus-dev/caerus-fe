"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, CreditCard, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserResponse } from "@/types/billing";
import { useUser } from "@/hooks/use-user";
import { SetupPaymentMethodModal } from "@/components/billing/SetupPaymentMethodModal";
import { formatPercentage } from "@/lib/utils";

export interface DashboardHeaderAlertsProps {
  user?: UserResponse | null;
  appsCount?: number;
  className?: string;
}

export function DashboardHeaderAlerts({
  user: propUser,
  appsCount = 0,
  className = "",
}: DashboardHeaderAlertsProps) {
  const { user: hookUser } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  const user = propUser !== undefined ? propUser : hookUser;

  if (!user) {
    return null;
  }

  const isEnterprise = user.billingPlan?.code === "ENTERPRISE";
  const hasPaymentMethod = Boolean(user.hasValidPaymentMethod);
  const usage = user.billingUsage;
  const percentage = usage?.percentage ?? 0;
  const consumedUnits = usage?.consumedUnits?.toLocaleString() ?? "0";
  const includedUnits = usage?.includedUnits?.toLocaleString() ?? "0";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Alerta de Sobreconsumo (>= 100%) */}
      {!isEnterprise && percentage >= 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-destructive/20 text-destructive shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  Límite de Consumo Excedido
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  {formatPercentage(percentage)}% consumido
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Has utilizado {consumedUnits} de {includedUnits} requests incluidas en tu plan. Se aplicarán tarifas de excedente sobre el uso adicional.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="destructive" className="w-full gap-1.5 text-xs">
              Gestionar Facturación
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* 2. Advertencia de Umbral de Consumo (>= 80% y < 100%) */}
      {!isEnterprise && percentage >= 80 && percentage < 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/20 text-amber-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  Advertencia de Consumo ({formatPercentage(percentage)}%)
                </span>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">
                  Cerca del límite
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Has consumido {consumedUnits} de {includedUnits} requests. Considera mejorar tu plan para evitar interrupciones o costos por excedente.
              </p>
            </div>
          </div>
          <Link href="/settings/billing" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              Ver Facturación
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Usuario Nuevo (hasValidPaymentMethod === false, apps === 0) */}
      {!hasPaymentMethod && appsCount === 0 && (
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary/20 text-primary">
                  <CreditCard className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-base text-foreground">
                  Configura tu método de pago para comenzar
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Caerus utiliza un modelo de facturación basado en uso. En el plan gratuito{" "}
                <span className="font-semibold text-foreground">Developer ($0/mes)</span> obtienes 50.000 requests gratuitas cada mes. Es necesario vincular una tarjeta para activar tu cuenta y cubrir posibles consumos adicionales.
              </p>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="shrink-0 font-medium shadow-md gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              Vincular Tarjeta ($0/mes)
            </Button>
          </div>
        </div>
      )}

      {/* 4. Colaborador Invitado (hasValidPaymentMethod === false, apps > 0) */}
      {!hasPaymentMethod && appsCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/40 p-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-muted-foreground">
              Estás colaborando en aplicaciones ajenas. Para crear tus propias aplicaciones e infraestructura independiente, añade un método de pago.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="shrink-0 h-8 text-xs gap-1.5 font-medium"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Añadir Tarjeta
          </Button>
        </div>
      )}

      <SetupPaymentMethodModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Vincular Tarjeta de Crédito"
        description="Registra tu método de pago para habilitar la creación de aplicaciones propias en Caerus."
      />
    </div>
  );
}
