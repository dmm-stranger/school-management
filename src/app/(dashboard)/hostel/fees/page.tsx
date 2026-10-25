"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Coins, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { useHostelFees, usePayHostelFee, useAdjustHostelFee } from "@/features/hostel/hostel.queries";
import type { HostelFee, HostelFeeStatus, PaymentMethod, HostelFeeStudentRef } from "@/features/hostel/hostel.types";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const studentName = (ref: HostelFeeStudentRef | string) => (typeof ref === "string" ? ref : ref.personalInfo.fullName);

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_BANKING", label: "Mobile Banking" },
  { value: "CARD", label: "Card" },
  { value: "ONLINE_PAYMENT", label: "Online Payment" },
  { value: "CHEQUE", label: "Cheque" },
];

function PayModal({ fee, onClose }: { fee: HostelFee | null; onClose: () => void }) {
  const payFee = usePayHostelFee();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [error, setError] = useState<string | null>(null);

  if (!fee) return null;
  const close = () => {
    setAmount("");
    setError(null);
    payFee.reset();
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a payment amount greater than 0.");
      return;
    }
    if (value > fee.dueAmount) {
      setError(`Payment can't exceed the amount due (${formatMoney(fee.dueAmount)}).`);
      return;
    }
    try {
      await payFee.mutateAsync({ id: fee._id, amount: value, paymentMethod: method });
      close();
    } catch {
      // shown below via payFee.error
    }
  };

  return (
    <Modal open title="Collect hostel fee" onClose={close}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="text-sm">
          <p className="font-medium text-heading">{studentName(fee.studentId)}</p>
          <p className="text-muted">
            Due {formatMoney(fee.dueAmount)} of {formatMoney(fee.amount)}
            {fee.discount > 0 ? ` (${formatMoney(fee.discount)} discount applied)` : ""}
            {fee.fine > 0 ? ` (${formatMoney(fee.fine)} fine added)` : ""}
          </p>
        </div>
        <Input
          label="Amount to collect"
          type="number"
          min={0.01}
          max={fee.dueAmount}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
          hint={`Full amount due: ${formatMoney(fee.dueAmount)}`}
        />
        <Button type="button" variant="ghost" className="-mt-2 w-fit" onClick={() => setAmount(String(fee.dueAmount))}>
          Pay full amount due
        </Button>
        <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} options={PAYMENT_METHODS} />
        {payFee.isError && (
          <p role="alert" className="text-sm text-danger">
            {messageFrom(payFee.error, "We couldn't record this payment. Please try again.")}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" isLoading={payFee.isPending}>
            Record Payment &amp; Print Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AdjustModal({ fee, onClose }: { fee: HostelFee | null; onClose: () => void }) {
  const adjustFee = useAdjustHostelFee();
  const [discount, setDiscount] = useState("");
  const [fine, setFine] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!fee) return null;
  const close = () => {
    setDiscount("");
    setFine("");
    setReason("");
    setError(null);
    adjustFee.reset();
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError("Give a reason for this adjustment (at least 3 characters).");
      return;
    }
    if (discount === "" && fine === "") {
      setError("Enter a discount or fine to adjust.");
      return;
    }
    try {
      await adjustFee.mutateAsync({
        id: fee._id,
        payload: { discount: discount === "" ? undefined : Number(discount), fine: fine === "" ? undefined : Number(fine), reason: reason.trim() },
      });
      close();
    } catch {
      // shown below
    }
  };

  return (
    <Modal open title="Adjust hostel fee" onClose={close}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="text-sm">
          <p className="font-medium text-heading">{studentName(fee.studentId)}</p>
          <p className="text-muted">Base amount {formatMoney(fee.amount)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Discount" type="number" min={0} placeholder={String(fee.discount)} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <Input label="Fine" type="number" min={0} placeholder={String(fee.fine)} value={fine} onChange={(e) => setFine(e.target.value)} />
        </div>
        <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} error={error ?? undefined} />
        {adjustFee.isError && (
          <p role="alert" className="text-sm text-danger">
            {messageFrom(adjustFee.error, "We couldn't save this adjustment.")}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" isLoading={adjustFee.isPending}>
            Save Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function HostelFeesPage() {
  const { can } = usePermission();
  const isManager = can("hostel:create");
  const canAdjust = can("hostel:approve");

  const [status, setStatus] = useState<HostelFeeStatus | "">("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [paying, setPaying] = useState<HostelFee | null>(null);
  const [adjusting, setAdjusting] = useState<HostelFee | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError, error, refetch, isFetching } = useHostelFees({
    page,
    limit: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const fees = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  if (!isManager) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <Coins className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">See your own hostel fees from My Hostel.</p>
        <Link href="/hostel/my">
          <Button>Go to My Hostel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
            <ArrowLeft className="h-4 w-4" /> Back to hostels
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-heading">Hostel Fees</h1>
        </div>
        {data && (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-4 py-2.5 text-right">
            <p className="text-xs uppercase tracking-wide text-muted">Outstanding</p>
            <p className="flex items-center justify-end gap-1.5 text-lg font-semibold text-heading">
              <Coins className="h-4 w-4 text-primary" />
              {formatMoney(data.pendingTotal)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name or ID…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>
        <div className="w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as HostelFeeStatus | "");
              setPage(1);
            }}
            options={[
              { value: "", label: "All statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "PARTIAL", label: "Partial" },
              { value: "PAID", label: "Paid" },
              { value: "CANCELLED", label: "Cancelled" },
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
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load hostel fees.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && fees.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm text-muted">{status === "PENDING" ? "No pending fees." : "No fees found."}</p>
          </div>
        )}
        {!isLoading && !isError && fees.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {fees.map((f) => (
                    <tr key={f._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3 text-heading">{studentName(f.studentId)}</td>
                      <td className="px-4 py-3 text-muted">{formatMoney(f.amount)}</td>
                      <td className="px-4 py-3 font-medium text-heading">{formatMoney(f.dueAmount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(f.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {(f.status === "PENDING" || f.status === "PARTIAL") && (
                          <div className="flex justify-end gap-2">
                            {canAdjust && (
                              <Button variant="secondary" onClick={() => setAdjusting(f)}>
                                <SlidersHorizontal className="h-4 w-4" /> Adjust
                              </Button>
                            )}
                            <Button onClick={() => setPaying(f)}>Collect</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <PayModal fee={paying} onClose={() => setPaying(null)} />
      <AdjustModal fee={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  );
}
