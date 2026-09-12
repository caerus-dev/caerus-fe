export type PlanCode = 'DEVELOPER' | 'STARTUP' | 'ENTERPRISE';

export interface PriceAmount {
  amount: number; // in cents or currency unit
  currency: string;
}

export interface BillingPlan {
  id: string;
  code: PlanCode;
  name: string;
  monthlyBasePrice: PriceAmount;
  includedBillingUnits: number;
  overageBlockSize: number;
  overageBlockPrice: PriceAmount;
  maxCollaborators: number | null;
}

export interface BillingUsage {
  period: string; // e.g. "2026-08"
  consumedUnits: number;
  includedUnits: number;
  percentage: number;
}

export interface UserResponse {
  id: string;
  auth0Sub: string;
  email: string;
  hasValidPaymentMethod: boolean;
  billingPlan: BillingPlan;
  billingUsage: BillingUsage;
  activeCollaboratorsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'PAID' | 'FAILED' | 'PENDING_PAYMENT';

export interface Invoice {
  id: string;
  billingPeriod: string;
  stripeInvoiceId: string;
  amount: PriceAmount;
  status: InvoiceStatus;
  createdAt: string;
}

export interface InvoicesResponse {
  content: Invoice[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  fieldErrors?: Array<{ field: string; message: string }>;
  details?: string[];
}
