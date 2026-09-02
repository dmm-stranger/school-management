"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABEL_OVERRIDES: Record<string, string> = {
  dashboard: "Dashboard",
  people: "People",
  students: "Students",
  teachers: "Teachers",
  staff: "Staff",
  guardians: "Guardians",
  academic: "Academic",
  attendance: "Attendance",
  examination: "Examination",
  finance: "Finance",
  library: "Library",
  transport: "Transport",
  hostel: "Hostel",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  security: "Security",
};

const humanize = (segment: string) =>
  LABEL_OVERRIDES[segment] ||
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
      <Link href="/dashboard" className="hover:text-primary">
        Dashboard
      </Link>
      {segments
        .filter((s) => s !== "dashboard")
        .map((segment, idx, arr) => {
          const href = `/${segments.slice(0, segments.indexOf(segment) + 1).join("/")}`;
          const isLast = idx === arr.length - 1;
          return (
            <span key={href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-[var(--color-muted-2)]" />
              {isLast ? (
                <span className="font-medium text-heading" aria-current="page">
                  {humanize(segment)}
                </span>
              ) : (
                <Link href={href} className="hover:text-primary">
                  {humanize(segment)}
                </Link>
              )}
            </span>
          );
        })}
    </nav>
  );
}
