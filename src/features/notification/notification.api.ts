import { apiClient } from "@/lib/api-client";
import type {
  PaginatedResult,
  NotificationTemplate,
  TemplatePayload,
  UpdateTemplatePayload,
  NotificationRecord,
  NotificationDetail,
  ComposePayload,
  SendFromTemplatePayload,
  ListNotificationsParams,
  InboxResult,
  InboxItem,
  NotificationSummary,
} from "./notification.types";

const toQuery = (params: object = {}): string => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const notificationApi = {
  /* templates */
  listTemplates: (params: { search?: string; type?: string; status?: string; limit?: number } = {}) =>
    apiClient.get<PaginatedResult<NotificationTemplate>>(`/notification-templates${toQuery({ limit: 100, ...params })}`),
  createTemplate: (payload: TemplatePayload) => apiClient.post<NotificationTemplate>("/notification-templates", payload),
  updateTemplate: (id: string, payload: UpdateTemplatePayload) => apiClient.patch<NotificationTemplate>(`/notification-templates/${id}`, payload),
  deleteTemplate: (id: string) => apiClient.delete<null>(`/notification-templates/${id}`),
  sendFromTemplate: (id: string, payload: SendFromTemplatePayload) =>
    apiClient.post<NotificationRecord>(`/notification-templates/${id}/send`, payload),

  /* manager: compose / log */
  compose: (payload: ComposePayload) => apiClient.post<NotificationRecord>("/notifications", payload),
  list: (params: ListNotificationsParams = {}) => apiClient.get<PaginatedResult<NotificationRecord>>(`/notifications${toQuery(params)}`),
  get: (id: string) => apiClient.get<NotificationDetail>(`/notifications/${id}`),
  sendDraft: (id: string) => apiClient.post<NotificationRecord>(`/notifications/${id}/send`),

  /* my inbox */
  listMine: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    apiClient.get<InboxResult>(`/notifications/my${toQuery(params)}`),
  markRead: (deliveryId: string) => apiClient.post<InboxItem>(`/notifications/deliveries/${deliveryId}/read`),
  markAllRead: () => apiClient.post<{ updated: number }>("/notifications/my/read-all"),

  /* summary */
  getSummary: () => apiClient.get<NotificationSummary>("/notification-summary"),
};
