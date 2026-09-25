"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Zap,
  Rocket,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { triggerUserRefresh, useUser } from "@/hooks/use-user";
import { BillingPlan, PlanCode } from "@/types/billing";
import { DEFAULT_BILLING_PLANS } from "@/lib/billing-plans";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51MockKeyForStripeInitialization00000000000000000000000000000000000000000000000000000000",
  {
    developerTools: {
      assistant: {
        enabled: false,
      },
    },
  }
);

interface SetupFormProps {
  onSuccess: () => void;
  onBack: () => void;
  selectedPlan: BillingPlan | null;
}

function SetupCardForm({ onSuccess, onBack, selectedPlan }: SetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollStep, setPollStep] = useState<number | null>(null);

  const pollUserPaymentStatus = async (maxAttempts = 7, intervalMs = 1200) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setPollStep(attempt);
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        if (res.ok) {
          const user = await res.json();
          if (user.hasValidPaymentMethod) {
            triggerUserRefresh(user);
            return true;
          }
        }
      } catch (err) {
        console.warn(`Polling attempt ${attempt} failed:`, err);
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const returnUrl = typeof window !== "undefined"
        ? `${window.location.origin}/dashboard/billing?setup_success=true`
        : undefined;

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "No se pudo validar la tarjeta. Por favor revisa los datos ingresados.");
        setIsSubmitting(false);
        return;
      }

      if (setupIntent && (setupIntent.status === "succeeded" || setupIntent.status === "processing")) {
        // Si seleccionó un plan diferente (ej. STARTUP), llamamos a cambiar plan
        if (selectedPlan && selectedPlan.code !== "DEVELOPER") {
          try {
            const planRes = await fetch("/api/users/me/plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planCode: selectedPlan.code }),
            });
            if (planRes.ok) {
              const updated = await planRes.json().catch(() => null);
              if (updated) {
                triggerUserRefresh(updated);
              }
            }
          } catch (planErr) {
            console.error("Error setting chosen plan:", planErr);
          }
        }

        // Sondeo para dar tiempo a que el webhook de Stripe impacte en el backend
        await pollUserPaymentStatus(7, 1200);
        onSuccess();
      } else {
        setErrorMessage("El estado del método de pago no pudo ser confirmado.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Error confirming setup intent:", err);
      setErrorMessage(err.message || "Ocurrió un error inesperado al procesar la tarjeta.");
      setIsSubmitting(false);
    }
  };

  const isStartup = selectedPlan?.code === "STARTUP";
  const isFree = !isStartup;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Resumen del plan seleccionado */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-muted/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Plan seleccionado:</span>
            <span className="font-bold text-sm text-foreground">
              {isStartup ? "Startup" : "Developer"}
            </span>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              {isStartup ? "$49.00 / mes" : "$0 / mes"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {isStartup
              ? "Suscripción mensual de $49.00 USD. Incluye 5.000.000 requests/mes y hasta 5 colaboradores."
              : "No se te cobrará nada hoy ($0). La tarjeta valida tu cuenta como desarrollador y cubre consumos si superas 50.000 requests."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-xs h-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          Cambiar plan
        </Button>
      </div>

      {/* Stripe PaymentElement con billeteras externas y Link desactivados */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: {
              link: "never",
              applePay: "never",
              googlePay: "never",
            },
            fields: {
              billingDetails: {
                address: {
                  country: "auto",
                  postalCode: "auto",
                },
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="py-2.5 px-3 text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2.5 border border-border/50">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>
          Tus datos se transmiten directamente y de forma encriptada a Stripe. Caerus no almacena los números de tu tarjeta.
        </span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-1 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Planes
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="min-w-[180px] text-xs font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pollStep ? "Sincronizando activación..." : "Validando tarjeta..."}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              {isStartup ? "Guardar Tarjeta y Suscribir ($49/mes)" : "Guardar Tarjeta y Activar ($0)"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export interface SetupPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialStep?: "select-plan" | "payment";
  title?: string;
  description?: string;
}

export function SetupPaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
  initialStep = "select-plan",
  title = "Configurar Suscripción y Método de Pago",
  description = "Selecciona el plan para tu cuenta y vincula una tarjeta para habilitar la creación de aplicaciones.",
}: SetupPaymentMethodModalProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"select-plan" | "payment">(initialStep);

  // Plans state
  const [plans, setPlans] = useState<BillingPlan[]>(DEFAULT_BILLING_PLANS);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode>("DEVELOPER");

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch plans from GET /v1/billing/plans
  const fetchPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    try {
      const res = await fetch("/api/billing/plans");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlans(data);
          // Preseleccionar plan Developer o Startup (nunca Enterprise para Stripe)
          if (user?.billingPlan?.code && user.billingPlan.code !== "ENTERPRISE") {
            setSelectedPlanCode(user.billingPlan.code);
          } else {
            setSelectedPlanCode("DEVELOPER");
          }
        }
      }
    } catch (err) {
      console.error("Error loading plans in modal:", err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, [user]);

  // Fetch SetupIntent from POST /v1/billing/setup-intent
  const fetchSetupIntent = useCallback(async () => {
    setIsLoadingSecret(true);
    setInitError(null);
    try {
      const res = await fetch("/api/billing/setup-intent", {
        method: "POST",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || "No se pudo inicializar la pasarela de pago.");
      }

      const data = await res.json();
      if (!data.clientSecret) {
        throw new Error("No se recibió clientSecret de Stripe.");
      }
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Error creating SetupIntent:", err);
      setInitError(err.message || "Error al conectar con Stripe. Intenta nuevamente.");
    } finally {
      setIsLoadingSecret(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      fetchPlans();
      fetchSetupIntent();
    } else {
      setClientSecret(null);
      setInitError(null);
    }
  }, [open, initialStep, fetchPlans, fetchSetupIntent]);

  const handleSuccess = () => {
    toast.success("Método de pago vinculado exitosamente", {
      description: "Tu cuenta ha sido activada. Ya puedes crear aplicaciones y operar recursos.",
    });
    triggerUserRefresh();
    router.refresh();
    onSuccess?.();
    onOpenChange(false);
  };

  // Fallback seguro al modo oscuro para que Stripe Elements nunca se renderice con cajas blancas en tema oscuro
  const isDark = mounted ? resolvedTheme !== "light" : true;

  const appearance: Appearance = {
    theme: isDark ? "night" : "flat",
    variables: {
      colorPrimary: isDark ? "#ffffff" : "#18181b",
      colorBackground: isDark ? "#09090b" : "#ffffff",
      colorText: isDark ? "#f4f4f5" : "#09090b",
      colorTextSecondary: isDark ? "#a1a1aa" : "#71717a",
      colorDanger: "#ef4444",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      borderRadius: "8px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        backgroundColor: isDark ? "#09090b" : "#ffffff",
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        color: isDark ? "#f4f4f5" : "#09090b",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "11px 12px",
        fontSize: "13px",
      },
      ".Input:focus": {
        borderColor: isDark ? "#a855f7" : "#9333ea",
        boxShadow: "none",
      },
      ".Label": {
        color: isDark ? "#d4d4d8" : "#3f3f46",
        fontSize: "12px",
        fontWeight: "500",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      ".TermsText": {
        color: isDark ? "#a1a1aa" : "#71717a",
        fontSize: "11px",
        lineHeight: "1.5",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      ".Tab": {
        backgroundColor: isDark ? "#18181b" : "#f4f4f5",
        borderColor: isDark ? "#27272a" : "#e4e4e7",
        color: isDark ? "#a1a1aa" : "#71717a",
      },
      ".Tab--selected": {
        backgroundColor: isDark ? "#27272a" : "#ffffff",
        borderColor: isDark ? "#a855f7" : "#9333ea",
        color: isDark ? "#ffffff" : "#09090b",
      },
      ".Block": {
        backgroundColor: isDark ? "#09090b" : "#ffffff",
        borderColor: isDark ? "#27272a" : "#e4e4e7",
      },
    },
  };

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance,
  };

  const selectedPlan = plans.find((p) => p.code === selectedPlanCode) || plans[0] || null;

  const getPlanIcon = (code: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {step === "select-plan" ? (
                <>
                  <Rocket className="h-5 w-5 text-primary" />
                  Paso 1: Elige tu Plan de Suscripción
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paso 2: Registrar Método de Pago
                </>
              )}
            </DialogTitle>
            {/* Indicador de Pasos */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span
                onClick={() => setStep("select-plan")}
                className={`cursor-pointer px-2.5 py-1 rounded-md transition-colors ${
                  step === "select-plan"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Planes
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                onClick={() => {
                  if (clientSecret && selectedPlanCode !== "ENTERPRISE") setStep("payment");
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  step === "payment"
                    ? "bg-primary text-primary-foreground font-bold"
                    : selectedPlanCode !== "ENTERPRISE"
                    ? "text-muted-foreground cursor-pointer hover:text-foreground"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                2. Tarjeta
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === "select-plan"
              ? "Revisa los planes disponibles y selecciona el adecuado para tu equipo antes de ingresar la tarjeta."
              : "Ingresa tu tarjeta de crédito o débito para activar tu cuenta en el plan seleccionado."}
          </DialogDescription>
        </DialogHeader>

        {/* PASO 1: SELECCIÓN DE PLAN */}
        {step === "select-plan" && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {isLoadingPlans && plans.length === 0 ? (
                <>
                  <div className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
                  <div className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
                  <div className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
                </>
              ) : (
                plans.map((p) => {
                  const isEnterprise = p.code === "ENTERPRISE";
                  const isSelected = selectedPlanCode === p.code && !isEnterprise;
                  const isFree = p.monthlyBasePrice.amount === 0;

                  return (
                    <div
                      key={p.id || p.code}
                      onClick={() => {
                        if (!isEnterprise) {
                          setSelectedPlanCode(p.code);
                        }
                      }}
                      className={`rounded-xl border-2 p-4 transition-all flex flex-col justify-between relative ${
                        isEnterprise
                          ? "border-border/70 hover:border-purple-500/50 bg-card/60"
                          : isSelected
                          ? "cursor-pointer border-primary bg-primary/5 shadow-sm"
                          : "cursor-pointer border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      {p.code === "DEVELOPER" && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full">
                          Comienza Gratis
                        </span>
                      )}
                      {p.code === "STARTUP" && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full">
                          Más Popular
                        </span>
                      )}
                      {isEnterprise && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full">
                          A Medida
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPlanIcon(p.code)}
                            <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                          </div>
                          {!isEnterprise && (
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          )}
                        </div>

                        <div>
                          {isEnterprise ? (
                            <div>
                              <span className="text-xl font-bold text-foreground">
                                Personalizado
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Contrato y facturación offline</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-2xl font-black text-foreground">
                                {isFree ? "$0" : `$${(p.monthlyBasePrice.amount / 100).toFixed(2)}`}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">/ mes</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/50 pt-2.5">
                          <p className="flex items-center justify-between">
                            <span>Requests:</span>
                            <strong className="text-foreground font-semibold">
                              {isEnterprise ? "Personalizadas" : p.includedBillingUnits.toLocaleString()}
                            </strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Colaboradores:</span>
                            <strong className="text-foreground">
                              {isEnterprise || p.maxCollaborators === null ? "Ilimitados" : `Hasta ${p.maxCollaborators}`}
                            </strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Excedente:</span>
                            <span className="text-[11px] text-foreground">
                              {isEnterprise
                                ? "SLA 99.99% Dedicado"
                                : p.overageBlockPrice.amount > 0
                                ? `$${(p.overageBlockPrice.amount / 100).toFixed(2)} / ${p.overageBlockSize.toLocaleString()}u`
                                : "Incluido"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-border/40">
                        {isEnterprise ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-semibold h-8 border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                "mailto:enterprise@caerus.dev?subject=Consulta%20Plan%20Enterprise%20Caerus&body=Hola%20equipo%20de%20Caerus%2C%0A%0AQuisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20plan%20Enterprise%20para%20nuestra%20organizaci%C3%B3n.%0A%0AOrganizaci%C3%B3n%3A%20%0AVolumen%20estimado%20de%20requests%2Fmes%3A%20%0A%0AGracias.",
                                "_blank"
                              );
                            }}
                          >
                            Contactar Ventas
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="w-full text-xs font-semibold h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanCode(p.code);
                            }}
                          >
                            {isSelected ? "Elegido" : "Elegir"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Banner aclaratorio sobre la tarjeta */}
            <div className="rounded-lg bg-muted/40 border border-border/60 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  ¿Por qué se requiere tarjeta incluso para el plan Developer ($0/mes)?
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Caerus opera bajo un modelo de facturación basado en uso (Usage-Based). El plan Developer incluye 50.000 requests gratuitas cada mes. La tarjeta valida tu cuenta como desarrollador y solo se utilizará si superas este límite mensual.
                </p>
              </div>
            </div>

            {/* Botón de Continuar a Tarjeta */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => setStep("payment")}
                className="gap-2 font-semibold"
              >
                Continuar con {selectedPlanCode === "STARTUP" ? "Startup ($49/mes)" : "Developer ($0/mes)"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2: FORMULARIO DE PAGO (STRIPE ELEMENTS) */}
        {step === "payment" && (
          <div>
            {isLoadingSecret ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">
                  Iniciando conexión segura con Stripe...
                </p>
              </div>
            ) : initError ? (
              <div className="space-y-4 py-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription className="text-xs">{initError}</AlertDescription>
                </Alert>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep("select-plan")}>
                    ← Volver a Planes
                  </Button>
                  <Button onClick={fetchSetupIntent}>
                    Reintentar Conexión
                  </Button>
                </div>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                <SetupCardForm
                  selectedPlan={selectedPlan}
                  onSuccess={handleSuccess}
                  onBack={() => setStep("select-plan")}
                />
              </Elements>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
