export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export type NotificationType =
  | "GENERAL"
  | "ADMISSION"
  | "FEE_DUE"
  | "FEE_PAYMENT"
  | "EXAM_SCHEDULE"
  | "EXAM_RESULT"
  | "ATTENDANCE_ALERT"
  | "BOOK_DUE_REMINDER"
  | "TRANSPORT_UPDATE"
  | "HOSTEL_ALLOCATION"
  | "PASSWORD_RESET"
  | "ACCOUNT_VERIFICATION";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "GENERAL",
  "ADMISSION",
  "FEE_DUE",
  "FEE_PAYMENT",
  "EXAM_SCHEDULE",
  "EXAM_RESULT",
  "ATTENDANCE_ALERT",
  "BOOK_DUE_REMINDER",
  "TRANSPORT_UPDATE",
  "HOSTEL_ALLOCATION",
  "PASSWORD_RESET",
  "ACCOUNT_VERIFICATION",
];

/** "FEE_DUE" → "Fee due" — one readable label everywhere instead of raw enum text. */
export const typeLabel = (t: string): string => {
  const words = t.toLowerCase().split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";
export const NOTIFICATION_CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: "IN_APP", label: "In-app" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "PUSH", label: "Push" },
];

export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export const PRIORITIES: Priority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];

export type AudienceType = "STUDENTS" | "TEACHERS" | "STAFF" | "GUARDIANS" | "ADMINS" | "CUSTOM";
export const AUDIENCE_TYPES: { value: AudienceType; label: string }[] = [
  { value: "STUDENTS", label: "Students" },
  { value: "TEACHERS", label: "Teachers" },
  { value: "STAFF", label: "Staff" },
  { value: "GUARDIANS", label: "Guardians" },
  { value: "ADMINS", label: "Administrators" },
];

export interface Audience {
  type: AudienceType;
  classId?: string;
  sectionId?: string;
  userIds?: string[];
}

/* ---------- Templates ---------- */

export interface NotificationTemplate {
  _id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  defaultChannels: NotificationChannel[];
  status: "ACTIVE" | "INACTIVE";
}

export interface TemplatePayload {
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  defaultChannels: NotificationChannel[];
}
export type UpdateTemplatePayload = Partial<TemplatePayload> & { status?: "ACTIVE" | "INACTIVE" };

/* ---------- Notifications (manager view) ---------- */

export type NotificationStatus = "DRAFT" | "SENT";

export interface NotificationRecord {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  channels: NotificationChannel[];
  audience: Audience;
  recipientCount: number;
  status: NotificationStatus;
  isSystemGenerated: boolean;
  sentAt: string | null;
  createdAt: string;
}

export interface DeliveryBreakdownRow {
  channel: NotificationChannel;
  status: "PENDING" | "SENT" | "FAILED";
  count: number;
}

export interface NotificationDetail extends NotificationRecord {
  deliveryBreakdown: DeliveryBreakdownRow[];
  readCount: number;
}

export interface ComposePayload {
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  channels: NotificationChannel[];
  audience: Audience;
  saveAsDraft: boolean;
}

export interface SendFromTemplatePayload {
  audience: Audience;
  tokens?: Record<string, string | number>;
  priority?: Priority;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  search?: string;
}

/* ---------- My inbox (every user) ---------- */

export interface InboxItem {
  _id: string; // the delivery id — this is what "mark as read" targets
  notificationId: { _id: string; title: string; message: string; type: NotificationType; priority: Priority; createdAt: string } | null;
  readAt: string | null;
  createdAt: string;
}

export interface InboxResult extends PaginatedResult<InboxItem> {
  unreadCount: number;
}

/* ---------- Summary ---------- */

export interface NotificationSummary {
  sentTotal: number;
  sentToday: number;
  drafts: number;
  systemGenerated: number;
  totalDeliveries: number;
  failedDeliveries: number;
  byChannel: Record<string, { SENT: number; FAILED: number; PENDING: number }>;
}
