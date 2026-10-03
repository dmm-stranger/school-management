"use client";

import { useState, FormEvent } from "react";
import { AlertCircle, Coins, Search, CheckCircle2 } from "lucide-react";
import { useFines, usePayFine, useWaiveFine } from "@/features/library/library.queries";
import type { LibraryFine, FineStatus, PaymentMethod } from "@/features/library/library.types";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_BANKING", label: "Mobile Banking" },
  { value: "CARD", label: "Card" },
  { value: "ONLINE_PAYMENT", label: "Online Payment" },
  { value: "CHEQUE", label: "Cheque" },
];

function PayModal({ fine, onClose }: { fine: LibraryFine | null; onClose: () => void }) {
  const payFine = usePayFine();
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  if (!fine) return null;
  const close = () => {
    payFine.reset();
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await payFine.mutateAsync({ id: fine._id, paymentMethod: method });
      close();
    } catch {
      // shown below
    }
  };

  return (
    <Modal open title="Collect fine payment" onClose={close}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="text-sm">
          <p className="font-medium text-heading">{fine.borrowerName}</p>
          <p className="text-muted">
            {fine.bookTitle} · {fine.reason.toLowerCase()}
            {fine.daysOverdue > 0 ? ` · ${fine.daysOverdue} day(s) late` : ""}
          </p>
          <p className="mt-1 text-lg font-semibold text-heading">{formatMoney(fine.amount)}</p>
        </div>
        <Select
          label="Payment method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          options={PAYMENT_METHODS}
        />
        {payFine.isError && (
          <p role="alert" className="text-sm text-danger">
            {messageFrom(payFine.error, "We couldn't record this payment. Please try again.")}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" isLoading={payFine.isPending}>
            Record Payment &amp; Print Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function WaiveModal({ fine, onClose }: { fine: LibraryFine | null; onClose: () => void }) {
  const waiveFine = useWaiveFine();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  if (!fine) return null;
  const close = () => {
    setReason("");
    setTouched(false);
    waiveFine.reset();
    onClose();
  };
  const error = touched && reason.trim().length < 3 ? "Give a reason for waiving this fine (at least 3 characters)." : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (reason.trim().length < 3) return;
    try {
      await waiveFine.mutateAsync({ id: fine._id, reason: reason.trim() });
      close();
    } catch {
      // shown below
    }
  };

  return (
    <Modal open title="Waive fine" onClose={close}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="text-sm">
          <p className="font-medium text-heading">{fine.borrowerName}</p>
          <p className="text-muted">
            {fine.bookTitle} · {formatMoney(fine.amount)}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="waive-reason" className="text-sm font-medium text-heading">
            Reason<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </label>
          <textarea
            id="waive-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={!!error}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
        </div>
        {waiveFine.isError && (
          <p role="alert" className="text-sm text-danger">
            {messageFrom(waiveFine.error, "We couldn't waive this fine. Please try again.")}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={waiveFine.isPending}>
            Waive Fine
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function FinesPage() {
  const { can } = usePermission();
  const isManager = can("library:create");
  const canWaive = can("library:approve");

  const [status, setStatus] = useState<FineStatus | "">("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [paying, setPaying] = useState<LibraryFine | null>(null);
  const [waiving, setWaiving] = useState<LibraryFine | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch, isFetching } = useFines({
    page,
    limit: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const fines = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Library Fines</h1>
          <p className="mt-1 text-sm text-muted">{isManager ? "Overdue, damage and lost-book charges." : "Your library charges."}</p>
        </div>
        {isManager && data && (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-4 py-2.5 text-right">
            <p className="text-xs uppercase tracking-wide text-muted">Pending total</p>
            <p className="flex items-center justify-end gap-1.5 text-lg font-semibold text-heading">
              <Coins className="h-4 w-4 text-[var(--color-chart-library)]" />
              {formatMoney(data.pendingTotal)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {isManager && (
          <div className="relative min-w-[220px] flex-1">
            <label htmlFor="fine-search" className="sr-only">
              Search fines
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="fine-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by borrower or book…"
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>
        )}
        <div className="w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as FineStatus | "");
              setPage(1);
            }}
            options={[
              { value: "", label: "All statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "PAID", label: "Paid" },
              { value: "WAIVED", label: "Waived" },
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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load fines</p>
            <p className="text-sm text-muted">{messageFrom(error, "Something went wrong.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && fines.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">{status === "PENDING" ? "No pending fines" : "No fines found"}</p>
            <p className="text-sm text-muted">{status === "PENDING" ? "Everything is settled." : "Try a different filter."}</p>
          </div>
        )}

        {!isLoading && !isError && fines.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    {isManager && <th className="px-4 py-3">Borrower</th>}
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    {isManager && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {fines.map((f) => (
                    <tr key={f._id} className="hover:bg-[var(--color-surface-alt)]">
                      {isManager && <td className="px-4 py-3 text-heading">{f.borrowerName}</td>}
                      <td className="px-4 py-3 text-heading">{f.bookTitle}</td>
                      <td className="px-4 py-3 text-muted">
                        {f.reason.charAt(0) + f.reason.slice(1).toLowerCase()}
                        {f.daysOverdue > 0 ? ` (${f.daysOverdue}d)` : ""}
                      </td>
                      <td className="px-4 py-3 font-medium text-heading">{formatMoney(f.amount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {f.status === "PENDING" ? formatDate(f.createdAt) : formatDate(f.paidAt)}
                      </td>
                      {isManager && (
                        <td className="px-4 py-3 text-right">
                          {f.status === "PENDING" && (
                            <div className="flex justify-end gap-2">
                              {canWaive && (
                                <Button variant="secondary" onClick={() => setWaiving(f)}>
                                  Waive
                                </Button>
                              )}
                              <Button onClick={() => setPaying(f)}>Collect</Button>
                            </div>
                          )}
                          {f.status === "PAID" && f.receiptNumber && <span className="text-xs text-muted">Receipt {f.receiptNumber}</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <PayModal fine={paying} onClose={() => setPaying(null)} />
      <WaiveModal fine={waiving} onClose={() => setWaiving(null)} />
    </div>
  );
}
