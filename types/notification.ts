export type NotificationType =
  | "BILLING_THRESHOLD_WARNING"
  | "COLLABORATOR_INVITATION";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface NotificationMetadata {
  percentage?: number;
  actionUrl?: string;
  token?: string;
  applicationName?: string;
  consumedUnits?: number;
  includedUnits?: number;
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  read: boolean;
  readAt: string | null;
  metadata: NotificationMetadata;
  createdAt: string;
}

export interface NotificationsPagedResponse {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
