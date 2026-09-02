"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { GraduationCap, Users, Wallet, ClipboardCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <RoleDashboard
      title="School Operations"
      description="Full system overview"
      kpis={[
        { label: "Total Students", value: "—", icon: GraduationCap, color: "students" },
        { label: "Total Teachers", value: "—", icon: Users, color: "teachers" },
        { label: "Fees Collected", value: "—", icon: Wallet, color: "fees" },
        { label: "Attendance Today", value: "—", icon: ClipboardCheck, color: "attendance" },
      ]}
    />
  );
}
