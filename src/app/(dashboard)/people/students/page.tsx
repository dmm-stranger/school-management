"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Plus, AlertCircle } from "lucide-react";
import { useStudents } from "@/features/student/student.queries";
import type { StudentStatus } from "@/features/student/student.types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api-client";

const STATUS_FILTERS: { label: string; value: StudentStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Graduated", value: "GRADUATED" },
  { label: "Transferred", value: "TRANSFERRED" },
  { label: "Suspended", value: "SUSPENDED" },
];

function TableSkeleton() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-surface-alt)]" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-[var(--color-surface-alt)]" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
        </div>
      ))}
    </div>
  );
}

export default function StudentsListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input per FRONTEND-WORKING-FLOW.md §7 (race-condition protection).
  // Resetting the page alongside it (inside the same deferred callback, not
  // synchronously in the effect body) avoids the set-state-in-effect issue.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useStudents({
    page,
    limit: 20,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const students = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };
  const hasActiveFilters = status !== "" || debouncedSearch !== "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Students</h1>
          <p className="mt-1 text-sm text-muted">Manage student records and enrollment.</p>
        </div>
        <Link href="/people/students/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-2)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--color-muted-2)] focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
            aria-label="Search students by name"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-primary text-white"
                  : "bg-surface text-muted border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatus("");
              setSearch("");
              setPage(1);
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && <TableSkeleton />}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load students</p>
            <p className="text-sm text-muted">
              {error instanceof ApiClientError ? error.message : "Something went wrong."}
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && students.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <GraduationCap className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">
              {hasActiveFilters ? "No students match your filters" : "No students yet"}
            </p>
            <p className="text-sm text-muted">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Get started by adding your first student."}
            </p>
          </div>
        )}

        {!isLoading && !isError && students.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-[var(--color-border)] ${isFetching ? "opacity-60" : ""}`}>
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-[var(--color-surface-alt)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/people/students/${student._id}`}
                        className="flex items-center gap-3 font-medium text-heading hover:text-primary"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-semibold text-primary">
                          {student.personalInfo.fullName.slice(0, 2).toUpperCase()}
                        </span>
                        {student.personalInfo.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{student.studentId}</td>
                    <td className="px-4 py-3 text-muted">{student.contactInfo.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(student.joiningDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
              <p className="text-xs text-muted">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
