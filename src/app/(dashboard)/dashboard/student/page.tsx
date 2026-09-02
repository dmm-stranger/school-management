"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { ClipboardCheck, FileText, Wallet, BookOpen } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <RoleDashboard
      title="Student Overview"
      description="Your academic snapshot"
      kpis={[
        { label: "Attendance", value: "—", icon: ClipboardCheck, color: "attendance" },
        { label: "Latest Result", value: "—", icon: FileText, color: "events" },
        { label: "Fees Due", value: "—", icon: Wallet, color: "fees" },
        { label: "Books Borrowed", value: "—", icon: BookOpen, color: "library" },
      ]}
    />
  );
}
