"use client";

import { useState } from "react";
import { Bell, AlertCircle, CheckCheck } from "lucide-react";
import { useMyNotifications, useMarkRead, useMarkAllRead } from "@/features/notification/notification.queries";
import { typeLabel, type InboxItem } from "@/features/notification/notification.types";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const PRIORITY_NOTE: Record<string, string> = { HIGH: "High priority", URGENT: "Urgent" };

function InboxRow({ item, onOpen }: { item: InboxItem; onOpen: (item: InboxItem) => void }) {
  const n = item.notificationId;
  if (!n) return null;
  const unread = item.readAt === null;
  const note = PRIORITY_NOTE[n.priority];

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-surface-alt)] ${unread ? "bg-[var(--color-primary-light)]/40" : ""}`}
      >
        {/* Unread is shown by the dot AND the bold title AND the sr-only text — never color alone. */}
        <span className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center" aria-hidden="true">
          {unread && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {unread && <span className="sr-only">Unread: </span>}
            <span className={`text-sm ${unread ? "font-semibold text-heading" : "font-medium text-heading"}`}>{n.title}</span>
            {note && (
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-pending-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-status-pending-text)]">
                {note}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-sm text-muted">{n.message}</span>
          <span className="mt-1 block text-xs text-muted">
            {typeLabel(n.type)} · {formatDateTime(n.createdAt)}
          </span>
        </span>
      </button>
    </li>
  );
}

export default function NotificationsInboxPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useMyNotifications({ page, limit: 20, unreadOnly });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };
  const unreadCount = data?.unreadCount ?? 0;

  const open = (item: InboxItem) => {
    if (item.readAt === null) markRead.mutate(item._id);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Notifications</h1>
          <p className="mt-1 text-sm text-muted">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}</p>
        </div>
        <Button variant="secondary" disabled={unreadCount === 0} isLoading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <div role="tablist" aria-label="Filter notifications" className="flex w-fit gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1">
        {[
          { label: "All", value: false },
          { label: "Unread", value: true },
        ].map((t) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={unreadOnly === t.value}
            onClick={() => {
              setUnreadOnly(t.value);
              setPage(1);
            }}
            className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors ${
              unreadOnly === t.value ? "bg-surface font-medium text-heading shadow-sm" : "text-muted hover:text-heading"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(markRead.isError || markAllRead.isError) && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(markRead.error || markAllRead.error, "We couldn't update that notification. Please try again.")}
        </p>
      )}

      <div className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load your notifications</p>
            <p className="text-sm text-muted">{messageFrom(error, "Something went wrong.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Bell className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">{unreadOnly ? "No unread notifications" : "No notifications yet"}</p>
            <p className="text-sm text-muted">{unreadOnly ? "Everything has been read." : "Announcements and alerts will appear here."}</p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <ul className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <InboxRow key={item._id} item={item} onOpen={open} />
              ))}
            </ul>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
