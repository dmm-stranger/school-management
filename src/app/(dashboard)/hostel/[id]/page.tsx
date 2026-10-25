"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  useHostel,
  useUpdateHostel,
  useRoomsForHostel,
  useRoom,
  useCreateRoom,
  useCreateBeds,
  useUpdateBed,
  useDeleteBed,
  useDeleteRoom,
} from "@/features/hostel/hostel.queries";
import { useStaffList } from "@/features/staff/staff.queries";
import { MANUAL_BED_STATUSES, type BedStatus, type HostelRoom } from "@/features/hostel/hostel.types";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messageFrom } from "@/lib/form-errors";

function AddRoomForm({ hostelId, onDone }: { hostelId: string; onDone: () => void }) {
  const createRoom = useCreateRoom();
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError("Room number is required.");
      return;
    }
    try {
      await createRoom.mutateAsync({ hostelId, roomNumber: roomNumber.trim(), floor: floor.trim() || undefined });
      onDone();
    } catch (err) {
      setError(messageFrom(err, "We couldn't add this room."));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Room number" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} error={error ?? undefined} />
      <Input label="Floor (optional)" value={floor} onChange={(e) => setFloor(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createRoom.isPending}>
          Add Room
        </Button>
      </div>
    </form>
  );
}

function RoomBedsPanel({ roomId }: { roomId: string }) {
  const { data: room, isLoading } = useRoom(roomId);
  const createBeds = useCreateBeds();
  const updateBed = useUpdateBed();
  const deleteBed = useDeleteBed();
  const [bedInput, setBedInput] = useState("");

  const addBeds = async (e: FormEvent) => {
    e.preventDefault();
    const numbers = bedInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (numbers.length === 0) return;
    try {
      await createBeds.mutateAsync({ roomId, bedNumbers: numbers });
      setBedInput("");
    } catch {
      // shown via createBeds.error
    }
  };

  if (isLoading) return <div className="h-16 animate-pulse bg-[var(--color-surface-alt)]" />;

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
      {createBeds.isError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {messageFrom(createBeds.error, "We couldn't add those beds.")}
        </p>
      )}
      {deleteBed.isError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {messageFrom(deleteBed.error, "We couldn't remove that bed.")}
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {(room?.beds ?? []).map((b) => (
          <li key={b._id} className="flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-2.5 py-1.5 text-sm">
            <span className="font-medium text-heading">Bed {b.bedNumber}</span>
            <StatusBadge status={b.status} />
            {b.status !== "OCCUPIED" && (
              <>
                <select
                  aria-label={`Status for bed ${b.bedNumber}`}
                  value={b.status}
                  disabled={updateBed.isPending}
                  onChange={(e) => updateBed.mutate({ id: b._id, status: e.target.value as BedStatus })}
                  className="rounded border border-[var(--color-border)] bg-surface px-1 py-0.5 text-xs"
                >
                  {MANUAL_BED_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button onClick={() => deleteBed.mutate(b._id)} aria-label={`Remove bed ${b.bedNumber}`} className="text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </li>
        ))}
        {(room?.beds.length ?? 0) === 0 && <li className="text-sm text-muted">No beds yet.</li>}
      </ul>
      <form onSubmit={addBeds} className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <Input label="Add beds (comma-separated)" placeholder="A, B, C" value={bedInput} onChange={(e) => setBedInput(e.target.value)} />
        </div>
        <Button type="submit" isLoading={createBeds.isPending}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>
    </div>
  );
}

function RoomsSection({ hostelId }: { hostelId: string }) {
  const { data: rooms, isLoading, isError, error, refetch } = useRoomsForHostel(hostelId);
  const deleteRoom = useDeleteRoom();
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section aria-labelledby="rooms-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
        <h2 id="rooms-heading" className="text-base font-semibold text-heading">
          Rooms {rooms ? `(${rooms.length})` : ""}
        </h2>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      {isLoading && <div className="h-16 animate-pulse bg-[var(--color-surface-alt)]" />}
      {isError && (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <AlertCircle className="h-6 w-6 text-danger" />
          <p className="text-sm text-muted">{messageFrom(error, "Couldn't load rooms.")}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !isError && (rooms?.length ?? 0) === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No rooms yet. Add the first one above.</p>}

      {!isLoading && !isError && (rooms?.length ?? 0) > 0 && (
        <ul className="divide-y divide-[var(--color-border)]">
          {rooms!.map((r: HostelRoom) => (
            <li key={r._id}>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button onClick={() => setExpanded(expanded === r._id ? null : r._id)} className="flex flex-1 items-center gap-2 text-left">
                  {expanded === r._id ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                  <span className="font-medium text-heading">Room {r.roomNumber}</span>
                  {r.floor && <span className="text-xs text-muted">{r.floor} floor</span>}
                </button>
                <StatusBadge status={r.status} />
                <button onClick={() => deleteRoom.mutate(r._id)} aria-label={`Delete room ${r.roomNumber}`} className="rounded p-1.5 text-muted hover:bg-surface hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {expanded === r._id && <RoomBedsPanel roomId={r._id} />}
            </li>
          ))}
        </ul>
      )}

      {deleteRoom.isError && (
        <p role="alert" className="px-4 pb-4 text-sm text-danger">
          {messageFrom(deleteRoom.error, "We couldn't delete that room.")}
        </p>
      )}

      <Modal open={adding} title="Add Room" onClose={() => setAdding(false)}>
        <AddRoomForm hostelId={hostelId} onDone={() => setAdding(false)} />
      </Modal>
    </section>
  );
}

export default function HostelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: hostel, isLoading, isError, error, refetch } = useHostel(id);
  const updateHostel = useUpdateHostel(id);
  const [wardenQuery, setWardenQuery] = useState("");
  const debouncedWardenQuery = useDebounce(wardenQuery);
  const { data: staffResults } = useStaffList({ search: debouncedWardenQuery, status: "ACTIVE", limit: 10 }, { enabled: debouncedWardenQuery.trim().length >= 2 });

  if (isLoading) return <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;

  if (isError || !hostel) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm text-muted">{messageFrom(error, "Couldn't load this hostel.")}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/hostel">
            <Button variant="ghost">Back to hostels</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentWarden = hostel.wardenId && typeof hostel.wardenId !== "string" ? hostel.wardenId : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to hostels
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-heading">{hostel.name}</h1>
          <StatusBadge status={hostel.status} />
        </div>
      </div>

      {updateHostel.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(updateHostel.error, "That didn't save. Please try again.")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
          <dd className="mt-0.5 text-heading">{hostel.type}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Beds</dt>
          <dd className="mt-0.5 text-heading">
            {hostel.occupiedBeds} occupied / {hostel.totalBeds} total ({hostel.roomCount} rooms)
          </dd>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted" htmlFor="warden-search">
            Warden
          </label>
          {currentWarden ? (
            <p className="text-sm text-heading">
              {currentWarden.personalInfo.fullName}{" "}
              <button
                type="button"
                className="ml-2 text-xs text-primary hover:underline"
                onClick={() => updateHostel.mutate({ wardenId: null })}
              >
                Unassign
              </button>
            </p>
          ) : (
            <div className="relative">
              <input
                id="warden-search"
                value={wardenQuery}
                onChange={(e) => setWardenQuery(e.target.value)}
                placeholder="Search staff by name…"
                autoComplete="off"
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
              {debouncedWardenQuery.trim().length >= 2 && (staffResults?.data.length ?? 0) > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface shadow-lg">
                  {staffResults!.data.map((s) => (
                    <li key={s._id}>
                      <button
                        type="button"
                        onClick={() => {
                          updateHostel.mutate({ wardenId: s._id });
                          setWardenQuery("");
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-alt)]"
                      >
                        <span className="text-heading">{s.personalInfo.fullName}</span>
                        <span className="text-xs text-muted">{s.designation ?? ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Fee</dt>
          <dd className="mt-0.5 text-heading">
            {hostel.fee} / {hostel.feeFrequency.toLowerCase()}
          </dd>
        </div>
        <div>
          <Button
            variant="ghost"
            isLoading={updateHostel.isPending}
            onClick={() => updateHostel.mutate({ status: hostel.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
          >
            {hostel.status === "ACTIVE" ? "Deactivate hostel" : "Reactivate hostel"}
          </Button>
        </div>
      </div>

      <RoomsSection hostelId={id} />
    </div>
  );
}
