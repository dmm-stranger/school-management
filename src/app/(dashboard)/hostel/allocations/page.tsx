"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, Search, User, X, UserMinus } from "lucide-react";
import {
  useAllocations,
  useCreateAllocation,
  useEndAllocation,
  useHostels,
  useRoomsForHostel,
  useRoom,
} from "@/features/hostel/hostel.queries";
import type { AllocationStatus, AllocationStudentRef } from "@/features/hostel/hostel.types";
import { useStudents } from "@/features/student/student.queries";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

const studentName = (ref: AllocationStudentRef | string) => (typeof ref === "string" ? ref : ref.personalInfo.fullName);
const studentCode = (ref: AllocationStudentRef | string) => (typeof ref === "string" ? "" : ref.studentId);

function AllocateDesk() {
  const createAllocation = useCreateAllocation();
  const [studentQuery, setStudentQuery] = useState("");
  const [student, setStudent] = useState<{ _id: string; name: string; code: string } | null>(null);
  const [hostelId, setHostelId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [bedId, setBedId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const debouncedQuery = useDebounce(studentQuery);
  const searchEnabled = !student && debouncedQuery.trim().length >= 2;
  const { data: studentResults, isFetching: searching } = useStudents({ search: debouncedQuery, status: "ACTIVE", limit: 10 }, { enabled: searchEnabled });
  const students = searchEnabled ? (studentResults?.data ?? []) : [];

  const { data: hostels } = useHostels({ status: "ACTIVE" });
  const { data: rooms } = useRoomsForHostel(hostelId);
  const { data: roomDetail } = useRoom(roomId);
  const availableBeds = (roomDetail?.beds ?? []).filter((b) => b.status === "AVAILABLE");

  const canSubmit = !!student && !!roomId && !!bedId && !createAllocation.isPending;

  const handleAllocate = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !student) return;
    setNotice(null);
    try {
      await createAllocation.mutateAsync({ studentId: student._id, roomId, bedId });
      setNotice(`Allocated ${student.name}. A hostel fee was generated.`);
      setStudent(null);
      setStudentQuery("");
      setHostelId("");
      setRoomId("");
      setBedId("");
    } catch {
      // shown via createAllocation.error
    }
  };

  return (
    <section aria-labelledby="allocate-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5">
      <h2 id="allocate-heading" className="text-base font-semibold text-heading">
        Allocate a student
      </h2>

      <form onSubmit={handleAllocate} noValidate className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          label="Hostel"
          placeholder="Select hostel"
          value={hostelId}
          onChange={(e) => {
            setHostelId(e.target.value);
            setRoomId("");
            setBedId("");
          }}
          options={(hostels?.data ?? []).map((h) => ({ value: h._id, label: `${h.name} (${h.type})` }))}
        />
        <Select
          label="Room"
          placeholder={hostelId ? "Select room" : "Choose a hostel first"}
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
            setBedId("");
          }}
          options={(rooms ?? []).map((r) => ({ value: r._id, label: `Room ${r.roomNumber}${r.floor ? ` (${r.floor})` : ""}` }))}
        />
        <Select
          label="Bed"
          placeholder={roomId ? (availableBeds.length ? "Select bed" : "No beds available") : "Choose a room first"}
          value={bedId}
          onChange={(e) => setBedId(e.target.value)}
          options={availableBeds.map((b) => ({ value: b._id, label: `Bed ${b.bedNumber}` }))}
        />

        <div className="flex items-center justify-between gap-3 lg:col-span-2">
          <div className="min-h-5 text-sm" aria-live="polite">
            {createAllocation.isError && (
              <span role="alert" className="text-danger">
                {messageFrom(createAllocation.error, "We couldn't create this allocation. Please try again.")}
              </span>
            )}
            {notice && !createAllocation.isError && (
              <span className="flex items-center gap-1.5 text-[var(--color-status-active-text)]">
                <CheckCircle2 className="h-4 w-4" /> {notice}
              </span>
            )}
          </div>
          <Button type="submit" disabled={!canSubmit} isLoading={createAllocation.isPending}>
            Allocate Student
          </Button>
        </div>
      </form>
    </section>
  );
}

function EndAllocationModal({ allocationId, studentLabel, onClose }: { allocationId: string | null; studentLabel: string; onClose: () => void }) {
  const endAllocation = useEndAllocation();
  if (!allocationId) return null;
  const close = () => {
    endAllocation.reset();
    onClose();
  };
  const confirm = async () => {
    try {
      await endAllocation.mutateAsync({ id: allocationId });
      close();
    } catch {
      // shown below
    }
  };
  return (
    <Modal open title="End hostel allocation" onClose={close}>
      <p className="text-sm text-muted">
        This frees {studentLabel}&apos;s bed. Any hostel fee already generated stays owed — the accommodation was provided.
      </p>
      {endAllocation.isError && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {messageFrom(endAllocation.error, "We couldn't end this allocation.")}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="danger" isLoading={endAllocation.isPending} onClick={confirm}>
          End Allocation
        </Button>
      </div>
    </Modal>
  );
}

function AllocationsList() {
  const [status, setStatus] = useState<AllocationStatus | "">("ACTIVE");
  const [page, setPage] = useState(1);
  const [ending, setEnding] = useState<{ id: string; label: string } | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAllocations({ page, limit: 20, status: status || undefined });
  const allocations = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 };

  return (
    <section aria-labelledby="allocations-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="allocations-heading" className="text-base font-semibold text-heading">
          Allocations
        </h2>
        <div className="w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AllocationStatus | "");
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
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load allocations.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && allocations.length === 0 && <p className="px-6 py-14 text-center text-sm text-muted">No allocations here yet.</p>}
        {!isLoading && !isError && allocations.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Hostel / Room / Bed</th>
                    <th className="px-4 py-3">Since</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {allocations.map((a) => {
                    const hostelName = typeof a.hostelId === "string" ? a.hostelId : a.hostelId.name;
                    const roomNumber = typeof a.roomId === "string" ? a.roomId : a.roomId.roomNumber;
                    const bedNumber = typeof a.bedId === "string" ? a.bedId : a.bedId.bedNumber;
                    return (
                      <tr key={a._id} className="hover:bg-[var(--color-surface-alt)]">
                        <td className="px-4 py-3">
                          <p className="font-medium text-heading">{studentName(a.studentId)}</p>
                          <p className="text-xs text-muted">{studentCode(a.studentId)}</p>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {hostelName} / Room {roomNumber} / Bed {bedNumber}
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>

      <EndAllocationModal allocationId={ending?.id ?? null} studentLabel={ending?.label ?? ""} onClose={() => setEnding(null)} />
    </section>
  );
}

export default function AllocationsPage() {
  const { can } = usePermission();
  if (!can("hostel:create")) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-muted" />
        <p className="text-sm text-muted">This desk is for hostel staff.</p>
        <Link href="/hostel/my">
          <Button>Go to My Hostel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to hostels
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Allocate Students</h1>
        <p className="mt-1 text-sm text-muted">Put a student in a hostel, room and bed. A hostel fee is generated automatically.</p>
      </div>
      <AllocateDesk />
      <AllocationsList />
    </div>
  );
}
