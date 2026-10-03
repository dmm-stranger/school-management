"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useLibrarySettings, useUpdateLibrarySettings } from "@/features/library/library.queries";
import type { BorrowerType, LibrarySettings } from "@/features/library/library.types";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { messageFrom } from "@/lib/form-errors";

const BORROWER_TYPES: { type: BorrowerType; label: string }[] = [
  { type: "STUDENT", label: "Students" },
  { type: "TEACHER", label: "Teachers" },
  { type: "STAFF", label: "Staff" },
];

type FormState = {
  borrowLimits: Record<BorrowerType, { maxBooks: string; loanDays: string }>;
  finePerDay: string;
  maxFinePerIssue: string;
  maxRenewals: string;
  lostBookUsePrice: boolean;
  lostBookFlatFine: string;
  blockIssueWithPendingFines: boolean;
};

const toForm = (s: LibrarySettings): FormState => ({
  borrowLimits: Object.fromEntries(
    BORROWER_TYPES.map(({ type }) => [type, { maxBooks: String(s.borrowLimits[type].maxBooks), loanDays: String(s.borrowLimits[type].loanDays) }])
  ) as FormState["borrowLimits"],
  finePerDay: String(s.finePerDay),
  maxFinePerIssue: s.maxFinePerIssue != null ? String(s.maxFinePerIssue) : "",
  maxRenewals: String(s.maxRenewals),
  lostBookUsePrice: s.lostBookUsePrice,
  lostBookFlatFine: String(s.lostBookFlatFine),
  blockIssueWithPendingFines: s.blockIssueWithPendingFines,
});

export default function LibrarySettingsPage() {
  const { can } = usePermission();
  const canEdit = can("settings:update");

  const { data, isLoading, isError, error, refetch } = useLibrarySettings();
  const update = useUpdateLibrarySettings();
  const [form, setForm] = useState<FormState | null>(null);
  const [saved, setSaved] = useState(false);

  // React-endorsed "adjust state during render" pattern (no useEffect): seeds the editable
  // form the moment `data` first arrives, without wiping in-progress edits on a later refetch
  // of the same object (e.g. an unrelated background refresh of this query).
  const [syncedData, setSyncedData] = useState<LibrarySettings | null>(null);
  if (data && data !== syncedData) {
    setSyncedData(data);
    setForm(toForm(data));
  }

  if (isLoading || !form) {
    return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm text-muted">{messageFrom(error, "Couldn't load library settings.")}</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await update.mutateAsync({
      borrowLimits: Object.fromEntries(
        BORROWER_TYPES.map(({ type }) => [type, { maxBooks: Number(form.borrowLimits[type].maxBooks), loanDays: Number(form.borrowLimits[type].loanDays) }])
      ) as never,
      finePerDay: Number(form.finePerDay),
      maxFinePerIssue: form.maxFinePerIssue === "" ? null : Number(form.maxFinePerIssue),
      maxRenewals: Number(form.maxRenewals),
      lostBookUsePrice: form.lostBookUsePrice,
      lostBookFlatFine: Number(form.lostBookFlatFine),
      blockIssueWithPendingFines: form.blockIssueWithPendingFines,
    });
    setSaved(true);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Library Settings</h1>
        <p className="mt-1 text-sm text-muted">Borrow limits, fines and renewal rules used across the library.</p>
      </div>

      {!canEdit && (
        <p className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-muted">
          <Lock className="h-4 w-4" /> Only a Super Admin can change these settings. Shown here read-only.
        </p>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <fieldset disabled={!canEdit || update.isPending} className="flex flex-col gap-6">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
            <h2 className="text-base font-semibold text-heading">Borrow limits</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {BORROWER_TYPES.map(({ type, label }) => (
                <div key={type} className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-heading">{label}</p>
                  <Input
                    label="Max books at once"
                    type="number"
                    min={1}
                    value={form.borrowLimits[type].maxBooks}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, borrowLimits: { ...f.borrowLimits, [type]: { ...f.borrowLimits[type], maxBooks: e.target.value } } })
                    }
                  />
                  <Input
                    label="Loan period (days)"
                    type="number"
                    min={1}
                    value={form.borrowLimits[type].loanDays}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, borrowLimits: { ...f.borrowLimits, [type]: { ...f.borrowLimits[type], loanDays: e.target.value } } })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
            <h2 className="text-base font-semibold text-heading">Fines &amp; renewals</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Fine per day (overdue)" type="number" min={0} value={form.finePerDay} onChange={(e) => setForm((f) => f && { ...f, finePerDay: e.target.value })} />
              <Input
                label="Max fine per loan (blank = no cap)"
                type="number"
                min={0}
                value={form.maxFinePerIssue}
                onChange={(e) => setForm((f) => f && { ...f, maxFinePerIssue: e.target.value })}
              />
              <Input label="Max renewals" type="number" min={0} value={form.maxRenewals} onChange={(e) => setForm((f) => f && { ...f, maxRenewals: e.target.value })} />
              <Input
                label="Flat lost-book fine"
                type="number"
                min={0}
                value={form.lostBookFlatFine}
                onChange={(e) => setForm((f) => f && { ...f, lostBookFlatFine: e.target.value })}
                hint={form.lostBookUsePrice ? "Used only when the book has no price set" : "Used for every lost book"}
              />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-heading">
                <input
                  type="checkbox"
                  checked={form.lostBookUsePrice}
                  onChange={(e) => setForm((f) => f && { ...f, lostBookUsePrice: e.target.checked })}
                />
                Charge the book&apos;s price for a lost book, when known
              </label>
              <label className="flex items-center gap-2 text-sm text-heading">
                <input
                  type="checkbox"
                  checked={form.blockIssueWithPendingFines}
                  onChange={(e) => setForm((f) => f && { ...f, blockIssueWithPendingFines: e.target.checked })}
                />
                Block new loans while a borrower has unpaid fines or overdue books
              </label>
            </div>
          </div>
        </fieldset>

        {update.isError && (
          <p role="alert" className="text-sm text-danger">
            {messageFrom(update.error, "We couldn't save these settings. Please try again.")}
          </p>
        )}

        {canEdit && (
          <div className="flex items-center justify-end gap-3">
            {saved && !update.isPending && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-status-active-text)]">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
            <Button type="submit" isLoading={update.isPending}>
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
