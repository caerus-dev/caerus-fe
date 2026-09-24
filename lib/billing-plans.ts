import { BillingPlan, PlanCode } from "@/types/billing";

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    code: "DEVELOPER",
    name: "Developer",
    monthlyBasePrice: { amount: 0, currency: "USD" },
    includedBillingUnits: 50000,
    overageBlockSize: 10000,
    overageBlockPrice: { amount: 50, currency: "USD" },
    maxCollaborators: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    code: "STARTUP",
    name: "Startup",
    monthlyBasePrice: { amount: 4900, currency: "USD" },
    includedBillingUnits: 5000000,
    overageBlockSize: 10000,
    overageBlockPrice: { amount: 20, currency: "USD" },
    maxCollaborators: 5,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    code: "ENTERPRISE",
    name: "Enterprise",
    monthlyBasePrice: { amount: 0, currency: "USD" },
    includedBillingUnits: 100000000,
    overageBlockSize: 10000,
    overageBlockPrice: { amount: 0, currency: "USD" },
    maxCollaborators: null,
  },
];

export interface PlanFeatureMeta {
  badge: string;
  description: string;
  highlight: boolean;
  ctaText: string;
  ctaHref: string;
  isExternalLink?: boolean;
  features: string[];
}

export const PLAN_MARKETING_METADATA: Record<PlanCode, (plan: BillingPlan) => PlanFeatureMeta> = {
  DEVELOPER: (plan) => ({
    badge: "Para siempre gratis",
    description: "Ideal para desarrolladores individuales, prototipos y proyectos en etapa inicial.",
    highlight: false,
    ctaText: "Comenzar Gratis",
    ctaHref: "/auth/login?screen_hint=signup&returnTo=/dashboard",
    features: [
      `${plan.includedBillingUnits.toLocaleString("es-AR")} llamadas a la API mensuales`,
      "1 colaborador (Solo Owner)",
      `Excedente: $${(plan.overageBlockPrice.amount / 100).toFixed(2)} USD cada ${plan.overageBlockSize.toLocaleString("es-AR")} llamadas`,
      "SRE: Retenciones temporales y confirmación",
      "DLS: Bloqueos distribuidos con fencing tokens",
      "Soporte comunitario y documentación",
    ],
  }),
  STARTUP: (plan) => ({
    badge: "Más Popular",
    description: "Diseñado para startups y aplicaciones en producción con tráfico concurrente real.",
    highlight: true,
    ctaText: "Elegir Plan Startup",
    ctaHref: "/auth/login?screen_hint=signup&returnTo=/dashboard",
    features: [
      `${plan.includedBillingUnits.toLocaleString("es-AR")} llamadas a la API mensuales`,
      `Hasta ${plan.maxCollaborators} colaboradores de equipo`,
      `Excedente optimizado: $${(plan.overageBlockPrice.amount / 100).toFixed(2)} USD cada ${plan.overageBlockSize.toLocaleString("es-AR")} llamadas`,
      "Métricas avanzadas y logs de eventos en vivo",
      "Webhooks para alertas de expiración y deadlocks",
      "Soporte prioritario por email con respuesta en < 24hs",
      "Todo lo incluido en el plan Developer",
    ],
  }),
  ENTERPRISE: () => ({
    badge: "A Medida",
    description: "Para empresas y plataformas de misión crítica con grandes volúmenes de transacciones.",
    highlight: false,
    ctaText: "Contactar Ventas",
    ctaHref:
      "mailto:enterprise@caerus.dev?subject=Consulta%20Plan%20Enterprise%20Caerus&body=Hola%20equipo%20de%20Caerus%2C%0A%0AQuisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20plan%20Enterprise%20para%20nuestra%20organizaci%C3%B3n.%0A%0AOrganizaci%C3%B3n%3A%20%0AVolumen%20estimado%20de%20requests%2Fmes%3A%20%0A%0AGracias.",
    isExternalLink: true,
    features: [
      "Volumen de llamadas personalizable a medida",
      "Colaboradores y miembros de equipo ilimitados",
      "Detección y resolución automática de deadlocks en tiempo real",
      "SLA de disponibilidad garantizado del 99.99%",
      "Soporte técnico 24/7 y canal directo dedicado",
      "Todo lo incluido en el plan Startup",
    ],
  }),
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function getPublicBillingPlans(): Promise<BillingPlan[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/v1/billing/plans`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const order: Record<string, number> = { DEVELOPER: 1, STARTUP: 2, ENTERPRISE: 3 };
        return [...data].sort((a, b) => (order[a.code] || 99) - (order[b.code] || 99));
      }
    }
  } catch (err) {
    // Silently fallback if backend is unavailable
  }
  return DEFAULT_BILLING_PLANS;
}
