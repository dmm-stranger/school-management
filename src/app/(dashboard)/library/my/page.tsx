"use client";

import { useState } from "react";
import { BookOpen, AlertCircle, RotateCcw } from "lucide-react";
import { useMyIssues } from "@/features/library/library.queries";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

export default function MyLibraryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyIssues({ page, limit: 20 });

  const issues = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };
  const activeCount = issues.filter((i) => i.status === "ISSUED").length;
  const overdueFines = issues.reduce((sum, i) => sum + (i.status === "RETURNED" ? i.fineAmount : 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">My Library</h1>
        <p className="mt-1 text-sm text-muted">Books you&apos;ve borrowed and their due dates.</p>
      </div>

      {isLoading && (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-heading">Couldn&apos;t load your library records</p>
          <p className="text-sm text-muted">{messageFrom(error, "Something went wrong.")}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && issues.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <BookOpen className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">You haven&apos;t borrowed any books yet</p>
          <p className="text-sm text-muted">Visit the library desk to borrow a book from the catalog.</p>
        </div>
      )}

      {!isLoading && !isError && issues.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Currently borrowed", activeCount],
              ["Total loans", pagination.total],
              ["Past fines charged", formatMoney(overdueFines)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 text-xl font-semibold text-heading">{value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Issued</th>
                    <th className="px-4 py-3">Due / Returned</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {issues.map((i) => (
                    <tr key={i._id}>
                      <td className="px-4 py-3 font-medium text-heading">{i.bookTitle}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(i.issueDate)}</td>
                      <td className="px-4 py-3 text-muted">{i.status === "ISSUED" ? formatDate(i.dueDate) : formatDate(i.returnDate)}</td>
                      <td className="px-4 py-3">
                        {i.isOverdue ? (
                          <span className="flex flex-col items-start gap-1">
                            <StatusBadge status="OVERDUE" />
                            <span className="text-xs text-muted">{i.overdueDays}d late · {formatMoney(i.projectedFine)} so far</span>
                          </span>
                        ) : (
                          <StatusBadge status={i.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted">
            <RotateCcw className="h-3.5 w-3.5" /> Returns and fine payments are handled at the library desk.
          </p>
        </>
      )}
    </div>
  );
}
