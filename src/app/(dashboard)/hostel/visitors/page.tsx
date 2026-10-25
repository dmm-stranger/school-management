"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, UserCheck, Search, LogOut, X, User } from "lucide-react";
import { useVisitors, useLogVisitor, useCheckOutVisitor } from "@/features/hostel/hostel.queries";
import type { VisitorStudentRef } from "@/features/hostel/hostel.types";
import { useStudents } from "@/features/student/student.queries";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const studentName = (ref: VisitorStudentRef | string) => (typeof ref === "string" ? ref : ref.personalInfo.fullName);
const studentCode = (ref: VisitorStudentRef | string) => (typeof ref === "string" ? "" : ref.studentId);

function LogVisitorForm() {
  const logVisitor = useLogVisitor();
  const [studentQuery, setStudentQuery] = useState("");
  const [student, setStudent] = useState<{ _id: string; name: string; code: string } | null>(null);
  const [form, setForm] = useState({ visitorName: "", visitorPhone: "", relation: "", purpose: "" });
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(studentQuery);
  const searchEnabled = !student && debouncedQuery.trim().length >= 2;
  const { data: studentResults, isFetching: searching } = useStudents({ search: debouncedQuery, status: "ACTIVE", limit: 10 }, { enabled: searchEnabled });
  const students = searchEnabled ? (studentResults?.data ?? []) : [];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!student) {
      setError("Select the resident being visited.");
      return;
    }
    if (!form.visitorName.trim()) {
      setError("Visitor name is required.");
      return;
    }
    try {
      await logVisitor.mutateAsync({
        studentId: student._id,
        visitorName: form.visitorName.trim(),
        visitorPhone: form.visitorPhone.trim() || undefined,
        relation: form.relation.trim() || undefined,
        purpose: form.purpose.trim() || undefined,
      });
      setStudent(null);
      setStudentQuery("");
      setForm({ visitorName: "", visitorPhone: "", relation: "", purpose: "" });
      setError(null);
    } catch (err) {
      setError(messageFrom(err, "We couldn't log this visitor."));
    }
  };

  return (
    <section aria-labelledby="log-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
      <h2 id="log-heading" className="text-base font-semibold text-heading">
        Log a visitor
      </h2>
      <form onSubmit={submit} noValidate className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-sm font-medium text-heading">Visiting (resident)</span>
          {student ? (
            <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-heading">
                <User className="h-4 w-4 text-muted" />
                {student.name} <span className="text-muted">· {student.code}</span>
              </span>
              <button type="button" onClick={() => setStudent(null)} aria-label="Change student" className="text-muted hover:text-heading">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                placeholder="Search resident by name or ID…"
                autoComplete="off"
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
              {debouncedQuery.trim().length >= 2 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface shadow-lg">
                  {searching && <li className="px-3 py-2 text-sm text-muted">Searching…</li>}
                  {!searching && students.length === 0 && <li className="px-3 py-2 text-sm text-muted">No active student found.</li>}
                  {students.map((s) => (
                    <li key={s._id}>
                      <button
                        type="button"
                        onClick={() => setStudent({ _id: s._id, name: s.personalInfo.fullName, code: s.studentId })}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-alt)]"
                      >
                        <span className="text-heading">{s.personalInfo.fullName}</span>
                        <span className="text-xs text-muted">{s.studentId}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <Input label="Visitor name" required value={form.visitorName} onChange={(e) => setForm((f) => ({ ...f, visitorName: e.target.value }))} />
        <Input label="Phone (optional)" value={form.visitorPhone} onChange={(e) => setForm((f) => ({ ...f, visitorPhone: e.target.value }))} />
        <Input label="Relation (optional)" placeholder="Father, Guardian…" value={form.relation} onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))} />
        <Input label="Purpose (optional)" value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
        {error && (
          <p role="alert" className="text-sm text-danger lg:col-span-2">
            {error}
          </p>
        )}
        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" isLoading={logVisitor.isPending}>
            <UserCheck className="h-4 w-4" /> Log Check-in
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function VisitorsPage() {
  const { can } = usePermission();
  const checkOutVisitor = useCheckOutVisitor();
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } = useVisitors({ page, limit: 20, activeOnly });

  if (!can("hostel:create")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">Visitor logging is for hostel staff.</p>
      </div>
    );
  }

  const visitors = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to hostels
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Visitor Log</h1>
        <p className="mt-1 text-sm text-muted">A permanent record of every visit — entries are never deleted.</p>
      </div>

      <LogVisitorForm />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-heading">Log</h2>
        <label className="flex items-center gap-2 text-sm text-heading">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => {
              setActiveOnly(e.target.checked);
              setPage(1);
            }}
          />
          On site only
        </label>
      </div>

      {checkOutVisitor.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(checkOutVisitor.error, "We couldn't check out this visitor.")}
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
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load the visitor log.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && visitors.length === 0 && (
          <p className="px-6 py-14 text-center text-sm text-muted">{activeOnly ? "No visitors on site right now." : "No visitor records yet."}</p>
        )}
        {!isLoading && !isError && visitors.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Visitor</th>
                    <th className="px-4 py-3">Visiting</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {visitors.map((v) => (
                    <tr key={v._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-heading">{v.visitorName}</p>
                        <p className="text-xs text-muted">
                          {v.relation ?? ""}
                          {v.visitorPhone ? ` · ${v.visitorPhone}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-heading">{studentName(v.studentId)}</p>
                        <p className="text-xs text-muted">{studentCode(v.studentId)}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(v.checkInTime)}</td>
                      <td className="px-4 py-3 text-muted">{v.checkOutTime ? formatDate(v.checkOutTime) : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {!v.checkOutTime && (
                          <Button variant="secondary" isLoading={checkOutVisitor.isPending} onClick={() => checkOutVisitor.mutate(v._id)}>
                            <LogOut className="h-4 w-4" /> Check out
                          </Button>
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
    </div>
  );
}
