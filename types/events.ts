export type EventSource = "SDK" | "DASHBOARD" | "SYSTEM";

export interface EventResponse {
  id: string;
  eventId: string;
  environmentId: string;
  apiKeyId?: string | null;
  apiKeyPrefix?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  source: EventSource;
  isBillable: boolean;
  billingUnits: number;
  product: string;
  eventType: string;
  objectType?: string | null;
  objectId?: string | null;
  payload: any;
  occurredAt: string;
  receivedAt: string;
}

export interface EventTypeCatalogItem {
  eventType: string;
  product: string;
  category: string;
  description: string;
}

export interface CursorPagedEventsResponse {
  content: EventResponse[];
  hasNext: boolean;
  nextCursor: string | null;
}

export interface EventsFilterState {
  product?: string;
  eventType?: string;
  objectType?: string;
  objectId?: string;
  from?: string;
  to?: string;
}

export interface DeadlockPayload {
  victimTransactionId?: string;
  cycleTransactionIds?: string[];
  resolutionStrategy?: string;
  reason?: string;
  [key: string]: any;
}
