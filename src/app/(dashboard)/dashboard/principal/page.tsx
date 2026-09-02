"use client";

import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import { GraduationCap, Users, FileText, ClipboardCheck } from "lucide-react";

export default function PrincipalDashboardPage() {
  return (
    <RoleDashboard
      title="Academic Overview"
      description="School-wide academic performance"
      kpis={[
        { label: "Total Students", value: "—", icon: GraduationCap, color: "students" },
        { label: "Total Teachers", value: "—", icon: Users, color: "teachers" },
        { label: "Ongoing Exams", value: "—", icon: FileText, color: "events" },
        { label: "Attendance Today", value: "—", icon: ClipboardCheck, color: "attendance" },
      ]}
    />
  );
}
