"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, AlertCircle } from "lucide-react";
import { academyApi } from "@/features/academy/academy.api";
import {
  FLOORS,
  ROOM_TYPES,
  ROOM_STATUSES,
  FACILITIES,
  type Room,
  type Floor,
  type RoomType,
  type RoomStatus,
  type Facility,
} from "@/features/academy/academy.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

const FLOOR_LABELS: Record<Floor, string> = {
  GROUND_FLOOR: "Ground Floor",
  FIRST_FLOOR: "First Floor",
  SECOND_FLOOR: "Second Floor",
  THIRD_FLOOR: "Third Floor",
};

function DetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-surface-alt)]" />
      <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
    </div>
  );
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [floor, setFloor] = useState<Floor | "">("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [status, setStatus] = useState<RoomStatus | "">("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      try {
        const data = await academyApi.get(id);
        if (cancelled) return;
        setRoom(data);
        setFloor(data.floor);
        setRoomType(data.roomType);
        setStatus(data.status);
        setCapacity(String(data.capacity));
        setDescription(data.description || "");
        setFacilities(data.facilities);
        setLoadState("loaded");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiClientError ? err.message : "Failed to load room.");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleFacility = (facility: Facility) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleSave = async () => {
    setFormError(null);
    setIsSaving(true);
    try {
      const updated = await academyApi.update(id, {
        floor: floor as Floor,
        roomType: roomType as RoomType,
        status: status as RoomStatus,
        capacity: Number(capacity),
        description: description.trim() || undefined,
        facilities,
      });
      setRoom(updated);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await academyApi.delete(id);
      router.push("/academic/rooms");
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to delete room.");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loadState === "loading") return <DetailSkeleton />;

  if (loadState === "error") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-heading">Couldn&apos;t load this room</p>
        <p className="text-sm text-muted">{error}</p>
        <Link href="/academic/rooms">
          <Button variant="secondary">Back to Rooms</Button>
        </Link>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link
          href="/academic/rooms"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-heading">
            {room.roomNumber} — {room.buildingName}
          </h1>
          <StatusBadge status={room.status} />
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
        >
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Building" value={room.buildingName} disabled hint="Building can't be changed after creation." />
          <Input label="Room Number" value={room.roomNumber} disabled />

          <Select
            label="Floor"
            required
            value={floor}
            onChange={(e) => setFloor(e.target.value as Floor)}
            options={FLOORS.map((f) => ({ value: f, label: FLOOR_LABELS[f] }))}
          />

          <Select
            label="Room Type"
            required
            value={roomType}
            onChange={(e) => setRoomType(e.target.value as RoomType)}
            options={ROOM_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
          />

          <Select
            label="Status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus)}
            options={ROOM_STATUSES.map((s) => ({ value: s, label: s }))}
          />

          <Input
            label="Capacity"
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes about this room"
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-heading">Facilities</span>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((facility) => {
              const active = facilities.includes(facility);
              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  aria-pressed={active}
                  className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "border border-[var(--color-border)] bg-surface text-muted hover:bg-[var(--color-surface-alt)]"
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-danger">Delete this room permanently?</span>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
                Confirm Delete
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-danger hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              Delete Room
            </button>
          )}

          <Button onClick={handleSave} isLoading={isSaving}>
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
