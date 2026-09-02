"use client";

import { ComponentType, CSSProperties } from "react";
import { useAuth } from "@/features/auth/AuthContext";

export interface KpiCard {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: "students" | "teachers" | "attendance" | "fees" | "events" | "library";
}

const colorVarMap: Record<KpiCard["color"], string> = {
  students: "var(--color-chart-students)",
  teachers: "var(--color-chart-teachers)",
  attendance: "var(--color-chart-attendance)",
  fees: "var(--color-chart-fees)",
  events: "var(--color-chart-events)",
  library: "var(--color-chart-library)",
};

interface RoleDashboardProps {
  title: string;
  description: string;
  kpis: KpiCard[];
}

/**
 * Shared dashboard shell content — per FRONTEND-WORKING-FLOW.md §6.3.
 * Each role page passes its own title/description/KPIs; the layout,
 * loading/empty patterns, and chart-color tokens stay identical everywhere.
 */
export function RoleDashboard({ title, description, kpis }: RoleDashboardProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {description} — welcome back, {user?.email}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">{kpi.label}</span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)]"
                  style={{ backgroundColor: `color-mix(in srgb, ${colorVarMap[kpi.color]} 15%, transparent)` }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: colorVarMap[kpi.color] }} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-heading">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <p className="text-sm text-muted">
          Phase 2 placeholder — charts, alerts, quick actions, and recent activity widgets
          (per FRONTEND-WORKING-FLOW.md §6.3) are built module-by-module in later phases, each
          loading and failing independently.
        </p>
      </div>
    </div>
  );
}
