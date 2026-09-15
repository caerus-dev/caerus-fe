export interface LiveResourceResponse {
  resourceId: string;
  key: string;
  templateId: string;
  availableAmount: number;
  pendingCount: number;
  groupKey?: string | null;
  metadata?: string | null;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface LiveResourcesPageResponse {
  resources: LiveResourceResponse[];
  hasNextPage: boolean;
}

export interface LiveHolderResponse {
  holderId: string;
  resourceId: string;
  status: string; // "ACTIVE" | "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED"
  amount: number;
  expiresAt: number;
  metadata?: string | null;
  createdAtMs: number;
}

export interface LiveHoldersPageResponse {
  holders: LiveHolderResponse[];
  hasNextPage: boolean;
}

export interface UpdateLiveResourceRequest {
  deltaAmount: number;
  groupKey?: string | null;
  metadata?: string | null;
  idempotencyKey?: string | null;
}

export interface LiveLockHolderInfo {
  lockId: string;
  expiresAt: number;
  fencingToken: number;
}

export interface LiveLockStatusResponse {
  isHeld: boolean;
  currentMode: string;
  activeHolders: LiveLockHolderInfo[];
  pendingQueueSize: number;
}

export interface LiveTransactionLockInfo {
  namespace: string;
  lockKey: string;
  requestedMode: string;
  status: string;
}

export interface LiveTransactionStatusResponse {
  status: string; // "ACTIVE" | "COMMITTED" | "ABORTED" | "EXPIRED"
  abortReason?: string | null;
  locks: LiveTransactionLockInfo[];
  expiresAt: number;
}

export type RemoteProductType = "SRE" | "DLS";

export type SreMethodType =
  | "GET_RESOURCES_BY_GROUP"
  | "GET_RESOURCE"
  | "GET_RESOURCE_HOLDERS"
  | "GET_HOLDER"
  | "RELEASE_HOLDER"
  | "UPDATE_RESOURCE";

export type DlsMethodType =
  | "GET_LOCK_STATUS"
  | "GET_TRANSACTION_STATUS"
  | "ABORT_TRANSACTION";

export interface ManualControlPreselect {
  product: RemoteProductType;
  method: string;
  params: Record<string, any>;
  autoExecute?: boolean;
}
