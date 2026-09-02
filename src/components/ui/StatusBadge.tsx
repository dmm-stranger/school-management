const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]",
  PENDING: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)]",
  PENDING_VERIFICATION: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)]",
  INACTIVE: "bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)]",
  SUSPENDED: "bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)]",
  BLOCKED: "bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)]",
  GRADUATED: "bg-[var(--color-status-draft-bg)] text-[var(--color-status-draft-text)]",
  TRANSFERRED: "bg-[var(--color-status-draft-bg)] text-[var(--color-status-draft-text)]",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-[var(--color-surface-alt)] text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
