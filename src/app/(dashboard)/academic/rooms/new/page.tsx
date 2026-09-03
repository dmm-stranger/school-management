"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { academyApi } from "@/features/academy/academy.api";
import {
  BUILDING_NAMES,
  FLOORS,
  ROOM_TYPES,
  FACILITIES,
  type BuildingName,
  type Floor,
  type RoomType,
  type Facility,
} from "@/features/academy/academy.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

const FLOOR_LABELS: Record<Floor, string> = {
  GROUND_FLOOR: "Ground Floor",
  FIRST_FLOOR: "First Floor",
  SECOND_FLOOR: "Second Floor",
  THIRD_FLOOR: "Third Floor",
};

interface FieldErrors {
  [key: string]: string;
}

export default function NewRoomPage() {
  const router = useRouter();
  const [buildingName, setBuildingName] = useState<BuildingName | "">("");
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState<Floor | "">("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFacility = (facility: Facility) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!buildingName) next.buildingName = "Select a building.";
    if (!roomNumber.trim()) {
      next.roomNumber = "Room number is required.";
    } else if (!/^RM\d{2}$/.test(roomNumber.trim())) {
      next.roomNumber = "Format must be RM01–RM70 (e.g. RM05).";
    }
    if (!floor) next.floor = "Select a floor.";
    if (!roomType) next.roomType = "Select a room type.";
    const capacityNum = Number(capacity);
    if (!capacity || Number.isNaN(capacityNum) || capacityNum < 1) {
      next.capacity = "Capacity must be a number greater than zero.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate on submit, per FRONTEND-WORKING-FLOW.md §6.2 (blur/submit, not every keystroke)
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const room = await academyApi.create({
        buildingName: buildingName as BuildingName,
        roomNumber: roomNumber.trim().toUpperCase(),
        floor: floor as Floor,
        roomType: roomType as RoomType,
        capacity: Number(capacity),
        description: description.trim() || undefined,
        facilities,
      });
      router.push(`/academic/rooms/${room._id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.errors.length > 0) {
          const fieldErrors: FieldErrors = {};
          err.errors.forEach((e) => {
            fieldErrors[e.field] = e.message;
          });
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="mt-3 text-2xl font-semibold text-heading">Add Room</h1>
        <p className="mt-1 text-sm text-muted">Register a new physical room or facility.</p>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Building"
            required
            placeholder="Select building"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value as BuildingName)}
            error={errors.buildingName}
            options={BUILDING_NAMES.map((b) => ({ value: b, label: b }))}
          />

          <Input
            label="Room Number"
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            error={errors.roomNumber}
            placeholder="RM05"
            hint="Format: RM01–RM70"
          />

          <Select
            label="Floor"
            required
            placeholder="Select floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value as Floor)}
            error={errors.floor}
            options={FLOORS.map((f) => ({ value: f, label: FLOOR_LABELS[f] }))}
          />

          <Select
            label="Room Type"
            required
            placeholder="Select type"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value as RoomType)}
            error={errors.roomType}
            options={ROOM_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
          />

          <Input
            label="Capacity"
            required
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            error={errors.capacity}
            placeholder="40"
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

        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Link href="/academic/rooms">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Room"}
          </Button>
        </div>
      </form>
    </div>
  );
}
