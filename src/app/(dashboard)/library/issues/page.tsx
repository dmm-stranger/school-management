"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRightLeft, AlertCircle, CheckCircle2, Search, User, X, RotateCcw } from "lucide-react";
import {
  useIssues,
  useIssueBook,
  useReturnBook,
  useRenewBook,
  useBorrowerSearch,
  useBorrowerStatus,
} from "@/features/library/library.queries";
import type {
  BookIssue,
  BorrowerSearchResult,
  ReturnCondition,
  IssueStatus,
} from "@/features/library/library.types";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

/* ------------------------------ Issue desk ------------------------------ */

function IssueDesk() {
  const issueBook = useIssueBook();
  const [barcode, setBarcode] = useState("");
  const [borrowerQuery, setBorrowerQuery] = useState("");
  const [borrower, setBorrower] = useState<BorrowerSearchResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const debouncedQuery = useDebounce(borrowerQuery);
  const { data: matches = [], isFetching: searching } = useBorrowerSearch(borrower ? "" : debouncedQuery);
  const { data: status, isLoading: statusLoading } = useBorrowerStatus(borrower?.userId ?? "");

  const canSubmit = !!barcode.trim() && !!borrower && !!status?.canBorrow && !issueBook.isPending;

  const handleIssue = async (e: FormEvent) => {
    e.preventDefault();
    if (!borrower || !canSubmit) return;
    setNotice(null);
    try {
      const issue = await issueBook.mutateAsync({ barcode: barcode.trim(), borrowerId: borrower.userId });
      setNotice(`Issued "${issue.bookTitle}" to ${issue.borrower.name}. Due ${formatDate(issue.dueDate)}.`);
      setBarcode(""); // keep the borrower selected so several books can be issued in a row
    } catch {
      // shown via issueBook.error below
    }
  };

  const clearBorrower = () => {
    setBorrower(null);
    setBorrowerQuery("");
    setNotice(null);
    issueBook.reset();
  };

  return (
    <section aria-labelledby="desk-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
      <h2 id="desk-heading" className="text-base font-semibold text-heading">
        Issue a book
      </h2>

      <form onSubmit={handleIssue} noValidate className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-heading">Borrower</span>
          {borrower ? (
            <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-heading">
                <User className="h-4 w-4 text-muted" />
                {borrower.name}
                <span className="text-muted">
                  · {borrower.code ?? "no ID"} · {borrower.type.toLowerCase()}
                </span>
              </span>
              <button type="button" onClick={clearBorrower} aria-label="Change borrower" className="text-muted hover:text-heading">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <label htmlFor="borrower-search" className="sr-only">
                Search borrower by name or ID
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="borrower-search"
                value={borrowerQuery}
                onChange={(e) => setBorrowerQuery(e.target.value)}
                placeholder="Search student, teacher or staff by name or ID…"
                autoComplete="off"
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
              {debouncedQuery.trim().length >= 2 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface shadow-lg">
                  {searching && <li className="px-3 py-2 text-sm text-muted">Searching…</li>}
                  {!searching && matches.length === 0 && <li className="px-3 py-2 text-sm text-muted">No active borrower found.</li>}
                  {matches.map((m) => (
                    <li key={`${m.type}-${m.userId}`}>
                      <button
                        type="button"
                        onClick={() => setBorrower(m)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-alt)]"
                      >
                        <span className="text-heading">{m.name}</span>
                        <span className="text-xs text-muted">
                          {m.code ?? "no ID"} · {m.type.toLowerCase()}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Input
          label="Copy barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Scan or type, e.g. BK-000123"
          autoComplete="off"
        />

        {borrower && (
          <div className="lg:col-span-2" aria-live="polite">
            {statusLoading && <p className="text-sm text-muted">Checking borrowing eligibility…</p>}
            {status && (
              <div
                className={`rounded-[var(--radius-control)] px-4 py-3 text-sm ${
                  status.canBorrow
                    ? "bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]"
                    : "bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)]"
                }`}
              >
                <p className="font-medium">
                  {status.canBorrow ? "Can borrow" : "Can't borrow right now"} · {status.activeCount} of {status.maxBooks} books out ·{" "}
                  {status.loanDays}-day loan
                </p>
                {status.reasons.map((r) => (
                  <p key={r}>• {r}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 lg:col-span-2">
          <div className="min-h-5 text-sm" aria-live="polite">
            {issueBook.isError && (
              <span role="alert" className="text-danger">
                {messageFrom(issueBook.error, "We couldn't issue this book. Check your connection and try again.")}
              </span>
            )}
            {notice && !issueBook.isError && (
              <span className="flex items-center gap-1.5 text-[var(--color-status-active-text)]">
                <CheckCircle2 className="h-4 w-4" /> {notice}
              </span>
            )}
          </div>
          <Button type="submit" disabled={!canSubmit} isLoading={issueBook.isPending}>
            <ArrowRightLeft className="h-4 w-4" /> Issue Book
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ------------------------------ Return modal ------------------------------ */

function ReturnModal({ issue, onClose }: { issue: BookIssue | null; onClose: () => void }) {
  const returnBook = useReturnBook();
  const [condition, setCondition] = useState<ReturnCondition>("GOOD");
  const [damageFine, setDamageFine] = useState("");
  const [remarks, setRemarks] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const close = () => {
    setCondition("GOOD");
    setDamageFine("");
    setRemarks("");
    setResult(null);
    returnBook.reset();
    onClose();
  };

  if (!issue) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await returnBook.mutateAsync({
        id: issue._id,
        payload: {
          condition,
          damageFine: condition === "DAMAGED" && damageFine ? Number(damageFine) : undefined,
          remarks: remarks.trim() || undefined,
        },
      });
      const total = res.fines.reduce((sum, f) => sum + f.amount, 0);
      if (total > 0) {
        setResult(`Returned. ${formatMoney(total)} in fines was recorded — collect it from the Fines page.`);
      } else {
        close();
      }
    } catch {
      // error shown inside the modal
    }
  };

  return (
    <Modal open title="Return book" onClose={close}>
      {result ? (
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 text-sm text-heading">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-status-active-text)]" />
            {result}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              Done
            </Button>
            <Link href="/library/fines">
              <Button>Go to Fines</Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div className="text-sm">
            <p className="font-medium text-heading">{issue.bookTitle}</p>
            <p className="text-muted">
              {issue.barcode} · {issue.borrower.name} · due {formatDate(issue.dueDate)}
            </p>
          </div>

          {issue.isOverdue && (
            <p role="status" className="rounded-[var(--radius-control)] bg-[var(--color-status-pending-bg)] px-3 py-2 text-sm text-[var(--color-status-pending-text)]">
              {issue.overdueDays} day(s) overdue — a late fee of {formatMoney(issue.projectedFine)} will be recorded.
            </p>
          )}

          <Select
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ReturnCondition)}
            options={[
              { value: "GOOD", label: "Good — back on the shelf" },
              { value: "DAMAGED", label: "Damaged" },
              { value: "LOST", label: "Lost" },
            ]}
          />

          {condition === "DAMAGED" && (
            <Input label="Damage fine (optional)" type="number" min={0} value={damageFine} onChange={(e) => setDamageFine(e.target.value)} />
          )}
          {condition === "LOST" && (
            <p role="status" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-3 py-2 text-sm text-[var(--color-status-inactive-text)]">
              The lost-book charge from the library rules will be recorded for this borrower.
            </p>
          )}

          <Input label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          {returnBook.isError && (
            <p role="alert" className="text-sm text-danger">
              {messageFrom(returnBook.error, "We couldn't process this return. Please try again.")}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={returnBook.isPending}>
              Confirm Return
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ------------------------------ Loans list ------------------------------ */

type Tab = "active" | "overdue" | "returned" | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "overdue", label: "Overdue" },
  { id: "returned", label: "Returned" },
  { id: "all", label: "All" },
];
const tabParams = (tab: Tab): { status?: IssueStatus; overdue?: boolean } => {
  if (tab === "active") return { status: "ISSUED" };
  if (tab === "overdue") return { overdue: true };
  if (tab === "returned") return { status: "RETURNED" };
  return {};
};

function LoansList() {
  const params = useSearchParams();
  const initialTab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "active") as Tab;

  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState<BookIssue | null>(null);
  const debouncedSearch = useDebounce(search);
  const renew = useRenewBook();

  const { data, isLoading, isError, error, refetch, isFetching } = useIssues({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    ...tabParams(tab),
  });

  const issues = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <section aria-labelledby="loans-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="loans-heading" className="text-base font-semibold text-heading">
          Loans
        </h2>
        <div role="tablist" aria-label="Loan filters" className="flex gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={`rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors ${
                tab === t.id ? "bg-surface font-medium text-heading shadow-sm" : "text-muted hover:text-heading"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <label htmlFor="loan-search" className="sr-only">
          Search loans
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="loan-search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by book, barcode or borrower…"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {renew.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(renew.error, "We couldn't renew this loan.")}
        </p>
      )}

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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load loans</p>
            <p className="text-sm text-muted">{messageFrom(error, "Something went wrong.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && issues.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <RotateCcw className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">
              {debouncedSearch ? "No loans match your search" : tab === "overdue" ? "Nothing is overdue" : "No loans here yet"}
            </p>
            <p className="text-sm text-muted">
              {tab === "overdue" && !debouncedSearch ? "Every borrowed book is within its due date." : "Issued books will appear here."}
            </p>
          </div>
        )}

        {!isLoading && !isError && issues.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Issued</th>
                    <th className="px-4 py-3">Due / Returned</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {issues.map((i) => (
                    <tr key={i._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-heading">{i.bookTitle}</p>
                        <p className="font-mono text-xs text-muted">{i.barcode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-heading">{i.borrower.name}</p>
                        <p className="text-xs text-muted">
                          {i.borrower.code ?? "no ID"} · {i.borrowerType.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(i.issueDate)}</td>
                      <td className="px-4 py-3 text-muted">
                        {i.status === "ISSUED" ? formatDate(i.dueDate) : formatDate(i.returnDate)}
                        {i.renewalCount > 0 && <span className="ml-1 text-xs">(renewed {i.renewalCount}×)</span>}
                      </td>
                      <td className="px-4 py-3">
                        {i.isOverdue ? (
                          <span className="flex flex-col items-start gap-1">
                            <StatusBadge status="OVERDUE" />
                            <span className="text-xs text-muted">
                              {i.overdueDays}d late · {formatMoney(i.projectedFine)}
                            </span>
                          </span>
                        ) : (
                          <StatusBadge status={i.status} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {i.status === "ISSUED" && (
                          <div className="flex justify-end gap-2">
                            {!i.isOverdue && (
                              <Button variant="secondary" disabled={renew.isPending} onClick={() => renew.mutate(i._id)}>
                                Renew
                              </Button>
                            )}
                            <Button onClick={() => setReturning(i)}>Return</Button>
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

      <ReturnModal issue={returning} onClose={() => setReturning(null)} />
    </section>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function IssuesPage() {
  const { can } = usePermission();

  if (!can("library:create")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-heading">This desk is for library staff</p>
        <p className="text-sm text-muted">You can see your own loans and fines instead.</p>
        <Link href="/library/my">
          <Button>Go to My Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Issue &amp; Return</h1>
        <p className="mt-1 text-sm text-muted">Lend books, take them back, and keep an eye on what&apos;s overdue.</p>
      </div>
      <IssueDesk />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />}>
        <LoansList />
      </Suspense>
    </div>
  );
}
