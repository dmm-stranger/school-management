"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { useLibrarySummary } from "@/features/library/library.queries";
import { BookOpen, ClipboardCheck, FileText, Coins } from "lucide-react";
import { formatMoney } from "@/lib/format";

export default function LibrarianDashboardPage() {
  const { data, isLoading } = useLibrarySummary();
  const dash = (value: string) => (isLoading ? "—" : value);

  return (
    <RoleDashboard
      title="Library Overview"
      description="Book circulation summary"
      kpis={[
        { label: "Total Books", value: dash(String(data?.titles ?? 0)), icon: BookOpen, color: "library" },
        { label: "Issued Today", value: dash(String(data?.issuedToday ?? 0)), icon: ClipboardCheck, color: "attendance" },
        { label: "Overdue", value: dash(String(data?.overdueIssues ?? 0)), icon: FileText, color: "events" },
        { label: "Pending Fines", value: dash(formatMoney(data?.pendingFineTotal ?? 0)), icon: Coins, color: "fees" },
      ]}
    />
  );
}
