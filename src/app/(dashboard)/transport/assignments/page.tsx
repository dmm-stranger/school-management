"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, Search, User, X, UserMinus } from "lucide-react";
import {
  useAssignments,
  useCreateAssignment,
  useEndAssignment,
  useRoutes,
  useRoute,
} from "@/features/transport/transport.queries";
import type { AssignmentStatus, AssignmentStudentRef, RouteVehicleRef, TransportStop } from "@/features/transport/transport.types";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";
import { useStudents } from "@/features/student/student.queries";

const studentName = (ref: AssignmentStudentRef | string) => (typeof ref === "string" ? ref : ref.personalInfo.fullName);
const studentCode = (ref: AssignmentStudentRef | string) => (typeof ref === "string" ? "" : ref.studentId);
const vehicleOf = (ref: RouteVehicleRef | string) => (typeof ref === "string" ? ref : `${ref.vehicleNumber} (${ref.seatCapacity} seats)`);

function AssignDesk() {
  const createAssignment = useCreateAssignment();
  const [studentQuery, setStudentQuery] = useState("");
  const [student, setStudent] = useState<{ _id: string; name: string; code: string } | null>(null);
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const debouncedQuery = useDebounce(studentQuery);
  const searchEnabled = !student && debouncedQuery.trim().length >= 2;
  const { data: studentResults, isFetching: searching } = useStudents(
    { search: debouncedQuery, status: "ACTIVE", limit: 10 },
    { enabled: searchEnabled }
  );
  const students = searchEnabled ? (studentResults?.data ?? []) : [];
  const { data: routes } = useRoutes({ status: "ACTIVE" });
  const { data: routeDetail } = useRoute(routeId);

  const canSubmit = !!student && !!routeId && !!stopId && !createAssignment.isPending;

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !student) return;
    setNotice(null);
    try {
      await createAssignment.mutateAsync({ studentId: student._id, routeId, stopId });
      setNotice(`Assigned ${student.name} to this route. A transport fee was generated.`);
      setStudent(null);
      setStudentQuery("");
      setRouteId("");
      setStopId("");
    } catch {
      // shown via createAssignment.error
    }
  };

  return (
    <section aria-labelledby="assign-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
      <h2 id="assign-heading" className="text-base font-semibold text-heading">
        Assign a student
      </h2>

      <form onSubmit={handleAssign} noValidate className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-sm font-medium text-heading">Student</span>
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
                placeholder="Search student by name or ID…"
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

        <Select
          label="Route"
          placeholder="Select route"
          value={routeId}
          onChange={(e) => {
            setRouteId(e.target.value);
            setStopId("");
          }}
          options={(routes?.data ?? []).map((r) => ({ value: r._id, label: `${r.name} — ${vehicleOf(r.vehicleId)}` }))}
        />
        <Select
          label="Stop"
          placeholder={routeId ? "Select stop" : "Choose a route first"}
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          options={(routeDetail?.stops ?? [])
            .slice()
            .sort((a: TransportStop, b: TransportStop) => a.sequence - b.sequence)
            .map((s: TransportStop) => ({ value: s._id, label: `${s.sequence}. ${s.name}${s.pickupTime ? ` (${s.pickupTime})` : ""}` }))}
        />

        {routeDetail && (
          <p className="text-sm text-muted lg:col-span-2" aria-live="polite">
            {routeDetail.assignedCount} of {typeof routeDetail.vehicleId === "string" ? "?" : routeDetail.vehicleId.seatCapacity} seats
            filled on this route&apos;s vehicle.
          </p>
        )}

        <div className="flex items-center justify-between gap-3 lg:col-span-2">
          <div className="min-h-5 text-sm" aria-live="polite">
            {createAssignment.isError && (
              <span role="alert" className="text-danger">
                {messageFrom(createAssignment.error, "We couldn't create this assignment. Please try again.")}
              </span>
            )}
            {notice && !createAssignment.isError && (
              <span className="flex items-center gap-1.5 text-[var(--color-status-active-text)]">
                <CheckCircle2 className="h-4 w-4" /> {notice}
              </span>
            )}
          </div>
          <Button type="submit" disabled={!canSubmit} isLoading={createAssignment.isPending}>
            Assign Student
          </Button>
        </div>
      </form>
    </section>
  );
}

function EndAssignmentModal({ assignmentId, studentLabel, onClose }: { assignmentId: string | null; studentLabel: string; onClose: () => void }) {
  const endAssignment = useEndAssignment();
  if (!assignmentId) return null;
  const close = () => {
    endAssignment.reset();
    onClose();
  };
  const confirm = async () => {
    try {
      await endAssignment.mutateAsync({ id: assignmentId });
      close();
    } catch {
      // shown below
    }
  };
  return (
    <Modal open title="End transport assignment" onClose={close}>
      <p className="text-sm text-muted">
        This frees {studentLabel}&apos;s seat. Any transport fee already generated stays owed — the service was rendered.
      </p>
      {endAssignment.isError && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {messageFrom(endAssignment.error, "We couldn't end this assignment.")}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="danger" isLoading={endAssignment.isPending} onClick={confirm}>
          End Assignment
        </Button>
      </div>
    </Modal>
  );
}

function AssignmentsList() {
  const [status, setStatus] = useState<AssignmentStatus | "">("ACTIVE");
  const [page, setPage] = useState(1);
  const [ending, setEnding] = useState<{ id: string; label: string } | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAssignments({ page, limit: 20, status: status || undefined });
  const assignments = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <section aria-labelledby="assignments-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="assignments-heading" className="text-base font-semibold text-heading">
          Assignments
        </h2>
        <div className="w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AssignmentStatus | "");
              setPage(1);
            }}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "ENDED", label: "Ended" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "", label: "All" },
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
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load assignments.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && assignments.length === 0 && (
          <p className="px-6 py-14 text-center text-sm text-muted">No assignments here yet.</p>
        )}
        {!isLoading && !isError && assignments.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Started</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:bg-[var(--color-surface-alt)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-heading">{studentName(a.studentId)}</p>
                        <p className="text-xs text-muted">{studentCode(a.studentId)}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{vehicleOf(a.vehicleId)}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(a.startDate)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status === "ACTIVE" && (
                          <Button variant="secondary" onClick={() => setEnding({ id: a._id, label: studentName(a.studentId) })}>
                            <UserMinus className="h-4 w-4" /> End
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

      <EndAssignmentModal assignmentId={ending?.id ?? null} studentLabel={ending?.label ?? ""} onClose={() => setEnding(null)} />
    </section>
  );
}

export default function AssignmentsPage() {
  const { can } = usePermission();
  if (!can("transport:create")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">This desk is for transport staff.</p>
        <Link href="/transport/my">
          <Button>Go to My Transport</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to fleet
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Assign Students</h1>
        <p className="mt-1 text-sm text-muted">Put a student on a route and stop. A transport fee is generated automatically.</p>
      </div>
      <AssignDesk />
      <AssignmentsList />
    </div>
  );
}
