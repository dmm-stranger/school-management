"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Bell, Send, Search, Plus, BellRing, FileText, MailWarning } from "lucide-react";
import {
  useNotificationLog,
  useNotificationDetail,
  useNotificationSummary,
  useSendDraft,
} from "@/features/notification/notification.queries";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  typeLabel,
  type NotificationRecord,
  type NotificationStatus,
  type NotificationType,
} from "@/features/notification/notification.types";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const channelLabel = (c: string) => NOTIFICATION_CHANNELS.find((x) => x.value === c)?.label ?? c;

function KpiStrip() {
  const { data, isLoading } = useNotificationSummary();
  const cards = [
    { label: "Sent today", value: data?.sentToday, icon: BellRing },
    { label: "Total sent", value: data?.sentTotal, icon: Bell },
    { label: "Drafts", value: data?.drafts, icon: FileText },
    { label: "Failed deliveries", value: data?.failedDeliveries, icon: MailWarning },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
          <div className="flex items-center justify-between text-sm text-muted">
            {label}
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-heading">
            {isLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-[var(--color-surface-alt)]" /> : (value ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailModal({ id, canSend, onClose }: { id: string | null; canSend: boolean; onClose: () => void }) {
  const { data, isLoading, isError, error } = useNotificationDetail(id ?? "");
  const sendDraft = useSendDraft();
  if (!id) return null;

  const close = () => {
    sendDraft.reset();
    onClose();
  };

  const handleSend = async () => {
    try {
      await sendDraft.mutateAsync(id);
      close();
    } catch {
      // shown below via sendDraft.error
    }
  };

  // Group the per-(channel,status) rows into one line per channel: "Email: 12 sent, 1 failed".
  const byChannel = new Map<string, { SENT: number; FAILED: number; PENDING: number }>();
  for (const row of data?.deliveryBreakdown ?? []) {
    const cur = byChannel.get(row.channel) ?? { SENT: 0, FAILED: 0, PENDING: 0 };
    cur[row.status] += row.count;
    byChannel.set(row.channel, cur);
  }

  return (
    <Modal open title="Notification details" onClose={close}>
      {isLoading && <div className="h-32 animate-pulse rounded bg-[var(--color-surface-alt)]" />}
      {isError && <p className="text-sm text-danger">{messageFrom(error, "Couldn't load this notification.")}</p>}
      {data && (
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-heading">{data.title}</p>
              <StatusBadge status={data.status} />
              {data.isSystemGenerated && <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-alt)] px-2 py-0.5 text-xs text-muted">Automatic</span>}
            </div>
            <p className="mt-1 text-muted">{data.message}</p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">Type</dt>
            <dd className="text-heading">{typeLabel(data.type)}</dd>
            <dt className="text-muted">Priority</dt>
            <dd className="text-heading">{data.priority.charAt(0) + data.priority.slice(1).toLowerCase()}</dd>
            <dt className="text-muted">Audience</dt>
            <dd className="text-heading">{data.audience.type.charAt(0) + data.audience.type.slice(1).toLowerCase()}</dd>
            <dt className="text-muted">Recipients</dt>
            <dd className="text-heading">{data.recipientCount}</dd>
            <dt className="text-muted">{data.status === "SENT" ? "Sent" : "Created"}</dt>
            <dd className="text-heading">{formatDateTime(data.sentAt ?? data.createdAt)}</dd>
          </dl>

          {data.status === "SENT" && (
            <div>
              <p className="mb-1 font-medium text-heading">Delivery</p>
              <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-control)] border border-[var(--color-border)]">
                {[...byChannel.entries()].map(([channel, c]) => (
                  <li key={channel} className="flex items-center justify-between px-3 py-2">
                    <span className="text-heading">{channelLabel(channel)}</span>
                    <span className="text-muted">
                      {c.SENT} sent{c.FAILED > 0 ? `, ${c.FAILED} failed` : ""}
                      {c.PENDING > 0 ? `, ${c.PENDING} pending` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-muted">
                Read in-app by {data.readCount} of {data.recipientCount}.
              </p>
            </div>
          )}

          {sendDraft.isError && (
            <p role="alert" className="text-danger">
              {messageFrom(sendDraft.error, "We couldn't send this draft.")}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
            {data.status === "DRAFT" && canSend && (
              <Button isLoading={sendDraft.isPending} onClick={handleSend}>
                <Send className="h-4 w-4" /> Send now
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function NotificationLogPage() {
  const { can } = usePermission();
  const canSend = can("notification:create");

  const [type, setType] = useState<NotificationType | "">("");
  const [status, setStatus] = useState<NotificationStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch, isFetching } = useNotificationLog({
    page,
    limit: 20,
    type: type || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const rows: NotificationRecord[] = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  if (!can("notification:list")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <Bell className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">The notification log is for administrators.</p>
        <Link href="/notifications">
          <Button>Go to my notifications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Notification Log</h1>
          <p className="mt-1 text-sm text-muted">Everything sent or drafted, including automatic notifications.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications/templates">
            <Button variant="ghost">Templates</Button>
          </Link>
          {canSend && (
            <Link href="/notifications/compose">
              <Button>
                <Plus className="h-4 w-4" /> Send Notification
              </Button>
            </Link>
          )}
        </div>
      </div>

      <KpiStrip />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor="log-search" className="sr-only">
            Search notifications
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="log-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>
        <div className="w-48">
          <Select
            label="Type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as NotificationType | "");
              setPage(1);
            }}
            options={[{ value: "", label: "All types" }, ...NOTIFICATION_TYPES.map((t) => ({ value: t, label: typeLabel(t) }))]}
          />
        </div>
        <div className="w-40">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as NotificationStatus | "");
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              { value: "SENT", label: "Sent" },
              { value: "DRAFT", label: "Draft" },
            ]}
          />
        </div>
      </div>

      <div className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load the notification log.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Bell className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">{debouncedSearch || type || status ? "Nothing matches these filters" : "No notifications yet"}</p>
          </div>
        )}
        {!isLoading && !isError && rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Channels</th>
                    <th className="px-4 py-3">Recipients</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {rows.map((n) => (
                    <tr key={n._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setOpenId(n._id)} className="text-left font-medium text-heading hover:text-primary">
                          {n.title}
                        </button>
                        {n.isSystemGenerated && <span className="ml-2 text-xs text-muted">Automatic</span>}
                      </td>
                      <td className="px-4 py-3 text-muted">{typeLabel(n.type)}</td>
                      <td className="px-4 py-3 text-muted">{n.channels.map(channelLabel).join(", ")}</td>
                      <td className="px-4 py-3 text-muted">{n.recipientCount}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={n.status} />
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDateTime(n.sentAt ?? n.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <DetailModal id={openId} canSend={canSend} onClose={() => setOpenId(null)} />
    </div>
  );
}
