"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Building2, Search, Plus, AlertCircle } from "lucide-react";
import { academyApi } from "@/features/academy/academy.api";
import type { Room, BuildingName, RoomType, RoomStatus } from "@/features/academy/academy.types";
import { BUILDING_NAMES, ROOM_TYPES, ROOM_STATUSES } from "@/features/academy/academy.types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api-client";

function TableSkeleton() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-9 w-9 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-surface-alt)]" />
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

const FLOOR_LABELS: Record<string, string> = {
  GROUND_FLOOR: "Ground Floor",
  FIRST_FLOOR: "First Floor",
  SECOND_FLOOR: "Second Floor",
  THIRD_FLOOR: "Third Floor",
};

export default function RoomsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [buildingName, setBuildingName] = useState<BuildingName | "">("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [status, setStatus] = useState<RoomStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchRooms = useCallback(
    async (page: number) => {
      setLoadState("loading");
      setError(null);
      try {
        const result = await academyApi.list({
          page,
          limit: 20,
          buildingName: buildingName || undefined,
          roomType: roomType || undefined,
          status: status || undefined,
          search: debouncedSearch || undefined,
        });
        setRooms(result.data);
        setPagination(result.pagination);
        setLoadState("loaded");
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : "Failed to load rooms.");
        setLoadState("error");
      }
    },
    [buildingName, roomType, status, debouncedSearch]
  );

  useEffect(() => {
    queueMicrotask(() => {
      fetchRooms(1);
    });
  }, [fetchRooms]);

  const hasActiveFilters = buildingName !== "" || roomType !== "" || status !== "" || debouncedSearch !== "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Rooms & Buildings</h1>
          <p className="mt-1 text-sm text-muted">Manage physical rooms across all buildings.</p>
        </div>
        <Link href="/academic/rooms/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Room
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
            placeholder="Search by room number…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--color-muted-2)] focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
            aria-label="Search rooms by number"
          />
        </div>

        <select
          value={buildingName}
          onChange={(e) => setBuildingName(e.target.value as BuildingName | "")}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Filter by building"
        >
          <option value="">All Buildings</option>
          {BUILDING_NAMES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as RoomType | "")}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Filter by room type"
        >
          <option value="">All Types</option>
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RoomStatus | "")}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {ROOM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setBuildingName("");
              setRoomType("");
              setStatus("");
              setSearch("");
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {loadState === "loading" && <TableSkeleton />}

        {loadState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load rooms</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={() => fetchRooms(pagination.page)}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && rooms.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Building2 className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">
              {hasActiveFilters ? "No rooms match your filters" : "No rooms yet"}
            </p>
            <p className="text-sm text-muted">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Get started by adding your first room, or run the room seed script."}
            </p>
          </div>
        )}

        {loadState === "loaded" && rooms.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-[var(--color-surface-alt)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/academic/rooms/${room._id}`}
                        className="flex items-center gap-3 font-medium text-heading hover:text-primary"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-light)] text-xs font-semibold text-primary">
                          {room.roomNumber}
                        </span>
                        {room.roomNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{room.buildingName}</td>
                    <td className="px-4 py-3 text-muted">{FLOOR_LABELS[room.floor] || room.floor}</td>
                    <td className="px-4 py-3 text-muted">{room.roomType.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-muted">{room.capacity}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={room.status} />
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
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchRooms(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchRooms(pagination.page + 1)}
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
