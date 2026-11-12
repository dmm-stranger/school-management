import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { notificationApi } from "./notification.api";
import type {
  TemplatePayload,
  UpdateTemplatePayload,
  ComposePayload,
  SendFromTemplatePayload,
  ListNotificationsParams,
} from "./notification.types";

/** Sending, reading and template edits all change what the inbox/log/badge show — refresh the whole group. */
const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.root() });
};

/* ---------- templates ---------- */
export const useTemplates = (params: { search?: string; type?: string; status?: string } = {}, options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.notifications.templates(params),
    queryFn: () => notificationApi.listTemplates(params),
    enabled: options.enabled,
  });

export const useCreateTemplate = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: (payload: TemplatePayload) => notificationApi.createTemplate(payload), onSuccess: invalidate });
};

export const useUpdateTemplate = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) => notificationApi.updateTemplate(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteTemplate = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: (id: string) => notificationApi.deleteTemplate(id), onSuccess: invalidate });
};

export const useSendFromTemplate = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SendFromTemplatePayload }) => notificationApi.sendFromTemplate(id, payload),
    onSuccess: invalidate,
  });
};

/* ---------- manager: compose / log ---------- */
export const useCompose = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: (payload: ComposePayload) => notificationApi.compose(payload), onSuccess: invalidate });
};

export const useNotificationLog = (params: ListNotificationsParams = {}) =>
  useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useNotificationDetail = (id: string) =>
  useQuery({ queryKey: queryKeys.notifications.detail(id), queryFn: () => notificationApi.get(id), enabled: !!id });

export const useSendDraft = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: (id: string) => notificationApi.sendDraft(id), onSuccess: invalidate });
};

/* ---------- my inbox ---------- */
export const useMyNotifications = (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.notifications.mine(params),
    queryFn: () => notificationApi.listMine(params),
    placeholderData: keepPreviousData,
  });

/**
 * Header bell badge. Asks for a single row (we only want the count) and polls once a minute —
 * the app has no websocket layer, so polling is the honest "good enough" for a school inbox.
 */
export const useUnreadCount = () =>
  useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => notificationApi.listMine({ page: 1, limit: 1 }),
    select: (result) => result.unreadCount,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    // The badge is decoration: if the call fails (e.g. a role not re-seeded yet) show no badge
    // rather than hammering the API with retries every minute.
    retry: false,
  });

export const useMarkRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: (deliveryId: string) => notificationApi.markRead(deliveryId), onSuccess: invalidate });
};

export const useMarkAllRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: () => notificationApi.markAllRead(), onSuccess: invalidate });
};

/* ---------- summary ---------- */
export const useNotificationSummary = (enabled = true) =>
  useQuery({ queryKey: queryKeys.notifications.summary(), queryFn: notificationApi.getSummary, enabled });
