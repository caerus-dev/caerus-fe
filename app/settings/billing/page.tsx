"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Zap,
  Rocket,
  Building2,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BillingPlan,
  UserResponse,
  Invoice,
  InvoicesResponse,
  PlanCode,
} from "@/types/billing";
import { useUser, triggerUserRefresh } from "@/hooks/use-user";
import { SetupPaymentMethodModal } from "@/components/billing/SetupPaymentMethodModal";
import { formatPercentage } from "@/lib/utils";

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, refreshUser } = useUser();

  // Plans state
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [confirmPlanModalOpen, setConfirmPlanModalOpen] = useState(false);
  const [targetPlanToConfirm, setTargetPlanToConfirm] = useState<BillingPlan | null>(null);
  const [changingPlanCode, setChangingPlanCode] = useState<string | null>(null);
  const [planChangeError, setPlanChangeError] = useState<string | null>(null);

  // Payment Method Modal
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Detach Card state
  const [detachDialogOpen, setDetachDialogOpen] = useState(false);
  const [isDetaching, setIsDetaching] = useState(false);
  const [detachConflict, setDetachConflict] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  // Invoices state
  const [invoicesData, setInvoicesData] = useState<InvoicesResponse | null>(null);
  const [invoicesPage, setInvoicesPage] = useState(0);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setIsPlansLoading(true);
    try {
      const res = await fetch("/api/billing/plans");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlans(data);
        }
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsPlansLoading(false);
    }
  }, []);

  // Fetch invoices
  const fetchInvoices = useCallback(async (page = 0) => {
    setIsInvoicesLoading(true);
    try {
      const res = await fetch(`/api/billing/invoices?page=${page}&size=10&sort=createdAt,desc`);
      if (res.ok) {
        const data = await res.json();
        setInvoicesData(data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchInvoices(invoicesPage);
  }, [fetchInvoices, invoicesPage]);

  // Handle plan change selection (opens confirmation dialog)
  const handleSelectPlan = (planCode: PlanCode) => {
    if (user?.billingPlan?.code === planCode) return;

    if (!hasPaymentMethod) {
      setPlanModalOpen(false);
      setSetupModalOpen(true);
      return;
    }

    const target = plans.find((p) => p.code === planCode) || null;
    setTargetPlanToConfirm(target);
    setPlanChangeError(null);
    setConfirmPlanModalOpen(true);
  };

  // Execute confirmed plan change
  const executePlanChange = async (planCode: PlanCode) => {
    setChangingPlanCode(planCode);
    setPlanChangeError(null);

    try {
      const res = await fetch("/api/users/me/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });

      if (res.ok) {
        const updatedUser = await res.json().catch(() => null);
        toast.success(`Plan actualizado a ${planCode} correctamente.`);
        setConfirmPlanModalOpen(false);
        setPlanModalOpen(false);
        if (updatedUser) {
          triggerUserRefresh(updatedUser);
        } else {
          triggerUserRefresh();
        }
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        setPlanChangeError(
          errData.message ||
            errData.error ||
            "No fue posible cambiar el plan. Por favor verifica los requisitos."
        );
      }
    } catch (err: any) {
      console.error("Error changing plan:", err);
      setPlanChangeError("Ocurrió un error inesperado al actualizar el plan.");
    } finally {
      setChangingPlanCode(null);
    }
  };

  // Handle detach payment method
  const handleConfirmDetach = async () => {
    setIsDetaching(true);
    setDetachConflict(null);

    try {
      const res = await fetch("/api/billing/payment-method", {
        method: "DELETE",
      });

      if (res.status === 204 || res.ok) {
        toast.success("Método de pago desvinculado con éxito.");
        setDetachDialogOpen(false);
        triggerUserRefresh();
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setDetachConflict({
            message: errData.message || "No se puede desvincular el método de pago.",
            details: Array.isArray(errData.details)
              ? errData.details
              : [errData.message || "Tienes aplicaciones activas asociadas."],
          });
        } else {
          toast.error(errData.message || "Error al desvincular el método de pago.");
          setDetachDialogOpen(false);
        }
      }
    } catch (err) {
      console.error("Error detaching payment method:", err);
      toast.error("Ocurrió un error al procesar la desvinculación.");
      setDetachDialogOpen(false);
    } finally {
      setIsDetaching(false);
    }
  };

  // Helpers
  const formatMoney = (amountInCents: number, currency = "USD") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amountInCents / 100);
  };

  const getPlanIcon = (code?: string) => {
    switch (code) {
      case "STARTUP":
        return <Rocket className="h-5 w-5 text-blue-500" />;
      case "ENTERPRISE":
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case "DEVELOPER":
      default:
        return <Zap className="h-5 w-5 text-amber-500" />;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pagada
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <XCircle className="h-3 w-3" />
            Fallida
          </Badge>
        );
      case "PENDING_PAYMENT":
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
    }
  };

  const formatBillingPeriod = (period: string) => {
    if (!period) return "—";
    const parts = period.split("-");
    if (parts.length !== 2) return period;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (isNaN(year) || isNaN(month)) return period;
    const date = new Date(Date.UTC(year, month - 1, 1));
    return date.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
  };

  const currentPlan = user?.billingPlan;
  const usage = user?.billingUsage;
  const percentage = usage?.percentage ?? 0;
  const hasPaymentMethod = Boolean(user?.hasValidPaymentMethod);

  const getProgressBarColor = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Facturación y Planes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu suscripción, método de pago y consulta el historial de facturas.
        </p>
      </div>

      {/* Banner de cuenta pendiente de activación */}
      {!hasPaymentMethod && !isUserLoading && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold text-sm">Tu cuenta está en el plan gratuito Developer (Pendiente de Activación)</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>
              Tienes 50.000 requests mensuales incluidas sin costo ($0/mes). Para activar tu cuenta y habilitar el despliegue de aplicaciones, registra una tarjeta de respaldo.
            </span>
            <Button
              size="sm"
              onClick={() => setSetupModalOpen(true)}
              className="bg-primary text-primary-foreground font-semibold text-xs h-8 shrink-0 self-start sm:self-auto"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Vincular Tarjeta ($0/mes)
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Grid de 2 Columnas: Plan Actual & Método de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Tarjeta de Plan Actual y Consumo (2 columnas) */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                  {hasPaymentMethod ? "Tu Plan Activo" : "Plan Base (Pendiente de Activación)"}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2.5">
                  {getPlanIcon(currentPlan?.code)}
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {isUserLoading ? (
                      <Skeleton className="h-7 w-32" />
                    ) : (
                      currentPlan?.name || "Developer"
                    )}
                  </CardTitle>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {currentPlan?.code || "DEVELOPER"}
                  </Badge>
                  {!hasPaymentMethod && !isUserLoading && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-semibold">
                      Sin tarjeta vinculada
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentPlan?.code === "DEVELOPER" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!hasPaymentMethod) {
                        setSetupModalOpen(true);
                      } else {
                        setPlanChangeError(null);
                        const startupPlan = plans.find((p) => p.code === "STARTUP") || null;
                        setTargetPlanToConfirm(startupPlan);
                        setConfirmPlanModalOpen(true);
                      }
                    }}
                    className="font-semibold text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    Mejorar a Startup
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlanChangeError(null);
                    setPlanModalOpen(true);
                  }}
                  className="font-medium text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Cambiar Plan
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Precio Base y Datos clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Precio Base Mensual</p>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {isUserLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : currentPlan?.code === "ENTERPRISE" ? (
                    "Personalizado"
                  ) : currentPlan?.monthlyBasePrice ? (
                    currentPlan.monthlyBasePrice.amount === 0
                      ? "$0 / mes"
                      : `${formatMoney(currentPlan.monthlyBasePrice.amount, currentPlan.monthlyBasePrice.currency)} / mes`
                  ) : (
                    "$0 / mes"
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Miembros del Equipo</p>
                <div className="text-lg font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {isUserLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : currentPlan?.maxCollaborators === null ? (
                    "Ilimitados"
                  ) : currentPlan?.maxCollaborators === 1 ? (
                    "1 (Solo Owner)"
                  ) : (
                    `Hasta ${currentPlan?.maxCollaborators} miembros`
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tarifa de Excedente</p>
                <div className="text-xs font-semibold text-foreground mt-1 leading-snug">
                  {isUserLoading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : currentPlan?.code === "ENTERPRISE" ? (
                    "Incluido en el plan"
                  ) : currentPlan?.overageBlockPrice && currentPlan.overageBlockPrice.amount > 0 ? (
                    `${formatMoney(currentPlan.overageBlockPrice.amount)} por cada ${(currentPlan.overageBlockSize || 10000).toLocaleString()} requests`
                  ) : (
                    "Incluido en el plan"
                  )}
                </div>
              </div>
            </div>

            {/* Barra de progreso de consumo mensual o aviso Enterprise */}
            {currentPlan?.code === "ENTERPRISE" ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    Consumo del Periodo ({usage?.period || new Date().toISOString().slice(0, 7)})
                  </span>
                  <div className="text-muted-foreground font-mono">
                    {(usage?.consumedUnits ?? 0).toLocaleString()} requests consumidas
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-xs text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Tu plan Enterprise cuenta con capacidad y SLA a medida sin límites rígidos automáticos.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    Consumo del Periodo ({usage?.period || new Date().toISOString().slice(0, 7)})
                  </span>
                  <div className="text-muted-foreground">
                    {isUserLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      `${(usage?.consumedUnits ?? 0).toLocaleString()} / ${(usage?.includedUnits ?? 0).toLocaleString()} requests (${formatPercentage(percentage)}%)`
                    )}
                  </div>
                </div>

                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all duration-500 ease-in-out ${getProgressBarColor()}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {percentage >= 100 ? (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Has superado el 100% de las requests incluidas. Se está aplicando tarifa por bloque de excedente.
                  </p>
                ) : percentage >= 80 ? (
                  <p className="text-xs text-amber-500 flex items-center gap-1 font-medium mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Has alcanzado el 80% del límite mensual. Considera actualizar tu plan.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Las requests se renuevan automáticamente al inicio de cada periodo mensual.
                  </p>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border/50 py-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Miembros en tu equipo:{" "}
              <strong className="text-foreground">
                {currentPlan?.maxCollaborators === null
                  ? `${1 + (user?.activeCollaboratorsCount ?? 0)} (Ilimitados)`
                  : currentPlan?.maxCollaborators === 1
                  ? "1 de 1 (Solo Owner)"
                  : `${1 + (user?.activeCollaboratorsCount ?? 0)} de ${currentPlan?.maxCollaborators} miembros`}
              </strong>
            </span>
            <span>Plan asignado: <strong className="text-foreground">{currentPlan?.name || "Developer"}</strong></span>
          </CardFooter>
        </Card>

        {/* 2. Sección de Método de Pago */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              Método de Pago
            </CardDescription>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              {currentPlan?.code === "ENTERPRISE" ? (
                <>
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Facturación Corporativa
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-primary" />
                  Tarjeta Vinculada
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Estado</span>
                {isUserLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : currentPlan?.code === "ENTERPRISE" ? (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-semibold gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Facturación Enterprise
                  </Badge>
                ) : hasPaymentMethod ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tarjeta Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs font-semibold gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Sin Tarjeta
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                {currentPlan?.code === "ENTERPRISE" ? (
                  <p>
                    Tu cuenta opera bajo contrato corporativo con facturación consolidada. Los pagos y condiciones se gestionan de forma directa con tu ejecutivo de cuenta.
                  </p>
                ) : hasPaymentMethod ? (
                  <p>
                    Tienes una tarjeta registrada en Stripe para abonar suscripciones y consumos por excedente.
                  </p>
                ) : (
                  <p className="text-amber-500/90 font-medium">
                    No tienes una tarjeta registrada. Registra una tarjeta para habilitar la creación de aplicaciones propias.
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            {currentPlan?.code === "ENTERPRISE" ? (
              <Button
                variant="outline"
                className="w-full text-xs font-medium"
                asChild
              >
                <a href="mailto:support@caerus.dev?subject=Consulta%20sobre%20Facturación%20Enterprise">
                  Contactar Ejecutivo de Cuenta
                </a>
              </Button>
            ) : (
              <>
                <Button
                  className="w-full font-medium"
                  onClick={() => setSetupModalOpen(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {hasPaymentMethod ? "Actualizar Tarjeta" : "Vincular Tarjeta ($0/mes)"}
                </Button>

                {hasPaymentMethod && (
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                    onClick={() => {
                      setDetachConflict(null);
                      setDetachDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Desvincular Tarjeta
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* 3. Tabla Paginada de Facturas */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Historial de Facturas
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Consulta y descarga los recibos de tus periodos mensuales.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchInvoices(invoicesPage)}
            disabled={isInvoicesLoading}
            className="text-xs text-muted-foreground gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isInvoicesLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </CardHeader>

        <CardContent>
          {isInvoicesLoading && !invoicesData ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !invoicesData || invoicesData.content.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-1">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-foreground">No hay facturas registradas aún</p>
              <p className="text-xs">Tus facturas mensuales y recibos se generarán al finalizar cada ciclo de facturación.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-semibold">Periodo</TableHead>
                    <TableHead className="text-xs font-semibold">N° Comprobante</TableHead>
                    <TableHead className="text-xs font-semibold">Monto</TableHead>
                    <TableHead className="text-xs font-semibold">Estado</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha de Emisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData.content.map((invoice: Invoice) => (
                    <TableRow key={invoice.id} className="border-border/60">
                      <TableCell className="text-xs font-medium capitalize">
                        {formatBillingPeriod(invoice.billingPeriod)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {invoice.stripeInvoiceId ? (
                          <span className="font-mono text-[11px] bg-muted/70 px-2 py-0.5 rounded border border-border/60 text-foreground font-medium">
                            {invoice.stripeInvoiceId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-xs">
                        {formatMoney(invoice.amount.amount, invoice.amount.currency)}
                      </TableCell>
                      <TableCell>
                        {getInvoiceStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Paginación */}
        {invoicesData && invoicesData.totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t border-border/50 py-3">
            <span className="text-xs text-muted-foreground">
              Página {invoicesData.page + 1} de {invoicesData.totalPages} ({invoicesData.totalElements} facturas)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoicesPage((prev) => Math.max(0, prev - 1))}
                disabled={invoicesPage === 0 || isInvoicesLoading}
                className="h-8 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoicesPage((prev) => prev + 1)}
                disabled={!invoicesData.hasNext || isInvoicesLoading}
                className="h-8 text-xs gap-1"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Modal Comparativo de Cambio de Plan */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Rocket className="h-5 w-5 text-primary" />
              Cambiar Plan de Suscripción
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Selecciona el plan que mejor se adapte a tus necesidades de concurrencia y tamaño de equipo.
            </DialogDescription>
          </DialogHeader>

          {planChangeError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No se pudo cambiar de plan</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {planChangeError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {isPlansLoading && plans.length === 0 ? (
              <>
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </>
            ) : (
              plans.map((p) => {
                const isEnterprise = p.code === "ENTERPRISE";
                const isCurrent = currentPlan?.code === p.code;
                const isChanging = changingPlanCode === p.code;

                return (
                  <Card
                    key={p.id || p.code}
                    className={`flex flex-col justify-between border-2 transition-all relative ${
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-0.5 px-3 rounded-full">
                        Plan Actual
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        {getPlanIcon(p.code)}
                        <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                      </div>
                      <div className="pt-2">
                        {isEnterprise ? (
                          <div>
                            <span className="text-2xl font-bold text-foreground">Personalizado</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Facturación offline / Contrato</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-3xl font-extrabold text-foreground">
                              {p.monthlyBasePrice.amount === 0
                                ? "$0"
                                : formatMoney(p.monthlyBasePrice.amount, p.monthlyBasePrice.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">/ mes</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs flex-1">
                      <div className="border-t border-border/60 pt-3 space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Requests incluidas:</span>
                          <strong className="text-foreground font-semibold">
                            {isEnterprise ? "A medida / Ilimitadas" : `${p.includedBillingUnits.toLocaleString()} reqs`}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Miembros del equipo:</span>
                          <strong className="text-foreground">
                            {isEnterprise || p.maxCollaborators === null
                              ? "Ilimitados"
                              : p.maxCollaborators === 1
                              ? "1 (Solo Owner)"
                              : `Hasta ${p.maxCollaborators} miembros`}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Excedente:</span>
                          <strong className="text-foreground text-[11px]">
                            {isEnterprise
                              ? "SLA Dedicado"
                              : p.overageBlockPrice.amount > 0
                              ? `${formatMoney(p.overageBlockPrice.amount)} / ${(p.overageBlockSize || 10000).toLocaleString()} reqs`
                              : "Incluido"}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 space-y-1.5 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Distributed Locks (DLS)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Shared Resource Semaphores</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Event Explorer & Webhooks</span>
                        </div>
                        {p.code !== "DEVELOPER" && (
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{isEnterprise ? "SLA 99.99% & Soporte 24/7" : "Soporte Prioritario"}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      {isEnterprise ? (
                        <Button
                          className="w-full font-semibold text-xs border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                          variant="outline"
                          onClick={() => {
                            window.open("mailto:enterprise@caerus.dev?subject=Consulta%20Plan%20Enterprise%20Caerus", "_blank");
                          }}
                        >
                          Contactar Ventas
                        </Button>
                      ) : (
                        <Button
                          className="w-full font-semibold text-xs"
                          variant={isCurrent ? "secondary" : "default"}
                          disabled={isCurrent || Boolean(changingPlanCode)}
                          onClick={() => handleSelectPlan(p.code)}
                        >
                          {isChanging ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Actualizando...
                            </span>
                          ) : isCurrent ? (
                            "Plan Actual"
                          ) : (
                            `Cambiar a ${p.name}`
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setPlanModalOpen(false);
                setPlanChangeError(null);
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmación de Cambio de Plan */}
      <AlertDialog open={confirmPlanModalOpen} onOpenChange={setConfirmPlanModalOpen}>
        <AlertDialogContent className="bg-card border-border sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
              {targetPlanToConfirm?.code === "STARTUP" ? (
                <>
                  <Rocket className="h-5 w-5 text-blue-500" />
                  ¿Mejorar al plan Startup?
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 text-amber-500" />
                  ¿Cambiar al plan Developer?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-xs text-muted-foreground space-y-2 mt-2">
                {targetPlanToConfirm?.code === "STARTUP" ? (
                  <>
                    <p>
                      Tu cuenta pasará a tener el plan <strong className="text-foreground font-semibold">Startup ($49.00 USD / mes)</strong>.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-foreground/85">
                      <li>5.000.000 requests mensuales incluidas.</li>
                      <li>Hasta 5 colaboradores en tus aplicaciones.</li>
                      <li>Tarifa reducida por bloque de excedente ($0.20 / 10.000u).</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p>
                      Tu cuenta pasará al plan gratuito <strong className="text-foreground font-semibold">Developer ($0 / mes)</strong>.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-foreground/85">
                      <li>50.000 requests mensuales incluidas.</li>
                      <li>Hasta 1 colaborador (el propietario).</li>
                    </ul>
                    <p className="text-amber-500 font-medium">
                      Aviso: Si tienes más de 1 colaborador activo en tus aplicaciones, deberás removerlos antes de descender de plan.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {planChangeError && (
            <Alert variant="destructive" className="my-2 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No se pudo cambiar el plan</AlertTitle>
              <AlertDescription className="mt-1">{planChangeError}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={Boolean(changingPlanCode)}
              onClick={() => {
                setConfirmPlanModalOpen(false);
                setPlanChangeError(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              disabled={Boolean(changingPlanCode)}
              onClick={() => {
                if (targetPlanToConfirm) {
                  executePlanChange(targetPlanToConfirm.code);
                }
              }}
              className="font-semibold text-xs gap-1.5"
            >
              {changingPlanCode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Confirmar Cambio"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Confirmación de Desvincular Tarjeta */}
      <AlertDialog open={detachDialogOpen} onOpenChange={setDetachDialogOpen}>
        <AlertDialogContent className="bg-card border-border sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ¿Desvincular método de pago?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Si no tienes aplicaciones activas, tu tarjeta se desvinculará y tu cuenta volverá al estado inicial sin método de pago.
                </p>
                <p className="text-xs text-amber-500">
                  Aviso: Si tienes aplicaciones en funcionamiento, el sistema requerirá que las elimines previamente para evitar interrupciones en el servicio.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {detachConflict && (
            <div className="space-y-2 my-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{detachConflict.message}</AlertTitle>
                <AlertDescription className="text-xs mt-1 space-y-1">
                  <p className="font-semibold text-foreground/90">Aplicaciones que debes eliminar primero:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {detachConflict.details.map((detail, idx) => (
                      <li key={idx} className="font-medium">{detail}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => router.push("/dashboard/applications")}
              >
                Ir a Mis Aplicaciones →
              </Button>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDetaching}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDetach}
              disabled={isDetaching}
              className="gap-1.5"
            >
              {isDetaching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Desvinculando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Confirmar Desvinculación
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Stripe Elements */}
      <SetupPaymentMethodModal
        open={setupModalOpen}
        onOpenChange={setSetupModalOpen}
        onSuccess={() => {
          refreshUser();
          fetchInvoices(0);
        }}
      />
    </div>
  );
}
