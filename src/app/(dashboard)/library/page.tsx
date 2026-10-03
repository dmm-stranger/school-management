"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Plus, AlertCircle, BookCheck, BookX, Coins, ArrowRightLeft, Settings2, ListTree } from "lucide-react";
import { useBooks, useLookups, useLibrarySummary } from "@/features/library/library.queries";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { ApiClientError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { NamedRef } from "@/features/library/library.types";

const nameOf = (ref: NamedRef | string | null | undefined) => (ref && typeof ref !== "string" ? ref.name : "—");

function KpiStrip() {
  const { data, isLoading } = useLibrarySummary();
  const cards = [
    { label: "Book titles", value: data?.titles, icon: BookOpen },
    { label: "Copies available", value: data ? `${data.availableCopies} / ${data.totalCopies}` : undefined, icon: BookCheck },
    { label: "Overdue loans", value: data?.overdueIssues, icon: BookX, href: "/library/issues?tab=overdue" },
    { label: "Unpaid fines", value: data ? formatMoney(data.pendingFineTotal) : undefined, icon: Coins, href: "/library/fines" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, href }) => {
        const body = (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
            <div className="flex items-center justify-between text-sm text-muted">
              {label}
              <Icon className="h-4 w-4" style={{ color: "var(--color-chart-library)" }} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-heading">
              {isLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-[var(--color-surface-alt)]" /> : (value ?? "—")}
            </p>
          </div>
        );
        return href ? (
          <Link key={label} href={href} className="hover:opacity-90">
            {body}
          </Link>
        ) : (
          <div key={label}>{body}</div>
        );
      })}
    </div>
  );
}

export default function LibraryCatalogPage() {
  const { can } = usePermission();
  const isManager = can("library:create");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data: categories } = useLookups("book-categories");
  const { data, isLoading, isError, error, refetch, isFetching } = useBooks({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    availableOnly,
    status: isManager ? undefined : "ACTIVE",
  });

  const books = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };
  const hasFilters = !!debouncedSearch || !!categoryId || availableOnly;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setAvailableOnly(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Library</h1>
          <p className="mt-1 text-sm text-muted">Browse the catalog and check what&apos;s on the shelf.</p>
        </div>
        {isManager && (
          <div className="flex flex-wrap gap-2">
            <Link href="/library/setup">
              <Button variant="ghost" title="Categories, authors, publishers">
                <ListTree className="h-4 w-4" />
                Setup
              </Button>
            </Link>
            <Link href="/library/settings">
              <Button variant="ghost" title="Borrow limits, fines, renewals">
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/library/issues">
              <Button variant="secondary">
                <ArrowRightLeft className="h-4 w-4" />
                Issue / Return
              </Button>
            </Link>
            <Link href="/library/books/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isManager && <KpiStrip />}

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor="book-search" className="sr-only">
            Search books
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="book-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or ISBN…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>
        <div className="w-52">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "All categories" }, ...(categories?.data ?? []).map((c) => ({ value: c._id, label: c.name }))]}
          />
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm text-heading">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => {
              setAvailableOnly(e.target.checked);
              setPage(1);
            }}
          />
          Available now
        </label>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear all
          </Button>
        )}
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
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load the catalog</p>
            <p className="text-sm text-muted">{error instanceof ApiClientError ? error.message : "Something went wrong."}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && books.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <BookOpen className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">{hasFilters ? "No books match your filters" : "No books in the catalog yet"}</p>
            <p className="text-sm text-muted">
              {hasFilters ? "Try a different search or clear the filters." : isManager ? "Add your first book to get started." : "Check back soon."}
            </p>
          </div>
        )}

        {!isLoading && !isError && books.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Shelf</th>
                    <th className="px-4 py-3">Availability</th>
                    {isManager && <th className="px-4 py-3">Status</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {books.map((b) => (
                    <tr key={b._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3">
                        <Link href={`/library/books/${b._id}`} className="font-medium text-heading hover:text-primary">
                          {b.title}
                        </Link>
                        <p className="text-xs text-muted">{b.authorIds.map((a) => a.name).join(", ")}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{nameOf(b.categoryId)}</td>
                      <td className="px-4 py-3 text-muted">{b.shelfLocation || "—"}</td>
                      <td className="px-4 py-3">
                        {b.copies.available > 0 ? (
                          <span className="font-medium text-[var(--color-status-active-text)]">
                            {b.copies.available} of {b.copies.total} available
                          </span>
                        ) : (
                          <span className="text-muted">{b.copies.total === 0 ? "No copies" : "All copies out"}</span>
                        )}
                      </td>
                      {isManager && (
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
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
    </div>
  );
}
