"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { BookOpen, ClipboardCheck, FileText, GraduationCap } from "lucide-react";

export default function LibrarianDashboardPage() {
  return (
    <RoleDashboard
      title="Library Overview"
      description="Book circulation summary"
      kpis={[
        { label: "Total Books", value: "—", icon: BookOpen, color: "library" },
        { label: "Issued Today", value: "—", icon: ClipboardCheck, color: "attendance" },
        { label: "Overdue", value: "—", icon: FileText, color: "events" },
        { label: "Active Borrowers", value: "—", icon: GraduationCap, color: "students" },
      ]}
    />
  );
}
