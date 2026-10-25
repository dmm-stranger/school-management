"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, BedDouble, Coins, UserCheck, Plus, AlertCircle, Users, LogIn } from "lucide-react";
import { useHostels, useHostelSummary } from "@/features/hostel/hostel.queries";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";
import type { HostelWardenRef } from "@/features/hostel/hostel.types";

const wardenName = (ref: HostelWardenRef | string | null) => (ref && typeof ref !== "string" ? ref.personalInfo.fullName : "Unassigned");

function KpiStrip() {
  const { data, isLoading } = useHostelSummary();
  const cards = [
    { label: "Beds filled", value: data ? `${data.occupiedBeds} / ${data.totalBeds}` : undefined, icon: BedDouble },
    { label: "Active allocations", value: data?.activeAllocations, icon: Users, href: "/hostel/allocations" },
    { label: "Unpaid fees", value: data ? formatMoney(data.pendingFeeTotal) : undefined, icon: Coins, href: "/hostel/fees" },
    { label: "Visitors on site", value: data?.visitorsOnSite, icon: LogIn, href: "/hostel/visitors" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, href }) => {
        const body = (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
            <div className="flex items-center justify-between text-sm text-muted">
              {label}
              <Icon className="h-4 w-4 text-primary" />
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

export default function HostelsPage() {
  const { can } = usePermission();
  const isManager = can("hostel:create");

  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useHostels({ search: search || undefined });
  const hostels = data?.data ?? [];

  if (!isManager) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <Building2 className="h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-heading">Hostel management is for staff</p>
        <p className="text-sm text-muted">You can see your own allocation and fees instead.</p>
        <Link href="/hostel/my">
          <Button>Go to My Hostel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Hostel</h1>
          <p className="mt-1 text-sm text-muted">Hostels, rooms and beds at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/hostel/visitors">
            <Button variant="ghost">
              <UserCheck className="h-4 w-4" /> Visitors
            </Button>
          </Link>
          <Link href="/hostel/allocations">
            <Button variant="secondary">Allocate Students</Button>
          </Link>
          <Link href="/hostel/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Hostel
            </Button>
          </Link>
        </div>
      </div>

      <KpiStrip />

      <div className="max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hostels…"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load hostels.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && hostels.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Building2 className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No hostels yet</p>
            <p className="text-sm text-muted">Add your first hostel to start building rooms and beds.</p>
          </div>
        )}
        {!isLoading && !isError && hostels.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Hostel</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Warden</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {hostels.map((h) => (
                  <tr key={h._id} className="hover:bg-[var(--color-surface-alt)]">
                    <td className="px-4 py-3">
                      <Link href={`/hostel/${h._id}`} className="font-medium text-heading hover:text-primary">
                        {h.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{h.type}</td>
                    <td className="px-4 py-3 text-muted">{wardenName(h.wardenId)}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatMoney(h.fee)} / {h.feeFrequency.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={h.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
